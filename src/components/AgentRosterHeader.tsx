import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { AGENT_ROSTER } from "../data/benchmarkCases";
import { AgentProfile, AgentId, StrategyType } from "../types";
import {
  Briefcase,
  TrendingUp,
  Cpu,
  Globe,
  ShieldAlert,
  Loader2,
  Info,
  Play,
  FileText,
  MessageSquare,
  Sparkles,
  ChevronRight,
  Sliders,
  X,
} from "lucide-react";

interface AgentRosterHeaderProps {
  activeAgent: AgentId | "all";
  onSelectAgent: (id: AgentId | "all") => void;
  isAnalyzing: boolean;
  currentPhase: number;
  currentSymbol?: string;
  onRunAgentStrategy?: (strategyId: StrategyType) => void;
  onNavigateTab?: (tab: "memorandum" | "phase1" | "phase2" | "backtester") => void;
}

const AGENT_STRATEGY_MAP: Record<
  AgentId,
  {
    strategyId: StrategyType;
    strategyName: string;
    philosophy: string;
    entryRule: string;
    exitRule: string;
    riskOverlay: string;
  }
> = {
  cio: {
    strategyId: "agent_cio_momentum",
    strategyName: "Macro-Fundamental Core Long",
    philosophy: "Synthesizes macro regime direction with long-term fundamental quality to accumulate convex upside while avoiding multiple compression.",
    entryRule: "Enters on secular inflection when EMA 20 > EMA 50 and RSI is in accumulation range (42-66).",
    exitRule: "Locks in gains at +35% expansion or exits on structural EMA death cross with declining volume.",
    riskOverlay: "Trailing risk stop at 8%; dynamic rebalancing if macro indicators contract.",
  },
  equityAnalyst: {
    strategyId: "agent_equity_value",
    strategyName: "Deep Value & Quality Reversion",
    philosophy: "Exploits market overreactions and liquidity dislocations on resilient cash-flow compounders with strong DCF moats.",
    entryRule: "Buys when RSI ≤ 34 and price trades near/below the Lower Bollinger Band with verified gross margin stability.",
    exitRule: "Takes profit when price reverts to DCF fair value (Upper Band or RSI ≥ 68).",
    riskOverlay: "Strict 7% stop-loss to guard against value traps and structural margin erosion.",
  },
  cto: {
    strategyId: "agent_cto_breakout",
    strategyName: "Secular Tech Breakout & Growth Acceleration",
    philosophy: "Captures exponential technological adoption curves and hardware/software moats before broad Wall Street consensus.",
    entryRule: "Enters on 20-day price channel breakout accompanied by volume expansion (>1.15x 10-day moving average).",
    exitRule: "Rides upward momentum until trailing 15-day channel floor is violated.",
    riskOverlay: "Trails dynamic stop-loss to protect accumulated alpha without capping upside.",
  },
  macroStrategist: {
    strategyId: "agent_macro_regime",
    strategyName: "Monetary Regime & Yield Filter",
    philosophy: "Aligns equity exposure with central bank liquidity, sovereign capital flows, and macroeconomic yield curves.",
    entryRule: "Enters when sovereign rate conditions stabilize and asset trades above both EMA 20 and EMA 50.",
    exitRule: "Liquidates position on macro regime breakdown when price drops below the 50-day EMA.",
    riskOverlay: "Capped 6% maximum loss limit with liquidity-driven capital preservation mandate.",
  },
  cro: {
    strategyId: "agent_cro_hedge",
    strategyName: "Asymmetric Protective Collar & Downside Hedging",
    philosophy: "Fierce capital preservation mandate: limits portfolio drawdown using active collar hedging and defensive profit extraction.",
    entryRule: "Enters exclusively on confirmed technical support floors with active protective collar overlay.",
    exitRule: "Aggressively locks in +18% upside before valuation multiples face cyclical compression; stops out at -5%.",
    riskOverlay: "Ultra-disciplined 5% stop-loss and instant tail-risk circuit breaker if volatility spikes.",
  },
};

