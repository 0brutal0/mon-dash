// Monad news via multiple Google News RSS feeds + CoinGecko general news

const COINGECKO_NEWS = "https://api.coingecko.com/api/v3/news";

// Multiple RSS feeds for broader Monad coverage
const MONAD_RSS_FEEDS = [
  "https://news.google.com/rss/search?q=%22monad%22+crypto&hl=en-US&gl=US&ceid=US:en",
  "https://news.google.com/rss/search?q=MON+token+monad&hl=en-US&gl=US&ceid=US:en",
  "https://news.google.com/rss/search?q=monad+blockchain&hl=en-US&gl=US&ceid=US:en",
];

export interface NewsItem {
  time: string;
  title: string;
  source: string;
  url: string;
  kind: "news" | "media" | "analysis";
}

// ─── CoinGecko general crypto news ──────────────────────────

interface CoinGeckoItem {
  created_at: number;
  title: string;
  description?: string;
  news_site: string;
  url: string;
}

export async function getGeneralNews(limit: number = 15): Promise<NewsItem[]> {
  try {
    const res = await fetch(`${COINGECKO_NEWS}?page=1`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    const items: CoinGeckoItem[] = data.data ?? [];
    return items.slice(0, limit).map((item) => ({
      time: formatEpoch(item.created_at),
      title: item.title,
      source: item.news_site ?? "Unknown",
      url: item.url,
      kind: "news" as const,
    }));
  } catch {
    return [];
  }
}

// ─── Monad-specific news via multiple Google News RSS feeds ──

export async function getMonadNews(limit: number = 15): Promise<NewsItem[]> {
  try {
    // Fetch all feeds in parallel
    const feeds = await Promise.all(
      MONAD_RSS_FEEDS.map((url) =>
        fetch(url, { next: { revalidate: 1800 } })
          .then((r) => (r.ok ? r.text() : ""))
          .catch(() => "")
      )
    );

    // Parse all feeds and merge
    const allItems: { date: number; titleKey: string; item: NewsItem }[] = [];
    for (const xml of feeds) {
      if (!xml) continue;
      allItems.push(...parseRSSItemsRaw(xml));
    }

    // Deduplicate by normalized title
    const seen = new Set<string>();
    const unique = allItems.filter((entry) => {
      if (seen.has(entry.titleKey)) return false;
      seen.add(entry.titleKey);
      return true;
    });

    // Sort by date descending (latest first)
    unique.sort((a, b) => b.date - a.date);

    return unique.slice(0, limit).map((r) => r.item);
  } catch {
    return [];
  }
}

// ─── RSS parsing ────────────────────────────────────────────

interface RawParsed {
  date: number;
  titleKey: string;
  item: NewsItem;
}

const TITLE_FILTERS = [
  "price today", "live price", "price chart", "market cap &",
  "price prediction", "to usd", "to eur", "to ngn", "to zar",
  "to inr", "to gbp",
];

function parseRSSItemsRaw(xml: string): RawParsed[] {
  const raw: RawParsed[] = [];

  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const title = extractTag(block, "title");
    const link = extractTag(block, "link");
    const pubDate = extractTag(block, "pubDate");
    const source = extractTagAttr(block, "source") || extractTag(block, "source");

    if (!title) continue;

    // Filter out price tickers, exchange pages, currency conversions
    const lower = title.toLowerCase();
    if (TITLE_FILTERS.some((f) => lower.includes(f))) continue;

    const dateMs = new Date(pubDate).getTime() || 0;
    // Normalize title for deduplication (lowercase, strip punctuation)
    const titleKey = lower.replace(/[^a-z0-9]/g, "").slice(0, 60);

    raw.push({
      date: dateMs,
      titleKey,
      item: {
        time: formatPubDate(pubDate),
        title: cleanTitle(title),
        source: source || "Google News",
        url: link || "#",
        kind: "news",
      },
    });
  }

  return raw;
}

function extractTag(xml: string, tag: string): string {
  const cdataRegex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`);
  const cdataMatch = cdataRegex.exec(xml);
  if (cdataMatch) return cdataMatch[1].trim();

  const regex = new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`);
  const match = regex.exec(xml);
  return match ? match[1].trim() : "";
}

function extractTagAttr(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}\\s[^>]*>([^<]*)</${tag}>`);
  const match = regex.exec(xml);
  return match ? match[1].trim() : "";
}

function cleanTitle(title: string): string {
  // Google News appends " - Source Name" to titles, remove it
  const dashIdx = title.lastIndexOf(" - ");
  if (dashIdx > 20) return title.slice(0, dashIdx);
  return title;
}

function formatPubDate(pubDate: string): string {
  try {
    const d = new Date(pubDate);
    const mon = d.toLocaleString("en-US", { month: "short", timeZone: "UTC" }).toUpperCase();
    const day = d.getUTCDate();
    const time = d.toISOString().slice(11, 16);
    return `${mon} ${day} ${time}`;
  } catch {
    return "";
  }
}

function formatEpoch(epoch: number): string {
  try {
    const d = new Date(epoch * 1000);
    const mon = d.toLocaleString("en-US", { month: "short", timeZone: "UTC" }).toUpperCase();
    const day = d.getUTCDate();
    const time = d.toISOString().slice(11, 16);
    return `${mon} ${day} ${time}`;
  } catch {
    return "";
  }
}
