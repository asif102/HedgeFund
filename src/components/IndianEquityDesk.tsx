import React, { useState, useEffect } from "react";
import {
  IndianIndexQuote,
  IndianStockQuote,
  IndianMarketBreadth,
  FiiDiiFlow,
  IndianMarketIndicatorsDataset,
  IndianValueScreenerStock,
} from "../types";
import {
  BASE_INDIAN_INDICES,
  TOP_INDIAN_EQUITIES,
  BASE_TIJORI_VALUE_SCREENER,
  BASE_MARKET_BREADTH,
  BASE_FII_DII_FLOWS,
  INITIAL_INDICATOR_DATASET,
  getIndianMarketOverview,
  getTijoriValueScreener,
  generateLiveIndianTick,
  calculateAutomatedWeeklyTrend,
} from "../data/indianMarketService";
import { MintChartRenderer, MintChartType } from "./MintChartRenderer";
import { FinvizSectorRotation } from "./FinvizSectorRotation";
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Play,
  Pause,
  Sliders,
  ShieldAlert,
  Compass,
  Building2,
  PieChart,
  Layers,
  ArrowRight,
  ExternalLink,
  DollarSign,
  AlertTriangle,
  Activity,
  BarChart2,
  CheckCircle2,
  Search,
  X,
  Lightbulb,
} from "lucide-react";

interface IndianEquityDeskProps {
  onNavigateToTicker?: (ticker: string) => void;
}

interface TijoriSearchResult {
  name: string;
  slug: string;
  source: string;
}

interface TijoriCompanyProfile {
  name: string;
  slug: string;
  source: string;
  sourceUrl: string;
  summary: string;
  marketCap: string;
  currentPrice: string;
  peRatio: string;
  revenue: string;
  ebitda: string;
  netProfit: string;
  operatingCashFlow: string;
  freeCashFlow: string;
  eps: string;
  reportedRevenue: string;
  reportedEbitda: string;
  reportedNetProfit: string;
  reportedCashFlow: string;
  netProfitMargin: string;
  roce: string;
  debtToEquity: string;
  cashFlowQuality: string;
  bullCase: string;
  bearCase: string;
  fetchedAt: string;
}

