import { TX_ACTIVITY } from "@/data/constants";

interface Props {
  data?: typeof TX_ACTIVITY;
}

export default function TxActivity({ data }: Props) {
  const d = data ?? TX_ACTIVITY;

  return (
    <div className="panel col-7" style={{ height: 280 }}>
      <div className="panel-header">
        <div className="panel-title">Transaction &amp; Address Activity</div>
        <div className="panel-meta">
          <span className="text-green">{d.dailyTxGrowth} 7D</span>
        </div>
      </div>
      <div className="panel-content">
        <div className="data-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          <div className="data-item">
            <span className="lbl">Daily Tx</span>
            <span className="val text-cyan">{d.dailyTx}</span>
          </div>
          <div className="data-item">
            <span className="lbl">Gas Used</span>
            <span className="val">{d.gasUsed}</span>
          </div>
          <div className="data-item">
            <span className="lbl">Avg Gas Price</span>
            <span className="val">{d.avgGasPrice}</span>
          </div>
          <div className="data-item" style={{ marginTop: 4 }}>
            <span className="lbl">Active Addrs (D)</span>
            <span className="val">{d.activeAddrsDaily}</span>
          </div>
          <div className="data-item" style={{ marginTop: 4 }}>
            <span className="lbl">Active Addrs (M)</span>
            <span className="val">{d.activeAddrsMonthly}</span>
          </div>
          <div className="data-item" style={{ marginTop: 4 }}>
            <span className="lbl">New Addrs (D)</span>
            <span className="val text-green">{d.newAddrsDaily}</span>
          </div>
        </div>

        <div className="bar-chart" style={{ height: 50, marginTop: 8 }}>
          {d.txBars14d.map((h, i) => (
            <div
              key={i}
              className="bar"
              style={{ height: `${h}%`, background: i >= 12 ? "#50fa7b" : "#8be9fd" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
