import * as crypto from "crypto";
import type { TweetEvent, AgentConfig } from "./types";

// ─── Twitter/X API v2 (Free tier) ──────────────────────────

interface TwitterAuth {
  apiKey: string;
  apiSecret: string;
  accessToken: string;
  accessSecret: string;
}

function getAuth(config: AgentConfig): TwitterAuth | null {
  const { twitterApiKey, twitterApiSecret, twitterAccessToken, twitterAccessSecret } = config;
  if (!twitterApiKey || !twitterApiSecret || !twitterAccessToken || !twitterAccessSecret) {
    return null;
  }
  return {
    apiKey: twitterApiKey,
    apiSecret: twitterApiSecret,
    accessToken: twitterAccessToken,
    accessSecret: twitterAccessSecret,
  };
}

// OAuth 1.0a signature for Twitter API
function buildOAuthHeader(
  method: string,
  url: string,
  auth: TwitterAuth,
  body?: string,
): string {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = crypto.randomBytes(16).toString("hex");

  const params: Record<string, string> = {
    oauth_consumer_key: auth.apiKey,
    oauth_nonce: nonce,
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: timestamp,
    oauth_token: auth.accessToken,
    oauth_version: "1.0",
  };

  // Build signature base string
  const sortedParams = Object.keys(params)
    .sort()
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
    .join("&");

  const baseString = [
    method.toUpperCase(),
    encodeURIComponent(url),
    encodeURIComponent(sortedParams),
  ].join("&");

  const signingKey = `${encodeURIComponent(auth.apiSecret)}&${encodeURIComponent(auth.accessSecret)}`;
  const signature = crypto.createHmac("sha1", signingKey).update(baseString).digest("base64");

  params.oauth_signature = signature;

  const header = Object.keys(params)
    .sort()
    .map((k) => `${encodeURIComponent(k)}="${encodeURIComponent(params[k])}"`)
    .join(", ");

  return `OAuth ${header}`;
}

async function postTweet(text: string, auth: TwitterAuth, replyToId?: string): Promise<string | null> {
  const url = "https://api.x.com/2/tweets";
  const payload: Record<string, unknown> = { text };
  if (replyToId) {
    payload.reply = { in_reply_to_tweet_id: replyToId };
  }

  const body = JSON.stringify(payload);
  const authHeader = buildOAuthHeader("POST", url, auth, body);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
    },
    body,
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`[twitter] POST failed ${res.status}: ${err}`);
    return null;
  }

  const data = await res.json();
  return data.data?.id ?? null;
}

// ─── Public API ─────────────────────────────────────────────

export async function publishEvent(event: TweetEvent, config: AgentConfig): Promise<void> {
  if (config.dryRun) {
    console.log(`[dry-run] Would tweet (${event.type}):`);
    if (event.thread) {
      event.thread.forEach((t, i) => console.log(`  [${i + 1}/${event.thread!.length}] ${t}\n`));
    } else {
      console.log(`  ${event.content}\n`);
    }
    return;
  }

  const auth = getAuth(config);
  if (!auth) {
    console.error("[twitter] Missing API credentials. Set TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET");
    return;
  }

  if (event.thread && event.thread.length > 1) {
    // Post as thread
    let lastId: string | null = null;
    for (const tweet of event.thread) {
      lastId = await postTweet(tweet, auth, lastId ?? undefined);
      if (!lastId) {
        console.error("[twitter] Thread broken — failed to post tweet");
        break;
      }
    }
    console.log(`[twitter] Posted thread (${event.thread.length} tweets)`);
  } else {
    const id = await postTweet(event.content, auth);
    if (id) {
      console.log(`[twitter] Posted: ${id}`);
    }
  }
}
