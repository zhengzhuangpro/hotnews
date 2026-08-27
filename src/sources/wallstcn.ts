import type { NewsItem, NewsSource } from "../types.js";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export async function fetchWallstcn(): Promise<NewsItem[]> {
  const res = await fetch(
    "https://api-one.wallstcn.com/apiv1/content/articles/hot?period=all",
    {
      headers: {
        "User-Agent": UA,
        Referer: "https://wallstcn.com/",
      },
    },
  );
  const json = (await res.json()) as any;

  // day_items 为日榜（按浏览量降序），week_items 为周榜，此处取日榜
  const items = json?.data?.day_items ?? [];

  return items.map((item: any, i: number) => ({
    title: item.title as string,
    url: (item.uri as string) ?? `https://wallstreetcn.com/articles/${item.id}`,
    hot: item.pageviews ? formatHot(Number(item.pageviews)) : undefined,
    rank: i + 1,
  }));
}

function formatHot(count: number): string {
  if (count >= 10000) return `${(count / 10000).toFixed(1)}万`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return String(count);
}

export const wallstcnSource: NewsSource = {
  id: "wallstcn",
  name: "华尔街见闻热榜",
  description: "华尔街见闻热门文章",
  fetch: fetchWallstcn,
};
