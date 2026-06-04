---
title: Vite 构建工具深入指南
date: 2026-06-03 00:00:00
permalink: /frontend/vite
categories:
  - 前端
tags:
  - Vite
  - ESM
  - 前端工程化
---

# Vite 构建工具深入指南

Vite 是下一代前端构建工具，它利用浏览器原生 ES 模块和 esbuild 预构建，实现了极快的开发服务器启动速度。相比 Webpack，Vite 的开发体验有了质的飞跃。本文将深入探讨 Vite 的核心原理和实战技巧。

## 为什么选择 Vite

传统打包工具如 Webpack 的工作原理是遍历整个依赖图，将所有模块打包成一个或多个 bundle。随着项目规模增大，启动时间会显著增长。

Vite 采用了不同的策略：
- **开发环境**：利用浏览器原生 ESM，按需加载模块
- **生产环境**：使用 Rollup 打包，确保最佳的输出质量

```javascript
// 传统打包工具的工作方式
// 1. 解析入口文件
// 2. 递归遍历所有依赖
// 3. 打包成 bundle
// 4. 启动开发服务器

// Vite 的工作方式
// 1. 启动开发服务器（几乎瞬间完成）
// 2. 浏览器请求模块时按需转换
// 3. 只处理当前页面需要的模块
```

## 快速上手

**创建 Vite 项目**

```bash
# 使用 npm
npm create vite@latest my-project -- --template vue

# 使用 yarn
yarn create vite my-project --template vue

# 使用 pnpm
pnpm create vite my-project --template vue
```

**项目结构**

```
my-project/
├── node_modules/
├── public/
│   └── vite.svg
├── src/
│   ├── assets/
│   ├── components/
│   ├── App.vue
│   └── main.js
├── index.html
├── package.json
├── vite.config.js
└── tsconfig.json
```

## 核心配置

**基础配置**

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  // 插件
  plugins: [vue()],
  
  // 开发服务器配置
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  
  // 构建配置
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router'],
          utils: ['lodash', 'dayjs']
        }
      }
    }
  },
  
  // 路径别名
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@utils': resolve(__dirname, 'src/utils')
    }
  }
})
```

**环境变量**

Vite 使用 `.env` 文件来管理环境变量：

```bash
# .env - 所有环境都会加载
VITE_APP_TITLE=My App

# .env.development - 开发环境
VITE_API_BASE=http://localhost:8080/api

# .env.production - 生产环境
VITE_API_BASE=https://api.example.com
```

在代码中使用环境变量：

```javascript
// 只有以 VITE_ 开头的变量才会暴露给客户端
const apiUrl = import.meta.env.VITE_API_BASE
const title = import.meta.env.VITE_APP_TITLE

// 特殊变量
console.log(import.meta.env.MODE) // 'development' 或 'production'
console.log(import.meta.env.BASE_URL) // 基础路径
console.log(import.meta.env.PROD) // 是否是生产环境
console.log(import.meta.env.DEV) // 是否是开发环境
```

## 插件系统

Vite 的插件系统兼容 Rollup 插件，同时扩展了一些 Vite 特有的钩子。

**常用官方插件**

```javascript
// vite.config.js
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import legacy from '@vitejs/plugin-legacy'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    legacy({
      targets: ['defaults', 'not IE 11']
    }),
    viteStaticCopy({
      targets: [
        { src: 'config/*.json', dest: 'config' }
      ]
    })
  ]
})
```

**自定义插件**

```javascript
// vite-plugin-example.js
export default function myPlugin(options = {}) {
  return {
    name: 'vite-plugin-example',
    
    // Vite 特有的钩子
    config(config, { command }) {
      // 修改配置
      return {
        define: {
          __APP_VERSION__: JSON.stringify('1.0.0')
        }
      }
    },
    
    configureServer(server) {
      // 配置开发服务器
      server.middlewares.use((req, res, next) => {
        // 自定义中间件
        next()
      })
    },
    
    // Rollup 钩子
    transform(code, id) {
      // 转换代码
      if (id.endsWith('.vue')) {
        return code.replace('__VERSION__', '1.0.0')
      }
    },
    
    generateBundle(options, bundle) {
      // 生成 bundle 时的处理
    }
  }
}
```

## CSS 处理

Vite 内置了对 CSS 的强大支持，包括 CSS Modules、PostCSS、预处理器等。

**CSS Modules**

```vue
<template>
  <div :class="$style.container">
    <p :class="$style.title">Hello</p>
  </div>
</template>

<style module>
.container {
  max-width: 1200px;
  margin: 0 auto;
}

