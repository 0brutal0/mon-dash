// ─── External URLs ────────────────────────────────────────────
export const URLS = {
  coingecko: "https://www.coingecko.com/en/coins/monad",
  monadscan: "https://monadscan.com",
  monadscanBlock: (n: string) => `https://monadscan.com/block/${n.replace(/[#,]/g, "")}`,
  monadscanAddr: (addr: string) => `https://monadscan.com/address/${addr}`,
  monadscanToken: (addr: string) => `https://monadscan.com/token/${addr}`,
  protocols: {
    "uniswap": "https://app.uniswap.org",
    "uniswap v3": "https://app.uniswap.org",
    "curve": "https://curve.fi",
    "curve finance": "https://curve.fi",
    "curve dex": "https://curve.fi",
    "morpho": "https://morpho.org",
    "kintsu": "https://kintsu.xyz",
    "euler": "https://euler.finance",
    "euler finance": "https://euler.finance",
    "ambient": "https://ambient.finance",
    "ambient finance": "https://ambient.finance",
    "curvance": "https://curvance.com",
    "kuru": "https://kuru.io",
    "aave v3": "https://aave.com",
    "aave": "https://aave.com",
    "upshift": "https://upshift.finance",
    "steakhouse": "https://www.steakhouse.financial/",
    "steakhouse finance": "https://www.steakhouse.financial/",
    "steakhouse financial": "https://www.steakhouse.financial/",
  } as Record<string, string>,
  bridges: {
    Wormhole: "https://portalbridge.com",
    LayerZero: "https://layerzero.network",
    Orbiter: "https://orbiter.finance",
    deBridge: "https://debridge.finance",
  } as Record<string, string>,
  competitors: {
    Solana: "https://www.coingecko.com/en/coins/solana",
    Sui: "https://www.coingecko.com/en/coins/sui",
    Aptos: "https://www.coingecko.com/en/coins/aptos",
  } as Record<string, string>,
  stablecoins: {
    USDC: "0x754704Bc059F8C67012fEd69BC8A327a5aafb603",
    USDT: "0xe7cd86e13AC4309349F30B3435a9d337750fC82D",
  } as Record<string, string>,
  funding: {
    seriesA: "https://www.coindesk.com/business/2024/04/09/blockchain-developer-monad-labs-raises-225m-led-by-paradigm",
    seed: "https://www.coindesk.com/business/2023/02/14/crypto-startup-monad-labs-aims-to-create-next-ethereum-killer-after-raising-19m",
  },
};

// ─── Price & Market ───────────────────────────────────────────
export const PRICE_DATA = {
  price: 1.42,
  change24h: 5.24,
  changeAbs: 0.07,
  marketCap: "$14.2B",
  volume24h: "$1.8B",
  fdv: "$142B",
};

// ─── Supply ──────────────────────────────────────────────────
export const SUPPLY_DATA = {
  totalSupply: "100,000,000,000",
  circulatingSupply: "10,830,000,000",
  circulatingPct: 10.83,
  lockedStaked: "4,200,000,000",
  burned: "450,000,000",
  emissionPct: 10.83,
};

// ─── Staking ─────────────────────────────────────────────────
export const STAKING_DATA = {
  apy: 12.8,
  totalValueStaked: "$4.2B",
  activeNodes: "1,240",
  minDelegation: "10 MON",
  unbondingPeriod: "5.5h",
  delegationFlow7d: "+12.4M",
  aprHistory30d: [
    10.9, 11.1, 11.0, 11.2, 11.4, 11.3, 11.5, 11.7, 11.6, 11.8,
    11.9, 11.7, 12.0, 12.1, 11.9, 12.2, 12.3, 12.1, 12.4, 12.5,
    12.3, 12.4, 12.6, 12.5, 12.7, 12.6, 12.8, 12.7, 12.9, 12.8,
  ],
};

// ─── Economy ─────────────────────────────────────────────────
export const ECONOMY_DATA = {
  inflationRate: 3.8,
  burnRate24h: "450M MON",
  currentEpoch: 492,
  epochProgress: 68,
  epochRemaining: "1h 46m",
  blockReward: "25 MON",
  annualEmission: "~2B MON",
  netEmission: "+1.55B MON/yr",
};

// ─── Volume ──────────────────────────────────────────────────
export const VOLUME_DATA = {
  avgDailyVol: "$1.82B",
  dailyBars30d: [
    42, 48, 45, 51, 56, 52, 60, 58, 63, 67,
    61, 65, 72, 69, 74, 71, 78, 82, 76, 80,
    85, 88, 84, 91, 95, 89, 93, 100, 96, 98,
  ],
};

