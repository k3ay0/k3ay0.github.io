---
title: Pixbeads — 从图片到拼豆图纸的应用
date: 2026-06-10 00:00:00
permalink: /projects/pixbeads
categories:
  - 项目
tags:
  - Vue
  - Tauri
  - TypeScript
  - 拼豆
  - 图像处理
article: false
---

Pixbeads 是一款跨平台的拼豆图纸生成工具，基于 Tauri 2 + Vue 3 构建。它将任意图片转换为标准拼豆图纸，支持 5 大品牌共 291 种颜色的精准匹配。整个处理流程完全在本地完成，无需网络连接。

<!-- more -->

## 项目背景

拼豆（Perler Beads）是一种流行的像素艺术手工形式。制作者需要先将图片转化为网格化的色号图纸，再逐颗拼接。这个转化过程如果纯手工完成，耗时且容易出错。

Pixbeads 源自 [perler-beads](https://github.com/Zippland/perler-beads) 项目（Next.js/React），在保留核心算法的基础上进行了 Vue 3 全面重构，同时引入了 Pinia 状态管理、Web Worker 并行处理、以及 Tauri 桌面打包能力。

## 技术架构

```
┌─────────────────────────────────────────────────┐
│                  Tauri 2 Shell                   │
│  ┌───────────────────────────────────────────┐   │
│  │           Vue 3 + TypeScript              │   │
│  │  ┌──────────┐  ┌──────────┐  ┌─────────┐ │   │
│  │  │ 6 Stores │  │ Compose  │  │ 28 SFCs │ │   │
│  │  │ (Pinia)  │  │ (12个)   │  │         │ │   │
│  │  └──────────┘  └──────────┘  └─────────┘ │   │
│  │  ┌──────────────────┐  ┌───────────────┐  │   │
│  │  │ Utils (核心算法)  │  │ Web Worker    │  │   │
│  │  │ pixelation.ts    │  │ 像素化并行    │  │   │
│  │  └──────────────────┘  └───────────────┘  │   │
│  └───────────────────────────────────────────┘   │
│  ┌───────────────────────────────────────────┐   │
│  │        Rust 后端（当前为脚手架）            │   │
│  └───────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

技术栈选型：

| 技术 | 版本 | 职责 |
|------|------|------|
| Tauri | 2.x | 桌面壳，文件系统访问，跨平台打包 |
| Vue 3 | 3.4+ | Composition API + `<script setup>` |
| Pinia | - | 6 个 Store 划分状态域 |
| TypeScript | 严格模式 | 类型安全，含自定义类型定义 |
| Vite | 5.2 | 开发服务器 + 构建（端口 1420） |
| Tailwind CSS | 3.4 | 原子化样式 |
| Bun | - | 包管理 + 运行时 |

## 核心算法深度解析

### Oklab 色彩匹配

拼豆颜色匹配的质量直接决定图纸的可用性。Pixbeads 没有使用常见的 RGB 欧氏距离，而是采用了 **Oklab 色彩空间**。

Oklab 由 Björn Ottosson 于 2020 年提出，是一个感知均匀的色彩空间——在这个空间中，数值上的等距对应人眼感知上的等距。转换链路：

```
sRGB → 线性 RGB → LMS（锥体响应）→ Oklab (L, a, b)
```

核心代码（`pixelation.ts`）：

```typescript
function rgbToOklab(rgb: RgbColor): { l: number; a: number; b: number } {
  const r = srgbChannelToLinear(rgb.r)  // sRGB gamma 解码
  const g = srgbChannelToLinear(rgb.g)
  const b = srgbChannelToLinear(rgb.b)

  // 线性 RGB → LMS 锥体空间
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b

  // 立方根压缩 + 线性变换到 Oklab
  const lRoot = Math.cbrt(l)
  const mRoot = Math.cbrt(m)
  const sRoot = Math.cbrt(s)

  return {
    l: 0.2104542553 * lRoot + 0.7936177850 * mRoot - 0.0040720468 * sRoot,
    a: 1.9779984951 * lRoot - 2.4285922050 * mRoot + 0.4505937099 * sRoot,
    b: 0.0259040371 * lRoot + 0.7827717662 * mRoot - 0.8086757660 * sRoot,
  }
}
```

颜色距离计算：

```typescript
function colorDistance(rgb1: RgbColor, rgb2: RgbColor): number {
  const oklab1 = getOklabColor(rgb1)  // 带缓存
  const oklab2 = getOklabColor(rgb2)
  const dl = oklab1.l - oklab2.l
  const da = oklab1.a - oklab2.a
  const db = oklab1.b - oklab2.b
  return Math.sqrt(dl * dl + da * da + db * db) * 100
}
```

Oklab 值通过 `Map` 进行缓存，避免重复计算。对于 291 色的调色板，缓存命中率极高。

### 两种像素化模式

系统支持两种提取单元格代表色的策略：

- **Dominant（主色模式）**：统计区域内所有像素的出现频率，取出现次数最多的颜色。适合卡通风格图片，能保留清晰的色块边界。
- **Average（均色模式）**：计算区域内所有像素的 RGB 平均值。适合写实风格图片，过渡更柔和。

两种模式在同一个 `calculateCellRepresentativeColor` 函数中实现，通过 `PixelationMode` 枚举分支。

### BFS 区域合并

原始像素化会产生大量零散的杂色点。`mergeSimilarRegions` 通过合并相似颜色来平滑结果：

1. 统计所有颜色的出现频率，按频次降序排列
2. 对每种颜色，在更低频次的颜色中查找 Oklab 距离 < 阈值的近似色
3. 将低频近似色的所有单元格替换为高频色

这是一种贪心策略——高频色"吸收"低频近似色，自然保留了视觉主体。

### 洪水填充

项目中有三处使用了洪水填充算法（DFS 栈实现）：

| 用途 | 函数 | 说明 |
|------|------|------|
| 背景移除 | `removeBackground` | 从边界开始，标记连通的背景色为 `isExternal` |
| 区域擦除 | `floodFillErase` | 一键擦除同色连通区域 |
| 区域填充 | `floodFill` | 将连通同色区域填充为新颜色 |

背景移除的特殊之处在于起点选择——它将网格四条边的所有单元格压入栈中，确保角落和边缘的背景色都能被正确识别。

## 状态管理设计

项目使用 Pinia 拆分为 6 个 Store，每个职责明确：

| Store | 职责 |
|-------|------|
| `beadStore` | 图片源、像素数据、网格尺寸、处理参数 |
| `paletteStore` | 色板选择、自定义色板、排除色管理 |
| `canvasStore` | 画布缩放、平移、悬停提示 |
| `editorStore` | 编辑模式状态、工具选择、撤销历史 |
| `focusStore` | 专心模式进度、计时器、引导策略 |
| `uiStore` | 当前模式、弹窗控制、Toast 消息 |

所有 Store 均使用 Composition API 风格（`setup` 函数），与 Vue 3 的 `<script setup>` 保持一致。

## Web Worker 并行处理

图像像素化是计算密集型操作。对于一张 200×200 的网格，需要执行 40000 次 Oklab 色彩匹配。Pixbeads 将此过程卸载到 Web Worker 中：

```typescript
// pixelation.worker.ts
self.onmessage = (e: MessageEvent<ProcessMessage>) => {
  const { imageData, imgWidth, imgHeight, N, M, palette, mode, threshold, fallbackColor } = e.data
  oklabCache.clear()

  // 阶段 1：像素化 + 色彩映射
  let result = calculatePixelGrid(imageData, imgWidth, imgHeight, N, M, palette, mode, fallbackColor)

  // 阶段 2：区域合并（可选）
  if (threshold > 0) {
    result = mergeSimilarRegions(result, threshold, palette)
  }

  self.postMessage({ type: 'result', mappedPixelData: result })
}
```

Worker 在每个处理阶段（逐行像素化、逐色合并）都会通过 `postMessage` 发送进度更新，前端的 `workerManager.ts` 负责管理 Worker 生命周期和消息路由。

## 专心拼豆模式

这是 Pixbeads 最具特色的功能——将拼豆制作过程游戏化：

- **灰度背景**：将已完成和未完成区域显示为灰色，仅高亮当前颜色的拼豆位置
- **三种引导策略**：最近优先（减少手部移动）、最大优先（快速推进进度）、边缘优先（从外向内）
- **推荐区域**：用红色虚线框标注当前最佳操作区域
- **自动切换**：当前颜色完成后自动切换到下一个颜色
- **分区网格线**：可配置间隔的辅助线，方便定位
- **计时器**：记录制作耗时，完成时生成打卡卡片

该模式通过独立的 `focusStore` + `useFocusModeLogic` composable 实现，与编辑模式完全解耦。

## 组件架构

28 个 Vue SFC 组件按功能域组织：

**编辑侧**：`CanvasArea`（画布主区域）、`EditToolbar`（工具栏）、`EditSidebar`（编辑侧边栏）、`FloatingPalette`（悬浮调色盘）、`MagnifierTool`（放大镜）

**优化侧**：`OptimizeSidebar`（优化参数）、`PreviewSidebar`（预览面板）

**专心模式**：`FocusCanvas`、`FocusToolBar`、`FocusSidebar`、`FocusColorPanel`、`FocusColorRing`

**通用**：`AppHeader`、`ImageCropper`、`CustomPaletteEditor`、`DownloadSettingsModal`、`CelebrationAnimation`、`CompletionCard`

重型组件（`MagnifierTool`、`DonationModal`、`CustomPaletteEditor`）使用 `defineAsyncComponent` 懒加载，并附加 `.catch` 容错：

```typescript
const MagnifierTool = defineAsyncComponent(() =>
  import('./components/MagnifierTool.vue').catch(() => ({ render: () => null }))
)
```

## Composables 层

12 个 composable 将业务逻辑从组件中抽离：

| Composable | 职责 |
|------------|------|
| `useImageProcessing` | 图片加载后的像素化处理流程 |
| `usePixelEditing` | 像素级编辑操作入口 |
| `usePixelEditingOperations` | 具体编辑操作实现 |
| `useManualEditingState` | 手动编辑模式状态 |
| `useBackgroundRemoval` | 背景移除流程 |
| `useFocusModeLogic` | 专心模式业务逻辑 |
| `useCanvasRenderer` | Canvas 2D 渲染管线 |
| `useCanvasInteraction` | 画布鼠标交互 |
| `useCanvasTransform` | 缩放/平移变换 |
| `useFileIO` | 文件导入导出（含 .pbds 格式） |
| `useKeyboardShortcuts` | 快捷键绑定 |
| `useMarchingAnts` | 选区蚂蚁线动画 |

## 数据持久化

- **localStorage**：色板选择、自定义色板配置、UI 偏好设置
- **.pbds 格式**：自定义的项目文件格式，可导出完整图纸数据供后续导入
- **导出**：带 Key 的 PNG 图纸、颜色统计图、CSV 数据

## 构建与开发

```bash
# 安装依赖（必须用 Bun）
bun install

# Web 开发
bun run dev          # Vite on :1420

# 桌面开发
bun run tauri dev    # Vite + Rust

# 构建
bun run build        # Web 产物
bun run tauri build  # 桌面安装包
```

::: warning 注意
项目必须使用 Bun 作为包管理器。使用 npm install 会导致 node_modules 损坏。
:::

## 与 perler-beads 的对比

Pixbeads 并非 perler-beads 的简单移植，而是架构层面的重构：

| 维度 | perler-beads | Pixbeads |
|------|-------------|----------|
| 框架 | Next.js 15 + React 19 | Tauri 2 + Vue 3 |
| 状态管理 | 组件内 useState（~2800 行单文件） | Pinia 6 Store |
| 代码组织 | 逻辑集中于 page.tsx | Composables + Utils 分层 |
| 桌面能力 | PWA（受限） | Tauri（完整系统权限） |
| 包管理器 | npm | Bun |
| 路由 | Next.js App Router | Vue Router |

核心算法（像素化、Oklab 匹配、洪水填充）保持一致，色板数据（291 色 × 5 品牌）独立维护。

## 未来方向

Rust 后端目前仅是脚手架状态，后续计划利用 Tauri 的本地能力集成 AI 图像识别，实现更智能的图纸转化——例如自动识别图片主体、智能裁剪建议、以及基于内容的配色优化。
