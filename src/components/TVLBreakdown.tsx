"use client";

import { useState } from "react";
import { TVL_BREAKDOWN, DEFI_PROTOCOLS, URLS } from "@/data/constants";

interface TVLProps {
  total: string;
  byCategory: { name: string; value: string; pct: number; color: string }[];
  protocols: {
    name: string;
    category: string;
    tvl: string;
    pct: number;
    color: string;
    url?: string | null;
    rawTvl?: number;
    maxTvl?: number;
  }[];
}

interface Props {
  data?: TVLProps;
}

export default function TVLBreakdown({ data }: Props) {
  const d: TVLProps = data ?? {
    total: TVL_BREAKDOWN.total,
    byCategory: TVL_BREAKDOWN.byCategory,
    protocols: DEFI_PROTOCOLS,
  };

  const maxPct =
    d.protocols.length > 0 ? Math.max(...d.protocols.map((p) => p.pct)) : 1;

  const [hoveredName, setHoveredName] = useState<string | null>(null);

  return (
    <div className="panel col-7" style={{ minHeight: 320 }}>
      <style>{`
        .tvl-row { position: relative; }
        .tvl-tooltip {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          background: #000;
          border: 1px solid var(--color-border-highlight);
          padding: 4px 10px;
          font-family: var(--font-mono);
          font-size: 10px;
          white-space: nowrap;
          pointer-events: none;
          z-index: 1000;
          line-height: 1.6;
          /* push tooltip to the right of the row */
          right: -8px;
          transform: translate(100%, -50%);
        }
      `}</style>

      <div className="panel-header">
        <div className="panel-title green">TVL Breakdown</div>
        <div className="panel-meta">ALL PROTOCOLS</div>
      </div>

      <div className="panel-content">
        {/* Header row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 8,
          }}
        >
          <span className="val text-cyan" style={{ fontSize: 18 }}>{d.total}</span>
          <div style={{ display: "flex", gap: 12 }}>
            {d.byCategory.slice(0, 4).map((c) => (
              <span key={c.name} style={{ fontSize: 10, color: c.color }}>
                {c.name} {c.value}
              </span>
            ))}
          </div>
        </div>

        {/* Protocol rows */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {d.protocols.map((p) => {
            const protocolUrl = p.url ?? URLS.protocols?.[p.name.toLowerCase()];
            const isHovered = hoveredName === p.name;

            return (
              <div
                key={p.name}
                className="h-bar-row tvl-row"
                style={{ cursor: "default" }}
                onMouseEnter={() => setHoveredName(p.name)}
                onMouseLeave={() => setHoveredName(null)}
              >
                {protocolUrl ? (
                  <a
                    href={protocolUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ext-link h-bar-label"
                    style={isHovered ? { color: "var(--color-text-primary)" } : undefined}
                  >
                    {p.name}
                  </a>
                ) : (
                  <span
                    className="h-bar-label"
                    style={isHovered ? { color: "var(--color-text-primary)" } : undefined}
                  >
                    {p.name}
                  </span>
                )}

                <div className="h-bar-track">
                  <div
                    className="h-bar-fill"
                    style={{
                      width: `${(p.pct / maxPct) * 100}%`,
                      background: p.color,
                      opacity: isHovered ? 1 : 0.8,
                      transition: "opacity 0.15s, width 0.3s",
                    }}
                  />
                </div>

                <span className="h-bar-value">{p.tvl}</span>
                <span style={{ width: 32, textAlign: "right", fontSize: 10, color: "#777" }}>
                  {p.pct}%
                </span>

                {/* Hover tooltip */}
                {isHovered && (
                  <div className="tvl-tooltip">
                    <div style={{ color: p.color, fontWeight: 600 }}>{p.name}</div>
                    <div>
                      <span style={{ color: "var(--color-text-muted)" }}>TVL: </span>
                      <span style={{ color: "var(--color-accent-cyan)" }}>{p.tvl}</span>
                    </div>
                    <div>
                      <span style={{ color: "var(--color-text-muted)" }}>Share: </span>
                      <span>{p.pct}%</span>
                    </div>
                    <div>
                      <span style={{ color: "var(--color-text-muted)" }}>Category: </span>
                      <span>{p.category}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