export const IndianEquityDesk: React.FC<IndianEquityDeskProps> = ({
  onNavigateToTicker,
}) => {
  const [indices, setIndices] = useState<IndianIndexQuote[]>(BASE_INDIAN_INDICES);
  const [stocks, setStocks] = useState<IndianStockQuote[]>(TOP_INDIAN_EQUITIES);
  const [breadth, setBreadth] = useState<IndianMarketBreadth>(BASE_MARKET_BREADTH);
  const [fiiDii, setFiiDii] = useState<FiiDiiFlow[]>(BASE_FII_DII_FLOWS);
  const [indicators, setIndicators] = useState<IndianMarketIndicatorsDataset>(
    INITIAL_INDICATOR_DATASET
  );
  const [tijoriValueStocks, setTijoriValueStocks] = useState<IndianValueScreenerStock[]>(
    BASE_TIJORI_VALUE_SCREENER
  );
  const [tijoriSource, setTijoriSource] = useState("Tijori + Internal Value Curation");

  // Active Indicator sub-tab
  const [activeIndicator, setActiveIndicator] = useState<
    "weekly" | "lwtd" | "mwpl" | "advdec" | "triple" | "rotation"
  >("weekly");

  // Graphic theme mode (Mint Paper Canvas vs Terminal Dark)
  const [chartTheme, setChartTheme] = useState<"mint-light" | "terminal-dark">("mint-light");

  // Live real-time tick streaming & live exchange connection
  const [isLiveActive, setIsLiveActive] = useState(true);
  const [isSyncingLive, setIsSyncingLive] = useState(false);
  const [feedSourceText, setFeedSourceText] = useState("NSE & BSE Live Gateway (Asia/Kolkata)");
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(true);
  const [lastTickTime, setLastTickTime] = useState<string>(new Date().toLocaleTimeString());
  const [priceFlashMap, setPriceFlashMap] = useState<Record<string, "up" | "down">>({});

  // Stock search and filter
  const [stockSearch, setStockSearch] = useState("");
  const [selectedSector, setSelectedSector] = useState<string>("ALL");
  const [tijoriQuery, setTijoriQuery] = useState("");
  const [tijoriResults, setTijoriResults] = useState<TijoriSearchResult[]>([]);
  const [isTijoriSearching, setIsTijoriSearching] = useState(false);
  const [selectedTijoriCompany, setSelectedTijoriCompany] = useState<TijoriCompanyProfile | null>(null);
  const [isTijoriOverviewOpen, setIsTijoriOverviewOpen] = useState(false);
  const [isTijoriLoading, setIsTijoriLoading] = useState(false);
  const [tijoriError, setTijoriError] = useState<string | null>(null);

  useEffect(() => {
    const query = tijoriQuery.trim();
    if (query.length < 2) {
      setTijoriResults([]);
      return;
    }

    const timer = window.setTimeout(async () => {
      setIsTijoriSearching(true);
      try {
        const response = await fetch(`/api/india/tijori/search?q=${encodeURIComponent(query)}`);
        const payload = await response.json();
        setTijoriResults(payload.ok ? payload.results : []);
      } catch {
        setTijoriResults([]);
      } finally {
        setIsTijoriSearching(false);
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [tijoriQuery]);

  const openTijoriCompany = async (result: TijoriSearchResult) => {
    setTijoriQuery(result.name);
    setTijoriResults([]);
    setIsTijoriLoading(true);
    setTijoriError(null);
    try {
      const response = await fetch(`/api/india/tijori/company?slug=${encodeURIComponent(result.slug)}`);
      const payload = await response.json();
      if (!response.ok || !payload.ok) throw new Error(payload.error || "Tijori profile unavailable");
      setSelectedTijoriCompany(payload);
    } catch (error: any) {
      setTijoriError(error?.message || "Unable to load the Tijori profile");
    } finally {
      setIsTijoriLoading(false);
    }
  };

  // Core live real-time fetch function connecting to server-side NSE/BSE Gateway
  const fetchRealtimeMarketData = async (forceFresh = false) => {
    setIsSyncingLive(true);
    try {
      const data = await getIndianMarketOverview(forceFresh);
      if (data.indices && data.indices.length > 0) {
        // Detect price changes for Nifty, Sensex, and Bank Nifty to trigger visual flashes
        setIndices((prev) => {
          const prevNifty = prev.find((i) => i.symbol === "NIFTY 50");
          const nextNifty = data.indices.find((i) => i.symbol === "NIFTY 50");
          const flashes: Record<string, "up" | "down"> = {};

          if (prevNifty && nextNifty && prevNifty.price !== nextNifty.price) {
            flashes["NIFTY 50"] = nextNifty.price > prevNifty.price ? "up" : "down";
          }

          const prevSensex = prev.find((i) => i.symbol === "SENSEX");
          const nextSensex = data.indices.find((i) => i.symbol === "SENSEX");
          if (prevSensex && nextSensex && prevSensex.price !== nextSensex.price) {
            flashes["SENSEX"] = nextSensex.price > prevSensex.price ? "up" : "down";
          }

          const prevBank = prev.find((i) => i.symbol === "BANK NIFTY");
          const nextBank = data.indices.find((i) => i.symbol === "BANK NIFTY");
          if (prevBank && nextBank && prevBank.price !== nextBank.price) {
            flashes["BANK NIFTY"] = nextBank.price > prevBank.price ? "up" : "down";
          }

          if (Object.keys(flashes).length > 0) {
            setPriceFlashMap((m) => ({ ...m, ...flashes }));
            setTimeout(() => {
              setPriceFlashMap({});
            }, 1200);
          }

          return data.indices;
        });

        if (data.stocks) setStocks(data.stocks);
        if (data.breadth) setBreadth(data.breadth);
        if (data.fiiDii) setFiiDii(data.fiiDii);
        if (data.source) setFeedSourceText(data.source);
        setIsRealtimeConnected(data.isRealtime ?? true);
        setLastTickTime(new Date().toLocaleTimeString());
      }
    } catch (e) {
      console.error("Error connecting to real-time Indian equity feed", e);
    } finally {
      setIsSyncingLive(false);
    }
  };

  // Initial load
  useEffect(() => {
    let isMounted = true;
    fetchRealtimeMarketData(false).then(() => {
      if (!isMounted) return;
    });

    getTijoriValueScreener(false).then((payload) => {
      if (!isMounted) return;
      if (payload?.stocks?.length) setTijoriValueStocks(payload.stocks);
      if (payload?.source) setTijoriSource(payload.source);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Real-time ticking & live exchange polling effect (every 6 seconds)
  useEffect(() => {
    if (!isLiveActive) return;

    const timer = setInterval(() => {
      fetchRealtimeMarketData(false);
    }, 6000);

    return () => clearInterval(timer);
  }, [isLiveActive]);

  // Filtered stocks
  const filteredStocks = stocks.filter((stock) => {
    const matchSearch =
      stock.symbol.toLowerCase().includes(stockSearch.toLowerCase()) ||
      stock.name.toLowerCase().includes(stockSearch.toLowerCase());
    const matchSector =
      selectedSector === "ALL" || stock.sector.toLowerCase().includes(selectedSector.toLowerCase());
    return matchSearch && matchSector;
  });

  const niftyQuote = indices.find((i) => i.symbol === "NIFTY 50") || indices[0];
  const sensexQuote = indices.find((i) => i.symbol === "SENSEX") || indices[1];
  const bankNiftyQuote = indices.find((i) => i.symbol === "BANK NIFTY") || indices[2];
  const vixQuote = indices.find((i) => i.symbol === "INDIA VIX") || indices[4];
  const inrQuote = indices.find((i) => i.symbol === "USD / INR") || indices[5];

  // Algorithmic automated weekly trend calculation engine
  const automatedWeeklyTrend = React.useMemo(() => {
    return calculateAutomatedWeeklyTrend(
      niftyQuote,
      breadth,
      indicators,
      vixQuote?.price || 13.85
    );
  }, [niftyQuote, breadth, indicators, vixQuote]);

  const toSafeTijoriUrl = (url: string): string | null => {
    try {
      const parsed = new URL(url);
      const isHttps = parsed.protocol === "https:";
      const isTijoriDomain =
        parsed.hostname === "tijori.com" || parsed.hostname === "www.tijori.com";
      if (isHttps && isTijoriDomain) return parsed.toString();
    } catch {
      // noop
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* 1. Executive Indian Market Live Tape Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🇮🇳</span>
              <div>
                <h2 className="text-base font-bold font-mono text-white flex items-center gap-2">
                  <span>Indian Equity Market Desk</span>
                  <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>REALTIME NSE / BSE</span>
                  </span>
                </h2>
                <p className="text-xs font-mono text-slate-400">
                  {feedSourceText}
                </p>
              </div>
            </div>
          </div>

          {/* Real-time Streaming Controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300">
              <span className="text-slate-400">Tick (IST):</span>
              <span className="text-cyan-300 font-semibold">{lastTickTime}</span>
            </div>

            <button
              onClick={() => setIsLiveActive(!isLiveActive)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-medium transition ${
                isLiveActive
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "bg-slate-800 text-slate-400 border border-slate-700 hover:text-white"
              }`}
              title={isLiveActive ? "Pause live streaming" : "Resume live streaming"}
            >
              {isLiveActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span>{isLiveActive ? "STREAMING" : "PAUSED"}</span>
            </button>

            <button
              onClick={() => fetchRealtimeMarketData(true)}
              disabled={isSyncingLive}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 transition text-xs font-mono ${
                isSyncingLive ? "opacity-75 cursor-not-allowed" : ""
              }`}
              title="Force live quote refresh from NSE & BSE"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingLive ? "animate-spin text-cyan-400" : ""}`} />
              <span className="hidden sm:inline">Sync Realtime</span>
            </button>
          </div>
        </div>

        {/* Tijori-listed equity search and thesis view */}
        <div className="rounded-lg border border-cyan-500/25 bg-slate-950/60 p-3 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider">
                <Search className="w-3.5 h-3.5" />
                Tijori Equity Intelligence
              </div>
              <p className="text-[11px] text-slate-500 font-mono mt-1">
                Search listed Indian companies and open a bird&apos;s-eye investment thesis.
              </p>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 rounded px-2 py-1">
              Source: Tijori Finance
            </span>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={tijoriQuery}
              onChange={(event) => setTijoriQuery(event.target.value)}
              placeholder="Search any listed Indian equity, e.g. Reliance, HDFC Bank, Infosys..."
              className="w-full rounded-lg border border-slate-700 bg-slate-900 py-2.5 pl-9 pr-9 text-sm font-mono text-white placeholder-slate-500 outline-none focus:border-cyan-400"
              aria-label="Search listed Indian equities on Tijori Finance"
            />
            {tijoriQuery && (
              <button
                type="button"
                onClick={() => {
                  setTijoriQuery("");
                  setTijoriResults([]);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                aria-label="Clear Tijori equity search"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {(isTijoriSearching || tijoriResults.length > 0) && (
              <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-64 overflow-y-auto rounded-lg border border-slate-700 bg-slate-900 shadow-2xl">
                {isTijoriSearching && <div className="px-3 py-2 text-xs font-mono text-cyan-300">Searching Tijori...</div>}
                {tijoriResults.map((result) => (
                  <button
                    type="button"
                    key={`${result.slug}-${result.name}`}
                    onClick={() => void openTijoriCompany(result)}
                    className="flex w-full items-center justify-between gap-3 border-b border-slate-800 px-3 py-2 text-left hover:bg-cyan-500/10"
                  >
                    <span className="truncate text-xs font-mono text-slate-200">{result.name}</span>
                    <span className="shrink-0 text-[10px] font-mono text-cyan-400">Tijori ↗</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {isTijoriLoading && <div className="text-xs font-mono text-cyan-300">Loading Tijori investment profile...</div>}
          {tijoriError && <div className="text-xs font-mono text-rose-300">{tijoriError}</div>}

          {selectedTijoriCompany && (
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.2fr_1fr_1fr]">
              <button
                type="button"
                onClick={() => setIsTijoriOverviewOpen(true)}
                className="rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-3 text-left transition hover:border-cyan-300/70 hover:bg-cyan-500/10 cursor-pointer"
                aria-label={`Open bird's-eye investment overview for ${selectedTijoriCompany.name}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-white">{selectedTijoriCompany.name}</h3>
                    <p className="mt-1 text-[10px] font-mono uppercase tracking-wider text-cyan-300">Bird&apos;s-eye thesis</p>
                  </div>
                  <Lightbulb className="w-5 h-5 shrink-0 text-amber-400" />
                </div>
                <p className="mt-3 text-xs leading-relaxed text-slate-300">{selectedTijoriCompany.summary}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-[10px] font-mono text-slate-400">
                  <span>Price: <strong className="text-white">{selectedTijoriCompany.currentPrice}</strong></span>
                  <span>Market Cap: <strong className="text-white">{selectedTijoriCompany.marketCap}</strong></span>
                  <span className="text-cyan-300">Click for full overview ↗</span>
                </div>
              </button>
              <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/5 p-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300">Bull case</h4>
                <p className="mt-2 text-xs leading-relaxed text-slate-300">{selectedTijoriCompany.bullCase}</p>
              </div>
              <div className="rounded-lg border border-rose-500/25 bg-rose-500/5 p-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-300">Bear case</h4>
                <p className="mt-2 text-xs leading-relaxed text-slate-300">{selectedTijoriCompany.bearCase}</p>
              </div>
            </div>
          )}
        </div>

        {selectedTijoriCompany && isTijoriOverviewOpen && (
          <div
            className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto bg-black/80 p-2 backdrop-blur-sm sm:items-center sm:p-4"
            onClick={(event) => {
              if (event.target === event.currentTarget) setIsTijoriOverviewOpen(false);
            }}
          >
            <div className="flex max-h-[calc(100dvh-1rem)] w-full max-w-5xl min-w-0 flex-col overflow-hidden rounded-xl border border-cyan-500/40 bg-slate-950 shadow-2xl sm:max-h-[90vh] sm:rounded-2xl">
              <div className="flex min-w-0 items-start justify-between gap-3 border-b border-slate-800 p-3 sm:gap-4 sm:p-5">
                <div className="min-w-0">
                  <p className="text-[9px] font-mono uppercase tracking-wider text-cyan-300 sm:text-[10px]">Tijori Finance | Bird&apos;s-eye investment view</p>
                  <h3 className="mt-1 break-words text-lg font-bold text-white sm:text-xl">{selectedTijoriCompany.name}</h3>
                  <p className="mt-1 text-xs font-mono text-slate-400">Fetched {new Date(selectedTijoriCompany.fetchedAt).toLocaleString()}</p>
                </div>
                <button type="button" onClick={() => setIsTijoriOverviewOpen(false)} className="rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-300 hover:text-white" aria-label="Close investment overview">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="min-w-0 space-y-4 overflow-y-auto overflow-x-hidden p-3 sm:space-y-5 sm:p-5">
                <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
                  {[
                    ["Current price", selectedTijoriCompany.currentPrice],
                    ["Market cap", selectedTijoriCompany.marketCap],
                    ["P/E ratio", selectedTijoriCompany.peRatio],
                    ["EPS", selectedTijoriCompany.eps],
                    ["Revenue", selectedTijoriCompany.reportedRevenue !== "Not reported" ? selectedTijoriCompany.reportedRevenue : selectedTijoriCompany.revenue],
                    ["EBITDA", selectedTijoriCompany.reportedEbitda !== "Not reported" ? selectedTijoriCompany.reportedEbitda : selectedTijoriCompany.ebitda],
                    ["Net profit", selectedTijoriCompany.reportedNetProfit !== "Not reported" ? selectedTijoriCompany.reportedNetProfit : selectedTijoriCompany.netProfit],
                    ["Operating cash flow", selectedTijoriCompany.operatingCashFlow],
                    ["Free cash flow", selectedTijoriCompany.freeCashFlow],
                    ["Cash-flow series", selectedTijoriCompany.reportedCashFlow],
                    ["Net profit margin", selectedTijoriCompany.netProfitMargin],
                    ["ROCE", selectedTijoriCompany.roce],
                    ["Debt / equity", selectedTijoriCompany.debtToEquity],
                  ].map(([label, value]) => (
                    <div key={label} className="min-w-0 rounded-lg border border-slate-800 bg-slate-900 p-3">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">{label}</div>
                      <div className="mt-1 break-words text-sm font-bold text-white">{value}</div>
                    </div>
                  ))}
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300">Business overview</h4>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">{selectedTijoriCompany.summary}</p>
                </div>

                <div className="rounded-lg border border-amber-500/25 bg-amber-500/5 p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">Cash-flow quality</h4>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">{selectedTijoriCompany.cashFlowQuality}</p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300">Bull case</h4>
                    <p className="mt-2 text-sm leading-relaxed text-slate-300">{selectedTijoriCompany.bullCase}</p>
                  </div>
                  <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 p-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-rose-300">Bear case</h4>
                    <p className="mt-2 text-sm leading-relaxed text-slate-300">{selectedTijoriCompany.bearCase}</p>
                  </div>
                </div>

                <a href={selectedTijoriCompany.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex text-xs font-mono text-cyan-300 hover:text-cyan-200">
                  Open full Tijori profile ↗
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Index Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {/* NIFTY 50 */}
          <div
            className={`p-3 rounded-lg border transition-all ${
              priceFlashMap["NIFTY 50"] === "up"
                ? "bg-emerald-500/20 border-emerald-500/70 shadow-lg shadow-emerald-500/10"
                : priceFlashMap["NIFTY 50"] === "down"
                ? "bg-rose-500/20 border-rose-500/70 shadow-lg shadow-rose-500/10"
                : "bg-slate-800/60 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="font-bold text-slate-200">NIFTY 50</span>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[10px] px-1 rounded bg-slate-700/50 text-slate-300 font-semibold">NSE</span>
              </div>
            </div>
            <div className="text-lg font-bold font-mono text-white mt-1">
              ₹{niftyQuote.price.toLocaleString("en-IN", { minimumFractionDigits: 1 })}
            </div>
            <div
              className={`flex items-center gap-1 text-xs font-mono font-semibold ${
                niftyQuote.change >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {niftyQuote.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>
                {niftyQuote.change >= 0 ? "+" : ""}
                {niftyQuote.change.toFixed(1)} ({niftyQuote.changePercent >= 0 ? "+" : ""}
                {niftyQuote.changePercent.toFixed(2)}%)
              </span>
            </div>
            <div className="mt-1.5 pt-1.5 border-t border-slate-700/50 text-[10px] font-mono text-slate-400 space-y-0.5">
              <div className="flex justify-between">
                <span>Day H/L:</span>
                <span className="text-slate-300">
                  {niftyQuote.high?.toLocaleString("en-IN", { maximumFractionDigits: 0 })} / {niftyQuote.low?.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </span>
              </div>
              {niftyQuote.fiftyTwoWeekHigh && (
                <div className="flex justify-between text-[9px] text-slate-500">
                  <span>52W H/L:</span>
                  <span>
                    {niftyQuote.fiftyTwoWeekLow?.toLocaleString("en-IN", { maximumFractionDigits: 0 })} - {niftyQuote.fiftyTwoWeekHigh?.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* SENSEX */}
          <div
            className={`p-3 rounded-lg border transition-all ${
              priceFlashMap["SENSEX"] === "up"
                ? "bg-emerald-500/20 border-emerald-500/70 shadow-lg shadow-emerald-500/10"
                : priceFlashMap["SENSEX"] === "down"
                ? "bg-rose-500/20 border-rose-500/70 shadow-lg shadow-rose-500/10"
                : "bg-slate-800/60 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="font-bold text-slate-200">SENSEX 30</span>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[10px] px-1 rounded bg-slate-700/50 text-slate-300 font-semibold">BSE</span>
              </div>
            </div>
            <div className="text-lg font-bold font-mono text-white mt-1">
              ₹{sensexQuote.price.toLocaleString("en-IN", { minimumFractionDigits: 1 })}
            </div>
            <div
              className={`flex items-center gap-1 text-xs font-mono font-semibold ${
                sensexQuote.change >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {sensexQuote.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>
                {sensexQuote.change >= 0 ? "+" : ""}
                {sensexQuote.change.toFixed(1)} ({sensexQuote.changePercent >= 0 ? "+" : ""}
                {sensexQuote.changePercent.toFixed(2)}%)
              </span>
            </div>
            <div className="mt-1.5 pt-1.5 border-t border-slate-700/50 text-[10px] font-mono text-slate-400 space-y-0.5">
              <div className="flex justify-between">
                <span>Day H/L:</span>
                <span className="text-slate-300">
                  {sensexQuote.high?.toLocaleString("en-IN", { maximumFractionDigits: 0 })} / {sensexQuote.low?.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </span>
              </div>
              {sensexQuote.fiftyTwoWeekHigh && (
                <div className="flex justify-between text-[9px] text-slate-500">
                  <span>52W H/L:</span>
                  <span>
                    {sensexQuote.fiftyTwoWeekLow?.toLocaleString("en-IN", { maximumFractionDigits: 0 })} - {sensexQuote.fiftyTwoWeekHigh?.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* BANK NIFTY */}
          <div
            className={`p-3 rounded-lg border transition-all ${
              priceFlashMap["BANK NIFTY"] === "up"
                ? "bg-emerald-500/20 border-emerald-500/70 shadow-lg shadow-emerald-500/10"
                : priceFlashMap["BANK NIFTY"] === "down"
                ? "bg-rose-500/20 border-rose-500/70 shadow-lg shadow-rose-500/10"
                : "bg-slate-800/60 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="font-bold text-slate-200">BANK NIFTY</span>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[10px] px-1 rounded bg-slate-700/50 text-slate-300 font-semibold">NSE</span>
              </div>
            </div>
            <div className="text-lg font-bold font-mono text-white mt-1">
              ₹{bankNiftyQuote.price.toLocaleString("en-IN", { minimumFractionDigits: 1 })}
            </div>
            <div
              className={`flex items-center gap-1 text-xs font-mono font-semibold ${
                bankNiftyQuote.change >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {bankNiftyQuote.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>
                {bankNiftyQuote.change >= 0 ? "+" : ""}
                {bankNiftyQuote.change.toFixed(1)} ({bankNiftyQuote.changePercent >= 0 ? "+" : ""}
                {bankNiftyQuote.changePercent.toFixed(2)}%)
              </span>
            </div>
            <div className="mt-1.5 pt-1.5 border-t border-slate-700/50 text-[10px] font-mono text-slate-400 space-y-0.5">
              <div className="flex justify-between">
                <span>Day H/L:</span>
                <span className="text-slate-300">
                  {bankNiftyQuote.high?.toLocaleString("en-IN", { maximumFractionDigits: 0 })} / {bankNiftyQuote.low?.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </span>
              </div>
              {bankNiftyQuote.fiftyTwoWeekHigh && (
                <div className="flex justify-between text-[9px] text-slate-500">
                  <span>52W H/L:</span>
                  <span>
                    {bankNiftyQuote.fiftyTwoWeekLow?.toLocaleString("en-IN", { maximumFractionDigits: 0 })} - {bankNiftyQuote.fiftyTwoWeekHigh?.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* INDIA VIX */}
          <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-800 hover:border-slate-700">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="font-bold text-slate-200">INDIA VIX</span>
              <span className="text-[10px] px-1 rounded bg-slate-700/50">VOL</span>
            </div>
            <div className="text-lg font-bold font-mono text-amber-300 mt-1">
              {vixQuote.price.toFixed(2)}
            </div>
            <div
              className={`flex items-center gap-1 text-xs font-mono font-semibold ${
                vixQuote.change <= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              <span>
                {vixQuote.change >= 0 ? "+" : ""}
                {vixQuote.change.toFixed(2)} ({vixQuote.changePercent >= 0 ? "+" : ""}
                {vixQuote.changePercent.toFixed(1)}%)
              </span>
            </div>
            <div className="mt-1.5 pt-1.5 border-t border-slate-700/50 text-[10px] font-mono text-slate-400 flex justify-between">
              <span>Volatility:</span>
              <span className={vixQuote.price < 15 ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                {vixQuote.price < 15 ? "Low Risk" : "Elevated Risk"}
              </span>
            </div>
          </div>

          {/* USD / INR */}
          <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-800 hover:border-slate-700">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="font-bold text-slate-200">USD / INR</span>
              <span className="text-[10px] px-1 rounded bg-slate-700/50">FX</span>
            </div>
            <div className="text-lg font-bold font-mono text-slate-200 mt-1">
              ₹{inrQuote.price.toFixed(2)}
            </div>
            <div className="text-xs font-mono text-slate-400 flex items-center justify-between">
              <span>Change:</span>
              <span className={inrQuote.change >= 0 ? "text-emerald-400" : "text-rose-400"}>
                {inrQuote.change >= 0 ? "+" : ""}{inrQuote.change.toFixed(2)} ({inrQuote.changePercent.toFixed(2)}%)
              </span>
            </div>
            <div className="mt-1.5 pt-1.5 border-t border-slate-700/50 text-[10px] font-mono text-slate-400 flex justify-between">
              <span>Market Status:</span>
              <span className="text-slate-300">Live Forex</span>
            </div>
          </div>

          {/* NSE Breadth & ADR */}
          <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-800 hover:border-slate-700">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="font-bold text-slate-200">NSE ADR RATIO</span>
              <span className={`text-[10px] px-1 rounded font-bold ${
                breadth.adrRatio >= 1.0 ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"
              }`}>
                {breadth.adrRatio.toFixed(2)}
              </span>
            </div>
            <div className="text-xs font-mono mt-1.5 flex items-center justify-between">
              <span className="text-emerald-400 font-bold">{breadth.advances} Adv</span>
              <span className="text-rose-400 font-bold">{breadth.declines} Dec</span>
            </div>
            {/* Visual ratio bar */}
            <div className="w-full h-1.5 bg-slate-700 rounded-full mt-1 overflow-hidden flex">
              <div
                className="bg-emerald-500 h-full transition-all duration-300"
                style={{
                  width: `${(breadth.advances / (breadth.totalTraded || 1)) * 100}%`,
                }}
              ></div>
              <div
                className="bg-rose-500 h-full transition-all duration-300"
                style={{
                  width: `${(breadth.declines / (breadth.totalTraded || 1)) * 100}%`,
                }}
              ></div>
            </div>
            <div className="mt-1.5 text-[10px] font-mono text-slate-400 truncate">
              {breadth.sentiment}
            </div>
          </div>
        </div>

        {/* Institutional FII / DII Flow Strip */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs font-mono gap-3 text-slate-300">
          <div className="flex items-center gap-3">
            <span className="text-slate-400">Institutional Net Flows:</span>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">FII / FPI:</span>
              <span
                className={`font-bold ${
                  fiiDii[0].fiiNetCr >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {fiiDii[0].fiiNetCr > 0 ? "+" : ""}
                {fiiDii[0].fiiNetCr.toLocaleString("en-IN")} Cr
              </span>
            </div>
            <span className="text-slate-600">|</span>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">DII (Mutual Funds):</span>
              <span
                className={`font-bold ${
                  fiiDii[0].diiNetCr >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {fiiDii[0].diiNetCr > 0 ? "+" : ""}
                {fiiDii[0].diiNetCr.toLocaleString("en-IN")} Cr
              </span>
            </div>
            <span className="text-slate-600">|</span>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Net Combined:</span>
              <span
                className={`font-bold ${
                  fiiDii[0].totalNetCr >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                +{fiiDii[0].totalNetCr.toLocaleString("en-IN")} Cr
              </span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <span>Primary Sources:</span>
            <span className="text-orange-400 font-bold">mint</span>
            <span>&</span>
            <span className="text-cyan-400 font-bold">moneycontrol</span>
          </div>
        </div>
      </div>

      {/* 2. Quantitative Indicators Suite & Automated Trend Engine */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold font-mono text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-orange-400" />
              <span>LiveMint Quantitative Indicator Models</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                AUTOMATED WEEKLY TREND ACTIVE
              </span>
            </h3>
            <p className="text-xs font-mono text-slate-400">
              Interactive high-precision graphics with automated weekly trend computation & institutional commentary
            </p>
          </div>

          {/* Indicator Mode Switcher */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700">
            <button
              onClick={() => setActiveIndicator("weekly")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-bold transition ${
                activeIndicator === "weekly"
                  ? "bg-emerald-500 text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Weekly Trend Engine</span>
            </button>
            <button
              onClick={() => setActiveIndicator("lwtd")}
              className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition ${
                activeIndicator === "lwtd"
                  ? "bg-orange-500 text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              1. Nifty & LWTD
            </button>
            <button
              onClick={() => setActiveIndicator("mwpl")}
              className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition ${
                activeIndicator === "mwpl"
                  ? "bg-orange-500 text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              2. MWPL (Position Limits)
            </button>
            <button
              onClick={() => setActiveIndicator("advdec")}
              className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition ${
                activeIndicator === "advdec"
                  ? "bg-orange-500 text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              3. Advance-Decline Ratio
            </button>
            <button
              onClick={() => setActiveIndicator("triple")}
              className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition ${
                activeIndicator === "triple"
                  ? "bg-cyan-500 text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              Triple Panel View
            </button>
            <button
              onClick={() => setActiveIndicator("rotation")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-bold transition ${
                activeIndicator === "rotation"
                  ? "bg-amber-500 text-slate-950 shadow-sm"
                  : "text-amber-400/90 hover:text-amber-300 hover:bg-slate-700/50"
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>S&amp;P 500 Sector Rotation</span>
            </button>
          </div>
        </div>

        {/* ----------------- VIEW: AUTOMATED WEEKLY TREND CALCULATION ENGINE ----------------- */}
        {activeIndicator === "weekly" && (
          <div className="space-y-4">
            {/* Executive Synthesis Banner */}
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-500/20 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-mono font-bold text-emerald-300 uppercase tracking-wider">
                    Automated Weekly Regime Synthesis: {automatedWeeklyTrend.regime}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-slate-400">Confidence:</span>
                  <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                    {automatedWeeklyTrend.confidenceScore}% Algorithm Match
                  </span>
                  <span className="text-slate-500">|</span>
                  <span className="text-slate-400">Auto-Calculated:</span>
                  <span className="text-slate-200">{automatedWeeklyTrend.calculatedAt} IST</span>
                </div>
              </div>

              <p className="text-xs font-mono text-slate-200 leading-relaxed">
                {automatedWeeklyTrend.algorithmicSynthesis.executiveSummary}
              </p>

              {/* Actionable Points */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
                {automatedWeeklyTrend.algorithmicSynthesis.actionableConclusions.map(
                  (conclusion, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-300 flex items-start gap-2"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{conclusion}</span>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* 4 Core Automated Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* 1. Nifty 50 WoW Trend */}
              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-850/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-300">
                    1. Nifty 50 WoW Trend
                  </span>
                  <span
                    className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                      automatedWeeklyTrend.niftyTrend.trendDirection === "bullish"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    }`}
                  >
                    {automatedWeeklyTrend.niftyTrend.trendDirection}
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <span className="text-lg font-bold font-mono text-white">
                    {automatedWeeklyTrend.niftyTrend.currentClose.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                  <span
                    className={`text-xs font-mono font-bold flex items-center gap-1 ${
                      automatedWeeklyTrend.niftyTrend.wowPercentChange >= 0
                        ? "text-emerald-400"
                        : "text-rose-400"
                    }`}
                  >
                    {automatedWeeklyTrend.niftyTrend.wowPercentChange >= 0 ? "+" : ""}
                    {automatedWeeklyTrend.niftyTrend.wowPercentChange.toFixed(2)}%
                  </span>
                </div>

                <div className="text-[11px] font-mono text-slate-400 space-y-0.5 border-t border-slate-800 pt-1.5">
                  <div className="flex justify-between">
                    <span>Prior Week Benchmark:</span>
                    <span className="text-slate-200">
                      {automatedWeeklyTrend.niftyTrend.priorWeekClose.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Absolute Weekly Move:</span>
                    <span
                      className={
                        automatedWeeklyTrend.niftyTrend.wowPointChange >= 0
                          ? "text-emerald-400"
                          : "text-rose-400"
                      }
                    >
                      {automatedWeeklyTrend.niftyTrend.wowPointChange >= 0 ? "+" : ""}
                      {automatedWeeklyTrend.niftyTrend.wowPointChange.toFixed(2)} pts
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. LWTD Aerodynamic Vector */}
              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-850/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-300">
                    2. LWTD Indicator Vector
                  </span>
                  <span
                    className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                      automatedWeeklyTrend.lwtdAerodynamic.currentLWTD >= 0
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    }`}
                  >
                    {automatedWeeklyTrend.lwtdAerodynamic.regime}
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <span
                    className={`text-lg font-bold font-mono ${
                      automatedWeeklyTrend.lwtdAerodynamic.currentLWTD >= 0
                        ? "text-emerald-400"
                        : "text-rose-400"
                    }`}
                  >
                    {automatedWeeklyTrend.lwtdAerodynamic.currentLWTD.toFixed(2)}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    4-Wk MA: {automatedWeeklyTrend.lwtdAerodynamic.weeklyMovingAverage.toFixed(2)}
                  </span>
                </div>

                {/* Lift vs Drag Bar */}
                <div className="space-y-1 border-t border-slate-800 pt-1.5">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-emerald-400">
                      Lift: {automatedWeeklyTrend.lwtdAerodynamic.liftVsDragRatio.liftPercent}%
                    </span>
                    <span className="text-rose-400">
                      Drag: {automatedWeeklyTrend.lwtdAerodynamic.liftVsDragRatio.dragPercent}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden flex">
                    <div
                      className="bg-emerald-400 h-full"
                      style={{
                        width: `${automatedWeeklyTrend.lwtdAerodynamic.liftVsDragRatio.liftPercent}%`,
                      }}
                    />
                    <div
                      className="bg-rose-500 h-full"
                      style={{
                        width: `${automatedWeeklyTrend.lwtdAerodynamic.liftVsDragRatio.dragPercent}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* 3. MWPL Rollover Momentum */}
              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-850/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-300">
                    3. MWPL Swing Leverage
                  </span>
                  <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase">
                    {automatedWeeklyTrend.mwplRollover.swingTraderBias}
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <span className="text-lg font-bold font-mono text-cyan-400">
                    {automatedWeeklyTrend.mwplRollover.currentMWPL.toFixed(2)}%
                  </span>
                  <span className="text-xs font-mono text-slate-300 font-bold">
                    Shift: +{automatedWeeklyTrend.mwplRollover.weeklyShiftPercent.toFixed(2)}%
                  </span>
                </div>

                <div className="text-[11px] font-mono text-slate-400 space-y-0.5 border-t border-slate-800 pt-1.5">
                  <div className="flex justify-between">
                    <span>Cycle High vs Low:</span>
                    <span className="text-slate-200">58.7% / 42.6%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>NSE Expiry Cycle:</span>
                    <span className="text-cyan-300">
                      {automatedWeeklyTrend.mwplRollover.daysToExpiry} Days Remaining
                    </span>
                  </div>
                </div>
              </div>

              {/* 4. Cash Market Breadth (ADR) */}
              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-850/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-300">
                    4. Cash Breadth (ADR)
                  </span>
                  <span
                    className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                      automatedWeeklyTrend.advanceDeclineBreadth.currentRatio >= 1.0
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    }`}
                  >
                    {automatedWeeklyTrend.advanceDeclineBreadth.status}
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <span
                    className={`text-lg font-bold font-mono ${
                      automatedWeeklyTrend.advanceDeclineBreadth.currentRatio >= 1.0
                        ? "text-emerald-400"
                        : "text-rose-400"
                    }`}
                  >
                    {automatedWeeklyTrend.advanceDeclineBreadth.currentRatio.toFixed(2)}
                  </span>
                  <span className="text-xs font-mono text-rose-400 font-bold">
                    {automatedWeeklyTrend.advanceDeclineBreadth.breadthDivergencePercent.toFixed(1)}% vs Par
                  </span>
                </div>

                <div className="text-[11px] font-mono text-slate-400 space-y-0.5 border-t border-slate-800 pt-1.5">
                  <div className="flex justify-between">
                    <span>Active Advances:</span>
                    <span className="text-emerald-400">
                      {automatedWeeklyTrend.advanceDeclineBreadth.advancesCount} Stocks
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Declines:</span>
                    <span className="text-rose-400">
                      {automatedWeeklyTrend.advanceDeclineBreadth.declinesCount} Stocks
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Expected Volatility Range & Collar Analysis */}
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/80 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                <span className="font-bold text-amber-400 flex items-center gap-1.5">
                  <BarChart2 className="w-3.5 h-3.5" />
                  India VIX Expected Weekly Volatility Cone (
                  {automatedWeeklyTrend.expectedVolatilityCone.vixLevel.toFixed(2)} Implied Vol)
                </span>
                <span className="text-slate-400">
                  Expected Weekly Range:{" "}
                  <strong className="text-white">
                    ₹{automatedWeeklyTrend.expectedVolatilityCone.projectedWeeklyRange.lower.toLocaleString("en-IN")}
                    {" — "}
                    ₹{automatedWeeklyTrend.expectedVolatilityCone.projectedWeeklyRange.upper.toLocaleString("en-IN")}
                  </strong>
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px] font-mono">
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block">Immediate Support Collar:</span>
                  <span className="text-emerald-400 font-bold">
                    ₹{automatedWeeklyTrend.expectedVolatilityCone.projectedWeeklyRange.supportLevel.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block">Immediate Resistance Ceiling:</span>
                  <span className="text-rose-400 font-bold">
                    ₹{automatedWeeklyTrend.expectedVolatilityCone.projectedWeeklyRange.resistanceLevel.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block">Expected 1-Standard-Dev Move:</span>
                  <span className="text-cyan-400 font-bold">
                    ±{automatedWeeklyTrend.expectedVolatilityCone.projectedWeeklyRange.expectedPointsMove.toFixed(0)} Points (
                    {automatedWeeklyTrend.expectedVolatilityCone.projectedWeeklyRange.expectedPercentageMove.toFixed(2)}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Compact Mini Chart Preview */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 pb-2">
                <span>Underlying Quantitative Model Graphic:</span>
                <button
                  onClick={() => setActiveIndicator("lwtd")}
                  className="text-orange-400 hover:text-orange-300 underline font-bold"
                >
                  View Full LWTD Interactive Chart &rarr;
                </button>
              </div>
              <MintChartRenderer
                type="lwtd"
                lwtdData={indicators.lwtd.series}
                startDateLabel="1 May 2026"
                endDateLabel="11 Sep 2026"
                isLiveTicking={isLiveActive}
                themeMode={chartTheme}
                onToggleTheme={() =>
                  setChartTheme(chartTheme === "mint-light" ? "terminal-dark" : "mint-light")
                }
              />
            </div>
          </div>
        )}

        {/* Selected Graphic Display: LWTD */}
        {activeIndicator === "lwtd" && (
          <div className="space-y-4">
            <MintChartRenderer
              type="lwtd"
              lwtdData={indicators.lwtd.series}
              startDateLabel="1 May 2026"
              endDateLabel="11 Sep 2026"
              isLiveTicking={isLiveActive}
              themeMode={chartTheme}
              onToggleTheme={() =>
                setChartTheme(chartTheme === "mint-light" ? "terminal-dark" : "mint-light")
              }
            />

            {/* Quantitative Interpretation Card */}
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/70 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-orange-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Aerodynamic Lift-Weight-Thrust-Drag Vector Analysis
                </span>
                <span className="text-slate-400">
                  Current LWTD:{" "}
                  <strong
                    className={
                      indicators.lwtd.endLWTD >= 0 ? "text-emerald-400" : "text-rose-400"
                    }
                  >
                    {indicators.lwtd.endLWTD.toFixed(2)}
                  </strong>{" "}
                  | Nifty WoW:{" "}
                  <strong
                    className={
                      indicators.lwtd.endNiftyWow >= 0 ? "text-emerald-400" : "text-rose-400"
                    }
                  >
                    {indicators.lwtd.endNiftyWow.toFixed(2)}%
                  </strong>
                </span>
              </div>
              <p className="text-xs font-mono text-slate-300 leading-relaxed">
                {indicators.lwtd.interpretation}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2 text-[11px] font-mono">
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block">Lift (Breadth Velocity):</span>
                  <span className="text-slate-200 font-bold">Subdued (42% advancing)</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block">Weight (OI Gravity):</span>
                  <span className="text-amber-400 font-bold">Elevated Put/Call resistance</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block">Thrust (Fresh Longs):</span>
                  <span className="text-rose-400 font-bold">Mild buying conviction</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block">Drag (Hedging / Short Friction):</span>
                  <span className="text-rose-400 font-bold">Active institutional put writing</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeIndicator === "mwpl" && (
          <div className="space-y-4">
            <MintChartRenderer
              type="mwpl"
              mwplData={indicators.mwpl.series}
              startDateLabel="1 May 2026"
              endDateLabel="11 Sep 2026"
              isLiveTicking={isLiveActive}
              themeMode={chartTheme}
              onToggleTheme={() =>
                setChartTheme(chartTheme === "mint-light" ? "terminal-dark" : "mint-light")
              }
            />

            {/* Quantitative Interpretation Card */}
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/70 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-orange-400 flex items-center gap-1.5">
                  <PieChart className="w-3.5 h-3.5" />
                  Derivative Open Interest & Swing Trader Leverage Analysis
                </span>
                <span className="text-slate-400">
                  Current MWPL:{" "}
                  <strong className="text-cyan-400">
                    {indicators.mwpl.endMWPL.toFixed(2)}%
                  </strong>{" "}
                  | Expiry Baseline: <strong>40.0%</strong>
                </span>
              </div>
              <p className="text-xs font-mono text-slate-300 leading-relaxed">
                {indicators.mwpl.interpretation}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-[11px] font-mono">
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block">Peak Cycle High:</span>
                  <span className="text-slate-200 font-bold">58.70% (14 Aug 2026)</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block">Cycle Trough Reset:</span>
                  <span className="text-slate-200 font-bold">42.57% (1 May 2026)</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block">F&O Ban Warning Zone:</span>
                  <span className="text-amber-400 font-bold">Stocks &gt;95% MWPL</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeIndicator === "advdec" && (
          <div className="space-y-4">
            <MintChartRenderer
              type="advdec"
              advDecData={indicators.advDec.series}
              startDateLabel="1 May 2026"
              endDateLabel="11 Sep 2026"
              isLiveTicking={isLiveActive}
              themeMode={chartTheme}
              onToggleTheme={() =>
                setChartTheme(chartTheme === "mint-light" ? "terminal-dark" : "mint-light")
              }
            />

            {/* Quantitative Interpretation Card */}
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/70 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-orange-400 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" />
                  Cash Market Breadth & Intraday Conviction Divergence
                </span>
                <span className="text-slate-400">
                  Adv-Dec Ratio (Weeks Avg):{" "}
                  <strong
                    className={
                      indicators.advDec.endAdvDec >= 1.0 ? "text-emerald-400" : "text-rose-400"
                    }
                  >
                    {indicators.advDec.endAdvDec.toFixed(2)}
                  </strong>
                </span>
              </div>
              <p className="text-xs font-mono text-slate-300 leading-relaxed">
                {indicators.advDec.interpretation}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-[11px] font-mono">
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block">Cycle Start Breadth:</span>
                  <span className="text-emerald-400 font-bold">1.22 (Broad Bullish Participation)</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block">Current Reading:</span>
                  <span className="text-rose-400 font-bold">0.75 (Intraday Conviction Fell Sharply)</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block">Divergence Signal:</span>
                  <span className="text-amber-300 font-bold">Bearish Breadth Divergence</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Triple Panel View: Renders all 3 side-by-side / stacked */}
        {activeIndicator === "triple" && (
          <div className="space-y-6">
            <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono text-cyan-300 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>
                Executive Triple Panel: Side-by-side synchronization of LWTD, MWPL, and Advance-Decline Ratio over the exact same weekly timeline.
              </span>
            </div>

            <div className="space-y-6">
              {/* 1. LWTD */}
              <div className="p-2 rounded-xl bg-slate-800/40 border border-slate-800">
                <MintChartRenderer
                  type="lwtd"
                  lwtdData={indicators.lwtd.series}
                  startDateLabel="1 May 2026"
                  endDateLabel="11 Sep 2026"
                  isLiveTicking={isLiveActive}
                  themeMode={chartTheme}
                  onToggleTheme={() =>
                    setChartTheme(chartTheme === "mint-light" ? "terminal-dark" : "mint-light")
                  }
                />
              </div>

              {/* 2. MWPL */}
              <div className="p-2 rounded-xl bg-slate-800/40 border border-slate-800">
                <MintChartRenderer
                  type="mwpl"
                  mwplData={indicators.mwpl.series}
                  startDateLabel="1 May 2026"
                  endDateLabel="11 Sep 2026"
                  isLiveTicking={isLiveActive}
                  themeMode={chartTheme}
                  onToggleTheme={() =>
                    setChartTheme(chartTheme === "mint-light" ? "terminal-dark" : "mint-light")
                  }
                />
              </div>

              {/* 3. Adv-Dec */}
              <div className="p-2 rounded-xl bg-slate-800/40 border border-slate-800">
                <MintChartRenderer
                  type="advdec"
                  advDecData={indicators.advDec.series}
                  startDateLabel="1 May 2026"
                  endDateLabel="11 Sep 2026"
                  isLiveTicking={isLiveActive}
                  themeMode={chartTheme}
                  onToggleTheme={() =>
                    setChartTheme(chartTheme === "mint-light" ? "terminal-dark" : "mint-light")
                  }
                />
              </div>
            </div>
          </div>
        )}

        {/* 5. S&P 500 Sector Rotation View within Indicators Pane */}
        {activeIndicator === "rotation" && (
          <div className="pt-2">
            <FinvizSectorRotation onSelectTicker={onNavigateToTicker} />
          </div>
        )}
      </div>

      {/* 3. Top 10 Indian NSE Heavyweight Equities Watchlist */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold font-mono text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-cyan-400" />
              <span>NSE Top Heavyweight Equities (Live Watchlist)</span>
            </h3>
            <p className="text-xs font-mono text-slate-400">
              Live quotes, valuation multiples, and intraday price dynamics in Indian Rupees (₹)
            </p>
          </div>

          {/* Search and Sector Filter */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search ticker (e.g. INFY, TCS)..."
              value={stockSearch}
              onChange={(e) => setStockSearch(e.target.value)}
              className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />

            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Sectors</option>
              <option value="Software">IT / Software</option>
              <option value="Bank">Banking</option>
              <option value="Oil">Energy / Oil</option>
              <option value="Auto">Automobile</option>
              <option value="FMCG">FMCG</option>
            </select>
          </div>
        </div>

        {/* Equities Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase">
                <th className="py-2.5 px-3">Symbol & Company</th>
                <th className="py-2.5 px-3">Sector</th>
                <th className="py-2.5 px-3 text-right">LTP (₹)</th>
                <th className="py-2.5 px-3 text-right">1D Change</th>
                <th className="py-2.5 px-3 text-right">Volume</th>
                <th className="py-2.5 px-3 text-right">P/E Ratio</th>
                <th className="py-2.5 px-3 text-right">Market Cap</th>
                <th className="py-2.5 px-3 text-center">Trend</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredStocks.map((stock) => {
                const isPositive = stock.change >= 0;
                return (
                  <tr key={stock.symbol} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>{stock.symbol}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                        {stock.name}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-300 text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700/50">
                        {stock.sector.split("/")[0]}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-white">
                      ₹{stock.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className={`py-3 px-3 text-right font-bold ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>
                      {isPositive ? "+" : ""}
                      {stock.change.toFixed(2)} ({isPositive ? "+" : ""}
                      {stock.changePercent.toFixed(2)}%)
                    </td>
                    <td className="py-3 px-3 text-right text-slate-300">
                      {(stock.volume / 100000).toFixed(2)} Lakh
                    </td>
                    <td className="py-3 px-3 text-right text-slate-300 font-semibold">
                      {stock.peRatio.toFixed(1)}x
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-amber-300">
                      {stock.marketCapCr}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                          stock.trend === "bullish"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            : stock.trend === "bearish"
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                            : "bg-slate-700/50 text-slate-300"
                        }`}
                      >
                        {stock.trend}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      {onNavigateToTicker ? (
                        <button
                          onClick={() => onNavigateToTicker(stock.symbol.replace(".NS", ""))}
                          className="px-2 py-1 rounded bg-cyan-500/15 hover:bg-cyan-500/30 border border-cyan-500/30 text-cyan-300 text-[11px] transition font-bold"
                          title="Run full Quantum Alpha Committee analysis on this ticker"
                        >
                          Analyze
                        </button>
                      ) : (
                        <span className="text-slate-500 text-[10px]">NSE Active</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Indian Value Buying Screener (Tijori Curated) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold font-mono text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span>Indian Stock Screener — Value Buying (Tijori)</span>
            </h3>
            <p className="text-xs font-mono text-slate-400">
              Curated shortlist from Tijori metrics with valuation and quality filters (P/E, P/B, ROE, Debt/Equity)
            </p>
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            Source: <span className="text-emerald-300 font-semibold">{tijoriSource}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase">
                <th scope="col" className="py-2.5 px-3">Stock</th>
                <th scope="col" className="py-2.5 px-3">Sector</th>
                <th scope="col" className="py-2.5 px-3 text-right">CMP (₹)</th>
                <th scope="col" className="py-2.5 px-3 text-right">P/E</th>
                <th scope="col" className="py-2.5 px-3 text-right">P/B</th>
                <th scope="col" className="py-2.5 px-3 text-right">ROE %</th>
                <th scope="col" className="py-2.5 px-3 text-right">Debt/Equity</th>
                <th scope="col" className="py-2.5 px-3 text-right">MCap (₹ Cr)</th>
                <th scope="col" className="py-2.5 px-3 text-center">Value Score</th>
                <th scope="col" className="py-2.5 px-3">Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {tijoriValueStocks.map((stock) => {
                const safeSourceUrl = toSafeTijoriUrl(stock.sourceUrl);
                return (
                <tr key={stock.symbol} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3">
                    {safeSourceUrl ? (
                      <a
                        href={safeSourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${stock.symbol} source link (opens in a new tab)`}
                        className="font-bold text-cyan-300 hover:text-cyan-200 inline-flex items-center gap-1"
                      >
                        <span>{stock.symbol}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="font-bold text-white">{stock.symbol}</span>
                    )}
                    <div className="text-[11px] text-slate-400 truncate max-w-[220px]">{stock.name}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-300 text-[11px]">{stock.sector}</td>
                  <td className="py-3 px-3 text-right text-white font-semibold">{stock.cmp.toFixed(2)}</td>
                  <td className="py-3 px-3 text-right text-slate-200">{stock.peRatio.toFixed(1)}x</td>
                  <td className="py-3 px-3 text-right text-slate-200">{stock.pbRatio.toFixed(1)}x</td>
                  <td className="py-3 px-3 text-right text-emerald-400 font-semibold">{stock.roePercent.toFixed(1)}%</td>
                  <td className="py-3 px-3 text-right text-slate-300">{stock.debtToEquity.toFixed(2)}</td>
                  <td className="py-3 px-3 text-right text-amber-300 font-semibold">
                    {stock.marketCapCr.toLocaleString("en-IN")}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold">
                      {stock.valueScore}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-300 text-[11px] max-w-[280px]">{stock.valueRationale}</td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Multi-Agent Hedge Fund Committee Briefing on Indian Equities */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold font-mono text-white flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Quantum Alpha Committee Assessment: Indian Macro & Equity Strategy</span>
          </h3>
          <p className="text-xs font-mono text-slate-400">
            Multi-agent consensus synthesis synthesizing LWTD (-0.10), MWPL (51.2%), and Advance-Decline (0.75) readings
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* CIO Verdict */}
          <div className="p-4 rounded-lg bg-slate-800/50 border border-amber-500/30 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span className="font-bold text-xs font-mono text-amber-300">
                Marcus Vance (CIO) — Allocation Verdict
              </span>
            </div>
            <p className="text-xs font-mono text-slate-300 leading-relaxed">
              "India remains one of the world's most resilient secular compounding stories, but current quantitative breadth indicates valuation friction. With Nifty trading at 22.8x forward P/E and LWTD submerged at -0.10, fresh index-level buying should be restrained. We maintain a selective stock-picker mandate: overweight Private Banks & Healthcare, underweight high-beta discretionary."
            </p>
          </div>

          {/* CRO Risk Audit */}
          <div className="p-4 rounded-lg bg-slate-800/50 border border-rose-500/30 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-400"></span>
              <span className="font-bold text-xs font-mono text-rose-300">
                Rachel Stern (CRO) — Downside Risk Audit
              </span>
            </div>
            <p className="text-xs font-mono text-slate-300 leading-relaxed">
              "The collapse in the Advance-Decline ratio to 0.75 is an unambiguous warning that intraday institutional conviction is deteriorating. Moreover, MWPL at 51.20% shows swing traders are unwinding long exposure. If Nifty violates the 25,200 support collar, algorithmic stop-losses will trigger a cascade toward 24,800. Strict 2% portfolio stop-loss buffers are mandated."
            </p>
          </div>

          {/* Macro Strategist */}
          <div className="p-4 rounded-lg bg-slate-800/50 border border-blue-500/30 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              <span className="font-bold text-xs font-mono text-blue-300">
                Henrik Lindqvist — Indian Macro Sentinel
              </span>
            </div>
            <p className="text-xs font-mono text-slate-300 leading-relaxed">
              "Macro fundamentals provide a firm floor: RBI repo rate remains steady at 6.50% with CPI inflation anchored near 4.2%. Brent crude softening below $75/bbl provides structural relief for India's trade deficit and INR stability (83.92). While foreign institutional selling exerts short-term pressure, domestic mutual fund SIP flows (~₹23,000 Cr/month) absorb supply."
            </p>
          </div>
        </div>
      </div>

      {/* 6. Finviz S&P 500 Sector & Industry Rotation Section */}
      <div id="sp500-sector-rotation" className="pt-2">
        <FinvizSectorRotation onSelectTicker={onNavigateToTicker} />
      </div>
    </div>
  );
};
