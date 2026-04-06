import { FUNDING, URLS } from "@/data/constants";

export default function FundingPanel() {
  return (
    <div className="col-12 status-strip">
      <div className="status-group">
        <span className="text-muted uppercase" style={{ fontSize: 10 }}>Total Raised</span>
        <span className="text-green bold">{FUNDING.totalRaised}</span>
      </div>
      <div className="status-group">
        <span className="text-muted uppercase" style={{ fontSize: 10 }}>Series A</span>
        <a href={URLS.funding.seriesA} target="_blank" rel="noopener noreferrer" className="ext-link text-cyan">
          {FUNDING.rounds[0].lead} ({FUNDING.rounds[0].amount})
        </a>
      </div>
      <div className="status-group">
        <span className="text-muted uppercase" style={{ fontSize: 10 }}>Seed</span>
        <a href={URLS.funding.seed} target="_blank" rel="noopener noreferrer" className="ext-link text-cyan">
          {FUNDING.rounds[1].lead} ({FUNDING.rounds[1].amount})
        </a>
      </div>
      <div className="status-group">
        <span className="text-muted uppercase" style={{ fontSize: 10 }}>Backers</span>
        <span style={{ fontSize: 11 }}>{FUNDING.backers.slice(2, 6).join(" · ")}</span>
      </div>
      <div className="status-group" style={{ border: "none" }}>
        <span className="text-muted uppercase" style={{ fontSize: 10 }}>Valuation</span>
        <span className="text-amber bold">{FUNDING.valuation}</span>
      </div>
    </div>
  );
}
