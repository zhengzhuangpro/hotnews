# hotnews

[![npm version](https://img.shields.io/npm/v/hotnews.svg)](https://www.npmjs.org/package/hotnews)
[![npm downloads](https://img.shields.io/npm/dm/hotnews.svg)](https://www.npmjs.org/package/hotnews)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![clawhub](https://img.shields.io/badge/clawhub-view-blue)](https://clawhub.ai/zhengzhuangpro/hotnews)

English | [中文](README_zh.md)

A command-line trending news aggregator built with React Ink + TypeScript + Bun.

## Installation

```bash
npm install -g hotnews
```

After installation, run `hotnews` from anywhere — only Node.js is required.

## Usage

### Show help

```bash
hotnews --help
```

### List all available sources

```bash
hotnews list
```

### Fetch trending news

```bash
hotnews baidu      # Baidu Hot Search
hotnews weibo      # Weibo Hot Search
hotnews douyin     # Douyin Hot Search
hotnews hupu       # Hupu Hot Topics
hotnews zhihu      # Zhihu Hot Questions
hotnews juejin     # Juejin Trending
hotnews kr36       # 36Kr Hot
hotnews github     # GitHub Trending
```

### Limit the number of results

```bash
hotnews baidu --limit 5       # Show top 5
hotnews weibo -l 15            # Short flag
hotnews douyin --limit 100     # Capped at 50 (max)
```

### JSON output

```bash
hotnews baidu --json
hotnews weibo --json --limit 5
```

## News Sources

| Source | ID | Description |
|---|---|---|
| Baidu Hot Search | `baidu` | Baidu real-time trending topics |
| Weibo Hot Search | `weibo` | Weibo real-time trending topics |
| Douyin Hot Search | `douyin` | Douyin real-time trending topics |
| Hupu Hot Topics | `hupu` | Hupu popular forum posts |
| Zhihu Hot Questions | `zhihu` | Zhihu trending questions |
| Juejin Trending | `juejin` | Juejin developer trending posts |
| 36Kr Hot | `kr36` | 36Kr tech news trending |
| GitHub Trending | `github` | GitHub trending repositories |

## Tech Stack

- [Bun](https://bun.sh/) — Build tooling
- [React Ink](https://github.com/vadimdemedes/ink) — Terminal UI rendering
- [TypeScript](https://www.typescriptlang.org/) — Type safety
- [meow](https://github.com/sindresorhus/meow) — CLI argument parsing

## License

MIT
