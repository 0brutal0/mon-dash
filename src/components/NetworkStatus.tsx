import { NETWORK_DATA, URLS } from "@/data/constants";

interface NetworkProps {
  blockHeight: string;
  tps: string;
  finality: string;
  blockTime: string;
  activeValidators: number;
  totalValidators: number;
  parallelExecRatio: number;
  gasPrice?: string | null;
}

interface Props {
  data?: NetworkProps;
}

export default function NetworkStatus({ data }: Props) {
  const d: NetworkProps = data ?? NETWORK_DATA;

  return (
    <div className="col-12 status-strip">
      <div className="status-group">
        <span className="text-muted uppercase" style={{ fontSize: 10 }}>Height</span>
        <a href={URLS.monadscanBlock(d.blockHeight)} target="_blank" rel="noopener noreferrer" className="ext-link text-cyan">{d.blockHeight}</a>
      </div>
      <div className="status-group">
        <span className="text-muted uppercase" style={{ fontSize: 10 }}>Realtime TPS</span>
        <span>
          {d.tps}{" "}
          <span className="text-green" style={{ fontSize: 10 }}>▲</span>
        </span>
      </div>
      <div className="status-group">
        <span className="text-muted uppercase" style={{ fontSize: 10 }}>Block Time</span>
        <span>{d.blockTime}</span>
      </div>
      <div className="status-group">
        <span className="text-muted uppercase" style={{ fontSize: 10 }}>Finality</span>
        <span>{d.finality}</span>
      </div>
      {d.gasPrice && (
        <div className="status-group">
          <span className="text-muted uppercase" style={{ fontSize: 10 }}>Gas</span>
          <span>{d.gasPrice}</span>
        </div>
      )}
      <div className="status-group">
        <span className="text-muted uppercase" style={{ fontSize: 10 }}>Parallel Exec</span>
        <span>{d.parallelExecRatio}%</span>
      </div>
      <div className="status-group">
        <span className="text-muted uppercase" style={{ fontSize: 10 }}>Validators</span>
        <span>{d.activeValidators} / {d.totalValidators}</span>
      </div>
      <div className="status-group" style={{ border: "none" }}>
        <span className="dot green blink" style={{ marginRight: 4 }} />
        <span className="text-green uppercase" style={{ fontSize: 10, letterSpacing: 1 }}>
          Consensus Stable
        </span>
      </div>
    </div>
  );
}
