# hotnews

[![npm version](https://img.shields.io/npm/v/hotnews.svg)](https://www.npmjs.org/package/hotnews)
[![npm downloads](https://img.shields.io/npm/dm/hotnews.svg)](https://www.npmjs.org/package/hotnews)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

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
```

### JSON output

```bash
hotnews baidu --json
hotnews weibo --json
```

## News Sources

| Source | ID | Description |
|---|---|---|
| Baidu Hot Search | `baidu` | Baidu real-time trending topics |
| Weibo Hot Search | `weibo` | Weibo real-time trending topics |
| Douyin Hot Search | `douyin` | Douyin real-time trending topics |
| Hupu Hot Topics | `hupu` | Hupu popular forum posts |

## Tech Stack

- [Bun](https://bun.sh/) — Build tooling
- [React Ink](https://github.com/vadimdemedes/ink) — Terminal UI rendering
- [TypeScript](https://www.typescriptlang.org/) — Type safety
- [meow](https://github.com/sindresorhus/meow) — CLI argument parsing

## License

MIT
