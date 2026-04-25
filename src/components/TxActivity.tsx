"use client";

import { useState } from "react";
import { TX_ACTIVITY } from "@/data/constants";

interface Props {
  data?: typeof TX_ACTIVITY;
}

function buildTrendPath(values: number[], width: number, height: number) {
  const pad = 8;
  const chartHeight = height - pad * 2;
  const points = values.map((v, i) => {
    const x = values.length > 1 ? (i / (values.length - 1)) * width : width;
    const y = pad + (1 - v / 100) * chartHeight;
    return { x, y };
  });
  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
    .join(" ");
  const areaPath = `${linePath} L${width},${height} L0,${height} Z`;

  return { linePath, areaPath };
}

export default function TxActivity({ data }: Props) {
  const d = data ?? TX_ACTIVITY;
  const [hover, setHover] = useState<{ idx: number; xPct: number } | null>(null);
  const chartWidth = 1000;
  const chartHeight = 90;
  const { linePath, areaPath } = buildTrendPath(d.txBars30d, chartWidth, chartHeight);
  const isGrowthPositive = !d.dailyTxGrowth.startsWith("-");
  const lastValue = d.txBars30d[d.txBars30d.length - 1] ?? 0;
  const lastY = 8 + (1 - lastValue / 100) * (chartHeight - 16);
  const hoverValue = hover ? d.txValues30d?.[hover.idx] ?? `${d.txBars30d[hover.idx]}%` : null;
  const hoverY =
    hover && d.txBars30d[hover.idx] !== undefined
      ? 8 + (1 - d.txBars30d[hover.idx] / 100) * (chartHeight - 16)
      : null;

  return (
    <div className="panel col-7" style={{ minHeight: 330 }}>
      <div className="panel-header">
        <div className="panel-title">Transaction &amp; Address Activity</div>
        <div className="panel-meta">
          <span className="text-green">{d.dailyTxGrowth} 7D</span>
        </div>
      </div>
      <div className="panel-content">
        <div className="data-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          <div className="data-item">
            <span className="lbl">Daily Tx</span>
            <span className="val text-cyan">{d.dailyTx}</span>
          </div>
          <div className="data-item">
            <span className="lbl">Gas Used</span>
            <span className="val">{d.gasUsed}</span>
          </div>
          <div className="data-item">
            <span className="lbl">Avg Gas Price</span>
            <span className="val">{d.avgGasPrice}</span>
          </div>
          <div className="data-item" style={{ marginTop: 4 }}>
            <span className="lbl">Active Addrs (D)</span>
            <span className="val">{d.activeAddrsDaily}</span>
          </div>
          <div className="data-item" style={{ marginTop: 4 }}>
            <span className="lbl">Active Addrs (M)</span>
            <span className="val">{d.activeAddrsMonthly}</span>
          </div>
          <div className="data-item" style={{ marginTop: 4 }}>
            <span className="lbl">New Addrs (D)</span>
            <span className="val text-green">{d.newAddrsDaily}</span>
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <div className="text-muted uppercase" style={{ fontSize: 10, marginBottom: 4 }}>
            30D Tx Trend
          </div>
          <div
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const xPct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
              setHover({ idx: Math.round(xPct * (d.txBars30d.length - 1)), xPct });
            }}
            onMouseLeave={() => setHover(null)}
            style={{
              height: 90,
              position: "relative",
              cursor: "crosshair",
              borderTop: "1px solid #333",
              background:
                "repeating-linear-gradient(0deg, transparent, transparent 17px, #151515 18px), repeating-linear-gradient(90deg, transparent, transparent 49px, #151515 50px)",
            }}
          >
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              preserveAspectRatio="none"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
            >
              <defs>
                <linearGradient id="txTrendFill" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: "#8be9fd", stopOpacity: 0.35 }} />
                  <stop offset="100%" style={{ stopColor: "#000000", stopOpacity: 0 }} />
                </linearGradient>
              </defs>
              <path d={areaPath} fill="url(#txTrendFill)" />
              <path d={linePath} fill="none" stroke="#8be9fd" strokeWidth="2" />
              {hover && hoverY !== null && (
                <g style={{ pointerEvents: "none" }}>
                  <line
                    x1={hover.xPct * chartWidth}
                    y1={0}
                    x2={hover.xPct * chartWidth}
                    y2={chartHeight}
                    stroke="rgba(255,255,255,0.22)"
                    strokeWidth="1"
                    strokeDasharray="4,4"
                  />
                  <circle
                    cx={hover.xPct * chartWidth}
                    cy={hoverY}
                    r="4"
                    fill="#8be9fd"
                    stroke="#000"
                    strokeWidth="2"
                  />
                </g>
              )}
              <circle
                cx={chartWidth}
                cy={lastY}
                r="4"
                fill={isGrowthPositive ? "#50fa7b" : "#ff5555"}
                stroke="#000"
                strokeWidth="2"
              />
            </svg>
            {hover && hoverValue && (
              <div
                style={{
                  position: "absolute",
                  top: 6,
                  left: `clamp(4px, calc(${hover.xPct * 100}% - 44px), calc(100% - 96px))`,
                  background: "#000",
                  border: "1px solid var(--color-border-highlight)",
                  color: "var(--color-text-primary)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  padding: "3px 6px",
                  whiteSpace: "nowrap",
                  pointerEvents: "none",
                  zIndex: 1000,
                }}
              >
                {hoverValue}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
