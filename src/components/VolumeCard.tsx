import { VOLUME_DATA } from "@/data/constants";

interface Props {
  fees?: { dexVolume24h?: string; dexVolume7d?: string; [key: string]: unknown };
}

export default function VolumeCard({ fees }: Props) {
  const displayVol = fees?.dexVolume24h ?? VOLUME_DATA.avgDailyVol;

  return (
    <div className="panel col-4">
      <div className="panel-header">
        <div className="panel-title">Volume (7D)</div>
        <div className="panel-meta text-cyan">AGGREGATED</div>
      </div>
      <div className="panel-content">
        <div className="data-grid" style={{ gridTemplateColumns: "1fr" }}>
          <div className="data-item">
            <span className="lbl">Avg Daily Vol</span>
            <span className="val">{displayVol}</span>
          </div>
        </div>
        <div className="bar-chart">
          {VOLUME_DATA.dailyBars.map((h, i) => (
            <div
              key={i}
              className="bar"
              style={{
                height: `${h}%`,
                background: i >= 5 ? "#50fa7b" : undefined,
                opacity: i >= 5 ? 0.8 : undefined,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
