import type { NewsItem, NewsSource } from "../types.js";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

async function fetchDouyin(): Promise<NewsItem[]> {
  const res = await fetch(
    "https://www.douyin.com/aweme/v1/web/hot/search/list/?device_platform=webapp&aid=6383&channel=channel_pc_web&detail_list=1",
    {
      headers: {
        "User-Agent": UA,
        Referer: "https://www.douyin.com/",
      },
    }
  );
  const json = (await res.json()) as any;

  const wordList = json?.data?.word_list ?? [];

  return wordList.map((item: any) => ({
    title: item.word as string,
    url: `https://www.douyin.com/search/${encodeURIComponent(item.word)}`,
    hot: item.hot_value ? formatHot(item.hot_value) : undefined,
    rank: item.position ?? 0,
  }));
}

function formatHot(n: number): string {
  if (n >= 10_000_000) return `${(n / 10_000_000).toFixed(1)}千万`;
  if (n >= 10_000) return `${(n / 10_000).toFixed(1)}万`;
  return String(n);
}

export const douyinSource: NewsSource = {
  id: "douyin",
  name: "抖音热搜",
  description: "抖音实时热搜榜",
  fetch: fetchDouyin,
};
