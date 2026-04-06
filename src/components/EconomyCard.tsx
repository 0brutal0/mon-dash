import { ECONOMY_DATA } from "@/data/constants";

interface Props {
  data?: typeof ECONOMY_DATA;
}

export default function EconomyCard({ data }: Props) {
  const d = data ?? ECONOMY_DATA;

  return (
    <div className="panel col-4">
      <div className="panel-header">
        <div className="panel-title">Network Economy</div>
      </div>
      <div className="panel-content">
        <div className="data-grid">
          <div className="data-item">
            <span className="lbl">Inflation Rate</span>
            <span className="val text-amber">{d.inflationRate}%</span>
          </div>
          <div className="data-item">
            <span className="lbl">Burn Rate (24H)</span>
            <span className="val text-red">{d.burnRate24h}</span>
          </div>
          <div className="data-item" style={{ marginTop: 8 }}>
            <span className="lbl">Block Reward</span>
            <span className="val">{d.blockReward}</span>
          </div>
          <div className="data-item" style={{ marginTop: 8 }}>
            <span className="lbl">Net Emission / Yr</span>
            <span className="val text-amber">{d.netEmission}</span>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span className="text-muted uppercase" style={{ fontSize: 10 }}>
              Epoch {d.currentEpoch}
            </span>
            <span style={{ fontSize: 10 }}>
              {d.epochProgress}% · <span className="text-cyan">{d.epochRemaining}</span>
            </span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${d.epochProgress}%`, background: "#8be9fd" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
