# DeepSeek Harness 消费契约

上游是 [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness)。所有者对照检出是 `/Users/kenyle/workspace/agent/deepseek-harness`。

## 本仓库要它做什么

- 提供 Agent 会话、工具调用、审批、技能、子代理和 MCP 客户端。
- 用 profile、bundle、preset 或插件装载 Sagebeast 的领域能力。
- 保留卸载语义：插件卸下后，工具和提示片段消失。
- 让自优化循环修改的是装载进去的 harness 表面，而不是上游源码。

## 本仓库不向它要什么

- 不要求上游加入股票数据源、复权或回测。
- 不把 Sagebeast 的业务补丁提交进上游核心包。
- 不复制 `docs/architecture.md` 里的 agent loop 到本仓库。

## 可对齐的 harness 表面

这些名字来自 Harness² 的八个可编辑组件，落地时必须映射到 DeepSeek Harness 已经存在的机制：

| 方法里的组件 | 预期落点 | 状态 |
|---|---|---|
| system prompt | prompt section 或 preset 指令 | 待 REQ-002 核实 |
| guardrails | 审批策略、工具可见性和安全提示 | 待 REQ-004 核实 |
| memory | 会话日志或明确的记忆插件 | 未选，不能私自新写一份记忆系统 |
| tool guidance | 工具描述 | 待工具需求 |
| subagents | 上游子代理工具 | 第一阶段不需要 |
| skills | 上游 skill | 待 REQ-007 |
| scripts | 受审批的命令，不是第二条运行时 | 待 Q2 |
| plugins | Cordis 插件和 patch | 待 Q1 |

「待核实」表示实现前要对照当时的上游文档。不能按本表假设 API 已经存在。

## 版本

文档阶段不锁定提交。REQ-002 接受后，开发说明必须记录所用版本或提交。本地检出升级不是 Sagebeast 的隐式依赖。

## 参考过的上游能力

GitHub 流程参考了上游 `.github` 的 Issue 模板、标签分类、受信任 PR 策略和生命周期事件。取舍见 [Issue 管理](../../.github/issue-management/README.zh.md)。那是流程参考，不是把上游 Actions 装进本仓库。
