# hotnews

[![npm version](https://img.shields.io/npm/v/hotnews.svg)](https://www.npmjs.org/package/hotnews)
[![npm downloads](https://img.shields.io/npm/dm/hotnews.svg)](https://www.npmjs.org/package/hotnews)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![clawhub](https://img.shields.io/badge/clawhub-view-blue)](https://clawhub.ai/zhengzhuangpro/hotnews)

English | [中文](README.md)

A command-line trending news aggregator built with React Ink + TypeScript + Bun.

## Installation

```bash
npm install -g hotnews
```

After installation, run `hotnews` from anywhere — only Node.js is required.

### Skill Installation

Use as an AI Agent skill:

```bash
npx skills add https://github.com/zhengzhuangpro/hotnews --skill hotnews
```

After installation, use `/hotnews` to fetch trending news.

## Usage

### Show help

```bash
hotnews --help   # or shorthand: hotnews -h
```

### Show version

```bash
hotnews --version   # or shorthand: hotnews -v
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
hotnews 36kr       # 36Kr Flashes
hotnews github     # GitHub Trending
hotnews sspai      # SSPai Trending
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

## Library Usage

`hotnews` can also be imported as an npm library in other projects (requires Node.js >= 18):

```bash
npm install hotnews
```

```typescript
import { fetchBaidu, fetchNews, sources } from "hotnews";

// Fetch a specific source directly
const items = await fetchBaidu();

// Dynamic source + limit
const weibo = await fetchNews("weibo", { limit: 5 });

// Iterate source metadata
for (const s of sources) {
  console.log(s.id, s.name, s.description);
}
```

### API

| Export | Description |
|---|---|
| `fetchNews(id, options?)` | Convenience function: fetch by source id, `options.limit` truncates |
| `fetchBaidu()` and 8 more | Named per-source functions returning `Promise<NewsItem[]>` |
| `sources` | Metadata array of all sources |
| `getSource(id)` | Look up a source by id |
| `NewsItem` / `NewsSource` / `FetchNewsOptions` | Type definitions |

Notes: network and parsing errors are re-thrown as-is (handle retries yourself); an unknown source id throws an `Error` listing all valid ids. Both ESM and CJS (`require("hotnews")`) are supported.

## News Sources

| Source | ID | Description |
|---|---|---|
| Baidu Hot Search | `baidu` | Baidu real-time trending topics |
| Weibo Hot Search | `weibo` | Weibo real-time trending topics |
| Douyin Hot Search | `douyin` | Douyin real-time trending topics |
| Hupu Hot Topics | `hupu` | Hupu popular forum posts |
| Zhihu Hot Questions | `zhihu` | Zhihu trending questions |
| Juejin Trending | `juejin` | Juejin developer trending posts |
| 36Kr Flashes | `36kr` | 36Kr realtime newsflashes |
| GitHub Trending | `github` | GitHub trending repositories |
| SSPai Trending | `sspai` | SSPai popular articles |

## Tech Stack

- [Bun](https://bun.sh/) — Build tooling
- [React Ink](https://github.com/vadimdemedes/ink) — Terminal UI rendering
- [TypeScript](https://www.typescriptlang.org/) — Type safety
- [meow](https://github.com/sindresorhus/meow) — CLI argument parsing

## License

MIT
