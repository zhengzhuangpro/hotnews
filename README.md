# hotnews

[![npm version](https://img.shields.io/npm/v/hotnews.svg)](https://www.npmjs.org/package/hotnews)
[![npm downloads](https://img.shields.io/npm/dm/hotnews.svg)](https://www.npmjs.org/package/hotnews)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![clawhub](https://img.shields.io/badge/clawhub-view-blue)](https://clawhub.ai/zhengzhuangpro/hotnews)

[English](README_en.md) | 中文

一个基于 React Ink + TypeScript + Bun 构建的命令行热门新闻聚合工具。

## 安装

```bash
npm install -g hotnews
```

安装后即可在任意位置使用 `hotnews` 命令，只需 Node.js 环境。

### Skill 安装

作为 AI Agent skill 使用：

```bash
npx skills add https://github.com/zhengzhuangpro/hotnews --skill hotnews
```

安装后可通过 `/hotnews` 命令获取热门新闻。

## 使用

### 查看帮助

```bash
hotnews --help   # 或简写 hotnews -h
```

### 查看版本

```bash
hotnews --version   # 或简写 hotnews -v
```

### 查看所有可用源

```bash
hotnews list
```

### 获取热门新闻

```bash
hotnews baidu      # 百度热搜
hotnews weibo      # 微博热搜
hotnews douyin     # 抖音热搜
hotnews hupu       # 虎扑热帖
hotnews zhihu      # 知乎热榜
hotnews juejin     # 掘金热榜
hotnews 36kr       # 36氪快讯
hotnews github     # GitHub Trending
hotnews sspai      # 少数派热榜
hotnews v2ex       # V2EX 分享发现
hotnews wallstcn   # 华尔街见闻热榜
```

### 控制显示条数

```bash
hotnews baidu --limit 5       # 显示前 5 条
hotnews weibo -l 15            # 短参数
hotnews douyin --limit 100     # 超过最大值自动截断为 50 条
```

### JSON 格式输出

```bash
hotnews baidu --json
hotnews weibo --json --limit 5
```

## 作为库使用

`hotnews` 也可以作为 npm 库在其他项目中导入（要求 Node.js >= 18）：

```bash
npm install hotnews
```

```typescript
import { fetchBaidu, fetchNews, sources } from "hotnews";

// 直接获取某个源的热榜
const items = await fetchBaidu();

// 动态指定源 + 条数
const weibo = await fetchNews("weibo", { limit: 5 });

// 遍历所有源的元信息
for (const s of sources) {
  console.log(s.id, s.name, s.description);
}
```

### API

| 导出 | 说明 |
|---|---|
| `fetchNews(id, options?)` | 便捷函数：按源 id 获取，`options.limit` 截断条数 |
| `fetchBaidu()` 等 11 个函数 | 各源具名函数，返回 `Promise<NewsItem[]>` |
| `sources` | 全部源的元信息数组 |
| `getSource(id)` | 按 id 查找源 |
| `NewsItem` / `NewsSource` / `FetchNewsOptions` | 类型定义 |

说明：网络失败、解析失败会原样抛出，调用方自行处理重试；传入未知源 id 会抛出包含全部可用 id 的 `Error`。同时支持 ESM 与 CJS（`require("hotnews")`）。

## 新闻源

| 源 | ID | 说明 |
|---|---|---|
| 百度热搜 | `baidu` | 百度实时热搜榜 |
| 微博热搜 | `weibo` | 微博实时热搜榜 |
| 抖音热搜 | `douyin` | 抖音实时热搜榜 |
| 虎扑热搜 | `hupu` | 虎扑步行街热帖 |
| 知乎热榜 | `zhihu` | 知乎热门问题 |
| 掘金热榜 | `juejin` | 掘金开发者热门文章 |
| 36氪快讯 | `36kr` | 36氪实时快讯 |
| GitHub Trending | `github` | GitHub 热门仓库 |
| 少数派热榜 | `sspai` | 少数派热门文章 |
| V2EX 分享发现 | `v2ex` | V2EX 分享发现节点热帖 |
| 华尔街见闻热榜 | `wallstcn` | 华尔街见闻热门文章 |

## 技术栈

- [Bun](https://bun.sh/) — 开发构建
- [React Ink](https://github.com/vadimdemedes/ink) — 终端 UI 渲染
- [TypeScript](https://www.typescriptlang.org/) — 类型安全
- [meow](https://github.com/sindresorhus/meow) — CLI 参数解析

## License

MIT
