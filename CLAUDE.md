# CLAUDE.md

## Project

`hotnews` — CLI trending news aggregator fetching hot topics from 11 sources across Chinese platforms and GitHub. Also importable as an npm library (ESM + CJS). Built with React Ink + TypeScript + Bun.

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
| `--help` | `-h` | Show help |
| `--version` | `-v` | Show version |

### Library Usage

```typescript
import { fetchBaidu, fetchNews, sources } from "hotnews";
const weibo = await fetchNews("weibo", { limit: 5 });
```

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
| `sspai` | SSPai (少数派) | Hot articles |
| `v2ex` | V2EX | Share discoveries node topics |
| `wallstcn` | Wallstreetcn (华尔街见闻) | Hot articles |

## Architecture

```
src/
├── cli.tsx           # CLI entry point (meow-based arg parsing)
├── app.tsx           # React Ink terminal UI components
├── index.ts          # Library entry: fetchNews + re-exports (ESM/CJS dual build)
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
    ├── github.ts     # GitHub trending fetcher (HTML scraping)
    ├── sspai.ts      # SSPai hot articles fetcher
    ├── v2ex.ts       # V2EX share node fetcher (JSON Feed)
    └── wallstcn.ts   # Wallstreetcn hot articles fetcher
scripts/
├── build.ts          # Build chain: clean → CLI → lib ESM/CJS → .d.ts → smoke
├── check.ts          # Source health check (real network calls)
├── release.ts        # Release flow (patch/minor/major/prerelease)
└── smoke.cjs         # Post-build export verification (ESM + CJS)
tests/                # bun test suites (fetch-news, bump-version)
tsconfig.build.json   # Declaration emit for dist/lib
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
bun run build             # Build CLI (dist/src) + library (dist/lib ESM/CJS/.d.ts), run smoke
bun run check             # Validate sources (real network calls)
bun run test              # Unit tests (bun test)
bun run smoke             # Verify built artifacts export correctly
bun run beta              # Publish prerelease (e.g. 0.1.7-beta.0) to beta dist-tag
bun run release           # Bump patch, build, tag, publish
```

## Adding a Source

1. Create `src/sources/<name>.ts` with an exported `fetchXxx()` and source object
2. Add the source object to `src/sources/index.ts`
3. Export `fetchXxx` from `src/index.ts` (library API)
4. Add `fetchXxx` to `EXPECTED_EXPORTS` in `scripts/smoke.cjs`
5. Add a row to the source tables in `README.md` / `README_en.md`
6. Run `bun run check && bun run test && bun run build`

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
