// dsh-sensenova-skills 网页客户端：Settings 左侧一级入口「SenseNova Skills」
//
// 注册形状对齐 dsh-pocket：settings.section + ctx.connection.rpc.call。
// 三个区块：① 仓库/挂载 ② API 凭据与环境变量 ③ 逐 skill 开关。

import { createElement as h, useEffect, useState } from 'react';
import {
  SENSENOVA_SKILLS_RPC_CHANNEL,
  SENSENOVA_SKILLS_ENDPOINTS as EP,
  COMMON_ENV_KEYS,
} from './api.js';

const name = 'dsh-sensenova-skills';
const inject = ['slots', 'connection', 'locale'];

const NS = 'sensenova-skills';
const DEFAULT_REPO = 'https://github.com/OpenSenseNova/SenseNova-Skills';

const zh = {
  section: 'SenseNova Skills',
  loading: '加载中…',
  loadFailed: '无法读取配置。',
  repoTitle: '仓库与挂载',
  repoURL: '上游仓库 URL',
  repoHint: 'git 仓库地址；默认官方 SenseNova-Skills。',
  ref: 'Git ref',
  refHint: '分支 / tag / commit。',
  runtimeDir: '快照目录',
  runtimeHint: '上游快照存放位置；留空使用 ~/.dsh/sensenova-skills。',
  linkDir: '挂载目录',
  linkHint: '每个 skill 会以符号链接挂到这里。必须是 DSH 扫描的目录，否则 skill 不生效。留空使用 ~/.dsh/skills。',
  envTitle: 'API 凭据与环境变量',
  envHint: '写入 ~/.dsh/sensenova-skills/.env（权限 600），skill 脚本与 agent 可 source。值不回显，留空即保持不变。',
  mainKey: 'SenseNova API Key',
  mainKeyHint: '填这一个即可：图像、对话、文本、视觉各端点同源，会自动沿用同一个 key。',
  showAdvanced: '更多变量（各端点 URL / 搜索 key / GitHub token）',
  hideAdvanced: '收起',
  advancedHint: '以下按官方文档预填了默认值，通常无需修改。',
  configured: '已配置',
  notConfigured: '未配置',
  skillsTitle: 'Skills 开关',
  skillsHint: '关闭的 skill 不会挂载，因此不会进入会话目录。',
  enableAll: '全开',
  disableAll: '全关',
  enabledCount: (on, total) => `已启用 ${on} / ${total}`,
  save: '保存',
  saving: '保存中…',
  saved: '已保存。',
  sync: '立即同步',
  syncing: '同步中…',
  syncDone: (on, total) => `同步完成，已挂载 ${on} / ${total} 个 skill。`,
  failed: '操作失败。',
};

const en = {
  section: 'SenseNova Skills',
  loading: 'Loading…',
  loadFailed: 'Could not read the configuration.',
  repoTitle: 'Repository and mount',
  repoURL: 'Upstream repo URL',
  repoHint: 'Git repository URL; defaults to the official SenseNova-Skills repo.',
  ref: 'Git ref',
  refHint: 'Branch / tag / commit.',
  runtimeDir: 'Snapshot directory',
  runtimeHint: 'Where the upstream snapshot lands. Leave empty for ~/.dsh/sensenova-skills.',
  linkDir: 'Mount directory',
  linkHint: 'Each skill is symlinked here. It must be a scanned DSH root or the skills will not take effect. Leave empty for ~/.dsh/skills.',
  envTitle: 'API credentials and environment',
  envHint: 'Written to ~/.dsh/sensenova-skills/.env (mode 600) for skill scripts and the agent to source. Values are never echoed back; empty keeps the current value.',
  mainKey: 'SenseNova API Key',
  mainKeyHint: 'This one field is enough: the image, chat, text and vision endpoints are the same origin and share this key automatically.',
  showAdvanced: 'More variables (endpoint URLs, search keys, GitHub token)',
  hideAdvanced: 'Hide',
  advancedHint: 'Prefilled from the official API documentation; rarely needs changing.',
  configured: 'configured',
  notConfigured: 'not set',
  skillsTitle: 'Skill toggles',
  skillsHint: 'A disabled skill is not mounted, so it never enters the session catalog.',
  enableAll: 'Enable all',
  disableAll: 'Disable all',
  enabledCount: (on, total) => `${on} / ${total} enabled`,
  save: 'Save',
  saving: 'Saving…',
  saved: 'Saved.',
  sync: 'Sync now',
  syncing: 'Syncing…',
  syncDone: (on, total) => `Synced. ${on} / ${total} skills mounted.`,
  failed: 'Operation failed.',
};

