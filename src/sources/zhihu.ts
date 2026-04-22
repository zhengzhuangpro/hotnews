import type { NewsItem, NewsSource } from "../types.js";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

async function fetchZhihu(): Promise<NewsItem[]> {
  const res = await fetch(
    "https://www.zhihu.com/api/v3/feed/topstory/hot-list-web?limit=20&desktop=true",
    {
      headers: {
        "User-Agent": UA,
        Referer: "https://www.zhihu.com/hot",
      },
    },
  );
  const json = (await res.json()) as any;

  const items = json?.data ?? [];

  return items.map((item: any, i: number) => ({
    title: item.target?.title_area?.text as string,
    url: item.target?.link?.url as string,
    hot: item.target?.metrics_area?.text || undefined,
    rank: i + 1,
  }));
}

export const zhihuSource: NewsSource = {
  id: "zhihu",
  name: "知乎热榜",
  description: "知乎实时热搜榜",
  fetch: fetchZhihu,
};
