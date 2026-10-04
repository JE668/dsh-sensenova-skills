/**
 * dsh-sensenova-skills —— 商汤 SenseNova 官方 skills 仓库的 DSH 桥接插件。
 *
 * 将 https://github.com/OpenSenseNova/SenseNova-Skills （MIT）里的 agent skills
 * 以 DSH 工具形式暴露，agent 可以：
 *   1. sensenova_skills_sync  —— 从上游同步最新 skills 快照（跟随官方更新）
 *   2. sensenova_skills_list  —— 浏览已同步的 skill 清单（名称 / 描述 / 触发词）
 *   3. sensenova_skills_read  —— 读取某个 skill 的完整 SKILL.md 与参考文档
 *
 * skills 是 agent 驱动的：agent 读取 SKILL.md 后按其中指令执行 bash / Python
 * 脚本（部分 skill 需要 SenseNova API key，见各 skill 文档与上游 .env.example）。
 *
 * 关键设计：同步后会 installSkills() 把快照里的每个 skill 目录以**符号链接**挂进
 * DSH 真正会扫描的 skill 根（~/.dsh/skills，dsh-skill-filesystem 的 user-dsh 根，
 * rank 400）。只有落在被扫描的根里，skill 才会出现在会话目录（catalog）里、可被
 * 模型自动选用、在设置页列出；放在插件自己的运行时目录下 DSH 是看不见的。
 * 链接而非拷贝：更新只需重写快照，省磁盘，且 skill-filename 解析会保留 symlink 路径。
 *
 * 运行时目录（默认 ~/.dsh/sensenova-skills/）保存上游仓库快照 + 版本记录，
 * 快照随 sensenova_skills_sync 更新；网络失败时回退到上游 sn-update skill 的
 * 说明（其文档里写明了官方更新通道）。
 */
import { execFileSync, execFile } from 'node:child_process';
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  rmSync,
  existsSync,
  readdirSync,
  statSync,
  lstatSync,
  symlinkSync,
  unlinkSync,
  readlinkSync,
  chmodSync,
} from 'node:fs';
import { promisify } from 'node:util';
import { homedir } from 'node:os';
import { join, dirname, resolve, relative } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { createWriteStream } from 'node:fs';
import z from '@deepseek-ai/schemastery';
import { installSkillsRpc } from './rpc.js';


const execFileAsync = promisify(execFile);

const DEFAULT_REPO_URL = 'https://github.com/OpenSenseNova/SenseNova-Skills';
const DEFAULT_REF = 'main';
/** profile 里的插件条目 id，settings 服务据此定位 namespace。 */
const ENTRY_ID = 'dsh-sensenova-skills';
const TIMEOUT_MS = 300000;

function defaultRuntimeDir() {
  return process.env.DSH_SENSENOVA_SKILLS_DIR
    || join(homedir(), '.dsh', 'sensenova-skills');
}

/**
 * 上游仓库里能出现的 skill 名（快照同步后按实际目录补齐运行时字段）。
 * 这里给出一份已知清单，未列出的 skill 由 enableSkillKeys() 在运行时并入，
 * 这样设置页既能持久化已知开关，也能在同步出新 skill 后继续工作。
 */
const KNOWN_SKILL_NAMES = Object.freeze([
  'sn-da-excel-workflow', 'sn-da-image-caption', 'sn-da-large-file-analysis',
  'sn-da-non-spreadsheet-analysis', 'sn-deep-research', 'sn-deepresearch-cli',
  'sn-image-base', 'sn-image-doctor', 'sn-image-imitate', 'sn-image-resume',
  'sn-infographic', 'sn-md-to-html-report', 'sn-motion-html', 'sn-ppt-creative',
  'sn-ppt-dazzle', 'sn-ppt-doctor', 'sn-ppt-entry', 'sn-ppt-standard',
  'sn-ppt-story', 'sn-ppt-tools', 'sn-ppt-workbench', 'sn-prepare-citations',
  'sn-proactive-agent', 'sn-report-format-discovery', 'sn-research-report',
  'sn-search-academic', 'sn-search-code', 'sn-search-finance', 'sn-search-image',
  'sn-search-market-cn', 'sn-search-social-cn', 'sn-search-social-en',
  'sn-search-social-media', 'sn-search-year-report', 'sn-team-harness', 'sn-update',
]);

