# hotnews

[![npm version](https://img.shields.io/npm/v/hotnews.svg)](https://www.npmjs.org/package/hotnews)
[![npm downloads](https://img.shields.io/npm/dm/hotnews.svg)](https://www.npmjs.org/package/hotnews)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![clawhub](https://img.shields.io/badge/clawhub-view-blue)](https://clawhub.ai/zhengzhuangpro/hotnews)

[English](README.md) | 中文

一个基于 React Ink + TypeScript + Bun 构建的命令行热门新闻聚合工具。

## 安装

```bash
npm install -g hotnews
```

安装后即可在任意位置使用 `hotnews` 命令，只需 Node.js 环境。

## 使用

### 查看帮助

```bash
hotnews --help
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
hotnews kr36       # 36氪热榜
hotnews github     # GitHub Trending
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

## 新闻源

| 源 | ID | 说明 |
|---|---|---|
| 百度热搜 | `baidu` | 百度实时热搜榜 |
| 微博热搜 | `weibo` | 微博实时热搜榜 |
| 抖音热搜 | `douyin` | 抖音实时热搜榜 |
| 虎扑热搜 | `hupu` | 虎扑步行街热帖 |
| 知乎热榜 | `zhihu` | 知乎热门问题 |
| 掘金热榜 | `juejin` | 掘金开发者热门文章 |
| 36氪热榜 | `kr36` | 36氪科技热门资讯 |
| GitHub Trending | `github` | GitHub 热门仓库 |

## 技术栈

- [Bun](https://bun.sh/) — 开发构建
- [React Ink](https://github.com/vadimdemedes/ink) — 终端 UI 渲染
- [TypeScript](https://www.typescriptlang.org/) — 类型安全
- [meow](https://github.com/sindresorhus/meow) — CLI 参数解析

## License

MIT
