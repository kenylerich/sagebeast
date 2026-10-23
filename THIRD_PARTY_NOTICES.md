# 第三方说明

本仓库当前没有复制上游源码。下面只记录意图中的消费关系和许可，避免以后接入时把边界写丢。

| 上游 | 角色 | 许可 | 本仓库关系 |
|---|---|---|---|
| [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) | Agent 运行时 | MIT | 消费已安装的 `dsh`。不 fork，不把核心包搬进本仓库。 |
| [google-research/harness2](https://github.com/google-research/harness2) | 自优化方法参考 | Apache-2.0 | 参考 Propose–Probe–Compose 和经验库。不把 JobBench、LAB、WorkBuddy 或 OpenCode/Codex 执行器当成本项目运行时。 |
| [shy3130/tick-stock-panel](https://github.com/shy3130/tick-stock-panel) | 行情与研究数据平面 | MIT | 只通过其 Open API 或 MCP 读取。不复制数据源插件、指标流水线或面板 UI。 |

所有者本机对照检出：

- `/Users/kenyle/workspace/agent/deepseek-harness`
- `/Users/kenyle/workspace/agent/harness2`，远端 `kenylerich/harness2`，上游 `google-research/harness2`
- `/Users/kenyle/workspace/quant/tick-stock-panel`，远端 `kenylerich/tick-stock-panel`，上游 `shy3130/tick-stock-panel`

这些路径不是贡献者的必备环境，也不能代替版本锁定。版本锁定要等对应需求被接受后再写。

如果以后把 Apache-2.0 代码移植进本仓库，必须保留原版权声明和 `NOTICE`。只描述方法、不复制源码时，不把 Harness² 的实现文件搬进来。
