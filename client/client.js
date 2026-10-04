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
  sync: "skills.sync"
});

// client/index.jsx
var name = "dsh-sensenova-skills";
var inject = ["slots", "connection", "locale"];
var NS = "sensenova-skills";
var DEFAULT_REPO = "https://github.com/OpenSenseNova/SenseNova-Skills.git";
var zh = {
  section: "SenseNova Skills",
  title: "SenseNova Skills",
  subtitle: "\u5B98\u65B9\u6280\u80FD\u6865\uFF1A\u5728\u8FD0\u884C\u65F6\u4ECE SenseNova-Skills \u4ED3\u5E93\u62C9\u53D6 36 \u4E2A MIT \u8BB8\u53EF\u6280\u80FD\uFF0C\u968F\u4E0A\u6E38\u66F4\u65B0\u540C\u6B65\u3002",
  repoURL: "\u4E0A\u6E38\u4ED3\u5E93 URL",
  repoHint: "git \u4ED3\u5E93\u5730\u5740\uFF1B\u9ED8\u8BA4\u5B98\u65B9 SenseNova-Skills\u3002",
  ref: "Git ref",
  refHint: "\u5206\u652F / tag / \u5B8C\u6574 commit hash\u3002",
  runtimeDir: "\u8FD0\u884C\u65F6\u76EE\u5F55",
  runtimeHint: "\u7559\u7A7A\u5219\u4F7F\u7528 ~/.dsh/profiles/<\u5F53\u524D profile>/sensenova-skills\u3002",
  save: "\u4FDD\u5B58",
  saving: "\u4FDD\u5B58\u4E2D\u2026",
  saved: "\u5DF2\u4FDD\u5B58\u3002",
  sync: "\u7ACB\u5373\u540C\u6B65",
  syncing: "\u540C\u6B65\u4E2D\u2026",
  synced: (n) => `\u5DF2\u540C\u6B65 ${n} \u4E2A\u6280\u80FD\u3002`,
  neverSynced: "\u5C1A\u672A\u540C\u6B65\u3002",
  failed: "\u64CD\u4F5C\u5931\u8D25\u3002",
  loading: "\u52A0\u8F7D\u4E2D\u2026",
  loadFailed: "\u65E0\u6CD5\u8BFB\u53D6\u914D\u7F6E\u3002"
};
var en = {
  section: "SenseNova Skills",
  title: "SenseNova Skills",
  subtitle: "Official skills bridge: pulls 36 MIT-licensed skills from the SenseNova-Skills repo at runtime and follows upstream.",
  repoURL: "Upstream repo URL",
  repoHint: "Git repository URL; defaults to the official SenseNova-Skills repo.",
  ref: "Git ref",
  refHint: "Branch / tag / full commit hash.",
  runtimeDir: "Runtime directory",
  runtimeHint: "Leave empty to use ~/.dsh/profiles/<current profile>/sensenova-skills.",
  save: "Save",
  saving: "Saving\u2026",
  saved: "Saved.",
  sync: "Sync now",
  syncing: "Syncing\u2026",
  synced: (n) => `Synced ${n} skills.`,
  neverSynced: "Never synced.",
  failed: "Operation failed.",
  loading: "Loading\u2026",
  loadFailed: "Could not read the configuration."
};
var styles = {
  card: { maxWidth: 560 },
  field: { display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 },
  label: { fontSize: 13 },
  hint: { fontSize: 12, opacity: 0.65, lineHeight: 1.4 },
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
  row: { display: "flex", alignItems: "center", gap: 8, marginTop: 4 },
  primary: {
    font: "inherit",
    cursor: "pointer",
    border: "none",
    height: 36,
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
    height: 36,
    padding: "0 16px",
    borderRadius: 999,
    fontSize: 13,
    border: "1px solid var(--dsw-alias-border-l2, #d1d5db)",
    background: "transparent",
    color: "var(--dsw-alias-label-primary, inherit)"
  },
  ok: { fontSize: 12, color: "var(--dsw-alias-state-success-primary, #34c759)" },
  err: { fontSize: 12, color: "var(--dsw-alias-state-error-primary, #ff3b30)", whiteSpace: "pre-wrap" },
  box: {
    margin: "4px 0 14px",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid var(--dsw-alias-border-l3, #eef0f4)",
    background: "var(--dsw-alias-bg-layer-2, #fafbfc)",
    fontSize: 12,
    opacity: 0.8,
    lineHeight: 1.5
  }
};
function SenseNovaSkillsSettingsTab({ rpcCall, t }) {
  const [config, setConfig] = (0, import_react.useState)(null);
  const [error, setError] = (0, import_react.useState)(null);
  const [draft, setDraft] = (0, import_react.useState)({});
  const [saving, setSaving] = (0, import_react.useState)(false);
  const [syncing, setSyncing] = (0, import_react.useState)(false);
  const [msg, setMsg] = (0, import_react.useState)(null);
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
  if (error) return (0, import_react.createElement)("p", { style: styles.err }, error);
  if (config === null) return (0, import_react.createElement)("p", { style: styles.hint }, t("loading"));
  const field = (key, fallback) => key in draft ? draft[key] : config[key] ?? fallback;
  const set = (key, value) => {
    setMsg(null);
    setDraft((d) => ({ ...d, [key]: value }));
  };
  const dirty = Object.keys(draft).length > 0;
  const save = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const updates = { ...draft };
      const res = await rpcCall(SENSENOVA_SKILLS_ENDPOINTS.setConfig, { updates });
      if (res && res.ok === true) {
        setConfig(res.value ?? {});
        setDraft({});
        setMsg({ kind: "ok", text: t("saved") });
      } else setMsg({ kind: "err", text: res?.error?.message ?? t("failed") });
    } catch (e) {
      setMsg({ kind: "err", text: e?.message ?? t("failed") });
    } finally {
      setSaving(false);
    }
  };
  const sync = async () => {
    setSyncing(true);
    setMsg(null);
    try {
      if (dirty) {
        const saved = await rpcCall(SENSENOVA_SKILLS_ENDPOINTS.setConfig, { updates: { ...draft } });
        if (saved && saved.ok === true) {
          setConfig(saved.value ?? {});
          setDraft({});
        }
      }
      const res = await rpcCall(SENSENOVA_SKILLS_ENDPOINTS.sync, {});
      if (res && res.ok === true) {
        setConfig(res.value ?? {});
        const n = res.value?.skillsCount;
        setMsg({ kind: "ok", text: typeof n === "number" ? t("synced")(n) : t("saved") });
      } else setMsg({ kind: "err", text: res?.error?.message ?? t("failed") });
    } catch (e) {
      setMsg({ kind: "err", text: e?.message ?? t("failed") });
    } finally {
      setSyncing(false);
    }
  };
  const status = config.syncedAt ? t("synced")(config.skillsCount ?? "?") : t("neverSynced");
  return (0, import_react.createElement)(
    "div",
    { style: styles.card },
    (0, import_react.createElement)("p", { style: { ...styles.hint, margin: "0 0 12px" } }, t("subtitle")),
    (0, import_react.createElement)(
      "div",
      { style: styles.field },
      (0, import_react.createElement)("label", { style: styles.label }, t("repoURL")),
      (0, import_react.createElement)("input", {
        style: styles.input,
        value: field("repoURL", DEFAULT_REPO),
        onChange: (e) => set("repoURL", e.target.value)
      }),
      (0, import_react.createElement)("div", { style: styles.hint }, t("repoHint"))
    ),
    (0, import_react.createElement)(
      "div",
      { style: styles.field },
      (0, import_react.createElement)("label", { style: styles.label }, t("ref")),
      (0, import_react.createElement)("input", {
        style: styles.input,
        value: field("ref", "main"),
        onChange: (e) => set("ref", e.target.value)
      }),
      (0, import_react.createElement)("div", { style: styles.hint }, t("refHint"))
    ),
    (0, import_react.createElement)(
      "div",
      { style: styles.field },
      (0, import_react.createElement)("label", { style: styles.label }, t("runtimeDir")),
      (0, import_react.createElement)("input", {
        style: styles.input,
        value: field("runtimeDir", ""),
        placeholder: "~/.dsh/profiles/<profile>/sensenova-skills",
        onChange: (e) => set("runtimeDir", e.target.value)
      }),
      (0, import_react.createElement)("div", { style: styles.hint }, t("runtimeHint"))
    ),
    (0, import_react.createElement)("div", { style: styles.box }, status),
    (0, import_react.createElement)(
      "div",
      { style: styles.row },
      (0, import_react.createElement)(
        "button",
        { style: styles.primary, disabled: saving || !dirty, onClick: save },
        saving ? t("saving") : t("save")
      ),
      (0, import_react.createElement)(
        "button",
        { style: styles.secondary, disabled: syncing || saving, onClick: sync },
        syncing ? t("syncing") : t("sync")
      )
    ),
    msg ? (0, import_react.createElement)("p", { style: msg.kind === "ok" ? styles.ok : styles.err }, msg.text) : null
  );
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