/** env 字段的键集合：官方 env.example.txt 里的全部变量。 */
const ENV_KEY_NAMES = Object.freeze([
  'SN_API_KEY', 'SN_BASE_URL', 'SN_IMAGE_GEN_API_KEY', 'SN_IMAGE_GEN_BASE_URL',
  'SN_IMAGE_GEN_MODEL', 'SN_IMAGE_GEN_MODEL_TYPE', 'SN_CHAT_API_KEY', 'SN_CHAT_BASE_URL',
  'SN_CHAT_MODEL', 'SN_TEXT_API_KEY', 'SN_TEXT_BASE_URL', 'SN_TEXT_MODEL',
  'SN_VISION_API_KEY', 'SN_VISION_BASE_URL', 'SN_VISION_MODEL',
  'SERPER_API_KEY', 'SERPER_BASE_URL', 'SERPER_TIMEOUT_SECONDS',
  'DEEPXIV_TOKEN', 'OPENALEX_API_KEY', 'OPENALEX_MAILTO', 'CROSSREF_MAILTO',
  'CLAWDBOT_EMAIL', 'GITHUB_TOKEN', 'HF_TOKEN', 'SO_API_KEY',
  'TIKHUB_TOKEN', 'YOUTUBE_API_KEY', 'ZHIHU_COOKIE', 'DOUYIN_COOKIE', 'BILIBILI_COOKIE',
  'WIKIMEDIA_USER_AGENT', 'YEAR_REPORT_USER_AGENT', 'SEC_USER_AGENT',
]);

function enabledShape() {
  const shape = {};
  for (const n of KNOWN_SKILL_NAMES) shape[n] = z.boolean();
  return shape;
}

function envShape() {
  const shape = {};
  for (const k of ENV_KEY_NAMES) {
    // 密钥类字段标 role('secret')：宿主 redactSecrets 会把值从表单投影里剥离。
    shape[k] = SECRET_ENV_KEYS.has(k)
      ? z.string().role("secret")
      : z.string();
  }
  return shape;
}

/** 需要 secret 角色保护的 key（值永不回显给客户端）。 */
const SECRET_ENV_KEYS = new Set(['SN_API_KEY', 'SN_IMAGE_GEN_API_KEY', 'SN_CHAT_API_KEY', 'SN_TEXT_API_KEY', 'SN_VISION_API_KEY', 'SERPER_API_KEY', 'DEEPXIV_TOKEN', 'OPENALEX_API_KEY', 'GITHUB_TOKEN', 'HF_TOKEN', 'SO_API_KEY', 'TIKHUB_TOKEN', 'YOUTUBE_API_KEY', 'VOLCENGINE_API_KEY', 'WORKBENCH_GATEWAY_API_KEY']);

/** 插件配置 schema：DSH 依据它在设置页渲染表单。 */
export const Config = z.object({
  repoURL: z.string().default(DEFAULT_REPO_URL)
    .description('上游仓库 URL；可改为 GitHub 镜像（gitclone 等）或私有 fork').volatile(),
  ref: z.string().default(DEFAULT_REF)
    .description('跟踪的分支 / tag / commit；默认 main（跟随官方更新）').volatile(),
  runtimeDir: z.string().default('')
    .description('运行时目录（存放上游快照与版本记录）；留空使用默认 ~/.dsh/sensenova-skills').volatile(),
  linkDir: z.string().default('')
    .description('挂载目录（符号链接到 DSH 扫描的 skill 根，默认 ~/.dsh/skills）；'
      + 'skill 必须落在这里才会出现在会话目录中').volatile(),
  enabled: z.object(enabledShape()).default({})
    .description('逐个 skill 开关（键=skill 名，值=false 表示关闭；未列出的默认启用）。'
      + '必须是 object 而不是 dict：dsh-settings 的 volatileForm() 只递归 type==="object" 的'
      + '字段，dict 字段会被整个排除在表单之外，导致设置页写不进去也存不住').volatile(),
  autoSync: z.boolean().default(false)
    .description('每次启动自动检查并同步上游').volatile(),
  env: z.object(envShape()).default({})
    .description('注入给 skill 脚本的环境变量，例如 SN_API_KEY / SN_BASE_URL / SERPER_API_KEY。'
      + '值不回显；同样是 object 而非 dict，否则宿主 settings 服务不会持久化').volatile(),
});



/** 官方 env.example 里出现的、值得在 UI 里直接提供的常用变量。 */
const COMMON_ENV_KEYS = [
  ['SN_API_KEY', 'SenseNova API Key', '多数 sn-* skill 的统一凭据'],
  ['SN_BASE_URL', 'SenseNova Base URL', '默认 https://token.sensenova.cn/v1'],
  ['SN_IMAGE_GEN_API_KEY', '文生图 API Key', 'sn-infographic / sn-image-* 使用'],
  ['SN_IMAGE_GEN_BASE_URL', '文生图 Base URL', ''],
  ['SN_CHAT_API_KEY', '对话/文本 API Key', 'sn-* 需要 LLM 时使用'],
  ['SN_CHAT_BASE_URL', '对话/文本 Base URL', ''],
  ['SN_VISION_API_KEY', '视觉理解 API Key', 'sn-image-caption / sn-da-image-caption 使用'],
  ['SN_VISION_BASE_URL', '视觉理解 Base URL', ''],
  ['SERPER_API_KEY', 'Serper 搜索 Key', 'sn-search-image / sn-search-academic 使用'],
  ['GITHUB_TOKEN', 'GitHub Token', 'sn-search-code 使用，可提速并提高限额'],
];

/* ---------------------------- 版本记录 ---------------------------- */

function versionFile(runtimeDir) {
  return join(runtimeDir, 'version.json');
}

