# 准备标准

Issue 进入 `status/ready` 前，维护者确认下面每一项。缺一项就留在 `status/backlog` 或 `status/inbox`。

## 所有 Issue

- 使用 Feature、Bug 或 Task 之一。
- 标题能单独看懂，不依赖聊天记录。
- 正文有验收条件或可交付物。
- 非目标已写明。
- 至少建议了一个 `area/*`。PR 仍要自己带领域标签。
- 若设置优先级，只有一个 `p0`–`p3`。
- 不包含密钥、账户或可复用 Token。

## 产品需求

- 编号已写入 `docs/decisions/0003-catalog-accepted.md`。
- 挡住它的开放问题已有决策记录。
- 写明影响的平面。数据平面改动要指出 scope 和失败行为。
- 安全影响不是「上线后再看」。
- 验收不依赖未记录的人工判断。需要人看的输出，写明看什么证据。

## 文档和流程

- 不夹带产品实现。
- 改标签或策略时，同步更新 [标签分类](../process/label-taxonomy.md) 和流程 README。
- 本地 `node --test .github/issue-management/policy.test.mjs` 能通过，或 PR 说明为什么还不能跑。

## 不能进入 Ready 的情况

- 需求仍是目录草案。
- 验收写着「体验更好」或「参考上游实现」而没有可观察结果。
- 为了开工先把 `paper:trade` 加进默认 scope。
- 用跨仓库 Issue 代替本仓库需求。