// ─── Network ─────────────────────────────────────────────────
export const NETWORK_DATA = {
  blockHeight: "#84,921,044",
  tps: "10,000",
  finality: "1s",
  blockTime: "0.4s",
  activeValidators: 1240,
  totalValidators: 250,
  parallelExecRatio: 78,
};

// ─── Validators ──────────────────────────────────────────────
export const VALIDATORS = [
  { rank: "01", name: "P2P.org", addr: "0x9C...4D1", stake: "18.5M", sharePct: 14.2, status: "ACTIVE", comm: "3%" },
  { rank: "02", name: "Figment", addr: "0x8A...9F2", stake: "14.2M", sharePct: 10.9, status: "ACTIVE", comm: "5%" },
  { rank: "03", name: "ChorusOne", addr: "0x2B...1A4", stake: "12.8M", sharePct: 9.8, status: "ACTIVE", comm: "5%" },
  { rank: "04", name: "Everstake", addr: "0x3D...7B2", stake: "11.4M", sharePct: 8.7, status: "ACTIVE", comm: "4%" },
  { rank: "05", name: "Imperator", addr: "0x1F...8E3", stake: "9.1M", sharePct: 7.0, status: "ACTIVE", comm: "4%" },
  { rank: "06", name: "Kiln", addr: "0x5E...2B9", stake: "8.9M", sharePct: 6.8, status: "ACTIVE", comm: "5%" },
  { rank: "07", name: "Nansen", addr: "0x7A...3C8", stake: "7.6M", sharePct: 5.8, status: "ACTIVE", comm: "5%" },
  { rank: "08", name: "Stakin", addr: "0x4B...6D5", stake: "6.8M", sharePct: 5.2, status: "ACTIVE", comm: "6%" },
  { rank: "09", name: "Blockdaemon", addr: "0x6F...1A9", stake: "6.2M", sharePct: 4.8, status: "ACTIVE", comm: "5%" },
  { rank: "10", name: "Coinbase Cloud", addr: "0x2C...8F4", stake: "5.5M", sharePct: 4.2, status: "ACTIVE", comm: "8%" },
];

export const VALIDATOR_META = {
  nakamotoCoefficient: 7,
  epochEnds: "1h 46m",
  top10StakePct: 42.6,
  currentEpoch: 0,
};

// ─── DeFi Protocols ──────────────────────────────────────────
export const DEFI_PROTOCOLS = [
  { name: "Uniswap", category: "DEX", tvl: "$68M", pct: 24.4, color: "#ff79c6" },
  { name: "Curve", category: "DEX", tvl: "$52M", pct: 18.6, color: "#ff92df" },
  { name: "Morpho", category: "Lending", tvl: "$45M", pct: 16.1, color: "#8be9fd" },
  { name: "Kintsu", category: "LST", tvl: "$32M", pct: 11.5, color: "#50fa7b" },
  { name: "Euler", category: "Lending", tvl: "$24M", pct: 8.6, color: "#a4ffff" },
  { name: "Ambient", category: "DEX", tvl: "$18M", pct: 6.5, color: "#bd93f9" },
  { name: "Curvance", category: "Yield", tvl: "$14M", pct: 5.0, color: "#f1fa8c" },
  { name: "Kuru", category: "DEX", tvl: "$11M", pct: 3.9, color: "#ffb86c" },
  { name: "Aave v3", category: "Lending", tvl: "$9M", pct: 3.2, color: "#69ff94" },
  { name: "Upshift", category: "Yield", tvl: "$6M", pct: 2.2, color: "#ffd700" },
];

// ─── TVL Breakdown ───────────────────────────────────────────
export const TVL_BREAKDOWN = {
  total: "$279M",
  byCategory: [
    { name: "DEX", value: "$149M", pct: 53.4, color: "#ff79c6" },
    { name: "Lending", value: "$78M", pct: 27.9, color: "#8be9fd" },
    { name: "LST", value: "$32M", pct: 11.5, color: "#50fa7b" },
    { name: "Yield", value: "$20M", pct: 7.2, color: "#f1fa8c" },
  ],
};

// ─── Fees & Revenue ──────────────────────────────────────────
export const FEES_REVENUE = {
  dailyFees: "$54K",
  annualizedFees: "$19.7M",
  psRatio: "363x",
  pfRatio: "156x",
  feesTrend30d: [
    31, 34, 32, 38, 41, 39, 45, 43, 48, 46,
    52, 49, 55, 58, 54, 61, 63, 59, 65, 62,
    68, 66, 71, 69, 73, 70, 76, 74, 79, 77,
  ],
};

