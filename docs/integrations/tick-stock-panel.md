# tick-stock-panel 数据契约

上游是 [shy3130/tick-stock-panel](https://github.com/shy3130/tick-stock-panel)。所有者对照检出是 `/Users/kenyle/workspace/quant/tick-stock-panel`，其 `upstream` 指向官方仓库。

数据口径以该检出的 `CONTRIBUTING.md`、开放网关和 MCP 文档为准。本文件只规定 Sagebeast 如何消费，不复述或改写金融口径。

## 唯一入口

允许：

- 开放网关的 HTTP API，使用 `Authorization: Bearer tsp_...`。
- 上游自带的 MCP 薄桥。它转发到同一网关，权限仍由网关决定。

不允许：

- 读取面板的 Parquet、DuckDB、`data/` 或后端服务对象。
- 直接调用 TickFlow 或其他数据源插件。
- 在 Sagebeast 里实现第二份复权、指标或交易日日历。
- 网关失败后改用网页、缓存旧口径或另一个厂商补数。

## 默认 scope

| Scope | 文档阶段的态度 |
|---|---|
| `read:market` | 第一段只读会话可以申请 |
| `read:analysis` | 只有任务明确要求市场环境或策略读取时才申请 |
| `read:ext` | 默认不申请 |
| `write:ext` | 不授予 |
| `run:backtest` | 不授予，见开放问题 Q5 |
| `paper:trade` | 不授予 |
| `admin` | 永不授予 Token |

MCP 的 `TSP_SCOPES` 不能宽于 Token 的实际 scope。声明了未授权的 scope 时，应把 403 交给 Agent，而不是在客户端隐藏错误。

## 调用记录

每次数据调用的可复核记录至少包含：

- 端点或 MCP 工具名。
- 请求时间与返回数据所代表的交易时间。面板没有给出数据时间时，回答不能把本地时钟说成行情时间。
- 使用的 scope。
- 失败时的状态码和网关错误正文，去掉 Token。

## 口径

不要在本仓库重新定义 `change_pct`、`turnover_rate`、复权价和涨跌停判定价。实现若必须跨字段展示，先引用 tick-stock-panel 的当前契约，并为其边界转换写测试。禁止用数值大小猜测单位。

交易日、午休、收盘归属和北京时间以面板为准。Sagebeast 的服务器时区不能参与这些判断。

## 测试

契约测试使用录制响应或本地假网关。不在 CI 里访问个人面板，不把 `.env` 提交进仓库。录制文件要删除 Token 和账户标识。

## 版本

文档阶段不锁定面板版本。REQ-003 接受后，实验记录必须包含面板版本或提交，否则不同口径的分数不能比较。
