window.__ModuleLoader__.load({
  id: "dsh-sensenova-skills",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    var React = require("react");
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// client/index.jsx
var index_exports = {};
__export(index_exports, {
  apply: () => apply,
  inject: () => inject,
  name: () => name
});
module.exports = __toCommonJS(index_exports);
var import_react = require("react");

// client/api.js
var SENSENOVA_SKILLS_RPC_CHANNEL = "/dsh-sensenova-skills";
var SENSENOVA_SKILLS_ENDPOINTS = Object.freeze({
  getConfig: "skills.getConfig",
  setConfig: "skills.setConfig",
  status: "skills.status",
  sync: "skills.sync",
  listSkills: "skills.list",
  setSkillEnabled: "skills.setEnabled",
  setEnv: "skills.setEnv"
});
var COMMON_ENV_KEYS = Object.freeze([
  ["SN_API_KEY", "SenseNova API Key", "\u591A\u6570 sn-* skill \u7684\u7EDF\u4E00\u51ED\u636E", true],
  ["SN_BASE_URL", "SenseNova Base URL", "\u9ED8\u8BA4 https://token.sensenova.cn/v1", false],
  ["SN_IMAGE_GEN_API_KEY", "\u6587\u751F\u56FE API Key", "sn-infographic / sn-image-* \u4F7F\u7528", true],
  ["SN_IMAGE_GEN_BASE_URL", "\u6587\u751F\u56FE Base URL", "", false],
  ["SN_CHAT_API_KEY", "\u5BF9\u8BDD/\u6587\u672C API Key", "sn-* \u9700\u8981 LLM \u65F6\u4F7F\u7528", true],
  ["SN_CHAT_BASE_URL", "\u5BF9\u8BDD/\u6587\u672C Base URL", "", false],
  ["SN_VISION_API_KEY", "\u89C6\u89C9\u7406\u89E3 API Key", "sn-image-caption / sn-da-image-caption \u4F7F\u7528", true],
  ["SN_VISION_BASE_URL", "\u89C6\u89C9\u7406\u89E3 Base URL", "", false],
  ["SERPER_API_KEY", "Serper \u641C\u7D22 Key", "sn-search-image / sn-search-academic \u4F7F\u7528", true],
  ["GITHUB_TOKEN", "GitHub Token", "sn-search-code \u4F7F\u7528\uFF0C\u53EF\u63D0\u901F\u5E76\u63D0\u9AD8\u9650\u989D", true]
]);

// client/index.jsx
var name = "dsh-sensenova-skills";
var inject = ["slots", "connection", "locale"];
var NS = "sensenova-skills";
var DEFAULT_REPO = "https://github.com/OpenSenseNova/SenseNova-Skills";
var zh = {
  section: "SenseNova Skills",
  loading: "\u52A0\u8F7D\u4E2D\u2026",
  loadFailed: "\u65E0\u6CD5\u8BFB\u53D6\u914D\u7F6E\u3002",
  repoTitle: "\u4ED3\u5E93\u4E0E\u6302\u8F7D",
  repoURL: "\u4E0A\u6E38\u4ED3\u5E93 URL",
  repoHint: "git \u4ED3\u5E93\u5730\u5740\uFF1B\u9ED8\u8BA4\u5B98\u65B9 SenseNova-Skills\u3002",
  ref: "Git ref",
  refHint: "\u5206\u652F / tag / commit\u3002",
  runtimeDir: "\u5FEB\u7167\u76EE\u5F55",
  runtimeHint: "\u4E0A\u6E38\u5FEB\u7167\u5B58\u653E\u4F4D\u7F6E\uFF1B\u7559\u7A7A\u4F7F\u7528 ~/.dsh/sensenova-skills\u3002",
  linkDir: "\u6302\u8F7D\u76EE\u5F55",
  linkHint: "\u6BCF\u4E2A skill \u4F1A\u4EE5\u7B26\u53F7\u94FE\u63A5\u6302\u5230\u8FD9\u91CC\u3002\u5FC5\u987B\u662F DSH \u626B\u63CF\u7684\u76EE\u5F55\uFF0C\u5426\u5219 skill \u4E0D\u751F\u6548\u3002\u7559\u7A7A\u4F7F\u7528 ~/.dsh/skills\u3002",
  envTitle: "API \u51ED\u636E\u4E0E\u73AF\u5883\u53D8\u91CF",
  envHint: "\u5199\u5165 ~/.dsh/sensenova-skills/.env\uFF08\u6743\u9650 600\uFF09\uFF0Cskill \u811A\u672C\u4E0E agent \u53EF source\u3002\u503C\u4E0D\u56DE\u663E\uFF0C\u7559\u7A7A\u5373\u6E05\u9664\u3002",
  configured: "\u5DF2\u914D\u7F6E",
  notConfigured: "\u672A\u914D\u7F6E",
  skillsTitle: "Skills \u5F00\u5173",
  skillsHint: "\u5173\u95ED\u7684 skill \u4E0D\u4F1A\u6302\u8F7D\uFF0C\u56E0\u6B64\u4E0D\u4F1A\u8FDB\u5165\u4F1A\u8BDD\u76EE\u5F55\u3002",
  enableAll: "\u5168\u5F00",
  disableAll: "\u5168\u5173",
  enabledCount: (on, total) => `\u5DF2\u542F\u7528 ${on} / ${total}`,
  save: "\u4FDD\u5B58",
  saving: "\u4FDD\u5B58\u4E2D\u2026",
  saved: "\u5DF2\u4FDD\u5B58\u3002",
  sync: "\u7ACB\u5373\u540C\u6B65",
  syncing: "\u540C\u6B65\u4E2D\u2026",
  syncDone: (on, total) => `\u540C\u6B65\u5B8C\u6210\uFF0C\u5DF2\u6302\u8F7D ${on} / ${total} \u4E2A skill\u3002`,
  failed: "\u64CD\u4F5C\u5931\u8D25\u3002"
};
var en = {
  section: "SenseNova Skills",
  loading: "Loading\u2026",
  loadFailed: "Could not read the configuration.",
  repoTitle: "Repository and mount",
  repoURL: "Upstream repo URL",
  repoHint: "Git repository URL; defaults to the official SenseNova-Skills repo.",
  ref: "Git ref",
  refHint: "Branch / tag / commit.",
  runtimeDir: "Snapshot directory",
  runtimeHint: "Where the upstream snapshot lands. Leave empty for ~/.dsh/sensenova-skills.",
  linkDir: "Mount directory",
  linkHint: "Each skill is symlinked here. It must be a scanned DSH root or the skills will not take effect. Leave empty for ~/.dsh/skills.",
  envTitle: "API credentials and environment",
  envHint: "Written to ~/.dsh/sensenova-skills/.env (mode 600) for skill scripts and the agent to source. Values are never echoed back; empty clears the key.",
  configured: "configured",
  notConfigured: "not set",
  skillsTitle: "Skill toggles",
  skillsHint: "A disabled skill is not mounted, so it never enters the session catalog.",
  enableAll: "Enable all",
  disableAll: "Disable all",
  enabledCount: (on, total) => `${on} / ${total} enabled`,
  save: "Save",
  saving: "Saving\u2026",
  saved: "Saved.",
  sync: "Sync now",
  syncing: "Syncing\u2026",
  syncDone: (on, total) => `Synced. ${on} / ${total} skills mounted.`,
  failed: "Operation failed."
};
var S = {
  h2: { fontSize: 14, fontWeight: 600, margin: "20px 0 4px" },
  hint: { fontSize: 12, opacity: 0.65, lineHeight: 1.45, marginBottom: 10 },
  field: { display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 },
  label: { fontSize: 13, display: "flex", alignItems: "center", gap: 6 },
  input: {
    border: "1px solid var(--dsw-alias-border-l2, #d1d5db)",
    background: "var(--dsw-alias-bg-layer-3, #fff)",
    color: "var(--dsw-alias-label-primary, inherit)",
    borderRadius: 8,
    padding: "8px 10px",
    fontSize: 13,
    height: 36,
    boxSizing: "border-box",
    width: "100%"
  },
  row: { display: "flex", alignItems: "center", gap: 8, marginTop: 4, flexWrap: "wrap" },
  primary: {
    font: "inherit",
    cursor: "pointer",
    border: "none",
    height: 34,
    padding: "0 16px",
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 500,
    background: "var(--dsw-alias-button-primary-fill, #4f6ef7)",
    color: "var(--dsw-alias-label-primary-foreground, #fff)"
  },
  secondary: {
    font: "inherit",
    cursor: "pointer",
    height: 34,
    padding: "0 14px",
    borderRadius: 999,
    fontSize: 13,
    border: "1px solid var(--dsw-alias-border-l2, #d1d5db)",
    background: "transparent",
    color: "var(--dsw-alias-label-primary, inherit)"
  },
  ok: { fontSize: 12, color: "var(--dsw-alias-state-success-primary, #34c759)" },
  err: { fontSize: 12, color: "var(--dsw-alias-state-error-primary, #ff3b30)", whiteSpace: "pre-wrap" },
  list: { maxHeight: 300, overflowY: "auto", border: "1px solid var(--dsw-alias-border-l3, #eef0f4)", borderRadius: 8, padding: "4px 10px" },
  item: { display: "flex", gap: 8, alignItems: "flex-start", padding: "7px 0", borderBottom: "1px solid var(--dsw-alias-border-l3, #f2f3f6)" },
  itemName: { fontSize: 13, fontWeight: 500 },
  itemDesc: { fontSize: 11, opacity: 0.6, lineHeight: 1.4, marginTop: 2 },
  tag: { fontSize: 11, opacity: 0.75, border: "1px solid var(--dsw-alias-border-l2, #d1d5db)", borderRadius: 999, padding: "0 7px", height: 18, display: "inline-flex", alignItems: "center" }
};
function SenseNovaSkillsSettingsTab({ rpcCall, t }) {
  const [config, setConfig] = (0, import_react.useState)(null);
  const [error, setError] = (0, import_react.useState)(null);
  const [draft, setDraft] = (0, import_react.useState)({});
  const [envDraft, setEnvDraft] = (0, import_react.useState)({});
  const [busy, setBusy] = (0, import_react.useState)(false);
  const [msg, setMsg] = (0, import_react.useState)(null);
  const apply2 = (res) => {
    if (res && res.ok === true) {
      setConfig(res.value ?? {});
      setDraft({});
      setEnvDraft({});
      return true;
    }
    setMsg({ kind: "err", text: res?.error?.message ?? t("failed") });
    return false;
  };
  (0, import_react.useEffect)(() => {
    let alive = true;
    rpcCall(SENSENOVA_SKILLS_ENDPOINTS.getConfig, {}).then((res) => {
      if (!alive) return;
      if (res && res.ok === true) setConfig(res.value ?? {});
      else setError(t("loadFailed"));
    }).catch((e) => {
      if (alive) setError(e?.message ?? t("loadFailed"));
    });
    return () => {
      alive = false;
    };
  }, []);
  if (error) return (0, import_react.createElement)("p", { style: S.err }, error);
  if (config === null) return (0, import_react.createElement)("p", { style: S.hint }, t("loading"));
  const envKeys = config.envKeys ?? {};
  const index = config.skillsIndex ?? [];
  const disabledMap = config.enabled ?? {};
  const f = (key, fallback = "") => key in draft ? draft[key] : config[key] ?? fallback;
  const setF = (key, value) => {
    setMsg(null);
    setDraft((d) => ({ ...d, [key]: value }));
  };
  const isOn = (n) => !(n in disabledMap) || disabledMap[n] !== false;
  const onCount = index.filter((s) => isOn(s.name)).length;
  const toggle = async (skillName, enable) => {
    setMsg(null);
    const res = await rpcCall(SENSENOVA_SKILLS_ENDPOINTS.setSkillEnabled, { name: skillName, enabled: enable });
    if (res && res.ok === true) setConfig(res.value ?? {});
    else setMsg({ kind: "err", text: res?.error?.message ?? t("failed") });
  };
  const setAll = async (enable) => {
    setMsg(null);
    const next = {};
    if (!enable) for (const s of index) next[s.name] = false;
    setBusy(true);
    const res = await rpcCall(SENSENOVA_SKILLS_ENDPOINTS.setConfig, { updates: { enabled: next } });
    setBusy(false);
    if (res && res.ok === true) setConfig(res.value ?? {});
    else setMsg({ kind: "err", text: res?.error?.message ?? t("failed") });
  };
  const saveEnv = async () => {
    const values = {};
    for (const [k, v] of Object.entries(envDraft)) values[k] = v;
    if (Object.keys(values).length === 0) {
      setMsg({ kind: "ok", text: t("saved") });
      return;
    }
    setBusy(true);
    setMsg(null);
    const res = await rpcCall(SENSENOVA_SKILLS_ENDPOINTS.setEnv, { values });
    setBusy(false);
    if (apply2(res)) setMsg({ kind: "ok", text: t("saved") });
  };
  const save = async () => {
    setBusy(true);
    setMsg(null);
    const res = await rpcCall(SENSENOVA_SKILLS_ENDPOINTS.setConfig, { updates: { ...draft } });
    setBusy(false);
    if (apply2(res)) setMsg({ kind: "ok", text: t("saved") });
  };
  const sync = async () => {
    setBusy(true);
    setMsg(null);
    if (Object.keys(draft).length > 0) {
      const saved = await rpcCall(SENSENOVA_SKILLS_ENDPOINTS.setConfig, { updates: { ...draft } });
      if (saved && saved.ok === true) setConfig(saved.value ?? {});
    }
    const res = await rpcCall(SENSENOVA_SKILLS_ENDPOINTS.sync, {});
    setBusy(false);
    if (res && res.ok === true) {
      setConfig(res.value ?? {});
      setDraft({});
      const total = (res.value?.skillsIndex ?? []).length;
      const off = Object.keys(res.value?.enabled ?? {}).filter((k) => res.value.enabled[k] === false).length;
      setMsg({ kind: "ok", text: t("syncDone")(total - off, total) });
    } else setMsg({ kind: "err", text: res?.error?.message ?? t("failed") });
  };
  const input = (key, opts) => (0, import_react.createElement)("input", {
    style: S.input,
    value: f(key, opts.fallback ?? ""),
    placeholder: opts.placeholder ?? "",
    type: opts.type ?? "text",
    onChange: (e) => setF(key, e.target.value)
  });
  return (0, import_react.createElement)(
    "div",
    { style: { maxWidth: 620 } },
    /* ① 仓库与挂载 */
    (0, import_react.createElement)("div", { style: S.h2 }, t("repoTitle")),
    (0, import_react.createElement)("div", { style: S.field }, (0, import_react.createElement)("label", { style: S.label }, t("repoURL")), input("repoURL", { fallback: DEFAULT_REPO }), (0, import_react.createElement)("div", { style: S.hint }, t("repoHint"))),
    (0, import_react.createElement)("div", { style: S.field }, (0, import_react.createElement)("label", { style: S.label }, t("ref")), input("ref", { fallback: "main" }), (0, import_react.createElement)("div", { style: S.hint }, t("refHint"))),
    (0, import_react.createElement)("div", { style: S.field }, (0, import_react.createElement)("label", { style: S.label }, t("runtimeDir")), input("runtimeDir", { placeholder: "~/.dsh/sensenova-skills" }), (0, import_react.createElement)("div", { style: S.hint }, t("runtimeHint"))),
    (0, import_react.createElement)("div", { style: S.field }, (0, import_react.createElement)("label", { style: S.label }, t("linkDir")), input("linkDir", { placeholder: "~/.dsh/skills" }), (0, import_react.createElement)("div", { style: S.hint }, t("linkHint"))),
    /* ② 凭据 */
    (0, import_react.createElement)("div", { style: S.h2 }, t("envTitle")),
    (0, import_react.createElement)("div", { style: S.hint }, t("envHint")),
    ...COMMON_ENV_KEYS.map(([key, label, hint, secret]) => {
      const known = envKeys[key]?.configured === true;
      return (0, import_react.createElement)(
        "div",
        { style: S.field, key },
        (0, import_react.createElement)(
          "label",
          { style: S.label },
          label,
          " \xB7 ",
          (0, import_react.createElement)("span", { style: S.tag }, known ? t("configured") : t("notConfigured"))
        ),
        (0, import_react.createElement)("input", {
          style: S.input,
          type: secret ? "password" : "text",
          value: envDraft[key] ?? "",
          placeholder: known ? "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\uFF08\u7559\u7A7A\u4FDD\u6301\u4E0D\u53D8\uFF09" : hint || key,
          onChange: (e) => {
            setMsg(null);
            setEnvDraft((d) => ({ ...d, [key]: e.target.value }));
          }
        })
      );
    }),
    (0, import_react.createElement)(
      "div",
      { style: S.row },
      (0, import_react.createElement)("button", { style: styles_secondary(), disabled: busy || Object.keys(envDraft).length === 0, onClick: saveEnv }, t("save")),
      (0, import_react.createElement)("span", { style: S.hint }, config.envFile ? config.envFile : "")
    ),
    /* ③ 开关 */
    (0, import_react.createElement)("div", { style: S.h2 }, t("skillsTitle")),
    (0, import_react.createElement)("div", { style: S.hint }, t("skillsHint")),
    (0, import_react.createElement)(
      "div",
      { style: S.row },
      (0, import_react.createElement)("button", { style: styles_secondary(), disabled: busy, onClick: () => setAll(true) }, t("enableAll")),
      (0, import_react.createElement)("button", { style: styles_secondary(), disabled: busy, onClick: () => setAll(false) }, t("disableAll")),
      (0, import_react.createElement)("span", { style: S.hint }, t("enabledCount")(onCount, index.length))
    ),
    index.length === 0 ? (0, import_react.createElement)("p", { style: S.hint }, t("loadFailed")) : (0, import_react.createElement)(
      "div",
      { style: S.list },
      ...index.map((s) => (0, import_react.createElement)(
        "label",
        { style: S.item, key: s.name },
        (0, import_react.createElement)("input", {
          type: "checkbox",
          checked: isOn(s.name),
          disabled: busy,
          style: { marginTop: 2 },
          onChange: (e) => toggle(s.name, e.target.checked)
        }),
        (0, import_react.createElement)(
          "div",
          null,
          (0, import_react.createElement)("div", { style: S.itemName }, s.name),
          (0, import_react.createElement)("div", { style: S.itemDesc }, (s.description ?? "").slice(0, 160))
        )
      ))
    ),
    (0, import_react.createElement)(
      "div",
      { style: { ...S.row, marginTop: 18 } },
      (0, import_react.createElement)("button", { style: S.primary, disabled: busy || Object.keys(draft).length === 0, onClick: save }, busy ? t("saving") : t("save")),
      (0, import_react.createElement)("button", { style: S.secondary, disabled: busy, onClick: sync }, busy ? t("syncing") : t("sync"))
    ),
    msg ? (0, import_react.createElement)("p", { style: msg.kind === "ok" ? S.ok : S.err }, msg.text) : null
  );
}
function styles_secondary() {
  return S.secondary;
}
function apply(ctx) {
  const rpcCall = (endpoint, payload, signal) => ctx.connection.rpc.call(SENSENOVA_SKILLS_RPC_CHANNEL, endpoint, payload, signal);
  const translate = ctx.locale.bind(NS);
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), "dsh-sensenova-skills: locale dictionaries");
  ctx.slots.inject(
    "settings.section",
    () => ctx.slots.register(
      {
        name: "settings.section",
        id: "sensenova-skills",
        order: 41,
        label: () => translate("section"),
        inject: () => ({ rpcCall, t: translate })
      },
      SenseNovaSkillsSettingsTab
    )
  );
}

    return module.exports;
  }
});
