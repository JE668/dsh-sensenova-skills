// dsh-sensenova-skills 设置页契约（client 专用）
//
// 配置读写走 ctx.configForms.get(entryId)（dsh-client-ui-settings 官方通道，
// 底层 remote.settings，由宿主 dsh-settings 自动暴露所有 .volatile() 字段）。

export const SENSENOVA_SKILLS_ENTRY_ID = 'dsh-sensenova-skills';

export const SENSENOVA_SKILLS_FIELDS = Object.freeze({
  repoURL: 'repoURL',
  ref: 'ref',
  runtimeDir: 'runtimeDir',
});

export const SENSENOVA_SKILLS_DEFAULTS = Object.freeze({
  repoURL: 'https://github.com/OpenSenseNova/SenseNova-Skills.git',
  ref: 'main',
  runtimeDir: '',
});
