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

  test("limit 0 returns empty array", async () => {
    global.fetch = mockFetch(baiduJson);
    const items = await fetchNews("baidu", { limit: 0 });
    expect(items.length).toBe(0);
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
