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
  "fetchSspai",
  "fetchV2ex",
  "fetchWallstcn",
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
  assert.strictEqual(esm.sources.length, 11, "应有 11 个新闻源");
  assert.strictEqual(typeof esm.fetchNews, "function");

  console.log("smoke: ESM + CJS exports OK");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