const S = {
  h2: { fontSize: 14, fontWeight: 600, margin: '20px 0 4px' },
  hint: { fontSize: 12, opacity: 0.65, lineHeight: 1.45, marginBottom: 10 },
  field: { display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 },
  label: { fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 },
  input: {
    border: '1px solid var(--dsw-alias-border-l2, #d1d5db)',
    background: 'var(--dsw-alias-bg-layer-3, #fff)',
    color: 'var(--dsw-alias-label-primary, inherit)',
    borderRadius: 8, padding: '8px 10px', fontSize: 13,
    height: 36, boxSizing: 'border-box', width: '100%',
  },
  row: { display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' },
  primary: {
    font: 'inherit', cursor: 'pointer', border: 'none', height: 34,
    padding: '0 16px', borderRadius: 999, fontSize: 13, fontWeight: 500,
    background: 'var(--dsw-alias-button-primary-fill, #4f6ef7)',
    color: 'var(--dsw-alias-label-primary-foreground, #fff)',
  },
  secondary: {
    font: 'inherit', cursor: 'pointer', height: 34, padding: '0 14px',
    borderRadius: 999, fontSize: 13,
    border: '1px solid var(--dsw-alias-border-l2, #d1d5db)',
    background: 'transparent', color: 'var(--dsw-alias-label-primary, inherit)',
  },
  ok: { fontSize: 12, color: 'var(--dsw-alias-state-success-primary, #34c759)' },
  err: { fontSize: 12, color: 'var(--dsw-alias-state-error-primary, #ff3b30)', whiteSpace: 'pre-wrap' },
  list: { maxHeight: 300, overflowY: 'auto', border: '1px solid var(--dsw-alias-border-l3, #eef0f4)', borderRadius: 8, padding: '4px 10px' },
  item: { display: 'flex', gap: 8, alignItems: 'flex-start', padding: '7px 0', borderBottom: '1px solid var(--dsw-alias-border-l3, #f2f3f6)' },
  itemName: { fontSize: 13, fontWeight: 500 },
  itemDesc: { fontSize: 11, opacity: 0.6, lineHeight: 1.4, marginTop: 2 },
  tag: { fontSize: 11, opacity: 0.75, border: '1px solid var(--dsw-alias-border-l2, #d1d5db)', borderRadius: 999, padding: '0 7px', height: 18, display: 'inline-flex', alignItems: 'center' },
};

function SenseNovaSkillsSettingsTab({ rpcCall, t }) {
  const [config, setConfig] = useState(null);
  const [error, setError] = useState(null);
  const [draft, setDraft] = useState({});
  const [envDraft, setEnvDraft] = useState({});
  const [busy, setBusy] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [msg, setMsg] = useState(null);

  const apply = (res) => {
    if (res && res.ok === true) {
      setConfig(res.value ?? {});
      setDraft({});
      setEnvDraft({});
      return true;
    }
    setMsg({ kind: 'err', text: res?.error?.message ?? t('failed') });
    return false;
  };

  useEffect(() => {
    let alive = true;
    rpcCall(EP.getConfig, {})
      .then((res) => {
        if (!alive) return;
        if (res && res.ok === true) setConfig(res.value ?? {});
        else setError(t('loadFailed'));
      })
      .catch((e) => { if (alive) setError(e?.message ?? t('loadFailed')); });
    return () => { alive = false; };
  }, []);

  if (error) return h('p', { style: S.err }, error);
  if (config === null) return h('p', { style: S.hint }, t('loading'));

  const envKeys = config.envKeys ?? {};
  const index = config.skillsIndex ?? [];
  const disabledMap = config.enabled ?? {};

  const f = (key, fallback = '') => (key in draft ? draft[key] : (config[key] ?? fallback));
  const setF = (key, value) => { setMsg(null); setDraft((d) => ({ ...d, [key]: value })); };

  const isOn = (n) => !(n in disabledMap) || disabledMap[n] !== false;
  const onCount = index.filter((s) => isOn(s.name)).length;

  const toggle = async (skillName, enable) => {
    setMsg(null);
    const res = await rpcCall(EP.setSkillEnabled, { name: skillName, enabled: enable });
    if (res && res.ok === true) setConfig(res.value ?? {});
    else setMsg({ kind: 'err', text: res?.error?.message ?? t('failed') });
  };

  const setAll = async (enable) => {
    setMsg(null);
    const next = {};
    if (!enable) for (const s of index) next[s.name] = false;
    setBusy(true);
    const res = await rpcCall(EP.setConfig, { updates: { enabled: next } });
    setBusy(false);
    if (res && res.ok === true) setConfig(res.value ?? {});
    else setMsg({ kind: 'err', text: res?.error?.message ?? t('failed') });
  };

  const saveEnv = async () => {
    const values = {};
    for (const [k, v] of Object.entries(envDraft)) values[k] = v;
    if (Object.keys(values).length === 0) { setMsg({ kind: 'ok', text: t('saved') }); return; }
    setBusy(true); setMsg(null);
    const res = await rpcCall(EP.setEnv, { values });
    setBusy(false);
    if (apply(res)) setMsg({ kind: 'ok', text: t('saved') });
  };

  const save = async () => {
    setBusy(true); setMsg(null);
    const res = await rpcCall(EP.setConfig, { updates: { ...draft } });
    setBusy(false);
    if (apply(res)) setMsg({ kind: 'ok', text: t('saved') });
  };

  const sync = async () => {
    setBusy(true); setMsg(null);
    if (Object.keys(draft).length > 0) {
      const saved = await rpcCall(EP.setConfig, { updates: { ...draft } });
      if (saved && saved.ok === true) setConfig(saved.value ?? {});
    }
    const res = await rpcCall(EP.sync, {});
    setBusy(false);
    if (res && res.ok === true) {
      setConfig(res.value ?? {});
      setDraft({});
      const total = (res.value?.skillsIndex ?? []).length;
      const off = Object.keys(res.value?.enabled ?? {}).filter((k) => res.value.enabled[k] === false).length;
      setMsg({ kind: 'ok', text: t('syncDone')(total - off, total) });
    } else setMsg({ kind: 'err', text: res?.error?.message ?? t('failed') });
  };

  const input = (key, opts) => h('input', {
    style: S.input, value: f(key, opts.fallback ?? ''),
    placeholder: opts.placeholder ?? '', type: opts.type ?? 'text',
    onChange: (e) => setF(key, e.target.value),
  });

  return h('div', { style: { maxWidth: 620 } },
    /* ① 仓库与挂载 */
    h('div', { style: S.h2 }, t('repoTitle')),
    h('div', { style: S.field }, h('label', { style: S.label }, t('repoURL')), input('repoURL', { fallback: DEFAULT_REPO }), h('div', { style: S.hint }, t('repoHint'))),
    h('div', { style: S.field }, h('label', { style: S.label }, t('ref')), input('ref', { fallback: 'main' }), h('div', { style: S.hint }, t('refHint'))),
    h('div', { style: S.field }, h('label', { style: S.label }, t('runtimeDir')), input('runtimeDir', { placeholder: '~/.dsh/sensenova-skills' }), h('div', { style: S.hint }, t('runtimeHint'))),
    h('div', { style: S.field }, h('label', { style: S.label }, t('linkDir')), input('linkDir', { placeholder: '~/.dsh/skills' }), h('div', { style: S.hint }, t('linkHint'))),

    /* ② 凭据 */
    h('div', { style: S.h2 }, t('envTitle')),
    h('div', { style: S.hint }, t('envHint')),
    h('div', { style: S.field },
      h('label', { style: S.label },
        t('mainKey'),
        ' · ',
        h('span', { style: S.tag }, envKeys.SN_API_KEY?.configured ? t('configured') : t('notConfigured')),
      ),
      h('input', {
        style: S.input, type: 'password',
        value: envDraft.SN_API_KEY ?? '',
        placeholder: 'sk-…',
        onChange: (e) => { setMsg(null); setEnvDraft((d) => ({ ...d, SN_API_KEY: e.target.value })); },
      }),
      h('div', { style: S.hint }, t('mainKeyHint')),
    ),
    h('div', { style: S.row },
      h('button', {
        style: { ...S.secondary, marginRight: 4 },
        disabled: busy,
        onClick: () => setShowAdvanced((v) => !v),
      }, showAdvanced ? t('hideAdvanced') : t('showAdvanced')),
      h('button', { style: S.secondary, disabled: busy || !envDraft.SN_API_KEY, onClick: saveEnv }, t('save')),
      config.envFile ? h('span', { style: S.hint }, config.envFile) : null,
    ),
    showAdvanced ? h('div', null,
      h('div', { style: { ...S.hint, marginTop: 14 } }, t('advancedHint')),
      ...COMMON_ENV_KEYS.filter(([key]) => key !== 'SN_API_KEY').map(([key, label, hint, secret, fallback]) => {
        const known = envKeys[key]?.configured === true;
        const current = envDraft[key] ?? known ? envDraft[key] : fallback;
        return h('div', { style: S.field, key },
          h('label', { style: S.label },
            label,
            h('code', { style: { fontSize: 11, opacity: 0.6 } }, key),
            ' · ',
            h('span', { style: S.tag }, known && !secret ? (envDraft[key] ?? '已设') : (known ? t('configured') : t('notConfigured'))),
          ),
          h('input', {
            style: S.input,
            type: secret ? 'password' : 'text',
            value: current ?? '',
            placeholder: known ? '••••••••（留空保持不变）' : (hint || key),
            onChange: (e) => { setMsg(null); setEnvDraft((d) => ({ ...d, [key]: e.target.value })); },
          }),
        );
      }),
    ) : null,

    /* ③ 开关 */
    h('div', { style: S.h2 }, t('skillsTitle')),
    h('div', { style: S.hint }, t('skillsHint')),
    h('div', { style: S.row },
      h('button', { style: styles_secondary(), disabled: busy, onClick: () => setAll(true) }, t('enableAll')),
      h('button', { style: styles_secondary(), disabled: busy, onClick: () => setAll(false) }, t('disableAll')),
      h('span', { style: S.hint }, t('enabledCount')(onCount, index.length)),
    ),
    index.length === 0
      ? h('p', { style: S.hint }, t('loadFailed'))
      : h('div', { style: S.list },
        ...index.map((s) => h('label', { style: S.item, key: s.name },
          h('input', {
            type: 'checkbox', checked: isOn(s.name), disabled: busy,
            style: { marginTop: 2 },
            onChange: (e) => toggle(s.name, e.target.checked),
          }),
          h('div', null,
            h('div', { style: S.itemName }, s.name),
            h('div', { style: S.itemDesc }, (s.description ?? '').slice(0, 160)),
          ),
        )),
      ),

    h('div', { style: { ...S.row, marginTop: 18 } },
      h('button', { style: S.primary, disabled: busy || Object.keys(draft).length === 0, onClick: save }, busy ? t('saving') : t('save')),
      h('button', { style: S.secondary, disabled: busy, onClick: sync }, busy ? t('syncing') : t('sync')),
    ),
    msg ? h('p', { style: msg.kind === 'ok' ? S.ok : S.err }, msg.text) : null,
  );
}

function styles_secondary() {
  return S.secondary;
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
