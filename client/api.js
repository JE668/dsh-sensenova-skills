// dsh-sensenova-skills 设置页传输契约（host 与 client 共用）

export const SENSENOVA_SKILLS_RPC_CHANNEL = '/dsh-sensenova-skills';

export const SENSENOVA_SKILLS_ENDPOINTS = Object.freeze({
  getConfig: 'skills.getConfig',
  setConfig: 'skills.setConfig',
  status: 'skills.status',
  sync: 'skills.sync',
});

/** 脱敏视图。 */
export function redactConfig(config = {}) {
  return {
    repoURL: config.repoURL ?? '',
    ref: config.ref ?? '',
    runtimeDir: config.runtimeDir ?? '',
    linkDir: config.linkDir ?? '',
    syncedAt: config.lastSyncedAt ?? null,
    skillsCount: config.lastSkillsCount ?? null,
    via: config.lastVia ?? null,
  };
}
