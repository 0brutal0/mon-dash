import { getMarketData, getPriceChart, getCompetitorPrices, getMonOpenInterest } from "./coingecko";
import {
  getChainTVL,
  getProtocolsTVL,
  getFeesData,
  getDexVolume,
  getStablecoins,
  getStablecoinHistory,
  getStablecoinChanges,
} from "./defillama";
import {
  getLatestBlock,
  estimateTPS,
  getGasPrice,
  estimateDailyBurn,
  getEpoch,
  getConsensusValidatorIds,
  getSnapshotValidatorIds,
  getExecutionValidatorIds,
  getValidatorsByIds,
} from "./rpc";
import { getValidatorRegistry } from "./validators-registry";
import { getDailyTxChart, getDailyActiveAddresses, getGasOracle, getRecentTokenTransfers } from "./etherscan";
import { getMonadNews, getGeneralNews } from "./news";
import { getWormholeBridgeStats } from "./wormhole";
import { getEcosystemData } from "./ecosystem";
import { formatUSD, formatNumber, formatTokenAmount, weiToGwei } from "./format";
import * as C from "../data/constants";

export { getEcosystemData };

function getProtocolUrl(name: string, url?: string | null) {
  return url || C.URLS.protocols?.[name.toLowerCase()] || null;
}

// ─── Ticker / Header Data ────────────────────────────────────

export async function getTickerData() {
  const [market, openInterest] = await Promise.all([
    getMarketData(),
    getMonOpenInterest(),
  ]);
  if (!market) return C.PRICE_DATA;
  return {
    price: market.price,
    change24h: market.change24h,
    change30d: market.change30d,
    changeAbs: +(market.price * (market.change24h / 100)).toFixed(4),
    marketCap: formatUSD(market.marketCap),
    volume24h: formatUSD(market.volume24h),
    fdv: formatUSD(market.fdv),
    openInterest: openInterest === null ? null : formatUSD(openInterest),
  };
}

// ─── Supply Data ─────────────────────────────────────────────

export async function getSupplyData() {
  const market = await getMarketData();
  if (!market) return C.SUPPLY_DATA;
  const circPct = market.totalSupply > 0
    ? +((market.circulatingSupply / market.totalSupply) * 100).toFixed(2)
    : 0;
  return {
    totalSupply: formatNumber(market.totalSupply),
    circulatingSupply: formatNumber(market.circulatingSupply),
    circulatingPct: circPct,
    lockedStaked: C.SUPPLY_DATA.lockedStaked,
    burned: C.SUPPLY_DATA.burned,
    emissionPct: circPct,
  };
}

// ─── Price Chart Data ────────────────────────────────────────

export async function getChartData() {
  const chart = await getPriceChart(7);
  if (chart.length === 0) return null;
  return chart;
}

// ─── Network Status ──────────────────────────────────────────

export async function getNetworkData() {
  const [block, tps, gasPrice, epoch, valIds] = await Promise.all([
    getLatestBlock(),
    estimateTPS(),
    getGasPrice(),
    getEpoch(),
    getConsensusValidatorIds(),
  ]);

  return {
    blockHeight: block ? `#${formatNumber(block.blockNumber)}` : C.NETWORK_DATA.blockHeight,
    tps: tps ? formatNumber(tps) : C.NETWORK_DATA.tps,
    finality: C.NETWORK_DATA.finality,
    blockTime: C.NETWORK_DATA.blockTime,
    activeValidators: valIds.length > 0 ? valIds.length : C.NETWORK_DATA.activeValidators,
    totalValidators: C.NETWORK_DATA.totalValidators,
    parallelExecRatio: C.NETWORK_DATA.parallelExecRatio,
    gasPrice: gasPrice ? weiToGwei(gasPrice) + " gwei" : null,
    epoch: epoch?.epoch ?? C.ECONOMY_DATA.currentEpoch,
  };
}

// ─── TVL Data ────────────────────────────────────────────────

