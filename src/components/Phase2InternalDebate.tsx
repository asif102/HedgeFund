import React, { useState } from "react";
import { DebateTurn } from "../types";
import { ShieldAlert, TrendingUp, Cpu, Globe, Briefcase, MessageSquare, Play, Pause, RotateCcw, Swords } from "lucide-react";

interface Phase2InternalDebateProps {
  turns: DebateTurn[];
}

export const Phase2InternalDebate: React.FC<Phase2InternalDebateProps> = ({ turns }) => {
  const [activeTurnIndex, setActiveTurnIndex] = useState<number | null>(null);
  const [filterSpeaker, setFilterSpeaker] = useState<string>("all");

  const getSpeakerStyle = (role: string) => {
    const lower = role.toLowerCase();
    if (lower.includes("risk")) {
      return {
        badge: "bg-rose-500/20 text-rose-300 border-rose-500/40",
        border: "border-rose-500/40 bg-rose-950/20",
        icon: <ShieldAlert className="w-4 h-4 text-rose-400" />,
        avatarBg: "bg-rose-500/15 text-rose-400 border-rose-500/30",
      };
    }
    if (lower.includes("equity")) {
      return {
        badge: "bg-blue-500/20 text-blue-300 border-blue-500/40",
        border: "border-blue-500/40 bg-blue-950/20",
        icon: <TrendingUp className="w-4 h-4 text-blue-400" />,
        avatarBg: "bg-blue-500/15 text-blue-400 border-blue-500/30",
      };
    }
    if (lower.includes("technology") || lower.includes("cto")) {
      return {
        badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
        border: "border-cyan-500/40 bg-cyan-950/20",
        icon: <Cpu className="w-4 h-4 text-cyan-400" />,
        avatarBg: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
      };
    }
    if (lower.includes("macro")) {
      return {
        badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
        border: "border-emerald-500/40 bg-emerald-950/20",
        icon: <Globe className="w-4 h-4 text-emerald-400" />,
        avatarBg: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
      };
    }
    return {
      badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      border: "border-amber-500/40 bg-amber-950/20",
      icon: <Briefcase className="w-4 h-4 text-amber-400" />,
      avatarBg: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    };
  };

  const filteredTurns = filterSpeaker === "all"
    ? turns
    : turns.filter((t) => t.speaker.toLowerCase().includes(filterSpeaker.toLowerCase()) || t.role.toLowerCase().includes(filterSpeaker.toLowerCase()));

  return (
    <div className="space-y-6">
      {/* Header Explaining Phase 2 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-900/60 border border-slate-800 rounded-xl text-xs font-mono">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <Swords className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40">
                PHASE 2
              </span>
              <span className="font-semibold text-slate-100 text-sm">
                The Internal Debate & Risk Stress-Test
              </span>
            </div>
            <p className="text-slate-400 text-[11px] mt-0.5">
              The Chief Risk Officer (CRO) explicitly attacks the findings of the Equity Analyst & CTO; Macro Strategist contextualizes; CIO arbitrates.
            </p>
          </div>
        </div>

        {/* Filter by Speaker */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <span className="text-slate-500 text-[10px] uppercase">Filter:</span>
          <select
            value={filterSpeaker}
            onChange={(e) => setFilterSpeaker(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded px-2.5 py-1 font-mono focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Speakers ({turns.length})</option>
            <option value="CRO">CRO (Bear Challenger)</option>
            <option value="Equity">Equity Analyst</option>
            <option value="CTO">CTO (Tech Scout)</option>
            <option value="Macro">Macro Strategist</option>
            <option value="CIO">CIO (Decision Maker)</option>
          </select>
        </div>
      </div>

      {/* Transcript Timeline */}
      <div className="space-y-4 relative before:absolute before:inset-y-0 before:left-5 before:w-0.5 before:bg-slate-800 hidden sm:block">
        {filteredTurns.map((turn, idx) => {
          const style = getSpeakerStyle(turn.role);
          const isHighlighted = activeTurnIndex === idx;

          return (
            <div
              key={idx}
              id={`debate-turn-${idx}`}
              onClick={() => setActiveTurnIndex(isHighlighted ? null : idx)}
              className={`relative pl-12 transition-all cursor-pointer group`}
            >
              {/* Timeline Marker Dot */}
              <div
                className={`absolute left-3 top-4 w-4 h-4 rounded-full border-2 bg-slate-950 flex items-center justify-center -translate-x-1/2 transition ${
                  isHighlighted ? "border-amber-400 scale-125" : "border-slate-700 group-hover:border-slate-500"
                }`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 group-hover:bg-white"></div>
              </div>

              {/* Speech Card */}
              <div
                className={`rounded-xl border p-4.5 transition-all text-sm font-mono shadow-sm ${
                  isHighlighted
                    ? `${style.border} ring-1 ring-amber-500/40 shadow-lg`
                    : "bg-slate-900/70 hover:bg-slate-900 border-slate-800/90 hover:border-slate-700"
                }`}
              >
                {/* Header info */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-md border ${style.avatarBg}`}>
                      {style.icon}
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs sm:text-sm">{turn.speaker}</div>
                      <div className="text-[10px] text-slate-400">{turn.role}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      Target: <strong className="text-slate-200">{turn.targetAddressed}</strong>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded italic bg-slate-950/60 text-slate-400 border border-slate-800">
                      {turn.tone}
                    </span>
                  </div>
                </div>

                {/* Main Argument Body */}
                <p className="text-slate-200 leading-relaxed text-xs sm:text-sm font-sans mb-3.5">
                  "{turn.argument}"
                </p>

                {/* Hard Metric / Counter-Fact Callout */}
                <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800/80 flex items-start gap-2.5">
                  <div className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold shrink-0 mt-0.5">
                    EMPIRICAL METRIC
                  </div>
                  <p className="text-xs text-amber-200/90 font-mono leading-relaxed">
                    {turn.counterMetricOrFact}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile Stack View (when screen is very small) */}
      <div className="space-y-4 sm:hidden">
        {filteredTurns.map((turn, idx) => {
          const style = getSpeakerStyle(turn.role);
          return (
            <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs font-mono space-y-3">
              <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <div className={`p-1 rounded ${style.avatarBg}`}>{style.icon}</div>
                  <div>
                    <div className="font-bold text-white text-xs">{turn.speaker}</div>
                    <div className="text-[10px] text-slate-400">{turn.role}</div>
                  </div>
                </div>
                <div className="text-[9px] text-amber-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                  {turn.targetAddressed}
                </div>
              </div>

              <p className="text-slate-200 text-xs font-sans leading-relaxed">
                "{turn.argument}"
              </p>

              <div className="bg-slate-950 p-2.5 rounded border border-slate-800 text-[11px] text-amber-300">
                <strong>Data Point:</strong> {turn.counterMetricOrFact}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
