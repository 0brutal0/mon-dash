interface DexProtocol {
  name: string;
  tvl: string;
  pct: number;
  url: string | null;
}

interface Props {
  data?: {
    volume24h: string;
    volume7d: string;
    dexTvl: string;
    volumeToTvl: string;
    fees24h: string;
    feesToTvl: string;
    volumeChange1d: number | null;
    topProtocols: DexProtocol[];
  };
}

export default function DexEfficiency({ data }: Props) {
  if (!data) return null;
  const hasVolumeChange = data.volumeChange1d !== null;
  const volumeChangeIsUp = (data.volumeChange1d ?? 0) >= 0;

  return (
    <div className="panel col-5" style={{ minHeight: 500 }}>
      <div className="panel-header">
        <div className="panel-title">DEX Efficiency</div>
      </div>
      <div className="panel-content">
        <div className="data-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
          <div className="data-item">
            <span className="lbl">24H Volume</span>
            <span className="val text-cyan">{data.volume24h}</span>
          </div>
          <div className="data-item">
            <span className="lbl">DEX TVL</span>
            <span className="val">{data.dexTvl}</span>
          </div>
          <div className="data-item">
            <span className="lbl">Vol / TVL</span>
            <span className="val text-green">{data.volumeToTvl}</span>
          </div>
          <div className="data-item">
            <span className="lbl">7D Volume</span>
            <span className="val">{data.volume7d}</span>
          </div>
          <div className="data-item">
            <span className="lbl">24H Fees</span>
            <span className="val text-amber">{data.fees24h}</span>
          </div>
          <div className="data-item">
            <span className="lbl">Fees / TVL</span>
            <span className="val">{data.feesToTvl}</span>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 4 }}>
          <div className="text-muted uppercase" style={{ fontSize: 10 }}>
            Top DEX Liquidity
          </div>
          {hasVolumeChange && (
            <div
              className={volumeChangeIsUp ? "text-green" : "text-red"}
              style={{ fontFamily: "var(--font-mono)", fontSize: 10 }}
            >
              {volumeChangeIsUp ? "+" : ""}{data.volumeChange1d?.toFixed(2)}% 1D
            </div>
          )}
        </div>

        {data.topProtocols.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Protocol</th>
                <th className="right" style={{ width: 86 }}>TVL</th>
                <th className="right" style={{ width: 64 }}>Share</th>
              </tr>
            </thead>
            <tbody>
              {data.topProtocols.map((p) => (
                <tr key={p.name}>
                  <td className="bold">
                    {p.url ? (
                      <a href={p.url} target="_blank" rel="noopener noreferrer" className="ext-link">
                        {p.name}
                      </a>
                    ) : (
                      p.name
                    )}
                  </td>
                  <td className="right">{p.tvl}</td>
                  <td className="right text-muted">{Math.round(p.pct)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div
            className="text-muted uppercase"
            style={{
              borderTop: "1px solid #222",
              fontSize: 10,
              marginTop: 4,
              paddingTop: 8,
            }}
          >
            DEX liquidity unavailable
          </div>
        )}
      </div>
    </div>
  );
}
