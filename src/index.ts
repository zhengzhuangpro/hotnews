import type { NewsItem, NewsSource } from "./types.js";
import { sources, getSource } from "./sources/index.js";
import { fetchBaidu } from "./sources/baidu.js";
import { fetchWeibo } from "./sources/weibo.js";
import { fetchDouyin } from "./sources/douyin.js";
import { fetchHupu } from "./sources/hupu.js";
import { fetchZhihu } from "./sources/zhihu.js";
import { fetchJuejin } from "./sources/juejin.js";
import { fetchKr36 } from "./sources/kr36.js";
import { fetchGithub } from "./sources/github.js";

export type { NewsItem, NewsSource };
export { sources, getSource };
export { fetchBaidu, fetchWeibo, fetchDouyin, fetchHupu, fetchZhihu, fetchJuejin, fetchKr36, fetchGithub };

export interface FetchNewsOptions {
  /** 不传返回全部；传了截断为前 limit 条 */
  limit?: number;
}

export async function fetchNews(
  id: string,
  options: FetchNewsOptions = {}
): Promise<NewsItem[]> {
  const source = getSource(id);
  if (!source) {
    throw new Error(
      `Unknown source: "${id}". Available: ${sources.map((s) => s.id).join(", ")}`
    );
  }
  const items = await source.fetch();
  return options.limit ? items.slice(0, options.limit) : items;
}
