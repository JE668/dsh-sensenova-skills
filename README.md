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

1. **首次 / 更新**：调用 `sensenova_skills_sync`（跟随官方 `main` 分支；可在设置里锁 `ref` 或改 `repoURL` 镜像）。
2. **发现**：`sensenova_skills_list`（可 `filter: "ppt"` 等）。
3. **加载**：`sensenova_skills_read { skill: "sn-ppt-entry" }` → 得到完整 SKILL.md。
4. **执行**：agent 按 SKILL.md 的 Workflow 跑 bash / Python 脚本（部分 skill 需先配 SenseNova API key，见上游 `.env.example` 与 `docs/`）。

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
| `ref` | 跟踪的分支 / tag / commit | `main` |
| `runtimeDir` | 运行时目录 | `~/.dsh/sensenova-skills` |

## 跟随官方更新

- 每次调用 `sensenova_skills_sync` 都会拉取上游 `ref`（默认 `main`）的最新快照，并写入 `version.json`（含 `syncedAt` / `via` / `ref`）。
- 手动同步：`node scripts/sync-upstream.js [--force]`。
- 上游官方也提供 `sn-update` skill（agent 可读它自行刷新），本插件的 sync 工具是其 DSH 侧等价物。

## 版权与许可

- 本插件自身代码：**MIT**（见 LICENSE）。
- 上游 `OpenSenseNova/SenseNova-Skills`：**MIT**。本插件**不重新分发**上游代码 —— 运行时通过 GitHub tarball / git clone 把 `skills/` 快照拉到本地运行时目录；快照随官方更新而更新，许可证链清晰。
- 使用各 skill 时调用的是商汤 SenseNova API（需自备 API key，见上游 `.env.example`）。

## 依赖

- Node.js ≥ 20
- 部分 skill 需要 Python ≥ 3.9 + 上游 `requirements.txt`（如 `sn-image-base` 的 httpx/pillow/python-dotenv）—— agent 按 SKILL.md 指示安装。

## License

MIT（插件自身） + 桥接上游 MIT（运行时拉取，不打包分发）。
