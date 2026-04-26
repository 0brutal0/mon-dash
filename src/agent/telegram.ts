import type { TelegramConfig } from "./types";
import { readFile } from "node:fs/promises";

export async function sendTelegram(text: string, cfg: TelegramConfig): Promise<void> {
  if (cfg.dryRun) {
    console.log("─── dry run ───");
    console.log(text);
    console.log("───────────────");
    return;
  }

  const url = `https://api.telegram.org/bot${cfg.botToken}/sendMessage`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: cfg.chatId,
      text,
      disable_web_page_preview: true,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Telegram sendMessage failed: ${res.status} ${body}`);
  }
}

export async function sendTelegramPhoto(
  imagePath: string,
  cfg: TelegramConfig,
  caption?: string
): Promise<void> {
  if (cfg.dryRun) {
    console.log("─── dry run photo ───");
    console.log(imagePath);
    if (caption) console.log(caption);
    console.log("─────────────────────");
    return;
  }

  const image = await readFile(imagePath);
  const form = new FormData();
  form.append("chat_id", cfg.chatId);
  form.append("photo", new Blob([image], { type: "image/png" }), "monad-news.png");
  if (caption) form.append("caption", caption);

  const url = `https://api.telegram.org/bot${cfg.botToken}/sendPhoto`;
  const res = await fetch(url, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Telegram sendPhoto failed: ${res.status} ${body}`);
  }
}

export function sendTweetBlock(text: string, cfg: TelegramConfig): Promise<void> {
  // Wrap tweet in a Telegram <pre> code block for tap-to-copy on mobile.
  if (cfg.dryRun) return sendTelegram(text, cfg);

  const url = `https://api.telegram.org/bot${cfg.botToken}/sendMessage`;
  const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: cfg.chatId,
      text: `<pre>${escaped}</pre>`,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  }).then(async (res) => {
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Telegram sendMessage failed: ${res.status} ${body}`);
    }
  });
}
