# 需求管理

Sagebeast 的需求先写在目录里，接受后再成为 GitHub Issue。这样未决草案不会占满看板。

## 状态

| 状态 | 含义 | 放在哪里 |
|---|---|---|
| 草案 | 写明了意图，还不能开工 | [catalog.md](catalog.md) |
| 已接受 | 编号写入接受记录 | `docs/decisions/0003-catalog-accepted.md`，目前不存在 |
| 已立案 | 接受后用 Requirement 模板开 Issue | GitHub Issue，标签 `track/requirement` |
| 可开工 | 满足 [准备标准](definition-of-ready.md)，标签 `status/ready` | Issue |
| 进行中 | 有解决型 PR | `status/in-progress` |
| 评审中 | 已请求评审 | `status/in-review` |
| 完成 | Issue 以 completed 关闭 | `status/done` |
| 不处理 | Issue 以 not planned 关闭 | `status/no-action` |

## 日常规则

1. 改目录或决策记录前，先开 Task 或 Requirement Issue。文档 PR 用 `Fixes` 或 `Refs` 引用它。
2. 一条需求只回答一个可验收的结果。跨平面的大改拆开，用依赖写明顺序。
3. 优先级是 `p0`–`p3` 标签。没有标签表示尚未分拣，不是低优先级。
4. 解决型 PR 的优先级必须等于所解决 Issue 里最高的优先级。
5. Research 不直接变成代码。结论要回写开放问题或需求目录，再决定是否接受。

## 和 DeepSeek Harness 的对应关系

DeepSeek Harness 用 GitHub Project 保存状态和优先级，并用 App token 读写。本仓库还没有这个权限，所以用标签承担同样的两个字段。流程差异写在 [Issue 管理](../../.github/issue-management/README.zh.md)。

不要把 Project 字段名写进模板后假装已经接通。`projectEnabled` 保持 `false`。

## 阅读顺序

1. [需求目录](catalog.md)
2. [代码依据](code-basis.md)
3. [开放问题](open-questions.md)
4. [准备标准](definition-of-ready.md)
5. [接受方式](acceptance.md)

2026-10-23 重写了目录。REQ-007 已放弃。其余旧编号保留，但正文以目录当前版本为准。
