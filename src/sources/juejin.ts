import type { NewsItem, NewsSource } from "../types.js";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

async function fetchJuejin(): Promise<NewsItem[]> {
  const res = await fetch(
    "https://api.juejin.cn/content_api/v1/content/article_rank?category_id=1&type=hot&spider=0",
    {
      headers: {
        "User-Agent": UA,
        Referer: "https://juejin.cn/hot/articles",
      },
    },
  );
  const json = (await res.json()) as any;

  const items = json?.data ?? [];

  return items.map((item: any, i: number) => ({
    title: item.content?.title as string,
    url: `https://juejin.cn/post/${item.content?.content_id}`,
    hot: item.content_counter?.hot_rank
      ? formatHot(Number(item.content_counter.hot_rank))
      : undefined,
    rank: i + 1,
  }));
}

function formatHot(count: number): string {
  if (count >= 10000) return `${(count / 10000).toFixed(1)}万`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return String(count);
}

export const juejinSource: NewsSource = {
  id: "juejin",
  name: "掘金热榜",
  description: "掘金开发者社区热门文章",
  fetch: fetchJuejin,
};