export async function getTVLData() {
  const [totalTVL, protocols] = await Promise.all([
    getChainTVL(),
    getProtocolsTVL(),
  ]);

  if (totalTVL === null && protocols.length === 0) {
    return { total: C.TVL_BREAKDOWN.total, byCategory: C.TVL_BREAKDOWN.byCategory, protocols: C.DEFI_PROTOCOLS };
  }

  const categoryColors: Record<string, string> = {
    Dexes: "#ff79c6", DEX: "#ff79c6", Dexs: "#ff79c6",
    Lending: "#8be9fd", CDP: "#8be9fd",
    "Liquid Staking": "#50fa7b", LST: "#50fa7b",
    Yield: "#f1fa8c", "Yield Aggregator": "#f1fa8c",
    Bridge: "#bd93f9",
    Derivatives: "#ff6e6e",
    Insurance: "#ffb86c",
    NFT: "#ff92df",
    Gaming: "#69ff94",
    Launchpad: "#a4ffff",
    RWA: "#e2a8ff",
    Payments: "#ffd700",
    Options: "#ff8b3d",
    Staking: "#50fa7b",
  };

  // Unique colors per protocol — cycle through palette for protocols in same category
  const PROTOCOL_PALETTE = [
    "#ff79c6", "#8be9fd", "#50fa7b", "#f1fa8c", "#bd93f9",
    "#ffb86c", "#ff92df", "#a4ffff", "#69ff94", "#ffd700",
    "#ff6e6e", "#e2a8ff", "#ff8b3d", "#87ceeb", "#dda0dd",
  ];

  const displayProtocols = protocols.length > 0 ? protocols : C.DEFI_PROTOCOLS.map((p) => ({
    name: p.name,
    category: p.category,
    tvl: parseFloat(p.tvl.replace(/[$BM]/g, "")) * (p.tvl.includes("B") ? 1e9 : 1e6),
    change7d: null,
    url: getProtocolUrl(p.name),
  }));
  const displayTotalTVL = totalTVL ?? displayProtocols.reduce((sum, p) => sum + p.tvl, 0);

  const top10 = displayProtocols.slice(0, 10);

  const mappedProtocols = top10.map((p, i) => ({
    name: p.name,
    category: p.category,
    tvl: formatUSD(p.tvl),
    pct: displayTotalTVL ? +((p.tvl / displayTotalTVL) * 100).toFixed(1) : 0,
    color: PROTOCOL_PALETTE[i % PROTOCOL_PALETTE.length],
    url: getProtocolUrl(p.name, p.url),
  }));

  const catMap = new Map<string, { name: string; value: number; color: string }>();
  for (const p of displayProtocols) {
    const cat = p.category;
    const existing = catMap.get(cat);
    const color = categoryColors[cat] ?? "#555";
    if (existing) {
      existing.value += p.tvl;
    } else {
      catMap.set(cat, { name: cat, value: p.tvl, color });
    }
  }
  const byCategory = Array.from(catMap.values())
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)
    .map((c) => ({
      name: c.name,
      value: formatUSD(c.value),
      pct: displayTotalTVL ? +((c.value / displayTotalTVL) * 100).toFixed(1) : 0,
      color: c.color,
    }));

  return {
    total: formatUSD(displayTotalTVL),
    byCategory,
    protocols: mappedProtocols,
  };
}

// ─── Fees & Revenue ──────────────────────────────────────────

export async function getFeesRevenue() {
  const [fees, dex] = await Promise.all([getFeesData(), getDexVolume()]);

  if (fees.dailyFees === null) return C.FEES_REVENUE;

  const annualizedFees = fees.dailyFees ? fees.dailyFees * 365 : null;
  const annualizedRevenue = fees.dailyRevenue ? fees.dailyRevenue * 365 : null;

  return {
    dailyFees: formatUSD(fees.dailyFees),
    dailyRevenue: formatUSD(fees.dailyRevenue),
    annualizedFees: formatUSD(annualizedFees),
    annualizedRevenue: formatUSD(annualizedRevenue),
    psRatio: C.FEES_REVENUE.psRatio,
    pfRatio: C.FEES_REVENUE.pfRatio,
    feesTrend30d: C.FEES_REVENUE.feesTrend30d,
    dexVolume24h: formatUSD(dex.dailyVolume),
    dexVolume7d: formatUSD(dex.weeklyVolume),
  };
}

// ─── Stablecoin Data ─────────────────────────────────────────

export async function getStablecoinData() {
  const [llamaData, history] = await Promise.all([
    getStablecoins(),
    getStablecoinHistory(),
  ]);

  if (llamaData.assets.length === 0) {
    return {
      ...C.STABLECOINS,
      history: [] as number[],
      assets: C.STABLECOINS.assets.map((a) => ({ ...a, change30d: null as number | null, source: "" })),
    };
  }

  // Fetch per-stablecoin 30d changes
  const assetIds = llamaData.assets.map((a) => a.id);
  const changes = await getStablecoinChanges(assetIds);
  const changeMap = new Map(changes.map((c) => [c.id, c]));

  const total = llamaData.totalCirculating;
  const assets = llamaData.assets.map((a) => {
    const change = changeMap.get(a.id);
    const source = change
      ? change.minted > 0 && change.bridged === 0 ? "Native"
      : change.bridged > 0 && change.minted === 0 ? "Bridged"
      : change.bridged > 0 && change.minted > 0 ? "Mixed"
      : ""
      : "";

    return {
      name: a.symbol,
      amount: formatUSD(a.circulating),
      pct: total > 0 ? +((a.circulating / total) * 100).toFixed(1) : 0,
      change30d: change ? +change.changePct.toFixed(2) : null,
      source,
    };
  });

  // Convert history to sparkline values (just the USD totals)
  const historyValues = history.map((h) => h.totalUSD);

  return {
    total: formatUSD(total),
    assets,
    history: historyValues,
  };
}

