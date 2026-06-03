# 珪瞳雑感

前端与 AI 安全技术博客，基于 [VitePress](https://vitepress.dev/) + [vitepress-theme-teek](https://github.com/Kele-Bingtang/vitepress-theme-teek) 构建。

站点地址：<https://notes.teek.top>

## 技术栈

- [VitePress](https://vitepress.dev/) - 静态站点生成器
- [vitepress-theme-teek](https://github.com/Kele-Bingtang/vitepress-theme-teek) - 主题
- [Vue 3](https://vuejs.org/) - 前端框架
- [ECharts](https://echarts.apache.org/) - 数据可视化

## 本地开发

### 环境要求

- Node.js >= 18
- [pnpm](https://pnpm.io/) 包管理器

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm docs:dev
```

### 构建生产版本

```bash
pnpm docs:build
```

### 预览构建结果

```bash
pnpm docs:preview
```

## 项目结构

```
.
├── docs/
│   ├── .vitepress/          # VitePress 配置
│   │   ├── config.ts        # 主配置文件
│   │   ├── teekConfig.ts    # 主题配置
│   │   └── nav/             # 导航配置
├── push.sh                  # Git 推送脚本 (bash)
├── push.ps1                 # Git 推送脚本 (PowerShell)
└── package.json
```

## 部署

站点通过 GitHub Pages 部署，推送到 `main` 分支后自动构建部署。
