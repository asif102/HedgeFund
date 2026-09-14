import React, { useState, useMemo } from "react";
import {
  BacktestConfig,
  BacktestResult,
  BacktestTimeframe,
  StrategyType,
} from "../types";
import { runBacktestSimulation } from "../data/backtestEngine";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  Percent,
  ShieldAlert,
  ShieldCheck,
  Play,
  Settings2,
  Sliders,
  DollarSign,
  Calendar,
  Layers,
  Award,
  AlertCircle,
  Briefcase,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  Filter,
} from "lucide-react";

interface HistoricalBacktesterProps {
  currentSymbol: string;
  onSelectSymbol?: (symbol: string) => void;
  initialStrategy?: StrategyType;
}

const STRATEGY_PRESETS: Array<{
  id: StrategyType;
  name: string;
  category: "agent" | "fund";
  agentName?: string;
  description: string;
  badge: string;
  defaultConfig: Partial<BacktestConfig>;
}> = [
  // 5 Agent Unique Strategies
  {
    id: "agent_cio_momentum",
    name: "Dr. Marcus Vance (CIO) — Macro-Fundamental Core Long",
    category: "agent",
    agentName: "Dr. Marcus Vance (CIO)",
    description:
      "Synthesizes macro regime direction with long-term fundamental quality. Enters when EMA 20 > EMA 50 with accumulation RSI (42-66), protected by an 8% trailing stop.",
    badge: "CIO STRATEGY",
    defaultConfig: {
      positionSizePct: 100,
      stopLossPct: 8,
      takeProfitPct: 35,
      enableCroHedging: true,
      fastEma: 20,
      slowEma: 50,
    },
  },
  {
    id: "agent_equity_value",
    name: "Elena Rostova, CFA — Deep Value & Quality Reversion",
    category: "agent",
    agentName: "Elena Rostova (Equity Lead)",
    description:
      "Exploits market overreactions on resilient cash-flow compounders. Buys at oversold Lower Bollinger Bands (RSI ≤ 34) and exits at fair value (Upper Band / RSI 68).",
    badge: "EQUITY VALUE",
    defaultConfig: {
      positionSizePct: 85,
      stopLossPct: 7,
      takeProfitPct: 22,
      rsiOversold: 34,
      rsiOverbought: 68,
      enableCroHedging: true,
    },
  },
  {
    id: "agent_cto_breakout",
    name: "Dr. Aris Thorne — Secular Tech Breakout & Growth",
    category: "agent",
    agentName: "Dr. Aris Thorne (CTO)",
    description:
      "Rides exponential tech adoption curves. Enters on 20-day breakout with volume surge (>1.15x) and rides momentum until trailing 15-day floor is tested.",
    badge: "CTO BREAKOUT",
    defaultConfig: {
      positionSizePct: 100,
      stopLossPct: 9,
      takeProfitPct: 45,
      enableCroHedging: false,
    },
  },
  {
    id: "agent_macro_regime",
    name: "Henrik Lindqvist — Monetary Regime & Yield Filter",
    category: "agent",
    agentName: "Henrik Lindqvist (Macro)",
    description:
      "Filters equity exposure through global monetary liquidity and interest rate trends. Requires price > EMA 20 & 50; exits on macro trend breakdown.",
    badge: "MACRO REGIME",
    defaultConfig: {
      positionSizePct: 90,
      stopLossPct: 6,
      takeProfitPct: 30,
      fastEma: 20,
      slowEma: 50,
      enableCroHedging: true,
    },
  },
  {
    id: "agent_cro_hedge",
    name: "Rachel Stern, FRM — Asymmetric Protective Collar & Downside Hedging",
    category: "agent",
    agentName: "Rachel Stern (CRO Bear)",
    description:
      "Capital preservation mandate: buys only at verified technical support with active protective collar. Tight 5% stop-loss and strict 18% profit extraction.",
    badge: "CRO HEDGE",
    defaultConfig: {
      positionSizePct: 70,
      stopLossPct: 5,
      takeProfitPct: 18,
      enableCroHedging: true,
    },
  },
  // Fund Committee Flagship & Classic Benchmarks
  {
    id: "agentic_consensus",
    name: "Quantum Alpha Agentic Consensus (Committee Flagship)",
    category: "fund",
    description:
      "Trades when CIO conviction is high, valuation is validated by Equity Lead, and automatically hedged or trimmed during CRO tail-risk alerts.",
    badge: "FUND FLAGSHIP",
    defaultConfig: {
      positionSizePct: 100,
      stopLossPct: 8,
      takeProfitPct: 35,
      enableCroHedging: true,
      agentConvictionThreshold: 75,
    },
  },
  {
    id: "ema_crossover",
    name: "Dual EMA Trend-Following (20 / 50)",
    category: "fund",
    description:
      "Classic quantitative trend capture. Enters long on golden crosses and exits cleanly upon death crosses.",
    badge: "QUANT TREND",
    defaultConfig: {
      positionSizePct: 100,
      stopLossPct: 7,
      takeProfitPct: 40,
      fastEma: 20,
      slowEma: 50,
      enableCroHedging: false,
    },
  },
  {
    id: "rsi_bollinger",
    name: "Mean Reversion (RSI 30/70 + Bands)",
    category: "fund",
    description:
      "Capitalizes on extreme sentiment dislocations: buys at oversold lower Bollinger Bands and takes profit on overbought rallies.",
    badge: "MEAN REVERSION",
    defaultConfig: {
      positionSizePct: 80,
      stopLossPct: 6,
      takeProfitPct: 20,
      rsiOversold: 30,
      rsiOverbought: 70,
      enableCroHedging: true,
    },
  },
  {
    id: "momentum_breakout",
    name: "Donchian 20-Day Momentum Breakout",
    category: "fund",
    description:
      "Captures high-velocity expansion by buying on 20-day price highs and exiting on support channel breakdowns.",
    badge: "MOMENTUM",
    defaultConfig: {
      positionSizePct: 100,
      stopLossPct: 9,
      takeProfitPct: 50,
      enableCroHedging: false,
    },
  },
  {
    id: "custom",
    name: "Custom Parameterized Strategy",
    category: "fund",
    description:
      "User-defined quant model with complete granular tuning over entry indicators, risk management, and hedging collars.",
    badge: "CUSTOM BUILDER",
    defaultConfig: {
      positionSizePct: 75,
      stopLossPct: 7,
      takeProfitPct: 25,
      rsiOversold: 32,
      rsiOverbought: 68,
      enableCroHedging: true,
    },
  },
];

