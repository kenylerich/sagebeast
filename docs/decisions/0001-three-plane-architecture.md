# 0001. 三个平面分开，不合并上游

状态：已记录，作为文档阶段的架构约束。实现仍要等需求接受。

## 背景

Sagebeast 同时依赖三套已经存在的系统：

- DeepSeek Harness 是 Agent 运行时，插件可以替换，核心循环不应在业务仓库里重写。
- Harness² 解决的是固定模型权重下的 harness 自优化，它的基准和执行器不属于股票研究。
- tick-stock-panel 已经拥有数据源插件、复权口径、开放网关和 MCP 薄桥。

如果把三者的代码合并进一个应用，数据口径、运行时升级和实验执行器会缠在一起。之后无法判断分数变化来自提示词、数据口径，还是执行器差异。

## 决定

Sagebeast 拥有 App 页面、策略目录和策略运行器，以及将来装入 DeepSeek Harness 的 preset、skill 和 plugin。它不拥有 Agent 循环，也不拥有行情落盘。

- 运行时消费 DeepSeek Harness，不 fork。
- 自优化参考 Harness² 的方法，不采用它的执行器和外部基准。
- 股票数据只通过 tick-stock-panel 的 Open API 或 MCP 进入。

上游保持各自仓库和许可。本仓库用文档记录消费契约，而不是用 git submodule 在文档阶段锁定实现。

## 后果

- 数据错误先查 tick-stock-panel 的契约和网关响应，不在 Sagebeast 里换算单位。
- harness 行为错误先查 DeepSeek Harness 的插件和会话，不另写循环。
- 跑分提升必须能在同一数据口径和同一运行时上复跑。优化器不能通过换数据源提高分数。
- Q1、Q2、Q3 仍要决定具体装载和驱动方式。本决定只固定平面边界，不提前选择包管理或进程模型。

## 放弃的方案

**把 tick-stock-panel 内嵌为库。** 会绕过 Token、scope 和限流，也会把内部 Parquet 口径泄漏给 Agent。

**把 DeepSeek Harness fork 进本仓库。** 上游迭代很快，业务补丁会无法合并。

**直接运行 Harness² 的 OpenCode 或 Codex 执行器。** 那会制造第二个 Agent 运行时，和「底层用 DeepSeek Harness」冲突。
