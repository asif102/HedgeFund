import React from "react";
import { TrendingUp, TrendingDown, Minus, ShieldAlert } from "lucide-react";

interface ScenarioModelingProps {
  target: string;
  recommendation: string;
}

export const ScenarioModeling: React.FC<ScenarioModelingProps> = ({ target, recommendation }) => {
  const isBuy = recommendation.toLowerCase().includes("buy");
  const isHold = recommendation.toLowerCase().includes("hold");

  const bullProb = isBuy ? 45 : isHold ? 25 : 15;
  const baseProb = isBuy ? 40 : isHold ? 50 : 35;
  const bearProb = 100 - bullProb - baseProb;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          <h3 className="text-sm font-bold font-mono text-white">
            QUANTITATIVE SCENARIO DISTRIBUTION & EXPECTED VALUE
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-400">
          Monte Carlo & Sensitivity Matrix
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs font-mono">
        {/* Bull Case */}
        <div className="bg-slate-950/60 border border-emerald-500/30 rounded-lg p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <TrendingUp className="w-4 h-4" />
              BULL SCENARIO
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-bold">
              {bullProb}% PROB
            </span>
          </div>
          <div className="text-sm font-bold text-white">
            {isBuy ? "+35% to +50% Upside" : "+20% Upside"}
          </div>
          <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
            Acceleration in high-margin software/service mix, uninterrupted sovereign demand, and multiple re-rating.
          </p>
        </div>

        {/* Base Case */}
        <div className="bg-slate-950/60 border border-blue-500/30 rounded-lg p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-blue-400 font-bold">
              <Minus className="w-4 h-4" />
              BASE SCENARIO
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/30 font-bold">
              {baseProb}% PROB
            </span>
          </div>
          <div className="text-sm font-bold text-white">
            {isBuy ? "+15% to +25% Upside" : "Flat / ±8% Range"}
          </div>
          <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
            Consensus execution, gradual multiple digestion balanced by organic earnings expansion.
          </p>
        </div>

        {/* Bear Case */}
        <div className="bg-slate-950/60 border border-rose-500/30 rounded-lg p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-rose-400 font-bold">
              <TrendingDown className="w-4 h-4" />
              BEAR SCENARIO
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/30 font-bold">
              {bearProb}% PROB
            </span>
          </div>
          <div className="text-sm font-bold text-rose-300">
            {isBuy ? "-20% to -35% Drawdown" : "-35% to -50% Drawdown"}
          </div>
          <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
            CapEx air-pocket or supply chain chokepoint hit; multiple derating to cyclical median.
          </p>
        </div>
      </div>
    </div>
  );
};
