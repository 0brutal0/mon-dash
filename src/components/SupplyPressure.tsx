"use client";

import { useState, useEffect } from "react";
import { SUPPLY_PRESSURE } from "@/data/constants";

interface Props {
  data?: typeof SUPPLY_PRESSURE;
}

interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

// April 24 2026 00:00 UTC — next Category Labs treasury unlock
const NEXT_UNLOCK_TS = new Date("2026-04-24T00:00:00Z").getTime();

function getCountdown(): Countdown {
  const diff = Math.max(0, NEXT_UNLOCK_TS - Date.now());
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1_000),
    expired: diff === 0,
  };
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export default function SupplyPressure({ data }: Props) {
  const d = data ?? SUPPLY_PRESSURE;
  const [countdown, setCountdown] = useState<Countdown | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCountdown(getCountdown());
    const iv = setInterval(() => setCountdown(getCountdown()), 1_000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="panel col-12" style={{ minHeight: 260 }}>
      <div className="panel-header">
        <div className="panel-title amber">Supply Analysis</div>
      </div>

      <div className="panel-content">
        {/* Next unlock block */}
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

          {/* Countdown */}
          {countdown && !countdown.expired ? (
            <div
              style={{
                marginTop: 6,
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                display: "flex",
                gap: 2,
                alignItems: "center",
              }}
            >
              <span className="text-muted" style={{ fontSize: 10, marginRight: 6 }}>IN</span>
              {[
                [countdown.days, "D"],
                [countdown.hours, "H"],
                [countdown.minutes, "M"],
                [countdown.seconds, "S"],
              ].map(([val, unit], i) => (
                <span key={unit as string} style={{ display: "inline-flex", alignItems: "baseline", gap: 1 }}>
                  {i > 0 && <span className="text-muted" style={{ marginRight: 2 }}>:</span>}
                  <span className="text-red bold">{pad(val as number)}</span>
                  <span className="text-muted" style={{ fontSize: 9 }}>{unit}</span>
                </span>
              ))}
            </div>
          ) : countdown?.expired ? (
            <div
              className="text-amber bold"
              style={{ marginTop: 6, fontFamily: "var(--font-mono)", fontSize: 11 }}
            >
              ⚠ UNLOCK IN PROGRESS
            </div>
          ) : (
            <div style={{ marginTop: 6, height: 16 }} />
          )}
        </div>

        {/* Metrics grid */}
        <div className="data-grid data-grid-3" style={{ gap: 10 }}>
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

      </div>
    </div>
  );
}
