"use client";

import { useState, useMemo } from "react";
import { VALIDATORS, VALIDATOR_META, URLS } from "@/data/constants";

interface ValidatorRow {
  rank: string;
  name: string;
  addr: string;
  fullAddr?: string;
  stake: string;
  sharePct?: number;
  status?: string;
  website?: string | null;
  xUrl?: string | null;
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

type SortKey = "rank" | "name" | "stake" | "comm" | "status";
type SortDir = "asc" | "desc";

function parseStake(s: string): number {
  const m = s.match(/([\d.]+)\s*([BMK])?/i);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  const suffix = (m[2] ?? "").toUpperCase();
  if (suffix === "B") return n * 1e9;
  if (suffix === "M") return n * 1e6;
  if (suffix === "K") return n * 1e3;
  return n;
}

function parsePct(s: string): number {
  if (s === "—") return -1;
  return parseFloat(s.replace("%", "")) || 0;
}

const SORT_ICONS: Record<SortDir, string> = { asc: " ▲", desc: " ▼" };

const STATUS_RANK: Record<string, number> = { ACTIVE: 0, SNAPSHOT: 1, ELIGIBLE: 2 };
const STATUS_COLOR: Record<string, string> = {
  ACTIVE: "text-green",
  SNAPSHOT: "text-amber",
  ELIGIBLE: "text-muted",
};

export default function ValidatorsTable({ data }: Props) {
  const validators: ValidatorRow[] = data?.validators ?? VALIDATORS;
  const meta = data?.meta ?? VALIDATOR_META;

  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "rank" ? "asc" : "desc");
    }
  };

  const sorted = useMemo(() => {
    return [...validators].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "rank") cmp = parseInt(a.rank) - parseInt(b.rank);
      else if (sortKey === "name") cmp = a.name.localeCompare(b.name);
      else if (sortKey === "stake") cmp = parseStake(a.stake) - parseStake(b.stake);
      else if (sortKey === "comm") cmp = parsePct(a.comm) - parsePct(b.comm);
      else if (sortKey === "status")
        cmp = (STATUS_RANK[a.status ?? "ELIGIBLE"] ?? 99) - (STATUS_RANK[b.status ?? "ELIGIBLE"] ?? 99);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [validators, sortKey, sortDir]);

  const maxShare = useMemo(
    () => Math.max(1, ...validators.map((v) => v.sharePct ?? 0)),
    [validators]
  );

  const colStyle = (key: SortKey): React.CSSProperties => ({
    cursor: "pointer",
    userSelect: "none",
    color: sortKey === key ? "var(--color-accent-cyan)" : undefined,
    transition: "color 0.15s",
  });
  const rankColStyle: React.CSSProperties = {
    width: 72,
    minWidth: 72,
    paddingLeft: 10,
    paddingRight: 6,
  };

  return (
    <div className="panel col-7 scroll-panel" style={{ height: 300 }}>
      <div className="panel-header">
        <div className="panel-title">Validator Set ({validators.length})</div>
        <div className="panel-meta text-cyan">SORT: {sortKey.toUpperCase()} {SORT_ICONS[sortDir]}</div>
      </div>

      <div className="panel-content no-pad" style={{ overflowY: "auto" }}>
        <table>
          <thead>
            <tr>
              <th style={{ ...rankColStyle, ...colStyle("rank") }} onClick={() => handleSort("rank")}>
                Rank{sortKey === "rank" ? SORT_ICONS[sortDir] : ""}
              </th>
              <th style={colStyle("name")} onClick={() => handleSort("name")}>
                Validator{sortKey === "name" ? SORT_ICONS[sortDir] : ""}
              </th>
              <th className="right" style={colStyle("stake")} onClick={() => handleSort("stake")}>
                Stake (share){sortKey === "stake" ? SORT_ICONS[sortDir] : ""}
              </th>
              <th className="right" style={{ width: 60, ...colStyle("comm") }} onClick={() => handleSort("comm")}>
                Comm{sortKey === "comm" ? SORT_ICONS[sortDir] : ""}
              </th>
              <th className="right" style={{ width: 70, ...colStyle("status") }} onClick={() => handleSort("status")}>
                Status{sortKey === "status" ? SORT_ICONS[sortDir] : ""}
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((v) => {
              const share = v.sharePct ?? 0;
              const barWidth = Math.min(100, (share / maxShare) * 100);
              const link = v.website || v.xUrl || (v.fullAddr ? URLS.monadscanAddr(v.fullAddr) : null);
              const status = v.status ?? "ELIGIBLE";
              return (
                <tr key={v.rank}>
                  <td className="text-muted" style={rankColStyle}>{v.rank}</td>
                  <td>
                    {link ? (
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ext-link text-cyan"
                      >
                        {v.name}
                      </a>
                    ) : (
                      <span className="text-cyan">{v.name}</span>
                    )}
                  </td>
                  <td className="right" style={{ position: "relative", minWidth: 110 }}>
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        margin: "3px 0",
                        background: "linear-gradient(to right, rgba(139,233,253,0.18), rgba(139,233,253,0.05))",
                        width: `${barWidth}%`,
                        right: "auto",
                        pointerEvents: "none",
                      }}
                    />
                    <span style={{ position: "relative" }}>
                      {v.stake}
                      {share > 0 && (
                        <span className="text-muted" style={{ fontSize: 10, marginLeft: 4 }}>
                          {share.toFixed(2)}%
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="right">{v.comm}</td>
                  <td className={`right ${STATUS_COLOR[status] ?? ""}`} style={{ fontSize: 10 }}>
                    {status}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div
          style={{
            padding: "8px 8px 4px",
            borderTop: "1px solid #333",
            display: "flex",
            gap: 16,
            alignItems: "center",
          }}
        >
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
              <div
                className="progress-fill"
                style={{ width: `${meta.top10StakePct}%`, background: "#ff79c6" }}
              />
            </div>
            <span style={{ fontSize: 10 }}>{meta.top10StakePct}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
