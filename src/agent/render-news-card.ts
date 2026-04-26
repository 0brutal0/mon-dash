import { execFile } from "node:child_process";
import { access, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import type { NewsHeadline } from "./types";

const execFileAsync = promisify(execFile);

const WIDTH = 1600;
const HEIGHT = 900;
const MAX_IMAGE_HEADLINES = 5;

export async function renderNewsCard(items: NewsHeadline[]): Promise<string> {
  if (items.length === 0) throw new Error("Cannot render news card without headlines");

  const outDir = path.join(tmpdir(), "mon-dash-agent");
  await mkdir(outDir, { recursive: true });

  const htmlPath = path.join(outDir, "monad-news-card.html");
  const pngPath = path.join(outDir, "monad-news-card.png");
  await writeFile(htmlPath, renderHtml(items), "utf8");

  const chrome = await findChrome();
  await execFileAsync(chrome, [
    "--headless=new",
    "--disable-gpu",
    "--disable-dev-shm-usage",
    "--hide-scrollbars",
    "--no-sandbox",
    `--window-size=${WIDTH},${HEIGHT}`,
    `--screenshot=${pngPath}`,
    `file://${htmlPath}`,
  ]);

  return pngPath;
}

function renderHtml(items: NewsHeadline[]): string {
  const shown = items.slice(0, MAX_IMAGE_HEADLINES);
  const variant = shown.length === 1 ? "single" : shown.length === 2 ? "duo" : shown.length === 3 ? "trio" : "digest";
  const dateLabel = formatCardDate(new Date());
  const rows = shown
    .map((item, idx) => renderHeadline(item, idx, shown.length))
    .join("");

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  :root {
    --bg: #05070a;
    --panel: #080d12;
    --panel-soft: #0b1118;
    --text: #f4f8fb;
    --muted: #7d8b98;
    --border: rgba(139, 233, 253, 0.28);
    --cyan: #8be9fd;
    --green: #50fa7b;
    --pink: #ff79c6;
    --amber: #f1fa8c;
  }

  * { box-sizing: border-box; }
  body {
    margin: 0;
    width: ${WIDTH}px;
    height: ${HEIGHT}px;
    overflow: hidden;
    background:
      linear-gradient(rgba(139,233,253,0.035) 1px, transparent 1px),
      linear-gradient(90deg, rgba(139,233,253,0.035) 1px, transparent 1px),
      radial-gradient(circle at 80% 18%, rgba(80,250,123,0.08), transparent 28%),
      var(--bg);
    background-size: 40px 40px, 40px 40px, 100% 100%, 100% 100%;
    color: var(--text);
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
    letter-spacing: 0;
  }

  .frame {
    position: relative;
    width: ${WIDTH}px;
    height: ${HEIGHT}px;
    padding: 46px 70px 86px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 1px solid var(--border);
    padding-bottom: 18px;
  }

  .title {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .eyebrow {
    color: var(--green);
    font-size: 22px;
    text-transform: uppercase;
  }

  h1 {
    margin: 0;
    color: var(--cyan);
    font-size: 66px;
    line-height: 0.95;
    font-weight: 800;
    text-transform: uppercase;
  }

  .date {
    color: var(--muted);
    font-size: 26px;
    text-align: right;
    text-transform: uppercase;
    line-height: 1.35;
  }

  .date strong {
    display: block;
    color: var(--text);
    font-size: 32px;
    font-weight: 700;
  }

  .content {
    flex: 1;
    display: grid;
    grid-template-rows: repeat(${shown.length}, minmax(0, 1fr));
    gap: ${variant === "single" ? "26px" : "14px"};
    min-height: 0;
  }

  .row {
    position: relative;
    min-height: 0;
    display: grid;
    grid-template-columns: 96px 1fr;
    gap: 28px;
    align-items: center;
    padding: ${rowPadding(variant)};
    background: linear-gradient(90deg, rgba(11,17,24,0.96), rgba(8,13,18,0.76));
    border: 1px solid rgba(139, 233, 253, 0.18);
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.025);
  }

  .row::before {
    content: "";
    position: absolute;
    inset: -1px auto -1px -1px;
    width: 5px;
    background: var(--cyan);
  }

  .row:nth-child(2n)::before { background: var(--green); }
  .row:nth-child(3n)::before { background: var(--pink); }

  .idx {
    color: var(--cyan);
    font-size: ${variant === "single" ? "54px" : "42px"};
    font-weight: 800;
    line-height: 1;
  }

  .headline {
    display: flex;
    flex-direction: column;
    gap: ${variant === "single" ? "24px" : "14px"};
  }

  .headline-text {
    color: var(--text);
    font-size: ${headlineSize(variant, shown.length)};
    line-height: 1.08;
    font-weight: 760;
  }

  .source {
    display: flex;
    align-items: center;
    gap: 14px;
    color: var(--muted);
    font-size: ${variant === "single" ? "28px" : "19px"};
    text-transform: uppercase;
  }

  .source span {
    color: var(--amber);
  }

</style>
</head>
<body>
  <main class="frame">
    <section class="top">
      <div class="title">
        <div class="eyebrow">${variant === "single" ? "Featured headline" : "Ecosystem headlines"}</div>
        <h1>Monad News</h1>
      </div>
      <div class="date">
        <strong>${dateLabel}</strong>
        Links in next tweet
      </div>
    </section>
    <section class="content ${variant}">
      ${rows}
    </section>
  </main>
</body>
</html>`;
}

function renderHeadline(item: NewsHeadline, idx: number, count: number): string {
  return `<article class="row item-${count}">
  <div class="idx">${String(idx + 1).padStart(2, "0")}</div>
  <div class="headline">
    <div class="headline-text">${escapeHtml(item.title)}</div>
    <div class="source">Source <span>${escapeHtml(item.source)}</span></div>
  </div>
</article>`;
}

function headlineSize(variant: string, count: number): string {
  if (variant === "single") return "64px";
  if (variant === "duo") return "52px";
  if (variant === "trio") return "46px";
  return count >= 5 ? "29px" : "34px";
}

function rowPadding(variant: string): string {
  if (variant === "single") return "58px 58px 58px 52px";
  if (variant === "duo") return "44px 48px 44px 42px";
  if (variant === "trio") return "34px 42px 34px 38px";
  return "18px 32px 18px 32px";
}

function formatCardDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function findChrome(): Promise<string> {
  const candidates = [
    process.env.CHROME_PATH,
    "/usr/bin/google-chrome-stable",
    "/usr/bin/google-chrome",
    "/snap/bin/chromium",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ].filter((v): v is string => Boolean(v));

  for (const candidate of candidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // Try the next known browser path.
    }
  }

  throw new Error("No Chrome/Chromium executable found for news card rendering");
}
