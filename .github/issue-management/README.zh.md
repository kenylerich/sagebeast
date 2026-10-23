# Issue 管理

[English](README.md) | 中文

## 摘要

本目录把 DeepSeek Harness `.github` 里和需求管理有关的能力，收成适合 `kenylerich/sagebeast` 的基线。贡献者用 Issue 记录需求，PR 必须引用同仓库 Issue。状态和优先级先用标签，不依赖 GitHub Project 或 GitHub App。

产品编码仍受 [编码门禁](../../docs/decisions/0002-requirements-before-code.md) 约束。这里的脚本是仓库流程，不是股票 Agent 实现。

## 目录

- [从 DeepSeek Harness 取了什么](#adopted)
- [有意不做的部分](#not-adopted)
- [PR 策略](#pull-request-policy)
- [生命周期](#lifecycle)
- [标签](#labels)
- [配置限制](#limits)
- [验证](#verification)

-----

<a id="adopted"></a>
## 从 DeepSeek Harness 取了什么

参考实现是 `/Users/kenyle/workspace/agent/deepseek-harness/.github`，不是把它的工作流原样复制。

| 能力 | 本仓库落地 |
|---|---|
| 关闭空白 Issue | [ISSUE_TEMPLATE/config.yml](../ISSUE_TEMPLATE/config.yml) |
| Bug、Feature、Task 模板 | 同目录模板；另加 Requirement 和 Research |
| PR 模板要求引用 Issue，并保留可折叠证据 | [pull_request_template.md](../pull_request_template.md) |
| 恰好一个 `kind/*`，至少一个 `area/*` | [rules.mjs](rules.mjs) |
| `p0`–`p3` 最多一个，解决型 PR 对齐最高优先级 | 优先级来自标签，不来自 Project 字段 |
| 评论、代码围栏和行内代码中的引用不计 | `visibleMarkdown` |
| 跨仓库引用和指向 PR 的编号不能满足要求 | `parseReferences` 加 REST 区分 Issue 与 PR |
| 受信任默认分支执行策略 | [issue-policy.yml](../workflows/issue-policy.yml) |
| 解决型引用推动状态，只前进，请求修改可退回 | [issue-lifecycle.yml](../workflows/issue-lifecycle.yml) |
| Issue 上移除 PR 专用 `kind/*` | `planIssueEvent` |

-----

<a id="not-adopted"></a>
## 有意不做的部分

| DeepSeek Harness 能力 | 不做的原因 |
|---|---|
| ProjectV2、App token、`Start Date` | 当前 token 没有 `read:project`，也没有对应 GitHub App。`projectEnabled` 必须保持 `false`。 |
| 只在请求评审后才强制 PR 策略 | 单人仓库里这会使检查形同虚设。这里对所有非草稿、人类 PR 强制执行。 |
| 加权评审和 blame ownership | 没有多维护者所有权模型。 |
| `source/*` 自动写入 | 只保留标签位。PR 上出现 `source/*` 会失败。 |
| Idea、Research 原生 Issue Type | 仓库只有 Feature、Bug、Task。Research 使用 Task 加 `track/research`。 |
| npm、uv Dependabot 和发布工作流 | 尚无应用依赖，也不发布桌面包。Dependabot 只看 GitHub Actions。 |
| 选择性预检和 Project 审计评论 | 策略本身足够小，失败直接让检查变红。 |

-----

<a id="pull-request-policy"></a>
## PR 策略

[Issue policy](../workflows/issue-policy.yml) 适用于非草稿、且作者不是 Bot 或 App 的 PR。草稿和自动 PR 成功结束，不读取 Issue。

强制范围内的 PR 需要：

- 至少一个同仓库 Issue 引用。`Fixes`、`Closes`、`Resolves` 及其变体是解决型引用；其他引用只提供背景。
- 恰好一个 `kind/feature`、`kind/bug-fix`、`kind/doc`、`kind/testing`、`kind/cleanup` 或 `kind/dependency`。
- 至少一个 `area/*`。
- 最多一个 `p0`–`p3`。
- 不能使用已退役标签或 `source/*`。

一个关闭关键词只绑定紧随其后的那个引用。`Fixes #1 and #2` 只解决 `#1`。要解决两条，写成 `Fixes #1, fixes #2`。

解决型 PR 若任一被解决 Issue 带有优先级，PR 优先级必须等于其中最高者。`p0` 高于 `p3`。PR 自己带了优先级时，每个被解决 Issue 也必须有优先级。只含背景引用的 PR 可以自带优先级，不必匹配被引用 Issue。

REST 使用作业自带的 `GITHUB_TOKEN`。找不到 Issue、或编号实际指向 PR 时，检查失败，不绕过。

-----

<a id="lifecycle"></a>
## 生命周期

状态标签按这个顺序前进：

`status/inbox` → `status/backlog` → `status/ready` → `status/in-progress` → `status/in-review`

终态是 `status/done` 和 `status/no-action`。PR 事件不能改终态。

| 事件 | 结果 |
|---|---|
| Issue 打开且没有状态 | 加 `status/inbox` |
| Issue 关闭，原因是 completed | 换成 `status/done` |
| Issue 关闭，原因是 not planned | 换成 `status/no-action` |
| Issue 重新打开 | 换成 `status/ready`，并留言 |
| PR 打开、重开或修改正文，且有解决型引用 | 被解决 Issue 前进到 `status/in-progress` |
| 请求评审 | 前进到 `status/in-review` |
| 评审要求修改 | 从 `status/in-review` 退回 `status/in-progress` |
| 只改标题、只批准、只评论 | 不处理 |

没有状态标签时，解决型 PR 把它视为 Inbox，因此会进入 `status/in-progress`。已经处于 `status/in-review` 时，再次推送不会把它拉回进行中。

这是标签近似，不是 DeepSeek Harness 的 Project 协调器。它不知道是谁把状态设成 In review，所以要求修改时总会从 `status/in-review` 退回。多个 `status/*` 不会被猜测清理，只会留言。

-----

<a id="labels"></a>
## 标签

权威清单是 [labels.json](../labels.json)。推送到 `main` 且该文件变化时，[label-sync.yml](../workflows/label-sync.yml) 会创建或更新标签，不会删除标签。

退役默认标签需要本地显式执行：

```sh
GH_TOKEN="$(gh auth token)" node .github/issue-management/sync-labels.mjs --retire
```

`--retire` 会删除 `bug`、`enhancement`、`documentation` 以及其他已退役别名。不要把这些名字重新加回来。

领域可以增加。新的持久领域使用 `area/<lowercase-kebab-case>`，并同时写入 `labels.json` 和 [标签分类](../../docs/process/label-taxonomy.md)。不要为单个 PR、个人或临时项目建领域标签。

-----

<a id="limits"></a>
## 配置限制

[config.json](config.json) 里的 `projectEnabled` 是以后接入 Project 的开关。现在打开它只会让 Issue 校验失败，因为 Project 客户端还不存在。不要为了让旧文档看起来完整而把它改成 `true`。

生命周期由事件驱动。漏掉的事件不会回头修补状态。并发修改没有比较并交换保护。

-----

<a id="verification"></a>
## 验证

在仓库根目录运行：

```sh
node --test .github/issue-management/policy.test.mjs
node .github/issue-management/coding-gate.mjs
```

本地测试不证明 GitHub 事件投递或 token 权限。那两项由 Actions 里的 `Issue policy`、`Issue lifecycle` 和 `Repository checks` 覆盖。
