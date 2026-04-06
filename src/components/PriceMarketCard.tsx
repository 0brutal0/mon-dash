import { PRICE_DATA, URLS } from "@/data/constants";
import { formatPct } from "@/lib/format";
import type { ChartPoint } from "@/lib/coingecko";

interface Props {
  data?: typeof PRICE_DATA;
  chart?: ChartPoint[] | null;
}

function buildSVGPath(points: ChartPoint[], width: number, height: number) {
  if (points.length === 0) return { linePath: "", areaPath: "" };
  const prices = points.map((p) => p.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;

  const coords = points.map((p, i) => {
    const x = (i / (points.length - 1)) * width;
    const y = height - ((p.price - min) / range) * height;
    return { x, y };
  });

  const linePath = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x},${c.y}`).join(" ");
  const areaPath = `${linePath} L${width},${height} L0,${height} Z`;
  return { linePath, areaPath };
}

export default function PriceMarketCard({ data, chart }: Props) {
  const d = data ?? PRICE_DATA;
  const isUp = d.change24h >= 0;

  // Use live chart or fallback SVG
  const hasChart = chart && chart.length > 0;
  const { linePath, areaPath } = hasChart
    ? buildSVGPath(chart, 1000, 200)
    : { linePath: "", areaPath: "" };

  return (
    <div className="panel col-8" style={{ height: 300 }}>
      <div className="panel-header">
        <div className="panel-title">Price Action (MON/USD)</div>
        <div className="panel-meta">INT: 1H | 7D CHART</div>
      </div>
      <div className="panel-content no-pad">
        <div className="chart-container">
          <svg
            viewBox="0 0 1000 200"
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
          </svg>
          <div style={{ position: "absolute", top: 8, right: 8, textAlign: "right" }}>
            <a href={URLS.coingecko} target="_blank" rel="noopener noreferrer" className="ext-link mono text-cyan" style={{ fontSize: 16 }}>
              {d.price}
            </a>
            <div className={`mono ${isUp ? "text-green" : "text-red"}`} style={{ fontSize: 10 }}>
              {isUp ? "+" : ""}{d.changeAbs} ({formatPct(d.change24h, false)})
            </div>
          </div>
        </div>
        <div
          className="bar-chart"
          style={{ height: 30, margin: 0, padding: 0, border: "none", opacity: 0.5 }}
        >
          {[40, 60, 30, 80, 50, 70, 90, 40, 60, 20, 50, 100, 40, 60, 30].map((h, i) => (
            <div key={i} className="bar" style={{ height: `${h}%`, background: "#ff79c6" }} />
          ))}
        </div>
      </div>
    </div>
  );
}
