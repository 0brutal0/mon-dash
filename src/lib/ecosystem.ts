import * as C from "../data/constants";

const APP_HUB_URL = "https://app.monad.xyz/app-hub";

type AppHubProject = {
  name: string;
  categories: string[];
  platforms: string[];
  appLink?: string;
  onlyOnMonad: boolean;
  firstPublishedAt: string;
};

type AppHubFilter = {
  id: string;
  title: string;
  categories: string[];
};

export type EcosystemCategory = {
  name: string;
  count: number;
  pct: number;
};

export type EcosystemLaunch = {
  name: string;
  category: string;
  date: string;
  url?: string;
};

export type EcosystemData = {
  totalProjects: number;
  categories: EcosystemCategory[];
  recentLaunches: EcosystemLaunch[];
  sourceUrl: string;
  isLive: boolean;
};

const FALLBACK_FILTERS: AppHubFilter[] = [
  { id: "defi", title: "DeFi", categories: ["Trading", "Leverage Trading", "Lend & Borrow", "Yield", "Asset Issuer", "Launchpad", "Liquid Staking"] },
  { id: "consumer", title: "Consumer", categories: ["Prediction Market", "Sports", "Collectibles", "Entertainment", "Social", "Payment"] },
  { id: "ai", title: "AI", categories: ["Data", "Agent", "Robotics"] },
  { id: "tooling", title: "Tooling", categories: ["Bridge", "Analytics", "Staking"] },
  { id: "platform", title: "Platform", categories: ["iOS", "Android", "Desktop"] },
];

const FALLBACK_ECOSYSTEM: EcosystemData = {
  totalProjects: C.ECOSYSTEM.totalProjects,
  categories: [
    { name: "DeFi", count: 82, pct: 27 },
    { name: "Consumer", count: 64, pct: 21 },
    { name: "AI", count: 28, pct: 9 },
    { name: "Tooling", count: 58, pct: 19 },
    { name: "Platform", count: 300, pct: 100 },
    { name: "Only on Monad", count: 0, pct: 0 },
  ],
  recentLaunches: C.ECOSYSTEM.recentLaunches,
  sourceUrl: APP_HUB_URL,
  isLive: false,
};

function extractJsonArray(text: string, marker: string) {
  const markerIndex = text.indexOf(marker);
  if (markerIndex === -1) return null;

  const start = markerIndex + marker.length - 1;
  let depth = 0;
  let inString = false;

  for (let i = start; i < text.length; i++) {
    const char = text[i];
    let backslashes = 0;
    for (let j = i - 1; text[j] === "\\"; j--) {
      backslashes++;
    }
    const escaped = backslashes % 2 === 1;

    if (char === "\"" && !escaped) {
      inString = !inString;
    }

    if (inString) continue;

    if (char === "[") depth++;
    if (char === "]") depth--;

    if (depth === 0) {
      return text.slice(start, i + 1);
    }
  }

  return null;
}

function extractFlightText(html: string) {
  const chunks: string[] = [];

  for (const match of html.matchAll(/self\.__next_f\.push\((\[[\s\S]*?\])\)<\/script>/g)) {
    try {
      const value = JSON.parse(match[1]) as unknown[];
      if (typeof value[1] === "string") {
        chunks.push(value[1]);
      }
    } catch {
      // Ignore non-data script chunks.
    }
  }

  return chunks.join("");
}

function extractAppHubPayload(html: string) {
  const flightText = extractFlightText(html);
  const appsJson = extractJsonArray(flightText, "\"initialApps\":[");
  const filterCategoriesJson = extractJsonArray(flightText, "\"filterCategories\":[");
  if (!appsJson || !filterCategoriesJson) return null;

  try {
    const apps = JSON.parse(appsJson) as AppHubProject[];
    const filterCategories = JSON.parse(filterCategoriesJson) as AppHubFilter[];
    return { apps, filterCategories };
  } catch (error) {
    console.error("Failed to parse Monad App Hub payload", error);
    return null;
  }
}

function formatLaunchDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-US", { month: "short", year: "numeric", timeZone: "UTC" }).toUpperCase();
}

function buildEcosystemData(apps: AppHubProject[], filterCategories: AppHubFilter[]): EcosystemData {
  const totalProjects = apps.length;
  const filterById = new Map(filterCategories.map((filter) => [filter.id, filter]));

  const categories = [
    ...["defi", "consumer", "ai", "tooling", "platform"].map((id) => {
      const filter = filterById.get(id) ?? FALLBACK_FILTERS.find((item) => item.id === id)!;
      const filterSet = new Set(filter.categories);
      const count = apps.filter((app) => {
        const values = id === "platform" ? app.platforms : app.categories;
        return values.some((value) => filterSet.has(value));
      }).length;

      return {
        name: filter.title,
        count,
        pct: totalProjects ? +((count / totalProjects) * 100).toFixed(1) : 0,
      };
    }),
    {
      name: "Only on Monad",
      count: apps.filter((app) => app.onlyOnMonad).length,
      pct: totalProjects ? +((apps.filter((app) => app.onlyOnMonad).length / totalProjects) * 100).toFixed(1) : 0,
    },
  ];

  const recentLaunches = [...apps]
    .filter((app) => app.firstPublishedAt)
    .sort((a, b) => Date.parse(b.firstPublishedAt) - Date.parse(a.firstPublishedAt))
    .slice(0, 3)
    .map((app) => ({
      name: app.name,
      category: app.categories[0] ?? app.platforms[0] ?? "App",
      date: formatLaunchDate(app.firstPublishedAt),
      url: app.appLink,
    }));

  return {
    totalProjects,
    categories,
    recentLaunches,
    sourceUrl: APP_HUB_URL,
    isLive: true,
  };
}

export async function getEcosystemData(): Promise<EcosystemData> {
  try {
    const res = await fetch(APP_HUB_URL, { next: { revalidate: 3600 } });
    if (!res.ok) return FALLBACK_ECOSYSTEM;

    const payload = extractAppHubPayload(await res.text());
    if (!payload || payload.apps.length === 0) return FALLBACK_ECOSYSTEM;

    return buildEcosystemData(payload.apps, payload.filterCategories);
  } catch (error) {
    console.error("Failed to fetch Monad App Hub ecosystem data", error);
    return FALLBACK_ECOSYSTEM;
  }
}