export const AgentRosterHeader: React.FC<AgentRosterHeaderProps> = ({
  activeAgent,
  onSelectAgent,
  isAnalyzing,
  currentPhase,
  currentSymbol = "NVDA",
  onRunAgentStrategy,
  onNavigateTab,
}) => {
  const [inspectAgent, setInspectAgent] = useState<AgentProfile | null>(null);
  const [showAgentsModal, setShowAgentsModal] = useState<boolean>(false);

  // Close modal on Escape key press
  useEffect(() => {
    if (!inspectAgent) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setInspectAgent(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [inspectAgent]);

  const getAgentIcon = (id: AgentId) => {
    switch (id) {
      case "cio":
        return <Briefcase className="w-4 h-4" />;
      case "equityAnalyst":
        return <TrendingUp className="w-4 h-4" />;
      case "cto":
        return <Cpu className="w-4 h-4" />;
      case "macroStrategist":
        return <Globe className="w-4 h-4" />;
      case "cro":
        return <ShieldAlert className="w-4 h-4" />;
    }
  };

  const handleOpenDossier = (agent: AgentProfile) => {
    setInspectAgent(agent);
  };

  const handleLaunchBacktest = (agentId: AgentId) => {
    const strat = AGENT_STRATEGY_MAP[agentId];
    if (strat && onRunAgentStrategy) {
      onRunAgentStrategy(strat.strategyId);
    }
    setInspectAgent(null);
  };

  return (
    <header className="relative z-[100] shrink-0 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6">
        {/* Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/20 via-blue-500/20 to-emerald-500/20 border border-slate-700 flex items-center justify-center font-mono font-bold text-amber-400 text-lg shadow-inner">
              Ω
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white font-mono">
                  QUANTUM ALPHA CAPITAL
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono tracking-wider font-semibold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  MULTI-AGENT AI HEDGE FUND
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Institutional Quantitative Research, Thesis Stress-Testing & Strategy Backtesting
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAgentsModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-xs text-slate-300 hover:text-white font-mono transition cursor-pointer active:scale-95"
              title="View all agents in popup"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>5 Agents</span>
              <span className="text-[9px] text-slate-400">↗</span>
            </button>
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900/60 border border-slate-800 text-xs text-slate-400 font-mono">
              <span>Backtest Engine: <strong className="text-amber-400">Agent Strategies Ready</strong></span>
            </div>
          </div>
        </div>

        {/* Visible interactive agent roster */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 pt-3">
          {AGENT_ROSTER.map((agent) => {
            const isSelected = activeAgent === agent.id;
            const strategy = AGENT_STRATEGY_MAP[agent.id];

            return (
              <button
                key={agent.id}
                type="button"
                onClick={() => handleOpenDossier(agent)}
                className={`group rounded-lg border p-3 text-left transition-all cursor-pointer ${
                  isSelected
                    ? "bg-slate-800/90 border-amber-500/60 ring-1 ring-amber-500/30"
                    : "bg-slate-900/70 border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/80"
                }`}
                aria-label={`Open ${agent.name} agent dossier`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="p-1.5 rounded-md border border-slate-700 bg-slate-950 text-amber-400 shrink-0">
                    {getAgentIcon(agent.id)}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[10px] uppercase tracking-wider text-slate-500 font-mono">
                      {agent.title}
                    </span>
                    <span className="block truncate text-xs font-semibold text-slate-100 group-hover:text-amber-300">
                      {agent.name.split(",")[0]}
                    </span>
                  </span>
                </div>
                <span className="mt-2 block truncate border-t border-slate-800 pt-2 text-[10px] text-slate-400 font-mono">
                  {strategy.strategyName}
                </span>
              </button>
            );
          })}
        </div>

      </div>

      {/* Agents Grid Modal Popup */}
      {showAgentsModal && createPortal(
        (
        <div
          id="agents-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAgentsModal(false);
          }}
        >
          <div
            id="agents-grid-modal"
            className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-4xl w-full shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6 border-b border-slate-800 bg-slate-900 flex-shrink-0">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white font-mono">Agent Roster</h3>
                <p className="text-xs text-slate-400 mt-0.5">5 Quantitative Investment Specialists</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAgentsModal(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition cursor-pointer flex-shrink-0"
                aria-label="Close agents modal"
              >
                <X className="w-4 h-4" />
                <span>Close</span>
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {AGENT_ROSTER.map((agent) => {
                  const isSelected = activeAgent === agent.id;
                  const strat = AGENT_STRATEGY_MAP[agent.id];

                  return (
                    <div
                      key={agent.id}
                      id={`agent-card-${agent.id}`}
                      onClick={() => {
                        handleOpenDossier(agent);
                        setShowAgentsModal(false);
                      }}
                      role="button"
                      tabIndex={0}
                      title={`Click to view ${agent.name}'s thesis and backtest their ${strat.strategyName} strategy`}
                      className={`relative group cursor-pointer p-3 rounded-lg border transition-all text-left select-none ${
                        isSelected
                          ? "bg-slate-800/90 border-amber-500/60 ring-1 ring-amber-500/30 shadow-lg shadow-amber-500/5"
                          : "bg-slate-900/60 hover:bg-slate-850 hover:border-amber-500/40 border-slate-800/80 hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className={`p-1.5 rounded-md border transition-transform group-hover:scale-105 ${
                              agent.id === "cio"
                                ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
                                : agent.id === "equityAnalyst"
                                ? "bg-blue-500/15 border-blue-500/30 text-blue-400"
                                : agent.id === "cto"
                                ? "bg-cyan-500/15 border-cyan-500/30 text-cyan-400"
                                : agent.id === "macroStrategist"
                                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                                : "bg-rose-500/15 border-rose-500/30 text-rose-400"
                            }`}
                          >
                            {getAgentIcon(agent.id)}
                          </div>
                          <div className="min-w-0">
                            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider truncate">
                              {agent.id === "cio"
                                ? "CIO"
                                : agent.id === "equityAnalyst"
                                ? "Equity Lead"
                                : agent.id === "cto"
                                ? "CTO"
                                : agent.id === "macroStrategist"
                                ? "Global Macro"
                                : "CRO (Bear)"}
                            </div>
                            <div className="text-xs font-semibold text-slate-100 truncate group-hover:text-amber-300 transition-colors">
                              {agent.name.split(",")[0]}
                            </div>
                          </div>
                        </div>

                        <span className="p-1 text-slate-500 group-hover:text-amber-400 rounded transition flex-shrink-0">
                          <Sliders className="w-3 h-3" />
                        </span>
                      </div>

                      {/* Strategy Micro-Badge */}
                      <div className="mt-2 pt-1.5 border-t border-slate-800/70 flex items-center justify-between text-[10px] font-mono">
                        <span className="text-slate-400 truncate flex items-center gap-1">
                          <Play className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                          <span className="truncate">{strat.strategyName.split("&")[0]}</span>
                        </span>
                        <span className="text-amber-400/90 text-[9px] font-bold group-hover:underline">
                          View ↗
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        ),
        document.body,
      )}

      {/* Agent Dossier & Strategy Command Modal */}
      {inspectAgent && createPortal(
        (
        <div
          id="agent-popup-backdrop"
          className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setInspectAgent(null);
          }}
        >
          <div
            id={`agent-modal-${inspectAgent.id}`}
            className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full shadow-2xl relative flex flex-col my-auto max-h-[92vh] sm:max-h-[88vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Fixed/Sticky Header with Clear Close Button */}
            <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6 border-b border-slate-800 bg-slate-900 flex-shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-amber-400 flex-shrink-0 shadow-inner">
                  {getAgentIcon(inspectAgent.id)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-bold text-white font-mono truncate">
                      {inspectAgent.name}
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 uppercase tracking-wide font-semibold">
                      Agent Dossier
                    </span>
                  </div>
                  <div className="text-xs font-mono text-amber-400 font-semibold">{inspectAgent.title}</div>
                  <div className="text-xs text-slate-400 truncate">{inspectAgent.role}</div>
                </div>
              </div>

              {/* Prominent High-Contrast Close Button */}
              <button
                type="button"
                id="close-agent-modal-btn"
                onClick={() => setInspectAgent(null)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 hover:text-white border border-slate-700 hover:border-slate-600 transition shadow-sm cursor-pointer group flex-shrink-0"
                aria-label="Close Agent Dossier"
                title="Close (Esc)"
              >
                <span>Close</span>
                <X className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
              </button>
            </div>

            {/* Modal Scrollable Body - Shows Full Content */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-slate-200 divide-y divide-slate-800/60">
              {/* Institutional Mandate */}
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block font-semibold flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-blue-400" />
                  Institutional Mandate & Authority
                </span>
                <p className="text-slate-200 leading-relaxed bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 font-sans text-xs sm:text-sm">
                  {inspectAgent.mandate}
                </p>
              </div>

              {/* Analytical Tone & Mandated Lens */}
              <div className="pt-4 space-y-2">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Analytical Tone & Mandated Lens
                </span>
                <div className="text-amber-300 font-mono text-xs bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0"></span>
                  <span>{inspectAgent.tone}</span>
                </div>
              </div>

              {/* Agent's Quantitative Strategy Card */}
              {AGENT_STRATEGY_MAP[inspectAgent.id] && (
                <div className="pt-4 space-y-3">
                  <div className="bg-gradient-to-br from-amber-500/10 via-slate-950 to-slate-900 border border-amber-500/35 rounded-xl p-4 sm:p-5 space-y-3 shadow-lg">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold uppercase border border-amber-500/40">
                          Algorithmic Strategy
                        </span>
                        <h4 className="font-bold text-white text-sm sm:text-base font-mono">
                          {AGENT_STRATEGY_MAP[inspectAgent.id].strategyName}
                        </h4>
                      </div>
                      <span className="text-xs font-mono text-slate-400 bg-slate-900/90 px-2.5 py-1 rounded border border-slate-800">
                        Target Ticker: <strong className="text-amber-400">${currentSymbol}</strong>
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                      {AGENT_STRATEGY_MAP[inspectAgent.id].philosophy}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-mono pt-1">
                      <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1">
                        <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          Entry Trigger
                        </span>
                        <p className="text-slate-300 leading-normal text-[11px] sm:text-xs">
                          {AGENT_STRATEGY_MAP[inspectAgent.id].entryRule}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1">
                        <span className="text-rose-400 font-bold flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                          Exit / Take Profit
                        </span>
                        <p className="text-slate-300 leading-normal text-[11px] sm:text-xs">
                          {AGENT_STRATEGY_MAP[inspectAgent.id].exitRule}
                        </p>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1 text-xs font-mono">
                      <span className="text-amber-400 font-bold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                        Risk Collar Overlay
                      </span>
                      <p className="text-slate-300 leading-normal text-[11px] sm:text-xs">
                        {AGENT_STRATEGY_MAP[inspectAgent.id].riskOverlay}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Fixed/Sticky Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 sm:px-6 sm:py-4 border-t border-slate-800 bg-slate-900 flex-shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="modal-close-footer-btn"
                  onClick={() => setInspectAgent(null)}
                  className="px-3.5 py-2 text-xs font-mono font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
                >
                  Close
                </button>

                <button
                  type="button"
                  id={`modal-phase1-btn-${inspectAgent.id}`}
                  onClick={() => {
                    onSelectAgent(inspectAgent.id);
                    if (onNavigateTab) onNavigateTab("phase1");
                    setInspectAgent(null);
                  }}
                  className="px-3 py-2 text-xs font-mono rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                  <span>Phase 1</span>
                </button>

                <button
                  type="button"
                  id={`modal-phase2-btn-${inspectAgent.id}`}
                  onClick={() => {
                    if (onNavigateTab) onNavigateTab("phase2");
                    setInspectAgent(null);
                  }}
                  className="px-3 py-2 text-xs font-mono rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Phase 2</span>
                </button>
              </div>

              <button
                type="button"
                id={`modal-backtest-btn-${inspectAgent.id}`}
                onClick={() => handleLaunchBacktest(inspectAgent.id)}
                className="px-4 py-2 text-xs font-mono rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:from-amber-600 active:to-amber-700 text-slate-950 font-bold transition flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Backtest Strategy on ${currentSymbol}</span>
              </button>
            </div>
          </div>
        </div>
        ),
        document.body,
      )}
    </header>
  );
};

