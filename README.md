# Sagebeast

基本面研究 App。页面用法接近 tick-stock-panel：任意页面都能打开 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 对话，用代码编写并反复运行策略。数据只经 [tick-stock-panel](https://github.com/shy3130/tick-stock-panel) 接入。Harness² 以后只用来优化本仓库的 harness，不作为执行器。

**当前阶段只有文档和需求管理。产品代码还没开始。** 需求目录被明确接受之前，[编码门禁](docs/decisions/0002-requirements-before-code.md) 会拒绝产品目录。2026-10-23 的目录是审阅草案，不是接受记录。

English summary: Sagebeast is a fundamental-analysis app. Any page can open a DeepSeek Harness conversation to write and run strategy code. Market data comes only from tick-stock-panel. Harness² is a later optimization method, not the runtime.

## 现在读什么

| 文档 | 作用 |
|---|---|
| [App 功能需求](docs/requirements/app-functions.md) | 按面板功能改写的审阅稿，先看这份 |
| [需求目录](docs/requirements/catalog.md) | 运行时和数据约束，不是功能清单 |
| [代码依据](docs/requirements/code-basis.md) | 本地代码证据 |
| [开放问题](docs/requirements/open-questions.md) | 还没选的实现选择 |
| [愿景](docs/vision.md) | 这个仓库做什么、不做什么 |
| [架构](docs/architecture.md) | 页面、运行器、Harness、数据 |
| [贡献流程](CONTRIBUTING.md) | Issue、标签、PR |
| [安全边界](SAFETY.md) | 非投顾、密钥、默认权限 |

## 三平面

```text
研究者
  └─ Sagebeast Agent
       ├─ 运行时平面    DeepSeek Harness    会话、工具、审批、插件
       ├─ 自优化平面    Harness² 方法        Propose–Probe–Compose 与经验库
       └─ 数据平面      tick-stock-panel    Open API / MCP，唯一行情入口
```

三个上游都保持独立仓库。Sagebeast 不 fork 它们的核心，也不在本仓库重写数据源、指标流水线或 Agent 循环。

## 仓库状态

远端是 [kenylerich/sagebeast](https://github.com/kenylerich/sagebeast)。需求管理配置在 [`.github`](.github/issue-management/README.zh.md)。

接受需求的方式写在 [如何接受](docs/requirements/acceptance.md)。在那份接受记录落地前，只处理文档和 `.github` 流程。

## 许可与上游

本仓库使用 [MIT](LICENSE)。上游许可和接入方式见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
