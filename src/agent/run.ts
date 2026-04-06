#!/usr/bin/env node

// Mon-dash Twitter Agent
// Usage:
//   npx tsx src/agent/run.ts                     # dry run (prints tweets, doesn't post)
//   npx tsx src/agent/run.ts --post              # actually posts to Twitter
//   npx tsx src/agent/run.ts --weekly            # compose weekly thread
//   npx tsx src/agent/run.ts --weekly --post     # post weekly thread

import { resolve } from "path";
import { fetchSnapshot, loadSnapshot, saveSnapshot } from "./snapshot";
import { composeDailyRecap, detectNotableMoves, checkTvlMilestone, composeWeeklyThread } from "./compose";
import { publishEvent } from "./twitter";
import type { AgentConfig, TweetEvent } from "./types";

const config: AgentConfig = {
  apiBaseUrl: process.env.API_BASE_URL || "http://localhost:3000",
  snapshotPath: resolve(process.cwd(), "src/agent/snapshot.json"),
  twitterApiKey: process.env.TWITTER_API_KEY,
  twitterApiSecret: process.env.TWITTER_API_SECRET,
  twitterAccessToken: process.env.TWITTER_ACCESS_TOKEN,
  twitterAccessSecret: process.env.TWITTER_ACCESS_SECRET,
  dryRun: !process.argv.includes("--post"),
};

async function main() {
  const isWeekly = process.argv.includes("--weekly");

  console.log(`[agent] Fetching data from ${config.apiBaseUrl}...`);
  const current = await fetchSnapshot(config.apiBaseUrl);
  console.log(`[agent] Got snapshot: TVL=${current.tvl}, Price=$${current.price}`);

  const previous = loadSnapshot(config.snapshotPath);
  if (previous) {
    console.log(`[agent] Previous snapshot from ${previous.timestamp}`);
  } else {
    console.log(`[agent] No previous snapshot found — first run`);
  }

  const events: TweetEvent[] = [];

  if (isWeekly) {
    // Weekly thread mode
    events.push(composeWeeklyThread(current, previous));
  } else {
    // Daily mode: recap + threshold alerts
    events.push(composeDailyRecap(current));

    // Notable moves (only if we have a previous snapshot to compare)
    const moves = detectNotableMoves(current, previous);
    events.push(...moves);

    // Milestone checks
    const milestone = checkTvlMilestone(current, previous);
    if (milestone) events.push(milestone);
  }

  // Sort by priority (1 = highest)
  events.sort((a, b) => a.priority - b.priority);

  console.log(`\n[agent] ${events.length} event(s) to publish:\n`);

  for (const event of events) {
    await publishEvent(event, config);
  }

  // Save current snapshot for next comparison
  saveSnapshot(config.snapshotPath, current);
  console.log(`\n[agent] Snapshot saved. Done.`);
}

main().catch((err) => {
  console.error("[agent] Fatal:", err);
  process.exit(1);
});
