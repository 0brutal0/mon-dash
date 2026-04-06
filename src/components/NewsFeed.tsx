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

export default function NewsFeed({ data }: Props) {
  const items = data ?? NEWS_ITEMS.map((n) => ({ ...n, url: "#" }));

  return (
    <div id="right-panel">
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
            color: "#8be9fd",
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.05em",
          }}
        >
          Global Alert Feed
        </div>
        <div className="panel-meta">LIVE</div>
      </div>

      <div
        style={{
          padding: 12,
          borderBottom: "1px solid #555",
          background: "#000",
        }}
      >
        <div className="text-muted uppercase" style={{ fontSize: 10, marginBottom: 4 }}>
          Filter Query
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            color: "#8be9fd",
            fontSize: 14,
            borderBottom: "1px solid #8be9fd",
            paddingBottom: 2,
          }}
        >
          &gt; _
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
