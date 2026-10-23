# 标签分类

标签回答互相独立的问题。不要用一个无前缀标签同时表示意图、领域和状态。

权威颜色和说明在 [labels.json](../../.github/labels.json)。本文件解释选择，不复制机器清单。

## Pull request 的 kind

每条非豁免 PR 恰好一个：

| 标签 | 含义 |
|---|---|
| `kind/feature` | 新增或有意改变可观察行为 |
| `kind/bug-fix` | 修正错误行为 |
| `kind/doc` | 文档是主导意图 |
| `kind/testing` | 只改测试或测试设施 |
| `kind/cleanup` | 行为不变的维护 |
| `kind/dependency` | 没有其他主导意图的依赖更新 |

配套的测试或文档不改变主导意图。功能 PR 即使改了 README，仍然是 `kind/feature`。

Issue 不使用 `kind/*`。Issue 用原生 Type。生命周期会移除误贴的 `kind/*`。

## 领域

PR 至少一个 `area/*`。Issue 建议有，但不强制。

| 标签 | 覆盖 |
|---|---|
| `area/docs` | 文档、决策记录、需求目录 |
| `area/process` | Issue、PR、标签、门禁 |
| `area/runtime` | DeepSeek Harness 的装载和会话 |
| `area/optimize` | 自优化循环和经验库 |
| `area/data` | tick-stock-panel 客户端和数据契约 |
| `area/agent` | 研究者可观察的 Agent 行为 |
| `area/eval` | 跑分任务、评分和实验记录 |
| `area/safety` | 非投顾、密钥、scope |
| `area/infra` | CI、Actions、开发工具 |

一个 PR 改了多个独立行为时可以带多个领域。不要用宽标签加窄标签重复描述同一件事。

新领域使用 `area/<lowercase-kebab-case>`，并同时改 `labels.json` 和本文件。不要为单个 PR、个人或临时项目建领域。

## 优先级和状态

`p0` 到 `p3` 最多一个。数字越小越优先。没有优先级表示尚未分拣。

`status/*` 的顺序和事件见 [Issue 管理](../../.github/issue-management/README.zh.md)。这是 Project 字段的临时替代，不是第二套自定义状态机。

## 跟踪和来源

`track/requirement` 和 `track/research` 只用于 Issue。它们不代替 Type，也不满足 PR 的 `kind/*` 或 `area/*`。

`source/maintainer` 和 `source/agent` 只记录 Issue 怎样被建立。贴到 PR 上会使策略失败。

## 退役名字

不要重新创建 `bug`、`enhancement`、`documentation`、`feature`、`bug-fix`、`doc`、`cleanup`、`testing`、`dependencies`、`kind/bug` 或 `kind/documentation`。策略把它们视为旧标签。
