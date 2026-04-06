import { PRICE_DATA } from "@/data/constants";
import { formatPct } from "@/lib/format";

interface Props {
  data?: typeof PRICE_DATA;
}

export default function Header({ data }: Props) {
  const d = data ?? PRICE_DATA;
  const isUp = d.change24h >= 0;

  return (
    <div id="ticker">
      <div className="ticker-item">
        <span className="dot green blink" />
        <span className="ticker-label text-cyan">SYS_ONLINE</span>
      </div>
      <div className="ticker-item">
        <span className="ticker-label">TOKEN</span>
        <span className="bold text-amber">MON</span>
      </div>
      <div className="ticker-item">
        <span className="ticker-label">PRICE</span>
        <span>${d.price}</span>
      </div>
      <div className="ticker-item">
        <span className="ticker-label">24H</span>
        <span className={isUp ? "text-green" : "text-red"}>
          {formatPct(d.change24h)}
        </span>
      </div>
      <div className="ticker-item">
        <span className="ticker-label">MCAP</span>
        <span>{d.marketCap}</span>
      </div>
      <div className="ticker-item">
        <span className="ticker-label">VOL</span>
        <span>{d.volume24h}</span>
      </div>
      <div className="ticker-item">
        <span className="ticker-label">FDV</span>
        <span>{d.fdv}</span>
      </div>
      <div style={{ flex: 1 }} />
    </div>
  );
}
