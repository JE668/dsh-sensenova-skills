// dsh-sensenova-skills 网页客户端：设置一级入口「SenseNova Skills」
//
// 左侧 Settings → 一级 section（settings.section slot）。
// 配置读写走 ctx.configForms.get(entryId)（dsh-client-ui-settings 官方通道）。
// 同步动作不在设置页发起：请对 DSH 说一句「同步 SenseNova skills」。

import { createElement as h, useEffect, useState, useSyncExternalStore } from 'react';
import {
  SENSENOVA_SKILLS_ENTRY_ID,
  SENSENOVA_SKILLS_FIELDS as F,
  SENSENOVA_SKILLS_DEFAULTS as D,
} from './api.js';

const name = 'dsh-sensenova-skills';
const inject = ['slots', 'layout', 'locale'];

const NS = 'sensenova-skills';
const DICT = {
  zh: {
    section: 'SenseNova Skills',
    title: 'SenseNova Skills',
    subtitle: '官方技能桥：从 SenseNova-Skills 仓库运行时拉取 36 个 MIT 技能，随上游更新自动同步。',
    repoURL: '上游仓库 URL',
    repoHint: 'git 仓库地址或本地路径（默认官方 SenseNova-Skills）。',
    ref: 'Git ref',
    refHint: '分支 / tag / 完整 commit hash（默认 main）。',
    runtimeDir: '运行时目录',
    runtimeHint: '技能文件落地目录。留空使用默认：~/.dsh/profiles/<当前 profile>/sensenova-skills。',
    save: '保存',
    saving: '保存中…',
    saved: '已保存。重启 DSH 后生效。',
    syncHint: '保存后请对 DSH 说一句「同步 SenseNova skills」，或调用 sensenova_skills_sync 工具，即会按上面的仓库 / ref / 目录拉取最新技能。',
    readOnly: '该配置当前不可写入。',
    unavailable: '配置服务不可用（宿主 dsh-settings 未暴露该插件条目）。',
    saveFailed: '保存失败：宿主拒绝了本次写入。',
  },
  en: {
    section: 'SenseNova Skills',
    title: 'SenseNova Skills',
    subtitle: 'Official skills bridge: pulls 36 MIT-licensed skills from the SenseNova-Skills repo at runtime and follows upstream updates.',
    repoURL: 'Upstream repo URL',
    repoHint: 'Git repo URL or local path (defaults to the official SenseNova-Skills).',
    ref: 'Git ref',
    refHint: 'Branch / tag / full commit hash (default: main).',
    runtimeDir: 'Runtime directory',
    runtimeHint: 'Where skill files land. Leave empty for the default: ~/.dsh/profiles/<profile>/sensenova-skills.',
    save: 'Save',
    saving: 'Saving…',
    saved: 'Saved. Restart DSH to take effect.',
    syncHint: 'After saving, tell DSH “sync SenseNova skills” (or call sensenova_skills_sync) to pull the latest skills from the repo / ref / directory above.',
    readOnly: 'Configuration is not writable right now.',
    unavailable: 'Settings service unavailable (host did not expose this plugin entry).',
    saveFailed: 'Save failed: the host rejected this write.',
  },
};

