# 代码依据

日期：2026-10-23。这是需求目录的证据，不是实现说明。路径都在所有者本机检出里，没有把上游源码复制进本仓库。

## 产品形态

tick-stock-panel 的 AI 助手不是独立网站。`frontend/src/custom/assistant/AssistantLauncher.tsx` 挂在全站常驻插槽上。侧栏有入口，悬浮球可拖，`⌘K` 能打开。`AssistantDrawer.tsx` 从页面右缘滑入，默认约 720px，不挡住整站导航。

Sagebeast 要的是同一种用法：自己的 App 页面负责看数据和设计策略，任意页面都能打开对话。对话运行时是 DeepSeek Harness，不是 tick-stock-panel 里那套自定义助手。

DeepSeek Harness 没有现成的「嵌进别人 React 应用的抽屉组件」。它提供 `web`、`headless`、`sdk`、`acp` 等 profile。所以「任意页面打开 Harness」是需求，装载方式仍是开放问题，不能写成已经有的 API。

## 策略是代码

tick-stock-panel 的策略是 Python 文件，不是只存在于表单里的规则。`backend/app/strategy/prompts/strategy-guide.md` 规定：

- 自定义策略放在 `data/strategies/custom/`。
- AI 生成策略放在 `data/strategies/ai/`。
- 禁止把生成策略写进 `backend/app/strategy/builtin/`，也禁止借生成策略去改项目源码。
- 文件带 `META`，并显式声明 `EXECUTION_BACKEND`。

这说明「策略要编码」在数据平面里已经成立。Sagebeast 不能把策略只做成聊天记录。对话负责写出代码；运行器负责登记、执行和保存结果。

DeepSeek Harness 的编码能力来自文件工具、shell、`AGENTS.md` 和 skills，没有一个名叫 vibe coding 的开关。`packages/context/agent-instructions` 会加载工作区 `AGENTS.md`。`packages/skill/skill-filesystem` 从项目 `.agents/skills`、`.dsh/skills` 和用户目录发现 `SKILL.md`。`dsh-base` 挂载 MCP 客户端；没有配置服务器时，不出现 MCP 工具。

因此策略接入 DeepSeek Harness 的方式是：Sagebeast 提供策略目录、`AGENTS.md` 和 skill，对话在这些边界里写代码。不改 DeepSeek Harness 核心，也不改 tick-stock-panel 内置策略目录。

## 定时、并发和长任务

DeepSeek Harness 的 `packages/schedule/schedule` 能保存一次性、每日、每周和 cron 提醒。宿主重启后任务还在。到期后恢复原会话，把指令送进收件箱。文档写明：回执只表示消息入队，不表示模型已经执行完。宿主没运行就不会投递。停机后重复任务只补最近一次。子代理会话不能创建提醒。

`packages/jobs` 能看后台任务的输出和取消，任务属于当前进程里的会话所有者。`workflow` 能并发派子代理。这两样适合编排和查看，不适合代替一次要扫很多标的、可能跑几小时的策略运行器。

所以定时负责叫醒，运行器负责执行。不能把「创建一条 cron 提醒」写成「策略已经按周跑完」。

## 数据覆盖

tick-stock-panel 的正式资产类型是股票、ETF 和指数。策略种子和回测配置在 `stock` 与 `etf` 之间切换。财务因子在 `backend/app/factors/registry.py` 里标记为 `asset_types` 仅股票，并且是公告日点时数据。

`docs/paper-trading-plan.md` 明确不做实盘、融资融券、期权和期货。仓库里没有可转债或期货的一等资产类型，也没有对应的基本面契约。

开放网关和 `mcp-server` 是消费入口。MCP 是薄桥，权限仍由 Token scope 决定。Sagebeast 取数走这里，不读 Parquet，不直接调数据源厂商。

股票基本面可以沿财务同步和已有经营分析计划往下接。ETF 目前主要是技术指标。可转债和期货要先有数据契约，不能假装面板已经提供。

## 界面发虚

`frontend/src/lib/chartDpr.ts` 写明：页面用 `transform: scale` 放大时，文字和 SVG 仍清晰，canvas 图表会按布局像素光栅化后再被拉伸，K 线和分时会发虚。ECharts 有补偿，lightweight-charts 没有同等选项。全站大量 `backdrop-blur`。`ListColumnCustomizerInner.tsx` 注明，信息条背后有 canvas 时，背景模糊会造成额外 GPU 合成。

这和「看起来模糊、看着难受」对得上。它是渲染方式问题，不是需求本身。Sagebeast 的界面要求是：正文和图表在常见缩放下保持清晰，不把背景模糊当成默认质感。

## Harness²

`harness2/core/spec.py` 把方法、执行器和基准分开。方法是提议、探测、组合和经验库。执行器是 OpenCode 或 Codex 通道。基准是 JobBench、LAB、WorkBuddy。

Sagebeast 只借用方法，用来改进装在 DeepSeek Harness 上的 `AGENTS.md`、skills、工具说明和插件配置。执行会话仍是 DeepSeek Harness。分数来自 Sagebeast 自己的基本面任务，不来自那些外部基准，也不训练模型权重。