// ─── Stablecoin Activity (transfers) ─────────────────────────

const STABLECOIN_CONTRACTS: Record<string, { address: string; decimals: number }> = {
  USDC: { address: "0x754704Bc059F8C67012fEd69BC8A327a5aafb603", decimals: 6 },
  USDT0: { address: "0xe7cd86e13AC4309349F30B3435a9d337750fC82D", decimals: 6 },
  AUSD: { address: "0x00000000efe302beaa2b3e6e1b18d08d69a9012a", decimals: 6 },
};

export async function getStablecoinActivity() {
  const transfers = await Promise.all(
    Object.entries(STABLECOIN_CONTRACTS).map(async ([symbol, { address, decimals }]) => {
      const txs = await getRecentTokenTransfers(address, 100);
      return txs.map((tx) => ({
        ...tx,
        tokenSymbol: symbol,
        tokenDecimal: String(decimals),
      }));
    })
  );

  const allTxs = transfers.flat().sort((a, b) => parseInt(b.timeStamp) - parseInt(a.timeStamp));

  const ZERO = "0x0000000000000000000000000000000000000000";
  let totalVolume = 0;
  let mintVolume = 0;
  let burnVolume = 0;
  const transferCount = allTxs.length;
  const largeTransfers: { time: string; symbol: string; amount: string; from: string; to: string; type: string; hash: string }[] = [];

  for (const tx of allTxs) {
    const dec = parseInt(tx.tokenDecimal) || 6;
    const value = parseInt(tx.value) / Math.pow(10, dec);
    totalVolume += value;

    const isMint = tx.from === ZERO;
    const isBurn = tx.to === ZERO;
    if (isMint) mintVolume += value;
    if (isBurn) burnVolume += value;

    if (value >= 50000) {
      const date = new Date(parseInt(tx.timeStamp) * 1000);
      const timeStr = date.toISOString().slice(11, 19) + " UTC";
      largeTransfers.push({
        time: timeStr,
        symbol: tx.tokenSymbol,
        amount: formatUSD(value),
        from: tx.from.slice(0, 6) + "..." + tx.from.slice(-4),
        to: tx.to.slice(0, 6) + "..." + tx.to.slice(-4),
        type: isMint ? "Mint" : isBurn ? "Burn" : "Transfer",
        hash: tx.hash,
      });
    }
  }

  return {
    totalVolume: formatUSD(totalVolume),
    transferCount: formatNumber(transferCount),
    mintVolume: formatUSD(mintVolume),
    burnVolume: formatUSD(burnVolume),
    netMint: formatUSD(mintVolume - burnVolume),
    netMintPositive: mintVolume >= burnVolume,
    largeTransfers: largeTransfers.slice(0, 6),
  };
}

// ─── News Feed ───────────────────────────────────────────────

const SOURCE_COLORS: Record<string, string> = {
  CoinDesk: "text-cyan",
  "The Block": "text-cyan",
  CoinTelegraph: "text-amber",
  Decrypt: "text-green",
  "Bitcoin.com": "text-amber",
};

function mapNews(items: { time: string; title: string; source: string; url: string }[]) {
  return items.map((n) => ({
    time: n.time,
    title: n.title,
    source: n.source,
    sourceColor: SOURCE_COLORS[n.source] ?? "",
    url: n.url,
  }));
}

export async function getNewsFeed() {
  const news = await getGeneralNews(15);
  if (news.length === 0) {
    return C.NEWS_ITEMS.map((n) => ({ ...n, url: "#" }));
  }
  return mapNews(news);
}

export async function getMonadNewsFeed() {
  const news = await getMonadNews(15);
  if (news.length === 0) {
    return C.NEWS_ITEMS.map((n) => ({ ...n, url: "#" }));
  }
  return mapNews(news);
}

// ─── Competitors ─────────────────────────────────────────────

