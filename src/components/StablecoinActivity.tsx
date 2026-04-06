interface LargeTransfer {
  time: string;
  symbol: string;
  amount: string;
  from: string;
  to: string;
  type: string;
}

interface Props {
  data?: {
    totalVolume: string;
    transferCount: string;
    mintVolume: string;
    burnVolume: string;
    netMint: string;
    netMintPositive: boolean;
    largeTransfers: LargeTransfer[];
  };
}

export default function StablecoinActivity({ data }: Props) {
  if (!data) return null;
  const d = data;

  return (
    <div className="panel col-5" style={{ height: 280 }}>
      <div className="panel-header">
        <div className="panel-title">Stablecoin Activity</div>
        <div className="panel-meta">RECENT</div>
      </div>
      <div className="panel-content" style={{ overflowY: "auto" }}>
        <div className="data-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
          <div className="data-item">
            <span className="lbl">Volume</span>
            <span className="val text-cyan">{d.totalVolume}</span>
          </div>
          <div className="data-item">
            <span className="lbl">Transfers</span>
            <span className="val">{d.transferCount}</span>
          </div>
          <div className="data-item">
            <span className="lbl">Net Mint</span>
            <span className={`val ${d.netMintPositive ? "text-green" : "text-red"}`}>
              {d.netMintPositive ? "+" : ""}{d.netMint}
            </span>
          </div>
        </div>

        {d.largeTransfers.length > 0 && (
          <>
            <div className="text-muted uppercase" style={{ fontSize: 10, marginBottom: 4 }}>
              Large Transfers (&gt;$50K)
            </div>
            {d.largeTransfers.map((tx, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  padding: "3px 0",
                  borderBottom: "1px solid #222",
                  fontSize: 11,
                }}
              >
                <span className="text-muted" style={{ fontSize: 9, width: 60, flexShrink: 0 }}>{tx.time}</span>
                <span
                  className={tx.type === "Mint" ? "text-green" : tx.type === "Burn" ? "text-red" : "text-muted"}
                  style={{ fontSize: 9, width: 32, flexShrink: 0 }}
                >
                  {tx.type === "Mint" ? "MINT" : tx.type === "Burn" ? "BURN" : "XFER"}
                </span>
                <span className="bold" style={{ width: 40, flexShrink: 0 }}>{tx.symbol}</span>
                <span className="text-cyan" style={{ flex: 1 }}>{tx.amount}</span>
                <span className="text-muted" style={{ fontSize: 9 }}>{tx.from}→{tx.to}</span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
