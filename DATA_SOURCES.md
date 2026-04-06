# Monad (MON) Dashboard — Data Sources Reference

Compiled: 2026-03-28

---

## 1. Token Price & Market Data

### CoinGecko API (PRIMARY — FREE)

**Coin ID:** `monad`
**Base URL:** `https://api.coingecko.com/api/v3`

| Endpoint | What it returns | Auth |
|----------|----------------|------|
| `/simple/price?ids=monad&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true` | Price, 24h change %, market cap, volume | Free, no key |
| `/coins/monad` | Full detail: price, FDV, ATH, ATL, supply, tickers, community data | Free, no key |
| `/coins/monad/market_chart?vs_currency=usd&days=30` | Historical price/mcap/volume (granularity auto-adjusts) | Free, no key |
| `/coins/monad/market_chart?vs_currency=usd&days=365&interval=daily` | Daily historical for 1 year | Free, no key |
| `/coins/monad/ohlc?vs_currency=usd&days=30` | OHLC candlestick data | Free, no key |

**Rate limits:** 500 calls/min (free tier, no key). With Demo API key (free): 30 calls/min but more stable.
**Paid tiers:** Analyst ($14.99/mo, 500 calls/min), Lite ($129/mo), Pro ($499/mo).

**Example response** (`/simple/price`):
```json
{
  "monad": {
    "usd": 0.02141,
    "usd_24h_change": -3.45,
    "usd_market_cap": 231571526,
    "usd_24h_vol": 41089587
  }
}
```

### CoinMarketCap API

**Base URL:** `https://pro-api.coinmarketcap.com/v1`
**Auth:** Requires free API key (register at coinmarketcap.com/api)

| Endpoint | What it returns |
|----------|----------------|
| `/cryptocurrency/quotes/latest?symbol=MON` | Price, volume, market cap, circulating/total supply |
| `/cryptocurrency/ohlcv/historical?symbol=MON` | Historical OHLCV |

**Free tier:** 10,000 calls/month. Basic plan $33/mo for 120,000 calls/month.

### Where MON is Listed
- CoinGecko: 37 exchanges, 65 markets tracked
- CoinMarketCap: Listed and tracked
- Exchanges: OKX (added March 2026 with USDC/USDT0 deposits), and others
- DEXs on Monad: Tracked via CoinGecko's on-chain DEX data

---

## 2. On-Chain Data (Monad RPC)

### Network Config
- **Chain ID:** 143
- **Currency:** MON
- **EVM Compatible:** Yes (Geth-compatible JSON-RPC)
- **Node Version:** v0.13.1 / MONAD_NINE

### Public RPC Endpoints (FREE)

| Provider | HTTP | WebSocket | Rate Limit | Batch Limit |
|----------|------|-----------|------------|-------------|
| QuickNode | `https://rpc.monad.xyz` | `wss://rpc.monad.xyz` | 25 rps | 100 |
| Alchemy | `https://rpc1.monad.xyz` | `wss://rpc1.monad.xyz` | 15 rps | 100 |
| Goldsky Edge | `https://rpc2.monad.xyz` | `wss://rpc2.monad.xyz` | 300/10s | 10 |
| Ankr | `https://rpc3.monad.xyz` | `wss://rpc3.monad.xyz` | 300/10s | 10 |
| MF | `https://rpc-mainnet.monadinfra.com` | `wss://rpc-mainnet.monadinfra.com` | 20 rps | 1 |

### Premium RPC Providers
- **Alchemy:** Free tier 300M compute units/mo — `https://monad-mainnet.g.alchemy.com/v2/{API_KEY}`
- **QuickNode:** Free tier available — custom endpoint URL
- **Chainstack:** Paid plans from ~$30/mo
- **dRPC:** Free tier available, paid from $10/mo — `https://monad.drpc.org`
- **Ankr:** Free public + premium — `https://rpc.ankr.com/monad`

### Supported JSON-RPC Methods

**Block & Transaction Data:**
- `eth_blockNumber` — current block height
- `eth_getBlockByNumber` / `eth_getBlockByHash` — full block data (includes tx count, gas used, timestamp)
- `eth_getBlockReceipts` — all receipts for a block
- `eth_getTransactionByHash` — single tx lookup
- `eth_getTransactionReceipt` — tx receipt with logs
- `eth_getTransactionCount` — nonce / tx count for address
- `eth_getBlockTransactionCountByNumber` — tx count per block
- `eth_getLogs` — event log queries with filters

