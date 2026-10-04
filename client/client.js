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
var SENSENOVA_SKILLS_ENTRY_ID = "dsh-sensenova-skills";
var SENSENOVA_SKILLS_FIELDS = Object.freeze({
  repoURL: "repoURL",
  ref: "ref",
  runtimeDir: "runtimeDir"
});
var SENSENOVA_SKILLS_DEFAULTS = Object.freeze({
  repoURL: "https://github.com/OpenSenseNova/SenseNova-Skills.git",
  ref: "main",
  runtimeDir: ""
});

// client/index.jsx
var name = "dsh-sensenova-skills";
var inject = ["slots", "layout", "locale"];
var NS = "sensenova-skills";
var DICT = {
  zh: {
    section: "SenseNova Skills",
    title: "SenseNova Skills",
    subtitle: "\u5B98\u65B9\u6280\u80FD\u6865\uFF1A\u4ECE SenseNova-Skills \u4ED3\u5E93\u8FD0\u884C\u65F6\u62C9\u53D6 36 \u4E2A MIT \u6280\u80FD\uFF0C\u968F\u4E0A\u6E38\u66F4\u65B0\u81EA\u52A8\u540C\u6B65\u3002",
    repoURL: "\u4E0A\u6E38\u4ED3\u5E93 URL",
    repoHint: "git \u4ED3\u5E93\u5730\u5740\u6216\u672C\u5730\u8DEF\u5F84\uFF08\u9ED8\u8BA4\u5B98\u65B9 SenseNova-Skills\uFF09\u3002",
    ref: "Git ref",
    refHint: "\u5206\u652F / tag / \u5B8C\u6574 commit hash\uFF08\u9ED8\u8BA4 main\uFF09\u3002",
    runtimeDir: "\u8FD0\u884C\u65F6\u76EE\u5F55",
    runtimeHint: "\u6280\u80FD\u6587\u4EF6\u843D\u5730\u76EE\u5F55\u3002\u7559\u7A7A\u4F7F\u7528\u9ED8\u8BA4\uFF1A~/.dsh/profiles/<\u5F53\u524D profile>/sensenova-skills\u3002",
    save: "\u4FDD\u5B58",
    saving: "\u4FDD\u5B58\u4E2D\u2026",
    saved: "\u5DF2\u4FDD\u5B58\u3002\u91CD\u542F DSH \u540E\u751F\u6548\u3002",
    syncHint: "\u4FDD\u5B58\u540E\u8BF7\u5BF9 DSH \u8BF4\u4E00\u53E5\u300C\u540C\u6B65 SenseNova skills\u300D\uFF0C\u6216\u8C03\u7528 sensenova_skills_sync \u5DE5\u5177\uFF0C\u5373\u4F1A\u6309\u4E0A\u9762\u7684\u4ED3\u5E93 / ref / \u76EE\u5F55\u62C9\u53D6\u6700\u65B0\u6280\u80FD\u3002",
    readOnly: "\u8BE5\u914D\u7F6E\u5F53\u524D\u4E0D\u53EF\u5199\u5165\u3002",
    unavailable: "\u914D\u7F6E\u670D\u52A1\u4E0D\u53EF\u7528\uFF08\u5BBF\u4E3B dsh-settings \u672A\u66B4\u9732\u8BE5\u63D2\u4EF6\u6761\u76EE\uFF09\u3002",
    saveFailed: "\u4FDD\u5B58\u5931\u8D25\uFF1A\u5BBF\u4E3B\u62D2\u7EDD\u4E86\u672C\u6B21\u5199\u5165\u3002"
  },
  en: {
    section: "SenseNova Skills",
    title: "SenseNova Skills",
    subtitle: "Official skills bridge: pulls 36 MIT-licensed skills from the SenseNova-Skills repo at runtime and follows upstream updates.",
    repoURL: "Upstream repo URL",
    repoHint: "Git repo URL or local path (defaults to the official SenseNova-Skills).",
    ref: "Git ref",
    refHint: "Branch / tag / full commit hash (default: main).",
    runtimeDir: "Runtime directory",
    runtimeHint: "Where skill files land. Leave empty for the default: ~/.dsh/profiles/<profile>/sensenova-skills.",
    save: "Save",
    saving: "Saving\u2026",
    saved: "Saved. Restart DSH to take effect.",
    syncHint: "After saving, tell DSH \u201Csync SenseNova skills\u201D (or call sensenova_skills_sync) to pull the latest skills from the repo / ref / directory above.",
    readOnly: "Configuration is not writable right now.",
    unavailable: "Settings service unavailable (host did not expose this plugin entry).",
    saveFailed: "Save failed: the host rejected this write."
  }
};
var styles = {
  card: { background: "var(--dsw-alias-bg-layer-1,#fff)", border: "1px solid var(--dsw-alias-border-l2,#e5e7eb)", borderRadius: 12, padding: "16px 20px", maxWidth: 520 },
  field: { display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 },
  label: { fontSize: 13, color: "var(--dsw-alias-label-primary,inherit)" },
  hint: { fontSize: 12, color: "var(--dsw-alias-label-tertiary,#8b93a1)", lineHeight: 1.4 },
  input: { border: "1px solid var(--dsw-alias-border-l2,#d1d5db)", background: "var(--dsw-alias-bg-layer-3,#fff)", borderRadius: 8, padding: "8px 10px", fontSize: 13, color: "var(--dsw-alias-label-primary,inherit)", height: 36, boxSizing: "border-box", width: "100%" },
  row: { display: "flex", alignItems: "center", gap: 8, marginTop: 4 },
  primary: { font: "inherit", cursor: "pointer", border: "none", background: "var(--dsw-alias-button-primary-fill, var(--dsw-alias-brand-primary,#4f6ef7))", color: "var(--dsw-alias-label-primary-foreground, #fff)", height: 36, padding: "0 16px", borderRadius: 999, fontSize: 13, fontWeight: 500, display: "inline-flex", alignItems: "center", justifyContent: "center" },
  ok: { color: "var(--dsw-alias-state-success-primary,#34c759)", fontSize: 12 },
  err: { color: "var(--dsw-alias-state-error-primary,#ff3b30)", fontSize: 12, whiteSpace: "pre-wrap" },
  box: { margin: "4px 0 14px", padding: "10px 12px", border: "1px solid var(--dsw-alias-border-l3,#eef0f4)", borderRadius: 8, background: "var(--dsw-alias-bg-layer-2,#fafbfc)", fontSize: 12, color: "var(--dsw-alias-label-secondary,#6b7280)", lineHeight: 1.5 }
};
function SenseNovaSkillsSettingsCard({ settings, t }) {
  const snap = (0, import_react.useSyncExternalStore)(settings.subscribe, settings.getSnapshot);
  const v = snap?.value ?? {};
  const [draft, setDraft] = (0, import_react.useState)({
    repoURL: v.repoURL ?? SENSENOVA_SKILLS_DEFAULTS.repoURL,
    ref: v.ref ?? SENSENOVA_SKILLS_DEFAULTS.ref,
    runtimeDir: v.runtimeDir ?? ""
  });
  const [busy, setBusy] = (0, import_react.useState)(false);
  const [msg, setMsg] = (0, import_react.useState)(null);
  (0, import_react.useEffect)(() => {
    setDraft({
      repoURL: v.repoURL ?? SENSENOVA_SKILLS_DEFAULTS.repoURL,
      ref: v.ref ?? SENSENOVA_SKILLS_DEFAULTS.ref,
      runtimeDir: v.runtimeDir ?? ""
    });
  }, [snap?.revision]);
  const set = (key, value) => setDraft((d) => ({ ...d, [key]: value }));
  const save = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const ops = [
        { op: "set", path: [SENSENOVA_SKILLS_FIELDS.repoURL], value: draft.repoURL ?? SENSENOVA_SKILLS_DEFAULTS.repoURL },
        { op: "set", path: [SENSENOVA_SKILLS_FIELDS.ref], value: draft.ref ?? SENSENOVA_SKILLS_DEFAULTS.ref },
        { op: "set", path: [SENSENOVA_SKILLS_FIELDS.runtimeDir], value: draft.runtimeDir ?? "" }
      ];
      const ok = await settings.mutate(ops, snap?.revision);
      setMsg(ok ? { kind: "ok", text: t("saved") } : { kind: "err", text: t("saveFailed") });
    } catch (e) {
      setMsg({ kind: "err", text: String(e?.message ?? e) });
    } finally {
      setBusy(false);
    }
  };
  if (snap?.status !== "ready") {
    return (0, import_react.createElement)("div", { style: styles.card }, (0, import_react.createElement)("p", { style: styles.err }, t("unavailable")));
  }
  return (0, import_react.createElement)(
    "div",
    { style: styles.card },
    (0, import_react.createElement)("div", { style: { fontSize: 15, fontWeight: 600, marginBottom: 4 } }, t("title")),
    (0, import_react.createElement)("p", { style: styles.hint }, t("subtitle")),
    (0, import_react.createElement)(
      "div",
      { style: styles.field },
      (0, import_react.createElement)("label", { style: styles.label }, t("repoURL")),
      (0, import_react.createElement)("input", { style: styles.input, value: draft.repoURL ?? SENSENOVA_SKILLS_DEFAULTS.repoURL, onChange: (e) => set("repoURL", e.target.value) }),
      (0, import_react.createElement)("div", { style: styles.hint }, t("repoHint"))
    ),
    (0, import_react.createElement)(
      "div",
      { style: styles.field },
      (0, import_react.createElement)("label", { style: styles.label }, t("ref")),
      (0, import_react.createElement)("input", { style: styles.input, value: draft.ref ?? SENSENOVA_SKILLS_DEFAULTS.ref, onChange: (e) => set("ref", e.target.value) }),
      (0, import_react.createElement)("div", { style: styles.hint }, t("refHint"))
    ),
    (0, import_react.createElement)(
      "div",
      { style: styles.field },
      (0, import_react.createElement)("label", { style: styles.label }, t("runtimeDir")),
      (0, import_react.createElement)("input", { style: styles.input, value: draft.runtimeDir ?? "", placeholder: "~/.dsh/profiles/<profile>/sensenova-skills", onChange: (e) => set("runtimeDir", e.target.value) }),
      (0, import_react.createElement)("div", { style: styles.hint }, t("runtimeHint"))
    ),
    (0, import_react.createElement)(
      "div",
      { style: styles.row },
      (0, import_react.createElement)("button", { style: styles.primary, disabled: busy || !snap?.writable, onClick: save }, busy ? t("saving") : t("save")),
      !snap?.writable && (0, import_react.createElement)("span", { style: styles.hint }, t("readOnly"))
    ),
    msg ? (0, import_react.createElement)("div", { style: msg.kind === "ok" ? styles.ok : styles.err }, msg.text) : null,
    (0, import_react.createElement)("div", { style: styles.box }, t("syncHint"))
  );
}
function apply(ctx) {
  const translate = ctx.locale.bind(NS);
  ctx.effect(() => ctx.locale.register(NS, DICT), "dsh-sensenova-skills: locale dictionaries");
  ctx.inject(["configForms"], (settingsCtx) => {
    const forms = settingsCtx.get("configForms");
    const settings = forms.get(SENSENOVA_SKILLS_ENTRY_ID);
    settingsCtx.slots.inject(
      "settings.section",
      () => settingsCtx.slots.register(
        {
          name: "settings.section",
          id: "sensenova-skills",
          order: 31,
          label: () => translate("section"),
          inject: () => ({ settings, t: translate })
        },
        SenseNovaSkillsSettingsCard
      )
    );
  });
}
var index_default = { apply, name, inject };

    return module.exports;
  }
});