export const HistoricalBacktester: React.FC<HistoricalBacktesterProps> = ({
  currentSymbol,
  initialStrategy,
}) => {
  // Backtest Configuration State
  const [selectedStrategy, setSelectedStrategy] =
    useState<StrategyType>(initialStrategy || "agentic_consensus");
  const [strategyCategoryFilter, setStrategyCategoryFilter] = useState<"all" | "agent" | "fund">("all");
  const [symbol, setSymbol] = useState<string>(currentSymbol || "NVDA");
  const [timeframe, setTimeframe] = useState<BacktestTimeframe>("1Y");
  const [initialCapital, setInitialCapital] = useState<number>(100000);
  const [positionSizePct, setPositionSizePct] = useState<number>(100);
  const [stopLossPct, setStopLossPct] = useState<number>(8);
  const [takeProfitPct, setTakeProfitPct] = useState<number>(35);
  const [enableCroHedging, setEnableCroHedging] = useState<boolean>(true);
  const [slippageBps, setSlippageBps] = useState<number>(5);
  const [fastEma, setFastEma] = useState<number>(20);
  const [slowEma, setSlowEma] = useState<number>(50);
  const [rsiOversold, setRsiOversold] = useState<number>(30);
  const [rsiOverbought, setRsiOverbought] = useState<number>(70);

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"equity" | "drawdown" | "trades">(
    "equity"
  );
  const [tradeFilter, setTradeFilter] = useState<"ALL" | "WINNERS" | "LOSERS">(
    "ALL"
  );

  // Tournament / Agent Face-Off State
  const [tournamentResults, setTournamentResults] = useState<BacktestResult[] | null>(null);
  const [isTournamentRunning, setIsTournamentRunning] = useState<boolean>(false);

  // Initial Backtest Run on mount
  const [backtestResult, setBacktestResult] = useState<BacktestResult>(() => {
    return runBacktestSimulation({
      strategyId: initialStrategy || "agentic_consensus",
      strategyName:
        STRATEGY_PRESETS.find((p) => p.id === (initialStrategy || "agentic_consensus"))?.name ||
        "Quantum Alpha Agentic Consensus",
      symbol: currentSymbol || "NVDA",
      timeframe: "1Y",
      initialCapital: 100000,
      positionSizePct: 100,
      stopLossPct: 8,
      takeProfitPct: 35,
      enableCroHedging: true,
      slippageBps: 5,
      commissionPerTrade: 1.0,
      fastEma: 20,
      slowEma: 50,
      rsiOversold: 30,
      rsiOverbought: 70,
    });
  });

  // Sync initialStrategy if prop changes
  React.useEffect(() => {
    if (initialStrategy && initialStrategy !== selectedStrategy) {
      handleSelectStrategy(initialStrategy);
    }
  }, [initialStrategy]);

  // Sync currentSymbol if prop changes
  React.useEffect(() => {
    if (currentSymbol && currentSymbol !== symbol) {
      setSymbol(currentSymbol);
    }
  }, [currentSymbol]);

  // Handle Strategy Change
  const handleSelectStrategy = (stratId: StrategyType) => {
    setSelectedStrategy(stratId);
    const preset = STRATEGY_PRESETS.find((p) => p.id === stratId);
    if (preset && preset.defaultConfig) {
      if (preset.defaultConfig.positionSizePct !== undefined)
        setPositionSizePct(preset.defaultConfig.positionSizePct);
      if (preset.defaultConfig.stopLossPct !== undefined)
        setStopLossPct(preset.defaultConfig.stopLossPct);
      if (preset.defaultConfig.takeProfitPct !== undefined)
        setTakeProfitPct(preset.defaultConfig.takeProfitPct);
      if (preset.defaultConfig.enableCroHedging !== undefined)
        setEnableCroHedging(preset.defaultConfig.enableCroHedging);
      if (preset.defaultConfig.fastEma !== undefined)
        setFastEma(preset.defaultConfig.fastEma);
      if (preset.defaultConfig.slowEma !== undefined)
        setSlowEma(preset.defaultConfig.slowEma);
      if (preset.defaultConfig.rsiOversold !== undefined)
        setRsiOversold(preset.defaultConfig.rsiOversold);
      if (preset.defaultConfig.rsiOverbought !== undefined)
        setRsiOverbought(preset.defaultConfig.rsiOverbought);
    }
  };

  // Run all agent strategies face-off tournament
  const runAgentTournament = () => {
    setIsTournamentRunning(true);
    setTimeout(() => {
      const agentPresets = STRATEGY_PRESETS.filter((p) => p.category === "agent" || p.id === "agentic_consensus");
      const results = agentPresets.map((preset) => {
        const config: BacktestConfig = {
          strategyId: preset.id,
          strategyName: preset.name,
          symbol,
          timeframe,
          initialCapital,
          positionSizePct: preset.defaultConfig.positionSizePct || 100,
          stopLossPct: preset.defaultConfig.stopLossPct || 8,
          takeProfitPct: preset.defaultConfig.takeProfitPct || 35,
          enableCroHedging: preset.defaultConfig.enableCroHedging ?? true,
          slippageBps: 5,
          commissionPerTrade: 1.0,
          fastEma: preset.defaultConfig.fastEma || 20,
          slowEma: preset.defaultConfig.slowEma || 50,
          rsiOversold: preset.defaultConfig.rsiOversold || 30,
          rsiOverbought: preset.defaultConfig.rsiOverbought || 70,
        };
        return runBacktestSimulation(config);
      });

      // Sort by Sharpe ratio descending
      results.sort((a, b) => b.sharpeRatio - a.sharpeRatio);
      setTournamentResults(results);
      setIsTournamentRunning(false);
    }, 350);
  };

  // Run backtest execution
  const executeBacktest = () => {
    setIsRunning(true);
    setTimeout(() => {
      const preset = STRATEGY_PRESETS.find((p) => p.id === selectedStrategy);
      const config: BacktestConfig = {
        strategyId: selectedStrategy,
        strategyName: preset ? preset.name : "Quantitative Model",
        symbol,
        timeframe,
        initialCapital,
        positionSizePct,
        stopLossPct,
        takeProfitPct,
        enableCroHedging,
        slippageBps,
        commissionPerTrade: 1.0,
        fastEma,
        slowEma,
        rsiOversold,
        rsiOverbought,
      };

      const result = runBacktestSimulation(config);
      setBacktestResult(result);
      setIsRunning(false);
    }, 250);
  };

  // Filter trades
  const filteredTrades = useMemo(() => {
    if (!backtestResult?.trades) return [];
    if (tradeFilter === "WINNERS")
      return backtestResult.trades.filter((t) => (t.pnl || 0) > 0);
    if (tradeFilter === "LOSERS")
      return backtestResult.trades.filter((t) => (t.pnl || 0) <= 0);
    return backtestResult.trades;
  }, [backtestResult, tradeFilter]);

  // Export CSV helper
  const handleExportCSV = () => {
    if (!backtestResult?.trades.length) return;
    const headers = [
      "Trade ID",
      "Type",
      "Entry Date",
      "Exit Date",
      "Entry Price",
      "Exit Price",
      "Shares",
      "PnL ($)",
      "PnL (%)",
      "Holding Days",
      "Trigger Reason",
      "Agent",
    ];
    const rows = backtestResult.trades.map((t) => [
      t.id,
      t.type,
      t.entryDate,
      t.exitDate || "N/A",
      t.entryPrice,
      t.exitPrice || "N/A",
      t.shares,
      t.pnl || 0,
      t.pnlPct || 0,
      t.holdingDays || 0,
      `"${t.triggerReason.replace(/"/g, '""')}"`,
      `"${t.agentSignature.replace(/"/g, '""')}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `${symbol}_backtest_${selectedStrategy}_${timeframe}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl space-y-6">
      {/* Header Section */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Quantitative Strategy Backtester
              </h2>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold">
                INSTITUTIONAL SIMULATOR
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Test multi-agent consensus algorithms against historical tick bars
              with rigorous risk metrics and trade-by-trade audit logs.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="run-tournament-btn"
            onClick={runAgentTournament}
            disabled={isTournamentRunning || isRunning}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-amber-500/40 text-amber-300 font-bold text-xs sm:text-sm transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-sm"
          >
            <Award className={`w-4 h-4 text-amber-400 ${isTournamentRunning ? "animate-spin" : ""}`} />
            <span>{isTournamentRunning ? "Computing Face-Off..." : "🏆 Run All Agent Strategies Face-Off"}</span>
          </button>

          <button
            id="run-backtest-btn"
            onClick={executeBacktest}
            disabled={isRunning}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Play className={`w-4 h-4 fill-current ${isRunning ? "animate-spin" : ""}`} />
            <span>{isRunning ? "Computing Simulation..." : "Run Active Strategy"}</span>
          </button>
        </div>
      </div>

      {/* Multi-Agent Tournament Comparison Table */}
      {tournamentResults && (
        <div className="p-4 bg-slate-950/90 border border-amber-500/40 rounded-xl shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                Multi-Agent Quantitative Face-Off Tournament — ${symbol} ({timeframe})
              </h3>
            </div>
            <button
              onClick={() => setTournamentResults(null)}
              className="text-xs text-slate-500 hover:text-slate-300 font-mono"
            >
              ✕ Dismiss Leaderboard
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-left">
                  <th className="py-2 px-3">Rank</th>
                  <th className="py-2 px-3">Agent / Strategy Model</th>
                  <th className="py-2 px-3 text-right">Total Return</th>
                  <th className="py-2 px-3 text-right">Annualized</th>
                  <th className="py-2 px-3 text-right">Sharpe Ratio</th>
                  <th className="py-2 px-3 text-right">Max Drawdown</th>
                  <th className="py-2 px-3 text-right">Win Rate</th>
                  <th className="py-2 px-3 text-right">Trades</th>
                  <th className="py-2 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {tournamentResults.map((res, idx) => {
                  const isTop = idx === 0;
                  const isCurrentActive = selectedStrategy === res.config.strategyId;
                  return (
                    <tr
                      key={res.config.strategyId}
                      className={`hover:bg-slate-900/60 transition ${
                        isCurrentActive ? "bg-amber-500/10" : ""
                      }`}
                    >
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${
                            isTop
                              ? "bg-amber-500 text-slate-950"
                              : idx === 1
                              ? "bg-slate-300 text-slate-950"
                              : idx === 2
                              ? "bg-amber-700 text-white"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          #{idx + 1}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-200">
                        {res.config.strategyName}
                        {isTop && (
                          <span className="ml-2 text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded font-mono font-bold">
                            TOP SHARPE
                          </span>
                        )}
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right font-bold ${
                          res.totalReturnPct >= 0 ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {res.totalReturnPct >= 0 ? "+" : ""}
                        {res.totalReturnPct.toFixed(2)}%
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-300">
                        {res.cagr.toFixed(2)}%
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right font-bold ${
                          res.sharpeRatio >= 1.5
                            ? "text-emerald-400"
                            : res.sharpeRatio >= 1.0
                            ? "text-amber-400"
                            : "text-slate-400"
                        }`}
                      >
                        {res.sharpeRatio.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-rose-400">
                        -{res.maxDrawdownPct.toFixed(2)}%
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-300">
                        {res.winRatePct.toFixed(1)}%
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-400">
                        {res.totalTrades}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => {
                            handleSelectStrategy(res.config.strategyId);
                            setBacktestResult(res);
                          }}
                          className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold transition cursor-pointer ${
                            isCurrentActive
                              ? "bg-amber-500 text-slate-950"
                              : "bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700"
                          }`}
                        >
                          {isCurrentActive ? "Active" : "Inspect"}
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

      {/* Strategy Selection & Parameter Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 5 Cols: Strategy Presets */}
        <div className="lg:col-span-5 space-y-2.5">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              Strategy Library ({STRATEGY_PRESETS.length})
            </div>
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded border border-slate-800 text-[10px] font-mono">
              <button
                type="button"
                onClick={() => setStrategyCategoryFilter("all")}
                className={`px-2 py-0.5 rounded cursor-pointer ${
                  strategyCategoryFilter === "all"
                    ? "bg-amber-500 text-slate-950 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                All ({STRATEGY_PRESETS.length})
              </button>
              <button
                type="button"
                onClick={() => setStrategyCategoryFilter("agent")}
                className={`px-2 py-0.5 rounded cursor-pointer ${
                  strategyCategoryFilter === "agent"
                    ? "bg-amber-500 text-slate-950 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Agents (5)
              </button>
              <button
                type="button"
                onClick={() => setStrategyCategoryFilter("fund")}
                className={`px-2 py-0.5 rounded cursor-pointer ${
                  strategyCategoryFilter === "fund"
                    ? "bg-amber-500 text-slate-950 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Fund (5)
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
            {STRATEGY_PRESETS.filter((s) => {
              if (strategyCategoryFilter === "agent") return s.category === "agent";
              if (strategyCategoryFilter === "fund") return s.category === "fund";
              return true;
            }).map((strat) => {
              const isSelected = selectedStrategy === strat.id;
              return (
                <div
                  key={strat.id}
                  onClick={() => handleSelectStrategy(strat.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition ${
                    isSelected
                      ? "bg-amber-500/10 border-amber-500/60 shadow-md shadow-amber-500/5 ring-1 ring-amber-500/30"
                      : "bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-bold ${
                        isSelected ? "text-amber-400" : "text-slate-200"
                      }`}
                    >
                      {strat.name}
                    </span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase font-semibold ${
                        isSelected
                          ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                          : "bg-slate-800 border-slate-700 text-slate-400"
                      }`}
                    >
                      {strat.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {strat.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 7 Cols: Granular Strategy Parameters */}
        <div className="lg:col-span-7 bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-mono">
            <span className="text-amber-400 font-bold uppercase flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              Strategy Parameters & Risk Collars
            </span>
            <span className="text-slate-500">
              Active Strategy: <strong className="text-slate-200">{selectedStrategy}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            {/* Target Symbol */}
            <div>
              <label className="text-slate-400 block mb-1 text-[11px] font-mono">
                Asset Symbol
              </label>
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 font-mono text-white font-bold focus:border-amber-500 outline-none"
                placeholder="e.g. NVDA"
              />
            </div>

            {/* Timeframe */}
            <div>
              <label className="text-slate-400 block mb-1 text-[11px] font-mono">
                Historical Period
              </label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value as BacktestTimeframe)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 font-mono text-white focus:border-amber-500 outline-none"
              >
                <option value="3M">3 Months (90 Days)</option>
                <option value="6M">6 Months (180 Days)</option>
                <option value="1Y">1 Year (365 Days)</option>
                <option value="2Y">2 Years (730 Days)</option>
                <option value="3Y">3 Years (1095 Days)</option>
                <option value="5Y">5 Years (1825 Days)</option>
              </select>
            </div>

            {/* Initial Capital */}
            <div>
              <label className="text-slate-400 block mb-1 text-[11px] font-mono">
                Initial Capital ($)
              </label>
              <input
                type="number"
                value={initialCapital}
                onChange={(e) => setInitialCapital(Math.max(1000, Number(e.target.value)))}
                step={10000}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 font-mono text-white focus:border-amber-500 outline-none"
              />
            </div>

            {/* Position Sizing Slider */}
            <div>
              <div className="flex justify-between text-[11px] font-mono mb-1">
                <span className="text-slate-400">Position Sizing</span>
                <span className="text-amber-400 font-bold">{positionSizePct}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                step={5}
                value={positionSizePct}
                onChange={(e) => setPositionSizePct(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>

            {/* Stop Loss Slider */}
            <div>
              <div className="flex justify-between text-[11px] font-mono mb-1">
                <span className="text-slate-400">Stop-Loss Limit</span>
                <span className="text-rose-400 font-bold">-{stopLossPct}%</span>
              </div>
              <input
                type="range"
                min={2}
                max={25}
                step={1}
                value={stopLossPct}
                onChange={(e) => setStopLossPct(Number(e.target.value))}
                className="w-full accent-rose-500"
              />
            </div>

            {/* Take Profit Slider */}
            <div>
              <div className="flex justify-between text-[11px] font-mono mb-1">
                <span className="text-slate-400">Target Profit</span>
                <span className="text-emerald-400 font-bold">+{takeProfitPct}%</span>
              </div>
              <input
                type="range"
                min={5}
                max={100}
                step={5}
                value={takeProfitPct}
                onChange={(e) => setTakeProfitPct(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
          </div>

          {/* CRO Hedging Collar Toggle & Execution Assumptions */}
          <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex items-center gap-2 cursor-pointer p-2 rounded bg-slate-900/90 border border-slate-800 hover:border-slate-700">
              <input
                type="checkbox"
                checked={enableCroHedging}
                onChange={(e) => setEnableCroHedging(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 accent-amber-500"
              />
              <div>
                <span className="text-xs font-bold text-slate-200 block">
                  CRO Risk Collar Overlay
                </span>
                <span className="text-[10px] text-slate-400">
                  Auto-trim 50% on volatility breaks or macro liquidation alerts
                </span>
              </div>
            </label>

            <div className="flex items-center justify-between p-2 rounded bg-slate-900/90 border border-slate-800 text-xs font-mono">
              <div>
                <span className="text-slate-400 block text-[10px]">Execution Friction</span>
                <span className="text-slate-200 font-semibold">{slippageBps} bps Slippage + $1 Comm</span>
              </div>
              <input
                type="number"
                min={0}
                max={25}
                value={slippageBps}
                onChange={(e) => setSlippageBps(Number(e.target.value))}
                className="w-14 bg-slate-800 border border-slate-700 rounded px-1.5 py-1 text-center text-white"
                title="Slippage basis points"
              />
            </div>
          </div>
        </div>
      </div>

      {/* KEY PERFORMANCE METRICS HERO SCORECARD */}
      {backtestResult && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Award className="w-4 h-4" />
              Institutional Performance Scorecard ({backtestResult.startDate} to{" "}
              {backtestResult.endDate})
            </span>
            <span className="text-slate-500">
              Initial: ${backtestResult.initialCapital.toLocaleString()} → Final:{" "}
              <strong className="text-emerald-400">
                ${backtestResult.finalEquity.toLocaleString()}
              </strong>
            </span>
          </div>

          {/* The 4 User Explicitly Requested Metrics + Secondary Quantitative Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* 1. TOTAL RETURN */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 relative overflow-hidden">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">
                Total Return
              </span>
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-xl sm:text-2xl font-black font-mono ${
                    backtestResult.totalReturnPct >= 0
                      ? "text-emerald-400"
                      : "text-rose-400"
                  }`}
                >
                  {backtestResult.totalReturnPct >= 0 ? "+" : ""}
                  {backtestResult.totalReturnPct.toFixed(2)}%
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                Benchmark: +{backtestResult.benchmarkReturnPct.toFixed(1)}% (Alpha:{" "}
                <span
                  className={
                    backtestResult.alpha >= 0 ? "text-emerald-400" : "text-rose-400"
                  }
                >
                  {backtestResult.alpha >= 0 ? "+" : ""}
                  {backtestResult.alpha}%
                </span>
                )
              </span>
            </div>

            {/* 2. ANNUALIZED RETURN (CAGR) */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">
                Annualized Return (CAGR)
              </span>
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-xl sm:text-2xl font-black font-mono ${
                    backtestResult.cagr >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {backtestResult.cagr >= 0 ? "+" : ""}
                  {backtestResult.cagr.toFixed(2)}%
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                S&P 500 Baseline: ~{backtestResult.sp500ReturnPct.toFixed(1)}%
              </span>
            </div>

            {/* 3. SHARPE RATIO */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">
                Sharpe Ratio
              </span>
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-xl sm:text-2xl font-black font-mono ${
                    backtestResult.sharpeRatio >= 1.5
                      ? "text-emerald-400"
                      : backtestResult.sharpeRatio >= 1.0
                      ? "text-amber-400"
                      : "text-slate-300"
                  }`}
                >
                  {backtestResult.sharpeRatio.toFixed(2)}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {backtestResult.sharpeRatio >= 1.8
                    ? "Tier-1 Alpha"
                    : backtestResult.sharpeRatio >= 1.2
                    ? "Robust"
                    : "Moderate"}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                Sortino Ratio: {backtestResult.sortinoRatio.toFixed(2)} (Downside Risk)
              </span>
            </div>

            {/* 4. MAXIMUM DRAWDOWN */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">
                Maximum Drawdown
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-black font-mono text-rose-400">
                  -{backtestResult.maxDrawdownPct.toFixed(2)}%
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                Longest Drawdown: {backtestResult.maxDrawdownDurationDays} trading days
              </span>
            </div>
          </div>

          {/* Secondary Stats Strip (Win Rate, Profit Factor, Total Trades) */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
            <div>
              <span className="text-slate-500 text-[10px] block uppercase">Win Rate</span>
              <span className="font-bold text-white">
                {backtestResult.winRatePct}%{" "}
                <span className="text-slate-500 text-[10px]">
                  ({backtestResult.winningTrades}W / {backtestResult.losingTrades}L)
                </span>
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block uppercase">Profit Factor</span>
              <span className="font-bold text-cyan-400">
                {backtestResult.profitFactor.toFixed(2)}x
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block uppercase">Total Trades</span>
              <span className="font-bold text-slate-200">{backtestResult.totalTrades} Executed</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block uppercase">Avg Win / Loss</span>
              <span className="font-bold text-slate-300">
                <span className="text-emerald-400">+{backtestResult.avgWinPct}%</span> /{" "}
                <span className="text-rose-400">{backtestResult.avgLossPct}%</span>
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block uppercase">Best / Worst</span>
              <span className="font-bold text-slate-300">
                <span className="text-emerald-400">+{backtestResult.largestWinPct}%</span> /{" "}
                <span className="text-rose-400">{backtestResult.largestLossPct}%</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* INTERACTIVE CHARTS & TRADE LOG TAB NAVIGATION */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-2">
          {/* Tabs */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <button
              onClick={() => setActiveTab("equity")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                activeTab === "equity"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "text-slate-400 hover:text-white bg-slate-800/40"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Cumulative Equity Curve</span>
            </button>

            <button
              onClick={() => setActiveTab("drawdown")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                activeTab === "drawdown"
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                  : "text-slate-400 hover:text-white bg-slate-800/40"
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Underwater Drawdown Profile</span>
            </button>

            <button
              onClick={() => setActiveTab("trades")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                activeTab === "trades"
                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                  : "text-slate-400 hover:text-white bg-slate-800/40"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Trade Execution Log ({backtestResult?.trades.length || 0})</span>
            </button>
          </div>

          {/* Action button for CSV export */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono transition"
            title="Download full trade execution dataset in CSV format"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Tab 1: Cumulative Equity Curve (Recharts) */}
        {activeTab === "equity" && (
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
            <div className="flex justify-between items-center text-xs font-mono text-slate-400 mb-3">
              <span className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-sm bg-amber-400"></span>
                <span>Strategy Portfolio</span>
                <span className="inline-block w-3 h-3 rounded-sm bg-cyan-400 ml-2"></span>
                <span>Buy & Hold {symbol}</span>
                <span className="inline-block w-3 h-1 bg-slate-500 ml-2"></span>
                <span>S&P 500 Index</span>
              </span>
              <span className="text-[11px] text-slate-500">
                Logarithmic Dollar Scale ($)
              </span>
            </div>

            <div className="h-[280px] sm:h-[340px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={backtestResult?.equityCurve}
                  margin={{ top: 10, right: 15, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="date"
                    stroke="#64748b"
                    fontSize={11}
                    tickFormatter={(val) => val.slice(5)}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    domain={["auto", "auto"]}
                    tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontFamily: "monospace",
                    }}
                    formatter={(value: any, name: any) => [
                      `$${Number(value).toLocaleString()}`,
                      name === "strategyEquity"
                        ? "Strategy Equity"
                        : name === "benchmarkEquity"
                        ? `Buy & Hold (${symbol})`
                        : "S&P 500 Baseline",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="strategyEquity"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="benchmarkEquity"
                    stroke="#06b6d4"
                    strokeWidth={1.5}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="sp500Equity"
                    stroke="#64748b"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Tab 2: Underwater Drawdown Profile (Recharts) */}
        {activeTab === "drawdown" && (
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
            <div className="flex justify-between items-center text-xs font-mono text-slate-400 mb-3">
              <span className="flex items-center gap-2 text-rose-400">
                <span className="inline-block w-3 h-3 rounded-sm bg-rose-500"></span>
                <span>Peak-to-Trough Portfolio Drawdown (%)</span>
              </span>
              <span className="text-[11px] text-slate-500">
                Maximum Pain Ceiling: -{backtestResult?.maxDrawdownPct.toFixed(2)}%
              </span>
            </div>

            <div className="h-[280px] sm:h-[340px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={backtestResult?.equityCurve}
                  margin={{ top: 10, right: 15, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="date"
                    stroke="#64748b"
                    fontSize={11}
                    tickFormatter={(val) => val.slice(5)}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    domain={[-35, 0]}
                    tickFormatter={(val) => `${val}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontFamily: "monospace",
                    }}
                    formatter={(value: any) => [`${value}%`, "Drawdown"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="drawdownPct"
                    stroke="#f43f5e"
                    fill="#f43f5e"
                    fillOpacity={0.25}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Tab 3: Detailed Trade Execution Log */}
        {activeTab === "trades" && (
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
            {/* Filter Sub-bar */}
            <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Filter className="w-3.5 h-3.5" />
                <span>Filter:</span>
                <button
                  onClick={() => setTradeFilter("ALL")}
                  className={`px-2 py-0.5 rounded ${
                    tradeFilter === "ALL"
                      ? "bg-amber-500/20 text-amber-300 font-bold"
                      : "hover:text-white"
                  }`}
                >
                  All ({backtestResult?.trades.length})
                </button>
                <button
                  onClick={() => setTradeFilter("WINNERS")}
                  className={`px-2 py-0.5 rounded ${
                    tradeFilter === "WINNERS"
                      ? "bg-emerald-500/20 text-emerald-300 font-bold"
                      : "hover:text-white"
                  }`}
                >
                  Winners ({backtestResult?.winningTrades})
                </button>
                <button
                  onClick={() => setTradeFilter("LOSERS")}
                  className={`px-2 py-0.5 rounded ${
                    tradeFilter === "LOSERS"
                      ? "bg-rose-500/20 text-rose-300 font-bold"
                      : "hover:text-white"
                  }`}
                >
                  Losers ({backtestResult?.losingTrades})
                </button>
              </div>

              <span className="text-[11px] text-slate-500 hidden sm:inline">
                Slippage & commissions accounted for
              </span>
            </div>

            {/* Trades Table */}
            <div className="overflow-x-auto max-h-[360px] overflow-y-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] sticky top-0 border-b border-slate-800">
                  <tr>
                    <th className="py-2 px-2.5">Trade #</th>
                    <th className="py-2 px-2.5">Type</th>
                    <th className="py-2 px-2.5">Entry Date</th>
                    <th className="py-2 px-2.5">Exit Date</th>
                    <th className="py-2 px-2.5">Entry $</th>
                    <th className="py-2 px-2.5">Exit $</th>
                    <th className="py-2 px-2.5">Shares</th>
                    <th className="py-2 px-2.5">PnL ($)</th>
                    <th className="py-2 px-2.5">Return</th>
                    <th className="py-2 px-2.5">Hold (Days)</th>
                    <th className="py-2 px-2.5">Signal Logic & Agent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredTrades.map((t, idx) => {
                    const isWin = (t.pnl || 0) > 0;
                    return (
                      <tr
                        key={t.id || idx}
                        className="hover:bg-slate-900/60 transition"
                      >
                        <td className="py-2 px-2.5 text-slate-400">{t.id}</td>
                        <td className="py-2 px-2.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              t.type === "LONG"
                                ? "bg-blue-500/20 text-blue-400"
                                : "bg-purple-500/20 text-purple-400"
                            }`}
                          >
                            {t.type}
                          </span>
                        </td>
                        <td className="py-2 px-2.5 text-slate-300">{t.entryDate}</td>
                        <td className="py-2 px-2.5 text-slate-300">
                          {t.exitDate || <span className="text-amber-400">ACTIVE</span>}
                        </td>
                        <td className="py-2 px-2.5 text-slate-200">
                          ${t.entryPrice.toFixed(2)}
                        </td>
                        <td className="py-2 px-2.5 text-slate-200">
                          {t.exitPrice ? `$${t.exitPrice.toFixed(2)}` : "—"}
                        </td>
                        <td className="py-2 px-2.5 text-slate-400">{t.shares}</td>
                        <td
                          className={`py-2 px-2.5 font-bold ${
                            isWin ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {t.pnl !== undefined
                            ? `${t.pnl >= 0 ? "+" : ""}$${t.pnl.toLocaleString()}`
                            : "—"}
                        </td>
                        <td
                          className={`py-2 px-2.5 font-bold ${
                            isWin ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {t.pnlPct !== undefined
                            ? `${t.pnlPct >= 0 ? "+" : ""}${t.pnlPct.toFixed(2)}%`
                            : "—"}
                        </td>
                        <td className="py-2 px-2.5 text-slate-400">
                          {t.holdingDays || 1}d
                        </td>
                        <td className="py-2 px-2.5 max-w-[280px] truncate text-slate-300">
                          <span title={t.triggerReason}>{t.triggerReason}</span>
                          <span className="text-[10px] text-slate-500 block truncate">
                            {t.agentSignature}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MULTI-AGENT COMMITTEE POST-BACKTEST AUDIT PANEL */}
      {backtestResult?.agentAudits && (
        <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
            <Briefcase className="w-4 h-4" />
            Committee Post-Backtest Stress-Test & Alpha Audit
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {/* CIO Marcus Vance */}
            <div className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/5 space-y-1">
              <span className="font-bold text-amber-400 flex items-center gap-1 font-mono text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Dr. Marcus Vance (CIO Verdict)
              </span>
              <p className="text-slate-300 leading-relaxed text-[11px] italic">
                "{backtestResult.agentAudits.cioVerdict}"
              </p>
            </div>

            {/* CRO Rachel Stern */}
            <div className="p-3 rounded-lg border border-rose-500/20 bg-rose-500/5 space-y-1">
              <span className="font-bold text-rose-400 flex items-center gap-1 font-mono text-[11px]">
                <ShieldAlert className="w-3.5 h-3.5" />
                Rachel Stern, FRM (Risk Collar Audit)
              </span>
              <p className="text-slate-300 leading-relaxed text-[11px] italic">
                "{backtestResult.agentAudits.croRiskAudit}"
              </p>
            </div>

            {/* Elena Rostova CFA */}
            <div className="p-3 rounded-lg border border-blue-500/20 bg-blue-500/5 space-y-1">
              <span className="font-bold text-blue-400 flex items-center gap-1 font-mono text-[11px]">
                <TrendingUp className="w-3.5 h-3.5" />
                Elena Rostova, CFA (Execution Quality)
              </span>
              <p className="text-slate-300 leading-relaxed text-[11px] italic">
                "{backtestResult.agentAudits.equityValuationAudit}"
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
