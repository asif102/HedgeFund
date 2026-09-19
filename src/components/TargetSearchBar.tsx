import React, { useState, useRef, useEffect, useMemo } from "react";
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

// Curated ticker directory for instant client-side autocomplete.
const TICKER_DIRECTORY: Array<{ symbol: string; name: string }> = [
  { symbol: "AAPL", name: "Apple Inc." },
  { symbol: "MSFT", name: "Microsoft Corporation" },
  { symbol: "NVDA", name: "NVIDIA Corporation" },
  { symbol: "AMZN", name: "Amazon.com, Inc." },
  { symbol: "GOOGL", name: "Alphabet Inc. (Google)" },
  { symbol: "GOOG", name: "Alphabet Inc. Class C" },
  { symbol: "META", name: "Meta Platforms, Inc." },
  { symbol: "TSLA", name: "Tesla, Inc." },
  { symbol: "PLTR", name: "Palantir Technologies Inc." },
  { symbol: "AMD", name: "Advanced Micro Devices, Inc." },
  { symbol: "ASML", name: "ASML Holding N.V." },
  { symbol: "AVGO", name: "Broadcom Inc." },
  { symbol: "NFLX", name: "Netflix, Inc." },
  { symbol: "CRM", name: "Salesforce, Inc." },
  { symbol: "ORCL", name: "Oracle Corporation" },
  { symbol: "ADBE", name: "Adobe Inc." },
  { symbol: "INTC", name: "Intel Corporation" },
  { symbol: "IBM", name: "International Business Machines" },
  { symbol: "QCOM", name: "Qualcomm Incorporated" },
  { symbol: "TXN", name: "Texas Instruments Incorporated" },
  { symbol: "JPM", name: "JPMorgan Chase & Co." },
  { symbol: "BAC", name: "Bank of America Corporation" },
  { symbol: "GS", name: "The Goldman Sachs Group, Inc." },
  { symbol: "V", name: "Visa Inc." },
  { symbol: "MA", name: "Mastercard Incorporated" },
  { symbol: "WMT", name: "Walmart Inc." },
  { symbol: "COST", name: "Costco Wholesale Corporation" },
  { symbol: "LULU", name: "Lululemon Athletica Inc." },
  { symbol: "NKE", name: "NIKE, Inc." },
  { symbol: "DIS", name: "The Walt Disney Company" },
  { symbol: "KO", name: "The Coca-Cola Company" },
  { symbol: "PEP", name: "PepsiCo, Inc." },
  { symbol: "MCD", name: "McDonald's Corporation" },
  { symbol: "SBUX", name: "Starbucks Corporation" },
  { symbol: "XOM", name: "Exxon Mobil Corporation" },
  { symbol: "CVX", name: "Chevron Corporation" },
  { symbol: "UNH", name: "UnitedHealth Group Incorporated" },
  { symbol: "JNJ", name: "Johnson & Johnson" },
  { symbol: "PFE", name: "Pfizer Inc." },
  { symbol: "BA", name: "The Boeing Company" },
  { symbol: "GE", name: "General Electric Company" },
  { symbol: "F", name: "Ford Motor Company" },
  { symbol: "GM", name: "General Motors Company" },
  { symbol: "UBER", name: "Uber Technologies, Inc." },
  { symbol: "ABNB", name: "Airbnb, Inc." },
  { symbol: "SHOP", name: "Shopify Inc." },
  { symbol: "SQ", name: "Block, Inc. (Square)" },
  { symbol: "PYPL", name: "PayPal Holdings, Inc." },
  { symbol: "COIN", name: "Coinbase Global, Inc." },
  { symbol: "SNOW", name: "Snowflake Inc." },
  { symbol: "NOW", name: "ServiceNow, Inc." },
];

export const TargetSearchBar: React.FC<TargetSearchBarProps> = ({
  currentTarget,
  onSearch,
  isAnalyzing,
  selectedBenchmark,
  onSelectBenchmark,
  error,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => {
    const query = inputValue.trim().toLowerCase();
    if (!query) return [];
    return TICKER_DIRECTORY.filter(
      (t) =>
        t.symbol.toLowerCase().includes(query) ||
        t.name.toLowerCase().includes(query)
    )
      .sort((a, b) => {
        const aExact = a.symbol.toLowerCase() === query ? 0 : a.symbol.toLowerCase().startsWith(query) ? 1 : 2;
        const bExact = b.symbol.toLowerCase() === query ? 0 : b.symbol.toLowerCase().startsWith(query) ? 1 : 2;
        return aExact - bExact;
      })
      .slice(0, 8);
  }, [inputValue]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectSuggestion = (symbol: string) => {
    setInputValue(symbol);
    setShowSuggestions(false);
    setActiveIndex(-1);
    onSearch(symbol);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      selectSuggestion(suggestions[activeIndex].symbol);
      return;
    }
    if (inputValue.trim()) {
      setShowSuggestions(false);
      onSearch(inputValue.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setActiveIndex(-1);
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
          <div className="relative flex-1" ref={containerRef}>
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              id="target-input-field"
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setShowSuggestions(true);
                setActiveIndex(-1);
              }}
              onFocus={() => inputValue.trim() && setShowSuggestions(true)}
              onKeyDown={handleKeyDown}
              placeholder="Enter ticker to pull live finviz.com data (e.g. MSFT, AAPL, NVDA, TSLA, AMZN, PLTR)..."
              disabled={isAnalyzing}
              autoComplete="off"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-mono transition disabled:opacity-50"
            />
            {detectedTicker && !showSuggestions && (
              <div className="absolute right-3 top-2.5 flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                <Zap className="w-3 h-3 text-emerald-400" />
                <span>Live Finviz: {detectedTicker}</span>
              </div>
            )}

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-30 top-full left-0 right-0 mt-1.5 bg-slate-950 border border-slate-700/80 rounded-lg shadow-xl shadow-black/40 overflow-hidden max-h-72 overflow-y-auto">
                {suggestions.map((s, idx) => (
                  <button
                    key={s.symbol}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => selectSuggestion(s.symbol)}
                    className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 text-left transition cursor-pointer ${
                      idx === activeIndex ? "bg-amber-500/15" : "hover:bg-slate-800/80"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="shrink-0 px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[11px] font-mono font-bold text-amber-400">
                        ${s.symbol}
                      </span>
                      <span className="text-xs font-mono text-slate-300 truncate">{s.name}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                  </button>
                ))}
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
