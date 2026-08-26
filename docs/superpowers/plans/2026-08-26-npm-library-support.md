# hotnews npm 库化支持 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让 `hotnews` 在保持 CLI 功能不变的前提下，作为公开 npm 包支持其他项目 `import` 使用（ESM + CJS 双格式）。

**Architecture:** 新建 `src/index.ts` 库入口 re-export 8 个源的 fetch 函数并新增 `fetchNews(id, options)` 便捷函数；`bun build` 产出 ESM/CJS 双格式到 `dist/lib/`，`tsc` 产出 `.d.ts`；`package.json` 增加 `exports` 映射。UI 层（`cli.tsx`/`app.tsx`）零改动。

**Tech Stack:** TypeScript (strict)、Bun（构建 + 测试）、tsc（声明文件）、Node ≥18（内置 fetch）。

**Spec:** `docs/superpowers/specs/2026-08-26-npm-library-design.md`

## Global Constraints

- 零新增依赖：不引入任何新 dependency / devDependency（typescript、bun 均已有）
- CLI 行为完全不变：`bin` 入口、`dist/src/cli.js` 构建命令、shebang 处理保持原样
- 库产物零运行时依赖（react/ink/meow 留在 `dependencies`，仅供 CLI 使用）
- `engines`: `node >= 18`
- 模块格式：ESM（`index.js`）+ CJS（`index.cjs`），`exports` 映射 `types` 条件放最前
- 错误处理：库不吞错、不重试；仅未知源 id 由库抛 `Error`
- Commit 格式 `type: description`，**不加 AI 签名**
- 所有源文件里的函数名以现状为准：`fetchBaidu`、`fetchWeibo`、`fetchDouyin`、`fetchHupu`、`fetchZhihu`、`fetchJuejin`、`fetchKr36`、`fetchGithub`

---

### Task 1: 导出各源的 fetch 函数

**Files:**
- Modify: `src/sources/baidu.ts:6`、`src/sources/weibo.ts:6`、`src/sources/douyin.ts:6`、`src/sources/hupu.ts:6`、`src/sources/zhihu.ts:6`、`src/sources/juejin.ts:6`、`src/sources/kr36.ts:6`、`src/sources/github.ts:6`

**Interfaces:**
- Consumes: 无
- Produces: 8 个具名导出函数，签名均为 `() => Promise<NewsItem[]>`。Task 2 的 `src/index.ts` 将 re-export 它们。

- [ ] **Step 1: 给 8 个 fetch 函数声明加 `export` 关键字**

每个文件第 6 行的 `async function fetchXxx(): Promise<NewsItem[]> {` 改为 `export async function fetchXxx(): Promise<NewsItem[]> {`。仅此一处，其余代码不动。8 个文件逐一修改：

```typescript
// src/sources/baidu.ts
export async function fetchBaidu(): Promise<NewsItem[]> {

// src/sources/weibo.ts
export async function fetchWeibo(): Promise<NewsItem[]> {

// src/sources/douyin.ts
export async function fetchDouyin(): Promise<NewsItem[]> {

// src/sources/hupu.ts
export async function fetchHupu(): Promise<NewsItem[]> {

// src/sources/zhihu.ts
export async function fetchZhihu(): Promise<NewsItem[]> {

// src/sources/juejin.ts
export async function fetchJuejin(): Promise<NewsItem[]> {

// src/sources/kr36.ts
export async function fetchKr36(): Promise<NewsItem[]> {

// src/sources/github.ts
export async function fetchGithub(): Promise<NewsItem[]> {
```

注意：各文件内部的 `formatHot`、`formatNum` 等辅助函数**保持私有**，不加 export。

- [ ] **Step 2: 类型检查验证**

Run: `bunx tsc --noEmit`
Expected: 无输出（零错误）

- [ ] **Step 3: CLI 冒烟验证（不走网络）**

Run: `bun run start list`
Expected: 列出 8 个新闻源（baidu、weibo、douyin、hupu、kr36、zhihu、juejin、github），正常退出

- [ ] **Step 4: Commit**

```bash
git add src/sources/
git commit -m "feat: export fetch functions from all sources"
```

---

### Task 2: 库入口 `src/index.ts` + `fetchNews`（TDD）

