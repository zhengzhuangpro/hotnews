import type { NewsItem, NewsSource } from "../types.js";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

async function fetchBaidu(): Promise<NewsItem[]> {
  const res = await fetch(
    // "https://top.baidu.com/api/board?platform=wise&tab=realtime",
    "https://top.baidu.com/api/board?tab=realtime",
    { headers: { "User-Agent": UA } }
  );
  const json = (await res.json()) as any;
  const cards = json?.data?.cards ?? [];
  const content = cards.find((item: { component: string; }) => item.component === "hotList")?.content;

  return content
    .filter((item: any) => item.word)
    .map((item: any, i: number) => ({
      title: item.word as string,
      url: (item.url as string) || `https://www.baidu.com/s?wd=${encodeURIComponent(item.word)}`,
      hot: item.newHotName || item.labelTagName || undefined,
      rank: item.index ?? i + 1,
    }));
}

export const baiduSource: NewsSource = {
  id: "baidu",
  name: "百度热搜",
  description: "百度实时热搜榜",
  fetch: fetchBaidu,
};
