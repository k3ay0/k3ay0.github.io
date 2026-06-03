---
title: Hermes Agent 使用体验
date: 2026-06-04 00:00:00
permalink: /techessays/hermes-agent
categories:
  - 随笔/技术随笔
tags:
  - AI
  - 工具
---

## 初识 Hermes

第一次接触 Hermes Agent 是在一个需要同时处理多个技术栈的项目中。当时的需求很典型：一边要写前端组件，一边要调试后端接口，还要处理部署脚本。传统的开发方式是在多个终端窗口之间来回切换，效率不高。

Hermes 是 Nous Research 开源的 AI Agent 框架，运行在终端里，通过工具调用与系统交互。和 Claude Code、OpenAI Codex 属于同一类工具，但有一个关键区别——它不绑定任何单一模型，支持 20 多个 LLM 提供商，从 OpenRouter、Anthropic 到本地模型都可以接入。

## 核心体验

### 终端即界面

Hermes 的交互方式非常直接。启动后进入一个 REPL 环境，用自然语言描述任务，Agent 会自动分解为工具调用序列：读文件、写代码、执行命令、搜索文档。整个过程在终端中完成，不需要切换到其他界面。

```bash
# 启动交互会话
hermes

# 单次查询
hermes chat -q "分析这个项目的构建配置，找出性能瓶颈"
```

这种交互模式的好处是注意力不中断。开发者的工作流本来就在终端中——编辑器、Git、构建工具、测试——Hermes 只是多了一个能理解上下文的协作者。

### 技能系统

Hermes 最有意思的设计是技能系统。当它解决了一个复杂问题、发现了一个工作流、或者被纠正了做法，可以把这些经验保存为技能文件。技能文件本质上是结构化的 Markdown，包含触发条件、操作步骤和注意事项。

```bash
# 查看已安装的技能
hermes skills list

# 从技能库安装
hermes skills search "docker deploy"
hermes skills install <id>
```

这意味着 Agent 会越用越好。第一次部署 Docker 可能需要来回调试，但技能记录了完整的流程后，下次就能直接执行。技能还可以通过 Hub 分享，社区驱动的知识积累比单个 Agent 的上下文窗口更有价值。

### 跨会话记忆

Hermes 有持久化记忆能力。它会记住你的技术栈偏好、项目结构、常用命令，甚至你纠正过它的方式。这些信息保存在本地数据库中，跨会话可用。

记忆的价值在于减少重复沟通。不需要每次都解释"用 pnpm 不用 npm"、"代码格式化用 Prettier"、"提交信息用中文"——这些偏好被记住后，Agent 会自动遵循。

### 多平台网关

除了终端，Hermes 还能通过网关接入各种消息平台：Telegram、Discord、Slack、微信、邮件。同一个 Agent 实例可以在不同平台上响应，共享相同的工具和记忆。

```bash
# 启动网关
hermes gateway run

# 或作为后台服务
hermes gateway install
hermes gateway start
```

这在团队协作场景下很实用。在 Telegram 群组里 @Agent 让它查日志、在 Discord 频道里让它跑测试、通过邮件触发定时报告——工具和能力是一致的，只是入口不同。

## 实际使用场景

### 项目脚手架

新项目初始化是最直接的使用场景。描述技术栈需求，Hermes 会生成完整的项目结构、配置文件、依赖声明，并执行安装。

```bash
hermes chat -q "创建一个 React + TypeScript + Vite 项目，包含 ESLint、Prettier 配置，使用 pnpm 管理依赖"
```

它不只是生成模板文件，还会根据当前环境调整配置——如果检测到 WSL，会处理路径映射；如果检测到已有项目，会避免覆盖现有文件。

### 代码审查与调试

让 Agent 审查代码是高频用法。它能读取 Git diff，分析变更，指出潜在问题：

```bash
hermes chat -q "审查最近一次 commit 的变更，关注安全和性能问题"
```

