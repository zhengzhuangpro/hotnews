# hotnews npm 库化设计

日期：2026-08-26
状态：已批准

## 背景

`hotnews` 目前仅以 CLI 形式发布（`bin` 入口 + `bun build` 单文件 bundle）。需求：作为**公开 npm 包**支持其他项目安装导入，同时保持 CLI 功能不变。

已确认的决策：

| 决策点 | 结论 |
|---|---|
| 目标用户 | 公开 npm 包，任何项目可 `npm install hotnews` |
| API 风格 | 函数式 API |
| 包形态 | 单包双模式（CLI `bin` + 库 `exports` 共存） |
| 模块格式 | ESM + CJS 双格式 |
| 构建方式 | `bun build` 双格式 + `tsc` 生成类型（零新增依赖） |

有利条件：`src/sources/` 与 `src/types.ts` 是纯 `fetch` 实现，零运行时依赖；react/ink/meow 仅被 UI 层（`cli.tsx` / `app.tsx`）使用。

## API 设计

新建 `src/index.ts` 作为库入口。

### 导出清单

- **具名 fetch 函数**（8 个）：`fetchBaidu`、`fetchWeibo`、`fetchDouyin`、`fetchHupu`、`fetchZhihu`、`fetchJuejin`、`fetchKr36`、`fetchGithub`，返回 `Promise<NewsItem[]>`
- **便捷函数**：`fetchNews(id, options?)`
- **元信息**：`sources`（`NewsSource[]`）、`getSource(id)`
- **类型**：`NewsItem`、`NewsSource`、`FetchNewsOptions`

### 使用示例

```typescript
import { fetchBaidu, fetchNews, sources } from "hotnews";

const items = await fetchBaidu();                     // 直接调具名函数
const weibo = await fetchNews("weibo", { limit: 5 }); // 动态源 + 截断
for (const s of sources) console.log(s.id, s.name);   // 遍历元信息
```

### fetchNews 语义

```typescript
export interface FetchNewsOptions {
  limit?: number; // 不传返回全部；传了 slice(0, limit)
}

export async function fetchNews(
  id: string,
  options: FetchNewsOptions = {}
): Promise<NewsItem[]> {
  const source = getSource(id);
  if (!source) {
    throw new Error(
      `Unknown source: "${id}". Available: ${sources.map(s => s.id).join(", ")}`
    );
  }
  const items = await source.fetch();
  return options.limit ? items.slice(0, options.limit) : items;
}
```

`limit` 只做 slice，不做 1–50 硬校验（那是 CLI 的 UI 约束，库层宽松）。

### 错误处理

- 网络失败、解析失败**原样上抛**，库不吞错、不重试
- 未知源 id：库抛 `Error`，消息中列出全部可用 id

### 源文件改动

各 `src/sources/<name>.ts` 的私有 fetch 函数加 `export` 关键字（如 `export async function fetchBaidu()`），`xxxSource` 对象保持原样。`cli.tsx` / `app.tsx` 完全不动。

## 构建与发布

### 构建命令（package.json `build` script 合并）

```bash
# 库构建：ESM + CJS 双格式，零捆绑（依赖自动外部化；本库无运行时依赖）
bun build src/index.ts --outdir dist/lib --target node --format=esm,cjs
# → dist/lib/index.js (ESM) + dist/lib/index.cjs (CJS)

# 类型声明：新建 tsconfig.build.json（extends 现有 tsconfig，
# emitDeclarationOnly: true, outDir: dist/lib, rootDir: src）
tsc -p tsconfig.build.json
# → dist/lib/index.d.ts 等

# CLI 构建：保持现状
bun build src/cli.tsx --outdir dist/src --target node
```

实现时验证 `bun build --format=esm,cjs` 的实际输出文件名（预期 ESM 为 `index.js`、CJS 为 `index.cjs`）；若与预期不符，以实际产物调整 `exports` 路径。

### package.json 变更

```jsonc
{
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
  "engines": { "node": ">=18" },
  "bin": { "hotnews": "./dist/src/cli.js" },          // 不变
  "files": ["dist", "README.md", "README_en.md", "LICENSE", "package.json"] // 不变
}
```

- `files` 已含 `dist`，库产物自动入包
- `description` / `keywords` 补充「可作为 npm 库导入」相关信息
- 依赖不动：react/ink/meow 留在 `dependencies`（CLI 需要）；库产物零依赖
- `release.ts` 发布流程不动（build 已产出库文件）

## 验证

1. 现有 `bun run check`（源校验）保持
2. 新增冒烟检查：build 后分别以 ESM（`import()`）和 CJS（`require()`）加载产物，验证导出齐全，**不发真实网络请求**
3. `npm pack --dry-run` 确认 `dist/lib/` 在包内容中

## 文档

README.md / README_en.md 各新增「作为库使用」章节：安装命令 + API 示例。

## 不做的事（YAGNI）

- 不拆 `hotnews-core` 独立包
- 不做请求重试、超时配置、缓存（调用方自行处理）
- 不导出 React Ink UI 组件
- 不引入 tsup/unbuild 等构建依赖