const styles = {
  card: { background: 'var(--dsw-alias-bg-layer-1,#fff)', border: '1px solid var(--dsw-alias-border-l2,#e5e7eb)', borderRadius: 12, padding: '16px 20px', maxWidth: 520 },
  field: { display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 },
  label: { fontSize: 13, color: 'var(--dsw-alias-label-primary,inherit)' },
  hint: { fontSize: 12, color: 'var(--dsw-alias-label-tertiary,#8b93a1)', lineHeight: 1.4 },
  input: { border: '1px solid var(--dsw-alias-border-l2,#d1d5db)', background: 'var(--dsw-alias-bg-layer-3,#fff)', borderRadius: 8, padding: '8px 10px', fontSize: 13, color: 'var(--dsw-alias-label-primary,inherit)', height: 36, boxSizing: 'border-box', width: '100%' },
  row: { display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 },
  primary: { font: 'inherit', cursor: 'pointer', border: 'none', background: 'var(--dsw-alias-button-primary-fill, var(--dsw-alias-brand-primary,#4f6ef7))', color: 'var(--dsw-alias-label-primary-foreground, #fff)', height: 36, padding: '0 16px', borderRadius: 999, fontSize: 13, fontWeight: 500, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' },
  ok: { color: 'var(--dsw-alias-state-success-primary,#34c759)', fontSize: 12 },
  err: { color: 'var(--dsw-alias-state-error-primary,#ff3b30)', fontSize: 12, whiteSpace: 'pre-wrap' },
  box: { margin: '4px 0 14px', padding: '10px 12px', border: '1px solid var(--dsw-alias-border-l3,#eef0f4)', borderRadius: 8, background: 'var(--dsw-alias-bg-layer-2,#fafbfc)', fontSize: 12, color: 'var(--dsw-alias-label-secondary,#6b7280)', lineHeight: 1.5 },
};

function SenseNovaSkillsSettingsCard({ settings, t }) {
  const snap = useSyncExternalStore(settings.subscribe, settings.getSnapshot);
  const v = snap?.value ?? {};

  const [draft, setDraft] = useState({
    repoURL: v.repoURL ?? D.repoURL,
    ref: v.ref ?? D.ref,
    runtimeDir: v.runtimeDir ?? '',
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    setDraft({
      repoURL: v.repoURL ?? D.repoURL,
      ref: v.ref ?? D.ref,
      runtimeDir: v.runtimeDir ?? '',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snap?.revision]);

  const set = (key, value) => setDraft((d) => ({ ...d, [key]: value }));

  const save = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const ops = [
        { op: 'set', path: [F.repoURL], value: draft.repoURL ?? D.repoURL },
        { op: 'set', path: [F.ref], value: draft.ref ?? D.ref },
        { op: 'set', path: [F.runtimeDir], value: draft.runtimeDir ?? '' },
      ];
      const ok = await settings.mutate(ops, snap?.revision);
      setMsg(ok ? { kind: 'ok', text: t('saved') } : { kind: 'err', text: t('saveFailed') });
    } catch (e) {
      setMsg({ kind: 'err', text: String(e?.message ?? e) });
    } finally {
      setBusy(false);
    }
  };

  if (snap?.status !== 'ready') {
    return h('div', { style: styles.card }, h('p', { style: styles.err }, t('unavailable')));
  }

  return h('div', { style: styles.card },
    h('div', { style: { fontSize: 15, fontWeight: 600, marginBottom: 4 } }, t('title')),
    h('p', { style: styles.hint }, t('subtitle')),

    h('div', { style: styles.field },
      h('label', { style: styles.label }, t('repoURL')),
      h('input', { style: styles.input, value: draft.repoURL ?? D.repoURL, onChange: (e) => set('repoURL', e.target.value) }),
      h('div', { style: styles.hint }, t('repoHint')),
    ),
    h('div', { style: styles.field },
      h('label', { style: styles.label }, t('ref')),
      h('input', { style: styles.input, value: draft.ref ?? D.ref, onChange: (e) => set('ref', e.target.value) }),
      h('div', { style: styles.hint }, t('refHint')),
    ),
    h('div', { style: styles.field },
      h('label', { style: styles.label }, t('runtimeDir')),
      h('input', { style: styles.input, value: draft.runtimeDir ?? '', placeholder: '~/.dsh/profiles/<profile>/sensenova-skills', onChange: (e) => set('runtimeDir', e.target.value) }),
      h('div', { style: styles.hint }, t('runtimeHint')),
    ),
    h('div', { style: styles.row },
      h('button', { style: styles.primary, disabled: busy || !snap?.writable, onClick: save }, busy ? t('saving') : t('save')),
      !snap?.writable && h('span', { style: styles.hint }, t('readOnly')),
    ),
    msg ? h('div', { style: msg.kind === 'ok' ? styles.ok : styles.err }, msg.text) : null,
    h('div', { style: styles.box }, t('syncHint')),
  );
}

export function apply(ctx) {
  const translate = ctx.locale.bind(NS);
  ctx.effect(() => ctx.locale.register(NS, DICT), 'dsh-sensenova-skills: locale dictionaries');

  ctx.inject(['configForms'], (settingsCtx) => {
    const forms = settingsCtx.get('configForms');
    const settings = forms.get(SENSENOVA_SKILLS_ENTRY_ID);
    settingsCtx.slots.inject('settings.section', () =>
      settingsCtx.slots.register(
        {
          name: 'settings.section',
          id: 'sensenova-skills',
          order: 31,
          label: () => translate('section'),
          inject: () => ({ settings, t: translate }),
        },
        SenseNovaSkillsSettingsCard,
      ),
    );
  });
}

export { name, inject };
export default { apply, name, inject };
