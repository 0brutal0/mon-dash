const API_KEY = process.env.ETHERSCAN_API_KEY ?? "";
const BASE = "https://api.etherscan.io/v2/api";

interface EtherscanResponse {
  status: string;
  result: unknown;
}

async function etherscanCall(
  module: string,
  action: string,
  params: Record<string, string> = {}
): Promise<unknown> {
  const searchParams = new URLSearchParams({
    chainid: "143",
    module,
    action,
    apikey: API_KEY,
    ...params,
  });
  try {
    const res = await fetch(`${BASE}?${searchParams}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data: EtherscanResponse = await res.json();
    return data.status === "1" ? data.result : null;
  } catch {
    return null;
  }
}

// ─── Transaction Count for an Address ────────────────────────

export async function getTxCount(address: string): Promise<number | null> {
  const result = await etherscanCall("proxy", "eth_getTransactionCount", {
    address,
    tag: "latest",
  });
  return result ? parseInt(result as string, 16) : null;
}

// ─── Daily Transaction Count ─────────────────────────────────

export interface DailyTxCount {
  date: string;
  txCount: number;
}

export async function getDailyTxChart(
  startDate: string,
  endDate: string
): Promise<DailyTxCount[]> {
  const result = await etherscanCall("stats", "dailytx", {
    startdate: startDate,
    enddate: endDate,
    sort: "asc",
  });
  if (!Array.isArray(result)) return [];
  return result.map((item: { UTCDate: string; transactionCount: string }) => ({
    date: item.UTCDate,
    txCount: parseInt(item.transactionCount, 10),
  }));
}

// ─── Daily Active Addresses ──────────────────────────────────

export async function getDailyActiveAddresses(
  startDate: string,
  endDate: string
): Promise<{ date: string; count: number }[]> {
  const result = await etherscanCall("stats", "dailyactiveaddress", {
    startdate: startDate,
    enddate: endDate,
    sort: "asc",
  });
  if (!Array.isArray(result)) return [];
  return result.map((item: { UTCDate: string; activeAddresses: string }) => ({
    date: item.UTCDate,
    count: parseInt(item.activeAddresses, 10),
  }));
}

// ─── MON Supply ──────────────────────────────────────────────

export async function getMonSupply(): Promise<string | null> {
  const result = await etherscanCall("stats", "ethsupply");
  return typeof result === "string" ? result : null;
}

// ─── Gas Oracle ──────────────────────────────────────────────

export interface GasOracle {
  safeGasPrice: string;
  proposeGasPrice: string;
  fastGasPrice: string;
}

export async function getGasOracle(): Promise<GasOracle | null> {
  const result = await etherscanCall("gastracker", "gasoracle");
  if (!result || typeof result !== "object") return null;
  return result as GasOracle;
}

// ─── Token Transfers ────────────────────────────────────────

export interface TokenTransfer {
  hash: string;
  from: string;
  to: string;
  value: string;
  tokenSymbol: string;
  tokenDecimal: string;
  timeStamp: string;
}

export async function getRecentTokenTransfers(
  contractAddress: string,
  limit: number = 100
): Promise<TokenTransfer[]> {
  const result = await etherscanCall("account", "tokentx", {
    contractaddress: contractAddress,
    page: "1",
    offset: String(limit),
    sort: "desc",
  });
  if (!Array.isArray(result)) return [];
  return result as TokenTransfer[];
}
