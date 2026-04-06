import { TVL_BREAKDOWN, DEFI_PROTOCOLS, URLS } from "@/data/constants";

interface TVLProps {
  total: string;
  byCategory: { name: string; value: string; pct: number; color: string }[];
  protocols: { name: string; category: string; tvl: string; pct: number; color: string; url?: string | null; rawTvl?: number; maxTvl?: number }[];
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
  const maxPct = d.protocols.length > 0 ? Math.max(...d.protocols.map((p) => p.pct)) : 1;

  return (
    <div className="panel col-7" style={{ height: 320 }}>
      <div className="panel-header">
        <div className="panel-title green">TVL Breakdown</div>
        <div className="panel-meta">ALL PROTOCOLS</div>
      </div>
      <div className="panel-content">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
          <span className="val text-cyan" style={{ fontSize: 18 }}>{d.total}</span>
          <div style={{ display: "flex", gap: 12 }}>
            {d.byCategory.slice(0, 4).map((c) => (
              <span key={c.name} style={{ fontSize: 10, color: c.color }}>
                {c.name} {c.value}
              </span>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {d.protocols.map((p) => (
            <div key={p.name} className="h-bar-row">
              {(p.url || URLS.protocols[p.name.toLowerCase()]) ? (
                <a href={p.url ?? URLS.protocols[p.name.toLowerCase()]} target="_blank" rel="noopener noreferrer" className="ext-link h-bar-label">{p.name}</a>
              ) : (
                <span className="h-bar-label">{p.name}</span>
              )}
              <div className="h-bar-track">
                <div
                  className="h-bar-fill"
                  style={{ width: `${(p.pct / maxPct) * 100}%`, background: p.color }}
                />
              </div>
              <span className="h-bar-value">{p.tvl}</span>
              <span style={{ width: 32, textAlign: "right", fontSize: 10, color: "#777" }}>{p.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
