# GitHub 设置

远端是 `git@github.com:kenylerich/sagebeast.git`，默认分支 `main`。仓库在文档阶段保持公开，Issue 已启用。

## 已落地的能力

| 能力 | 位置 |
|---|---|
| 关闭空白 Issue | `.github/ISSUE_TEMPLATE/config.yml` |
| Requirement、Feature、Bug、Task、Research 模板 | `.github/ISSUE_TEMPLATE/` |
| PR 模板 | `.github/pull_request_template.md` |
| 标签清单 | `.github/labels.json` |
| PR 策略 | `.github/workflows/issue-policy.yml` |
| 标签生命周期 | `.github/workflows/issue-lifecycle.yml` |
| 测试和编码门禁 | `.github/workflows/repository-checks.yml` |
| 标签增量同步 | `.github/workflows/label-sync.yml` |
| Actions 依赖更新 | `.github/dependabot.yml` |
| 代码所有者 | `.github/CODEOWNERS` |

## 一次性标签退役

增量同步不会删除旧标签。维护者在本地执行一次：

```sh
GH_TOKEN="$(gh auth token)" node .github/issue-management/sync-labels.mjs --retire
```

没有 `--retire` 时，脚本只创建或更新 [labels.json](../../.github/labels.json) 中的标签。

## 还没有接通的能力

- GitHub Project。当前认证缺少 `read:project`。不要把 `projectEnabled` 设为 `true`。
- 分支保护。可以在 `Repository checks` 至少成功一次后，要求 `main` 通过该检查。单人仓库不强制评审，否则维护者无法合并自己的文档 PR。
- Research 和 Idea 原生 Issue Type。创建接口当前不可用，所以 Research 使用 Task。

## 分支保护建议

`Repository checks` 在 `main` 上出现过后，可以要求：

- 线性历史。
- 通过 `Repository checks`。
- 不要求评审。
- 管理员保留绕过能力，只用于修复门禁本身。

不要在检查名尚未存在时设置必需检查，否则所有推送都会被一个不存在的检查卡住。

## 密钥

Actions 只使用作业自带的 `GITHUB_TOKEN`。不要添加 TSP Token、模型密钥或 GitHub App 私钥。Project 集成若以后需要 App，必须单独决策，不能复用 DeepSeek Harness 的 App 名称或 secret。
