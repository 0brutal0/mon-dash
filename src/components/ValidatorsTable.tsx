import { VALIDATORS, VALIDATOR_META, URLS } from "@/data/constants";

interface ValidatorRow {
  rank: string;
  name: string;
  addr: string;
  fullAddr?: string;
  stake: string;
  uptime: string;
  uptimeColor: string;
  comm: string;
}

interface ValidatorMeta {
  nakamotoCoefficient: number;
  epochEnds: string;
  top10StakePct: number;
  currentEpoch?: number;
}

interface Props {
  data?: {
    validators: ValidatorRow[];
    meta: ValidatorMeta;
  };
}

export default function ValidatorsTable({ data }: Props) {
  const validators: ValidatorRow[] = data?.validators ?? VALIDATORS;
  const meta = data?.meta ?? VALIDATOR_META;

  return (
    <div className="panel col-7" style={{ height: 300 }}>
      <div className="panel-header">
        <div className="panel-title">Validator Set ({validators.length})</div>
        <div className="panel-meta text-cyan">SORT: WEIGHT</div>
      </div>
      <div className="panel-content no-pad" style={{ overflowY: "auto" }}>
        <table>
          <thead>
            <tr>
              <th style={{ width: 32 }}>Rnk</th>
              <th>Validator</th>
              <th className="right">Total Stake</th>
              <th className="right" style={{ width: 55 }}>Uptime</th>
              <th className="right" style={{ width: 45 }}>Comm</th>
            </tr>
          </thead>
          <tbody>
            {validators.map((v) => (
              <tr key={v.rank}>
                <td className="text-muted">{v.rank}</td>
                <td>
                  {v.fullAddr ? (
                    <a href={URLS.monadscanAddr(v.fullAddr)} target="_blank" rel="noopener noreferrer" className="ext-link text-cyan">{v.name}</a>
                  ) : (
                    <span className="text-cyan">{v.name}</span>
                  )}
                </td>
                <td className="right">{v.stake}</td>
                <td className={`right ${v.uptimeColor}`}>{v.uptime}</td>
                <td className="right">{v.comm}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ padding: "8px 8px 4px", borderTop: "1px solid #333", display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span className="text-muted uppercase" style={{ fontSize: 10 }}>Nakamoto Coeff</span>
            <span className="text-amber bold">{meta.nakamotoCoefficient}</span>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span className="text-muted uppercase" style={{ fontSize: 10 }}>
              Epoch {meta.currentEpoch ?? ""}
            </span>
            <span>{meta.epochEnds}</span>
          </div>
          <div style={{ flex: 1, display: "flex", gap: 6, alignItems: "center" }}>
            <span className="text-muted uppercase" style={{ fontSize: 10 }}>Top 10 Stake</span>
            <div className="progress-bar" style={{ flex: 1 }}>
              <div className="progress-fill" style={{ width: `${meta.top10StakePct}%`, background: "#ff79c6" }} />
            </div>
            <span style={{ fontSize: 10 }}>{meta.top10StakePct}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