**Account & State:**
- `eth_getBalance` — native MON balance
- `eth_getCode` — contract bytecode
- `eth_getStorageAt` — raw storage slot reads

**Gas & Fees:**
- `eth_gasPrice` — current gas price
- `eth_maxPriorityFeePerGas` — priority fee suggestion
- `eth_feeHistory` — historical fee data per block (useful for gas charts)

**Execution:**
- `eth_call` — read-only contract calls (use for staking precompile queries)
- `eth_estimateGas`
- `eth_createAccessList`
- `eth_sendRawTransaction`

**Debug & Tracing:**
- `debug_traceTransaction` / `debug_traceCall` / `debug_traceBlockByNumber`

**Monad-Specific Extensions:**
- `monadNewHeads` — speculative block headers (~1 sec earlier than `eth_subscribe("newHeads")`)
- `monadLogs` — speculative log subscription (~1 sec earlier)
- `admin_ethCallStatistics` — performance metrics for eth_call
- `txpool_statusByAddress` / `txpool_statusByHash` — mempool queries

### Calculating TPS from RPC
```
1. eth_getBlockByNumber("latest") -> get block.transactions.length and block.timestamp
2. Compare with previous block timestamp
3. TPS = transactions_in_block / (current_timestamp - previous_timestamp)
```
For average TPS, sample across multiple blocks.

### Block Explorers & APIs

**Monadscan (by Etherscan) — Etherscan-compatible API**
- Explorer: `https://monadscan.com`
- API (V2): `https://api.etherscan.io/v2/api?chainid=143`
- Requires free Etherscan API key (register at etherscan.io)
- Rate limit: 5 calls/sec (free), higher on paid plans
- Supports all standard Etherscan endpoints: account balances, tx lists, token transfers, contract ABI, logs, block data, gas tracker

**Example Monadscan API call:**
```
https://api.etherscan.io/v2/api?chainid=143&module=stats&action=tokensupply&apikey=YOUR_KEY
https://api.etherscan.io/v2/api?chainid=143&module=proxy&action=eth_blockNumber&apikey=YOUR_KEY
https://api.etherscan.io/v2/api?chainid=143&module=account&action=balance&address=0x...&apikey=YOUR_KEY
```

**SocialScan** — Etherscan-compatible API
- Explorer: `https://monad.socialscan.io`

**MonadVision (by BlockVision)** — Sourcify API
- Explorer: `https://monadvision.com`

**Specialty Explorers:**
- JiffyScan (EIP-4337 UserOps): `https://jiffyscan.xyz/?network=monad`
- Tenderly (tx tracing): `https://dashboard.tenderly.co/explorer`
- Blocksec Phalcon (fund flow): `https://blocksec.com/explorer`

---

## 3. DeFi / TVL Data

### DeFiLlama API (PRIMARY — FREE for most endpoints)

**Free Base URL:** `https://api.llama.fi`
**Pro Base URL:** `https://pro-api.llama.fi/{API_KEY}` ($300/mo)

| Endpoint | Description | Free? |
|----------|-------------|-------|
| `/v2/chains` | Current TVL of all chains (find Monad here) | Yes |
| `/v2/historicalChainTvl/Monad` | Historical TVL for Monad | Yes |
| `/protocols` | All protocols with TVL | Yes |
| `/protocol/{protocol-slug}` | Historical TVL for a protocol, with chain breakdown | Yes |
| `/tvl/{protocol-slug}` | Current TVL for a protocol (simple) | Yes |
| `/overview/fees/Monad` | Fees & revenue for all Monad protocols | Yes |
| `/summary/fees/{protocol}` | Historical fees/revenue for specific protocol | Yes |
| `/overview/dexs/Monad` | DEX volume on Monad | Yes |
| `/summary/dexs/{protocol}` | Historical DEX volume for specific protocol | Yes |

**Example — Get Monad TVL:**
```
GET https://api.llama.fi/v2/historicalChainTvl/Monad
```
Response:
```json
[
  {"date": 1711584000, "tvl": 156000000},
  {"date": 1711670400, "tvl": 158500000},
  ...
]
```

**Example — All protocols on Monad:**
```
GET https://api.llama.fi/protocols
```
Then filter response where `chains` includes `"Monad"`.

