// dsh-sensenova-skills 网页客户端：设置一级入口「SenseNova Skills」
// 左侧 Settings → 一级 section：管理上游仓库 URL / ref / runtimeDir，一键同步，显示同步状态。

import { createElement as h, useEffect, useState } from 'react';
import { SENSENOVA_SKILLS_RPC_CHANNEL, SENSENOVA_SKILLS_ENDPOINTS, redactConfig } from './api.js';

const name = 'dsh-sensenova-skills';
const inject = ['slots', 'connection', 'locale'];

const NS = 'sensenova-skills';
const DICT = {
  zh: {
    section: 'SenseNova Skills',
    title: 'SenseNova Skills',
    subtitle: '桥接 OpenSenseNova/SenseNova-Skills（MIT）官方 agent skills。',
    repoURL: '上游仓库 URL',
    ref: '跟踪 ref（分支 / tag / commit）',
    runtimeDir: '运行时目录',
    runtimeDirHint: '留空使用默认 ~/.dsh/sensenova-skills',
    syncNow: '立即同步',
    syncOk: '同步成功',
    syncErr: '同步失败',
    save: '保存配置',
    status: '同步状态',
    notSynced: '尚未同步。点击上方「立即同步」拉取上游 skills。',
    skills: '个 skill',
    via: '同步方式',
  },
  en: {
    section: 'SenseNova Skills',
    title: 'SenseNova Skills',
    subtitle: 'Bridges OpenSenseNova/SenseNova-Skills (MIT) agent skills.',
    repoURL: 'Upstream repo URL',
    ref: 'Track ref (branch / tag / commit)',
    runtimeDir: 'Runtime directory',
    runtimeDirHint: 'Leave empty to use default ~/.dsh/sensenova-skills',
    syncNow: 'Sync now',
    syncOk: 'Synced',
    syncErr: 'Sync failed',
    save: 'Save config',
    status: 'Sync status',
    notSynced: 'Not synced. Click "Sync now" to pull upstream skills.',
    skills: 'skills',
    via: 'via',
  },
};

