# AGENTS.md — GitHub 流程

修改 `.github` 前先读 [issue-management/README.md](issue-management/README.md)。

策略和生命周期作业使用默认分支上的受信任代码，不执行 PR 头里的 `policy.mjs`。需要 `issues` 写权限的只有生命周期和标签同步；PR 策略保持只读。

不要把 DeepSeek Harness 的桌面发布、沙箱、加权评审或 Project App 工作流复制进来。那些能力依赖上游仓库的运行器和 GitHub App，不是本仓库的需求管理基线。

`projectEnabled` 保持 `false`，直到 Project 客户端和 `read:project` 权限一起落地。不要在工作流里请求一个尚不存在的 App token。
