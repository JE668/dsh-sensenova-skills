// dsh-sensenova-skills 设置页 RPC 契约（client 与 host 共享）
export const SENSENOVA_SKILLS_RPC_CHANNEL = '/dsh-sensenova-skills';

export const SENSENOVA_SKILLS_ENDPOINTS = Object.freeze({
  getConfig: 'skills.getConfig',
  setConfig: 'skills.setConfig',
  status: 'skills.status',
  sync: 'skills.sync',
});

/** 浏览器可见的配置视图（不暴露敏感信息）。 */
export function redactConfig(c) {
  return {
    repoURL: c?.repoURL ?? '',
    ref: c?.ref ?? 'main',
    runtimeDir: c?.runtimeDir ?? '',
    syncedAt: c?.syncedAt ?? null,
    skillsCount: c?.skillsCount ?? null,
    via: c?.via ?? null,
  };
}
