import { UNLOCK_SCHEDULE } from "@/data/constants";

export default function UnlockTimeline() {
  return (
    <div className="panel col-7">
      <div className="panel-header">
        <div className="panel-title amber">Vesting &amp; Unlock Schedule</div>
        <div className="panel-meta">
          NEXT: <span className="text-red">{UNLOCK_SCHEDULE.nextUnlock.date}</span>
        </div>
      </div>
      <div className="panel-content">
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {UNLOCK_SCHEDULE.allocations.map((a) => (
            <div key={a.label} className="timeline-row">
              <span className="tl-label uppercase">{a.label}</span>
              <div className="tl-track">
                {/* Cliff gap on the left (empty) */}
                {a.barLeft > 0 && (
                  <div
                    className="tl-bar"
                    style={{
                      width: `${a.barLeft}%`,
                      left: 0,
                      background: "transparent",
                    }}
                  />
                )}
                {/* Active vesting bar */}
                <div
                  className="tl-bar"
                  style={{
                    width: `${a.barWidth}%`,
                    left: `${a.barLeft}%`,
                    background: a.color,
                  }}
                />
                {/* Remaining unvested portion (light grey) */}
                {a.barLeft + a.barWidth < 100 && (
                  <div
                    className="tl-bar"
                    style={{
                      width: `${100 - a.barLeft - a.barWidth}%`,
                      left: `${a.barLeft + a.barWidth}%`,
                      background: "#333",
                    }}
                  />
                )}
              </div>
              <div style={{ width: 100, textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                <span className="mono" style={{ fontSize: 11 }}>
                  {a.amount} <span className="text-muted" style={{ fontSize: 10 }}>({a.pct}%)</span>
                </span>
                <span className="text-muted" style={{ fontSize: 9 }}>{a.lockNote}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, paddingTop: 6, borderTop: "1px solid #333", fontSize: 10 }}>
          <span className="text-muted">NOV 2025 (TGE)</span>
          <span className="text-muted">NOV 2026 (Y1)</span>
          <span className="text-muted">NOV 2028 (Y3)</span>
          <span className="text-muted">NOV 2029 (Y4)</span>
        </div>
      </div>
    </div>
  );
}
