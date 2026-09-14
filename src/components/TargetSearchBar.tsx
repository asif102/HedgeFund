import React, { useState } from "react";
import {
  Search,
  Sparkles,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Terminal,
  Flame,
  Radio,
  ExternalLink,
  Zap,
} from "lucide-react";

interface TargetSearchBarProps {
  currentTarget: string;
  onSearch: (target: string) => void;
  isAnalyzing: boolean;
  selectedBenchmark: string;
  onSelectBenchmark: (key: string) => void;
  error?: string | null;
}

export const TargetSearchBar: React.FC<TargetSearchBarProps> = ({
  currentTarget,
  onSearch,
  isAnalyzing,
  selectedBenchmark,
  onSelectBenchmark,
  error,
}) => {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSearch(inputValue.trim());
    }
  };

  const detectedTicker = inputValue.trim().toUpperCase().match(/^[A-Z]{1,5}$/)?.[0];

  const benchmarks = [
    { key: "NVDA", label: "NVDA", desc: "NVIDIA AI Compute & CUDA Moat", type: "Equity" },
    { key: "MSFT", label: "MSFT", desc: "Enterprise Cloud & Copilot AI Monetization", type: "Mega-Cap" },
    { key: "ASML", label: "ASML", desc: "Monopoly EUV Photolithography", type: "Semi-Cap" },
    { key: "TSLA", label: "TSLA", desc: "Autonomous Robotaxi vs EV Margins", type: "Mobility / AI" },
    { key: "PLTR", label: "PLTR", desc: "Enterprise AIP & Defense Ontology", type: "Enterprise AI" },
    { key: "Quantum Computing Hardware", label: "Quantum QPU", desc: "Fault-Tolerant Qubit Secular Shift", type: "Tech Shift" },
  ];

  const quickTickers = ["MSFT", "NVDA", "AAPL", "AMZN", "GOOGL", "TSLA", "PLTR", "META", "AMD"];

  // Helper to extract clean human-readable error from raw backend or Google API JSON
  const getReadableError = (rawError: string) => {
    try {
      if (rawError.startsWith("{") || rawError.includes('"message":')) {
        const parsed = JSON.parse(rawError);
        const msg = parsed?.error?.message || parsed?.message;
        if (msg) {
          if (parsed?.error?.code === 503 || msg.includes("high demand") || msg.includes("UNAVAILABLE")) {
            return "Google Gemini model is currently experiencing high demand (HTTP 503). Institutional fallback coverage has been activated.";
          }
          return msg;
        }
      }
    } catch {
      // Not JSON, return as-is
    }
    if (rawError.includes("503") || rawError.includes("high demand") || rawError.includes("UNAVAILABLE")) {
      return "Google Gemini model is currently experiencing high demand (HTTP 503). Institutional fallback coverage has been activated.";
    }
    return rawError;
  };

  return (
    <div className="panel-shell max-w-7xl mx-auto w-full p-4 sm:p-5">
      <div className="space-y-4">
        {/* System Prompt Initialization Banner */}
        <div className="flex items-start sm:items-center justify-between gap-3 p-3 bg-slate-950/80 border border-amber-500/20 rounded-lg shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Terminal className="w-4 h-4" />
            </div>
            <div className="text-xs sm:text-sm font-mono text-slate-300">
              <span className="text-emerald-400 font-semibold">Quantum Alpha Capital Agentic Team Online.</span>{" "}
              <span className="text-slate-400">
                Type any ticker to fetch live data from <strong className="text-amber-300 font-mono">finviz.com</strong>.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-mono">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span>finviz.com Live Proxy Connected</span>
            </div>
          </div>
        </div>

        {/* Search Input Bar */}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              id="target-input-field"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter ticker to pull live finviz.com data (e.g. MSFT, AAPL, NVDA, TSLA, AMZN, PLTR)..."
              disabled={isAnalyzing}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-mono transition disabled:opacity-50"
            />
            {detectedTicker && (
              <div className="absolute right-3 top-2.5 flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                <Zap className="w-3 h-3 text-emerald-400" />
                <span>Live Finviz: {detectedTicker}</span>
              </div>
            )}
          </div>

          <button
            id="run-analysis-btn"
            type="submit"
            disabled={isAnalyzing || !inputValue.trim()}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-mono font-semibold text-xs sm:text-sm rounded-lg transition shadow-md shadow-amber-500/10 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isAnalyzing ? "Executing Multi-Agent Committee..." : "Fetch Finviz & Analyze"}</span>
            <ArrowRight className="w-4 h-4 ml-0.5" />
          </button>
        </form>

        {/* Quick Tickers Live Finviz Bar */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mr-1 flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" />
            Live Finviz Quick Tickers:
          </span>
          {quickTickers.map((tick) => (
            <button
              key={tick}
              type="button"
              id={`quick-ticker-${tick.toLowerCase()}`}
              onClick={() => {
                setInputValue(tick);
                onSearch(tick);
              }}
              disabled={isAnalyzing}
              className="px-2 py-1 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono font-bold text-slate-300 hover:text-amber-400 transition cursor-pointer"
            >
              ${tick}
            </button>
          ))}
        </div>

        {/* Benchmarks & Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            Institutional Dossiers:
          </span>

          {benchmarks.map((b) => {
            const isCurrent = selectedBenchmark === b.key;
            const safeKey = b.key.toLowerCase().replace(/[^a-z0-9_-]/g, "-");
            return (
              <button
                key={b.key}
                id={`benchmark-btn-${safeKey}`}
                onClick={() => {
                  setInputValue(b.key);
                  onSelectBenchmark(b.key);
                }}
                disabled={isAnalyzing}
                className={`group px-3 py-1.5 rounded-md border text-xs font-mono transition flex items-center gap-1.5 cursor-pointer ${
                  isCurrent
                    ? "bg-amber-500/20 border-amber-500/50 text-amber-300 ring-1 ring-amber-500/20"
                    : "bg-slate-950/60 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white"
                }`}
              >
                <span className="font-bold">{b.label}</span>
                <span className="text-[10px] text-slate-500 group-hover:text-slate-400 border-l border-slate-700/60 pl-1.5 hidden md:inline">
                  {b.desc}
                </span>
              </button>
            );
          })}
        </div>

        {error && (
          <div className="flex items-center gap-2 p-2.5 bg-rose-950/40 border border-rose-800/60 rounded text-xs text-rose-300 font-mono">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{getReadableError(error)}</span>
          </div>
        )}
      </div>
    </div>
  );
};
