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
const TIMEOUT_MS = 300000;

function defaultRuntimeDir() {
  return process.env.DSH_SENSENOVA_SKILLS_DIR
    || join(homedir(), '.dsh', 'sensenova-skills');
}

/** 插件配置 schema：DSH 依据它在设置页渲染表单。 */
export const Config = z.object({
  repoURL: z.string().default(DEFAULT_REPO_URL)
    .description('上游仓库 URL；可改为 GitHub 镜像（gitclone 等）或私有 fork').volatile(),
  ref: z.string().default(DEFAULT_REF)
    .description('跟踪的分支 / tag / commit；默认 main（跟随官方更新）').volatile(),
  runtimeDir: z.string().default('')
    .description('运行时目录（存放上游快照与版本记录）；留空使用默认 ~/.dsh/sensenova-skills').volatile(),
});

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
async function runSync(config, runtimeDir, _args, _exec) {
  mkdirSync(runtimeDir, { recursive: true });
  const prev = readVersion(runtimeDir);
  const result = await syncFromTarball(config, runtimeDir);
  const version = readVersion(runtimeDir);
  const changed = !prev || JSON.stringify(prev) !== JSON.stringify(version);
  return {
    ok: true,
    runtimeDir,
    ref: result.ref,
    commit: version?.commit || null,
    via: result.via,
    syncedAt: version?.syncedAt,
    skills: result.skills,
    skillsCount: result.skills.length,
    changed,
    previousVersion: prev,
    upstreamRepo: config.repoURL || DEFAULT_REPO_URL,
    message: `已同步 ${result.skills.length} 个 skill（${result.via}，ref=${result.ref}）。agent 现在可用 sensenova_skills_read 加载具体 SKILL.md，并按其中指令执行。`,
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
export const inject = ['tools', 'webServer'];
export const reusable = true;

export function apply(ctx, config = {}) {
  const disposers = [];

  // 可变配置视图：宿主侧工具用快照构建，设置页写入后工具调用时读取最新值。
  const live = resolveConfigObject(config);
  // 同步后的元数据（供设置页展示）
  const syncMeta = { lastSyncedAt: null, lastSkillsCount: null, lastVia: null };

  try {
    for (const tool of buildSkillTools(live)) {
      disposers.push(ctx.tools.register(tool));
    }
  } catch (error) {
    ctx.logger?.warn?.(`[dsh-sensenova-skills] 工具注册失败：${error?.message || error}`);
  }

  // 设置页 RPC 桥（loopback）：Settings → SenseNova Skills 一级入口
  const doSync = async () => {
    const runtimeDir = String(live.runtimeDir || defaultRuntimeDir()).trim() || defaultRuntimeDir();
    mkdirSync(runtimeDir, { recursive: true });
    const result = await runSync(live, runtimeDir, {}, undefined);
    if (result.ok) {
      syncMeta.lastSyncedAt = result.syncedAt;
      syncMeta.lastSkillsCount = result.skillsCount;
      syncMeta.lastVia = result.via;
    }
    return result;
  };

  try {
    disposers.push(installSkillsRpc(ctx, {
      getLiveConfig: () => ({ ...live, lastSyncedAt: syncMeta.lastSyncedAt, lastSkillsCount: syncMeta.lastSkillsCount, lastVia: syncMeta.lastVia }),
      writeLiveConfig: (updates) => { Object.assign(live, updates); },
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