// ─── Supply Pressure ─────────────────────────────────────────
export const SUPPLY_PRESSURE = {
  nextUnlockDate: "NOV 24, 2026",
  nextUnlockAmount: "2.7B MON",
  nextUnlockPctCirc: "24.9%",
  nextUnlockCategory: "Team & Investors (Year 1 cliff)",
  dailyBurnRate: "1.23M MON",
  netEmissionDaily: "+4.17M MON",
  stakingRatio: "42.0%",
  stakingRatioTrend: "▲ +1.2%",
  exchangeInflow: "24.5M MON",
  exchangeOutflow: "31.2M MON",
  exchangeNetFlow: "-6.7M MON",
  deflationaryBreakevenTps: "~28,000 TPS",
};

// ─── Stablecoins ─────────────────────────────────────────────
export const STABLECOINS = {
  total: "$82.4M",
  assets: [
    { name: "USDC", amount: "$52.1M", pct: 63.2, flow: "in" as const },
    { name: "USDT", amount: "$21.8M", pct: 26.5, flow: "in" as const },
    { name: "DAI", amount: "$5.8M", pct: 7.0, flow: "out" as const },
    { name: "FRAX", amount: "$2.7M", pct: 3.3, flow: "neutral" as const },
  ],
};

// ─── Bridge Flows ────────────────────────────────────────────
export const BRIDGE_FLOWS = {
  netFlow7d: "+$18.2M",
  netFlowDirection: "in" as const,
  byChain: [
    { name: "Ethereum", volume: "$42.1M", flow: "in" as const, pct: 58 },
    { name: "Base", volume: "$14.8M", flow: "in" as const, pct: 20 },
    { name: "Solana", volume: "$8.2M", flow: "out" as const, pct: 11 },
    { name: "Arbitrum", volume: "$7.5M", flow: "in" as const, pct: 10 },
  ],
  byProvider: [
    { name: "Wormhole", volume: "$34.2M", pct: 47 },
    { name: "LayerZero", volume: "$22.1M", pct: 30 },
    { name: "Orbiter", volume: "$10.8M", pct: 15 },
    { name: "deBridge", volume: "$5.5M", pct: 8 },
  ],
};

// ─── Transaction Activity ────────────────────────────────────
export const TX_ACTIVITY = {
  dailyTx: "2.4M",
  dailyTxGrowth: "+8.2%",
  gasUsed: "84.2B",
  avgGasPrice: "0.012 gwei",
  activeAddrsDaily: "142K",
  activeAddrsMonthly: "1.2M",
  newAddrsDaily: "18.4K",
  txBars30d: [
    44, 48, 46, 52, 50, 56, 54, 61, 58, 63,
    66, 62, 69, 72, 68, 75, 78, 74, 81, 83,
    79, 86, 88, 84, 91, 93, 89, 96, 94, 100,
  ],
  txValues30d: [
    "1.1M", "1.2M", "1.2M", "1.3M", "1.3M", "1.4M", "1.3M", "1.5M", "1.4M", "1.5M",
    "1.6M", "1.5M", "1.7M", "1.7M", "1.6M", "1.8M", "1.9M", "1.8M", "1.9M", "2.0M",
    "1.9M", "2.1M", "2.1M", "2.0M", "2.2M", "2.2M", "2.1M", "2.3M", "2.3M", "2.4M",
  ],
};

// ─── Ecosystem ───────────────────────────────────────────────
export const ECOSYSTEM = {
  totalProjects: 300,
  categories: [
    { name: "DeFi", count: 82, pct: 27 },
    { name: "Gaming", count: 64, pct: 21 },
    { name: "Infra", count: 58, pct: 19 },
    { name: "Social", count: 48, pct: 16 },
    { name: "AI", count: 28, pct: 9 },
    { name: "Other", count: 20, pct: 7 },
  ],
  recentLaunches: [
    { name: "Aave v3", category: "Lending", date: "MAR 2026" },
    { name: "Chainlink CCIP", category: "Infra", date: "FEB 2026" },
    { name: "Zero Hash", category: "Payments", date: "FEB 2026" },
  ],
};