**Rate limits (free):** Reasonable but undocumented; ~500 calls/5min is generally safe.
**Pro plan:** 1000 req/min, 1M calls/mo, $300/mo.

**DeFiLlama dashboard for Monad:** `https://defillama.com/chain/monad`

---

## 4. Staking Data

### Staking Precompile Contract

**Address:** `0x0000000000000000000000000000000000001000`

This is a precompile (built into the protocol), not a deployed contract. Call via `eth_call` on any Monad RPC.

### Key Parameters
| Parameter | Value |
|-----------|-------|
| MIN_AUTH_ADDRESS_STAKE (self-delegation) | 100,000 MON |
| ACTIVE_VALIDATOR_STAKE (minimum total) | 10,000,000 MON |
| ACTIVE_VALSET_SIZE | 200 validators |
| Block Reward | 25 MON per block |
| Annual Inflation | ~1.58B MON (~1.58% of initial supply) |
| APR (early 2026) | 12–14% |
| Commission Range | 0%–100% |
| Boundary Block Period | 50,000 blocks |
| Epoch Delay | 5,000 rounds |
| Withdrawal Delay | 1 epoch |

### View Methods (read via eth_call)

| Method | Selector | Use |
|--------|----------|-----|
| `getValidator(uint64 validatorId)` | `0x2b6d639a` | Get validator info (stake, commission, status) |
| `getDelegator(uint64 validatorId, address delegator)` | `0x573c1ce0` | Get delegation info for an address |
| `getConsensusValidatorSet(uint32 startIndex)` | `0xfb29b729` | List active validators (paginated) |
| `getSnapshotValidatorSet(uint32 startIndex)` | `0xde66a368` | Snapshot validator set |
| `getExecutionValidatorSet(uint32 startIndex)` | `0x7cb074df` | Execution validator set |
| `getDelegations(address delegator, uint64 startValId)` | `0x4fd66050` | All delegations for an address |
| `getDelegators(uint64 validatorId, address startDelegator)` | `0xa0843a26` | All delegators for a validator |
| `getEpoch()` | `0x757991a8` | Current epoch info |
| `getProposerValId()` | `0xfbacb0be` | Current block proposer |
| `getWithdrawalRequest(uint64 validatorId, address delegator, uint8 withdrawId)` | `0x56fa2045` | Pending withdrawal status |

**Example eth_call to get current epoch:**
```json
{
  "jsonrpc": "2.0",
  "method": "eth_call",
  "params": [{
    "to": "0x0000000000000000000000000000000000001000",
    "data": "0x757991a8"
  }, "latest"],
  "id": 1
}
```

### Staking Providers with APIs
- **Kiln:** API-first platform, automated validator management — `https://www.kiln.fi/protocols/monad`
- **Chorus One:** Staking infrastructure — `https://chorus.one/crypto-staking-networks/monad`
- **Simply Staking, Imperator:** Staking guides/services available

### Staking SDK/CLI
- GitHub: `https://github.com/monad-developers/staking-sdk-cli`

---

## 5. Bridge Data

### Bridges Supporting Monad
Across, Axelar, Bungee, Chainlink CCIP, Circle CCTP, deBridge, Gas.zip, Hyperlane, Jumper, LayerZero, Li.fi, Mayan, Relay, Socket, Squid, Stargate, Wormhole/Portal (21+ providers).

### Wormholescan API (FREE)

**Base URL:** `https://api.wormholescan.io/api/v1`
**Testnet:** `https://api.testnet.wormholescan.io/api/v1`

| Endpoint | Description |
|----------|-------------|
| `/native-token-transfer/token-list` | All NTT tokens with market data |
| `/native-token-transfer?fromChain={id}&toChain={id}` | NTT transfers filtered by chain |
| `/ntt/token/{chainId}/{address}` | NTT token detail |
| `/operations?address={addr}&pageSize=50` | Transfer operations for an address |
| `/scorecards` | KPIs: all-time volume, 24h volume, TVL |

**No API key required.** Free and public.

Monad's Wormhole chain ID: check `https://docs.wormhole.com/wormhole/reference/constants` for Monad's assigned chain ID.

### DeFiLlama Bridges API (PRO — $300/mo)

**Base URL:** `https://pro-api.llama.fi/{KEY}`

