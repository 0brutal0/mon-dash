import { DEFI_PROTOCOLS, URLS } from "@/data/constants";

interface Protocol {
  name: string;
  category: string;
  tvl: string;
  pct: number;
  color: string;
  url?: string | null;
}

interface Props {
  protocols?: Protocol[];
}

export default function DefiTreemap({ protocols }: Props) {
  const top8: Protocol[] = (protocols && protocols.length > 0 ? protocols : DEFI_PROTOCOLS).slice(0, 8);

  return (
    <div className="panel col-5" style={{ minHeight: 300 }}>
      <div className="panel-header">
        <div className="panel-title green">DeFi TVL Distribution</div>
      </div>
      <div className="panel-content">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr",
            gridTemplateRows: "1fr 1fr 1fr",
            gap: 4,
            height: "100%",
          }}
        >
          {top8.map((p, i) => (
            <div
              key={p.name}
              className="tm-box"
              style={{
                borderColor: p.color,
                ...(i === 0 ? { gridRow: "span 2" } : {}),
              }}
            >
              {(p.url || URLS.protocols[p.name.toLowerCase()]) ? (
                <a href={p.url ?? URLS.protocols[p.name.toLowerCase()]} target="_blank" rel="noopener noreferrer" className="ext-link tm-name" style={{ color: p.color }}>{p.name}</a>
              ) : (
                <span className="tm-name" style={{ color: p.color }}>{p.name}</span>
              )}
              <span className="tm-val">
                {p.tvl}
                <br />
                <span className="text-muted" style={{ fontSize: 10 }}>{p.pct}% · {p.category}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
