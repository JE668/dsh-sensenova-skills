// dsh-sensenova-skills 网页客户端：Settings 左侧一级入口「SenseNova Skills」
//
// 注册形状逐字对齐 dsh-pocket（同一 profile 里已验证可用）。
// 传输走 ctx.connection.rpc.call(channel, endpoint, payload)，宿主路由见 lib/rpc.js。

import { createElement as h, useEffect, useState } from 'react';
import { SENSENOVA_SKILLS_RPC_CHANNEL, SENSENOVA_SKILLS_ENDPOINTS } from './api.js';

const name = 'dsh-sensenova-skills';
const inject = ['slots', 'connection', 'locale'];

const NS = 'sensenova-skills';
const DEFAULT_REPO = 'https://github.com/OpenSenseNova/SenseNova-Skills.git';

const zh = {
  section: 'SenseNova Skills',
  title: 'SenseNova Skills',
  subtitle: '官方技能桥：在运行时从 SenseNova-Skills 仓库拉取 36 个 MIT 许可技能，随上游更新同步。',
  repoURL: '上游仓库 URL',
  repoHint: 'git 仓库地址；默认官方 SenseNova-Skills。',
  ref: 'Git ref',
  refHint: '分支 / tag / 完整 commit hash。',
  runtimeDir: '运行时目录',
  runtimeHint: '上游快照的存放目录；留空使用 ~/.dsh/sensenova-skills。',
  linkDir: '挂载目录（DSH 扫描的 skill 根）',
  linkHint: '同步后每个 skill 会以符号链接挂到这里。必须是被扫描的目录，skill 才会进入会话目录、可用 /user-invocable 手动调用。留空使用 ~/.dsh/skills。',
  save: '保存',
  saving: '保存中…',
  saved: '已保存。',
  sync: '立即同步',
  syncing: '同步中…',
  synced: (n) => `已同步 ${n} 个技能。`,
  neverSynced: '尚未同步。',
  failed: '操作失败。',
  loading: '加载中…',
  loadFailed: '无法读取配置。',
};

const en = {
  section: 'SenseNova Skills',
  title: 'SenseNova Skills',
  subtitle: 'Official skills bridge: pulls 36 MIT-licensed skills from the SenseNova-Skills repo at runtime and follows upstream.',
  repoURL: 'Upstream repo URL',
  repoHint: 'Git repository URL; defaults to the official SenseNova-Skills repo.',
  ref: 'Git ref',
  refHint: 'Branch / tag / full commit hash.',
  runtimeDir: 'Runtime directory',
  runtimeHint: 'Where the upstream snapshot lands. Leave empty for ~/.dsh/sensenova-skills.',
  linkDir: 'Mount directory (a scanned DSH skill root)',
  linkHint: 'After syncing, each skill is symlinked here. It must be a scanned root for the skills to enter the session catalog and become user-invocable. Leave empty for ~/.dsh/skills.',
  save: 'Save',
  saving: 'Saving…',
  saved: 'Saved.',
  sync: 'Sync now',
  syncing: 'Syncing…',
  synced: (n) => `Synced ${n} skills.`,
  neverSynced: 'Never synced.',
  failed: 'Operation failed.',
  loading: 'Loading…',
  loadFailed: 'Could not read the configuration.',
};

