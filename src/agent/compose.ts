import type { DashSnapshot, TweetEvent } from "./types";

// ─── Daily Recap ────────────────────────────────────────────

export function composeDailyRecap(current: DashSnapshot): TweetEvent {
  const lines = [
    `Monad Daily | ${new Date().toISOString().slice(0, 10)}`,
    ``,
    `Price: $${current.price} (${current.change24h >= 0 ? "+" : ""}${current.change24h}%)`,
    `TVL: ${current.tvl}`,
    `Stablecoins: ${current.stablecoinTotal}`,
    `Daily Txns: ${current.dailyTx}`,
    `Active Addrs: ${current.activeAddrsDaily}`,
    `Bridge Flow (7d): ${current.bridgeNetFlow}`,
    `Validators: ${current.validatorCount}`,
  ];

  return {
    type: "daily_recap",
    priority: 2,
    content: lines.join("\n"),
  };
}

// ─── Notable Moves (only fires if meaningful) ───────────────

export function detectNotableMoves(
  current: DashSnapshot,
  previous: DashSnapshot | null,
): TweetEvent[] {
  if (!previous) return [];
  const events: TweetEvent[] = [];

  // TVL change > 5%
  const currTvl = parseUSD(current.tvl);
  const prevTvl = parseUSD(previous.tvl);
  if (prevTvl > 0) {
    const tvlChange = ((currTvl - prevTvl) / prevTvl) * 100;
    if (Math.abs(tvlChange) >= 5) {
      const dir = tvlChange > 0 ? "up" : "down";
      events.push({
        type: "notable_move",
        priority: 1,
        content: [
          `Monad TVL ${dir} ${Math.abs(tvlChange).toFixed(1)}% in 24h`,
          ``,
          `${previous.tvl} → ${current.tvl}`,
          ``,
          `Top protocols: ${current.topProtocols.slice(0, 3).map((p) => `${p.name} (${p.tvl})`).join(", ")}`,
        ].join("\n"),
      });
    }
  }

  // Stablecoin supply change > 10%
  const currStable = parseUSD(current.stablecoinTotal);
  const prevStable = parseUSD(previous.stablecoinTotal);
  if (prevStable > 0) {
    const stableChange = ((currStable - prevStable) / prevStable) * 100;
    if (Math.abs(stableChange) >= 10) {
      events.push({
        type: "notable_move",
        priority: 1,
        content: [
          `Monad stablecoin supply ${stableChange > 0 ? "surged" : "dropped"} ${Math.abs(stableChange).toFixed(1)}%`,
          ``,
          `${previous.stablecoinTotal} → ${current.stablecoinTotal}`,
          ``,
          current.stablecoinAssets
            .slice(0, 3)
            .map((a) => `${a.name}: ${a.amount} (${a.pct}%)`)
            .join("\n"),
        ].join("\n"),
      });
    }
  }

  // Validator count change
  if (current.validatorCount !== previous.validatorCount) {
    const diff = current.validatorCount - previous.validatorCount;
    if (Math.abs(diff) >= 1) {
      events.push({
        type: "new_validator",
        priority: 2,
        content: `Monad validator set: ${previous.validatorCount} → ${current.validatorCount} (${diff > 0 ? "+" : ""}${diff})`,
      });
    }
  }

  return events;
}

// ─── TVL Milestones ─────────────────────────────────────────

const TVL_MILESTONES = [100e6, 250e6, 500e6, 750e6, 1e9, 2e9, 5e9, 10e9];

export function checkTvlMilestone(
  current: DashSnapshot,
  previous: DashSnapshot | null,
): TweetEvent | null {
  if (!previous) return null;
  const currTvl = parseUSD(current.tvl);
  const prevTvl = parseUSD(previous.tvl);

  for (const milestone of TVL_MILESTONES) {
    if (prevTvl < milestone && currTvl >= milestone) {
      return {
        type: "tvl_milestone",
        priority: 1,
        content: [
          `Monad TVL just crossed ${formatMilestone(milestone)}`,
          ``,
          `Current: ${current.tvl}`,
          `Top protocols: ${current.topProtocols.slice(0, 5).map((p) => `${p.name} ${p.tvl}`).join(" | ")}`,
        ].join("\n"),
      };
    }
  }
  return null;
}

// ─── Weekly Thread ──────────────────────────────────────────

export function composeWeeklyThread(
  current: DashSnapshot,
  weekAgo: DashSnapshot | null,
): TweetEvent {
  const thread: string[] = [];

  // Tweet 1: Overview
  thread.push(
    [
      `Monad Weekly Recap | ${new Date().toISOString().slice(0, 10)}`,
      ``,
      `TVL: ${current.tvl}`,
      `Stablecoins: ${current.stablecoinTotal}`,
      `Validators: ${current.validatorCount}`,
      ``,
      `Thread 🧵`,
    ].join("\n"),
  );

  // Tweet 2: TVL breakdown
  thread.push(
    [
      `TVL by category:`,
      ``,
      ...current.tvlByCategory.slice(0, 5).map((c) => `${c.name}: ${c.value} (${c.pct}%)`),
    ].join("\n"),
  );

  // Tweet 3: Top protocols
  thread.push(
    [
      `Top protocols:`,
      ``,
      ...current.topProtocols.slice(0, 5).map((p, i) => `${i + 1}. ${p.name} — ${p.tvl} (${p.pct}%)`),
    ].join("\n"),
  );

  // Tweet 4: Activity & bridges
  thread.push(
    [
      `Network activity:`,
      ``,
      `Daily txns: ${current.dailyTx}`,
      `Active addresses: ${current.activeAddrsDaily}`,
      `Bridge flow (7d): ${current.bridgeNetFlow}`,
    ].join("\n"),
  );

  return {
    type: "weekly_thread",
    priority: 2,
    content: thread[0],
    thread,
  };
}

// ─── Helpers ────────────────────────────────────────────────

function parseUSD(str: string): number {
  const clean = str.replace(/[$,]/g, "");
  const multipliers: Record<string, number> = { K: 1e3, M: 1e6, B: 1e9, T: 1e12 };
  const match = clean.match(/^([\d.]+)\s*([KMBT])?$/i);
  if (!match) return 0;
  return parseFloat(match[1]) * (multipliers[match[2]?.toUpperCase()] ?? 1);
}

function formatMilestone(val: number): string {
  if (val >= 1e9) return `$${(val / 1e9).toFixed(0)}B`;
  if (val >= 1e6) return `$${(val / 1e6).toFixed(0)}M`;
  return `$${val}`;
}
