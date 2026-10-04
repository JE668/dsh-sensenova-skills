// dsh-sensenova-skills 网页客户端：插件设置卡片（Plugins 页面）
//
// 严格对齐官方 @deepseek-ai/dsh-client-ui-settings-web-search 的范式。
// 配置读写由宿主 dsh-settings 通过 remote.settings 提供（.volatile() 字段）。

import { createElement as h, useCallback, useSyncExternalStore } from 'react';

const name = 'dsh-sensenova-skills';
const inject = ['slots', 'locale', 'configForms'];

const NS = 'sensenova-skills';
const ENTRY_ID = 'dsh-sensenova-skills';
const ITEM_ID = 'sensenova-skills';
const ITEM_ORDER = 41;

const DEFAULT_REPO = 'https://github.com/OpenSenseNova/SenseNova-Skills.git';

const zh = {
  title: 'SenseNova Skills',
  summary: '官方技能桥：运行时拉取 36 个 MIT 技能，随上游更新同步。',
  detail: '官方技能桥：从 SenseNova-Skills 仓库在运行时拉取 36 个 MIT 许可技能，随上游更新同步。',
  repoURL: '上游仓库 URL',
  repoHint: 'git 仓库地址；默认官方 SenseNova-Skills。',
  ref: 'Git ref',
  refHint: '分支 / tag / 完整 commit hash。',
  runtimeDir: '运行时目录',
  runtimeHint: '留空则使用 ~/.dsh/profiles/<当前 profile>/sensenova-skills。',
  save: '保存',
  saving: '保存中…',
  saved: '已保存。重启 DSH 后生效。',
  failed: '保存失败：宿主拒绝了本次写入。',
  readOnly: '该配置当前不可写入。',
  unavailable: '配置服务不可用（宿主未暴露该插件条目）。',
  syncHint: '保存后对 DSH 说一句「同步 SenseNova skills」，或调用 sensenova_skills_sync 工具，即可按上面的仓库 / ref / 目录拉取最新技能。',
};

const en = {
  title: 'SenseNova Skills',
  summary: 'Official skills bridge: pulls 36 MIT-licensed skills at runtime and follows upstream.',
  detail: 'Official skills bridge: pulls 36 MIT-licensed skills from the SenseNova-Skills repo at runtime and follows upstream updates.',
  repoURL: 'Upstream repo URL',
  repoHint: 'Git repository URL; defaults to the official SenseNova-Skills repo.',
  ref: 'Git ref',
  refHint: 'Branch / tag / full commit hash.',
  runtimeDir: 'Runtime directory',
  runtimeHint: 'Leave empty to use ~/.dsh/profiles/<current profile>/sensenova-skills.',
  save: 'Save',
  saving: 'Saving…',
  saved: 'Saved. Restart DSH to take effect.',
  failed: 'Save failed: the host rejected this write.',
  readOnly: 'Configuration is not writable right now.',
  unavailable: 'Settings service unavailable (the host did not expose this plugin entry).',
  syncHint: 'After saving, tell DSH “sync SenseNova skills” (or call the sensenova_skills_sync tool) to pull the latest skills from the repo / ref / directory above.',
};

const styles = {
  field: { display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 },
  label: { fontSize: 13 },
  hint: { fontSize: 12, opacity: 0.65, lineHeight: 1.4 },
  input: {
    border: '1px solid var(--dsw-alias-border-l2, #d1d5db)',
    background: 'var(--dsw-alias-bg-layer-3, #fff)',
    color: 'var(--dsw-alias-label-primary, inherit)',
    borderRadius: 8, padding: '8px 10px', fontSize: 13,
    height: 36, boxSizing: 'border-box', width: '100%',
  },
  row: { display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 },
  primary: {
    font: 'inherit', cursor: 'pointer', border: 'none', height: 36,
    padding: '0 16px', borderRadius: 999, fontSize: 13, fontWeight: 500,
    background: 'var(--dsw-alias-button-primary-fill, #4f6ef7)',
    color: 'var(--dsw-alias-label-primary-foreground, #fff)',
  },
  ok: { fontSize: 12, color: 'var(--dsw-alias-state-success-primary, #34c759)' },
  err: { fontSize: 12, color: 'var(--dsw-alias-state-error-primary, #ff3b30)', whiteSpace: 'pre-wrap' },
  box: {
    margin: '4px 0 14px', padding: '10px 12px', borderRadius: 8,
    border: '1px solid var(--dsw-alias-border-l3, #eef0f4)',
    background: 'var(--dsw-alias-bg-layer-2, #fafbfc)',
    fontSize: 12, opacity: 0.8, lineHeight: 1.5,
  },
};