function readVersion(runtimeDir) {
  try {
    return JSON.parse(readFileSync(versionFile(runtimeDir), 'utf8'));
  } catch {
    return null;
  }
}

function writeVersion(runtimeDir, record) {
  writeFileSync(versionFile(runtimeDir), JSON.stringify(record, null, 2) + '\n');
}

/** 从 git 仓库读取 HEAD commit 与简短描述（失败时返回 null）。 */
function gitHead(repoDir) {
  try {
    const hash = execFileSync('git', ['-C', repoDir, 'rev-parse', 'HEAD'], {
      encoding: 'utf8', timeout: 30000, stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    const subject = execFileSync('git', ['-C', repoDir, 'log', '-1', '--format=%s', 'HEAD'], {
      encoding: 'utf8', timeout: 30000, stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return { hash, subject };
  } catch {
    return null;
  }
}

/** 读取 skills 目录下的 skill 名称列表（含 frontmatter 中的 name/description）。 */
function listSkills(skillsDir) {
  if (!existsSync(skillsDir)) return [];
  const out = [];
  for (const entry of readdirSync(skillsDir)) {
    const skillDir = join(skillsDir, entry);
    const skillMd = join(skillDir, 'SKILL.md');
    let st;
    try { st = statSync(skillDir); } catch { continue; }
    if (!st.isDirectory() || !existsSync(skillMd)) continue;
    let head = '';
    try {
      head = readFileSync(skillMd, 'utf8').slice(0, 4000);
    } catch { continue; }
    // 解析 frontmatter 里简洁的字段（name / description / triggers）
    let name = entry;
    let description = '';
    let triggers = [];
    const fm = head.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    const lines = head.split(/\r?\n/);
    if (fm) {
      const block = fm[1];
      const mName = block.match(/^name:\s*(.+)$/m);
      if (mName) name = mName[1].trim();
      // description: 取 start 行后所有“缩进或空行”，直到下一个顶层 key（行首非空白）
      const start = lines.findIndex((l) => /^description:/.test(l));
      if (start >= 0) {
        const first = lines[start].replace(/^description:\s*/, '').trim();
        if (first && first !== '|' && first !== '>' && !first.startsWith('|-') && !first.startsWith('>-') && first !== '|>' && first !== '>-') {
          description = first.replace(/^["']|["']$/g, '').slice(0, 500);
        } else {
          const collected = [];
          for (let i = start + 1; i < lines.length; i++) {
            if (/^\S/.test(lines[i])) break; // 下一个顶层 key
            collected.push(lines[i].trim());
          }
          description = collected.join(' ').trim().replace(/^["']+|["']+$/g, '').slice(0, 500);
        }
      }
      const trigStart = lines.findIndex((l) => /^triggers:/.test(l));
      if (trigStart >= 0) {
        const collected = [];
        for (let i = trigStart + 1; i < lines.length; i++) {
          const m = lines[i].match(/^\s*-\s+(.+)$/);
          if (m) collected.push(m[1].trim().replace(/^["']|["']$/g, ''));
          else if (/^\S/.test(lines[i])) break;
          else if (lines[i].trim() === '') break;
        }
        triggers = collected.slice(0, 12);
      }
    }
    out.push({ name, description, triggers });
  }
  return out;
}

/* ---------------------------- 同步逻辑 ---------------------------- */

/** 下载并解压上游 tarball 到运行时目录；返回 { commit, ref, skills }。 */
async function syncFromTarball(config, runtimeDir) {
  const repoUrl = String(config.repoURL || DEFAULT_REPO_URL).replace(/\/+$/, '');
  const ref = String(config.ref || DEFAULT_REF);
  // GitHub 风格的 codeload URL；对 fork / 镜像同样适用
  const host = new URL(repoUrl).host;
  let downloadUrl;
  if (host === 'github.com' || host.endsWith('ghe.com')) {
    const clean = host === 'github.com' ? 'https://codeload.github.com' : `https://${host}/codeload`;
    downloadUrl = `${clean}/${repoUrl.replace(/https?:\/\/[^/]+\/?/, '').replace(/\.git$/, '')}/tar.gz/refs/heads/${ref}`;
  } else {
    // 非 GitHub 源：回退到 git clone
    downloadUrl = null;
  }

  const workDir = join(runtimeDir, 'work');
  rmSync(workDir, { recursive: true, force: true });
  mkdirSync(workDir, { recursive: true });

  if (downloadUrl) {
    const tarball = join(workDir, 'upstream.tar.gz');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    let resp;
    try {
      resp = await fetch(downloadUrl, { signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
    if (!resp.ok) {
      throw new Error(`上游下载失败（HTTP ${resp.status}）：${downloadUrl} —— 请检查网络或配置镜像 repoURL`);
    }
    await pipeline(resp.body, createWriteStream(tarball));

    const extractDir = join(workDir, 'src');
    mkdirSync(extractDir, { recursive: true });
    execFileSync('tar', ['-xzf', tarball, '-C', extractDir], { timeout: TIMEOUT_MS });
    const top = readdirSync(extractDir)[0]; // tarball 顶层目录
    const sourceDir = join(extractDir, top);

    // 原子替换
    const skillsTarget = join(runtimeDir, 'skills');
    rmSync(skillsTarget, { recursive: true, force: true });
    mkdirSync(join(runtimeDir, 'stage'), { recursive: true });
    execFileSync('cp', ['-R', join(sourceDir, 'skills'), join(runtimeDir, 'stage', 'skills')], { timeout: TIMEOUT_MS });
    rmSync(skillsTarget, { recursive: true, force: true });
    execFileSync('mv', [join(runtimeDir, 'stage', 'skills'), skillsTarget], { timeout: 60000 });
    rmSync(join(runtimeDir, 'stage'), { recursive: true, force: true });

    // 保留 env 示例 / 文档（便于 agent 配置 API key）
    for (const doc of ['env.example', 'readme-cn.md']) {
      const src = doc === 'env.example'
        ? join(sourceDir, '.env.example')
        : join(sourceDir, 'README_CN.md');
      if (existsSync(src)) writeFileSync(join(runtimeDir, doc === 'env.example' ? 'env.example.txt' : 'upstream-readme-cn.txt'), readFileSync(src));
    }
    rmSync(workDir, { recursive: true, force: true });
  } else {
    // 回退到 git clone
    rmSync(join(runtimeDir, 'clone'), { recursive: true, force: true });
    mkdirSync(join(runtimeDir, 'clone'), { recursive: true });
    execFileSync('git', ['clone', '--depth', '1', '--branch', ref, repoUrl, 'repo'], {
      cwd: join(runtimeDir, 'clone'), timeout: TIMEOUT_MS,
    });
    const cloneRepo = join(runtimeDir, 'clone', 'repo');
    const head = gitHead(cloneRepo);
    rmSync(join(runtimeDir, 'skills'), { recursive: true, force: true });
    execFileSync('cp', ['-R', join(cloneRepo, 'skills'), join(runtimeDir, 'skills')], { timeout: TIMEOUT_MS });
    rmSync(join(runtimeDir, 'clone'), { recursive: true, force: true });
    if (!head) throw new Error('同步后无法读取上游 git 头信息');
    writeVersion(runtimeDir, {
      syncedAt: new Date().toISOString(),
      ref,
      commit: head.hash,
      subject: head.subject,
      via: 'git-clone',
    });
    return { commit: head.hash, ref, via: 'git-clone', skills: listSkills(join(runtimeDir, 'skills')) };
  }

  // tarball 路径：记录 ref 与同步时间（tarball 无 git 头，用 URL 里的 ref）
  writeVersion(runtimeDir, {
    syncedAt: new Date().toISOString(),
    ref,
    commit: null,
    subject: null,
    via: 'tarball',
  });
  return { ref, via: 'tarball', skills: listSkills(join(runtimeDir, 'skills')) };
}

/** 主同步流程。 */
/* ---------------------------- 官方默认值 ---------------------------- */

/** 官方《SenseNova AI API 文档》给出的默认端点；用户只需填 API Key。 */
const OFFICIAL_DEFAULT_ENV = Object.freeze({
  SN_BASE_URL: 'https://token.sensenova.cn/v1',
  SN_IMAGE_GEN_BASE_URL: 'https://token.sensenova.cn/v1',
  SN_CHAT_BASE_URL: 'https://token.sensenova.cn/v1',
  SN_TEXT_BASE_URL: 'https://token.sensenova.cn/v1',
  SN_VISION_BASE_URL: 'https://token.sensenova.cn/v1',
  SN_IMAGE_GEN_MODEL: 'sensenova-u1.5-lite',
  SERPER_BASE_URL: 'https://google.serper.dev',
});

/** 会继承 SN_API_KEY 的凭据变量：用户只填一个 key 即可覆盖全部 skill。 */
const SN_KEY_ALIASES = Object.freeze([
  'SN_IMAGE_GEN_API_KEY', 'SN_CHAT_API_KEY', 'SN_TEXT_API_KEY', 'SN_VISION_API_KEY',
]);

/**
 * 合成最终环境：官方默认 URL 打底，用户值覆盖，SN_API_KEY 向下派生。
 * 派生放在这里而不是让用户重复填 5 遍 —— 官方文档里这些端点同源、同一个 key。
 */
function resolveEnv(env = {}) {
  const out = { ...OFFICIAL_DEFAULT_ENV };
  for (const [k, v] of Object.entries(env)) {
    if (typeof v === 'string' && v !== '') out[k] = v;
  }
  const main = out.SN_API_KEY;
  if (typeof main === 'string' && main !== '') {
    for (const alias of SN_KEY_ALIASES) {
      if (!out[alias]) out[alias] = main;
    }
  }
  return out;
}

/* ---------------------------- 目录索引 ---------------------------- */

/** 极简 YAML frontmatter 解析：只取顶层 name / description（够用且不引依赖）。 */
function parseFrontmatter(text) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  if (!m) return {};
  const out = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = /^([A-Za-z_][A-Za-z0-9_.-]*):\s*(.*)$/.exec(line);
    if (!kv) continue;
    let value = kv[2].trim();
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    else if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    out[kv[1]] = value;
  }
  return out;
}

/** 扫描快照，产出可展示的 skill 目录（供设置页列开关）。 */
function indexSkills(runtimeDir) {
  const source = join(runtimeDir, 'skills');
  if (!existsSync(source)) return [];
  const out = [];
  for (const entry of readdirSync(source, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const file = join(source, entry.name, 'SKILL.md');
    if (!existsSync(file)) continue;
    let description = '';
    try {
      description = parseFrontmatter(readFileSync(file, 'utf8')).description ?? '';
    } catch { /* 读不到就留空 */ }
    out.push({ name: entry.name, description });
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

/* ---------------------------- 环境变量 ---------------------------- */

/** 写 runtimeDir/.env：skill 脚本与 agent 都能 source 它。0600，含凭据。 */
function writeEnvFile(runtimeDir, env) {
  const entries = Object.entries(env || {}).filter(([, v]) => typeof v === 'string' && v !== '');
  const path = join(runtimeDir, '.env');
  try {
    if (entries.length === 0) {
      if (existsSync(path)) rmSync(path, { force: true });
      return { path, count: 0 };
    }
    mkdirSync(runtimeDir, { recursive: true });
    const body = [
      '# 由 dsh-sensenova-skills 自动生成，请勿手工编辑（每次同步/保存会重写）。',
      '# 供 skill 脚本使用：source ~/.dsh/sensenova-skills/.env',
      ...entries.map(([k, v]) => `${k}=${/^[A-Za-z0-9_./:@-]*$/.test(v) ? v : JSON.stringify(v)}`),
      '',
    ].join('\n');
    writeFileSync(path, body, { encoding: 'utf8', mode: 0o600 });
    try { chmodSync(path, 0o600); } catch { /* 平台差异 */ }
    return { path, count: entries.length };
  } catch {
    return { path, count: 0 };
  }
}

/* ---------------------------- 安装到 DSH 扫描根 ---------------------------- */

/** DSH 会扫描的 user 级 skill 根（dsh-skill-filesystem 的 user-dsh 根，rank 400）。 */
function defaultSkillRoot() {
  return process.env.DSH_SENSENOVA_SKILLS_LINK_DIR
    || join(process.env.DSH_HOME || join(homedir(), '.dsh'), 'skills');
}

/** 读取链接目标并解析为绝对路径；不是符号链接则返回 undefined。 */
function linkTarget(link) {
  try {
    if (!lstatSync(link).isSymbolicLink()) return undefined;
    return resolve(dirname(link), readlinkSync(link));
  } catch {
    return undefined;
  }
}

/** 只删除指向本快照的链接；用户自己的 skill 一律不动。 */
function unlinkOwnLink(link, source) {
  const pointsAt = linkTarget(link);
  if (pointsAt === undefined) return false;
  if (!pointsAt.startsWith(resolve(source) + '/')) return false;
  try { unlinkSync(link); return true; } catch { return false; }
}

/**
 * 把快照里的 skill 目录以符号链接挂进 DSH 的 skill 根，使它们进入会话 catalog。
 *
 * 只有落在被扫描的根里，skill 才会出现在目录、可被模型自动选用、在设置页列出；
 * 留在插件自己的运行时目录下 DSH 是看不见的。
 *
 * 只动本插件创建的链接：同名条目若不是指向本快照的链接，视为用户自己的 skill，
 * 既不覆盖也不删除。
 */
function installSkills(runtimeDir, linkDir, enabled) {
  const source = join(runtimeDir, 'skills');
  const target = linkDir || defaultSkillRoot();
  const map = enabled && typeof enabled === 'object' ? enabled : {};
  const report = {
    linkDir: target, linked: 0, refreshed: 0, skipped: 0, removed: 0,
    disabled: [], available: [],
  };

  if (!existsSync(source)) return report;
  mkdirSync(target, { recursive: true });

  const wanted = new Map();
  for (const entry of readdirSync(source, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const dir = join(source, entry.name);
    if (existsSync(join(dir, 'SKILL.md'))) wanted.set(entry.name, dir);
  }

  // 未在 enabled 里点名的默认启用；点名 false 的挂载时跳过（不存在的链接 = 未启用）。
  const isOn = (name) => map[name] !== false;
  for (const name of wanted.keys()) report.available.push(name);
  for (const name of wanted.keys()) if (!isOn(name)) report.disabled.push(name);

  for (const [name, dir] of wanted) {
    const link = join(target, name);
    // 关掉的 skill 必须解除挂载：只要链接还在，DSH 就会继续发现它，开关等于没用。
    if (!isOn(name)) {
      if (unlinkOwnLink(link, source)) report.removed += 1;
      continue;
    }
    const existing = linkTarget(link);
    if (existing !== undefined) {
      if (existing !== resolve(dir)) { report.skipped += 1; continue; }
      try { unlinkSync(link); } catch { /* 直接重建 */ }
      report.refreshed += 1;
    } else {
      report.linked += 1;
    }
    try {
      symlinkSync(dir, link, 'dir');
    } catch {
      report.skipped += 1;
    }
  }

  // 清理本插件遗留、但快照里已不存在的链接（上游删除或改名了某个 skill）。
  for (const entry of readdirSync(target, { withFileTypes: true })) {
    if (wanted.has(entry.name)) continue;
    const link = join(target, entry.name);
    if (unlinkOwnLink(link, source)) report.removed += 1;
  }

  return report;
}

async function runSync(config, runtimeDir, _args, _exec) {
  mkdirSync(runtimeDir, { recursive: true });
  const prev = readVersion(runtimeDir);
  const result = await syncFromTarball(config, runtimeDir);
  const version = readVersion(runtimeDir);
  const changed = !prev || JSON.stringify(prev) !== JSON.stringify(version);
  const index = indexSkills(runtimeDir);
  const installDescriptions = Object.fromEntries(index.map((s) => [s.name, s.description]));
  const install = installSkills(runtimeDir, config.linkDir || undefined, config.enabled);
  const envFile = writeEnvFile(runtimeDir, resolveEnv(config.env));
  return {
    ok: true,
    install,
    envFile,
    skillRoot: install.linkDir,
    runtimeDir,
    ref: result.ref,
    commit: version?.commit || null,
    via: result.via,
    syncedAt: version?.syncedAt,
    skills: result.skills,
    skillsIndex: install.available.map((name) => ({
      name,
      description: installDescriptions[name] ?? '',
    })),
    skillsCount: result.skills.length,
    changed,
    previousVersion: prev,
    upstreamRepo: config.repoURL || DEFAULT_REPO_URL,
    message: `已同步 ${result.skills.length} 个 skill（${result.via}，ref=${result.ref}），`
      + `其中 ${install.linked + install.refreshed} 个已启用并挂载到 ${install.linkDir}`
      + (install.disabled.length ? `，${install.disabled.length} 个已关闭。` : '。')
      + `环境变量文件：${envFile.path}（${envFile.count} 项）。`
      + '这些 skill 现在已出现在会话的 skill 目录中，模型会在匹配任务描述时自动选用；'
      + '也可对 DSH 说「列出可用的 SenseNova skills」查看清单。',
  };
}

/* ---------------------------- 工具定义 ---------------------------- */

const syncParams = {
  type: 'object',
  properties: {
    force: { type: 'boolean', description: '默认 true（每次都拉取最新）；false 则仅当本地快照不存在时才下载' },
  },
  additionalProperties: false,
};

const listParams = {
  type: 'object',
  properties: {
    filter: { type: 'string', description: '可选：按名称子串 / 触发词过滤（大小写不敏感）' },
  },
  additionalProperties: false,
};

const readParams = {
  type: 'object',
  properties: {
    skill: { type: 'string', description: 'skill 目录名，例如 sn-infographic / sn-ppt-standard / sn-deep-research' },
    file: { type: 'string', description: '可选：读取 skill 目录下的具体文件（如 references/foo.md），默认 SKILL.md' },
    maxLength: { type: 'number', description: '返回文本最大长度（默认 60000 字符；超出截断并标注）' },
  },
  required: ['skill'],
  additionalProperties: false,
};

function resultRender(label) {
  return function render(_args, value) {
    if (!value?.ok) {
      return [{ type: 'text', text: `❌ ${label}失败：${value?.error || '未知错误'}` }];
    }
    const lines = [value.message || `✅ ${label}完成`];
    if (value.skillsCount !== undefined) lines.push(`skill 数量：${value.skillsCount}`);
    if (value.skillList?.length) {
      lines.push('');
      for (const s of value.skillList) {
        lines.push(`- ${s.name}${s.triggers?.length ? `（触发词示例：${s.triggers.slice(0, 3).join(' / ')}${s.triggers.length > 3 ? ' …' : ''}）` : ''}`);
      }
    }
    if (value.committed) lines.push(`版本：commit=${value.committed} ref=${value.ref} syncedAt=${value.syncedAt}`);
    if (value.skill) lines.push(`\nskill 目录：${value.skillDir}`);
    if (value.content !== undefined) {
      lines.push('');
      lines.push('````');
      lines.push(value.content);
      lines.push('````');
    }
    if (value.truncated) lines.push(`（已按 maxLength=${value.maxLength} 截断；可用 sensenova_skills_read 的 file 参数读取 references/ 下的具体文档）`);
    return [{ type: 'text', text: lines.join('\n') }];
  };
}

const syncResultSchema = {
  type: 'object',
  properties: {
    ok: { type: 'boolean' },
    ref: { type: 'string' },
    commit: { type: ['string', 'null'] },
    via: { type: 'string' },
    syncedAt: { type: 'string' },
    skillsCount: { type: 'integer' },
    changed: { type: 'boolean' },
    message: { type: 'string' },
    error: { type: 'string' },
  },
  additionalProperties: true,
};

const listResultSchema = {
  type: 'object',
  properties: {
    ok: { type: 'boolean' },
    skillsCount: { type: 'integer' },
    skillList: { type: 'array' },
    runtimeDir: { type: 'string' },
    error: { type: 'string' },
  },
  additionalProperties: true,
};

const readResultSchema = {
  type: 'object',
  properties: {
    ok: { type: 'boolean' },
    skill: { type: 'string' },
    skillDir: { type: 'string' },
    content: { type: 'string' },
    truncated: { type: 'boolean' },
    maxLength: { type: 'number' },
    error: { type: 'string' },
  },
  additionalProperties: true,
};

/** 构建三个 DSH 工具。 */
export function buildSkillTools(config = {}) {
  const runtimeDir = String(config.runtimeDir || defaultRuntimeDir()).trim()
    || defaultRuntimeDir();

  async function callSync(_args, exec) {
    exec?.signal?.throwIfAborted?.();
    try {
      const value = await runSync(config, runtimeDir, _args, exec);
      if (!value.ok) return { ok: false, error: value.error };
      return value;
    } catch (error) {
      exec?.signal?.throwIfAborted?.();
      return { ok: false, error: error?.message || String(error) };
    }
  }

  async function callList(args, exec) {
    exec?.signal?.throwIfAborted?.();
    const skillsDir = join(runtimeDir, 'skills');
    if (!existsSync(skillsDir)) {
      return {
        ok: false,
        error: '尚未同步上游仓库。请先调用 sensenova_skills_sync（或运行 npm run sync）。',
      };
    }
    let skills = listSkills(skillsDir);
    const filter = String(args?.filter || '').trim().toLowerCase();
    if (filter) {
      skills = skills.filter((s) =>
        s.name.toLowerCase().includes(filter)
        || s.description.toLowerCase().includes(filter)
        || (s.triggers || []).some((t) => t.toLowerCase().includes(filter)),
      );
    }
    const version = readVersion(runtimeDir);
    return {
      ok: true,
      runtimeDir,
      skillsCount: skills.length,
      skillList: skills,
      ref: version?.ref,
      committed: version?.commit,
      syncedAt: version?.syncedAt,
      message: skills.length === 0
        ? `没有匹配 “${filter}” 的 skill。`
        : `共 ${skills.length} 个 skill。用 sensenova_skills_read 读取 SKILL.md 后按其中指令执行。`,
    };
  }

  async function callRead(args, exec) {
    exec?.signal?.throwIfAborted?.();
    const skill = String(args?.skill || '').trim();
    if (!skill) throw new Error('skill 不能为空');
    const skillsDir = join(runtimeDir, 'skills');
    if (!existsSync(skillsDir)) {
      return { ok: false, error: '尚未同步上游仓库。请先调用 sensenova_skills_sync。' };
    }
    // 防止路径穿越
    const safe = skill.replace(/[^a-zA-Z0-9_-]/g, '');
    if (safe !== skill) throw new Error(`skill 名仅允许字母/数字/_/-：${skill}`);
    const skillDir = join(skillsDir, safe);
    if (!existsSync(skillDir)) {
      const available = listSkills(skillsDir).map((s) => s.name);
      return { ok: false, error: `未找到 skill “${skill}”。可用：${available.join(', ')}` };
    }
    const target = args?.file
      ? join(skillDir, String(args.file).replace(/^\/+/, '').replace(/\.\./g, '_'))
      : join(skillDir, 'SKILL.md');
    if (!existsSync(target)) {
      return {
        ok: false,
        error: `文件不存在：${relative(skillsDir, target)}。skill 目录内容：${readdirSync(skillDir).join(', ')}`,
      };
    }
    const maxLength = Number(args?.maxLength || 60000);
    const full = readFileSync(target, 'utf8');
    const truncated = full.length > maxLength;
    const content = truncated ? full.slice(0, maxLength) : full;
    return {
      ok: true,
      skill: safe,
      skillDir,
      content,
      truncated,
      maxLength,
      message: `已读取 ${safe}${args?.file ? `/${String(args.file)}` : '/SKILL.md'}${truncated ? '（已截断）' : ''}。请按其中 Workflow 指令执行 bash / Python 命令。`,
    };
  }

  return [
    {
      name: 'sensenova_skills_sync',
      description:
        '从 OpenSenseNova/SenseNova-Skills（MIT）同步最新 skills 快照到本地运行时目录。' +
        '同步后即可用 sensenova_skills_list / sensenova_skills_read 浏览与加载 skill。' +
        '中文：跟随官方更新，拉取上游仓库 skills/ 目录。',
      parameters: syncParams,
      output: { schema: syncResultSchema, render: resultRender('同步') },
      execute: (args, exec) => callSync(args, exec),
    },
    {
      name: 'sensenova_skills_list',
      description:
        '列出本地已同步的 SenseNova skills（名称、描述、触发词），支持子串过滤。' +
        '中文：浏览可用的 sn-* skill。',
      parameters: listParams,
      output: { schema: listResultSchema, render: resultRender('列表') },
      execute: (args, exec) => callList(args, exec),
    },
    {
      name: 'sensenova_skills_read',
      description:
        '读取某个 sn-* skill 的完整 SKILL.md（或其 references/ 下的具体文件）。' +
        'agent 读取后按 SKILL.md 中的 Workflow 指令执行 bash / Python 命令。' +
        '中文：加载 skill 指令，准备执行。',
      parameters: readParams,
      output: { schema: readResultSchema, render: resultRender('读取') },
      execute: (args, exec) => callRead(args, exec),
    },
  ];
}

/** DSH 插件入口。 */
export const name = 'dsh-sensenova-skills';
export const inject = ['tools', 'connection', 'webServer', 'settings'];
export const reusable = true;

export function apply(ctx, config = {}) {
  const disposers = [];

  // 可变配置视图：设置页写入后即时生效，无需重启。
  const live = resolveConfigObject(config);
  const syncMeta = { lastSyncedAt: null, lastSkillsCount: null, lastVia: null, skillsIndex: [], envFilePath: null };

  try {
    for (const tool of buildSkillTools(live)) {
      disposers.push(ctx.tools.register(tool));
    }
  } catch (error) {
    ctx.logger?.warn?.(`[dsh-sensenova-skills] 工具注册失败：${error?.message || error}`);
  }

  // 设置页 RPC 桥：挂到本插件自己 inject 的 webServer（见 lib/web-rpc.js 注释）。
  const doSync = async () => {
    const runtimeDir = String(live.runtimeDir || defaultRuntimeDir()).trim() || defaultRuntimeDir();
    mkdirSync(runtimeDir, { recursive: true });
    const result = await runSync(live, runtimeDir, {}, undefined);
    if (result.ok) {
      syncMeta.lastSyncedAt = result.syncedAt;
      syncMeta.lastSkillsCount = result.skillsCount;
      syncMeta.lastVia = result.via;
      syncMeta.skillsIndex = result.skillsIndex ?? [];
      syncMeta.envFilePath = result.envFile?.path ?? null;
    }
    return result;
  };

  // 启动即挂载：把上次同步的快照按当前开关重新链接一遍（不联网，快）。
  // 有了它，DSH 重启后 skill 目录立刻是对的，不必先开设置页点一次同步。
  try {
    const rt = String(live.runtimeDir || defaultRuntimeDir()).trim() || defaultRuntimeDir();
    if (existsSync(join(rt, 'skills'))) {
      indexSkills(rt);
      const rep = installSkills(rt, live.linkDir || undefined, live.enabled);
      syncMeta.skillsIndex = indexSkills(rt);
      syncMeta.envFilePath = (() => {
        const r = writeEnvFile(rt, resolveEnv(live.env));
        return r.path;
      })();
      ctx.logger?.info?.(`[dsh-sensenova-skills] 已挂载 ${rep.linked + rep.refreshed}/${rep.available.length} 个 skill 到 ${rep.linkDir}`);
    }
  } catch (error) {
    ctx.logger?.warn?.(`[dsh-sensenova-skills] 启动挂载失败：${error?.message || error}`);
  }

  // 设置页写入经宿主 dsh-settings 落到 profile 的 cordis patch，重启后仍在；
  // 启动重挂载时会用持久化下来的值重新写 .env。
  const persist = async (updates) => {
    const settings = ctx.settings;
    if (settings && typeof settings.update === 'function') {
      const descriptor = settings.describe().find((row) => row.ns === ENTRY_ID);
      await settings.update(ENTRY_ID, updates, descriptor?.revision);
    }
    Object.assign(live, updates);
    // 凭据类字段改动后立刻重写 .env，否则 skill 要等下次同步才拿到新 key。
    if (updates.env !== undefined) {
      try {
        const rt = String(live.runtimeDir || defaultRuntimeDir()).trim() || defaultRuntimeDir();
        writeEnvFile(rt, resolveEnv(live.env));
      } catch { /* 忽略 */ }
    }
  };

  try {
    disposers.push(installSkillsRpc(ctx, {
      getLiveConfig: () => ({ ...live, ...syncMeta }),
      writeLiveConfig: (updates) => { Object.assign(live, updates); },
      persistConfig: persist,
      runSync: doSync,
      log: ctx.logger?.info ? (m) => ctx.logger.info(m) : undefined,
    }) || (() => {}));
  } catch (error) {
    ctx.logger?.warn?.(`[dsh-sensenova-skills] RPC 桥安装失败：${error?.message || error}`);
  }

  if (typeof ctx.on === 'function') {
    ctx.on('dispose', () => { for (const d of disposers) d(); });
  }
}

/** 把 DSH Loader 传入的 config（可能含 Volatile ref）解包为普通对象。 */
function resolveConfigObject(config) {
  if (config === null || typeof config !== 'object') return {};
  const out = {};
  for (const [key, value] of Object.entries(config)) {
    out[key] = value !== null && typeof value === 'object' && typeof value.get === 'function'
      ? value.get()
      : value;
  }
  return out;
}

export default { apply, name, inject };
