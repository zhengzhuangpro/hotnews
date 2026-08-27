import type { NewsSource } from "../types.js";
import { baiduSource } from "./baidu.js";
import { weiboSource } from "./weibo.js";
import { douyinSource } from "./douyin.js";
import { hupuSource } from "./hupu.js";
import { kr36Source } from "./kr36.js";
import { zhihuSource } from "./zhihu.js";
import { juejinSource } from "./juejin.js";
import { githubSource } from "./github.js";
import { sspaiSource } from "./sspai.js";
import { v2exSource } from "./v2ex.js";

export const sources: NewsSource[] = [
  baiduSource,
  weiboSource,
  douyinSource,
  hupuSource,
  kr36Source,
  zhihuSource,
  juejinSource,
  githubSource,
  sspaiSource,
  v2exSource,
];

export function getSource(id: string): NewsSource | undefined {
  return sources.find((s) => s.id === id);
}
