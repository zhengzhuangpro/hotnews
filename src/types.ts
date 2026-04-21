export interface NewsItem {
  title: string;
  url: string;
  hot?: string;
  rank: number;
}

export interface NewsSource {
  id: string;
  name: string;
  description: string;
  fetch: () => Promise<NewsItem[]>;
}
