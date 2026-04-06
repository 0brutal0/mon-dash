import { BRIDGE_FLOWS, URLS } from "@/data/constants";

const PROVIDER_COLORS: Record<string, string> = {
  Wormhole: "#bd93f9",
  LayerZero: "#8be9fd",
  Orbiter: "#ffb86c",
  deBridge: "#50fa7b",
};

interface Props {
  data?: typeof BRIDGE_FLOWS;
}

export default function BridgeFlows({ data }: Props) {
  const d = data ?? BRIDGE_FLOWS;

  return (
    <div className="panel col-5" style={{ height: 280 }}>
      <div className="panel-header">
        <div className="panel-title">Bridge Flows (7D)</div>
        <div className="panel-meta">
          <span className={d.netFlowDirection === "in" ? "text-green" : "text-red"}>
            NET: {d.netFlow7d}
          </span>
        </div>
      </div>
      <div className="panel-content" style={{ overflowY: "auto" }}>
        <div className="text-muted uppercase" style={{ fontSize: 10, marginBottom: 6 }}>
          By Source Chain
        </div>
        {d.byChain.map((c) => (
          <div key={c.name} className="h-bar-row">
            <span className="h-bar-label">{c.name}</span>
            <div className="h-bar-track">
              <div
                className="h-bar-fill"
                style={{
                  width: `${c.pct}%`,
                  background: c.flow === "in" ? "#50fa7b" : "#ff5555",
                }}
              />
            </div>
            <span className="h-bar-value">{c.volume}</span>
            <span style={{ width: 16, fontSize: 10 }} className={c.flow === "in" ? "text-green" : "text-red"}>
              {c.flow === "in" ? "▲" : "▼"}
            </span>
          </div>
        ))}

        <div className="text-muted uppercase" style={{ fontSize: 10, marginBottom: 6, marginTop: 12 }}>
          By Provider
        </div>
        {d.byProvider.map((p) => (
          <div key={p.name} className="h-bar-row">
            {URLS.bridges[p.name] ? (
              <a href={URLS.bridges[p.name]} target="_blank" rel="noopener noreferrer" className="ext-link h-bar-label">{p.name}</a>
            ) : (
              <span className="h-bar-label">{p.name}</span>
            )}
            <div className="h-bar-track">
              <div
                className="h-bar-fill"
                style={{ width: `${p.pct}%`, background: PROVIDER_COLORS[p.name] ?? "#8be9fd" }}
              />
            </div>
            <span className="h-bar-value">{p.volume}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
