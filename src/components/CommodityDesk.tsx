import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Coins,
  Flame,
  ShieldCheck,
  TrendingUp,
  Zap,
} from "lucide-react";

type CommodityItem = {
  name: string;
  symbol: string;
  category: "Metals" | "Energy" | "Agriculture" | "Softs";
  price: number;
  change: number;
  changePct: number;
  range: string;
  volume: string;
  insight: string;
  status?: "live" | "fallback";
};

const baseCommodityData: CommodityItem[] = [
  {
    name: "Gold",
    symbol: "XAUUSD",
    category: "Metals",
    price: 2468.4,
    change: 18.6,
    changePct: 0.76,
    range: "$2,446 - $2,475",
    volume: "18.2k contracts",
    insight: "Gold remains supported by softer real yields and persistent central-bank demand, while resistance is clustering near the recent highs.",
  },
  {
    name: "Silver",
    symbol: "XAGUSD",
    category: "Metals",
    price: 29.23,
    change: 0.42,
    changePct: 1.46,
    range: "$28.60 - $29.70",
    volume: "11.4k contracts",
    insight: "Silver is outperforming gold on a relative basis as industrial demand and inflation hedging remain constructive.",
  },
  {
    name: "Crude Oil",
    symbol: "CLUSD",
    category: "Energy",
    price: 74.68,
    change: -0.91,
    changePct: -1.2,
    range: "$73.30 - $76.10",
    volume: "22.8k contracts",
    insight: "Oil is trading in a softer range as supply expectations normalize and demand growth remains uneven across regions.",
  },
  {
    name: "Natural Gas",
    symbol: "NGUSD",
    category: "Energy",
    price: 2.81,
    change: 0.07,
    changePct: 2.56,
    range: "$2.60 - $2.92",
    volume: "9.1k contracts",
    insight: "Weather-driven supply tightness continues to support gas prices, though volatility remains elevated as storage signals shift.",
  },
  {
    name: "Copper",
    symbol: "HGUSD",
    category: "Metals",
    price: 4.64,
    change: 0.08,
    changePct: 1.75,
    range: "$4.52 - $4.71",
    volume: "7.3k contracts",
    insight: "Copper remains constructive on infrastructure and electrification demand, with the market watching Chinese industrial signals closely.",
  },
  {
    name: "Wheat",
    symbol: "ZWUSD",
    category: "Agriculture",
    price: 607.5,
    change: -4.2,
    changePct: -0.69,
    range: "$600.20 - $617.40",
    volume: "5.6k contracts",
    insight: "Wheat is under mild pressure from improving crop conditions, but export and weather risks keep the risk premium in place.",
  },
];

const macroSummary = [
  "The commodity basket remains constructive on a risk-adjusted basis as gold, copper, and natural gas continue to lead the complex.",
  "Energy remains mixed: crude is softer on near-term demand concerns, but elevated geopolitical risk limits downside momentum.",
  "Metals continue to benefit from industrial and inflation-hedging themes, while agriculture is still sensitive to weather and freight disruption risk.",
];

const currencyFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const heatMapValues = [
  { label: "Gold", value: 90, tone: "bg-amber-400" },
  { label: "Silver", value: 72, tone: "bg-amber-300" },
  { label: "Copper", value: 80, tone: "bg-orange-400" },
  { label: "Crude", value: 58, tone: "bg-rose-500" },
  { label: "Nat Gas", value: 64, tone: "bg-yellow-400" },
  { label: "Wheat", value: 46, tone: "bg-emerald-400" },
  { label: "Cocoa", value: 41, tone: "bg-lime-400" },
  { label: "Coffee", value: 53, tone: "bg-amber-500" },
  { label: "Soybean", value: 50, tone: "bg-green-500" },
  { label: "Nickel", value: 68, tone: "bg-red-400" },
  { label: "Platinum", value: 75, tone: "bg-cyan-400" },
  { label: "Aluminum", value: 62, tone: "bg-sky-400" },
];

const chartSeries = {
  Gold: [58, 62, 60, 66, 68, 72, 74, 71, 78, 82, 84, 88],
  Crude: [72, 69, 70, 66, 64, 58, 57, 60, 57, 55, 52, 50],
  Copper: [64, 67, 69, 73, 76, 79, 81, 78, 82, 86, 88, 90],
};

