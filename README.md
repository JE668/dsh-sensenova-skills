# dsh-sensenova-skills

DeepSeek Harness 插件：把商汤官方 [OpenSenseNova/SenseNova-Skills](https://github.com/OpenSenseNova/SenseNova-Skills)（MIT）的 agent skills 桥接进 DSH。

官方 skills 是 **agent 驱动** 的：每个 skill 以 `SKILL.md` 声明触发条件、能力边界与执行方式（遵循 [Agent Skills 规范](https://agentskills.io/)），agent 读取后按其中指令运行 bash / Python 脚本，调用 SenseNova API。本插件提供 3 个 DSH 工具，让 agent 能发现、加载并驱动这些 skills。

> 与 `dsh-sensenova-image`（直接暴露图片生成/编辑 API 工具）互补：本插件暴露的是官方完整 skill 生态（PPT、信息图、深度研究、Excel 分析等 30+ 个 skill）。

## 功能

| 工具 | 说明 |
|---|---|
| `sensenova_skills_sync` | 从上游仓库同步 skills 快照到本地运行时目录（默认 `~/.dsh/sensenova-skills/`），**跟随官方更新**。下载失败自动回退到 `git clone`。 |
| `sensenova_skills_list` | 浏览已同步的 skill 清单（名称 / 描述 / 触发词），支持子串过滤。 |
| `sensenova_skills_read` | 读取某个 skill 的完整 `SKILL.md`（或 `references/` 下的具体文件）。agent 按其中的 Workflow 指令执行。 |

## 安装

```sh
dsh plugin --profile desktop add github:JE668/dsh-sensenova-skills
# 或本地目录
dsh plugin --profile desktop add file:/path/to/dsh-sensenova-skills
```

## 使用流程（agent 视角）

1. **首次 / 更新**：调用 `sensenova_skills_sync`（跟随官方 `main` 分支；可在设置里锁 `ref`——支持分支 / tag（如 `v2026.09`）/ commit，或改 `repoURL` 镜像）。
2. **发现**：`sensenova_skills_list`（可 `filter: "ppt"` 等）。
3. **加载**：`sensenova_skills_read { skill: "sn-ppt-entry" }` → 得到完整 SKILL.md + 凭据加载提示。
4. **凭据**：运行脚本前先 `set -a; source ~/.dsh/sensenova-skills/.env; set +a`（`sn-ppt-tools` 系脚本亦可用 `SN_PPT_ENV_FILE` 指向该文件）。设置页「SenseNova Skills」里填的 key 会自动写入该 `.env`。
5. **执行**：agent 按 SKILL.md 的 Workflow 跑 bash / Python 脚本（部分 skill 需先装依赖，见各 skill `requirements.txt` / `install.sh`）。

### 三大重点板块

- **PPT**（`sn-ppt-entry` 入口 → `sn-ppt-story` 大纲 → `sn-ppt-standard` / `sn-ppt-dazzle` / `sn-ppt-creative` 出口；`sn-ppt-doctor` 诊断、`sn-ppt-workbench` 可视化编辑、`sn-ppt-tools` 备用搜索/生图）。首次使用标准出口需跑 `sn-ppt-standard/scripts/install.sh`（Playwright Chromium、字体、解析 venv）。
- **生成图片**（`sn-infographic` 信息图；`sn-image-imitate` 风格模仿；`sn-image-resume` 简历海报；底层统一走 `sn-image-base`，只需配 `SN_API_KEY`）。
- **深入研究**（`sn-deep-research` 多 Agent 编排；`sn-research-report` / `sn-prepare-citations` / `sn-report-format-discovery` 配套）。DSH 自带搜索/抓取/文件工具，Tier-1 能力天然满足；可选搜索 key（Serper 等）在设置页「更多变量」里配。

### 主要 skills（36 个，节选）

- **PPT**：`sn-ppt-entry` / `sn-ppt-story` / `sn-ppt-standard` / `sn-ppt-dazzle` / `sn-ppt-creative` / `sn-ppt-doctor` / `sn-ppt-tools` / `sn-ppt-workbench`
- **图像**：`sn-infographic`（信息图）/ `sn-image-imitate` / `sn-image-resume` / `sn-image-base`（底层）
- **深度研究**：`sn-deep-research` / `sn-deepresearch-cli` / `sn-research-report` / `sn-prepare-citations` / `sn-report-format-discovery`
- **搜索**：`sn-search-academic` / `sn-search-code` / `sn-search-social-cn` / `sn-search-social-en` / `sn-search-image` / `sn-search-finance` / `sn-search-market-cn`
- **数据分析**：`sn-da-excel-workflow` / `sn-da-large-file-analysis` / `sn-da-image-caption` / `sn-da-non-spreadsheet-analysis`
- **其他**：`sn-motion-html` / `sn-md-to-html-report` / `sn-team-harness` / `sn-proactive-agent` / `sn-update`

## 设置（Settings → Plugins → dsh-sensenova-skills）

| 字段 | 说明 | 默认 |
|---|---|---|
| `repoURL` | 上游仓库 URL；可改为 GitHub 镜像或私有 fork | `https://github.com/OpenSenseNova/SenseNova-Skills` |
| `ref` | 跟踪的分支 / tag / commit（tag 形如 `v2026.09`） | `main` |
| `runtimeDir` | 运行时目录 | `~/.dsh/sensenova-skills` |
| `linkDir` | 挂载目录（符号链接落点，须是 DSH 扫描的 skill 根） | `~/.dsh/skills` |

## 跟随官方更新

- 每次调用 `sensenova_skills_sync` 都会拉取上游 `ref`（默认 `main`）的最新快照，并写入 `version.json`（含 `syncedAt` / `via` / `ref` / `commit`）。
- `commit` 由 GitHub API 解析。未认证配额仅 60 次/小时，耗尽时该字段降级为 `null`（**同步本身不受影响**）；在设置页填 `GITHUB_TOKEN` 可提升到 5000 次/小时并确保 `commit` 稳定可用。
- 传 `force: false` 可在已有本地快照时跳过联网下载（离线 / 省流量场景）。
- 手动同步：`node scripts/sync-upstream.js [--force]`。
- 上游官方也提供 `sn-update` skill（agent 可读它自行刷新），本插件的 sync 工具是其 DSH 侧等价物。

## 故障排查

**设置页保存任何字段都报 `No configurable plugin entry`**

两个独立成因，都会让 `dsh-settings` 认为条目「不可配置」：

1. **`id` 与包名撞名**。profile 的 bundle 列表已按包名 `dsh-sensenova-skills` 登记了一个条目，`cordis.patch.yml` 里 insert 的 `id` 若同名，宿主 `configEditor.entries()` 的同名去重会把两个条目一并剔除。本插件用 `id: sensenova-skills`（`dshmarket` → `dsh-market`、`dsh-free-search` → `web-search-free` 等同理）。改动 `id` 时必须同步 `lib/index.js` 的 `ENTRY_ID`。

2. **模块带 `export default` 导出**。宿主 Loader 的 `unwrapExports` 在模块带 default 时会剥出 default 对象作为插件；settings 服务的 `schema(entry)` 读的是剥壳后对象上的 `Config` —— default 里没放 `Config` 的话，条目没有 volatile 表单，同样报此错。**本插件的入口只允许命名导出**（`export function apply` / `export const Config` 等，见 `lib/index.js` 尾部注释）；dshmarket / dsh-cost-meter / dsh-our-free-model 等 first-party 插件全部如此。

## 版权与许可

- 本插件自身代码：**MIT**（见 LICENSE）。
- 上游 `OpenSenseNova/SenseNova-Skills`：**MIT**。本插件**不重新分发**上游代码 —— 运行时通过 GitHub tarball / git clone 把 `skills/` 快照拉到本地运行时目录；快照随官方更新而更新，许可证链清晰。
- 使用各 skill 时调用的是商汤 SenseNova API（需自备 API key，见上游 `.env.example`）。

## 依赖

- Node.js ≥ 20
- 部分 skill 需要 Python ≥ 3.9 + 上游 `requirements.txt`（如 `sn-image-base` 的 httpx/pillow/python-dotenv）—— agent 按 SKILL.md 指示安装。

## License

MIT（插件自身） + 桥接上游 MIT（运行时拉取，不打包分发）。
