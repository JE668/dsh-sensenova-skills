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
var name = "dsh-sensenova-skills";
var inject = ["slots", "locale", "configForms"];
var NS = "sensenova-skills";
var ENTRY_ID = "dsh-sensenova-skills";
var ITEM_ID = "sensenova-skills";
var ITEM_ORDER = 41;
var DEFAULT_REPO = "https://github.com/OpenSenseNova/SenseNova-Skills.git";
var zh = {
  title: "SenseNova Skills",
  summary: "\u5B98\u65B9\u6280\u80FD\u6865\uFF1A\u8FD0\u884C\u65F6\u62C9\u53D6 36 \u4E2A MIT \u6280\u80FD\uFF0C\u968F\u4E0A\u6E38\u66F4\u65B0\u540C\u6B65\u3002",
  detail: "\u5B98\u65B9\u6280\u80FD\u6865\uFF1A\u4ECE SenseNova-Skills \u4ED3\u5E93\u5728\u8FD0\u884C\u65F6\u62C9\u53D6 36 \u4E2A MIT \u8BB8\u53EF\u6280\u80FD\uFF0C\u968F\u4E0A\u6E38\u66F4\u65B0\u540C\u6B65\u3002",
  repoURL: "\u4E0A\u6E38\u4ED3\u5E93 URL",
  repoHint: "git \u4ED3\u5E93\u5730\u5740\uFF1B\u9ED8\u8BA4\u5B98\u65B9 SenseNova-Skills\u3002",
  ref: "Git ref",
  refHint: "\u5206\u652F / tag / \u5B8C\u6574 commit hash\u3002",
  runtimeDir: "\u8FD0\u884C\u65F6\u76EE\u5F55",
  runtimeHint: "\u7559\u7A7A\u5219\u4F7F\u7528 ~/.dsh/profiles/<\u5F53\u524D profile>/sensenova-skills\u3002",
  save: "\u4FDD\u5B58",
  saving: "\u4FDD\u5B58\u4E2D\u2026",
  saved: "\u5DF2\u4FDD\u5B58\u3002\u91CD\u542F DSH \u540E\u751F\u6548\u3002",
  failed: "\u4FDD\u5B58\u5931\u8D25\uFF1A\u5BBF\u4E3B\u62D2\u7EDD\u4E86\u672C\u6B21\u5199\u5165\u3002",
  readOnly: "\u8BE5\u914D\u7F6E\u5F53\u524D\u4E0D\u53EF\u5199\u5165\u3002",
  unavailable: "\u914D\u7F6E\u670D\u52A1\u4E0D\u53EF\u7528\uFF08\u5BBF\u4E3B\u672A\u66B4\u9732\u8BE5\u63D2\u4EF6\u6761\u76EE\uFF09\u3002",
  syncHint: "\u4FDD\u5B58\u540E\u5BF9 DSH \u8BF4\u4E00\u53E5\u300C\u540C\u6B65 SenseNova skills\u300D\uFF0C\u6216\u8C03\u7528 sensenova_skills_sync \u5DE5\u5177\uFF0C\u5373\u53EF\u6309\u4E0A\u9762\u7684\u4ED3\u5E93 / ref / \u76EE\u5F55\u62C9\u53D6\u6700\u65B0\u6280\u80FD\u3002"
};
var en = {
  title: "SenseNova Skills",
  summary: "Official skills bridge: pulls 36 MIT-licensed skills at runtime and follows upstream.",
  detail: "Official skills bridge: pulls 36 MIT-licensed skills from the SenseNova-Skills repo at runtime and follows upstream updates.",
  repoURL: "Upstream repo URL",
  repoHint: "Git repository URL; defaults to the official SenseNova-Skills repo.",
  ref: "Git ref",
  refHint: "Branch / tag / full commit hash.",
  runtimeDir: "Runtime directory",
  runtimeHint: "Leave empty to use ~/.dsh/profiles/<current profile>/sensenova-skills.",
  save: "Save",
  saving: "Saving\u2026",
  saved: "Saved. Restart DSH to take effect.",
  failed: "Save failed: the host rejected this write.",
  readOnly: "Configuration is not writable right now.",
  unavailable: "Settings service unavailable (the host did not expose this plugin entry).",
  syncHint: "After saving, tell DSH \u201Csync SenseNova skills\u201D (or call the sensenova_skills_sync tool) to pull the latest skills from the repo / ref / directory above."
};
var styles = {
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
var FIELDS = { repoURL: "repoURL", ref: "ref", runtimeDir: "runtimeDir" };
function SenseNovaSkillsCard(props) {
  const settings = props.settings;
  const t = props.t ?? ((k) => zh[k] ?? k);
  const subscribe = (0, import_react.useCallback)((l) => settings.subscribe(l), [settings]);
  const getSnapshot = (0, import_react.useCallback)(() => settings.getSnapshot(), [settings]);
  const snapshot = (0, import_react.useSyncExternalStore)(subscribe, getSnapshot, getSnapshot);
  const value = snapshot?.value ?? {};
  const writable = snapshot?.writable === true && snapshot?.mode === "host";
  if (props.view === "summary") return (0, import_react.createElement)("span", null, t("summary"));
  if (snapshot?.status !== "ready" || value === void 0) {
    return (0, import_react.createElement)("p", { style: styles.err }, t("unavailable"));
  }
  const current = {
    repoURL: value.repoURL ?? DEFAULT_REPO,
    ref: value.ref ?? "main",
    runtimeDir: value.runtimeDir ?? ""
  };
  const setField = (key, next) => props.actions.stage(FIELDS[key], next);
  return (0, import_react.createElement)(
    "div",
    null,
    (0, import_react.createElement)("p", { style: { ...styles.hint, margin: "0 0 12px" } }, t("detail")),
    (0, import_react.createElement)(
      "div",
      { style: styles.field },
      (0, import_react.createElement)("label", { style: styles.label }, t("repoURL")),
      (0, import_react.createElement)("input", {
        style: styles.input,
        value: props.actions.draft(FIELDS.repoURL).value ?? current.repoURL,
        onChange: (e) => setField("repoURL", e.target.value)
      }),
      (0, import_react.createElement)("div", { style: styles.hint }, t("repoHint"))
    ),
    (0, import_react.createElement)(
      "div",
      { style: styles.field },
      (0, import_react.createElement)("label", { style: styles.label }, t("ref")),
      (0, import_react.createElement)("input", {
        style: styles.input,
        value: props.actions.draft(FIELDS.ref).value ?? current.ref,
        onChange: (e) => setField("ref", e.target.value)
      }),
      (0, import_react.createElement)("div", { style: styles.hint }, t("refHint"))
    ),
    (0, import_react.createElement)(
      "div",
      { style: styles.field },
      (0, import_react.createElement)("label", { style: styles.label }, t("runtimeDir")),
      (0, import_react.createElement)("input", {
        style: styles.input,
        value: props.actions.draft(FIELDS.runtimeDir).value ?? current.runtimeDir,
        placeholder: "~/.dsh/profiles/<profile>/sensenova-skills",
        onChange: (e) => setField("runtimeDir", e.target.value)
      }),
      (0, import_react.createElement)("div", { style: styles.hint }, t("runtimeHint"))
    ),
    (0, import_react.createElement)(
      "div",
      { style: styles.row },
      (0, import_react.createElement)("button", {
        style: styles.primary,
        disabled: !writable || props.actions.saving() || props.actions.dirty() === false,
        onClick: () => props.actions.save()
      }, props.actions.saving() ? t("saving") : t("save")),
      !writable && (0, import_react.createElement)("span", { style: styles.hint }, t("readOnly"))
    ),
    props.actions.message() === "saved" ? (0, import_react.createElement)("p", { style: styles.ok }, t("saved")) : null,
    props.actions.message() === "failed" ? (0, import_react.createElement)("p", { style: styles.err }, t("failed")) : null,
    (0, import_react.createElement)("div", { style: styles.box }, t("syncHint"))
  );
}
function apply(ctx) {
  const t = ctx.locale.bind(NS);
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), "dsh-sensenova-skills: dictionaries");
  const form = ctx.configForms.get(ENTRY_ID);
  const drafts = /* @__PURE__ */ new Map();
  let message = null;
  let saving = false;
  const actions = {
    stage(field, value) {
      message = null;
      drafts.set(field, value);
    },
    draft(field) {
      return drafts.has(field) ? { kind: "set", value: drafts.get(field) } : { kind: "unset" };
    },
    dirty() {
      return drafts.size > 0;
    },
    saving() {
      return saving;
    },
    message() {
      return message;
    },
    async save() {
      if (saving || drafts.size === 0) return;
      saving = true;
      try {
        const ops = [...drafts.entries()].map(([field, value]) => ({ op: "set", path: [field], value }));
        const ok = await form.mutate(ops, form.getSnapshot()?.revision);
        if (ok) {
          drafts.clear();
          message = "saved";
        } else {
          message = "failed";
        }
      } catch {
        message = "failed";
      } finally {
        saving = false;
      }
    },
    inject() {
      return { settings: form, t, actions };
    }
  };
  ctx.effect(() => () => drafts.clear(), "dsh-sensenova-skills: drafts");
  ctx.effect(() => ctx.configForms.whileServed([ENTRY_ID], () => ctx.slots.inject(
    "plugins.item",
    () => ctx.slots.register(
      {
        name: "plugins.item",
        id: ITEM_ID,
        order: ITEM_ORDER,
        label: () => t("title"),
        locale: NS,
        inject: () => actions.inject()
      },
      SenseNovaSkillsCard
    )
  )), "dsh-sensenova-skills: page");
}

    return module.exports;
  }
});