| Endpoint | Description |
|----------|-------------|
| `/bridges/bridges` | List all bridges |
| `/bridges/bridge/{id}` | Specific bridge data |
| `/bridges/bridgevolume/{chain}` | Bridge volume for a chain (use "Monad") |
| `/bridges/bridgedaystats/{timestamp}/{chain}` | Daily bridge stats |
| `/bridges/transactions/{id}` | Bridge transactions |

### deBridge API

**Base URL:** `https://deswap.debridge.finance/v1.0`

| Endpoint | Description |
|----------|-------------|
| `/chain/list` | Supported chains |
| `/order/create-tx` | Estimate + create bridge order |
| `/order/status/{orderId}` | Order status |

Docs: `https://docs.debridge.finance/`

### Contract Addresses (Bridges on Monad)
- **Chainlink CCIP Router (mainnet):** `0x33566fE5976AAa420F3d5C64996641Fc3858CaDB`
- **Gas.zip:** `0x9E22ebeC84c7e4C4bD6D4aE7FF6f4D436D6D8390`
- Full list: `https://github.com/monad-crypto/protocols`

---

## 6. Stablecoin Data

### Contract Addresses on Monad

| Token | Address | Standard |
|-------|---------|----------|
| USDC (Circle native) | `0x754704Bc059F8C67012fEd69BC8A327a5aafb603` | Native USDC |
| USDT0 (Tether/LayerZero) | `0xe7cd86e13AC4309349F30B3435a9d337750fC82D` | LayerZero OFT |

### Querying Stablecoin Balances via RPC

Use standard ERC-20 `balanceOf(address)` calls:
```json
{
  "jsonrpc": "2.0",
  "method": "eth_call",
  "params": [{
    "to": "0x754704Bc059F8C67012fEd69BC8A327a5aafb603",
    "data": "0x70a08231000000000000000000000000{ADDRESS_WITHOUT_0x}"
  }, "latest"],
  "id": 1
}
```

For total supply: `totalSupply()` selector = `0x18160ddd`

### DeFiLlama Stablecoins API (FREE)

**Base URL:** `https://stablecoins.llama.fi`

| Endpoint | Description |
|----------|-------------|
| `/stablecoins` | All stablecoins with circulating amounts |
| `/stablecoincharts/Monad` | Historical stablecoin market cap on Monad |
| `/stablecoin/{assetId}` | Per-stablecoin market cap and chain distribution |
| `/stablecoinchains` | Current stablecoin market cap per chain |
| `/stablecoinprices` | Historical stablecoin prices |

**No API key required.**

---

## 7. Token Supply & Vesting

### Tokenomics Overview

| Category | Allocation |
|----------|-----------|
| Ecosystem Development | 35.58% |
| Team | 24.95% |
| Investors | 18.21% |
| Validator Rewards | 7.58% |
| Public Sale | 6.93% |
| Category Labs Treasury | 3.70% |
| Airdrop | 3.05% |

**Total Initial Supply:** 100,000,000,000 MON (100B)
**Circulating Supply (current):** ~10,830,583,396 MON (~10.8B)
**FDV:** ~$2.32B
**Market Cap:** ~$231M

### Vesting Schedule
- All tokens locked minimum 1 year from Nov 2025 launch
- ~46.7B tokens (team 27% + investors 19.7%) cliff in Nov 2026, then monthly vesting through 2029
- Next unlock: April 24, 2026 — 170,212,766 MON (~$3.9M) to Category Labs Treasury

### Data Sources for Supply/Vesting

| Source | URL | Free? |
|--------|-----|-------|
| CoinGecko `/coins/monad` | Returns `circulating_supply`, `total_supply`, `max_supply` | Yes |
| CoinMarketCap `/cryptocurrency/quotes/latest?symbol=MON` | Returns supply data | Yes (key required) |
| Tokenomist | `https://tokenomist.ai/monad` | Free dashboard, API requires signup at `docs.tokenomist.ai` |
| DropsTab | `https://dropstab.com/coins/monad/vesting` | Free dashboard |
| CryptoRank | `https://cryptorank.io/price/monad/vesting` | Free dashboard |
| Messari | `https://messari.io/project/monad/token-unlocks` | Pro subscription |
| Official Monad announcement | `https://www.monad.xyz/announcements/mon-tokenomics-overview` | Free |

### EIP-1559 Burn Tracking

Monad implements EIP-1559: base fees are burned. To track burns:

