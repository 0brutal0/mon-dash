import { FEES_REVENUE } from "@/data/constants";
import { dayLabel, formatUSD, unixDateLabel } from "@/lib/format";
import BarChart from "./BarChart";

interface HistoricalValue {
  timestamp: number;
  value: number;
}

interface FeesProps {
  dailyFees: string;
  annualizedFees: string;
  psRatio: string;
  pfRatio: string;
  feesTrend30d: number[];
  feeTrend30d?: HistoricalValue[];
  dexVolume24h?: string;
  dexVolume7d?: string;
}

interface Props {
  data?: FeesProps;
}

export default function FeesRevenue({ data }: Props) {
  const d: FeesProps = data ?? FEES_REVENUE;
  const feeTrend = d.feeTrend30d ?? [];
  const feeValues = feeTrend.length ? feeTrend.map((p) => p.value) : d.feesTrend30d;
  const minFee = Math.min(...feeValues);
  const maxFee = Math.max(...feeValues);
  const feeRange = maxFee - minFee || 1;
  const feeBars = feeTrend.length
    ? feeTrend.map((p) => ({
        height: 20 + ((p.value - minFee) / feeRange) * 80,
        color: "#8be9fd",
        tip: `${unixDateLabel(p.timestamp)}: ${formatUSD(p.value)}`,
      }))
    : d.feesTrend30d.map((v, i) => {
        const daysAgo = d.feesTrend30d.length - 1 - i;
        return {
          height: 20 + ((v - minFee) / feeRange) * 80,
          color: "#8be9fd",
          tip: `${dayLabel(daysAgo)}: trend index ${v}`,
        };
      });

  return (
    <div className="panel col-5" style={{ minHeight: 360 }}>
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
            <span className="lbl">Ann. Fees</span>
            <span className="val text-cyan">{d.annualizedFees}</span>
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

        <div style={{ marginTop: 14 }}>
          <div className="text-muted uppercase" style={{ fontSize: 10, marginBottom: 4 }}>
            30D Fee Trend
          </div>
          <BarChart
            chartHeight={60}
            barWidth={12}
            barGap={4}
            style={{ marginTop: 0 }}
            bars={feeBars}
          />
        </div>
      </div>
    </div>
  );
}
