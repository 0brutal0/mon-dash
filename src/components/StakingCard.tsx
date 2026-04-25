import { STAKING_DATA } from "@/data/constants";

export default function StakingCard() {
  const minApr = Math.min(...STAKING_DATA.aprHistory30d);
  const maxApr = Math.max(...STAKING_DATA.aprHistory30d);
  const aprStart = STAKING_DATA.aprHistory30d[0];
  const aprEnd = STAKING_DATA.aprHistory30d[STAKING_DATA.aprHistory30d.length - 1];
  const aprChangeBps = Math.round((aprEnd - aprStart) * 100);

  return (
    <div className="panel col-4">
      <div className="panel-header">
        <div className="panel-title">Staking Protocol</div>
      </div>
      <div className="panel-content">
        <div className="data-grid">
          <div className="data-item">
            <span className="lbl">Est. APY</span>
            <span className="val text-green">{STAKING_DATA.apy}%</span>
          </div>
          <div className="data-item">
            <span className="lbl">Total Value Staked</span>
            <span className="val">{STAKING_DATA.totalValueStaked}</span>
          </div>
          <div className="data-item" style={{ marginTop: 8 }}>
            <span className="lbl">Active Nodes</span>
            <span className="val">{STAKING_DATA.activeNodes}</span>
          </div>
          <div className="data-item" style={{ marginTop: 8 }}>
            <span className="lbl">Min. Delegation</span>
            <span className="val">{STAKING_DATA.minDelegation}</span>
          </div>
          <div className="data-item" style={{ marginTop: 8 }}>
            <span className="lbl">Unbonding</span>
            <span className="val text-green bold">{STAKING_DATA.unbondingPeriod}</span>
          </div>
          <div className="data-item" style={{ marginTop: 8 }}>
            <span className="lbl">Delegation Flow (7D)</span>
            <span className="flow-indicator flow-in">▲ {STAKING_DATA.delegationFlow7d}</span>
          </div>
        </div>

        <div className="data-grid" style={{ marginTop: 12 }}>
          <div className="data-item">
            <span className="lbl">30D APY Range</span>
            <span className="val">{minApr.toFixed(1)}-{maxApr.toFixed(1)}%</span>
          </div>
          <div className="data-item">
            <span className="lbl">30D APY Change</span>
            <span className={`val ${aprChangeBps >= 0 ? "text-green" : "text-red"}`}>
              {aprChangeBps >= 0 ? "+" : ""}{aprChangeBps} bps
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