1. For each block, call `eth_getBlockByNumber` to get `baseFeePerGas` and `gasUsed`
2. Burned = `baseFeePerGas * gasUsed` (in wei)
3. Aggregate over time for total burn

Or use Monadscan's API:
```
https://api.etherscan.io/v2/api?chainid=143&module=stats&action=ethsupply&apikey=YOUR_KEY
```

---

## 8. Ecosystem Data

### Official Monad Ecosystem Directory
- **URL:** `https://www.monad.xyz/ecosystem`
- **Projects:** 300+ listed
- No known public API; would need to scrape or check for hidden API endpoints

### Third-Party Ecosystem Trackers

| Source | URL | API? |
|--------|-----|------|
| CoinGecko Ecosystem | `https://www.coingecko.com/en/categories/monad-ecosystem` | Yes, via `/coins/categories/monad-ecosystem` |
| The Dapp List / Rayo | `https://rayo.gg/chain/monad` (~20 projects) | Unknown |
| MonadVision Ecosystem | `https://monadvision.com/ecosystem` | Unknown |
| DeFiLlama Protocols | `https://api.llama.fi/protocols` (filter by chain) | Yes, free |

### Tracking New Deployments
- Monitor `eth_getLogs` for contract creation events
- Use Monadscan API: `module=account&action=txlistinternal` to find contract creations
- `eth_getCode` on new addresses to verify contracts

---

## 9. News / Alerts

### Crypto News APIs

| Source | Endpoint | Free? |
|--------|----------|-------|
| CoinGecko Status Updates | `/coins/monad/status_updates` | Free |
| CoinMarketCap Latest | `https://coinmarketcap.com/cmc-ai/monad/latest-updates/` | Web only |
| CryptoPanic API | `https://cryptopanic.com/api/v1/posts/?auth_token={KEY}&currencies=MON` | Free tier (API key required) |
| Messari News | `https://data.messari.io/api/v1/news?assets=monad` | Free tier |

### Whale Alert / Large Transaction Monitoring

**Whale Alert API:** `https://api.whale-alert.io/v1/transactions`
- **Does NOT support Monad yet** (supports BTC, ETH, SOL, MATIC, etc.)
- Can request Monad support via their site

**DIY Whale Monitoring (via Monad RPC):**
1. Subscribe to `monadLogs` or `eth_subscribe("newPendingTransactions")` via WebSocket
2. For each tx, check `value` field for large MON transfers
3. For ERC-20 whales, monitor Transfer events on USDC/USDT0 contracts:
   - Topic0 (Transfer): `0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef`
   - Filter for amounts above threshold
4. Use `eth_getLogs` with block ranges for historical whale tracking

**On-Chain Event Monitoring:**
- Tenderly Alerts: `https://dashboard.tenderly.co` — set up custom alerts on Monad contracts
- Blocksec Phalcon: Fund flow analysis

### Monad-Specific Speculative Subscriptions
- `monadNewHeads` — get block headers ~1 second early (faster alerts)
- `monadLogs` — get event logs ~1 second early

---

## Quick Reference: Free API Tier Summary

| Data Category | Best Free Source | Key Required? |
|---------------|-----------------|---------------|
| Price/Market | CoinGecko `/simple/price` | No |
| Historical Price | CoinGecko `/coins/monad/market_chart` | No |
| Block Height / Gas | Monad RPC `eth_blockNumber`, `eth_gasPrice` | No |
| On-Chain Queries | Monad RPC (public endpoints) | No |
| Explorer API | Monadscan via Etherscan V2 | Yes (free key) |
| Chain TVL | DeFiLlama `/v2/historicalChainTvl/Monad` | No |
| Protocol TVL | DeFiLlama `/protocols` | No |
| Fees/Revenue | DeFiLlama `/overview/fees/Monad` | No |
| DEX Volume | DeFiLlama `/overview/dexs/Monad` | No |
| Stablecoins | DeFiLlama `/stablecoincharts/Monad` | No |
| Staking | Monad RPC `eth_call` to precompile | No |
| Bridge Volume | Wormholescan API | No |
| Token Supply | CoinGecko `/coins/monad` | No |
| Vesting/Unlocks | Tokenomist dashboard | No (API needs signup) |
| News | CryptoPanic API | Yes (free key) |
| Whale Alerts | DIY via Monad RPC WebSocket | No |
