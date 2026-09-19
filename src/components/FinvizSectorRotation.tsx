import React, { useState, useMemo, useEffect } from "react";
import {
  FinvizStockItem,
  FinvizIndustryGroup,
  FinvizSectorGroup,
  FinvizSectorRotationPayload,
  RotationQuadrant,
} from "../types";
import { buildFinvizSectorRotationPayload } from "../data/finvizSectorData";
import { fetchLiveFinvizQuote } from "../data/marketDataService";
import {
  Layers,
  Grid,
  Table,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Search,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  SlidersHorizontal,
  Compass,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  BarChart2,
} from "lucide-react";

interface FinvizSectorRotationProps {
  onSelectTicker?: (ticker: string) => void;
}

type GroupingMode = "sector-industry" | "industry" | "stocks" | "rrg-quadrants";
type TimeframeMode = "1D" | "1W" | "1M" | "3M" | "YTD";

type LivePrice = {
  price: number;
  changePercent: number;
  fetchedAt: string;
};

export const FinvizSectorRotation: React.FC<FinvizSectorRotationProps> = ({
  onSelectTicker,
}) => {
  const [data, setData] = useState<FinvizSectorRotationPayload>(() =>
    buildFinvizSectorRotationPayload()
  );
  const [livePrices, setLivePrices] = useState<Record<string, LivePrice>>({});
  const [isLivePricing, setIsLivePricing] = useState(false);
  const [livePricesFetchedAt, setLivePricesFetchedAt] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [groupingMode, setGroupingMode] = useState<GroupingMode>("sector-industry");
  const [timeframe, setTimeframe] = useState<TimeframeMode>("1W");
  const [searchQuery, setSearchQuery] = useState("");
  const [quadrantFilter, setQuadrantFilter] = useState<RotationQuadrant | "ALL">("ALL");
  const [expandedSectors, setExpandedSectors] = useState<Record<string, boolean>>({
    Technology: true,
    Financials: true,
    Healthcare: false,
    "Consumer Discretionary": false,
    "Communication Services": false,
    Industrials: false,
    "Consumer Staples": false,
    Energy: false,
    Utilities: false,
    "Real Estate": false,
    "Basic Materials": false,
  });
  const [expandedIndustries, setExpandedIndustries] = useState<Record<string, boolean>>({
    Semiconductors: true,
    "Software - Infrastructure": true,
    "Banks - Diversified": true,
  });

  const syncLivePrices = async (payload: FinvizSectorRotationPayload) => {
    const tickers = Array.from(
      new Set([
        ...payload.allStocks.map((stock) => stock.ticker),
        ...payload.sectors.map((sector) => sector.etfTicker),
      ])
    );

    setIsLivePricing(true);
    try {
      const quotes: Array<readonly [string, LivePrice] | null> = [];
      for (let index = 0; index < tickers.length; index += 6) {
        const batch = tickers.slice(index, index + 6);
        const batchQuotes = await Promise.all(
          batch.map(async (ticker) => {
            const quote = await fetchLiveFinvizQuote(ticker);
            const finvizData = quote?.finvizData as { isSynthesized?: boolean } | undefined;
            if (!quote || finvizData?.isSynthesized) return null;
            return [ticker, {
              price: quote.price,
              changePercent: quote.changePercent,
              fetchedAt: new Date().toISOString(),
            }] as const;
          })
        );
        quotes.push(...batchQuotes);
      }

      const nextLivePrices: Record<string, LivePrice> = {};
      quotes.forEach((entry) => {
        if (entry) nextLivePrices[entry[0]] = entry[1];
      });
      setLivePrices(nextLivePrices);
      setLivePricesFetchedAt(new Date().toISOString());
    } finally {
      setIsLivePricing(false);
    }
  };

  useEffect(() => {
    void syncLivePrices(data);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/finviz/sector-rotation");
      if (res.ok) {
        const json = await res.json();
        if (json.ok) {
          setData(json);
          await syncLivePrices(json);
        }
      }
    } catch {
      const fallback = buildFinvizSectorRotationPayload();
      setData(fallback);
      await syncLivePrices(fallback);
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  const getLivePrice = (ticker: string, fallback: number) =>
    livePrices[ticker]?.price ?? null;

  const getLiveChangePercent = (ticker: string, fallback: number) =>
    livePrices[ticker]?.changePercent ?? fallback;

  const renderLivePrice = (ticker: string, fallback: number) => {
    const price = getLivePrice(ticker, fallback);
    return price === null ? "Loading..." : `$${price.toFixed(2)}`;
  };

  const toggleSector = (sectorName: string) => {
    setExpandedSectors((prev) => ({
      ...prev,
      [sectorName]: !prev[sectorName],
    }));
  };

  const toggleIndustry = (industryName: string) => {
    setExpandedIndustries((prev) => ({
      ...prev,
      [industryName]: !prev[industryName],
    }));
  };

  const getReturnByTimeframe = (
    item: { perf1D: number; perf1W: number; perf1M: number; perf3M: number; perfYTD: number }
  ) => {
    switch (timeframe) {
      case "1D":
        return item.perf1D;
      case "1W":
        return item.perf1W;
      case "1M":
        return item.perf1M;
      case "3M":
        return item.perf3M;
      case "YTD":
        return item.perfYTD;
      default:
        return item.perf1W;
    }
  };

  const getStockReturnByTimeframe = (stock: FinvizStockItem) => {
    switch (timeframe) {
      case "1D":
        return getLiveChangePercent(stock.ticker, stock.change);
      case "1W":
        return stock.perf1W;
      case "1M":
        return stock.perf1M;
      case "3M":
        return stock.perf3M;
      case "YTD":
        return stock.perfYTD;
      default:
        return stock.perf1W;
    }
  };

  const getQuadrantBadge = (quadrant: RotationQuadrant) => {
    switch (quadrant) {
      case "Leading":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Leading
          </span>
        );
      case "Weakening":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Weakening
          </span>
        );
      case "Lagging":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            Lagging
          </span>
        );
      case "Improving":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            Improving
          </span>
        );
    }
  };

  // Filtered stocks
  const filteredStocks = useMemo(() => {
    let list = data.allStocks;
    if (quadrantFilter !== "ALL") {
      list = list.filter((s) => s.rotationQuadrant === quadrantFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          s.ticker.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q) ||
          s.industry.toLowerCase().includes(q) ||
          s.sector.toLowerCase().includes(q)
      );
    }
    return list;
  }, [data.allStocks, quadrantFilter, searchQuery]);

  // Filtered industries
  const filteredIndustries = useMemo(() => {
    let list = data.allIndustries;
    if (quadrantFilter !== "ALL") {
      list = list.filter((i) => i.rotationQuadrant === quadrantFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (i) =>
          i.industry.toLowerCase().includes(q) ||
          i.sector.toLowerCase().includes(q) ||
          i.stocks.some((s) => s.ticker.toLowerCase().includes(q))
      );
    }
    return list;
  }, [data.allIndustries, quadrantFilter, searchQuery]);

  // Filtered Sectors
  const filteredSectors = useMemo(() => {
    return data.sectors.filter((sec) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesSec = sec.sector.toLowerCase().includes(q);
        const matchesInd = sec.industries.some((i) => i.industry.toLowerCase().includes(q));
        const matchesStock = sec.stocks.some(
          (s) => s.ticker.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
        );
        if (!matchesSec && !matchesInd && !matchesStock) return false;
      }
      if (quadrantFilter !== "ALL") {
        const hasMatchingStock = sec.stocks.some((s) => s.rotationQuadrant === quadrantFilter);
        if (!hasMatchingStock && sec.rotationQuadrant !== quadrantFilter) return false;
      }
      return true;
    });
  }, [data.sectors, searchQuery, quadrantFilter]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400">
              <Compass className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold font-mono text-white tracking-tight">
              S&P 500 Sector & Industry Rotation
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
              FINVIZ GROUNDED
            </span>
          </div>
          <p className="text-xs font-mono text-slate-400">
            Relative Rotation Graphs (RRG), cross-sector leadership, sub-industry momentum, and constituent stock flows
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Grouping Mode */}
          <div className="flex items-center bg-slate-800/80 p-1 rounded-lg border border-slate-700 text-xs font-mono">
            <button
              onClick={() => setGroupingMode("sector-industry")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-bold transition ${
                groupingMode === "sector-industry"
                  ? "bg-orange-500 text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-700/50"
              }`}
              title="Group by Sector then Industry"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>By Sector &amp; Industry</span>
            </button>
            <button
              onClick={() => setGroupingMode("industry")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-bold transition ${
                groupingMode === "industry"
                  ? "bg-orange-500 text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-700/50"
              }`}
              title="Group directly by Sub-Industry"
            >
              <Grid className="w-3.5 h-3.5" />
              <span>By Industry</span>
            </button>
            <button
              onClick={() => setGroupingMode("stocks")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-bold transition ${
                groupingMode === "stocks"
                  ? "bg-orange-500 text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-700/50"
              }`}
              title="View all constituent S&P 500 stocks"
            >
              <Table className="w-3.5 h-3.5" />
              <span>By Stocks</span>
            </button>
            <button
              onClick={() => setGroupingMode("rrg-quadrants")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-bold transition ${
                groupingMode === "rrg-quadrants"
                  ? "bg-cyan-500 text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-700/50"
              }`}
              title="RRG 2x2 Relative Rotation Quadrant Map"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>RRG Map</span>
            </button>
          </div>

          {/* Timeframe Selector */}
          <div className="flex items-center bg-slate-800/80 p-1 rounded-lg border border-slate-700 text-xs font-mono font-bold">
            {(["1D", "1W", "1M", "3M", "YTD"] as TimeframeMode[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2 py-1 rounded transition ${
                  timeframe === tf
                    ? "bg-slate-700 text-orange-400 border border-orange-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-xs font-mono text-slate-300 border border-slate-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-orange-400" : ""}`} />
            <span>{isRefreshing ? "Syncing..." : "Sync Finviz"}</span>
          </button>
            <span
              className="flex items-center gap-1 text-[10px] font-mono text-emerald-400"
              title={livePricesFetchedAt ? `Finviz fetched ${new Date(livePricesFetchedAt).toLocaleTimeString()}` : "Waiting for Finviz prices"}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isLivePricing ? "bg-amber-400 animate-pulse" : "bg-emerald-400"}`} />
              {isLivePricing ? "Fetching live prices" : `${Object.keys(livePrices).length} live prices`}
            </span>
        </div>
      </div>

      {/* Finviz Market Breadth & RRG Quadrant Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setQuadrantFilter(quadrantFilter === "Leading" ? "ALL" : "Leading")}
          className={`p-3 rounded-lg border text-left transition ${
            quadrantFilter === "Leading"
              ? "bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500"
              : "bg-slate-800/60 border-slate-700/70 hover:border-emerald-500/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Leading Quadrant
            </span>
            <span className="text-xs font-mono font-bold text-white">
              {data.marketBreadth.leadingCount} Stocks
            </span>
          </div>
          <p className="text-[11px] font-mono text-slate-400 mt-1">
            RS-Ratio &gt; 100 | RS-Momentum &gt; 100 (Outperforming &amp; Accelerating)
          </p>
        </button>

        <button
          onClick={() => setQuadrantFilter(quadrantFilter === "Improving" ? "ALL" : "Improving")}
          className={`p-3 rounded-lg border text-left transition ${
            quadrantFilter === "Improving"
              ? "bg-cyan-950/40 border-cyan-500 ring-1 ring-cyan-500"
              : "bg-slate-800/60 border-slate-700/70 hover:border-cyan-500/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              Improving Quadrant
            </span>
            <span className="text-xs font-mono font-bold text-white">
              {data.marketBreadth.improvingCount} Stocks
            </span>
          </div>
          <p className="text-[11px] font-mono text-slate-400 mt-1">
            RS-Ratio &lt; 100 | RS-Momentum &gt; 100 (Bottoming &amp; Turning Up)
          </p>
        </button>

        <button
          onClick={() => setQuadrantFilter(quadrantFilter === "Weakening" ? "ALL" : "Weakening")}
          className={`p-3 rounded-lg border text-left transition ${
            quadrantFilter === "Weakening"
              ? "bg-amber-950/40 border-amber-500 ring-1 ring-amber-500"
              : "bg-slate-800/60 border-slate-700/70 hover:border-amber-500/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Weakening Quadrant
            </span>
            <span className="text-xs font-mono font-bold text-white">
              {data.marketBreadth.weakeningCount} Stocks
            </span>
          </div>
          <p className="text-[11px] font-mono text-slate-400 mt-1">
            RS-Ratio &gt; 100 | RS-Momentum &lt; 100 (High RS but Decelerating)
          </p>
        </button>

        <button
          onClick={() => setQuadrantFilter(quadrantFilter === "Lagging" ? "ALL" : "Lagging")}
          className={`p-3 rounded-lg border text-left transition ${
            quadrantFilter === "Lagging"
              ? "bg-rose-950/40 border-rose-500 ring-1 ring-rose-500"
              : "bg-slate-800/60 border-slate-700/70 hover:border-rose-500/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-rose-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              Lagging Quadrant
            </span>
            <span className="text-xs font-mono font-bold text-white">
              {data.marketBreadth.laggingCount} Stocks
            </span>
          </div>
          <p className="text-[11px] font-mono text-slate-400 mt-1">
            RS-Ratio &lt; 100 | RS-Momentum &lt; 100 (Underperforming Benchmark)
          </p>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-800/40 p-2.5 rounded-lg border border-slate-800">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by Stock (NVDA, MSFT), Industry (Semis, Software), or Sector..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
          <span>Active Filter:</span>
          {quadrantFilter !== "ALL" ? (
            <button
              onClick={() => setQuadrantFilter("ALL")}
              className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center gap-1"
            >
              <span>{quadrantFilter}</span>
              <span>✕</span>
            </button>
          ) : (
            <span className="text-slate-300">All Quadrants</span>
          )}
          <span className="text-slate-500">|</span>
          <span>Benchmark:</span>
          <span className="text-white font-bold">SPY (S&amp;P 500)</span>
        </div>
      </div>

      {/* -------------------- VIEW 1: BY SECTOR & INDUSTRY (HIERARCHICAL) -------------------- */}
      {groupingMode === "sector-industry" && (
        <div className="space-y-3">
          {filteredSectors.map((sector) => {
            const isExpanded = !!expandedSectors[sector.sector];
            const secReturn = getReturnByTimeframe(sector);
            const isPositive = secReturn >= 0;

            return (
              <div
                key={sector.sector}
                className="rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-md transition-colors"
              >
                {/* Sector Accordion Header */}
                <div
                  onClick={() => toggleSector(sector.sector)}
                  className="p-3.5 flex flex-wrap items-center justify-between gap-3 bg-slate-800/50 hover:bg-slate-800/80 cursor-pointer select-none transition border-b border-slate-800/60"
                >
                  <div className="flex items-center gap-3">
                    <button className="text-slate-400 hover:text-white">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-orange-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold font-mono text-white">
                          {sector.sector}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-700 text-slate-300">
                          {sector.etfTicker}
                        </span>
                        {livePrices[sector.etfTicker] && (
                          <span className="text-xs font-mono font-bold text-emerald-400">
                            {renderLivePrice(sector.etfTicker, 0)}
                          </span>
                        )}
                        <span className="text-xs font-mono text-slate-400">
                          ({sector.weightInSP500}% S&amp;P 500 Weight)
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                        {sector.industries.length} Industries • {sector.stocks.length} Constituent Stocks
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Return Badge */}
                    <div className="text-right font-mono">
                      <span className="text-[10px] text-slate-400 block">{timeframe} Return</span>
                      <span
                        className={`text-sm font-bold flex items-center justify-end gap-1 ${
                          isPositive ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {isPositive ? (
                          <TrendingUp className="w-3.5 h-3.5" />
                        ) : (
                          <TrendingDown className="w-3.5 h-3.5" />
                        )}
                        {isPositive ? "+" : ""}
                        {secReturn.toFixed(2)}%
                      </span>
                    </div>

                    {/* Relative Strength Vector */}
                    <div className="hidden sm:block text-right font-mono text-xs">
                      <span className="text-[10px] text-slate-400 block">RS-Ratio / Mom</span>
                      <span className="text-slate-200">
                        {sector.rsRatio} / {sector.rsMomentum}
                      </span>
                    </div>

                    {/* Quadrant */}
                    <div>{getQuadrantBadge(sector.rotationQuadrant)}</div>
                  </div>
                </div>

                {/* Sector Content: Industries */}
                {isExpanded && (
                  <div className="p-4 space-y-4 bg-slate-950/40">
                    {sector.industries.map((industry) => {
                      const isIndExpanded =
                        expandedIndustries[industry.industry] ?? true;
                      const indReturn = getReturnByTimeframe(industry);
                      const isIndPos = indReturn >= 0;

                      return (
                        <div
                          key={industry.industry}
                          className="rounded-lg border border-slate-800 bg-slate-900/60 overflow-hidden"
                        >
                          {/* Industry Sub-Header */}
                          <div
                            onClick={() => toggleIndustry(industry.industry)}
                            className="p-2.5 px-3 flex items-center justify-between bg-slate-800/40 hover:bg-slate-800/60 cursor-pointer transition select-none"
                          >
                            <div className="flex items-center gap-2">
                              {isIndExpanded ? (
                                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                              )}
                              <span className="text-xs font-bold font-mono text-slate-200">
                                Industry: {industry.industry}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400">
                                ({industry.stockCount} stocks • Market Cap {industry.totalMarketCap})
                              </span>
                            </div>

                            <div className="flex items-center gap-3">
                              <span
                                className={`text-xs font-mono font-bold ${
                                  isIndPos ? "text-emerald-400" : "text-rose-400"
                                }`}
                              >
                                {isIndPos ? "+" : ""}
                                {indReturn.toFixed(2)}%
                              </span>
                              {getQuadrantBadge(industry.rotationQuadrant)}
                            </div>
                          </div>

                          {/* Stocks Grid within Industry */}
                          {isIndExpanded && (
                            <div className="p-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 bg-slate-950/30">
                              {industry.stocks.map((stock) => {
                                const stockReturn = getStockReturnByTimeframe(stock);
                                const isStkPos = stockReturn >= 0;

                                return (
                                  <div
                                    key={stock.ticker}
                                    onClick={() => onSelectTicker?.(stock.ticker)}
                                    className="p-2.5 rounded-lg border border-slate-800/80 bg-slate-900 hover:border-orange-500/60 hover:bg-slate-850 cursor-pointer transition-all space-y-1.5 group"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs font-bold font-mono text-white group-hover:text-orange-400 transition">
                                        {stock.ticker}
                                      </span>
                                      <span
                                        className={`text-xs font-mono font-bold ${
                                          isStkPos ? "text-emerald-400" : "text-rose-400"
                                        }`}
                                      >
                                        {isStkPos ? "+" : ""}
                                        {stockReturn.toFixed(2)}%
                                      </span>
                                    </div>
                                    <div className="text-[11px] font-mono text-slate-400 truncate">
                                      {stock.name}
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-800/50">
                                      <span>{renderLivePrice(stock.ticker, stock.price)}</span>
                                      <span>MCap {stock.marketCap}</span>
                                    </div>
                                    <div className="flex items-center justify-between pt-0.5">
                                      <span className="text-[9px] font-mono text-slate-500">
                                        P/E: {stock.pe ? stock.pe.toFixed(1) : "N/A"}
                                      </span>
                                      {getQuadrantBadge(stock.rotationQuadrant)}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* -------------------- VIEW 2: GROUPED BY INDUSTRY (RANKED TABLE) -------------------- */}
      {groupingMode === "industry" && (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700">
                <tr>
                  <th className="py-3 px-4">Industry Group</th>
                  <th className="py-3 px-3">Sector</th>
                  <th className="py-3 px-3 text-right">Stocks</th>
                  <th className="py-3 px-3 text-right">1D %</th>
                  <th className="py-3 px-3 text-right">1W %</th>
                  <th className="py-3 px-3 text-right">1M %</th>
                  <th className="py-3 px-3 text-right">3M %</th>
                  <th className="py-3 px-3 text-right">YTD %</th>
                  <th className="py-3 px-3 text-right">Market Cap</th>
                  <th className="py-3 px-4 text-center">Rotation Quadrant</th>
                  <th className="py-3 px-3 text-center">Key Tickers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900/60">
                {filteredIndustries.map((ind) => {
                  const is1DPos = ind.perf1D >= 0;
                  const is1WPos = ind.perf1W >= 0;
                  const is1MPos = ind.perf1M >= 0;
                  const is3MPos = ind.perf3M >= 0;
                  const isYTDPos = ind.perfYTD >= 0;

                  return (
                    <tr key={ind.industry} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                        {ind.industry}
                      </td>
                      <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                        {ind.sector}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-300">
                        {ind.stockCount}
                      </td>
                      <td
                        className={`py-3 px-3 text-right font-bold ${
                          is1DPos ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {is1DPos ? "+" : ""}
                        {ind.perf1D.toFixed(2)}%
                      </td>
                      <td
                        className={`py-3 px-3 text-right font-bold ${
                          is1WPos ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {is1WPos ? "+" : ""}
                        {ind.perf1W.toFixed(2)}%
                      </td>
                      <td
                        className={`py-3 px-3 text-right font-bold ${
                          is1MPos ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {is1MPos ? "+" : ""}
                        {ind.perf1M.toFixed(2)}%
                      </td>
                      <td
                        className={`py-3 px-3 text-right font-bold ${
                          is3MPos ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {is3MPos ? "+" : ""}
                        {ind.perf3M.toFixed(2)}%
                      </td>
                      <td
                        className={`py-3 px-3 text-right font-bold ${
                          isYTDPos ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {isYTDPos ? "+" : ""}
                        {ind.perfYTD.toFixed(2)}%
                      </td>
                      <td className="py-3 px-3 text-right text-slate-300 whitespace-nowrap">
                        {ind.totalMarketCap}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {getQuadrantBadge(ind.rotationQuadrant)}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1 justify-center">
                          {ind.stocks.slice(0, 4).map((s) => (
                            <button
                              key={s.ticker}
                              onClick={() => onSelectTicker?.(s.ticker)}
                              className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 hover:bg-orange-500/20 hover:text-orange-400 text-slate-300 border border-slate-700 transition"
                            >
                              {s.ticker}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* -------------------- VIEW 3: BY STOCKS (S&P 500 SCREENER TABLE) -------------------- */}
      {groupingMode === "stocks" && (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700">
                <tr>
                  <th className="py-3 px-4">Ticker</th>
                  <th className="py-3 px-3">Company Name</th>
                  <th className="py-3 px-3">Sector</th>
                  <th className="py-3 px-3">Industry</th>
                  <th className="py-3 px-3 text-right">Price</th>
                  <th className="py-3 px-3 text-right">{timeframe} %</th>
                  <th className="py-3 px-3 text-right">Volume</th>
                  <th className="py-3 px-3 text-right">Rel Vol</th>
                  <th className="py-3 px-3 text-right">P/E</th>
                  <th className="py-3 px-3 text-right">Market Cap</th>
                  <th className="py-3 px-4 text-center">RRG Quadrant</th>
                  <th className="py-3 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900/60">
                {filteredStocks.map((stock) => {
                  const ret = getStockReturnByTimeframe(stock);
                  const isPos = ret >= 0;

                  return (
                    <tr
                      key={stock.ticker}
                      className="hover:bg-slate-800/40 transition group"
                    >
                      <td className="py-3 px-4 font-bold text-orange-400 whitespace-nowrap">
                        {stock.ticker}
                      </td>
                      <td className="py-3 px-3 text-white font-medium truncate max-w-[160px]">
                        {stock.name}
                      </td>
                      <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                        {stock.sector}
                      </td>
                      <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                        {stock.industry}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-200">
                        {renderLivePrice(stock.ticker, stock.price)}
                      </td>
                      <td
                        className={`py-3 px-3 text-right font-bold ${
                          isPos ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {isPos ? "+" : ""}
                        {ret.toFixed(2)}%
                      </td>
                      <td className="py-3 px-3 text-right text-slate-400">
                        {stock.volume}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-400">
                        {stock.relVolume}x
                      </td>
                      <td className="py-3 px-3 text-right text-slate-400">
                        {stock.pe ? stock.pe.toFixed(1) : "N/A"}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-300 whitespace-nowrap">
                        {stock.marketCap}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {getQuadrantBadge(stock.rotationQuadrant)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => onSelectTicker?.(stock.ticker)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-orange-500 hover:text-white text-slate-300 text-[11px] font-mono border border-slate-700 transition flex items-center gap-1 mx-auto"
                        >
                          <span>Analyze</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* -------------------- VIEW 4: RRG 2X2 ROTATION QUADRANT MAP -------------------- */}
      {groupingMode === "rrg-quadrants" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* TOP-LEFT: Improving Quadrant */}
            <div className="p-4 rounded-xl border border-cyan-500/40 bg-cyan-950/20 space-y-3">
              <div className="flex items-center justify-between border-b border-cyan-500/30 pb-2">
                <span className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                  IMPROVING QUADRANT (Bottoming / Momentum Inflection)
                </span>
                <span className="text-xs font-mono text-slate-400">
                  RS-Ratio &lt; 100 • RS-Mom &gt; 100
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-300">
                Equities emerging from laggard status with accelerating relative momentum. Key rotation candidates before crossing into Leading.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                {data.allStocks
                  .filter((s) => s.rotationQuadrant === "Improving")
                  .map((s) => (
                    <button
                      key={s.ticker}
                      onClick={() => onSelectTicker?.(s.ticker)}
                      className="p-2 rounded bg-slate-900/80 border border-slate-800 hover:border-cyan-400 text-left transition space-y-0.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold font-mono text-cyan-400">{s.ticker}</span>
                        <span className="text-[10px] font-mono text-slate-300">+{s.perf1W}% 1W</span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 truncate">{s.industry}</div>
                    </button>
                  ))}
              </div>
            </div>

            {/* TOP-RIGHT: Leading Quadrant */}
            <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-950/20 space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-500/30 pb-2">
                <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  LEADING QUADRANT (Prime Outperformance)
                </span>
                <span className="text-xs font-mono text-slate-400">
                  RS-Ratio &gt; 100 • RS-Mom &gt; 100
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-300">
                S&amp;P 500 alpha drivers outperforming benchmark with positive acceleration. Strong institutional capital inflows.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                {data.allStocks
                  .filter((s) => s.rotationQuadrant === "Leading")
                  .map((s) => (
                    <button
                      key={s.ticker}
                      onClick={() => onSelectTicker?.(s.ticker)}
                      className="p-2 rounded bg-slate-900/80 border border-slate-800 hover:border-emerald-400 text-left transition space-y-0.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold font-mono text-emerald-400">{s.ticker}</span>
                        <span className="text-[10px] font-mono text-emerald-300">+{s.perf1W}% 1W</span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 truncate">{s.industry}</div>
                    </button>
                  ))}
              </div>
            </div>

            {/* BOTTOM-LEFT: Lagging Quadrant */}
            <div className="p-4 rounded-xl border border-rose-500/40 bg-rose-950/20 space-y-3">
              <div className="flex items-center justify-between border-b border-rose-500/30 pb-2">
                <span className="text-xs font-mono font-bold text-rose-400 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  LAGGING QUADRANT (Chronic Underperformance)
                </span>
                <span className="text-xs font-mono text-slate-400">
                  RS-Ratio &lt; 100 • RS-Mom &lt; 100
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-300">
                Sectors and equities shedding capital to market leaders. Avoid long swings until momentum inflects upwards.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                {data.allStocks
                  .filter((s) => s.rotationQuadrant === "Lagging")
                  .map((s) => (
                    <button
                      key={s.ticker}
                      onClick={() => onSelectTicker?.(s.ticker)}
                      className="p-2 rounded bg-slate-900/80 border border-slate-800 hover:border-rose-400 text-left transition space-y-0.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold font-mono text-rose-400">{s.ticker}</span>
                        <span className="text-[10px] font-mono text-rose-300">{s.perf1W}% 1W</span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 truncate">{s.industry}</div>
                    </button>
                  ))}
              </div>
            </div>

            {/* BOTTOM-RIGHT: Weakening Quadrant */}
            <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-950/20 space-y-3">
              <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
                <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  WEAKENING QUADRANT (Decelerating Leaders)
                </span>
                <span className="text-xs font-mono text-slate-400">
                  RS-Ratio &gt; 100 • RS-Mom &lt; 100
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-300">
                Above-average relative strength but losing forward velocity. Potential profit-taking or defensive hedge candidates.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                {data.allStocks
                  .filter((s) => s.rotationQuadrant === "Weakening")
                  .map((s) => (
                    <button
                      key={s.ticker}
                      onClick={() => onSelectTicker?.(s.ticker)}
                      className="p-2 rounded bg-slate-900/80 border border-slate-800 hover:border-amber-400 text-left transition space-y-0.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold font-mono text-amber-400">{s.ticker}</span>
                        <span className="text-[10px] font-mono text-slate-300">+{s.perf1W}% 1W</span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 truncate">{s.industry}</div>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Finviz Attribution */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-500">
        <div>
          Data Source: Finviz Screener &amp; S&amp;P 500 Index Groups • Normalized vs SPY
        </div>
        <div>
          Last Sync: {data.asOf} EST
        </div>
      </div>
    </div>
  );
};