.title {
  color: #333;
  font-size: 24px;
}
</style>
```

**CSS 预处理器**

```bash
# 安装预处理器
npm install -D sass less stylus
```

```javascript
// vite.config.js
export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @import "@/styles/variables.scss";
          @import "@/styles/mixins.scss";
        `
      },
      less: {
        modifyVars: {
          'primary-color': '#1890ff'
        },
        javascriptEnabled: true
      }
    }
  }
})
```

**PostCSS 配置**

```javascript
// postcss.config.js
export default {
  plugins: {
    'postcss-preset-env': {
      stage: 3,
      features: {
        'nesting-rules': true
      }
    },
    autoprefixer: {},
    cssnano: process.env.NODE_ENV === 'production' ? {} : false
  }
}
```

## 静态资源处理

Vite 提供了灵活的静态资源处理方式。

**导入静态资源**

```javascript
// 导入图片
import logo from './assets/logo.png'

// 导入 SVG 作为组件
import { ReactComponent as Logo } from './assets/logo.svg'

// 动态导入
const img = await import(`./assets/${name}.png`)
```

**资源分类**

```javascript
// 小于 4KB 的资源会被内联为 base64
import smallImage from './small.png' // 内联

// 大于 4KB 的资源会被复制到输出目录
import largeImage from './large.png' // /assets/large.123456.png

// 可以通过 URL 参数改变行为
import image from './image.png?url' // 始终返回 URL
import image from './image.png?raw' // 导入原始内容
```

**public 目录**

放在 `public` 目录下的资源会原样复制到输出目录，不会被处理：

```html
<!-- 在 HTML 中引用 -->
<link rel="icon" href="/vite.svg" />

<!-- 在 JS 中引用 -->
<script>
const logoUrl = '/vite.svg'
</script>
```

## 性能优化

**代码分割**

```javascript
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        // 手动分割 chunk
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('vue')) {
              return 'vue'
            }
            if (id.includes('lodash')) {
              return 'lodash'
            }
            return 'vendor'
          }
        }
      }
    },
    // chunk 大小警告阈值
    chunkSizeWarningLimit: 1000
  }
})
```

**预加载**

```html
<!-- Vite 会自动为动态导入的模块添加预加载 -->
<link rel="modulepreload" href="/assets/index.123456.js">
```

**依赖预构建**

```javascript
// vite.config.js
export default defineConfig({
  optimizeDeps: {
    // 强制预构建某些依赖
    include: ['vue', 'vue-router', 'pinia'],
    // 排除某些依赖
    exclude: ['your-local-package']
  }
})
```

## 多页面应用

Vite 支持多页面应用（MPA）配置：

```javascript
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin/index.html'),
        mobile: resolve(__dirname, 'mobile/index.html')
      }
    }
  }
})
```

## SSR 支持

Vite 内置了对服务端渲染的支持：

```javascript
// server.js
import express from 'express'
import { createServer as createViteServer } from 'vite'

async function createServer() {
  const app = express()
  
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom'
  })
  
  app.use(vite.middlewares)
  
  app.use('*', async (req, res) => {
    const url = req.originalUrl
    
    try {
      let template = fs.readFileSync('index.html', 'utf-8')
      template = await vite.transformIndexHtml(url, template)
      
      const { render } = await vite.ssrLoadModule('/src/entry-server.js')
      const appHtml = await render(url)
      
      const html = template.replace('<!--app-html-->', appHtml)
      
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
    } catch (e) {
      vite.ssrFixStacktrace(e)
      console.error(e)
      res.status(500).end(e.message)
    }
  })
  
  app.listen(3000)
}

createServer()
```

## 常见问题与解决方案

**路径别名不生效**

确保在 `vite.config.js` 和 `tsconfig.json` 中都配置了路径别名：

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

**CORS 问题**

在开发环境中，Vite 开发服务器默认允许所有来源。如果遇到 CORS 问题，可以配置：

```javascript
// vite.config.js
export default defineConfig({
  server: {
    cors: true // 或者配置具体的选项
  }
})
```

**热更新不工作**

检查以下几点：
1. 确保文件路径大小写正确
2. 检查是否在 `vite.config.js` 中禁用了热更新
3. 检查浏览器控制台是否有错误

## 总结

Vite 通过其创新的架构，解决了传统打包工具在开发环境中的性能瓶颈。理解其核心原理和配置方式，能够帮助你更好地利用这个工具，提升开发效率。

随着前端生态的发展，Vite 已经成为 Vue、React、Svelte 等框架的首选构建工具。掌握 Vite，是现代前端开发者的必备技能。