export async function getCompetitorsData() {
  const [monMarket, competitors] = await Promise.all([
    getMarketData(),
    getCompetitorPrices(),
  ]);

  if (!monMarket || Object.keys(competitors).length === 0) return C.COMPETITORS;

  const sol = competitors["solana"];
  const sui = competitors["sui"];
  const apt = competitors["aptos"];

  return {
    metrics: ["Market Cap", "24h Volume", "TPS", "Finality", "Staking APY", "TVL"],
    chains: [
      {
        name: "Monad",
        values: [formatUSD(monMarket.marketCap), formatUSD(monMarket.volume24h), "10,000", "1s", "12.8%", "$279M"],
        highlight: true,
      },
      {
        name: "Solana",
        values: [sol ? formatUSD(sol.marketCap) : "—", sol ? formatUSD(sol.volume24h) : "—", "4,000", "0.4s", "7.2%", "$8.2B"],
        highlight: false,
      },
      {
        name: "Sui",
        values: [sui ? formatUSD(sui.marketCap) : "—", sui ? formatUSD(sui.volume24h) : "—", "2,500", "0.5s", "3.8%", "$1.4B"],
        highlight: false,
      },
      {
        name: "Aptos",
        values: [apt ? formatUSD(apt.marketCap) : "—", apt ? formatUSD(apt.volume24h) : "—", "1,600", "0.9s", "7.0%", "$890M"],
        highlight: false,
      },
    ],
  };
}

// ─── Validators ──────────────────────────────────────────────

export async function getValidatorsData() {
  const [consensusIds, snapshotIds, executionIds, epoch, registry] = await Promise.all([
    getConsensusValidatorIds(),
    getSnapshotValidatorIds(),
    getExecutionValidatorIds(),
    getEpoch(),
    getValidatorRegistry(),
  ]);

  const consensusSet = new Set(consensusIds);
  const snapshotSet = new Set(snapshotIds);
  const allIds = Array.from(new Set([...consensusIds, ...snapshotIds, ...executionIds]));

  if (allIds.length === 0) {
    return { validators: C.VALIDATORS, meta: C.VALIDATOR_META };
  }

  const details = await getValidatorsByIds(allIds);
  details.sort((a, b) => (b.stake > a.stake ? 1 : b.stake < a.stake ? -1 : 0));

  // Nakamoto coefficient + top-10 share computed over the ACTIVE consensus set only
  const consensusByStake = details
    .filter((v) => consensusSet.has(v.id))
    .sort((a, b) => (b.stake > a.stake ? 1 : b.stake < a.stake ? -1 : 0));
  const consensusTotal = consensusByStake.reduce((s, v) => s + v.stake, BigInt(0));
  const nakamoto = (() => {
    if (consensusTotal === BigInt(0)) return C.VALIDATOR_META.nakamotoCoefficient;
    const threshold = consensusTotal / BigInt(3); // > 1/3 breaks BFT
    let running = BigInt(0);
    for (let i = 0; i < consensusByStake.length; i++) {
      running += consensusByStake[i].stake;
      if (running > threshold) return i + 1;
    }
    return consensusByStake.length;
  })();
  const top10StakePct = consensusTotal > BigInt(0)
    ? +(Number(consensusByStake.slice(0, 10).reduce((s, v) => s + v.stake, BigInt(0))) /
        Number(consensusTotal) * 100).toFixed(1)
    : C.VALIDATOR_META.top10StakePct;

  const validators = details.map((v, i) => {
    const addr = v.authAddress;
    const shortAddr = addr.slice(0, 6) + "..." + addr.slice(-3);
    const meta = registry.get(v.id);
    const name = meta?.name ?? C.VALIDATORS[i]?.name ?? shortAddr;
    const stakeMON = Number(v.stake) / 1e18;
    const commPct = Number(v.commission) / 1e16; // commission stored as fraction of 1e18
    const sharePct = consensusTotal > BigInt(0) && consensusSet.has(v.id)
      ? +(Number(v.stake) / Number(consensusTotal) * 100).toFixed(2)
      : 0;
    const status = consensusSet.has(v.id)
      ? "ACTIVE"
      : snapshotSet.has(v.id)
      ? "SNAPSHOT"
      : "ELIGIBLE";

    return {
      rank: String(i + 1).padStart(2, "0"),
      name,
      addr: shortAddr,
      fullAddr: addr,
      stake: formatTokenAmount(stakeMON),
      sharePct,
      status,
      website: meta?.website ?? null,
      xUrl: meta?.x ?? null,
      comm: commPct.toFixed(0) + "%",
    };
  });

  return {
    validators,
    meta: {
      nakamotoCoefficient: nakamoto,
      epochEnds: C.VALIDATOR_META.epochEnds,
      top10StakePct,
      currentEpoch: epoch?.epoch ?? C.ECONOMY_DATA.currentEpoch,
    },
  };
}

