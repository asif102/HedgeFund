import React, { useState, useEffect, useMemo } from "react";
import { BENCHMARK_CASES } from "./data/benchmarkCases";
import {
  HedgeFundAnalysisResult,
  AgentId,
  MarketQuote,
  FinancialNewsItem,
  StrategyType,
} from "./types";
import { AgentRosterHeader } from "./components/AgentRosterHeader";
import { TargetSearchBar } from "./components/TargetSearchBar";
import { SummarySnapshotBar } from "./components/SummarySnapshotBar";
import { Phase1SegregatedResearch } from "./components/Phase1SegregatedResearch";
import { Phase2InternalDebate } from "./components/Phase2InternalDebate";
import { Phase3Memorandum } from "./components/Phase3Memorandum";
import { ScenarioModeling } from "./components/ScenarioModeling";
import { LiveMarketFeedBar } from "./components/LiveMarketFeedBar";
import { LiveFinancialNewsFeed } from "./components/LiveFinancialNewsFeed";
import { HistoricalBacktester } from "./components/HistoricalBacktester";
import { SwarmLensAnimation } from "./components/SwarmLensAnimation";
import { IndianEquityDesk } from "./components/IndianEquityDesk";
import { FinvizSectorRotation } from "./components/FinvizSectorRotation";
import {
  getLiveMarketQuote,
  getFinancialNewsFeed,
  fetchLiveFinvizQuote,
} from "./data/marketDataService";
import {
  FileText,
  Layers,
  Swords,
  SlidersHorizontal,
  Loader2,
  Sparkles,
  CheckCircle2,
  BarChart3,
  Newspaper,
  TrendingUp,
  Activity,
  Compass,
  Sun,
  Moon,
} from "lucide-react";

function getTickerSymbol(target: string): string {
  if (!target) return "NVDA";
  const clean = target.trim().toUpperCase();
  if (clean.includes("NVDA") || clean.includes("NVIDIA")) return "NVDA";
  if (clean.includes("ASML")) return "ASML";
  if (clean.includes("TSLA") || clean.includes("TESLA")) return "TSLA";
  if (clean.includes("PLTR") || clean.includes("PALANTIR")) return "PLTR";
  if (clean.includes("MSFT") || clean.includes("MICROSOFT")) return "MSFT";
  if (clean.includes("AAPL") || clean.includes("APPLE")) return "AAPL";
  if (clean.includes("AMD")) return "AMD";
  if (clean.includes("GOOG") || clean.includes("ALPHABET")) return "GOOGL";
  if (clean.includes("AMZN") || clean.includes("AMAZON")) return "AMZN";
  if (clean.includes("META")) return "META";

  const match = target.match(/\b([A-Z]{2,5})\b/);
  if (match) return match[1];

  const firstToken = target.split(/[\s(]/)[0].toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 5);
  return firstToken || "NVDA";
}

