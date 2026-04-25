"use client";

import { useState } from "react";
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
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div id="monad-news-panel">
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        aria-expanded={!collapsed}
        aria-controls="monad-news-body"
        className="feed-header-btn"
        style={{
          background: "#000",
          borderBottom: "1px solid #777",
          padding: 8,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          border: "none",
          borderRadius: 0,
          cursor: "pointer",
          color: "inherit",
          fontFamily: "inherit",
          textAlign: "left",
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
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div className="panel-meta" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span className="dot green blink" />
            MON
          </div>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 20,
              height: 20,
              fontSize: 16,
              lineHeight: 1,
              fontFamily: "var(--font-mono)",
              color: "#50fa7b",
              border: "1px solid #50fa7b",
              borderRadius: 2,
            }}
            aria-hidden
          >
            {collapsed ? "+" : "—"}
          </span>
        </div>
      </button>

      {!collapsed && (
        <div id="monad-news-body" style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
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
      )}
    </div>
  );
}
