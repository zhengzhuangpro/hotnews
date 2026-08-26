# CLAUDE.md

## Project

`hotnews` — CLI trending news aggregator fetching hot topics from 8 sources across Chinese platforms and GitHub. Built with React Ink + TypeScript + Bun.

## Quick Reference

```bash
hotnews list              # List all sources
hotnews baidu             # Fetch Baidu trends (terminal UI)
hotnews weibo --json      # Fetch as JSON
hotnews douyin -l 15      # Top 15 results
```

### Options

| Flag | Short | Description |
|---|---|---|
| `--json` | | Output as JSON instead of terminal UI |
| `--limit N` | `-l N` | Number of items (1-50, default 10) |

## Sources

| ID | Platform | Description |
|---|---|---|
| `baidu` | Baidu | Real-time search trends |
| `weibo` | Weibo | Real-time trending topics |
| `douyin` | Douyin | Real-time trending topics |
| `hupu` | Hupu | Popular forum posts |
| `zhihu` | Zhihu | Trending questions |
| `juejin` | Juejin | Developer trending articles |
| `36kr` | 36Kr | Realtime newsflashes |
| `github` | GitHub | Trending repositories |

## Architecture

```
src/
├── cli.tsx           # CLI entry point (meow-based arg parsing)
├── app.tsx           # React Ink terminal UI components
├── types.ts          # Type definitions (NewsItem, NewsSource)
└── sources/
    ├── index.ts      # Exports all sources and getSource() lookup
    ├── baidu.ts      # Baidu hot search fetcher
    ├── weibo.ts      # Weibo hot search fetcher
    ├── douyin.ts     # Douyin fetcher
    ├── hupu.ts       # Hupu fetcher
    ├── zhihu.ts      # Zhihu fetcher
    ├── juejin.ts     # Juejin fetcher
    ├── kr36.ts       # 36Kr fetcher
    └── github.ts     # GitHub trending fetcher (HTML scraping)
```

### Key Types

```typescript
interface NewsItem {
  title: string;
  url: string;
  hot?: string;   // optional popularity metric
  rank: number;
}

interface NewsSource {
  id: string;
  name: string;
  description: string;
  fetch: () => Promise<NewsItem[]>;
}
```

## Development

```bash
bun install               # Install deps
bun run dev               # Watch mode
bun run start             # Run once
bun run build             # Build to dist/src/cli.js
bun run check             # Validate sources
bun run release           # Bump, build, tag, publish
```

## Adding a Source

1. Create `src/sources/<name>.ts` with a `NewsSource` export
2. Add it to `src/sources/index.ts`
3. Run `bun run check`

## Code Style

- TypeScript strict mode
- React Ink for terminal rendering
- Each source is self-contained with its own fetch logic
- `--json` flag bypasses Ink entirely, uses `console.log`

## Git Conventions

- Branch strategy: `master` is the main branch, use `feat/xxx` for feature development
- Commit format: `type: description`
  - `feat: add image clipboard support`
  - `fix: resolve fuzzy search crash`
  - `docs: update installation guide`
  - `refactor: optimize query performance`
- Do not add AI signatures to commit messages
