import type { NewsItem, NewsSource } from "../types.js";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

async function fetchWeibo(): Promise<NewsItem[]> {
  const res = await fetch(
    "https://weibo.com/ajax/side/hotSearch",
    {
      headers: {
        "User-Agent": UA,
        Referer: "https://weibo.com/",
      },
    }
  );
  const json = (await res.json()) as any;

  const realtime = json?.data?.realtime ?? [];

  return realtime.map((item: any, i: number) => ({
    title: item.word as string,
    url: `https://s.weibo.com/weibo?q=${encodeURIComponent(item.word_scheme || item.word)}`,
    hot: item.num ? formatNum(item.num) : undefined,
    rank: (item.realpos ?? i) + 1,
  }));
}

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export const weiboSource: NewsSource = {
  id: "weibo",
  name: "微博热搜",
  description: "微博实时热搜榜",
  fetch: fetchWeibo,
};
