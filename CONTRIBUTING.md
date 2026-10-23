# 贡献

当前只接受文档、决策记录和 `.github` 需求管理改动。产品实现要等 [需求目录](docs/requirements/catalog.md) 被接受，接受方式见 [acceptance.md](docs/requirements/acceptance.md)。

## 开工前

1. 读 [架构](docs/architecture.md)、[开放问题](docs/requirements/open-questions.md) 和 [安全边界](SAFETY.md)。
2. 确认改动对应一条 Issue。没有 Issue 就先用模板开一条，不要直接开 PR。
3. 给 Issue 选择一个原生 Type：Feature、Bug 或 Task。Research 使用 Task，并保留 `track/research`。
4. 建议优先级用 `p0`–`p3`。状态用 `status/*`，不要自造同义标签。

空白 Issue 已关闭。模板在 [`.github/ISSUE_TEMPLATE`](.github/ISSUE_TEMPLATE)。

## Pull request

PR 正文至少包含一个同仓库引用：

- 解决型：`Fixes #123`、`Closes #123` 或 `Resolves #123`。一个关键词只绑定紧随其后的一个编号。
- 背景型：`Refs #123`。它不关闭 Issue，也不推动状态。

还需要恰好一个 `kind/*`，以及至少一个 `area/*`。标签含义见 [标签分类](docs/process/label-taxonomy.md)。

草稿 PR 不跑强制策略。准备好评审时再标记为可评审。Bot 和 App 作者豁免。

## 本地检查

```sh
node --test .github/issue-management/policy.test.mjs
node .github/issue-management/coding-gate.mjs
```

这两项也是 `Repository checks`。`Issue policy` 在 PR 上执行，使用默认分支里的受信任脚本。

## 不要做的事

- 不要把产品代码放进文档阶段的 PR。
- 不要把 tick-stock-panel Token 或任何密钥写进 Issue、PR 或仓库。
- 不要用默认的 `bug`、`enhancement`、`documentation` 标签。它们会被策略拒绝，标签同步也会退役它们。
- 不要为了绕过门禁把实现写进 `docs/`。文档可以定义契约，不能承载要运行的产品代码。
