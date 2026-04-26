import { VOLUME_DATA } from "@/data/constants";
import { dayLabel, formatUSD, unixDateLabel } from "@/lib/format";
import BarChart from "./BarChart";

interface HistoricalValue {
  timestamp: number;
  value: number;
}

interface Props {
  fees?: {
    dexVolume24h?: string;
    dexVolume7d?: string;
    dexVolumeTrend30d?: HistoricalValue[];
    [key: string]: unknown;
  };
}

export default function VolumeCard({ fees }: Props) {
  const displayVol = fees?.dexVolume24h ?? VOLUME_DATA.avgDailyVol;
  const volumeTrend = fees?.dexVolumeTrend30d ?? [];
  const maxVolume = Math.max(...volumeTrend.map((p) => p.value), 0);
  const volumeBars = volumeTrend.length
    ? volumeTrend.map((p, i) => ({
        height: maxVolume > 0 ? (p.value / maxVolume) * 100 : 0,
        color: i >= volumeTrend.length - 2 ? "#50fa7b" : undefined,
        opacity: i >= volumeTrend.length - 2 ? 0.8 : undefined,
        tip: `${unixDateLabel(p.timestamp)}: ${formatUSD(p.value)}`,
      }))
    : VOLUME_DATA.dailyBars30d.map((h, i) => {
        const daysAgo = VOLUME_DATA.dailyBars30d.length - 1 - i;
        return {
          height: h,
          color: i >= VOLUME_DATA.dailyBars30d.length - 2 ? "#50fa7b" : undefined,
          opacity: i >= VOLUME_DATA.dailyBars30d.length - 2 ? 0.8 : undefined,
          tip: `${dayLabel(daysAgo)}: trend index ${h}/100`,
        };
      });

  return (
    <div className="panel col-4">
      <div className="panel-header">
        <div className="panel-title">Volume (30D)</div>
        <div className="panel-meta text-cyan">AGGREGATED</div>
      </div>
      <div className="panel-content">
        <div className="data-grid" style={{ gridTemplateColumns: "1fr" }}>
          <div className="data-item">
            <span className="lbl">Avg Daily Vol</span>
            <span className="val">{displayVol}</span>
          </div>
        </div>
        <BarChart
          rowMaxWidth={620}
          bars={volumeBars}
        />
      </div>
    </div>
  );
}
