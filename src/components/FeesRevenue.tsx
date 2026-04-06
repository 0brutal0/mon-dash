import { FEES_REVENUE } from "@/data/constants";

interface FeesProps {
  dailyFees: string;
  dailyRevenue: string;
  annualizedFees: string;
  annualizedRevenue: string;
  psRatio: string;
  pfRatio: string;
  feesTrend14d: number[];
  dexVolume24h?: string;
  dexVolume7d?: string;
}

interface Props {
  data?: FeesProps;
}

export default function FeesRevenue({ data }: Props) {
  const d: FeesProps = data ?? FEES_REVENUE;
  const maxFee = Math.max(...d.feesTrend14d);

  return (
    <div className="panel col-5" style={{ height: 320 }}>
      <div className="panel-header">
        <div className="panel-title cyan">Chain Fees &amp; Revenue</div>
      </div>
      <div className="panel-content">
        <div className="data-grid" style={{ gap: 12 }}>
          <div className="data-item">
            <span className="lbl">Daily Fees</span>
            <span className="val">{d.dailyFees}</span>
          </div>
          <div className="data-item">
            <span className="lbl">Daily Revenue</span>
            <span className="val">{d.dailyRevenue}</span>
          </div>
          <div className="data-item">
            <span className="lbl">Ann. Fees</span>
            <span className="val text-cyan">{d.annualizedFees}</span>
          </div>
          <div className="data-item">
            <span className="lbl">Ann. Revenue</span>
            <span className="val text-green">{d.annualizedRevenue}</span>
          </div>
          <div className="data-item">
            <span className="lbl">P/S Ratio</span>
            <span className="val text-amber">{d.psRatio}</span>
          </div>
          <div className="data-item">
            <span className="lbl">P/F Ratio</span>
            <span className="val text-amber">{d.pfRatio}</span>
          </div>
          {d.dexVolume24h && (
            <div className="data-item">
              <span className="lbl">DEX Vol (24H)</span>
              <span className="val">{d.dexVolume24h}</span>
            </div>
          )}
          {d.dexVolume7d && (
            <div className="data-item">
              <span className="lbl">DEX Vol (7D)</span>
              <span className="val">{d.dexVolume7d}</span>
            </div>
          )}
        </div>

        <div style={{ marginTop: 12 }}>
          <div className="text-muted uppercase" style={{ fontSize: 10, marginBottom: 4 }}>
            14D Fee Trend
          </div>
          <div className="sparkline">
            {d.feesTrend14d.map((v, i) => (
              <div key={i} className="spark-bar" style={{ height: `${(v / maxFee) * 100}%` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