const styles = {
  card: { background: 'var(--dsw-alias-bg-layer-1,#fff)', border: '1px solid var(--dsw-alias-border-l2,#e5e7eb)', borderRadius: 12, padding: '16px 20px', maxWidth: 480 },
  field: { display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 },
  label: { fontSize: 13, color: 'var(--dsw-alias-label-primary,inherit)' },
  hint: { fontSize: 12, color: 'var(--dsw-alias-label-tertiary,#8b93a1)', lineHeight: 1.4 },
  input: { border: '1px solid var(--dsw-alias-border-l2,#d1d5db)', background: 'var(--dsw-alias-bg-layer-3,#fff)', borderRadius: 8, padding: '8px 10px', fontSize: 13, color: 'var(--dsw-alias-label-primary,inherit)', height: 36, boxSizing: 'border-box', width: '100%' },
  row: { display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' },
  btn: { font: 'inherit', cursor: 'pointer', border: '1px solid var(--dsw-alias-button-ghost-active-border, var(--dsw-alias-border-l2,#d1d5db))', background: 'var(--dsw-alias-bg-layer-1,#fff)', color: 'var(--dsw-alias-label-primary,inherit)', height: 36, padding: '0 16px', borderRadius: 999, fontSize: 13, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' },
  primary: { font: 'inherit', cursor: 'pointer', border: 'none', background: 'var(--dsw-alias-button-primary-fill, var(--dsw-alias-brand-primary,#4f6ef7))', color: 'var(--dsw-alias-label-primary-foreground, #fff)', height: 36, padding: '0 16px', borderRadius: 999, fontSize: 13, fontWeight: 500, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' },
  ok: { color: 'var(--dsw-alias-state-success-primary,#34c759)', fontSize: 12 },
  err: { color: 'var(--dsw-alias-state-error-primary,#ff3b30)', fontSize: 12, whiteSpace: 'pre-wrap' },
  block: { borderTop: '1px solid var(--dsw-alias-border-l2,#e5e7eb)', marginTop: 16, paddingTop: 16 },
  statusCard: { background: 'var(--dsw-alias-bg-layer-3,#f8f9fa)', border: '1px solid var(--dsw-alias-border-l2,#e5e7eb)', borderRadius: 10, padding: '10px 14px', fontSize: 13 },
};

function SkillsSettingsTab({ rpcCall, t }) {
  const [cfg, setCfg] = useState(null);
  const [draft, setDraft] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [status, setStatus] = useState(null);

  const call = async (endpoint, payload) => {
    const res = await rpcCall(endpoint, payload);
    if (!res?.ok) throw new Error(res?.error?.message ?? 'RPC failed');
    return res.value;
  };

  const load = async () => {
    try {
      const [c, s] = await Promise.all([
        call(SENSENOVA_SKILLS_ENDPOINTS.getConfig, {}),
        call(SENSENOVA_SKILLS_ENDPOINTS.status, {}).catch(() => null),
      ]);
      const view = redactConfig(c);
      setCfg(view);
      setDraft({ ...view });
      setStatus(s);
    } catch (e) {
      setMsg({ kind: 'err', text: String(e?.message ?? e) });
    }
  };

  useEffect(() => { load(); }, []);

  const set = (key, value) => setDraft((d) => ({ ...d, [key]: value }));

  const save = async () => {
    if (!draft) return;
    setBusy(true); setMsg(null);
    try {
      const payload = {};
      if (draft.repoURL !== undefined) payload.repoURL = String(draft.repoURL || '').trim();
      if (draft.ref !== undefined) payload.ref = String(draft.ref || 'main').trim();
      if (draft.runtimeDir !== undefined) payload.runtimeDir = String(draft.runtimeDir || '').trim();
      await call(SENSENOVA_SKILLS_ENDPOINTS.setConfig, payload);
      setMsg({ kind: 'ok', text: '已保存。重启 DSH 或刷新会话后生效。' });
      const c = await call(SENSENOVA_SKILLS_ENDPOINTS.getConfig, {});
      setCfg(redactConfig(c));
      setDraft(redactConfig(c));
    } catch (e) {
      setMsg({ kind: 'err', text: String(e?.message ?? e) });
    } finally {
      setBusy(false);
    }
  };

  const sync = async () => {
    setBusy(true); setMsg(null);
    try {
      const r = await call(SENSENOVA_SKILLS_ENDPOINTS.sync, {});
      setStatus(r);
      setMsg({ kind: r.ok ? 'ok' : 'err', text: r.ok ? `已同步 ${r.skillsCount} 个 skill（${r.via}，ref=${r.ref}）。` : String(r.error ?? 'sync failed') });
      const c = await call(SENSENOVA_SKILLS_ENDPOINTS.getConfig, {});
      setCfg(redactConfig(c));
      setDraft(redactConfig(c));
    } catch (e) {
      setMsg({ kind: 'err', text: String(e?.message ?? e) });
    } finally {
      setBusy(false);
    }
  };

  return h('div', { style: styles.card },
    h('div', { style: { fontSize: 15, fontWeight: 600, marginBottom: 4 } }, t('title')),
    h('p', { style: styles.hint }, t('subtitle')),

    h('div', { style: styles.block },
      h('div', { style: styles.field },
        h('label', { style: styles.label }, t('repoURL')),
        h('input', {
          style: styles.input,
          value: draft?.repoURL ?? '',
          placeholder: 'https://github.com/OpenSenseNova/SenseNova-Skills',
          onChange: (e) => set('repoURL', e.target.value),
        }),
      ),
      h('div', { style: styles.field },
        h('label', { style: styles.label }, t('ref')),
        h('input', {
          style: styles.input,
          value: draft?.ref ?? 'main',
          onChange: (e) => set('ref', e.target.value),
        }),
      ),
      h('div', { style: styles.field },
        h('label', { style: styles.label }, t('runtimeDir')),
        h('input', {
          style: styles.input,
          value: draft?.runtimeDir ?? '',
          placeholder: t('runtimeDirHint'),
          onChange: (e) => set('runtimeDir', e.target.value),
        }),
      ),
      h('div', { style: styles.row },
        h('button', { style: styles.btn, disabled: busy, onClick: save }, busy ? '…' : t('save')),
        h('button', { style: styles.primary, disabled: busy, onClick: sync }, busy ? '…' : t('syncNow')),
      ),
      msg ? h('div', { style: msg.kind === 'ok' ? styles.ok : styles.err }, msg.text) : null,
    ),

    h('div', { style: styles.block },
      h('div', { style: { ...styles.label, marginBottom: 8 } }, t('status')),
      h('div', { style: styles.statusCard },
        status?.ok
          ? h('div', null,
              h('div', null, `${t('syncOk')} · ${status.skillsCount} ${t('skills')}`),
              h('div', { style: styles.hint }, `${status.ref} · ${status.via} · ${status.syncedAt ?? ''}`),
            )
          : h('div', { style: status?.error ? styles.err : styles.hint },
              status?.error ? String(status.error) : t('notSynced')),
      ),
    ),
  );
}

export function apply(ctx) {
  const rpcCall = (endpoint, payload, signal) =>
    ctx.connection.rpc.call(SENSENOVA_SKILLS_RPC_CHANNEL, endpoint, payload, signal);

  const translate = ctx.locale.bind(NS);
  ctx.effect(() => ctx.locale.register(NS, DICT), 'dsh-sensenova-skills: locale dictionaries');

  ctx.slots.inject('settings.section', () =>
    ctx.slots.register(
      {
        name: 'settings.section',
        id: 'sensenova-skills',
        order: 31,
        label: () => translate('section'),
        inject: () => ({ rpcCall, t: translate }),
      },
      SkillsSettingsTab,
    ),
  );
}

export { name, inject };
export default { apply, name, inject };
