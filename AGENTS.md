# AGENTS.md

改这个仓库前先读 [编码门禁](docs/decisions/0002-requirements-before-code.md) 和 [需求目录](docs/requirements/catalog.md)。

## 当前禁止

- 不要新增产品目录，包括 `src`、`packages`、`apps`、`python` 或应用包。
- 不要实现行情客户端、策略、回测、下单或自优化循环。
- 不要把 DeepSeek Harness、Harness² 或 tick-stock-panel 的源码复制进本仓库。
- 不要把 Token、`.env` 或账户数据写入提交。
- 不要在需求尚未接受时开实现类 PR。文档和 `.github` 流程除外。

`docs/decisions/0003-catalog-accepted.md` 不存在时，上面的禁止仍然有效。该文件出现后，只实现其中列出的需求编号。

## 边界

- 运行时用本机或已安装的 DeepSeek Harness。不在本仓库改上游。
- 跑分自优化只参考 Harness² 的方法。OpenCode 和 Codex 不是本项目的执行器。
- 股票数据只通过 tick-stock-panel 的 Open API 或 MCP。不直接调用数据源厂商，不复制 enriched 流水线。
- 默认不授予 `paper:trade` 和 `admin`。本项目不是投顾，也不做实盘下单。

## GitHub

Issue 和 PR 规则在 [`.github/issue-management/README.zh.md`](.github/issue-management/README.zh.md)。PR 必须引用同仓库 Issue，并带恰好一个 `kind/*` 和至少一个 `area/*`。

由代理建立的 Issue 加 `source/agent`。不要用已退役的 `bug`、`enhancement` 或 `documentation` 标签。
