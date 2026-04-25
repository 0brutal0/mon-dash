import { SUPPLY_DATA } from "@/data/constants";

interface Props {
  data?: typeof SUPPLY_DATA;
}

export default function SupplyCard({ data }: Props) {
  const d = data ?? SUPPLY_DATA;

  return (
    <div className="panel col-4" style={{ minHeight: 300 }}>
      <div className="panel-header">
        <div className="panel-title amber">Supply Metrics</div>
      </div>
      <div className="panel-content" style={{ justifyContent: "space-between" }}>
        <div className="data-grid" style={{ gridTemplateColumns: "1fr", gap: 16 }}>
          <div className="data-item">
            <span className="lbl">Total Supply</span>
            <span className="val text-cyan">{d.totalSupply} MON</span>
          </div>
          <div className="data-item" style={{ borderLeftColor: "#50fa7b" }}>
            <span className="lbl">Circulating Supply</span>
            <span className="val">
              {d.circulatingSupply} MON{" "}
              <span className="text-muted" style={{ fontSize: 10 }}>
                ({d.circulatingPct}%)
              </span>
            </span>
          </div>
          <div className="data-item" style={{ borderLeftColor: "#f1fa8c" }}>
            <span className="lbl">Locked / Staked</span>
            <span className="val">{d.lockedStaked} MON</span>
          </div>
          <div className="data-item" style={{ borderLeftColor: "#ff5555" }}>
            <span className="lbl">Burned (Deflation)</span>
            <span className="val">{d.burned} MON</span>
          </div>
        </div>

        <div>
          <div
            className="uppercase text-muted"
            style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 10 }}
          >
            <span>Emission Progress</span>
            <span>{d.emissionPct}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${d.emissionPct}%`, background: "#50fa7b" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
