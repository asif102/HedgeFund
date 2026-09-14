import React, { useState } from "react";
import { FinancialNewsItem, AgentId } from "../types";
import {
  Newspaper,
  TrendingUp,
  AlertTriangle,
  Flame,
  Globe,
  Briefcase,
  Cpu,
  ShieldAlert,
  Clock,
  Filter,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface LiveFinancialNewsFeedProps {
  news: FinancialNewsItem[];
  symbol: string;
  onRefreshNews: () => void;
  isRefreshing: boolean;
  onClose?: () => void;
}

export const LiveFinancialNewsFeed: React.FC<LiveFinancialNewsFeedProps> = ({
  news,
  symbol,
  onRefreshNews,
  isRefreshing,
  onClose,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedSentiment, setSelectedSentiment] = useState<string>("All");
  const [expandedArticles, setExpandedArticles] = useState<Record<string, boolean>>({
    [news[0]?.id || ""]: true, // expand first by default
  });

  const toggleExpand = (id: string) => {
    setExpandedArticles((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredNews = news.filter((item) => {
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    const matchesSentiment =
      selectedSentiment === "All" || item.sentiment === selectedSentiment;
    return matchesCategory && matchesSentiment;
  });

  const getAgentBadge = (agentId: AgentId) => {
    switch (agentId) {
      case "cio":
        return {
          name: "CIO Vance",
          icon: <Briefcase className="w-3 h-3 text-amber-400" />,
          color: "border-amber-500/30 text-amber-400 bg-amber-500/10",
        };
      case "equityAnalyst":
        return {
          name: "Equity Rostova",
          icon: <TrendingUp className="w-3 h-3 text-blue-400" />,
          color: "border-blue-500/30 text-blue-400 bg-blue-500/10",
        };
      case "cto":
        return {
          name: "CTO Thorne",
          icon: <Cpu className="w-3 h-3 text-cyan-400" />,
          color: "border-cyan-500/30 text-cyan-400 bg-cyan-500/10",
        };
      case "macroStrategist":
        return {
          name: "Macro Lindqvist",
          icon: <Globe className="w-3 h-3 text-emerald-400" />,
          color: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
        };
      case "cro":
        return {
          name: "CRO Stern",
          icon: <ShieldAlert className="w-3 h-3 text-rose-400" />,
          color: "border-rose-500/30 text-rose-400 bg-rose-500/10",
        };
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Newspaper className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Real-Time Institutional Financial News Wire
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-semibold">
                ACTIVE FEED ({symbol})
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Live intelligence pipeline with immediate multi-agent sentiment impact scoring
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefreshNews}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-medium transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-amber-400" : ""}`} />
            <span>Poll Wire</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-mono transition"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-3 border-b border-slate-800/60 text-xs">
        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-slate-500 flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" /> Category:
          </span>
          {["All", "Technology", "Earnings", "Macro", "Regulatory", "Analyst Rating"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-md transition font-mono ${
                selectedCategory === cat
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sentiment Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500">Sentiment:</span>
          {["All", "bullish", "bearish", "neutral"].map((s) => (
            <button
              key={s}
              onClick={() => setSelectedSentiment(s)}
              className={`px-2 py-0.5 rounded capitalize font-mono text-[11px] ${
                selectedSentiment === s
                  ? s === "bullish"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : s === "bearish"
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                    : "bg-slate-700 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* News Article Stream */}
      <div className="divide-y divide-slate-800/80 mt-2 space-y-2">
        {filteredNews.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            No news items matching selected filters.
          </div>
        ) : (
          filteredNews.map((item) => {
            const isExpanded = Boolean(expandedArticles[item.id]);
            return (
              <div
                key={item.id}
                className="pt-3 pb-3 hover:bg-slate-800/20 px-2 rounded-lg transition"
              >
                {/* News Card Header */}
                <div
                  className="cursor-pointer"
                  onClick={() => toggleExpand(item.id)}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 text-[11px] font-mono">
                      <span className="font-semibold text-slate-300">
                        {item.source}
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.timestamp}
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                        {item.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                          item.sentiment === "bullish"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                            : item.sentiment === "bearish"
                            ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                            : "bg-slate-800 text-slate-300 border border-slate-700"
                        }`}
                      >
                        {item.sentiment}
                      </span>
                      <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                        Impact: {item.impactScore}/10
                      </span>
                      <div className="text-slate-500">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  </div>

                  <h3 className="text-sm sm:text-base font-semibold text-white hover:text-amber-400 transition">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {item.summary}
                  </p>
                </div>

                {/* Multi-Agent Reactions (Expanded) */}
                {isExpanded && (
                  <div className="mt-3.5 pt-3 border-t border-slate-800/80 bg-slate-950/60 p-3.5 rounded-lg">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2.5 font-mono">
                      <Briefcase className="w-3.5 h-3.5" />
                      Agentic Committee Live Reactions & Ingestion Takes:
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {item.agentReactions.map((reaction, rIdx) => {
                        const badge = getAgentBadge(reaction.agentId);
                        return (
                          <div
                            key={rIdx}
                            className="p-2.5 rounded border border-slate-800/90 bg-slate-900/80 text-xs"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span
                                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${badge.color}`}
                              >
                                {badge.icon}
                                {reaction.agentName}
                              </span>
                              <span
                                className={`text-[10px] font-mono font-semibold uppercase ${
                                  reaction.impact === "positive"
                                    ? "text-emerald-400"
                                    : reaction.impact === "negative"
                                    ? "text-rose-400"
                                    : "text-slate-400"
                                }`}
                              >
                                [{reaction.impact}]
                              </span>
                            </div>
                            <p className="text-slate-300 italic text-[11px] leading-relaxed">
                              "{reaction.take}"
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