const FIELDS = { repoURL: 'repoURL', ref: 'ref', runtimeDir: 'runtimeDir' };

function SenseNovaSkillsCard(props) {
  const settings = props.settings;
  const t = props.t ?? ((k) => zh[k] ?? k);

  const subscribe = useCallback((l) => settings.subscribe(l), [settings]);
  const getSnapshot = useCallback(() => settings.getSnapshot(), [settings]);
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const value = snapshot?.value ?? {};
  const writable = snapshot?.writable === true && snapshot?.mode === 'host';

  if (props.view === 'summary') return h('span', null, t('summary'));
  if (snapshot?.status !== 'ready' || value === undefined) {
    return h('p', { style: styles.err }, t('unavailable'));
  }

  const current = {
    repoURL: value.repoURL ?? DEFAULT_REPO,
    ref: value.ref ?? 'main',
    runtimeDir: value.runtimeDir ?? '',
  };

  const setField = (key, next) => props.actions.stage(FIELDS[key], next);

  return h('div', null,
    h('p', { style: { ...styles.hint, margin: '0 0 12px' } }, t('detail')),
    h('div', { style: styles.field },
      h('label', { style: styles.label }, t('repoURL')),
      h('input', {
        style: styles.input,
        value: props.actions.draft(FIELDS.repoURL).value ?? current.repoURL,
        onChange: (e) => setField('repoURL', e.target.value),
      }),
      h('div', { style: styles.hint }, t('repoHint')),
    ),
    h('div', { style: styles.field },
      h('label', { style: styles.label }, t('ref')),
      h('input', {
        style: styles.input,
        value: props.actions.draft(FIELDS.ref).value ?? current.ref,
        onChange: (e) => setField('ref', e.target.value),
      }),
      h('div', { style: styles.hint }, t('refHint')),
    ),
    h('div', { style: styles.field },
      h('label', { style: styles.label }, t('runtimeDir')),
      h('input', {
        style: styles.input,
        value: props.actions.draft(FIELDS.runtimeDir).value ?? current.runtimeDir,
        placeholder: '~/.dsh/profiles/<profile>/sensenova-skills',
        onChange: (e) => setField('runtimeDir', e.target.value),
      }),
      h('div', { style: styles.hint }, t('runtimeHint')),
    ),
    h('div', { style: styles.row },
      h('button', {
        style: styles.primary,
        disabled: !writable || props.actions.saving() || props.actions.dirty() === false,
        onClick: () => props.actions.save(),
      }, props.actions.saving() ? t('saving') : t('save')),
      !writable && h('span', { style: styles.hint }, t('readOnly')),
    ),
    props.actions.message() === 'saved' ? h('p', { style: styles.ok }, t('saved')) : null,
    props.actions.message() === 'failed' ? h('p', { style: styles.err }, t('failed')) : null,
    h('div', { style: styles.box }, t('syncHint')),
  );
}

function apply(ctx) {
  const t = ctx.locale.bind(NS);
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-sensenova-skills: dictionaries');

  const form = ctx.configForms.get(ENTRY_ID);
  const drafts = new Map();
  let message = null;
  let saving = false;

  const actions = {
    stage(field, value) {
      message = null;
      drafts.set(field, value);
    },
    draft(field) {
      return drafts.has(field) ? { kind: 'set', value: drafts.get(field) } : { kind: 'unset' };
    },
    dirty() { return drafts.size > 0; },
    saving() { return saving; },
    message() { return message; },
    async save() {
      if (saving || drafts.size === 0) return;
      saving = true;
      try {
        const ops = [...drafts.entries()].map(([field, value]) => ({ op: 'set', path: [field], value }));
        const ok = await form.mutate(ops, form.getSnapshot()?.revision);
        if (ok) { drafts.clear(); message = 'saved'; } else { message = 'failed'; }
      } catch {
        message = 'failed';
      } finally {
        saving = false;
      }
    },
    inject() { return { settings: form, t, actions }; },
  };

  ctx.effect(() => () => drafts.clear(), 'dsh-sensenova-skills: drafts');

  ctx.effect(() => ctx.configForms.whileServed([ENTRY_ID], () => ctx.slots.inject(
    'plugins.item',
    () => ctx.slots.register(
      {
        name: 'plugins.item',
        id: ITEM_ID,
        order: ITEM_ORDER,
        label: () => t('title'),
        locale: NS,
        inject: () => actions.inject(),
      },
      SenseNovaSkillsCard,
    ),
  )), 'dsh-sensenova-skills: page');
}

export { apply, inject, name };
