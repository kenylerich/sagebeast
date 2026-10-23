# 架构

Sagebeast 是三个上游之上的薄产品层。决策记录见 [0001](decisions/0001-three-plane-architecture.md)。

```text
┌──────────────────────────────────────────────────────────┐
│ Sagebeast                                                 │
│  领域技能、研究任务、评分契约、实验记录、dsh preset/plugin │
└────────────┬────────────────────┬────────────────────────┘
             │                    │
             ▼                    ▼
┌────────────────────┐   ┌────────────────────────┐
│ 运行时平面          │   │ 自优化平面              │
│ DeepSeek Harness   │   │ Harness² 方法           │
│ 会话、工具、审批、MCP │   │ 提议、探测、组合、经验库 │
└─────────┬──────────┘   └───────────┬────────────┘
          │                          │
          └──────────┬───────────────┘
                     ▼
          ┌──────────────────────┐
          │ 数据平面              │
          │ tick-stock-panel     │
          │ Open API / MCP       │
          └──────────────────────┘
```

## 运行时平面

DeepSeek Harness 提供 Agent 循环、工具注册、会话日志、审批、技能和 MCP 客户端。Sagebeast 以后以 profile、preset 或插件包的形式装入，而不是复制一个新的 Agent 循环。

消费契约见 [deepseek-harness.md](integrations/deepseek-harness.md)。插件包放在本仓库还是独立包，仍是 [开放问题 Q1](requirements/open-questions.md)。文档阶段不创建包。

## 自优化平面

Harness² 说明：模型权重不变时，仍可以通过对比执行证据改进 harness。本项目只借用这个方法，用来提高 Sagebeast 自己的研究任务分数。

可编辑对象要对齐 DeepSeek Harness 已有表面：系统提示、护栏、记忆、工具说明、子代理、技能、脚本和插件配置。不引入第二套执行器。

方法契约见 [harness2.md](integrations/harness2.md)。循环放在 `dsh` workflow 内还是仓外驱动器，仍是 [开放问题 Q2](requirements/open-questions.md)。

## 数据平面

所有股票数据从 tick-stock-panel 进入。它的开放网关负责认证、scope、限流和字段契约。MCP 服务器是这层网关的薄桥，不是另一套数据实现。

契约见 [tick-stock-panel.md](integrations/tick-stock-panel.md)。库代码走 Open API 还是会话只挂 MCP，仍是 [开放问题 Q3](requirements/open-questions.md)。两条路都必须终结在同一网关。

## 仓库里现在有什么

只有文档和 GitHub 流程。编码门禁允许的顶层路径写在 [`.github/issue-management/coding-gate.mjs`](../.github/issue-management/coding-gate.mjs)。

以后的产品代码必须能指出它属于哪个平面。一个改动同时碰运行时权限和数据口径时，PR 要带多个 `area/*`，并在正文写明边界。
