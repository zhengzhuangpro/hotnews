import type { NewsSource } from "../types.js";
import { baiduSource } from "./baidu.js";
import { weiboSource } from "./weibo.js";
import { douyinSource } from "./douyin.js";
import { hupuSource } from "./hupu.js";
import { kr36Source } from "./kr36.js";
import { zhihuSource } from "./zhihu.js";

export const sources: NewsSource[] = [
  baiduSource,
  weiboSource,
  douyinSource,
  hupuSource,
  kr36Source,
  zhihuSource,
];

export function getSource(id: string): NewsSource | undefined {
  return sources.find((s) => s.id === id);
}
