# Sagebeast

股票研究 Agent。运行时消费 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)，跑分自优化参考 [Harness²](https://arxiv.org/abs/2610.14224)，行情与研究数据只经 [tick-stock-panel](https://github.com/shy3130/tick-stock-panel) 接入。

**当前阶段只有文档和需求管理。产品代码还没开始，也不该开始。** 需求目录被明确接受之前，[编码门禁](docs/decisions/0002-requirements-before-code.md) 会拒绝产品目录。

English summary: Sagebeast is a stock-research agent. It uses DeepSeek Harness as the runtime, adapts the Harness² self-optimization method for its own benchmarks, and reads market data only through tick-stock-panel. This repository is in a documentation and requirements-management phase.

## 现在读什么

| 文档 | 作用 |
|---|---|
| [愿景](docs/vision.md) | 这个仓库做什么、不做什么 |
| [架构](docs/architecture.md) | 运行时、自优化、数据三个平面 |
| [开放问题](docs/requirements/open-questions.md) | 编码前需要确认的选择 |
| [需求目录](docs/requirements/catalog.md) | 草案需求，尚未接受 |
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