**Files:**
- Create: `src/index.ts`
- Create: `tests/fetch-news.test.ts`
- Modify: `package.json`（scripts 加 `"test": "bun test"`）

**Interfaces:**
- Consumes: Task 1 的 8 个导出函数；现有 `sources`、`getSource`（`src/sources/index.ts`）；类型 `NewsItem`、`NewsSource`（`src/types.ts`）
- Produces: 库入口模块，导出 `fetchNews(id: string, options?: FetchNewsOptions): Promise<NewsItem[]>`、`FetchNewsOptions { limit?: number }`、`sources: NewsSource[]`、`getSource(id: string): NewsSource | undefined`、8 个 `fetchXxx`、类型 `NewsItem`/`NewsSource`/`FetchNewsOptions`。Task 3-5 依赖此入口；最终包名 `hotnews` 下同名导出。

- [ ] **Step 1: 写失败测试**

创建 `tests/fetch-news.test.ts`：

```typescript
import { afterEach, describe, expect, test } from "bun:test";
import { fetchNews, getSource, sources } from "../src/index.js";

// 与 src/sources/baidu.ts 的解析结构对齐：
// json.data.cards[].component === "hotList" 的 content 数组
const baiduJson = {
  success: true,
  data: {
    cards: [
      {
        component: "hotList",
        content: [
          { word: "标题一", url: "https://example.com/1", newHotName: "123万", index: 1 },
          { word: "标题二", url: "https://example.com/2", newHotName: "456万", index: 2 },
          { word: "标题三", url: "https://example.com/3", newHotName: "789万", index: 3 },
        ],
      },
    ],
  },
};

const realFetch = global.fetch;

function mockFetch(payload: unknown) {
  return async () => new Response(JSON.stringify(payload));
}

afterEach(() => {
  global.fetch = realFetch;
});

describe("fetchNews", () => {
  test("unknown source id throws with available ids", async () => {
    await expect(fetchNews("nope")).rejects.toThrow(/Unknown source: "nope"/);
    await expect(fetchNews("nope")).rejects.toThrow(/baidu/);
  });

  test("returns all items when no limit given", async () => {
    global.fetch = mockFetch(baiduJson);
    const items = await fetchNews("baidu");
    expect(items.length).toBe(3);
    expect(items[0].title).toBe("标题一");
    expect(items[0].rank).toBe(1);
    expect(items[0].hot).toBe("123万");
  });

  test("truncates items to limit", async () => {
    global.fetch = mockFetch(baiduJson);
    const items = await fetchNews("baidu", { limit: 2 });
    expect(items.length).toBe(2);
  });

  test("propagates fetch errors", async () => {
    global.fetch = async () => {
      throw new Error("network down");
    };
    await expect(fetchNews("baidu")).rejects.toThrow("network down");
  });
});

describe("library metadata", () => {
  test("exposes 8 sources with getSource lookup", () => {
    expect(sources.length).toBe(8);
    expect(getSource("weibo")?.id).toBe("weibo");
    expect(getSource("does-not-exist")).toBeUndefined();
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `bun test`
Expected: FAIL，报模块不存在（`Cannot find module '../src/index.js'` 或等价错误）

- [ ] **Step 3: 创建 `src/index.ts`**

```typescript
import type { NewsItem, NewsSource } from "./types.js";
import { sources, getSource } from "./sources/index.js";
import { fetchBaidu } from "./sources/baidu.js";
import { fetchWeibo } from "./sources/weibo.js";
import { fetchDouyin } from "./sources/douyin.js";
import { fetchHupu } from "./sources/hupu.js";
import { fetchZhihu } from "./sources/zhihu.js";
import { fetchJuejin } from "./sources/juejin.js";
import { fetchKr36 } from "./sources/kr36.js";
import { fetchGithub } from "./sources/github.js";

export type { NewsItem, NewsSource };
export { sources, getSource };
export { fetchBaidu, fetchWeibo, fetchDouyin, fetchHupu, fetchZhihu, fetchJuejin, fetchKr36, fetchGithub };

export interface FetchNewsOptions {
  /** 不传返回全部；传了截断为前 limit 条 */
  limit?: number;
}

