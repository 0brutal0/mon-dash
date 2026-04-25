import { LIQUID_STAKING } from "@/data/constants";

export default function LiquidStakingMap() {
  const numericCellStyle = {
    overflow: "visible",
    textOverflow: "clip",
    whiteSpace: "nowrap",
  } as const;

  return (
    <div className="panel col-5">
      <div className="panel-header">
        <div className="panel-title">Liquid Staking Market</div>
        <div className="panel-meta">TOTAL: {LIQUID_STAKING.total}</div>
      </div>
      <div className="panel-content no-pad">
        <table className="liquid-staking-table">
          <thead>
            <tr>
              <th style={{ width: 78 }}>Token</th>
              <th>Provider</th>
              <th className="right" style={{ width: 96 }}>TVL</th>
              <th className="right" style={{ width: 76 }}>APR</th>
              <th className="right" style={{ width: 72 }}>Share</th>
              <th className="right" style={{ width: 78 }}>Peg</th>
            </tr>
          </thead>
          <tbody>
            {LIQUID_STAKING.providers.map((p) => (
              <tr key={p.token}>
                <td className="text-muted">{p.token}</td>
                <td className="text-cyan">{p.provider}</td>
                <td className="right">{p.tvl}</td>
                <td className="right text-green" style={numericCellStyle}>{p.apr}%</td>
                <td className="right">{p.share}%</td>
                <td
                  className="right"
                  style={{
                    ...numericCellStyle,
                    color: Math.abs(p.peg - 1) < 0.002 ? "#50fa7b" : "#ff5555",
                  }}
                >
                  {p.peg.toFixed(3)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