调试时，Hermes 能执行代码、查看日志、搜索相关文件，在终端中完成完整的排查流程。比起在 IDE 和终端之间来回切换，这种连续的上下文更高效。

### 定时任务

Hermes 内置了 cron 调度器，可以设置定时任务：

```bash
hermes cron create "0 9 * * *" -p "检查 GitHub 仓库的最新 issue，生成摘要报告"
```

定时任务可以绑定技能、指定模型、设置投递目标。适合做监控报告、数据采集、定期备份检查等运维场景。

## 与其他工具的对比

### vs Claude Code

Claude Code 是 Anthropic 的终端 Agent，深度集成 Claude 模型。优势在于 Claude 的代码理解和生成质量，劣势是绑定单一提供商。Hermes 的模型无关设计让它在成本和灵活性上有优势——可以用 DeepSeek 处理简单任务，用 Claude 处理复杂推理。

### vs GitHub Copilot CLI

Copilot CLI 专注于代码补全和 Git 操作，是辅助工具。Hermes 是自主 Agent，能执行完整的任务链——从需求分析到代码编写到测试验证。两者的定位不同，可以互补使用。

### vs 直接使用 LLM API

直接调 API 的话，需要自己管理上下文、处理工具调用、实现错误重试。Hermes 把这些基础设施都封装好了，还额外提供了记忆、技能、多平台等能力。对于需要频繁与 LLM 交互的开发者，Agent 框架的价值在于它把"调用模型"变成了"与助手协作"。

## 一些使用心得

### 技能积累很重要

刚开始用的时候，Hermes 的表现可能和普通 LLM 差别不大。但随着使用时间增长，技能库和记忆积累起来后，效率提升是指数级的。建议在解决复杂问题后主动保存技能，而不是等 Agent 自己决定。

### 配置调优

默认配置适用于大多数场景，但有些参数值得根据实际情况调整：

```bash
# 调整终端超时时间（默认 180 秒）
hermes config set terminal.timeout 300

# 调整上下文压缩阈值
hermes config set compression.threshold 0.6

# 设置审批模式
hermes config set approvals.mode smart
```

### Profile 隔离

如果有多个项目或多个用途（开发、运维、写作），建议用 Profile 隔离：

```bash
hermes profile create dev
hermes profile create ops
hermes profile use dev
```

每个 Profile 有独立的配置、技能和记忆，避免上下文污染。

### 与现有工具链集成

Hermes 不是要替代现有的开发工具，而是作为一个协调层。它可以通过 MCP 协议连接外部服务，通过 Webhook 触发自动化流程，通过 cron 调度定时任务。把它想象成一个能理解自然语言的脚本运行器会更准确。

## 技术架构简析

从实现角度看，Hermes 的核心是一个对话循环：

1. 构建系统提示词（包含环境信息、工具定义、记忆注入）
2. 调用 LLM（OpenAI 兼容格式，支持任意提供商）
3. 解析响应中的工具调用
4. 执行工具，将结果追加到上下文
5. 重复 2-4 直到 LLM 返回文本响应

上下文管理是关键挑战。长对话会接近 token 限制，Hermes 通过压缩机制自动处理——保留关键信息，压缩冗余历史。这个过程对用户透明，不需要手动管理上下文窗口。

工具系统采用注册表模式，每个工具是一个独立的 Python 模块，通过 `registry.register()` 注册。新工具只需要一个文件，加上 `check_fn` 声明依赖条件即可。

## 写在最后

AI Agent 还处于早期阶段，但已经能看到它的价值——不是替代开发者，而是把重复性的工作自动化，让开发者专注于真正需要创造力的部分。Hermes 的开放性设计（模型无关、技能系统、多平台）给了它足够的扩展空间，值得持续关注和使用。

技术的选择最终要看实际收益。对我来说，Hermes 已经成为终端中不可或缺的工具。它不完美，但它在持续进化，而技能系统让它能从每次使用中学习。这种"越用越好"的模式，可能是 AI Agent 最有价值的特征。
