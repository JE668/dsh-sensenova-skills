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
  default: () => index_default,
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
function redactConfig(c) {
  return {
    repoURL: c?.repoURL ?? "",
    ref: c?.ref ?? "main",
    runtimeDir: c?.runtimeDir ?? "",
    syncedAt: c?.syncedAt ?? null,
    skillsCount: c?.skillsCount ?? null,
    via: c?.via ?? null
  };
}

// client/index.jsx
var name = "dsh-sensenova-skills";
var inject = ["slots", "connection", "locale"];
var NS = "sensenova-skills";
var DICT = {
  zh: {
    section: "SenseNova Skills",
    title: "SenseNova Skills",
    subtitle: "\u6865\u63A5 OpenSenseNova/SenseNova-Skills\uFF08MIT\uFF09\u5B98\u65B9 agent skills\u3002",
    repoURL: "\u4E0A\u6E38\u4ED3\u5E93 URL",
    ref: "\u8DDF\u8E2A ref\uFF08\u5206\u652F / tag / commit\uFF09",
    runtimeDir: "\u8FD0\u884C\u65F6\u76EE\u5F55",
    runtimeDirHint: "\u7559\u7A7A\u4F7F\u7528\u9ED8\u8BA4 ~/.dsh/sensenova-skills",
    syncNow: "\u7ACB\u5373\u540C\u6B65",
    syncOk: "\u540C\u6B65\u6210\u529F",
    syncErr: "\u540C\u6B65\u5931\u8D25",
    save: "\u4FDD\u5B58\u914D\u7F6E",
    status: "\u540C\u6B65\u72B6\u6001",
    notSynced: "\u5C1A\u672A\u540C\u6B65\u3002\u70B9\u51FB\u4E0A\u65B9\u300C\u7ACB\u5373\u540C\u6B65\u300D\u62C9\u53D6\u4E0A\u6E38 skills\u3002",
    skills: "\u4E2A skill",
    via: "\u540C\u6B65\u65B9\u5F0F"
  },
  en: {
    section: "SenseNova Skills",
    title: "SenseNova Skills",
    subtitle: "Bridges OpenSenseNova/SenseNova-Skills (MIT) agent skills.",
    repoURL: "Upstream repo URL",
    ref: "Track ref (branch / tag / commit)",
    runtimeDir: "Runtime directory",
    runtimeDirHint: "Leave empty to use default ~/.dsh/sensenova-skills",
    syncNow: "Sync now",
    syncOk: "Synced",
    syncErr: "Sync failed",
    save: "Save config",
    status: "Sync status",
    notSynced: 'Not synced. Click "Sync now" to pull upstream skills.',
    skills: "skills",
    via: "via"
  }
};
var styles = {
  card: { background: "var(--dsw-alias-bg-layer-1,#fff)", border: "1px solid var(--dsw-alias-border-l2,#e5e7eb)", borderRadius: 12, padding: "16px 20px", maxWidth: 480 },
  field: { display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 },
  label: { fontSize: 13, color: "var(--dsw-alias-label-primary,inherit)" },
  hint: { fontSize: 12, color: "var(--dsw-alias-label-tertiary,#8b93a1)", lineHeight: 1.4 },
  input: { border: "1px solid var(--dsw-alias-border-l2,#d1d5db)", background: "var(--dsw-alias-bg-layer-3,#fff)", borderRadius: 8, padding: "8px 10px", fontSize: 13, color: "var(--dsw-alias-label-primary,inherit)", height: 36, boxSizing: "border-box", width: "100%" },
  row: { display: "flex", alignItems: "center", gap: 8, marginTop: 4, flexWrap: "wrap" },
  btn: { font: "inherit", cursor: "pointer", border: "1px solid var(--dsw-alias-button-ghost-active-border, var(--dsw-alias-border-l2,#d1d5db))", background: "var(--dsw-alias-bg-layer-1,#fff)", color: "var(--dsw-alias-label-primary,inherit)", height: 36, padding: "0 16px", borderRadius: 999, fontSize: 13, display: "inline-flex", alignItems: "center", justifyContent: "center" },
  primary: { font: "inherit", cursor: "pointer", border: "none", background: "var(--dsw-alias-button-primary-fill, var(--dsw-alias-brand-primary,#4f6ef7))", color: "var(--dsw-alias-label-primary-foreground, #fff)", height: 36, padding: "0 16px", borderRadius: 999, fontSize: 13, fontWeight: 500, display: "inline-flex", alignItems: "center", justifyContent: "center" },
  ok: { color: "var(--dsw-alias-state-success-primary,#34c759)", fontSize: 12 },
  err: { color: "var(--dsw-alias-state-error-primary,#ff3b30)", fontSize: 12, whiteSpace: "pre-wrap" },
  block: { borderTop: "1px solid var(--dsw-alias-border-l2,#e5e7eb)", marginTop: 16, paddingTop: 16 },
  statusCard: { background: "var(--dsw-alias-bg-layer-3,#f8f9fa)", border: "1px solid var(--dsw-alias-border-l2,#e5e7eb)", borderRadius: 10, padding: "10px 14px", fontSize: 13 }
};
function SkillsSettingsTab({ rpcCall, t }) {
  const [cfg, setCfg] = (0, import_react.useState)(null);
  const [draft, setDraft] = (0, import_react.useState)(null);
  const [busy, setBusy] = (0, import_react.useState)(false);
  const [msg, setMsg] = (0, import_react.useState)(null);
  const [status, setStatus] = (0, import_react.useState)(null);
  const call = async (endpoint, payload) => {
    const res = await rpcCall(endpoint, payload);
    if (!res?.ok) throw new Error(res?.error?.message ?? "RPC failed");
    return res.value;
  };
  const load = async () => {
    try {
      const [c, s] = await Promise.all([
        call(SENSENOVA_SKILLS_ENDPOINTS.getConfig, {}),
        call(SENSENOVA_SKILLS_ENDPOINTS.status, {}).catch(() => null)
      ]);
      const view = redactConfig(c);
      setCfg(view);
      setDraft({ ...view });
      setStatus(s);
    } catch (e) {
      setMsg({ kind: "err", text: String(e?.message ?? e) });
    }
  };
  (0, import_react.useEffect)(() => {
    load();
  }, []);
  const set = (key, value) => setDraft((d) => ({ ...d, [key]: value }));
  const save = async () => {
    if (!draft) return;
    setBusy(true);
    setMsg(null);
    try {
      const payload = {};
      if (draft.repoURL !== void 0) payload.repoURL = String(draft.repoURL || "").trim();
      if (draft.ref !== void 0) payload.ref = String(draft.ref || "main").trim();
      if (draft.runtimeDir !== void 0) payload.runtimeDir = String(draft.runtimeDir || "").trim();
      await call(SENSENOVA_SKILLS_ENDPOINTS.setConfig, payload);
      setMsg({ kind: "ok", text: "\u5DF2\u4FDD\u5B58\u3002\u91CD\u542F DSH \u6216\u5237\u65B0\u4F1A\u8BDD\u540E\u751F\u6548\u3002" });
      const c = await call(SENSENOVA_SKILLS_ENDPOINTS.getConfig, {});
      setCfg(redactConfig(c));
      setDraft(redactConfig(c));
    } catch (e) {
      setMsg({ kind: "err", text: String(e?.message ?? e) });
    } finally {
      setBusy(false);
    }
  };
  const sync = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const r = await call(SENSENOVA_SKILLS_ENDPOINTS.sync, {});
      setStatus(r);
      setMsg({ kind: r.ok ? "ok" : "err", text: r.ok ? `\u5DF2\u540C\u6B65 ${r.skillsCount} \u4E2A skill\uFF08${r.via}\uFF0Cref=${r.ref}\uFF09\u3002` : String(r.error ?? "sync failed") });
      const c = await call(SENSENOVA_SKILLS_ENDPOINTS.getConfig, {});
      setCfg(redactConfig(c));
      setDraft(redactConfig(c));
    } catch (e) {
      setMsg({ kind: "err", text: String(e?.message ?? e) });
    } finally {
      setBusy(false);
    }
  };
  return (0, import_react.createElement)(
    "div",
    { style: styles.card },
    (0, import_react.createElement)("div", { style: { fontSize: 15, fontWeight: 600, marginBottom: 4 } }, t("title")),
    (0, import_react.createElement)("p", { style: styles.hint }, t("subtitle")),
    (0, import_react.createElement)(
      "div",
      { style: styles.block },
      (0, import_react.createElement)(
        "div",
        { style: styles.field },
        (0, import_react.createElement)("label", { style: styles.label }, t("repoURL")),
        (0, import_react.createElement)("input", {
          style: styles.input,
          value: draft?.repoURL ?? "",
          placeholder: "https://github.com/OpenSenseNova/SenseNova-Skills",
          onChange: (e) => set("repoURL", e.target.value)
        })
      ),
      (0, import_react.createElement)(
        "div",
        { style: styles.field },
        (0, import_react.createElement)("label", { style: styles.label }, t("ref")),
        (0, import_react.createElement)("input", {
          style: styles.input,
          value: draft?.ref ?? "main",
          onChange: (e) => set("ref", e.target.value)
        })
      ),
      (0, import_react.createElement)(
        "div",
        { style: styles.field },
        (0, import_react.createElement)("label", { style: styles.label }, t("runtimeDir")),
        (0, import_react.createElement)("input", {
          style: styles.input,
          value: draft?.runtimeDir ?? "",
          placeholder: t("runtimeDirHint"),
          onChange: (e) => set("runtimeDir", e.target.value)
        })
      ),
      (0, import_react.createElement)(
        "div",
        { style: styles.row },
        (0, import_react.createElement)("button", { style: styles.btn, disabled: busy, onClick: save }, busy ? "\u2026" : t("save")),
        (0, import_react.createElement)("button", { style: styles.primary, disabled: busy, onClick: sync }, busy ? "\u2026" : t("syncNow"))
      ),
      msg ? (0, import_react.createElement)("div", { style: msg.kind === "ok" ? styles.ok : styles.err }, msg.text) : null
    ),
    (0, import_react.createElement)(
      "div",
      { style: styles.block },
      (0, import_react.createElement)("div", { style: { ...styles.label, marginBottom: 8 } }, t("status")),
      (0, import_react.createElement)(
        "div",
        { style: styles.statusCard },
        status?.ok ? (0, import_react.createElement)(
          "div",
          null,
          (0, import_react.createElement)("div", null, `${t("syncOk")} \xB7 ${status.skillsCount} ${t("skills")}`),
          (0, import_react.createElement)("div", { style: styles.hint }, `${status.ref} \xB7 ${status.via} \xB7 ${status.syncedAt ?? ""}`)
        ) : (0, import_react.createElement)(
          "div",
          { style: status?.error ? styles.err : styles.hint },
          status?.error ? String(status.error) : t("notSynced")
        )
      )
    )
  );
}
function apply(ctx) {
  const rpcCall = (endpoint, payload, signal) => ctx.connection.rpc.call(SENSENOVA_SKILLS_RPC_CHANNEL, endpoint, payload, signal);
  const translate = ctx.locale.bind(NS);
  ctx.effect(() => ctx.locale.register(NS, DICT), "dsh-sensenova-skills: locale dictionaries");
  ctx.slots.inject(
    "settings.section",
    () => ctx.slots.register(
      {
        name: "settings.section",
        id: "sensenova-skills",
        order: 31,
        label: () => translate("section"),
        inject: () => ({ rpcCall, t: translate })
      },
      SkillsSettingsTab
    )
  );
}
var index_default = { apply, name, inject };

    return module.exports;
  }
});