const commoditySparklineMap: Record<string, number[]> = {
  Gold: [60, 62, 61, 66, 68, 70, 72, 74, 76, 79, 82, 84],
  Silver: [42, 44, 46, 47, 49, 52, 50, 53, 56, 58, 60, 63],
  "Crude Oil": [88, 86, 84, 82, 80, 79, 78, 76, 75, 74, 73, 72],
  "Natural Gas": [50, 52, 54, 56, 58, 60, 57, 59, 61, 63, 64, 66],
  Copper: [66, 67, 69, 70, 73, 76, 79, 81, 82, 83, 85, 88],
  Wheat: [74, 72, 71, 69, 68, 66, 65, 63, 61, 60, 59, 58],
};

function getChartPoints(values: number[], width: number, height: number) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - ((value - min) / range) * (height - 12) - 6;
      return `${x},${y}`;
    })
    .join(" ");
}

export const CommodityDesk: React.FC = () => {
  const [tick, setTick] = useState(0);
  const [selectedCommodity, setSelectedCommodity] = useState<string>("Gold");
  const [commodityData, setCommodityData] = useState<CommodityItem[]>(baseCommodityData);
  const [dataStatus, setDataStatus] = useState<"live" | "fallback">("fallback");

  useEffect(() => {
    const timer = window.setInterval(() => setTick((prev) => prev + 1), 1800);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadCommodityData = async () => {
      try {
        const res = await fetch("/api/commodities", { cache: "no-store" });
        if (!res.ok) {
          throw new Error("Commodity API request failed");
        }

        const payload = await res.json();
        if (!mounted || !Array.isArray(payload.items)) {
          return;
        }

        const liveItems = payload.items as CommodityItem[];
        setCommodityData(liveItems);
        setDataStatus(liveItems.some((item) => item.status === "live") ? "live" : "fallback");
      } catch {
        if (mounted) {
          setCommodityData(baseCommodityData);
          setDataStatus("fallback");
        }
      }
    };

    void loadCommodityData();

    return () => {
      mounted = false;
    };
  }, []);

  const liveData = useMemo(() => {
    return commodityData.map((item, index) => {
      const wave = Math.sin((tick + index) / 2.2) * (item.name === "Crude Oil" ? 0.9 : item.name === "Wheat" ? 0.7 : 0.5);
      const price = item.price + wave * (item.name.includes("Gold") ? 6 : item.name.includes("Crude") ? 1.5 : 0.7);
      const changePct = item.changePct + wave * 0.18;
      const change = item.change + wave * (item.name.includes("Gold") ? 0.9 : 0.5);

      return {
        ...item,
        price: Number(price.toFixed(item.price > 10 ? 2 : 3)),
        change: Number(change.toFixed(2)),
        changePct: Number(changePct.toFixed(2)),
      };
    });
  }, [commodityData, tick]);

  const gainers = liveData.filter((item) => item.changePct >= 0).length;
  const losers = liveData.filter((item) => item.changePct < 0).length;
  const dominantTicker = liveData.reduce((best, item) =>
    Math.abs(item.changePct) > Math.abs(best.changePct) ? item : best
  );

  const chartWidth = 620;
  const chartHeight = 220;
  const selectedSeries = chartSeries[selectedCommodity as keyof typeof chartSeries] ?? chartSeries.Gold;
  const selectedPoints = getChartPoints(selectedSeries, chartWidth, chartHeight);
  const goldPoints = getChartPoints(chartSeries.Gold, chartWidth, chartHeight);
  const crudePoints = getChartPoints(chartSeries.Crude, chartWidth, chartHeight);
  const copperPoints = getChartPoints(chartSeries.Copper, chartWidth, chartHeight);

  return (
    <div className="w-screen max-w-full min-h-screen box-border m-0 p-4 overflow-x-hidden bg-slate-950 text-white">
      <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/30 via-slate-950 to-slate-900 p-5 shadow-lg shadow-amber-500/10 transition-all duration-300">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-amber-300 text-xs font-mono uppercase tracking-[0.2em]">
              <Coins className="w-4 h-4" />
              Commodity Desk
            </div>
            <h2 className="mt-2 text-2xl font-bold text-white">How commodities are trading</h2>
            <div className="mt-2 flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="inline-flex items-center gap-1.5 text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50" />
                {dataStatus === "live" ? "Live pricing" : "Fallback pricing"}
              </span>
              <span>Updated {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:min-w-[280px]">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 transition-all duration-300 hover:border-emerald-500/60 hover:bg-emerald-500/15 hover:shadow-lg hover:shadow-emerald-500/20">
              <div className="text-[10px] uppercase tracking-[0.2em] text-emerald-300 font-mono">Advancers</div>
              <div className="mt-2 text-2xl font-bold text-emerald-300 transition-transform duration-300">{gainers}</div>
            </div>
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 transition-all duration-300 hover:border-rose-500/60 hover:bg-rose-500/15 hover:shadow-lg hover:shadow-rose-500/20">
              <div className="text-[10px] uppercase tracking-[0.2em] text-rose-300 font-mono">Decliners</div>
              <div className="mt-2 text-2xl font-bold text-rose-300 transition-transform duration-300">{losers}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.5fr_0.75fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg shadow-slate-950/20 transition-all duration-300">
          <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-cyan-300 font-mono">Price action</div>
              <div className="mt-1 text-xl font-bold text-white">Macro curve</div>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
              <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-amber-400" /> Gold</span>
              <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-rose-400" /> Oil</span>
              <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-cyan-400" /> Copper</span>
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border border-slate-800 bg-slate-950/80 p-3 transition-all duration-300 hover:border-slate-700 hover:shadow-lg hover:shadow-slate-950/30">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-56 w-full transition-opacity duration-500">
              {[0, 1, 2, 3].map((line) => (
                <line
                  key={line}
                  x1="0"
                  x2={chartWidth}
                  y1={22 + line * 52}
                  y2={22 + line * 52}
                  stroke="rgba(148, 163, 184, 0.2)"
                  strokeDasharray="4 6"
                />
              ))}

              <polyline
                fill="none"
                stroke={selectedCommodity === "Gold" ? "#fbbf24" : "#fbbf24"}
                strokeWidth={selectedCommodity === "Gold" ? 4 : 2.2}
                points={selectedCommodity === "Gold" ? selectedPoints : goldPoints}
                strokeLinejoin="round"
                strokeLinecap="round"
                opacity={selectedCommodity === "Gold" ? 1 : 0.4}
                style={{ transition: "stroke-width 300ms ease-out, opacity 300ms ease-out" }}
              />
              <polyline
                fill="none"
                stroke="#f87171"
                strokeWidth={selectedCommodity === "Crude" ? 4 : 2.2}
                points={selectedCommodity === "Crude" ? selectedPoints : crudePoints}
                strokeLinejoin="round"
                strokeLinecap="round"
                opacity={selectedCommodity === "Crude" ? 1 : 0.4}
                style={{ transition: "stroke-width 300ms ease-out, opacity 300ms ease-out" }}
              />
              <polyline
                fill="none"
                stroke="#22d3ee"
                strokeWidth={selectedCommodity === "Copper" ? 4 : 2.2}
                points={selectedCommodity === "Copper" ? selectedPoints : copperPoints}
                strokeLinejoin="round"
                strokeLinecap="round"
                opacity={selectedCommodity === "Copper" ? 1 : 0.4}
                style={{ transition: "stroke-width 300ms ease-out, opacity 300ms ease-out" }}
              />
            </svg>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {liveData.slice(0, 3).map((item) => {
              const isPositive = item.changePct >= 0;
              const borderClass =
                item.name === "Gold"
                  ? "border-amber-500/25 bg-amber-500/10"
                  : item.name === "Crude Oil"
                    ? "border-rose-500/25 bg-rose-500/10"
                    : "border-cyan-500/25 bg-cyan-500/10";
              const textClass =
                item.name === "Gold"
                  ? "text-amber-300"
                  : item.name === "Crude Oil"
                    ? "text-rose-300"
                    : "text-cyan-300";
              return (
                <div key={item.symbol} className={`rounded-xl border p-3 transition-all duration-300 hover:scale-105 cursor-pointer ${borderClass} hover:shadow-lg hover:shadow-amber-500/20`}>
                  <div className={`text-[10px] uppercase tracking-[0.18em] font-mono ${textClass} transition-colors duration-300`}>
                    {item.name === "Crude Oil" ? "Crude" : item.name}
                  </div>
                  <div className="mt-2 text-xl font-bold text-white transition-all duration-300">${item.price.toFixed(2)}</div>
                  <div className={`mt-1 text-xs font-mono transition-colors duration-300 ${isPositive ? "text-emerald-300" : "text-rose-300"}`}>
                    {isPositive ? "+" : ""}{item.changePct.toFixed(2)}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg shadow-slate-950/20 transition-all duration-300">
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-amber-300 font-mono">Heat map</div>
              <div className="mt-1 text-xl font-bold text-white">Relative strength</div>
            </div>
            <Zap className="w-4 h-4 text-amber-300" />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {heatMapValues.map((item) => {
              const isSelected = selectedCommodity === item.label || selectedCommodity === "Crude" && item.label === "Crude" || selectedCommodity === "Nat Gas" && item.label === "Nat Gas";
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setSelectedCommodity(item.label === "Nat Gas" ? "Nat Gas" : item.label === "Crude" ? "Crude" : item.label)}
                  className={`rounded-lg border p-2 text-left transition-all duration-300 hover:scale-105 ${
                    isSelected ? "border-amber-400 bg-amber-400/10 shadow-md shadow-amber-500/20" : "border-slate-700 bg-slate-950/70 hover:border-slate-600 hover:bg-slate-900/80"
                  }`}
                >
                  <div className={`h-10 rounded-md transition-all duration-300 ${item.tone}`} style={{ opacity: 0.25 + item.value / 100 }} />
                  <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-slate-300 transition-colors duration-300">
                    <span>{item.label}</span>
                    <span>{item.value}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg shadow-slate-950/20">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-mono">Live tape</div>
            <div className="mt-1 text-lg font-bold text-white">Real-time pricing</div>
          </div>
          <div className="text-sm text-slate-300 font-mono">
            Leading move: <span className="text-amber-300">{dominantTicker.name}</span>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {liveData.map((item) => {
            const isPositive = item.changePct >= 0;
            const sparklineData = commoditySparklineMap[item.name] ?? [50, 51, 52, 53, 52, 54, 55, 56, 57, 58, 59, 60];
            const sparkWidth = 150;
            const sparkHeight = 40;
            const min = Math.min(...sparklineData);
            const max = Math.max(...sparklineData);
            const range = max - min || 1;
            const points = sparklineData
              .map((value, index) => {
                const x = (index / (sparklineData.length - 1)) * sparkWidth;
                const y = sparkHeight - ((value - min) / range) * (sparkHeight - 8) - 4;
                return `${x},${y}`;
              })
              .join(" ");

            return (
              <button
                key={item.symbol}
                type="button"
                onClick={() => setSelectedCommodity(item.name === "Crude Oil" ? "Crude" : item.name === "Natural Gas" ? "Nat Gas" : item.name)}
                className={`rounded-2xl border p-4 text-left transition-all duration-300 hover:scale-105 cursor-pointer ${
                  selectedCommodity === item.name ? "border-amber-400 bg-amber-400/10 shadow-lg shadow-amber-500/30" : "border-slate-800 bg-slate-950/70 hover:border-slate-600 hover:bg-slate-900/50"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400 font-mono">{item.category}</div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-lg font-semibold text-white">{item.name}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{item.symbol}</span>
                    </div>
                  </div>

                  <div
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-mono font-bold ${
                      isPositive
                        ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                        : "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                    }`}
                  >
                    {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {Math.abs(item.changePct).toFixed(2)}%
                  </div>
                </div>

                <div className="mt-5 flex items-end justify-between">
                  <div className="text-3xl font-bold text-white">
                    ${currencyFormatter.format(item.price)}
                  </div>
                  <div className={`text-sm font-mono ${isPositive ? "text-emerald-300" : "text-rose-300"}`}>
                    {isPositive ? "+" : "-"}${Math.abs(item.change).toFixed(2)}
                  </div>
                </div>

                <div className="mt-3 rounded-lg border border-slate-800 bg-slate-900/80 p-2">
                  <svg viewBox={`0 0 ${sparkWidth} ${sparkHeight}`} className="h-10 w-full">
                    <polyline
                      points={points}
                      fill="none"
                      stroke={isPositive ? "#34d399" : "#f87171"}
                      strokeWidth="2.5"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-slate-400 font-mono">
                  <div className="rounded-lg bg-slate-800/80 p-2">
                    <div className="text-slate-500">Range</div>
                    <div className="mt-1 text-slate-200">{item.range}</div>
                  </div>
                  <div className="rounded-lg bg-slate-800/80 p-2">
                    <div className="text-slate-500">Volume</div>
                    <div className="mt-1 text-slate-200">{item.volume}</div>
                  </div>
                </div>

                <div className="mt-4 text-sm leading-6 text-slate-300">{item.insight}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.18em] text-cyan-300">
            <BarChart3 className="w-4 h-4" />
            Macro insight
          </div>

          <div className="mt-4 space-y-3">
            {macroSummary.map((line) => (
              <div key={line} className="flex gap-3 rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                <div className="mt-1 text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <p className="text-sm leading-6 text-slate-300">{line}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.18em] text-amber-300">
            <ShieldCheck className="w-4 h-4" />
            Risk view
          </div>

          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-amber-200">
                <Flame className="w-4 h-4" />
                Inflation sensitivity
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Gold and copper remain favored as inflation hedges, while energy remains sensitive to geopolitical headlines.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-400 font-mono">Signal</div>
              <div className="mt-2 text-xl font-bold text-white">Constructive but selective</div>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                The strongest risk-adjusted setups are in metals and selective energy exposure, with broad commodity leadership dependent on macro policy clarity.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
