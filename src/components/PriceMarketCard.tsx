"use client";

import { useState, useCallback, useEffect } from "react";
import { PRICE_DATA, URLS } from "@/data/constants";
import { formatPct } from "@/lib/format";
import type { ChartPoint } from "@/lib/coingecko";

interface TickerData {
  price: number;
  change24h: number;
  change30d?: number;
  changeAbs: number;
  marketCap: string;
  volume24h: string;
  fdv: string;
  openInterest?: string | null;
}

interface Props {
  data?: TickerData;
  chart?: ChartPoint[] | null;
}

const RANGES = [
  { label: "1D", days: 1 },
  { label: "1W", days: 7 },
  { label: "30D", days: 30 },
];

function buildSVGPath(points: ChartPoint[], W: number, H: number) {
  if (points.length === 0) return { linePath: "", areaPath: "" };
  const prices = points.map((p) => p.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const coords = points.map((p, i) => ({
    x: (i / (points.length - 1)) * W,
    y: H - ((p.price - min) / range) * H,
  }));
  const linePath = coords
    .map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(2)},${c.y.toFixed(2)}`)
    .join(" ");
  const areaPath = `${linePath} L${W},${H} L0,${H} Z`;
  return { linePath, areaPath };
}

function getYForIndex(points: ChartPoint[], idx: number, H: number): number {
  const prices = points.map((p) => p.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  return H - ((points[idx].price - min) / range) * H;
}

export default function PriceMarketCard({ data, chart }: Props) {
  const [tickerData, setTickerData] = useState<TickerData>(data ?? PRICE_DATA);
  const [range, setRange] = useState(RANGES[1]); // default 1W
  const [chartData, setChartData] = useState<ChartPoint[]>(chart ?? []);
  const [loading, setLoading] = useState(false);
  const [hover, setHover] = useState<{ idx: number; xPct: number } | null>(null);
  const d = tickerData;

  const W = 1000, H = 200;
  const hasChart = chartData.length > 0;
  const { linePath, areaPath } = hasChart
    ? buildSVGPath(chartData, W, H)
    : { linePath: "", areaPath: "" };

  const fetchChart = useCallback(async (days: number, showLoading = true) => {
    if (showLoading) setLoading(true);
    setHover(null);
    try {
      const res = await fetch(`/api/chart?days=${days}`);
      if (res.ok) setChartData(await res.json());
    } catch {
      // keep current data on error
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  const handleRangeClick = (r: (typeof RANGES)[number]) => {
    setRange(r);
    fetchChart(r.days);
  };

  useEffect(() => {
    const pollTicker = async () => {
      try {
        const res = await fetch("/api/ticker");
        if (!res.ok) return;
        const json = await res.json();
        if (json.ticker) {
          setTickerData((current) => ({
            ...current,
            ...json.ticker,
            openInterest: json.ticker.openInterest ?? current.openInterest,
          }));
        }
      } catch {
        // keep the last ticker if refresh fails
      }
    };

    const interval = setInterval(pollTicker, 60_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchChart(range.days, false);
    }, 2 * 60_000);

    return () => clearInterval(interval);
  }, [fetchChart, range.days]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!hasChart) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const xPct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      setHover({ idx: Math.round(xPct * (chartData.length - 1)), xPct });
    },
    [chartData.length, hasChart]
  );

  const hoverSvgX = hover ? hover.xPct * W : null;
  const hoverSvgY =
    hover && hasChart ? getYForIndex(chartData, hover.idx, H) : null;
  const hoverPrice = hover && hasChart ? chartData[hover.idx].price : null;
  const firstPrice = hasChart ? chartData[0].price : null;
  const lastPrice = hasChart ? chartData[chartData.length - 1].price : null;
  const rangeChangeAbs =
    firstPrice !== null && lastPrice !== null ? lastPrice - firstPrice : d.changeAbs;
  const rangeChangePct =
    firstPrice !== null && lastPrice !== null && firstPrice !== 0
      ? ((lastPrice - firstPrice) / firstPrice) * 100
      : d.change24h;
  const isUp = typeof rangeChangeAbs === "number" ? rangeChangeAbs >= 0 : d.change24h >= 0;
  const displayChangeAbs =
    typeof rangeChangeAbs === "number"
      ? `${rangeChangeAbs >= 0 ? "+" : ""}${rangeChangeAbs.toFixed(4)}`
      : `${isUp ? "+" : ""}${rangeChangeAbs}`;

  return (
    <div className="panel col-8" style={{ minHeight: 300 }}>
      <style>{`
        .range-btn {
          background: transparent;
          border: none;
          color: var(--color-text-muted);
          font-family: var(--font-mono);
          font-size: 10px;
          cursor: pointer;
          padding: 1px 5px;
          border-radius: 2px;
          transition: color 0.15s, background 0.15s;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .range-btn:hover { color: var(--color-text-primary); }
        .range-btn.ractive {
          color: var(--color-accent-pink);
          background: rgba(255,121,198,0.1);
        }
      `}</style>

      <div className="panel-header">
        <div className="panel-title">Price Action (MON/USD)</div>
        <div
          className="panel-meta"
          style={{
            display: "flex",
            gap: 2,
            alignItems: "center",
            pointerEvents: "auto",
          }}
        >
          {RANGES.map((r) => (
            <button
              key={r.label}
              className={`range-btn${range.label === r.label ? " ractive" : ""}`}
              onClick={() => handleRangeClick(r)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="panel-content no-pad">
        <div
          className="chart-container"
          style={{
            cursor: "crosshair",
            opacity: loading ? 0.45 : 1,
            transition: "opacity 0.2s",
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHover(null)}
        >
          <svg
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
            }}
          >
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: "#ff79c6", stopOpacity: 0.5 }} />
                <stop offset="100%" style={{ stopColor: "#000000", stopOpacity: 0 }} />
              </linearGradient>
            </defs>

            {hasChart ? (
              <>
                <path d={areaPath} fill="url(#grad1)" />
                <path d={linePath} fill="none" stroke="#ff79c6" strokeWidth="1.5" />
              </>
            ) : (
              <>
                <path
                  d="M0,150 L100,120 L150,130 L250,80 L350,90 L450,40 L500,60 L600,30 L700,50 L800,20 L900,40 L1000,10 L1000,200 L0,200 Z"
                  fill="url(#grad1)"
                />
                <path
                  d="M0,150 L100,120 L150,130 L250,80 L350,90 L450,40 L500,60 L600,30 L700,50 L800,20 L900,40 L1000,10"
                  fill="none"
                  stroke="#ff79c6"
                  strokeWidth="1.5"
                />
              </>
            )}

            {/* Crosshair */}
            {hoverSvgX !== null && hoverSvgY !== null && (
              <g style={{ pointerEvents: "none" }}>
                <line
                  x1={hoverSvgX} y1={0} x2={hoverSvgX} y2={H}
                  stroke="rgba(255,255,255,0.25)"
                  strokeWidth="1"
                  strokeDasharray="4,4"
                />
                <line
                  x1={0} y1={hoverSvgY} x2={W} y2={hoverSvgY}
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="1"
                  strokeDasharray="4,4"
                />
                <circle
                  cx={hoverSvgX} cy={hoverSvgY} r="4"
                  fill="#ff79c6"
                  stroke="#000"
                  strokeWidth="2"
                />
              </g>
            )}
          </svg>

          {/* Current price overlay */}
          <div style={{ position: "absolute", top: 8, right: 8, textAlign: "right" }}>
            <a
              href={URLS.coingecko}
              target="_blank"
              rel="noopener noreferrer"
              className="ext-link mono text-cyan"
              style={{ fontSize: 16 }}
            >
              ${d.price}
            </a>
            <div
              className={`mono ${isUp ? "text-green" : "text-red"}`}
              style={{ fontSize: 10 }}
            >
              {displayChangeAbs} ({formatPct(rangeChangePct, false)})
            </div>
          </div>

          {/* Hover tooltip */}
          {hover && hoverPrice !== null && (
            <div
              style={{
                position: "absolute",
                top: 6,
                left: `clamp(4px, calc(${hover.xPct * 100}% - 52px), calc(100% - 116px))`,
                background: "#000",
                border: "1px solid var(--color-border-highlight)",
                padding: "3px 8px",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "#ff79c6",
                pointerEvents: "none",
                whiteSpace: "nowrap",
                zIndex: 1000,
              }}
            >
              ${hoverPrice.toFixed(6)}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