// ─── Supply Pressure (Burn Rate) ─────────────────────────────

export async function getSupplyPressureData() {
  const burn = await estimateDailyBurn();

  if (!burn) return C.SUPPLY_PRESSURE;

  // Block reward: 25 MON/block, 216,000 blocks/day = 5,400,000 MON/day emission
  const dailyEmission = 25 * 216000;
  const netEmissionDaily = dailyEmission - burn.dailyBurnMON;

  return {
    ...C.SUPPLY_PRESSURE,
    dailyBurnRate: formatTokenAmount(burn.dailyBurnMON) + " MON",
    netEmissionDaily: (netEmissionDaily >= 0 ? "+" : "") + formatTokenAmount(Math.abs(netEmissionDaily)) + " MON",
  };
}

// ─── Transaction Activity ────────────────────────────────────

export async function getTxActivityData() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const startDate = thirtyDaysAgo.toISOString().slice(0, 10);
  const endDate = now.toISOString().slice(0, 10);

  const [txChart, addressChart] = await Promise.all([
    getDailyTxChart(startDate, endDate),
    getDailyActiveAddresses(startDate, endDate),
  ]);

  if (txChart.length === 0) return C.TX_ACTIVITY;

  const latestTx = txChart[txChart.length - 1];
  const prevTx = txChart.length > 7 ? txChart[txChart.length - 8] : null;
  const growth = prevTx && prevTx.txCount > 0
    ? +(((latestTx.txCount - prevTx.txCount) / prevTx.txCount) * 100).toFixed(1)
    : null;

  const latestAddr = addressChart.length > 0 ? addressChart[addressChart.length - 1] : null;

  // Normalize bars to percentages
  const maxTx = Math.max(...txChart.map((t) => t.txCount));
  const txBars = txChart.map((t) => Math.round((t.txCount / maxTx) * 100));
  const txValues = txChart.map((t) => formatNumber(t.txCount));

  return {
    dailyTx: formatNumber(latestTx.txCount),
    dailyTxGrowth: growth !== null ? (growth >= 0 ? "+" : "") + growth + "%" : C.TX_ACTIVITY.dailyTxGrowth,
    gasUsed: C.TX_ACTIVITY.gasUsed, // would need per-block aggregation
    avgGasPrice: C.TX_ACTIVITY.avgGasPrice,
    activeAddrsDaily: latestAddr ? formatNumber(latestAddr.count) : C.TX_ACTIVITY.activeAddrsDaily,
    activeAddrsMonthly: C.TX_ACTIVITY.activeAddrsMonthly,
    newAddrsDaily: C.TX_ACTIVITY.newAddrsDaily,
    txBars30d: txBars.length > 0 ? txBars.slice(-30) : C.TX_ACTIVITY.txBars30d,
    txValues30d: txValues.length > 0 ? txValues.slice(-30) : C.TX_ACTIVITY.txValues30d,
  };
}

// ─── Bridge Flows ────────────────────────────────────────────

export async function getBridgeFlowsData() {
  const stats = await getWormholeBridgeStats();
  if (!stats || stats.byChain.length === 0) return C.BRIDGE_FLOWS;

  const maxVol = Math.max(...stats.byChain.map((c) => c.volume));

  return {
    netFlow7d: formatUSD(stats.totalVolume),
    netFlowDirection: "in" as const,
    byChain: stats.byChain.slice(0, 4).map((c) => ({
      name: c.sourceChain,
      volume: formatUSD(c.volume),
      flow: "in" as const,
      pct: maxVol > 0 ? Math.round((c.volume / maxVol) * 100) : 0,
    })),
    byProvider: C.BRIDGE_FLOWS.byProvider, // Wormhole only gives us Wormhole data
  };
}

// ─── Economy (with live epoch) ───────────────────────────────

export async function getEconomyData() {
  const [epoch, burn] = await Promise.all([
    getEpoch(),
    estimateDailyBurn(),
  ]);

  const dailyEmission = 25 * 216000;
  const netEmission = burn
    ? formatTokenAmount(Math.abs(dailyEmission - burn.dailyBurnMON)) + " MON/yr"
    : C.ECONOMY_DATA.netEmission;

  return {
    ...C.ECONOMY_DATA,
    currentEpoch: epoch?.epoch ?? C.ECONOMY_DATA.currentEpoch,
    netEmission,
  };
}

// ─── Gas Oracle ──────────────────────────────────────────────

export async function getGasData() {
  const oracle = await getGasOracle();
  if (!oracle) return null;
  return oracle;
}
