import { STAKING_DATA } from "@/data/constants";

export default function StakingCard() {
  const maxApr = Math.max(...STAKING_DATA.aprHistory);

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

        <div style={{ marginTop: 10 }}>
          <div className="text-muted uppercase" style={{ fontSize: 10, marginBottom: 4 }}>7D APR</div>
          <div className="sparkline">
            {STAKING_DATA.aprHistory.map((v, i) => (
              <div
                key={i}
                className="spark-bar"
                style={{ height: `${(v / maxApr) * 100}%`, background: "#50fa7b" }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
