import React, { useState } from "react";
import { MemorandumData, StrategyType } from "../types";
import {
  FileText,
  Copy,
  Check,
  Printer,
  Download,
  Shield,
  TrendingUp,
  Cpu,
  Globe,
  Briefcase,
  AlertTriangle,
  Lock,
  Play,
  BarChart3,
} from "lucide-react";

interface Phase3MemorandumProps {
  memorandum: MemorandumData;
  target: string;
  onRunBacktest?: (strategyId: StrategyType) => void;
}

export const Phase3Memorandum: React.FC<Phase3MemorandumProps> = ({
  memorandum,
  target,
  onRunBacktest,
}) => {
  const [copied, setCopied] = useState(false);

  const getRecommendationBadge = (rec: string) => {
    const lower = rec.toLowerCase();
    if (lower.includes("strong buy")) {
      return "bg-emerald-500/20 text-emerald-300 border-emerald-500/50";
    }
    if (lower.includes("buy")) {
      return "bg-cyan-500/20 text-cyan-300 border-cyan-500/50";
    }
    if (lower.includes("hold")) {
      return "bg-amber-500/20 text-amber-300 border-amber-500/50";
    }
    if (lower.includes("short")) {
      return "bg-purple-500/20 text-purple-300 border-purple-500/50";
    }
    return "bg-rose-500/20 text-rose-300 border-rose-500/50";
  };

  const generateMarkdown = () => {
    const mem = memorandum;
    return `### ${mem.title || `${target}: Institutional Investment Memorandum`}

#### 1. EXECUTIVE SUMMARY & CIO VERDICT
* **Final Recommendation:** ${mem.executiveSummary.finalRecommendation}
* **Target Horizon:** ${mem.executiveSummary.targetHorizon}
* **The Core Thesis:** ${mem.executiveSummary.coreThesis}
${mem.executiveSummary.allocationWeight ? `* **Portfolio Allocation:** ${mem.executiveSummary.allocationWeight}` : ""}

#### 2. FUNDAMENTAL & VALUATION ANALYSIS (Equity Analyst)
* **Financial Health:** ${mem.fundamentalValuation.financialHealth}
* **Valuation Assessment:** ${mem.fundamentalValuation.valuationAssessment}
* **Competitive Moat:** ${mem.fundamentalValuation.competitiveMoat}

#### 3. TECHNOLOGICAL & TREND FEASIBILITY (CTO)
* **Innovation Scorecard:** ${mem.techTrendFeasibility.innovationScorecard}
* **Disruption Risk:** ${mem.techTrendFeasibility.disruptionRisk}

#### 4. MACRO & GEOPOLITICAL DRIVERS (Macro Strategist)
* **Tailwinds/Headwinds:** ${mem.macroGeopoliticalDrivers.tailwindsHeadwinds}
* **Global Positioning:** ${mem.macroGeopoliticalDrivers.globalPositioning}

#### 5. RISK ASSESSMENT & BEAR CASE (CRO)
* **Top 3 Vulnerabilities:**
${mem.riskAssessmentBearCase.top3Vulnerabilities.map((v) => `  * ${v}`).join("\n")}
* **Tail-Risk / Worst-Case Scenario:** ${mem.riskAssessmentBearCase.tailRiskWorstCase}
* **Suggested Hedging Strategy:** ${mem.riskAssessmentBearCase.suggestedHedgingStrategy}
`;
  };

  const handleCopy = () => {
    const text = generateMarkdown();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const text = generateMarkdown();
    const blob = new Blob([text], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${target.replace(/[^a-zA-Z0-9]/g, "_")}_Investment_Memorandum.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl print:hidden">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
          <FileText className="w-4 h-4 text-amber-400" />
          <span className="font-semibold text-white">Investment Committee Final Memorandum</span>
          <span className="text-slate-500">• Official Synthesized Deliverable</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition border border-slate-700 shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied Markdown" : "Copy Markdown"}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition border border-slate-700 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export .MD</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition border border-slate-700 shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Official Institutional Memorandum Document */}
      <div
        id="investment-memorandum-document"
        className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-6 sm:p-9 shadow-2xl relative space-y-8 font-sans print:bg-white print:text-black print:border-none print:shadow-none print:p-0"
      >
        {/* Document Header & Watermark */}
        <div className="border-b-2 border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-amber-400 font-bold mb-1">
              <span>QUANTUM ALPHA CAPITAL</span>
              <span className="text-slate-600">•</span>
              <span>PORTFOLIO STRATEGY COMMITTEE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-mono tracking-tight print:text-black">
              {memorandum.title || `${target}: Institutional Investment Memorandum`}
            </h2>
          </div>

          <div className="flex flex-col sm:items-end font-mono text-xs text-slate-400">
            <div>CONFIDENTIAL / PROPRIETARY</div>
            <div className="text-[11px] text-slate-500">Classification: Institutional Grade</div>
            <div className="text-[11px] text-emerald-400 font-semibold mt-0.5">Signed by CIO Dr. Marcus Vance</div>
          </div>
        </div>

        {/* Section 1: Executive Summary & CIO Verdict */}
        <div id="memo-section-1" className="space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
            <div className="p-1.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Briefcase className="w-4 h-4" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white font-mono uppercase tracking-wide print:text-black">
              1. EXECUTIVE SUMMARY & CIO VERDICT
            </h3>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4.5 space-y-3 font-mono print:bg-slate-50 print:border-slate-300">
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 uppercase text-[11px]">Final Recommendation:</span>
                <span
                  className={`px-2.5 py-0.5 rounded border font-bold uppercase text-xs ${getRecommendationBadge(
                    memorandum.executiveSummary.finalRecommendation
                  )}`}
                >
                  {memorandum.executiveSummary.finalRecommendation}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-400 uppercase text-[11px]">Target Horizon:</span>
                <span className="text-slate-200 font-semibold">
                  {memorandum.executiveSummary.targetHorizon}
                </span>
              </div>

              {memorandum.executiveSummary.allocationWeight && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 uppercase text-[11px]">Allocation Weight:</span>
                  <span className="text-amber-300 font-semibold">
                    {memorandum.executiveSummary.allocationWeight}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-800/80">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-1">
                The Core Thesis:
              </div>
              <p className="text-sm font-sans text-slate-200 leading-relaxed print:text-slate-900">
                {memorandum.executiveSummary.coreThesis}
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Fundamental & Valuation Analysis (Equity Analyst) */}
        <div id="memo-section-2" className="space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
            <div className="p-1.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white font-mono uppercase tracking-wide print:text-black">
              2. FUNDAMENTAL & VALUATION ANALYSIS (Equity Analyst)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-1.5 print:bg-slate-50">
              <div className="text-[11px] font-mono uppercase text-blue-400 font-bold">
                Financial Health
              </div>
              <p className="text-slate-300 leading-relaxed font-sans print:text-slate-800">
                {memorandum.fundamentalValuation.financialHealth}
              </p>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-1.5 print:bg-slate-50">
              <div className="text-[11px] font-mono uppercase text-blue-400 font-bold">
                Valuation Assessment
              </div>
              <p className="text-slate-300 leading-relaxed font-sans print:text-slate-800">
                {memorandum.fundamentalValuation.valuationAssessment}
              </p>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-1.5 print:bg-slate-50">
              <div className="text-[11px] font-mono uppercase text-blue-400 font-bold">
                Competitive Moat
              </div>
              <p className="text-slate-300 leading-relaxed font-sans print:text-slate-800">
                {memorandum.fundamentalValuation.competitiveMoat}
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Technological & Trend Feasibility (CTO) */}
        <div id="memo-section-3" className="space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
            <div className="p-1.5 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              <Cpu className="w-4 h-4" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white font-mono uppercase tracking-wide print:text-black">
              3. TECHNOLOGICAL & TREND FEASIBILITY (CTO)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-1.5 print:bg-slate-50">
              <div className="text-[11px] font-mono uppercase text-cyan-400 font-bold">
                Innovation Scorecard & Architecture
              </div>
              <p className="text-slate-300 leading-relaxed font-sans print:text-slate-800">
                {memorandum.techTrendFeasibility.innovationScorecard}
              </p>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-1.5 print:bg-slate-50">
              <div className="text-[11px] font-mono uppercase text-cyan-400 font-bold">
                Disruption Risk & Competitor Threat
              </div>
              <p className="text-slate-300 leading-relaxed font-sans print:text-slate-800">
                {memorandum.techTrendFeasibility.disruptionRisk}
              </p>
            </div>
          </div>
        </div>

        {/* Section 4: Macro & Geopolitical Drivers (Macro Strategist) */}
        <div id="memo-section-4" className="space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
            <div className="p-1.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <Globe className="w-4 h-4" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white font-mono uppercase tracking-wide print:text-black">
              4. MACRO & GEOPOLITICAL DRIVERS (Macro Strategist)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-1.5 print:bg-slate-50">
              <div className="text-[11px] font-mono uppercase text-emerald-400 font-bold">
                Tailwinds vs Headwinds (Rates, Monetary & Regulatory)
              </div>
              <p className="text-slate-300 leading-relaxed font-sans print:text-slate-800">
                {memorandum.macroGeopoliticalDrivers.tailwindsHeadwinds}
              </p>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-1.5 print:bg-slate-50">
              <div className="text-[11px] font-mono uppercase text-emerald-400 font-bold">
                Global Positioning & Supply Chain Resilience
              </div>
              <p className="text-slate-300 leading-relaxed font-sans print:text-slate-800">
                {memorandum.macroGeopoliticalDrivers.globalPositioning}
              </p>
            </div>
          </div>
        </div>

        {/* Section 5: Risk Assessment & Bear Case (CRO) */}
        <div id="memo-section-5" className="space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
            <div className="p-1.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30">
              <Shield className="w-4 h-4" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white font-mono uppercase tracking-wide print:text-black">
              5. RISK ASSESSMENT & BEAR CASE (CRO)
            </h3>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* Top 3 Vulnerabilities */}
            <div className="bg-rose-950/20 border border-rose-900/40 p-4 rounded-xl space-y-2">
              <div className="text-[11px] font-mono uppercase text-rose-400 font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                Top 3 Vulnerabilities (Downside Triggers)
              </div>
              <ul className="space-y-1.5 text-slate-200">
                {memorandum.riskAssessmentBearCase.top3Vulnerabilities.map((vuln, i) => (
                  <li key={i} className="flex items-start gap-2 bg-slate-950/40 p-2 rounded border border-rose-900/30">
                    <span className="font-mono text-rose-400 font-bold">0{i + 1}.</span>
                    <span className="text-slate-300 font-sans">{vuln}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tail Risk & Hedging Strategy Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-1.5 print:bg-slate-50">
                <div className="text-[11px] font-mono uppercase text-rose-400 font-bold">
                  Tail-Risk / Worst-Case Scenario
                </div>
                <p className="text-slate-300 font-mono text-xs leading-relaxed print:text-slate-900">
                  {memorandum.riskAssessmentBearCase.tailRiskWorstCase}
                </p>
              </div>

              <div className="bg-emerald-950/15 p-4 rounded-xl border border-emerald-500/30 space-y-1.5 print:bg-slate-50">
                <div className="text-[11px] font-mono uppercase text-emerald-400 font-bold flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  Suggested Portfolio Hedging Strategy
                </div>
                <p className="text-emerald-200/90 font-mono text-xs leading-relaxed print:text-slate-900">
                  {memorandum.riskAssessmentBearCase.suggestedHedgingStrategy}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quantitative Validation Banner */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-cyan-500/10 to-slate-900 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono font-bold text-white uppercase">
                Quantitative Validation: Backtest Committee Strategy
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Simulate this {memorandum.executiveSummary.recommendation} thesis and {memorandum.executiveSummary.suggestedHorizon} timeframe with historical tick data.
            </p>
          </div>
          <button
            id="validate-memo-backtest-btn"
            onClick={() => onRunBacktest?.("agentic_consensus")}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer whitespace-nowrap shadow-md shadow-amber-500/10"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Launch Historical Backtest</span>
          </button>
        </div>

        {/* Committee Signature Footnote */}
        <div className="pt-6 border-t border-slate-800 text-[11px] font-mono text-slate-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>Approved by Investment Committee • Quantum Alpha Capital LLC</div>
          <div className="flex items-center gap-4">
            <span>Auth: RSA-4096 Multi-Signature</span>
            <span className="text-emerald-400 font-semibold">Status: Executed</span>
          </div>
        </div>
      </div>
    </div>
  );
};
