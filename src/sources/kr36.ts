import type { NewsItem, NewsSource } from "../types.js";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

async function fetchKr36(): Promise<NewsItem[]> {
  const res = await fetch("https://www.36kr.com/newsflashes", {
    headers: { "User-Agent": UA },
  });
  const html = await res.text();

  const match = html.match(/window\.initialState=(\{.+?\})\s*</s);
  if (!match) return [];

  const data = JSON.parse(match[1].replace(/\n/g, " "));
  const items =
    data?.newsflashCatalogData?.data?.newsflashList?.data?.itemList ?? [];

  return items.map((item: any, i: number) => ({
    title: item.templateMaterial?.widgetTitle as string,
    url: `https://36kr.com/p/${item.itemId}`,
    rank: i + 1,
  }));
}

export const kr36Source: NewsSource = {
  id: "36kr",
  name: "36氪快讯",
  description: "36氪实时快讯",
  fetch: fetchKr36,
};
