import { COMPETITORS, URLS } from "@/data/constants";

interface Props {
  data?: typeof COMPETITORS;
}

export default function CompetitorsTable({ data }: Props) {
  const d = data ?? COMPETITORS;

  return (
    <div className="panel col-7" style={{ height: 250 }}>
      <div className="panel-header">
        <div className="panel-title">MON vs L1 Competitors</div>
        <div className="panel-meta">BENCHMARK</div>
      </div>
      <div className="panel-content no-pad" style={{ overflowY: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>Metric</th>
              {d.chains.map((c) => (
                <th key={c.name} className="right" style={c.highlight ? { color: "#8be9fd" } : undefined}>
                  {URLS.competitors[c.name] ? (
                    <a href={URLS.competitors[c.name]} target="_blank" rel="noopener noreferrer" className="ext-link">{c.name}</a>
                  ) : c.highlight ? (
                    <a href={URLS.coingecko} target="_blank" rel="noopener noreferrer" className="ext-link">{c.name}</a>
                  ) : (
                    c.name
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {d.metrics.map((metric, mi) => (
              <tr key={metric}>
                <td className="text-muted uppercase" style={{ fontSize: 10 }}>{metric}</td>
                {d.chains.map((c) => (
                  <td
                    key={c.name}
                    className="right"
                    style={c.highlight ? { color: "#8be9fd", fontWeight: 600 } : undefined}
                  >
                    {c.values[mi]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