// ─── Competitors ─────────────────────────────────────────────
export const COMPETITORS = {
  metrics: ["TPS", "Finality", "TVL", "Daily Fees", "Staking APY", "Market Cap"],
  chains: [
    { name: "Monad", values: ["10,000", "1s", "$279M", "$54K", "12.8%", "$14.2B"], highlight: true },
    { name: "Solana", values: ["4,000", "0.4s", "$8.2B", "$2.1M", "7.2%", "$82B"], highlight: false },
    { name: "Sui", values: ["2,500", "0.5s", "$1.4B", "$180K", "3.8%", "$12B"], highlight: false },
    { name: "Aptos", values: ["1,600", "0.9s", "$890M", "$42K", "7.0%", "$4.8B"], highlight: false },
  ],
};

// ─── Funding ─────────────────────────────────────────────────
export const FUNDING = {
  totalRaised: "$244M",
  valuation: "$3B",
  rounds: [
    { name: "Series A", amount: "$225M", lead: "Paradigm" },
    { name: "Seed", amount: "$10M", lead: "Dragonfly" },
    { name: "Pre-seed", amount: "$9M", lead: "—" },
  ],
  backers: ["Paradigm", "Dragonfly", "Coinbase Ventures", "Electric Capital", "Jump Crypto", "Greenoaks"],
};

// ─── Unlock / Vesting Schedule ───────────────────────────────
export const UNLOCK_SCHEDULE = {
  nextUnlock: { date: "NOV 24, 2026", label: "Year 1 Cliff" },
  allocations: [
    { label: "Foundation", pct: 38.5, amount: "38.5B", barWidth: 100, barLeft: 0, color: "#50fa7b", lockNote: "Ecosystem — mostly uncommitted" },
    { label: "Team", pct: 27.0, amount: "27B", barWidth: 60, barLeft: 25, color: "#ff79c6", lockNote: "1yr cliff, 3-4yr vest" },
    { label: "Investors", pct: 19.7, amount: "19.7B", barWidth: 50, barLeft: 25, color: "#8be9fd", lockNote: "1yr cliff, 3-4yr vest" },
    { label: "Public Sale", pct: 7.5, amount: "7.5B", barWidth: 15, barLeft: 0, color: "#f1fa8c", lockNote: "Unlocked at TGE" },
    { label: "Airdrop", pct: 3.3, amount: "3.3B", barWidth: 10, barLeft: 0, color: "#e0e0e0", lockNote: "Unlocked at TGE" },
  ],
};

// ─── Liquid Staking ──────────────────────────────────────────
export const LIQUID_STAKING = {
  total: "2.1B MON",
  providers: [
    { token: "sMON", provider: "Kintsu", share: 50.0, tvl: "$1.05B", apr: 13.2, peg: 1.002 },
    { token: "aprMON", provider: "aPriori", share: 24.8, tvl: "$520M", apr: 12.9, peg: 0.998 },
    { token: "gMON", provider: "Magma", share: 18.1, tvl: "$380M", apr: 13.5, peg: 1.001 },
    { token: "mMON", provider: "Monad Native", share: 7.1, tvl: "$149M", apr: 12.4, peg: 1.000 },
  ],
};

// ─── News / Alerts ───────────────────────────────────────────
export const NEWS_ITEMS = [
  { time: "14:02:45 UTC", title: "Large transfer detected: 500,000 MON moved to Binance.", source: "Whale Alert", sourceColor: "text-amber" },
  { time: "13:45:12 UTC", title: "New governance proposal #42 passed with 89% consensus.", source: "Network Protocol", sourceColor: "text-green" },
  { time: "12:30:00 UTC", title: "Epoch 491 concluded successfully. Rewards distributed.", source: "System", sourceColor: "" },
  { time: "11:15:22 UTC", title: "Minor latency spike detected in US-East validator cluster.", source: "Infra Monitor", sourceColor: "text-red" },
  { time: "09:00:05 UTC", title: "Daily network report generated. Total active wallets up 2.4%.", source: "Analytics", sourceColor: "" },
  { time: "08:22:10 UTC", title: "Integration announced with major hardware wallet provider.", source: "PR Feed", sourceColor: "" },
  { time: "07:14:55 UTC", title: "Warning: Phishing domains detected mimicking official DEX.", source: "Security", sourceColor: "text-amber" },
  { time: "06:45:30 UTC", title: "Aave v3 deployment approved with $15M incentive package.", source: "Governance", sourceColor: "text-green" },
  { time: "05:12:18 UTC", title: "Chainlink CCIP now live — cbBTC bridging from Base enabled.", source: "Infra", sourceColor: "text-cyan" },
];
