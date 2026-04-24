import type { NewsItem, NewsSource } from "../types.js";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

async function fetchGithub(): Promise<NewsItem[]> {
  const res = await fetch("https://github.com/trending", {
    headers: {
      "User-Agent": UA,
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });
  const html = await res.text();

  const articles = html.split('<article class="Box-row">').slice(1);
  if (articles.length === 0) return [];

  return articles.map((article: string, i: number) => {
    const hrefMatch = article.match(
      /<h2[^>]*>[\s\S]*?<a[^>]*href="\/([^"]+)"[^>]*>[\s\S]*?<\/a>/,
    );
    const repoPath = hrefMatch ? hrefMatch[1].trim() : "";

    const descMatch = article.match(
      /<p class="col-9 color-fg-muted[^"]*">([\s\S]*?)<\/p>/,
    );
    const description = descMatch
      ? descMatch[1].replace(/<[^>]+>/g, "").trim()
      : "";

    const starsMatch = article.match(
      /<span[^>]*class="d-inline-block float-sm-right">[\s\S]*?([\d,]+)\s+stars?\s+today/,
    );
    const starsToday = starsMatch ? starsMatch[1].replace(/,/g, "") : "";

    const title = repoPath
      .split("/")
      .pop()
      ?.replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()) ?? "";

    return {
      title: description || title,
      url: `https://github.com/${repoPath}`,
      hot: starsToday ? `${starsToday} stars today` : undefined,
      rank: i + 1,
    };
  });
}

export const githubSource: NewsSource = {
  id: "github",
  name: "GitHub Trending",
  description: "GitHub 今日热门开源项目",
  fetch: fetchGithub,
};
