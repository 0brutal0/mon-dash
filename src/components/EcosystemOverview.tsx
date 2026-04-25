import type { EcosystemData } from "@/lib/ecosystem";

const catColors: Record<string, string> = {
  DeFi: "#ff79c6",
  Consumer: "#8be9fd",
  AI: "#bd93f9",
  Tooling: "#f1fa8c",
  Platform: "#50fa7b",
  "Only on Monad": "#ffd700",
  Other: "#555",
};

type Props = {
  data: EcosystemData;
};

export default function EcosystemOverview({ data }: Props) {
  const maxCount = Math.max(...data.categories.map((category) => category.count), 1);

  return (
    <div className="panel col-5" style={{ minHeight: 280 }}>
      <div className="panel-header">
        <div className="panel-title green">Ecosystem Overview</div>
        <a href={data.sourceUrl} target="_blank" rel="noopener noreferrer" className="panel-link">
          APP HUB
        </a>
      </div>
      <div className="panel-content">
        <div style={{ marginBottom: 10 }}>
          <span className="text-cyan bold" style={{ fontSize: 24 }}>{data.totalProjects}</span>
          <span className="text-muted" style={{ fontSize: 10, marginLeft: 8 }}>
            PROJECTS BUILDING {data.isLive ? "LIVE" : "FALLBACK"}
          </span>
        </div>

        {data.categories.map((c) => {
          const isOnlyOnMonad = c.name === "Only on Monad";

          return (
            <div key={c.name} className="h-bar-row">
              <span className="h-bar-label">{c.name}</span>
              <div className="h-bar-track">
                <div
                  className="h-bar-fill"
                  style={{ width: `${(c.count / maxCount) * 100}%`, background: catColors[c.name] || "#555" }}
                />
              </div>
              <span className="h-bar-value">
                {c.count}{isOnlyOnMonad && <span className="text-muted"> ({c.pct}%)</span>}
              </span>
            </div>
          );
        })}

        <div className="text-muted uppercase" style={{ fontSize: 10, marginTop: 10, marginBottom: 4 }}>
          Recent Launches
        </div>
        {data.recentLaunches.map((l) => (
          <div key={l.name} style={{ display: "flex", justifyContent: "space-between", marginBottom: 2, fontSize: 11 }}>
            <span>
              {l.url ? (
                <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-cyan">
                  {l.name}
                </a>
              ) : (
                <span className="text-cyan">{l.name}</span>
              )}
              <span className="text-muted" style={{ fontSize: 10, marginLeft: 6 }}>{l.category}</span>
            </span>
            <span className="text-muted" style={{ fontSize: 10 }}>{l.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
