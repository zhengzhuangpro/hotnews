import { afterEach, describe, expect, test } from "bun:test";
import { fetchNews, getSource, sources, fetchV2ex } from "../src/index.js";

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
  test("exposes 11 sources with getSource lookup", () => {
    expect(sources.length).toBe(11);
    expect(getSource("weibo")?.id).toBe("weibo");
    expect(getSource("does-not-exist")).toBeUndefined();
  });
});

// 与 src/sources/v2ex.ts 对齐：JSON Feed v1 的 items 数组，
// url 缺失时回退到 id（两者都是帖子完整链接）
describe("fetchV2ex", () => {
  test("parses JSON Feed items and falls back to id for url", async () => {
    global.fetch = mockFetch({
      version: "https://jsonfeed.org/version/1",
      title: "分享发现",
      items: [
        { title: "话题一", url: "https://www.v2ex.com/t/1237633", id: "https://www.v2ex.com/t/1237633" },
        { title: "话题二", id: "https://www.v2ex.com/t/1237586" },
      ],
    });
    const items = await fetchV2ex();
    expect(items.length).toBe(2);
    expect(items[0].title).toBe("话题一");
    expect(items[0].url).toBe("https://www.v2ex.com/t/1237633");
    expect(items[0].rank).toBe(1);
    expect(items[1].url).toBe("https://www.v2ex.com/t/1237586");
    expect(items[1].rank).toBe(2);
  });
});
