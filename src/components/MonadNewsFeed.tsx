import { NEWS_ITEMS } from "@/data/constants";

interface NewsItem {
  time: string;
  title: string;
  source: string;
  sourceColor: string;
  url?: string;
}

interface Props {
  data?: NewsItem[];
}

export default function MonadNewsFeed({ data }: Props) {
  const items = data ?? NEWS_ITEMS.map((n) => ({ ...n, url: "#" }));

  return (
    <div id="monad-news-panel">
      <div
        style={{
          background: "#000",
          borderBottom: "1px solid #777",
          padding: 8,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          className="uppercase bold"
          style={{
            fontSize: 11,
            color: "#50fa7b",
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.05em",
          }}
        >
          Monad News
        </div>
        <div className="panel-meta">MON</div>
      </div>

      <div
        style={{
          padding: 12,
          borderBottom: "1px solid #555",
          background: "#000",
        }}
      >
        <div className="text-muted uppercase" style={{ fontSize: 10, marginBottom: 4 }}>
          Filter
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            color: "#50fa7b",
            fontSize: 14,
            borderBottom: "1px solid #50fa7b",
            paddingBottom: 2,
          }}
        >
          &gt; monad
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {items.map((item, i) => (
          <div key={i} className="news-item">
            <div className="news-time">{item.time}</div>
            {item.url && item.url !== "#" ? (
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="ext-link news-title" style={{ display: "block" }}>
                {item.title}
              </a>
            ) : (
              <div className="news-title">{item.title}</div>
            )}
            <div className={`news-source ${item.sourceColor}`}>
              {item.source}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
