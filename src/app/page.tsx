export const dynamic = "force-dynamic";

import Header from "@/components/Header";
import PriceMarketCard from "@/components/PriceMarketCard";
import SupplyCard from "@/components/SupplyCard";
import StakingCard from "@/components/StakingCard";
import EconomyCard from "@/components/EconomyCard";
import VolumeCard from "@/components/VolumeCard";
import NetworkStatus from "@/components/NetworkStatus";
import TVLBreakdown from "@/components/TVLBreakdown";
import FeesRevenue from "@/components/FeesRevenue";
import SupplyPressure from "@/components/SupplyPressure";
import StablecoinPanel from "@/components/StablecoinPanel";
import ValidatorsTable from "@/components/ValidatorsTable";
import DefiTreemap from "@/components/DefiTreemap";
import TxActivity from "@/components/TxActivity";
import BridgeFlows from "@/components/BridgeFlows";
import UnlockTimeline from "@/components/UnlockTimeline";
import LiquidStakingMap from "@/components/LiquidStakingMap";
import CompetitorsTable from "@/components/CompetitorsTable";
import EcosystemOverview from "@/components/EcosystemOverview";
import FundingPanel from "@/components/FundingPanel";
import StablecoinActivity from "@/components/StablecoinActivity";
import NewsFeed from "@/components/NewsFeed";
import MonadNewsFeed from "@/components/MonadNewsFeed";

import {
  getTickerData,
  getSupplyData,
  getChartData,
  getNetworkData,
  getTVLData,
  getFeesRevenue,
  getStablecoinData,
  getNewsFeed,
  getCompetitorsData,
  getValidatorsData,
  getSupplyPressureData,
  getTxActivityData,
  getBridgeFlowsData,
  getEconomyData,
  getStablecoinActivity,
  getMonadNewsFeed,
} from "@/lib/data";

export default async function Home() {
  const [
    ticker,
    supply,
    chart,
    network,
    tvl,
    fees,
    stablecoins,
    news,
    competitors,
    validators,
    supplyPressure,
    txActivity,
    bridgeFlows,
    economy,
    stablecoinActivity,
    monadNews,
  ] = await Promise.all([
    getTickerData(),
    getSupplyData(),
    getChartData(),
    getNetworkData(),
    getTVLData(),
    getFeesRevenue(),
    getStablecoinData(),
    getNewsFeed(),
    getCompetitorsData(),
    getValidatorsData(),
    getSupplyPressureData(),
    getTxActivityData(),
    getBridgeFlowsData(),
    getEconomyData(),
    getStablecoinActivity(),
    getMonadNewsFeed(),
  ]);

  return (
    <>
      <Header data={ticker} />

      <div id="app">
        <div id="main-wrapper">
          <div id="dashboard-grid">
            {/* Row 1: Price Chart + Supply */}
            <PriceMarketCard data={ticker} chart={chart} />
            <SupplyCard data={supply} />

            {/* Row 2: Staking, Economy, Volume */}
            <StakingCard />
            <EconomyCard data={economy} />
            <VolumeCard fees={fees} />

            {/* Row 3: Network Status Strip */}
            <NetworkStatus data={network} />

            {/* Row 4: TVL + Fees & Revenue */}
            <TVLBreakdown data={tvl} />
            <FeesRevenue data={fees} />

            {/* Row 5: Supply Pressure */}
            <SupplyPressure data={supplyPressure} />

            {/* Row 5b: Stablecoins Breakdown + Activity */}
            <StablecoinPanel data={stablecoins} />
            <StablecoinActivity data={stablecoinActivity} />

            {/* Row 6: Validators + DeFi Treemap */}
            <ValidatorsTable data={validators} />
            <DefiTreemap protocols={tvl.protocols} />

            {/* Row 7: Tx Activity + Bridge Flows */}
            <TxActivity data={txActivity} />
            <BridgeFlows data={bridgeFlows} />

            {/* Row 8: Unlock Timeline + Liquid Staking */}
            <UnlockTimeline />
            <LiquidStakingMap />

            {/* Row 9: Competitors + Ecosystem */}
            <CompetitorsTable data={competitors} />
            <EcosystemOverview />

            {/* Row 10: Funding Strip */}
            <FundingPanel />
          </div>
        </div>

        <div id="news-sidebar">
          <NewsFeed data={news} />
          <MonadNewsFeed data={monadNews} />
        </div>
      </div>
    </>
  );
}