const styles = {
  card: { maxWidth: 560 },
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
  secondary: {
    font: 'inherit', cursor: 'pointer', height: 36,
    padding: '0 16px', borderRadius: 999, fontSize: 13,
    border: '1px solid var(--dsw-alias-border-l2, #d1d5db)',
    background: 'transparent', color: 'var(--dsw-alias-label-primary, inherit)',
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

function SenseNovaSkillsSettingsTab({ rpcCall, t }) {
  const [config, setConfig] = useState(null);
  const [error, setError] = useState(null);
  const [draft, setDraft] = useState({});
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    let alive = true;
    rpcCall(SENSENOVA_SKILLS_ENDPOINTS.getConfig, {})
      .then((res) => {
        if (!alive) return;
        if (res && res.ok === true) setConfig(res.value ?? {});
        else setError(t('loadFailed'));
      })
      .catch((e) => { if (alive) setError(e?.message ?? t('loadFailed')); });
    return () => { alive = false; };
  }, []);

  if (error) return h('p', { style: styles.err }, error);
  if (config === null) return h('p', { style: styles.hint }, t('loading'));

  const field = (key, fallback) => (key in draft ? draft[key] : (config[key] ?? fallback));
  const set = (key, value) => { setMsg(null); setDraft((d) => ({ ...d, [key]: value })); };
  const dirty = Object.keys(draft).length > 0;

  const save = async () => {
    setSaving(true); setMsg(null);
    try {
      const updates = { ...draft };
      const res = await rpcCall(SENSENOVA_SKILLS_ENDPOINTS.setConfig, { updates });
      if (res && res.ok === true) { setConfig(res.value ?? {}); setDraft({}); setMsg({ kind: 'ok', text: t('saved') }); }
      else setMsg({ kind: 'err', text: res?.error?.message ?? t('failed') });
    } catch (e) { setMsg({ kind: 'err', text: e?.message ?? t('failed') }); }
    finally { setSaving(false); }
  };

  const sync = async () => {
    setSyncing(true); setMsg(null);
    try {
      // 先落盘未保存的改动，保证同步用的是最新仓库 / ref / 目录。
      if (dirty) {
        const saved = await rpcCall(SENSENOVA_SKILLS_ENDPOINTS.setConfig, { updates: { ...draft } });
        if (saved && saved.ok === true) { setConfig(saved.value ?? {}); setDraft({}); }
      }
      const res = await rpcCall(SENSENOVA_SKILLS_ENDPOINTS.sync, {});
      if (res && res.ok === true) {
        setConfig(res.value ?? {});
        const n = res.value?.skillsCount;
        setMsg({ kind: 'ok', text: typeof n === 'number' ? t('synced')(n) : t('saved') });
      } else setMsg({ kind: 'err', text: res?.error?.message ?? t('failed') });
    } catch (e) { setMsg({ kind: 'err', text: e?.message ?? t('failed') }); }
    finally { setSyncing(false); }
  };

  const status = config.syncedAt
    ? t('synced')(config.skillsCount ?? '?') + (config.linkDir ? `  ·  ${config.linkDir}` : '')
    : t('neverSynced');

  return h('div', { style: styles.card },
    h('p', { style: { ...styles.hint, margin: '0 0 12px' } }, t('subtitle')),

    h('div', { style: styles.field },
      h('label', { style: styles.label }, t('repoURL')),
      h('input', {
        style: styles.input, value: field('repoURL', DEFAULT_REPO),
        onChange: (e) => set('repoURL', e.target.value),
      }),
      h('div', { style: styles.hint }, t('repoHint')),
    ),
    h('div', { style: styles.field },
      h('label', { style: styles.label }, t('ref')),
      h('input', {
        style: styles.input, value: field('ref', 'main'),
        onChange: (e) => set('ref', e.target.value),
      }),
      h('div', { style: styles.hint }, t('refHint')),
    ),
    h('div', { style: styles.field },
      h('label', { style: styles.label }, t('runtimeDir')),
      h('input', {
        style: styles.input, value: field('runtimeDir', ''),
        placeholder: '~/.dsh/sensenova-skills',
        onChange: (e) => set('runtimeDir', e.target.value),
      }),
      h('div', { style: styles.hint }, t('runtimeHint')),
    ),
    h('div', { style: styles.field },
      h('label', { style: styles.label }, t('linkDir')),
      h('input', {
        style: styles.input, value: field('linkDir', ''),
        placeholder: '~/.dsh/skills',
        onChange: (e) => set('linkDir', e.target.value),
      }),
      h('div', { style: styles.hint }, t('linkHint')),
    ),
    h('div', { style: styles.box }, status),
    h('div', { style: styles.row },
      h('button', { style: styles.primary, disabled: saving || !dirty, onClick: save },
        saving ? t('saving') : t('save')),
      h('button', { style: styles.secondary, disabled: syncing || saving, onClick: sync },
        syncing ? t('syncing') : t('sync')),
    ),
    msg ? h('p', { style: msg.kind === 'ok' ? styles.ok : styles.err }, msg.text) : null,
  );
}

function apply(ctx) {
  const rpcCall = (endpoint, payload, signal) =>
    ctx.connection.rpc.call(SENSENOVA_SKILLS_RPC_CHANNEL, endpoint, payload, signal);
  const translate = ctx.locale.bind(NS);
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-sensenova-skills: locale dictionaries');
  ctx.slots.inject(
    'settings.section',
    () => ctx.slots.register(
      {
        name: 'settings.section',
        id: 'sensenova-skills',
        order: 41,
        label: () => translate('section'),
        inject: () => ({ rpcCall, t: translate }),
      },
      SenseNovaSkillsSettingsTab,
    ),
  );
}

export { apply, inject, name };
