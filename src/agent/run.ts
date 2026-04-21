#!/usr/bin/env node

// Mon-dash Telegram agent
// Usage:
//   npx tsx src/agent/run.ts --morning            # dry-run morning stats
//   npx tsx src/agent/run.ts --morning --send     # send morning stats to Telegram
//   npx tsx src/agent/run.ts --evening            # dry-run news digest
//   npx tsx src/agent/run.ts --evening --send     # send news digest to Telegram

import { fetchMorningStats, fetchEveningNews } from "./snapshot";
import { composeMorningTweet, composeNewsDigest } from "./compose";
import { sendTelegram, sendTweetBlock } from "./telegram";
import type { TelegramConfig } from "./types";

async function main() {
  const args = process.argv.slice(2);
  const mode = args.includes("--evening") ? "evening" : "morning";
  const dryRun = !args.includes("--send");

  const cfg: TelegramConfig = {
    botToken: process.env.TELEGRAM_BOT_TOKEN ?? "",
    chatId: process.env.TELEGRAM_CHAT_ID ?? "",
    dryRun,
  };

  if (!dryRun && (!cfg.botToken || !cfg.chatId)) {
    console.error("[agent] TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID must be set when using --send");
    process.exit(1);
  }

  console.log(`[agent] mode=${mode} dryRun=${dryRun}`);

  if (mode === "morning") {
    const stats = await fetchMorningStats();
    console.log("[agent] stats:", stats);
    const tweet = composeMorningTweet(stats);
    if (!tweet) {
      console.error("[agent] no stats available — skipping send");
      process.exit(1);
    }
    await sendTweetBlock(tweet, cfg);
    console.log(`[agent] morning tweet ${dryRun ? "previewed" : "sent"} (${tweet.length} chars)`);
  } else {
    const news = await fetchEveningNews(5);
    console.log(`[agent] ${news.length} headlines in last 24h`);
    const digest = composeNewsDigest(news);
    if (!digest) {
      console.error("[agent] no news in last 24h — skipping send");
      return;
    }
    await sendTelegram(digest, cfg);
    console.log(`[agent] news digest ${dryRun ? "previewed" : "sent"}`);
  }
}

main().catch((err) => {
  console.error("[agent] Fatal:", err);
  process.exit(1);
});
