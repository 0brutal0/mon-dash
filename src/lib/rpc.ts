const RPC_URL = "https://rpc.monad.xyz";
const STAKING_PRECOMPILE = "0x0000000000000000000000000000000000001000";

async function rpcCall(method: string, params: unknown[] = [], revalidate = 15): Promise<unknown> {
  const res = await fetch(RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    next: { revalidate },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.result ?? null;
}

// ─── Block Data ──────────────────────────────────────────────

export interface BlockData {
  blockNumber: number;
  baseFeePerGas: bigint;
  gasUsed: bigint;
  timestamp: number;
  txCount: number;
}

export async function getLatestBlock(): Promise<BlockData | null> {
  try {
    const block = (await rpcCall("eth_getBlockByNumber", ["latest", false])) as {
      number: string;
      baseFeePerGas: string;
      gasUsed: string;
      timestamp: string;
      transactions: string[];
    } | null;
    if (!block) return null;
    return {
      blockNumber: parseInt(block.number, 16),
      baseFeePerGas: BigInt(block.baseFeePerGas || "0"),
      gasUsed: BigInt(block.gasUsed || "0"),
      timestamp: parseInt(block.timestamp, 16),
      txCount: block.transactions?.length ?? 0,
    };
  } catch {
    return null;
  }
}

export async function getBlockByNumber(blockNum: string): Promise<BlockData | null> {
  try {
    const block = (await rpcCall("eth_getBlockByNumber", [blockNum, false], 30)) as {
      number: string;
      baseFeePerGas: string;
      gasUsed: string;
      timestamp: string;
      transactions: string[];
    } | null;
    if (!block) return null;
    return {
      blockNumber: parseInt(block.number, 16),
      baseFeePerGas: BigInt(block.baseFeePerGas || "0"),
      gasUsed: BigInt(block.gasUsed || "0"),
      timestamp: parseInt(block.timestamp, 16),
      txCount: block.transactions?.length ?? 0,
    };
  } catch {
    return null;
  }
}

export async function getBlockNumber(): Promise<number | null> {
  try {
    const result = (await rpcCall("eth_blockNumber")) as string | null;
    return result ? parseInt(result, 16) : null;
  } catch {
    return null;
  }
}

// ─── Gas Price ───────────────────────────────────────────────

export async function getGasPrice(): Promise<bigint | null> {
  try {
    const result = (await rpcCall("eth_gasPrice")) as string | null;
    return result ? BigInt(result) : null;
  } catch {
    return null;
  }
}

// ─── TPS Estimation ──────────────────────────────────────────

export async function estimateTPS(): Promise<number | null> {
  try {
    const latest = await getLatestBlock();
    if (!latest) return null;
    const tps = Math.round(latest.txCount / 0.4);
    return tps;
  } catch {
    return null;
  }
}

// ─── Burn Rate (from recent blocks) ─────────────────────────

export async function estimateDailyBurn(): Promise<{ dailyBurnMON: number; perBlockBurn: number } | null> {
  try {
    const latest = await getLatestBlock();
    if (!latest) return null;

    // Sample 5 recent blocks to get average burn
    const sampleCount = 5;
    const burns: number[] = [];
    for (let i = 0; i < sampleCount; i++) {
      const blockHex = "0x" + (latest.blockNumber - i).toString(16);
      const block = await getBlockByNumber(blockHex);
      if (block) {
        // Burn = baseFeePerGas * gasUsed (in wei)
        const burnWei = block.baseFeePerGas * block.gasUsed;
        const burnMON = Number(burnWei) / 1e18;
        burns.push(burnMON);
      }
    }
    if (burns.length === 0) return null;

    const avgBurnPerBlock = burns.reduce((a, b) => a + b, 0) / burns.length;
    // Blocks per day: 86400 / 0.4 = 216,000
    const blocksPerDay = 216000;
    const dailyBurnMON = avgBurnPerBlock * blocksPerDay;

    return { dailyBurnMON, perBlockBurn: avgBurnPerBlock };
  } catch {
    return null;
  }
}

// ─── Staking Precompile ──────────────────────────────────────

// ABI selectors from the verified contract
const SELECTORS = {
  getEpoch: "0x757991a8",
  getConsensusValidatorSet: "0xfb29b729",
  getValidator: "0x2b6d639a",
};

function encodeUint32(n: number): string {
  return n.toString(16).padStart(64, "0");
}

function encodeUint64(n: number): string {
  return n.toString(16).padStart(64, "0");
}

async function stakingCall(data: string): Promise<string | null> {
  try {
    const result = (await rpcCall("eth_call", [
      { to: STAKING_PRECOMPILE, data },
      "latest",
    ], 30)) as string | null;
    return result;
  } catch {
    return null;
  }
}

// ─── Get Epoch ───────────────────────────────────────────────

export interface EpochInfo {
  epoch: number;
  inDelayPeriod: boolean;
}

export async function getEpoch(): Promise<EpochInfo | null> {
  try {
    const result = await stakingCall(SELECTORS.getEpoch);
    if (!result || result === "0x" || result.length < 130) return null;
    // Returns (uint64 epoch, bool inEpochDelayPeriod)
    const hex = result.slice(2);
    const epoch = parseInt(hex.slice(0, 64), 16);
    const inDelayPeriod = parseInt(hex.slice(64, 128), 16) !== 0;
    return { epoch, inDelayPeriod };
  } catch {
    return null;
  }
}

// ─── Get Consensus Validator Set (paginated) ─────────────────

export async function getConsensusValidatorIds(): Promise<number[]> {
  const allIds: number[] = [];
  let startIndex = 0;
  let isDone = false;

  try {
    while (!isDone) {
      const calldata = SELECTORS.getConsensusValidatorSet + encodeUint32(startIndex);
      const result = await stakingCall(calldata);
      if (!result || result === "0x" || result.length < 130) break;

      const hex = result.slice(2);
      // Returns (bool isDone, uint32 nextIndex, uint64[] valIds)
      isDone = parseInt(hex.slice(0, 64), 16) !== 0;
      const nextIndex = parseInt(hex.slice(64, 128), 16);

      // Decode dynamic array: offset at position 2, then length, then elements
      const arrayOffset = parseInt(hex.slice(128, 192), 16) * 2;
      const arrayStart = arrayOffset;
      if (arrayStart >= hex.length) break;
      const arrayLength = parseInt(hex.slice(arrayStart, arrayStart + 64), 16);

      for (let i = 0; i < arrayLength; i++) {
        const elemStart = arrayStart + 64 + i * 64;
        if (elemStart + 64 > hex.length) break;
        const valId = parseInt(hex.slice(elemStart, elemStart + 64), 16);
        allIds.push(valId);
      }

      startIndex = nextIndex;
      // Safety: prevent infinite loop
      if (allIds.length > 500) break;
    }
  } catch {
    // Return what we have
  }

  return allIds;
}

// ─── Get Validator Details ───────────────────────────────────

export interface ValidatorDetails {
  id: number;
  authAddress: string;
  stake: bigint;
  commission: bigint; // in basis points or raw
  consensusStake: bigint;
}

export async function getValidatorDetails(validatorId: number): Promise<ValidatorDetails | null> {
  try {
    const calldata = SELECTORS.getValidator + encodeUint64(validatorId);
    const result = await stakingCall(calldata);
    if (!result || result === "0x" || result.length < 258) return null;

    const hex = result.slice(2);
    // Returns: authAddress, flags, stake, accRewardPerToken, commission,
    //          unclaimedRewards, consensusStake, consensusCommission,
    //          snapshotStake, snapshotCommission, secpPubkey, blsPubkey
    const authAddress = "0x" + hex.slice(24, 64); // address is 20 bytes, right-padded in 32
    const stake = BigInt("0x" + hex.slice(128, 192));
    const commission = BigInt("0x" + hex.slice(256, 320));
    const consensusStake = BigInt("0x" + hex.slice(384, 448));

    return {
      id: validatorId,
      authAddress,
      stake,
      commission,
      consensusStake,
    };
  } catch {
    return null;
  }
}

// ─── Get Top Validators ──────────────────────────────────────

export async function getTopValidators(limit: number = 10): Promise<ValidatorDetails[]> {
  const ids = await getConsensusValidatorIds();
  if (ids.length === 0) return [];

  // Fetch details in batches of 25 to avoid overwhelming the RPC
  const fetchIds = ids.slice(0, Math.min(ids.length, 250));
  const BATCH_SIZE = 25;
  const valid: ValidatorDetails[] = [];

  for (let i = 0; i < fetchIds.length; i += BATCH_SIZE) {
    const batch = fetchIds.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(batch.map((id) => getValidatorDetails(id)));
    for (const d of results) {
      if (d !== null) valid.push(d);
    }
  }

  // Sort by stake descending
  valid.sort((a, b) => (b.stake > a.stake ? 1 : b.stake < a.stake ? -1 : 0));

  return valid.slice(0, limit);
}

// ─── ERC-20 Total Supply ─────────────────────────────────────

const TOTAL_SUPPLY_SELECTOR = "0x18160ddd";

export async function getTokenTotalSupply(tokenAddress: string): Promise<bigint | null> {
  try {
    const result = (await rpcCall("eth_call", [
      { to: tokenAddress, data: TOTAL_SUPPLY_SELECTOR },
      "latest",
    ])) as string | null;
    if (!result || result === "0x") return null;
    return BigInt(result);
  } catch {
    return null;
  }
}

// Known stablecoin addresses on Monad
export const STABLECOIN_ADDRESSES = {
  USDC: "0x754704Bc059F8C67012fEd69BC8A327a5aafb603",
  USDT0: "0xe7cd86e13AC4309349F30B3435a9d337750fC82D",
};
