import type { NewsItem, NewsSource } from "../types.js";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export async function fetchV2ex(): Promise<NewsItem[]> {
  const res = await fetch("https://www.v2ex.com/feed/share.json", {
    headers: {
      "User-Agent": UA,
      Referer: "https://www.v2ex.com/",
    },
  });
  const json = (await res.json()) as any;

  // JSON Feed v1 格式：items[].{title, url, id, date_published}
  // 该接口无热度字段，hot 留空
  const items = json?.items ?? [];

  return items.map((item: any, i: number) => ({
    title: item.title as string,
    url: (item.url as string) ?? (item.id as string),
    rank: i + 1,
  }));
}

export const v2exSource: NewsSource = {
  id: "v2ex",
  name: "V2EX 分享发现",
  description: "V2EX 分享发现节点热帖",
  fetch: fetchV2ex,
};
