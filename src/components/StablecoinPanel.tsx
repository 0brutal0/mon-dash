"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { STABLECOINS, URLS } from "@/data/constants";

interface StablecoinAsset {
  name: string;
  amount: string;
  pct: number;
  change30d?: number | null;
  source?: string;
}

interface StablecoinProps {
  total: string;
  assets: StablecoinAsset[];
  history?: number[];
}

interface Props {
  data?: StablecoinProps;
}

function buildSparklinePath(values: number[], width: number, height: number): string {
  if (values.length < 2) return "";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  return values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function formatUSD(val: number): string {
  if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
  if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
  if (val >= 1e3) return `$${(val / 1e3).toFixed(1)}K`;
  return `$${val.toFixed(0)}`;
}

export default function StablecoinPanel({ data }: Props) {
  const d: StablecoinProps = data ?? {
    total: STABLECOINS.total,
    assets: STABLECOINS.assets.map((a) => ({ ...a, change30d: null, source: "" })),
    history: [],
  };

  const history = useMemo(() => d.history ?? [], [d.history]);
  const hasChart = history.length >= 2;
  const svgWidth = 600;
  const svgHeight = 200;
  const sparkPath = hasChart ? buildSparklinePath(history, svgWidth, svgHeight) : "";

  const [tooltip, setTooltip] = useState<{ x: number; y: number; day: number; value: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!svgRef.current || history.length < 2) return;
      const rect = svgRef.current.getBoundingClientRect();
      const relX = e.clientX - rect.left;
      const pct = relX / rect.width;
      const idx = Math.round(pct * (history.length - 1));
      const clampedIdx = Math.max(0, Math.min(history.length - 1, idx));

      const min = Math.min(...history);
      const max = Math.max(...history);
      const range = max - min || 1;
      const svgX = (clampedIdx / (history.length - 1)) * svgWidth;
      const svgY = svgHeight - ((history[clampedIdx] - min) / range) * svgHeight;

      setTooltip({ x: svgX, y: svgY, day: clampedIdx + 1, value: history[clampedIdx] });
    },
    [history]
  );

  const handleMouseLeave = useCallback(() => setTooltip(null), []);

  return (
    <div className="panel col-7" style={{ minHeight: 500 }}>
      <div className="panel-header">
        <div className="panel-title">Stablecoins on Monad</div>
        <div className="panel-meta">ALL TIME</div>
      </div>
      <div className="panel-content">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
          <div>
            <span className="text-muted uppercase" style={{ fontSize: 10 }}>Total</span>
            <span className="val text-cyan" style={{ fontSize: 18, marginLeft: 8 }}>{d.total}</span>
          </div>
          {hasChart && (
            <span className="text-muted" style={{ fontSize: 9 }}>
              {history.length}d history
            </span>
          )}
        </div>

        {hasChart && (
          <div style={{ height: 220, marginBottom: 8, position: "relative" }}>
            <svg
              ref={svgRef}
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              preserveAspectRatio="none"
              style={{ width: "100%", height: "100%", cursor: "crosshair" }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <defs>
                <linearGradient id="stableGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: "#50fa7b", stopOpacity: 0.3 }} />
                  <stop offset="100%" style={{ stopColor: "#000000", stopOpacity: 0 }} />
                </linearGradient>
              </defs>
              <path
                d={`${sparkPath} L${svgWidth},${svgHeight} L0,${svgHeight} Z`}
                fill="url(#stableGrad)"
              />
              <path d={sparkPath} fill="none" stroke="#50fa7b" strokeWidth="2" />

              {tooltip && (
                <>
                  <line
                    x1={tooltip.x}
                    y1={0}
                    x2={tooltip.x}
                    y2={svgHeight}
                    stroke="#50fa7b"
                    strokeWidth="1"
                    strokeDasharray="4 2"
                    opacity={0.6}
                  />
                  <circle
                    cx={tooltip.x}
                    cy={tooltip.y}
                    r={5}
                    fill="#50fa7b"
                    stroke="#000"
                    strokeWidth="2"
                  />
                </>
              )}
            </svg>

            {tooltip && (
              <div
                style={{
                  position: "absolute",
                  left: `${(tooltip.x / svgWidth) * 100}%`,
                  top: 4,
                  transform: tooltip.x > svgWidth * 0.75 ? "translateX(-110%)" : "translateX(10%)",
                  background: "#111",
                  border: "1px solid #50fa7b",
                  padding: "4px 8px",
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                  pointerEvents: "none",
                  whiteSpace: "nowrap",
                  zIndex: 10,
                }}
              >
                <div className="text-green" style={{ fontWeight: 600 }}>{formatUSD(tooltip.value)}</div>
                <div className="text-muted" style={{ fontSize: 9 }}>Day {tooltip.day}</div>
              </div>
            )}
          </div>
        )}

        <div style={{ flex: 1, overflowY: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>Asset</th>
                <th>Amount</th>
                <th className="right" style={{ width: 82 }}>Share</th>
                <th className="right" style={{ width: 88 }}>30d</th>
              </tr>
            </thead>
            <tbody>
              {d.assets.map((a) => (
                <tr key={a.name}>
                  <td className="bold">
                    {URLS.stablecoins[a.name] ? (
                      <a href={URLS.monadscanToken(URLS.stablecoins[a.name])} target="_blank" rel="noopener noreferrer" className="ext-link">{a.name}</a>
                    ) : (
                      a.name
                    )}
                  </td>
                  <td>{a.amount}</td>
                  <td className="right text-muted" style={{ overflow: "visible", textOverflow: "clip" }}>{a.pct.toFixed(2)}%</td>
                  <td className="right" style={{ overflow: "visible", textOverflow: "clip" }}>
                    {a.change30d != null ? (
                      <span className={a.change30d >= 0 ? "text-green" : "text-red"}>
                        {a.change30d >= 0 ? "+" : ""}{a.change30d.toFixed(2)}%
                      </span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
