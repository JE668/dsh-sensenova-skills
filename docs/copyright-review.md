# 版权风险评估：dsh-sensenova-skills 插件

> 结论：**风险低**。本插件对官方仓库的集成方式合规，保留上游 MIT 许可证即可安全发布到个人 GitHub。

## 1. 上游许可

- 上游仓库 [`OpenSenseNova/SenseNova-Skills`](https://github.com/OpenSenseNova/SenseNova-Skills) 为 **MIT License**（`LICENSE` 文件，版权方 SenseNova，2026）。
- MIT 授予：使用、复制、修改、合并、再分发、再许可的完整权利；唯一义务是在副本或实质部分中保留版权与许可声明。
- 该仓库公开 `skills/`（36 个 skill，含 SKILL.md / references / scripts / docs / examples），**没有** 非代码的专有资产或双重许可。

## 2. 本插件的集成方式（为什么风险低）

本插件 **不打包、不重新分发** 上游代码：

1. **运行时拉取**：`sensenova_skills_sync` 工具在用户机器上从 GitHub（tarball 或 git clone）下载上游 `skills/` 到本地运行时目录（默认 `~/.dsh/sensenova-skills/`）。
2. **许可证链完整**：上游 MIT 的版权/许可声明保留在上游仓库与运行时拉取的快照中；本插件自己的 `LICENSE` 也注明桥接到 MIT 上游、不随包分发。
3. **不 fork 上游**：没有把上游代码提交进本仓库，避免了"副本必须保留声明"这类义务落在本仓库。
4. **名称/品牌**：插件名 `dsh-sensenova-skills` 与上游项目名不冲突（描述性指称），未冒充官方；`dsh-` 前缀表明这是 DSH 侧桥接。
5. **API key**：调用的是商汤 SenseNova 平台 API，用户自备 key；本插件不托管、不转发、不收集。

## 3. 残余风险点与建议

| 风险点 | 等级 | 建议 |
|---|---|---|
| 上游将来改许可（非 MIT） | 低 | 每次 sync 记录 `ref`/`syncedAt`；若上游变 `GPL`/`AGPL` 等强 copyleft，需在 README 与 `version.json` 中重新评估，最坏情况停止同步并删除本地快照。 |
| 重新分发上游快照（如打成 npm tarball） | 中 | **不要**把 `skills/` 提交到插件仓库或发布到 npm；保持"运行时拉取"模式。若要预置离线快照，需在包内附完整 MIT 声明。 |
| 上游商标/品牌使用 | 低 | 仅在描述性语境提及 "SenseNova-Skills"；不加 logo、不暗示官方背书。 |
| 个人 GitHub 公开仓库 | 低 | 可公开；建议在仓库 `LICENSE` 顶部保留"桥接 MIT 上游、不随包分发"的说明（已写入）。 |

## 4. 与"跟随官方更新"方案的一致性

- 本插件默认跟踪上游 `main` 分支，每次 sync 拉最新；`ref` 可锁 tag/commit 做稳定版。
- 上游官方自己提供 `sn-update` skill 做刷新；本插件的 `sensenova_skills_sync` 是其 DSH 侧等价物，行为一致（拉快照、不修改任务目录、只读上游）。
- 同步失败（断网、镜像失效）不影响已安装的旧快照继续工作。

## 5. 推荐动作

1. 把本插件推到你 GitHub（`JE668/dsh-sensenova-skills`），公开即可。
2. 在仓库 README 保留"上游 MIT、运行时拉取、不重新分发"的说明（已写入 `LICENSE` 与 `README.md`）。
3. 若日后把插件发到 npm 或 DSH 市场，保持 `files` 字段只包含 `lib/`、`package.json`、`cordis.patch.yml`、`README.md`、`LICENSE`（已配置），不要打包上游快照。
