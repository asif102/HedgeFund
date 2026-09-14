import React from "react";
import { SummarySnapshot } from "../types";
import { Award, Target, Shield, Gauge, Activity, Clock } from "lucide-react";

interface SummarySnapshotBarProps {
  target: string;
  category: string;
  snapshot: SummarySnapshot;
  livePrice?: number;
  liveChangePercent?: number;
}

export const SummarySnapshotBar: React.FC<SummarySnapshotBarProps> = ({
  target,
  category,
  snapshot,
  livePrice,
  liveChangePercent,
}) => {
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

  const getRiskBadge = (risk: string) => {
    const lower = risk.toLowerCase();
    if (lower.includes("extreme") || lower.includes("high")) {
      return "text-rose-400 bg-rose-500/10 border-rose-500/30";
    }
    if (lower.includes("elevated")) {
      return "text-amber-400 bg-amber-500/10 border-amber-500/30";
    }
    return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
  };

  return (
    <div className="bg-slate-900 border-b border-slate-800 px-4 py-3.5 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Target Info */}
        <div className="flex items-center gap-3">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              {category}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">
              {target}
            </h2>
          </div>
          <div
            className={`px-3 py-1 rounded-md border text-sm font-mono font-bold tracking-wider uppercase shadow-sm ${getRecommendationBadge(
              snapshot.recommendation
            )}`}
          >
            {snapshot.recommendation}
          </div>
          {livePrice !== undefined && (
            <div className="hidden sm:flex flex-col text-xs font-mono bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
              <span className="text-[9px] text-slate-500 uppercase">Live Tape</span>
              <span className="font-bold text-white">
                ${livePrice.toFixed(2)}{" "}
                {liveChangePercent !== undefined && (
                  <span
                    className={
                      liveChangePercent >= 0 ? "text-emerald-400" : "text-rose-400"
                    }
                  >
                    ({liveChangePercent >= 0 ? "+" : ""}
                    {liveChangePercent.toFixed(2)}%)
                  </span>
                )}
              </span>
            </div>
          )}
        </div>

        {/* Key Institutional Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-xs font-mono">
          {/* Target Horizon */}
          <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-lg">
            <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1 mb-0.5">
              <Clock className="w-3 h-3 text-slate-400" />
              Target Horizon
            </div>
            <div className="font-semibold text-slate-200 truncate">{snapshot.targetHorizon}</div>
          </div>

          {/* Target Price / Fair Value */}
          <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-lg">
            <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1 mb-0.5">
              <Target className="w-3 h-3 text-cyan-400" />
              Target / Valuation
            </div>
            <div className="font-semibold text-cyan-300 truncate">
              {snapshot.targetPriceOrFairValue}
            </div>
          </div>

          {/* Conviction Meter */}
          <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-lg">
            <div className="text-[10px] text-slate-500 uppercase flex items-center justify-between gap-1 mb-0.5">
              <span className="flex items-center gap-1">
                <Award className="w-3 h-3 text-amber-400" />
                Conviction
              </span>
              <span className="text-amber-400 font-bold">{snapshot.convictionScore}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, snapshot.convictionScore))}%` }}
              ></div>
            </div>
          </div>

          {/* Risk & Beta */}
          <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-lg">
            <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1 mb-0.5">
              <Shield className="w-3 h-3 text-rose-400" />
              Risk / Beta
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`px-1.5 py-0.2 rounded border text-[10px] ${getRiskBadge(snapshot.riskRating)}`}>
                {snapshot.riskRating}
              </span>
              {snapshot.volatilityBeta && (
                <span className="text-slate-400 text-[11px]">β {snapshot.volatilityBeta}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
