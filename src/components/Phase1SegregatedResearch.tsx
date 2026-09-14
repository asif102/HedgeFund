import React, { useState } from "react";
import { Phase1Data, AgentId, StrategyType } from "../types";
import {
  TrendingUp,
  Cpu,
  Globe,
  ShieldAlert,
  Briefcase,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Table,
  Layers,
  Play,
} from "lucide-react";

interface Phase1SegregatedResearchProps {
  data: Phase1Data;
  activeFilter: AgentId | "all";
  onSelectAgent: (id: AgentId | "all") => void;
  onRunAgentStrategy?: (strategyId: StrategyType) => void;
}

export const Phase1SegregatedResearch: React.FC<Phase1SegregatedResearchProps> = ({
  data,
  activeFilter,
  onSelectAgent,
  onRunAgentStrategy,
}) => {
  return (
    <div className="space-y-6">
      {/* Phase Explanatory Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 bg-slate-900/60 border border-slate-800 rounded-lg text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-500/40">
            PHASE 1
          </span>
          <span className="font-semibold text-slate-200">
            Segregated Mandate Deep-Dive Research
          </span>
        </div>
        <p className="text-slate-400 text-[11px]">
          Each agent conducts independent quantitative and qualitative analysis through their strict mandate.
        </p>
      </div>

      {/* Grid of Agent Research Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 1. Lead Equity Research Analyst */}
        {(activeFilter === "all" || activeFilter === "equityAnalyst") && (
          <div
            id="research-equity-analyst"
            className="bg-slate-900/80 border border-blue-500/30 rounded-xl p-5 space-y-4 shadow-sm relative overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-500/15 text-blue-400 border border-blue-500/30">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white font-mono text-sm">
                    {data.equityAnalyst.agentName}
                  </h3>
                  <div className="text-xs text-blue-400/90 font-mono">
                    Fundamental & Valuation Deep-Dive
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-1 rounded">
                DCF & Earnings Model
              </span>
            </div>

            {/* Key Findings */}
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-2 font-semibold">
                Key Fundamental Findings
              </span>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {data.equityAnalyst.keyFindings.map((finding, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-slate-950/50 p-2 rounded border border-slate-800/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0"></span>
                    <span>{finding}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Financial Health */}
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1 font-semibold">
                Financial Health & Cash Flow
              </span>
              <p className="text-xs text-slate-300 bg-slate-950/40 p-2.5 rounded border border-slate-800/80 leading-relaxed">
                {data.equityAnalyst.financialHealth}
              </p>
            </div>

            {/* Valuation Metrics Table */}
            {data.equityAnalyst.valuationMetrics && data.equityAnalyst.valuationMetrics.length > 0 && (
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5 font-semibold flex items-center gap-1.5">
                  <Table className="w-3.5 h-3.5 text-blue-400" />
                  Valuation Metrics vs Benchmarks
                </span>
                <div className="overflow-x-auto rounded border border-slate-800">
                  <table className="w-full text-left text-[11px] font-mono">
                    <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                      <tr>
                        <th className="px-2.5 py-1.5">Metric</th>
                        <th className="px-2.5 py-1.5">Target Value</th>
                        <th className="px-2.5 py-1.5">Sector Peer</th>
                        <th className="px-2.5 py-1.5">Equity Assessment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-900/40 text-slate-200">
                      {data.equityAnalyst.valuationMetrics.map((vm, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/40">
                          <td className="px-2.5 py-1.5 font-semibold text-white">{vm.metric}</td>
                          <td className="px-2.5 py-1.5 text-blue-300 font-bold">{vm.value}</td>
                          <td className="px-2.5 py-1.5 text-slate-400">{vm.benchmark}</td>
                          <td className="px-2.5 py-1.5 text-slate-300 text-[10px]">{vm.assessment}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Moat Assessment */}
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1 font-semibold">
                Competitive Moat (Porter's 5 Forces)
              </span>
              <p className="text-xs text-slate-300 bg-blue-950/20 border border-blue-500/20 p-2.5 rounded leading-relaxed">
                {data.equityAnalyst.moatAssessment}
              </p>
            </div>

            {/* Backtest Action Bar */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400">
                Strategy: <strong className="text-blue-300 font-semibold">Deep Value Mean Reversion</strong>
              </span>
              <button
                id="backtest-elena-strategy-btn"
                onClick={() => onRunAgentStrategy?.("agent_equity_value")}
                className="px-3 py-1.5 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/40 text-blue-300 hover:text-white text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Backtest Elena's Strategy</span>
              </button>
            </div>
          </div>
        )}

        {/* 2. Chief Technology Officer (CTO) */}
        {(activeFilter === "all" || activeFilter === "cto") && (
          <div
            id="research-cto"
            className="bg-slate-900/80 border border-cyan-500/30 rounded-xl p-5 space-y-4 shadow-sm relative overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white font-mono text-sm">
                    {data.cto.agentName}
                  </h3>
                  <div className="text-xs text-cyan-400/90 font-mono">
                    Technological Viability & Secular Moat
                  </div>
                </div>
              </div>
              {data.cto.scalabilityScore && (
                <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1 rounded border border-slate-800 text-xs font-mono">
                  <span className="text-slate-400 text-[10px]">Scalability:</span>
                  <span className="font-bold text-cyan-400">{data.cto.scalabilityScore}/100</span>
                </div>
              )}
            </div>

            {/* Key Findings */}
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-2 font-semibold">
                Tech Stack & Innovation Findings
              </span>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {data.cto.keyFindings.map((finding, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-slate-950/50 p-2 rounded border border-slate-800/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0"></span>
                    <span>{finding}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Architecture Analysis */}
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1 font-semibold flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                Silicon / Software Architecture & Viability
              </span>
              <p className="text-xs text-slate-300 bg-slate-950/40 p-2.5 rounded border border-slate-800/80 leading-relaxed">
                {data.cto.techStackAnalysis}
              </p>
            </div>

            {/* Disruption Risk & R&D Efficiency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950/40 p-2.5 rounded border border-slate-800/80">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1 font-semibold">
                  Disruption Risk
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {data.cto.disruptionRisk}
                </p>
              </div>
              <div className="bg-slate-950/40 p-2.5 rounded border border-slate-800/80">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1 font-semibold">
                  R&D Efficiency & Runway
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {data.cto.rdEfficiency}
                </p>
              </div>
            </div>

            {/* Backtest Action Bar */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400">
                Strategy: <strong className="text-cyan-300 font-semibold">Tech Breakout & Innovation Momentum</strong>
              </span>
              <button
                id="backtest-aris-strategy-btn"
                onClick={() => onRunAgentStrategy?.("agent_cto_breakout")}
                className="px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 hover:text-white text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Backtest Aris's Strategy</span>
              </button>
            </div>
          </div>
        )}

        {/* 3. Global Macro & Geopolitical Strategist */}
        {(activeFilter === "all" || activeFilter === "macroStrategist") && (
          <div
            id="research-macro-strategist"
            className="bg-slate-900/80 border border-emerald-500/30 rounded-xl p-5 space-y-4 shadow-sm relative overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white font-mono text-sm">
                    {data.macroStrategist.agentName}
                  </h3>
                  <div className="text-xs text-emerald-400/90 font-mono">
                    Top-Down Macro & Geopolitical Friction
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-1 rounded">
                Global Secular Trends
              </span>
            </div>

            {/* Key Findings */}
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-2 font-semibold">
                Geopolitical & Macro Drivers
              </span>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {data.macroStrategist.keyFindings.map((finding, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-slate-950/50 p-2 rounded border border-slate-800/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></span>
                    <span>{finding}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Interest Rate & Monetary */}
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1 font-semibold">
                Monetary Policy, Rates & Liquidity Regime
              </span>
              <p className="text-xs text-slate-300 bg-slate-950/40 p-2.5 rounded border border-slate-800/80 leading-relaxed">
                {data.macroStrategist.interestRateAndMonetaryContext}
              </p>
            </div>

            {/* Supply Chain & Geopolitics */}
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1 font-semibold">
                Supply Chain Chokepoints & Geographic Exposure
              </span>
              <p className="text-xs text-slate-300 bg-emerald-950/20 border border-emerald-500/20 p-2.5 rounded leading-relaxed">
                {data.macroStrategist.geopoliticalSupplyChainRisk}
              </p>
            </div>

            {/* Backtest Action Bar */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400">
                Strategy: <strong className="text-emerald-300 font-semibold">Monetary Regime & Yield Filter</strong>
              </span>
              <button
                id="backtest-henrik-strategy-btn"
                onClick={() => onRunAgentStrategy?.("agent_macro_regime")}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 hover:text-white text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Backtest Henrik's Strategy</span>
              </button>
            </div>
          </div>
        )}

        {/* 4. Chief Risk Officer (CRO) - The Bear */}
        {(activeFilter === "all" || activeFilter === "cro") && (
          <div
            id="research-cro"
            className="bg-slate-900/80 border border-rose-500/40 rounded-xl p-5 space-y-4 shadow-sm relative overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-rose-500/15 text-rose-400 border border-rose-500/30">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white font-mono text-sm">
                    {data.cro.agentName}
                  </h3>
                  <div className="text-xs text-rose-400 font-mono font-semibold">
                    The Devil's Advocate & Tail-Risk Stress Test
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-rose-400 bg-rose-950/80 border border-rose-500/40 px-2 py-1 rounded font-bold uppercase">
                Bear Mandate
              </span>
            </div>

            {/* Top 3 Vulnerabilities */}
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-rose-400 block mb-2 font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                Top Core Vulnerabilities (Thesis Breakers)
              </span>
              <ul className="space-y-1.5 text-xs text-slate-200">
                {data.cro.topVulnerabilities.map((vuln, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-rose-950/30 p-2.5 rounded border border-rose-900/50">
                    <span className="text-rose-400 font-mono font-bold text-xs">#{idx + 1}</span>
                    <span className="text-slate-300">{vuln}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tail Risk Worst Case */}
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1 font-semibold">
                Quantified Tail-Risk / Worst-Case Scenario
              </span>
              <p className="text-xs text-rose-300 bg-slate-950/60 p-2.5 rounded border border-rose-800/40 leading-relaxed font-mono">
                {data.cro.tailRiskTriggers}
              </p>
            </div>

            {/* Suggested Hedging Overlay */}
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1 font-semibold">
                Suggested Hedging Blueprint
              </span>
              <p className="text-xs text-emerald-300 bg-emerald-950/20 border border-emerald-500/30 p-2.5 rounded leading-relaxed font-mono">
                {data.cro.hedgingRecommendation}
              </p>
            </div>

            {/* Backtest Action Bar */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400">
                Strategy: <strong className="text-rose-300 font-semibold">Protective Collar & Downside Hedging</strong>
              </span>
              <button
                id="backtest-rachel-strategy-btn"
                onClick={() => onRunAgentStrategy?.("agent_cro_hedge")}
                className="px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 hover:text-white text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Backtest Rachel's Strategy</span>
              </button>
            </div>
          </div>
        )}

        {/* 5. CIO Strategic Orientation */}
        {(activeFilter === "all" || activeFilter === "cio") && (
          <div
            id="research-cio"
            className="bg-slate-900/80 border border-amber-500/40 rounded-xl p-5 space-y-4 shadow-sm lg:col-span-2 relative overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white font-mono text-sm">
                    {data.cio.agentName}
                  </h3>
                  <div className="text-xs text-amber-400/90 font-mono">
                    Chief Investment Officer Strategic Framing
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 border border-amber-500/30 px-2.5 py-1 rounded">
                Committee Chairman
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950/60 p-3 rounded border border-slate-800">
                <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 block mb-1 font-semibold">
                  Initial Hypothesis & Orientation
                </span>
                <p className="text-slate-300 leading-relaxed">
                  {data.cio.initialHypothesis}
                </p>
                <div className="mt-2 text-[11px] text-amber-300 font-mono">
                  Orientation: <strong>{data.cio.strategicOrientation}</strong>
                </div>
              </div>

              <div className="bg-slate-950/60 p-3 rounded border border-slate-800">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1 font-semibold">
                  Critical Inquiries for Phase 2 Debate
                </span>
                <ul className="space-y-1.5 text-slate-300">
                  {data.cio.criticalQuestionsToResolve.map((q, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-amber-400 font-mono">?</span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Backtest Action Bar */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400">
                Strategy: <strong className="text-amber-300 font-semibold">Macro-Fundamental Core Long (CIO)</strong>
              </span>
              <button
                id="backtest-marcus-strategy-btn"
                onClick={() => onRunAgentStrategy?.("agent_cio_momentum")}
                className="px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 hover:text-white text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Backtest Marcus's Strategy</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