export async function fetchNews(
  id: string,
  options: FetchNewsOptions = {}
): Promise<NewsItem[]> {
  const source = getSource(id);
  if (!source) {
    throw new Error(
      `Unknown source: "${id}". Available: ${sources.map((s) => s.id).join(", ")}`
    );
  }
  const items = await source.fetch();
  return options.limit ? items.slice(0, options.limit) : items;
}
```

注意：**不要** re-export 各 `xxxSource` 对象——规格的导出清单只有 fetch 函数、`fetchNews`、`sources`、`getSource` 和类型（元信息统一走 `sources`/`getSource`）。

- [ ] **Step 4: `package.json` 加 test script**

在 `"check": "bun scripts/check.ts",` 之后加一行：

```json
    "test": "bun test",
```

- [ ] **Step 5: 运行测试确认通过**

Run: `bun test`
Expected: 全部 PASS（6 个测试：fetchNews 4 个 + metadata 2 个）

- [ ] **Step 6: 类型检查**

Run: `bunx tsc --noEmit`
Expected: 无输出（零错误）

- [ ] **Step 7: Commit**

```bash
git add src/index.ts tests/fetch-news.test.ts package.json
git commit -m "feat: add library entry with fetchNews API"
```

---

### Task 3: 构建产物（ESM + CJS + 类型声明）

**Files:**
- Create: `tsconfig.build.json`
- Modify: `package.json:35`（`build` script 扩展，保留现有 shebang 处理）

**Interfaces:**
- Consumes: Task 2 的 `src/index.ts` 入口
- Produces: `dist/lib/index.js`（ESM）、`dist/lib/index.cjs`（CJS）、`dist/lib/index.d.ts` + `dist/lib/sources/*.d.ts` + `dist/lib/types.d.ts`。Task 4 的 `exports` 映射、Task 5 的冒烟脚本依赖这些路径。

- [ ] **Step 1: 创建 `tsconfig.build.json`**

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "declaration": true,
    "emitDeclarationOnly": true,
    "outDir": "dist/lib",
    "rootDir": "src",
    "types": ["node"]
  },
  "include": ["src/index.ts"]
}
```

说明：`include` 只列入口文件，tsc 自动跟随 import 依赖图（types.ts + sources/*），不会碰 `cli.tsx`/`app.tsx`。`rootDir: "src"` 确保输出是 `dist/lib/index.d.ts` 而非 `dist/lib/src/index.d.ts`。`types` 去掉 `bun`（发布产物面向 Node 用户）。

- [ ] **Step 2: 更新 `package.json` 的 `build` script**

把现有：

```json
    "build": "bun build src/cli.tsx --outdir dist/src --target node && node -e \"const f='dist/src/cli.js',c=require('fs').readFileSync(f,'utf8');require('fs').writeFileSync(f,'#!/usr/bin/env node\\n'+c)\"",
```

改为（原 CLI 构建命令逐字保留，追加两条）：

```json
    "build": "bun build src/cli.tsx --outdir dist/src --target node && node -e \"const f='dist/src/cli.js',c=require('fs').readFileSync(f,'utf8');require('fs').writeFileSync(f,'#!/usr/bin/env node\\n'+c)\" && bun build src/index.ts --outdir dist/lib --target node --format=esm,cjs && tsc -p tsconfig.build.json",
```

- [ ] **Step 3: 清理旧产物并构建**

Run: `rm -rf dist && bun run build`
Expected: 命令成功退出；`dist/src/cli.js`（含 shebang）与 `dist/lib/` 均生成

- [ ] **Step 4: 验证产物文件名与路径**

Run: `ls dist/lib/ dist/lib/sources/`
Expected: `dist/lib/index.js`、`dist/lib/index.cjs`、`dist/lib/index.d.ts`、`dist/lib/types.d.ts`、`dist/lib/sources/`（含各 `.d.ts`）

**如果 CJS 产物不叫 `index.cjs`**（bun 版本行为差异）：以实际文件名为准，后续 Task 4 的 `exports.require` 路径同步调整，并在提交信息中注明。

- [ ] **Step 5: 双格式加载验证（不走网络）**

Run:
```bash
node -e "const h = require('./dist/lib/index.cjs'); console.log('CJS:', typeof h.fetchNews, h.sources.length)"
node --input-type=module -e "import('./dist/lib/index.js').then(h => console.log('ESM:', typeof h.fetchNews, h.sources.length))"
```
Expected: 两行均输出 `function 8`

- [ ] **Step 6: 验证 CLI 产物仍正常**

Run: `node dist/src/cli.js list`
Expected: 列出 8 个新闻源

- [ ] **Step 7: Commit**

```bash
git add tsconfig.build.json package.json
git commit -m "feat: build library artifacts (ESM/CJS/types)"
```

---

### Task 4: `package.json` 发布配置（exports/engines/元信息）

**Files:**
- Modify: `package.json`（新增 `main`/`module`/`types`/`exports`/`engines`，更新 `description`/`keywords`）

**Interfaces:**
- Consumes: Task 3 的产物路径（`./dist/lib/index.js`、`./dist/lib/index.cjs`、`./dist/lib/index.d.ts`）
- Produces: 最终用户 `import "hotnews"` / `require("hotnews")` 的解析规则；`engines` 约束 Node ≥18

- [ ] **Step 1: 编辑 `package.json`**

`description` 改为：

```json
  "description": "热门新闻聚合工具，支持百度、微博、抖音、虎扑等 8 个平台；可用作 CLI 或 npm 库导入",
```

`keywords` 数组追加 `"library"`（放 `"cli"` 旁边）：

```json
  "keywords": [
    "cli",
    "library",
    "news",
    "hotnews",
    "baidu",
    "weibo",
    "douyin",
    "hupu",
    "trending"
  ],
```

在 `"type": "module",` 之后、`"bin"` 之前插入：

```json
  "main": "./dist/lib/index.cjs",
  "module": "./dist/lib/index.js",
  "types": "./dist/lib/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/lib/index.d.ts",
      "import": "./dist/lib/index.js",
      "require": "./dist/lib/index.cjs"
    }
  },
  "engines": {
    "node": ">=18"
  },
```

`bin`、`files`、依赖均不动。

- [ ] **Step 2: 检查打包内容**

Run: `npm pack --dry-run 2>&1 | grep "dist/lib"`
Expected: 至少包含 `dist/lib/index.js`、`dist/lib/index.cjs`、`dist/lib/index.d.ts`、`dist/lib/types.d.ts`、`dist/lib/sources/*.d.ts`

- [ ] **Step 3: 真实安装端到端验证**

```bash
npm pack
TMP=$(mktemp -d)
cd "$TMP"
npm install /Users/zhengzhuang/github/hotnews/hotnews-0.1.6.tgz
node -e "const h = require('hotnews'); if (typeof h.fetchNews !== 'function' || h.sources.length !== 8) { throw new Error('CJS import broken'); } console.log('CJS require OK')"
node --input-type=module -e "import('hotnews').then(h => { if (typeof h.fetchNews !== 'function' || h.sources.length !== 8) { throw new Error('ESM import broken'); } console.log('ESM import OK'); })"
./node_modules/.bin/hotnews list
cd /Users/zhengzhuang/github/hotnews && rm -f hotnews-0.1.6.tgz && rm -rf "$TMP"
```
Expected: `CJS require OK`、`ESM import OK`，且 `hotnews list` 列出 8 个源

注意：若版本号已非 0.1.6，tarball 名以 `npm pack` 实际输出为准。

- [ ] **Step 4: Commit**

```bash
git add package.json
git commit -m "feat: expose npm package exports for library usage"
```

---

### Task 5: 构建冒烟检查脚本

**Files:**
- Create: `scripts/smoke.js`
- Modify: `package.json`（scripts 加 `"smoke"`，并挂到 `build` 末尾）

**Interfaces:**
- Consumes: Task 3 的 `dist/lib/index.js`、`dist/lib/index.cjs`；Task 2 定义的导出清单
- Produces: `npm run smoke` 命令（Node 运行，验证双格式导出齐全，不发网络请求）；`build` 完成时自动执行

- [ ] **Step 1: 创建 `scripts/smoke.js`**

```javascript
#!/usr/bin/env node
// 冒烟检查：验证构建产物 ESM/CJS 双格式可加载且导出齐全。不发网络请求。
const assert = require("node:assert");
const path = require("node:path");

const EXPECTED_EXPORTS = [
  "fetchBaidu",
  "fetchWeibo",
  "fetchDouyin",
  "fetchHupu",
  "fetchZhihu",
  "fetchJuejin",
  "fetchKr36",
  "fetchGithub",
  "fetchNews",
  "getSource",
  "sources",
];

async function main() {
  const root = path.resolve(__dirname, "..");

  const esm = await import(path.join(root, "dist/lib/index.js"));
  const cjs = require(path.join(root, "dist/lib/index.cjs"));

  for (const name of EXPECTED_EXPORTS) {
    assert.ok(name in esm, `ESM 产物缺少导出: ${name}`);
    assert.ok(name in cjs, `CJS 产物缺少导出: ${name}`);
  }
  assert.strictEqual(esm.sources.length, 8, "应有 8 个新闻源");
  assert.strictEqual(typeof esm.fetchNews, "function");

  console.log("smoke: ESM + CJS exports OK");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 2: 挂到 scripts**

`package.json` scripts 中加：

```json
    "smoke": "node scripts/smoke.js",
```

并把 `build` 末尾追加 ` && npm run smoke`，即 build 最终形态：

```json
    "build": "bun build src/cli.tsx --outdir dist/src --target node && node -e \"const f='dist/src/cli.js',c=require('fs').readFileSync(f,'utf8');require('fs').writeFileSync(f,'#!/usr/bin/env node\\n'+c)\" && bun build src/index.ts --outdir dist/lib --target node --format=esm,cjs && tsc -p tsconfig.build.json && npm run smoke",
```

- [ ] **Step 3: 全量构建验证**

Run: `rm -rf dist && bun run build`
Expected: 末尾输出 `smoke: ESM + CJS exports OK`，命令退出码 0

- [ ] **Step 4: 验证旧测试不回归**

Run: `bun test`
Expected: 全部 PASS

- [ ] **Step 5: Commit**

```bash
git add scripts/smoke.js package.json
git commit -m "feat: add build smoke check for ESM/CJS exports"
```

---

### Task 6: README 文档（中英双语）

**Files:**
- Modify: `README.md`（在 `## 新闻源` 章节**之前**、`### JSON 格式输出` 小节之后插入新章节）
- Modify: `README_en.md`（同位置，英文版）

**Interfaces:**
- Consumes: Task 2 的最终 API（`fetchNews`、`fetchXxx`、`sources`、`getSource`、`FetchNewsOptions`）
- Produces: 面向库用户的文档

- [ ] **Step 1: README.md 插入中文章节**

在 `### JSON 格式输出` 小节结束、`## 新闻源` 章节开始之间插入：

````markdown
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
| `fetchBaidu()` 等 8 个函数 | 各源具名函数，返回 `Promise<NewsItem[]>` |
| `sources` | 全部源的元信息数组 |
| `getSource(id)` | 按 id 查找源 |
| `NewsItem` / `NewsSource` / `FetchNewsOptions` | 类型定义 |

说明：网络失败、解析失败会原样抛出，调用方自行处理重试；传入未知源 id 会抛出包含全部可用 id 的 `Error`。同时支持 ESM 与 CJS（`require("hotnews")`）。
````

- [ ] **Step 2: README_en.md 插入英文章节**

在 `### JSON output` 小节结束、`## News Sources` 章节开始之间插入：

````markdown
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
| `fetchBaidu()` and 7 more | Named per-source functions returning `Promise<NewsItem[]>` |
| `sources` | Metadata array of all sources |
| `getSource(id)` | Look up a source by id |
| `NewsItem` / `NewsSource` / `FetchNewsOptions` | Type definitions |

Notes: network and parsing errors are re-thrown as-is (handle retries yourself); an unknown source id throws an `Error` listing all valid ids. Both ESM and CJS (`require("hotnews")`) are supported.
````

- [ ] **Step 3: Commit**

```bash
git add README.md README_en.md
git commit -m "docs: add library usage section to README"
```

---

## 完成标准

- [ ] `bun test` 全绿
- [ ] `bun run build` 一条命令产出 CLI + 库双格式产物并跑通冒烟
- [ ] `npm pack` + 临时目录安装后，CJS `require` / ESM `import` / `npx hotnews` 三种方式全部可用
- [ ] README 中英双语含「作为库使用」章节
