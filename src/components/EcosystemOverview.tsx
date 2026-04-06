import { ECOSYSTEM } from "@/data/constants";

const catColors: Record<string, string> = {
  DeFi: "#ff79c6",
  Gaming: "#8be9fd",
  Infra: "#f1fa8c",
  Social: "#50fa7b",
  AI: "#bd93f9",
  NFT: "#ff92df",
  Payments: "#ffd700",
  RWA: "#e2a8ff",
  Other: "#555",
};

export default function EcosystemOverview() {
  return (
    <div className="panel col-5" style={{ height: 280 }}>
      <div className="panel-header">
        <div className="panel-title green">Ecosystem Overview</div>
      </div>
      <div className="panel-content">
        <div style={{ marginBottom: 10 }}>
          <span className="text-cyan bold" style={{ fontSize: 24 }}>{ECOSYSTEM.totalProjects}+</span>
          <span className="text-muted" style={{ fontSize: 10, marginLeft: 8 }}>PROJECTS BUILDING</span>
        </div>

        {ECOSYSTEM.categories.map((c) => (
          <div key={c.name} className="h-bar-row">
            <span className="h-bar-label">{c.name}</span>
            <div className="h-bar-track">
              <div
                className="h-bar-fill"
                style={{ width: `${(c.pct / ECOSYSTEM.categories[0].pct) * 100}%`, background: catColors[c.name] || "#555" }}
              />
            </div>
            <span className="h-bar-value">{c.count}</span>
          </div>
        ))}

        <div className="text-muted uppercase" style={{ fontSize: 10, marginTop: 10, marginBottom: 4 }}>
          Recent Launches
        </div>
        {ECOSYSTEM.recentLaunches.map((l) => (
          <div key={l.name} style={{ display: "flex", justifyContent: "space-between", marginBottom: 2, fontSize: 11 }}>
            <span>
              <span className="text-cyan">{l.name}</span>
              <span className="text-muted" style={{ fontSize: 10, marginLeft: 6 }}>{l.category}</span>
            </span>
            <span className="text-muted" style={{ fontSize: 10 }}>{l.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