export default function App() {
  const [selectedBenchmark, setSelectedBenchmark] = useState<string>("NVDA");
  const [currentAnalysis, setCurrentAnalysis] = useState<HedgeFundAnalysisResult>(
    BENCHMARK_CASES["NVDA"]
  );
  const [activeTab, setActiveTab] = useState<
    "swarm" | "memorandum" | "phase1" | "phase2" | "backtester" | "scenarios" | "news" | "india" | "rotation"
  >("swarm");
  const [activeAgentFilter, setActiveAgentFilter] = useState<AgentId | "all">("all");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [loadingPhase, setLoadingPhase] = useState<number>(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window === "undefined") return "dark";
    return window.localStorage.getItem("quantum-alpha-theme") === "light" ? "light" : "dark";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("quantum-alpha-theme", theme);
  }, [theme]);

  // Backtest Strategy State (Selected via Agent Dossier or Research Card)
  const [backtestStrategy, setBacktestStrategy] =
    useState<StrategyType>("agentic_consensus");

  // Real-Time Market Data & Auto-Refresh Engine State
  const activeTicker = useMemo(
    () => getTickerSymbol(currentAnalysis.target),
    [currentAnalysis.target]
  );
  const [marketQuote, setMarketQuote] = useState<MarketQuote>(() =>
    getLiveMarketQuote(getTickerSymbol(BENCHMARK_CASES["NVDA"].target))
  );
  const [financialNews, setFinancialNews] = useState<FinancialNewsItem[]>(() =>
    getFinancialNewsFeed(getTickerSymbol(BENCHMARK_CASES["NVDA"].target))
  );
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [refreshInterval, setRefreshInterval] = useState<number>(10);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(10);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Helper to fetch live quote directly from Finviz backend proxy
  const fetchFinvizLive = async (sym: string) => {
    try {
      const liveQuote = await fetchLiveFinvizQuote(sym);
      if (liveQuote) {
        setMarketQuote(liveQuote);
      }
    } catch (e) {
      console.warn("Finviz live fetch error:", e);
    }
  };

  // Sync quote when activeTicker changes
  useEffect(() => {
    setMarketQuote(getLiveMarketQuote(activeTicker));
    setFinancialNews(getFinancialNewsFeed(activeTicker));
    setCountdownSeconds(refreshInterval);
    // Asynchronously update with live finviz.com data
    fetchFinvizLive(activeTicker);
  }, [activeTicker, refreshInterval]);

  // Interval timer for real-time automatic refreshes
  useEffect(() => {
    if (!autoRefresh) return;
    const timer = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          const updatedQuote = getLiveMarketQuote(activeTicker);
          setMarketQuote(updatedQuote);
          fetchFinvizLive(activeTicker);
          return refreshInterval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRefresh, refreshInterval, activeTicker]);

  // Manual Force Refresh
  const handleManualRefresh = () => {
    setIsRefreshing(true);
    const updatedQuote = getLiveMarketQuote(activeTicker);
    const updatedNews = getFinancialNewsFeed(activeTicker);
    setMarketQuote(updatedQuote);
    setFinancialNews(updatedNews);
    setCountdownSeconds(refreshInterval);
    fetchFinvizLive(activeTicker);
    setTimeout(() => setIsRefreshing(false), 450);
  };

  // Handler for running agent strategy in backtester
  const handleRunAgentStrategy = (strategyId: StrategyType) => {
    setBacktestStrategy(strategyId);
    setActiveTab("backtester");
  };

  const handleSelectBenchmark = (key: string) => {
    if (BENCHMARK_CASES[key]) {
      setSelectedBenchmark(key);
      setCurrentAnalysis(BENCHMARK_CASES[key]);
      setErrorMessage(null);
      const sym = getTickerSymbol(BENCHMARK_CASES[key].target);
      fetchFinvizLive(sym);
    }
  };

  const handleCustomSearch = async (target: string) => {
    const upper = target.toUpperCase().trim();
    const candidateTicker = getTickerSymbol(target);
    if (candidateTicker) {
      // Immediately trigger live Finviz fetch
      fetchFinvizLive(candidateTicker);
    }

    // 1. Instant check for known institutional benchmarks
    if (BENCHMARK_CASES[upper]) {
      handleSelectBenchmark(upper);
      return;
    }
    if (upper.includes("MSFT") || upper.includes("MICROSOFT")) {
      handleSelectBenchmark("MSFT");
      return;
    }
    if (upper.includes("NVDA") || upper.includes("NVIDIA")) {
      handleSelectBenchmark("NVDA");
      return;
    }
    if (upper.includes("ASML")) {
      handleSelectBenchmark("ASML");
      return;
    }
    if (upper.includes("TSLA") || upper.includes("TESLA")) {
      handleSelectBenchmark("TSLA");
      return;
    }
    if (upper.includes("PLTR") || upper.includes("PALANTIR")) {
      handleSelectBenchmark("PLTR");
      return;
    }
    if (target.toLowerCase().includes("quantum")) {
      handleSelectBenchmark("Quantum Computing Hardware");
      return;
    }

    // 2. Call backend API with Gemini AI
    setIsAnalyzing(true);
    setErrorMessage(null);
    setLoadingPhase(1);

    // Progressive phase feedback
    const phaseTimer1 = setTimeout(() => setLoadingPhase(2), 2500);
    const phaseTimer2 = setTimeout(() => setLoadingPhase(3), 5500);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target }),
      });

      const json = await res.json();
      if (res.ok && json.data) {
        setCurrentAnalysis(json.data);
        setSelectedBenchmark(target);
        setActiveTab("memorandum");
      } else {
        let msg = json.error || "Analysis pipeline encountered a timeout.";
        try {
          if (typeof msg === "string" && (msg.startsWith("{") || msg.includes('"message":'))) {
            const parsed = JSON.parse(msg);
            msg = parsed?.error?.message || parsed?.message || msg;
          }
        } catch {}

        if (msg.includes("503") || msg.includes("high demand") || msg.includes("UNAVAILABLE")) {
          setErrorMessage(
            "Google Gemini model is currently experiencing high demand (HTTP 503). Institutional coverage loaded."
          );
        } else if (json.code === "NO_API_KEY") {
          setErrorMessage(
            "Gemini API key not detected in server environment. Loaded institutional benchmark coverage."
          );
        } else {
          setErrorMessage(msg);
        }

        // Fallback to matched or default benchmark
        if (BENCHMARK_CASES[upper]) {
          setCurrentAnalysis(BENCHMARK_CASES[upper]);
          setSelectedBenchmark(upper);
        } else if (upper.includes("MSFT")) {
          setCurrentAnalysis(BENCHMARK_CASES["MSFT"]);
          setSelectedBenchmark("MSFT");
        } else if (!BENCHMARK_CASES[selectedBenchmark]) {
          setCurrentAnalysis(BENCHMARK_CASES["NVDA"]);
          setSelectedBenchmark("NVDA");
        }
      }
    } catch (err: any) {
      console.warn("Analysis request note:", err?.message || err);
      setErrorMessage(
        "Network connection to Quantum Alpha Committee timed out. Loaded institutional benchmark archive."
      );
    } finally {
      clearTimeout(phaseTimer1);
      clearTimeout(phaseTimer2);
      setIsAnalyzing(false);
    }
  };

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-amber-500 selection:text-slate-950 ${theme === "light" ? "theme-light" : ""}`}>
      <button
        type="button"
        onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
        className="fixed right-4 top-4 z-[200] flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/95 px-3 py-2 text-xs font-mono font-bold text-slate-200 shadow-lg backdrop-blur transition hover:border-amber-400 hover:text-white"
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      >
        {theme === "dark" ? <Sun className="h-4 w-4 text-amber-300" /> : <Moon className="h-4 w-4 text-cyan-300" />}
        <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
      </button>
      {/* 1. Top Agent Roster Header */}
      <AgentRosterHeader
        activeAgent={activeAgentFilter}
        onSelectAgent={(agentId) => {
          setActiveAgentFilter(agentId);
          if (agentId !== "all" && activeTab !== "phase1") {
            setActiveTab("phase1");
          }
        }}
        isAnalyzing={isAnalyzing}
        currentPhase={loadingPhase}
        currentSymbol={activeTicker}
        onRunAgentStrategy={handleRunAgentStrategy}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />

      {/* 2. Target Search Bar & System Prompt Initialization Banner */}
      <TargetSearchBar
        currentTarget={currentAnalysis.target}
        onSearch={handleCustomSearch}
        isAnalyzing={isAnalyzing}
        selectedBenchmark={selectedBenchmark}
        onSelectBenchmark={handleSelectBenchmark}
        error={errorMessage}
      />

      {/* 3. Real-Time Market Data Feeds Bar (Live Ticker, Bid/Ask, Auto-Refresh Controls) */}
      <LiveMarketFeedBar
        quote={marketQuote}
        onManualRefresh={handleManualRefresh}
        isRefreshing={isRefreshing}
        autoRefresh={autoRefresh}
        onToggleAutoRefresh={setAutoRefresh}
        refreshInterval={refreshInterval}
        onChangeInterval={(sec) => {
          setRefreshInterval(sec);
          setCountdownSeconds(sec);
        }}
        countdownSeconds={countdownSeconds}
        onOpenNewsFeed={() => setActiveTab("news")}
        onOpenSwarmTerminal={() => setActiveTab("swarm")}
        onOpenIndianDesk={() => setActiveTab("india")}
      />

      {/* 4. Executive Snapshot Header with Connected Live Tape */}
      <SummarySnapshotBar
        target={currentAnalysis.target}
        category={currentAnalysis.category}
        snapshot={currentAnalysis.summarySnapshot}
        livePrice={marketQuote.price}
        liveChangePercent={marketQuote.changePercent}
      />

      {/* 5. Main Navigation Tabs */}
      <div className="border-b border-slate-800 bg-slate-900/50 sticky top-[138px] z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between overflow-x-auto scrollbar-none py-1">
          <nav className="flex space-x-1 sm:space-x-2">
            {/* Tab: Swarm Terminal ("The Lens") */}
            <button
              id="tab-swarm"
              onClick={() => setActiveTab("swarm")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono font-medium transition whitespace-nowrap ${
                activeTab === "swarm"
                  ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/25"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Swarm Terminal ("The Lens")</span>
              <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                SWARM LIVE
              </span>
            </button>

            {/* Tab: Final Memorandum */}
            <button
              id="tab-memorandum"
              onClick={() => setActiveTab("memorandum")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono font-medium transition whitespace-nowrap ${
                activeTab === "memorandum"
                  ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Investment Memorandum (Phase 3)</span>
            </button>

            {/* Tab: Phase 1 Segregated Research */}
            <button
              id="tab-phase1"
              onClick={() => setActiveTab("phase1")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono font-medium transition whitespace-nowrap ${
                activeTab === "phase1"
                  ? "bg-blue-500 text-white font-bold shadow-md shadow-blue-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Segregated Research (Phase 1)</span>
              {activeAgentFilter !== "all" && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-300"></span>
              )}
            </button>

            {/* Tab: Phase 2 Internal Debate */}
            <button
              id="tab-phase2"
              onClick={() => setActiveTab("phase2")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono font-medium transition whitespace-nowrap ${
                activeTab === "phase2"
                  ? "bg-rose-500 text-white font-bold shadow-md shadow-rose-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Swords className="w-3.5 h-3.5" />
              <span>Internal Debate & Stress-Test (Phase 2)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/30 text-rose-200">
                {currentAnalysis.phase2InternalDebate.length}
              </span>
            </button>

            {/* Tab: Quantitative Backtester (Explicit User Request) */}
            <button
              id="tab-backtester"
              onClick={() => setActiveTab("backtester")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono font-medium transition whitespace-nowrap ${
                activeTab === "backtester"
                  ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Historical Backtester</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-400/20 text-cyan-300 font-bold uppercase">
                Quant Engine
              </span>
            </button>

            {/* Tab: Scenario Modeling */}
            <button
              id="tab-scenarios"
              onClick={() => setActiveTab("scenarios")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono font-medium transition whitespace-nowrap ${
                activeTab === "scenarios"
                  ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Scenario & Risk Engine</span>
            </button>

            {/* Tab: Financial News Wire */}
            <button
              id="tab-news"
              onClick={() => setActiveTab("news")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono font-medium transition whitespace-nowrap ${
                activeTab === "news"
                  ? "bg-indigo-500 text-white font-bold shadow-md shadow-indigo-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Newspaper className="w-3.5 h-3.5" />
              <span>News Wire</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/30 text-indigo-200">
                {financialNews.length}
              </span>
            </button>

            {/* Tab: Indian Equity Desk (Mint / Moneycontrol / NSE) */}
            <button
              id="tab-india"
              onClick={() => setActiveTab("india")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono font-medium transition whitespace-nowrap ${
                activeTab === "india"
                  ? "bg-orange-500 text-white font-bold shadow-md shadow-orange-500/25"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <span className="text-sm leading-none">🇮🇳</span>
              <span>Indian Equities (NSE/Mint)</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-orange-600/40 text-orange-200 font-bold uppercase border border-orange-400/30">
                Live Quant
              </span>
            </button>

            {/* Tab: S&P 500 Sector Rotation (Finviz) */}
            <button
              id="tab-rotation"
              onClick={() => setActiveTab("rotation")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono font-medium transition whitespace-nowrap ${
                activeTab === "rotation"
                  ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/25"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>S&amp;P 500 Sector Rotation</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-bold uppercase border border-amber-400/30">
                Finviz
              </span>
            </button>
          </nav>

          <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono text-slate-400">
            <span>Mandate: <strong className="text-slate-200">Institutional Fiduciary</strong></span>
          </div>
        </div>
      </div>

      {/* 6. Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:px-6">
        {isAnalyzing ? (
          <div className="space-y-6">
            <div className="py-6 flex flex-col items-center justify-center text-center space-y-4 bg-slate-900/60 rounded-xl border border-slate-800 p-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-slate-800 border-t-amber-500 animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-amber-400 text-base">
                  Ω
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold font-mono text-white">
                  Quantum Alpha Committee in Session
                </h3>
                <p className="text-xs font-mono text-slate-400 max-w-md">
                  {loadingPhase === 1 && "Phase 1: Segregated agents researching balance sheets, tech stack, and macro factors..."}
                  {loadingPhase === 2 && "Phase 2: CRO challenging Equity Analyst & CTO; debating downside risk and thesis breakers..."}
                  {loadingPhase === 3 && "Phase 3: CIO synthesizing internal debate into definitive Investment Memorandum..."}
                </p>
              </div>

              {/* Progress Step Indicators */}
              <div className="flex items-center gap-2 text-xs font-mono flex-wrap justify-center">
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${
                    loadingPhase >= 1
                      ? "bg-blue-500/20 text-blue-300 border-blue-500/50"
                      : "bg-slate-900 text-slate-600 border-slate-800"
                  }`}
                >
                  {loadingPhase > 1 ? <CheckCircle2 className="w-3 h-3" /> : <Loader2 className="w-3 h-3 animate-spin" />}
                  <span>Phase 1: Research</span>
                </div>

                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${
                    loadingPhase >= 2
                      ? "bg-rose-500/20 text-rose-300 border-rose-500/50"
                      : "bg-slate-900 text-slate-600 border-slate-800"
                  }`}
                >
                  {loadingPhase > 2 ? <CheckCircle2 className="w-3 h-3" /> : loadingPhase === 2 ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                  <span>Phase 2: Debate</span>
                </div>

                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${
                    loadingPhase >= 3
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                      : "bg-slate-900 text-slate-600 border-slate-800"
                  }`}
                >
                  {loadingPhase === 3 ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                  <span>Phase 3: CIO Memo</span>
                </div>
              </div>
            </div>

            {/* Live Interactive Swarm Lens during processing */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
                <span className="flex items-center gap-1.5 text-cyan-300 font-bold">
                  <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" /> Live Swarm Telemetry & Consensus Synthesis
                </span>
                <span className="text-emerald-400 font-semibold">SYNTHESIS IN FLIGHT</span>
              </div>
              <SwarmLensAnimation
                quote={marketQuote}
                currentTarget={currentAnalysis.target}
                onNavigateToAgent={(agentId) => {
                  setActiveAgentFilter(agentId as any);
                  setActiveTab("phase1");
                }}
                onNavigateToTab={(tab) => setActiveTab(tab)}
              />
            </div>
          </div>
        ) : (
          <div>
            {activeTab === "swarm" && (
              <SwarmLensAnimation
                quote={marketQuote}
                currentTarget={currentAnalysis.target}
                onNavigateToAgent={(agentId) => {
                  setActiveAgentFilter(agentId as any);
                  setActiveTab("phase1");
                }}
                onNavigateToTab={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === "memorandum" && (
              <Phase3Memorandum
                memorandum={currentAnalysis.phase3Memorandum}
                target={currentAnalysis.target}
                onRunBacktest={handleRunAgentStrategy}
              />
            )}

            {activeTab === "phase1" && (
              <Phase1SegregatedResearch
                data={currentAnalysis.phase1SegregatedResearch}
                activeFilter={activeAgentFilter}
                onSelectAgent={setActiveAgentFilter}
                onRunAgentStrategy={handleRunAgentStrategy}
              />
            )}

            {activeTab === "phase2" && (
              <Phase2InternalDebate turns={currentAnalysis.phase2InternalDebate} />
            )}

            {activeTab === "backtester" && (
              <HistoricalBacktester
                currentSymbol={activeTicker}
                initialStrategy={backtestStrategy}
              />
            )}

            {activeTab === "scenarios" && (
              <div className="space-y-6">
                <ScenarioModeling
                  target={currentAnalysis.target}
                  recommendation={currentAnalysis.summarySnapshot.recommendation}
                />
                <Phase3Memorandum
                  memorandum={currentAnalysis.phase3Memorandum}
                  target={currentAnalysis.target}
                />
              </div>
            )}

            {activeTab === "news" && (
              <LiveFinancialNewsFeed
                news={financialNews}
                symbol={activeTicker}
                onRefreshNews={handleManualRefresh}
                isRefreshing={isRefreshing}
              />
            )}

            {activeTab === "india" && (
              <IndianEquityDesk
                onNavigateToTicker={(ticker) => {
                  handleCustomSearch(ticker);
                  setActiveTab("memorandum");
                }}
              />
            )}

            {activeTab === "rotation" && (
              <FinvizSectorRotation
                onSelectTicker={(ticker) => {
                  handleCustomSearch(ticker);
                  setActiveTab("memorandum");
                }}
              />
            )}
          </div>
        )}
      </main>

      {/* 7. Institutional Terminal Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 px-4 sm:px-6 text-xs font-mono text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Quantum Alpha Capital Multi-Agent System • Real-Time Tape & Backtester v3.8</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>CIO: Marcus Vance</span>
            <span>Equity: Elena Rostova</span>
            <span>CTO: Aris Thorne</span>
            <span>Macro: Henrik Lindqvist</span>
            <span>CRO: Rachel Stern</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
