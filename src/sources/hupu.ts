import type { NewsItem, NewsSource } from "../types.js";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

async function fetchHupu(): Promise<NewsItem[]> {
  const res = await fetch("https://bbs.hupu.com/topic-daily-hot", {
    headers: { "User-Agent": UA },
  });
  const html = await res.text();

  const match = html.match(/window\.\$\$data\s*=\s*({.+?})\s*;?\s*<\/script>/s);
  if (!match) return [];

  const data = JSON.parse(match[1]);
  const threads = data?.topic?.threads?.list ?? [];

  return threads.map((item: any, i: number) => ({
    title: item.title as string,
    url: `https://bbs.hupu.com${item.url}`,
    hot: item.lights ? `${item.lights}亮 ${item.replies}回` : undefined,
    rank: i + 1,
  }));
}

export const hupuSource: NewsSource = {
  id: "hupu",
  name: "虎扑热搜",
  description: "虎扑步行街热帖",
  fetch: fetchHupu,
};
