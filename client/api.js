// dsh-sensenova-skills 设置页传输契约（host 与 client 共用）

export const SENSENOVA_SKILLS_RPC_CHANNEL = '/dsh-sensenova-skills';

export const SENSENOVA_SKILLS_ENDPOINTS = Object.freeze({
  getConfig: 'skills.getConfig',
  setConfig: 'skills.setConfig',
  status: 'skills.status',
  sync: 'skills.sync',
  listSkills: 'skills.list',
  setSkillEnabled: 'skills.setEnabled',
  setEnv: 'skills.setEnv',
});

/** 需要 secret 角色保护的 key（值永不回显给客户端）。 */
export const SECRET_ENV_KEYS = new Set([
  'SN_API_KEY', 'SN_IMAGE_GEN_API_KEY', 'SN_CHAT_API_KEY', 'SN_TEXT_API_KEY',
  'SN_VISION_API_KEY', 'SERPER_API_KEY', 'DEEPXIV_TOKEN', 'OPENALEX_API_KEY',
  'GITHUB_TOKEN', 'HF_TOKEN', 'SO_API_KEY', 'TIKHUB_TOKEN', 'YOUTUBE_API_KEY',
  'VOLCENGINE_API_KEY', 'WORKBENCH_GATEWAY_API_KEY',
]);

/** 官方 env.example 里最常用的变量，直接在 UI 里提供输入框。 */
export const COMMON_ENV_KEYS = Object.freeze([
  ['SN_API_KEY', 'SenseNova API Key', '多数 sn-* skill 的统一凭据', true],
  ['SN_BASE_URL', 'SenseNova Base URL', '默认 https://token.sensenova.cn/v1', false],
  ['SN_IMAGE_GEN_API_KEY', '文生图 API Key', 'sn-infographic / sn-image-* 使用', true],
  ['SN_IMAGE_GEN_BASE_URL', '文生图 Base URL', '', false],
  ['SN_CHAT_API_KEY', '对话/文本 API Key', 'sn-* 需要 LLM 时使用', true],
  ['SN_CHAT_BASE_URL', '对话/文本 Base URL', '', false],
  ['SN_VISION_API_KEY', '视觉理解 API Key', 'sn-image-caption / sn-da-image-caption 使用', true],
  ['SN_VISION_BASE_URL', '视觉理解 Base URL', '', false],
  ['SERPER_API_KEY', 'Serper 搜索 Key', 'sn-search-image / sn-search-academic 使用', true],
  ['GITHUB_TOKEN', 'GitHub Token', 'sn-search-code 使用，可提速并提高限额', true],
]);

/** 只回显「是否已配置」，绝不回显值。 */
export function redactEnv(env) {
  const out = {};
  for (const [k, v] of Object.entries(env || {})) {
    out[k] = { configured: typeof v === 'string' && v !== '', secret: SECRET_ENV_KEYS.has(k) };
  }
  return out;
}

export function redactConfig(config = {}) {
  return {
    repoURL: config.repoURL ?? '',
    ref: config.ref ?? '',
    runtimeDir: config.runtimeDir ?? '',
    linkDir: config.linkDir ?? '',
    autoSync: config.autoSync === true,
    enabled: { ...(config.enabled ?? {}) },
    skillsIndex: config.skillsIndex ?? [],
    syncedAt: config.lastSyncedAt ?? null,
    skillsCount: config.lastSkillsCount ?? null,
    via: config.lastVia ?? null,
    envFile: config.envFilePath ?? null,
  };
}
