import React, { useState, useEffect } from "react";
import { MarketQuote } from "../types";
import {
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  RotateCw,
  Clock,
  Layers,
  Radio,
  Newspaper,
  ChevronDown,
  ChevronUp,
  Volume2,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";

interface LiveMarketFeedBarProps {
  quote: MarketQuote;
  onManualRefresh: () => void;
  isRefreshing: boolean;
  autoRefresh: boolean;
  onToggleAutoRefresh: (val: boolean) => void;
  refreshInterval: number;
  onChangeInterval: (seconds: number) => void;
  countdownSeconds: number;
  onOpenNewsFeed?: () => void;
  onOpenSwarmTerminal?: () => void;
  onOpenIndianDesk?: () => void;
}

export const LiveMarketFeedBar: React.FC<LiveMarketFeedBarProps> = ({
  quote,
  onManualRefresh,
  isRefreshing,
  autoRefresh,
  onToggleAutoRefresh,
  refreshInterval,
  onChangeInterval,
  countdownSeconds,
  onOpenNewsFeed,
  onOpenSwarmTerminal,
  onOpenIndianDesk,
}) => {
  const [showOrderBook, setShowOrderBook] = useState(false);
  const [priceFlash, setPriceFlash] = useState<"up" | "down" | null>(null);

  // Flash price green or red when quote changes
  useEffect(() => {
    if (quote.change >= 0) {
      setPriceFlash("up");
    } else {
      setPriceFlash("down");
    }
    const timer = setTimeout(() => setPriceFlash(null), 800);
    return () => clearTimeout(timer);
  }, [quote.price]);

  const isPositive = quote.change >= 0;

  // Day Range percentage position
  const dayRangeSpan = Math.max(0.01, quote.high - quote.low);
  const dayRangePct = Math.min(
    100,
    Math.max(0, ((quote.price - quote.low) / dayRangeSpan) * 100)
  );

  return (
    <div className="border-b border-slate-800 bg-slate-950/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 py-2.5 sm:px-6">
        {/* Main Live Quote Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left: Ticker, Live Price & Day Change */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span>LIVE FEED</span>
              </div>
              <span className="font-mono font-bold text-white text-base sm:text-lg tracking-tight">
                {quote.symbol}
              </span>
              <span className="text-xs text-slate-400 hidden md:inline truncate max-w-[140px]">
                {quote.companyName}
              </span>
            </div>

            {/* Price & Change with micro flash */}
            <div
              className={`flex items-baseline gap-2 px-2.5 py-1 rounded transition-colors duration-300 font-mono ${
                priceFlash === "up"
                  ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40"
                  : priceFlash === "down"
                  ? "bg-rose-500/20 text-rose-300 ring-1 ring-rose-500/40"
                  : "bg-slate-900/80 text-white"
              }`}
            >
              <span className="text-base sm:text-xl font-bold tracking-tight">
                ${quote.price.toFixed(2)}
              </span>
              <span
                className={`flex items-center text-xs font-semibold ${
                  isPositive ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {isPositive ? (
                  <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                )}
                {isPositive ? "+" : ""}
                {quote.change.toFixed(2)} ({isPositive ? "+" : ""}
                {quote.changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>

          {/* Middle: Key Trading Metrics (Volume, VWAP, Day Range) */}
          <div className="hidden lg:flex items-center gap-4 text-xs font-mono text-slate-300">
            {/* Volume vs Avg */}
            <div>
              <span className="text-slate-500 text-[10px] uppercase block">Volume / 30D Avg</span>
              <span className="font-semibold text-slate-200">
                {(quote.volume / 1000000).toFixed(1)}M{" "}
                <span className="text-slate-500 text-[10px]">
                  / {(quote.avgVolume / 1000000).toFixed(1)}M
                </span>
              </span>
            </div>

            {/* VWAP */}
            <div>
              <span className="text-slate-500 text-[10px] uppercase block">VWAP</span>
              <span className="font-semibold text-cyan-400">${quote.vwap.toFixed(2)}</span>
            </div>

            {/* Bid / Ask */}
            <div>
              <span className="text-slate-500 text-[10px] uppercase block">
                Bid / Ask (Spread ${(quote.ask - quote.bid).toFixed(2)})
              </span>
              <span className="text-slate-300">
                <span className="text-emerald-400 font-semibold">${quote.bid.toFixed(2)}</span>
                {" x "}
                <span className="text-slate-500 text-[10px]">{quote.bidSize}</span>
                {" — "}
                <span className="text-rose-400 font-semibold">${quote.ask.toFixed(2)}</span>
                {" x "}
                <span className="text-slate-500 text-[10px]">{quote.askSize}</span>
              </span>
            </div>

            {/* Day Range Mini-Bar */}
            <div className="w-28">
              <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                <span>L: ${quote.low.toFixed(1)}</span>
                <span>H: ${quote.high.toFixed(1)}</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden relative">
                <div
                  className="bg-amber-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${dayRangePct}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Right: Auto-Refresh Controls & Actions */}
          <div className="flex items-center gap-2 text-xs font-mono">
            {/* Auto-Refresh Status Pill */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
              <Clock className="w-3 h-3 text-slate-400" />
              {autoRefresh ? (
                <span>
                  Ticking in <strong className="text-amber-400 font-bold">{countdownSeconds}s</strong>
                </span>
              ) : (
                <span className="text-slate-500">Auto-Refresh Off</span>
              )}
            </div>

            {/* Interval Selector */}
            <select
              value={refreshInterval}
              onChange={(e) => onChangeInterval(Number(e.target.value))}
              className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded px-2 py-1 font-mono focus:outline-none focus:border-amber-500"
              title="Select live auto-refresh frequency"
            >
              <option value={5}>5s Live</option>
              <option value={10}>10s</option>
              <option value={15}>15s</option>
              <option value={30}>30s</option>
              <option value={60}>60s</option>
            </select>

            {/* Manual Refresh Button */}
            <button
              id="manual-market-refresh-btn"
              onClick={onManualRefresh}
              disabled={isRefreshing}
              title="Force immediate market quote and order book refresh"
              className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-amber-400" : ""}`} />
            </button>

            {/* Order Book Depth Toggle */}
            <button
              id="toggle-order-book-btn"
              onClick={() => setShowOrderBook(!showOrderBook)}
              className={`flex items-center gap-1 px-2 py-1 rounded border text-[11px] transition ${
                showOrderBook
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
              }`}
            >
              <Layers className="w-3 h-3" />
              <span className="hidden sm:inline">Depth</span>
              {showOrderBook ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {/* Swarm Lens Animation Trigger */}
            {onOpenSwarmTerminal && (
              <button
                id="open-swarm-lens-btn"
                onClick={onOpenSwarmTerminal}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 hover:text-white text-[11px] transition shadow-sm font-semibold"
                title="View live multi-agent swarm interaction animation (The Lens)"
              >
                <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
                <span className="hidden sm:inline">Swarm Lens</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              </button>
            )}

            {/* Indian Equities Desk Trigger */}
            {onOpenIndianDesk && (
              <button
                id="open-indian-desk-btn"
                onClick={onOpenIndianDesk}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/40 text-orange-300 hover:text-white text-[11px] transition shadow-sm font-semibold"
                title="View Indian Equity Market, NSE/BSE live data, and LiveMint quantitative indicators"
              >
                <span>🇮🇳</span>
                <span className="hidden sm:inline">Indian Equities</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-orange-500/30 text-orange-200">Mint</span>
              </button>
            )}

            {/* News Feed Trigger */}
            {onOpenNewsFeed && (
              <button
                id="open-news-feed-btn"
                onClick={onOpenNewsFeed}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 text-[11px] transition"
              >
                <Newspaper className="w-3 h-3" />
                <span className="hidden sm:inline">News Wire</span>
              </button>
            )}
          </div>
        </div>

        {/* Expandable Order Book Depth & Agent Connectivity Panel */}
        {showOrderBook && (
          <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono animate-fade-in">
            {/* Level 2 Order Depth Bids */}
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              <div className="flex justify-between items-center text-[10px] text-emerald-400 font-bold uppercase mb-1.5 pb-1 border-b border-slate-800">
                <span>Bid Price</span>
                <span>Size</span>
                <span>Total</span>
              </div>
              <div className="space-y-1">
                {quote.orderBook.bids.map((bid, idx) => (
                  <div key={idx} className="flex justify-between text-[11px] relative">
                    <div
                      className="absolute inset-y-0 right-0 bg-emerald-500/10 rounded"
                      style={{ width: `${Math.min(100, (bid.size / 1500) * 100)}%` }}
                    ></div>
                    <span className="font-bold text-emerald-400 relative z-10">
                      ${bid.price.toFixed(2)}
                    </span>
                    <span className="text-slate-300 relative z-10">{bid.size}</span>
                    <span className="text-slate-500 relative z-10">{bid.total}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Level 2 Order Depth Asks */}
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              <div className="flex justify-between items-center text-[10px] text-rose-400 font-bold uppercase mb-1.5 pb-1 border-b border-slate-800">
                <span>Ask Price</span>
                <span>Size</span>
                <span>Total</span>
              </div>
              <div className="space-y-1">
                {quote.orderBook.asks.map((ask, idx) => (
                  <div key={idx} className="flex justify-between text-[11px] relative">
                    <div
                      className="absolute inset-y-0 right-0 bg-rose-500/10 rounded"
                      style={{ width: `${Math.min(100, (ask.size / 1500) * 100)}%` }}
                    ></div>
                    <span className="font-bold text-rose-400 relative z-10">
                      ${ask.price.toFixed(2)}
                    </span>
                    <span className="text-slate-300 relative z-10">{ask.size}</span>
                    <span className="text-slate-500 relative z-10">{ask.total}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Agent Live Ingestion Pipeline Status */}
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1 pb-1 border-b border-slate-800">
                <ShieldCheck className="w-3.5 h-3.5" />
                Multi-Agent Ingestion Pipeline
              </div>
              <div className="space-y-1.5 text-[11px] text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Equity Analyst:</span>
                  <span className="text-emerald-400">P/E {quote.peRatio}x Live</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Chief Risk Officer:</span>
                  <span className="text-rose-400">Spread ${(quote.ask - quote.bid).toFixed(2)} Monitored</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Macro Strategist:</span>
                  <span className="text-cyan-400">Liquidity Depth OK</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">CIO Strategy:</span>
                  <span className="text-amber-400">Real-Time Synthesis Ready</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
