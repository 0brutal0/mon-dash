import { SUPPLY_PRESSURE } from "@/data/constants";

interface Props {
  data?: typeof SUPPLY_PRESSURE;
}

export default function SupplyPressure({ data }: Props) {
  const d = data ?? SUPPLY_PRESSURE;

  return (
    <div className="panel col-12" style={{ height: 260 }}>
      <div className="panel-header">
        <div className="panel-title amber">Supply Pressure Analysis</div>
        <div className="panel-meta">KEY METRIC</div>
      </div>
      <div className="panel-content">
        <div style={{ borderLeft: "2px solid #ff79c6", paddingLeft: 8, marginBottom: 12 }}>
          <div className="text-muted uppercase" style={{ fontSize: 10, marginBottom: 2 }}>
            Next Major Unlock
          </div>
          <div style={{ display: "flex", gap: 16, alignItems: "baseline" }}>
            <span className="val" style={{ fontSize: 14 }}>{d.nextUnlockDate}</span>
            <span className="text-red bold">{d.nextUnlockAmount}</span>
            <span className="text-muted" style={{ fontSize: 10 }}>
              ({d.nextUnlockPctCirc} of circ.)
            </span>
          </div>
          <div className="text-muted" style={{ fontSize: 10 }}>{d.nextUnlockCategory}</div>
        </div>

        <div className="data-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          <div className="data-item">
            <span className="lbl">Daily Burn (EIP-1559)</span>
            <span className="val text-red">{d.dailyBurnRate}</span>
          </div>
          <div className="data-item">
            <span className="lbl">Net Emission / Day</span>
            <span className="val text-amber">{d.netEmissionDaily}</span>
          </div>
          <div className="data-item">
            <span className="lbl">Staking Ratio</span>
            <span className="val">
              {d.stakingRatio}{" "}
              <span className="text-green" style={{ fontSize: 10 }}>{d.stakingRatioTrend}</span>
            </span>
          </div>
          <div className="data-item">
            <span className="lbl">Exchange Inflow</span>
            <span className="flow-indicator flow-out">▼ {d.exchangeInflow}</span>
          </div>
          <div className="data-item">
            <span className="lbl">Exchange Outflow</span>
            <span className="flow-indicator flow-in">▲ {d.exchangeOutflow}</span>
          </div>
          <div className="data-item">
            <span className="lbl">Net Flow</span>
            <span className="flow-indicator flow-in">{d.exchangeNetFlow}</span>
          </div>
        </div>

        <div style={{ marginTop: 12, borderTop: "1px solid #333", paddingTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="text-muted uppercase" style={{ fontSize: 10 }}>Deflationary Breakeven</span>
          <span className="text-cyan bold" style={{ fontSize: 14 }}>{d.deflationaryBreakevenTps}</span>
        </div>
      </div>
    </div>
  );
}
