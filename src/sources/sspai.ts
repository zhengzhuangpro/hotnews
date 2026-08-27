import type { NewsItem, NewsSource } from "../types.js";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export async function fetchSspai(): Promise<NewsItem[]> {
  const res = await fetch(
    "https://sspai.com/api/v1/article/hot/page/get?offset=0&limit=10",
    {
      headers: {
        "User-Agent": UA,
        Referer: "https://sspai.com/",
      },
    },
  );
  const json = (await res.json()) as any;

  const items = json?.data ?? [];

  return items.map((item: any, i: number) => ({
    title: item.title as string,
    url: `https://sspai.com/post/${item.id}`,
    hot: item.like_count
      ? formatHot(Number(item.like_count))
      : undefined,
    rank: i + 1,
  }));
}

function formatHot(count: number): string {
  if (count >= 10000) return `${(count / 10000).toFixed(1)}万`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return String(count);
}

export const sspaiSource: NewsSource = {
  id: "sspai",
  name: "少数派热榜",
  description: "少数派热门文章",
  fetch: fetchSspai,
};
