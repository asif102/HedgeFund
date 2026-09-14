import { MarketQuote, FinancialNewsItem, OrderBook, IntradayTick } from "../types";

// Base institutional reference data for known targets
const BASE_TICKER_DATA: Record<
  string,
  {
    symbol: string;
    companyName: string;
    basePrice: number;
    baseVolume: number;
    avgVolume: number;
    marketCap: string;
    peRatio: number;
    week52High: number;
    week52Low: number;
  }
> = {
  NVDA: {
    symbol: "NVDA",
    companyName: "NVIDIA Corporation",
    basePrice: 128.84,
    baseVolume: 51240000,
    avgVolume: 46800000,
    marketCap: "$3.16T",
    peRatio: 54.2,
    week52High: 140.76,
    week52Low: 75.6,
  },
  ASML: {
    symbol: "ASML",
    companyName: "ASML Holding N.V.",
    basePrice: 742.15,
    baseVolume: 1840000,
    avgVolume: 2150000,
    marketCap: "$298.4B",
    peRatio: 38.6,
    week52High: 1110.09,
    week52Low: 654.2,
  },
  TSLA: {
    symbol: "TSLA",
    companyName: "Tesla, Inc.",
    basePrice: 246.38,
    baseVolume: 64200000,
    avgVolume: 71500000,
    marketCap: "$786.5B",
    peRatio: 68.4,
    week52High: 271.0,
    week52Low: 138.8,
  },
  PLTR: {
    symbol: "PLTR",
    companyName: "Palantir Technologies Inc.",
    basePrice: 34.82,
    baseVolume: 48900000,
    avgVolume: 53200000,
    marketCap: "$78.2B",
    peRatio: 92.5,
    week52High: 38.9,
    week52Low: 14.48,
  },
  MSFT: {
    symbol: "MSFT",
    companyName: "Microsoft Corporation",
    basePrice: 428.1,
    baseVolume: 19800000,
    avgVolume: 21400000,
    marketCap: "$3.18T",
    peRatio: 34.1,
    week52High: 468.35,
    week52Low: 309.45,
  },
  AAPL: {
    symbol: "AAPL",
    companyName: "Apple Inc.",
    basePrice: 226.4,
    baseVolume: 42300000,
    avgVolume: 48100000,
    marketCap: "$3.45T",
    peRatio: 33.8,
    week52High: 237.23,
    week52Low: 164.08,
  },
  AMD: {
    symbol: "AMD",
    companyName: "Advanced Micro Devices, Inc.",
    basePrice: 142.6,
    baseVolume: 38500000,
    avgVolume: 42100000,
    marketCap: "$230.8B",
    peRatio: 110.4,
    week52High: 227.3,
    week52Low: 94.04,
  },
};

// Generate deterministic or stochastic price tick stream
function generateIntradayTicks(currentPrice: number): IntradayTick[] {
  const ticks: IntradayTick[] = [];
  let price = currentPrice * 0.985;
  const hours = [
    "09:30", "09:45", "10:00", "10:15", "10:30", "10:45",
    "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
    "14:00", "14:30", "15:00", "15:30", "15:45", "16:00"
  ];

  hours.forEach((time, index) => {
    // Progress towards current price with market volatility
    const progress = (index + 1) / hours.length;
    const noise = (Math.sin(index * 1.3) * 0.008 + (Math.random() - 0.5) * 0.006);
    price = currentPrice * (0.985 + progress * 0.015 + noise);
    ticks.push({
      time,
      price: parseFloat(price.toFixed(2)),
      volume: Math.floor(150000 + Math.random() * 450000),
    });
  });

  // Ensure last tick matches current price
  ticks[ticks.length - 1].price = parseFloat(currentPrice.toFixed(2));
  return ticks;
}

// Generate realistic Order Book with Bid/Ask ladder
function generateOrderBook(midPrice: number): OrderBook {
  const spread = parseFloat((midPrice * 0.0003 + 0.01).toFixed(2));
  const bestBid = parseFloat((midPrice - spread / 2).toFixed(2));
  const bestAsk = parseFloat((midPrice + spread / 2).toFixed(2));

  const bids = [];
  const asks = [];
  let runningBidTotal = 0;
  let runningAskTotal = 0;

  for (let i = 0; i < 5; i++) {
    const bidP = parseFloat((bestBid - i * (spread * 1.2)).toFixed(2));
    const bidS = Math.floor(200 + Math.random() * 1200 * (5 - i * 0.6));
    runningBidTotal += bidS;
    bids.push({ price: bidP, size: bidS, total: runningBidTotal });

    const askP = parseFloat((bestAsk + i * (spread * 1.2)).toFixed(2));
    const askS = Math.floor(200 + Math.random() * 1200 * (5 - i * 0.6));
    runningAskTotal += askS;
    asks.push({ price: askP, size: askS, total: runningAskTotal });
  }

  return { bids, asks, spread };
}

// In-memory quote state cache to simulate smooth ticking
const liveQuoteCache: Map<string, MarketQuote> = new Map();

export function getLiveMarketQuote(targetQuery: string): MarketQuote {
  const cleanSymbol = targetQuery.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 5) || "NVDA";
  const matchedBase = BASE_TICKER_DATA[cleanSymbol] || {
    symbol: cleanSymbol || "TGT",
    companyName: targetQuery,
    basePrice: 154.2,
    baseVolume: 12400000,
    avgVolume: 14200000,
    marketCap: "$84.5B",
    peRatio: 32.4,
    week52High: 185.0,
    week52Low: 98.4,
  };

  const existing = liveQuoteCache.get(cleanSymbol);
  const now = new Date();

  // Subtle tick fluctuation (-0.2% to +0.2%)
  const tickDeltaPct = (Math.random() - 0.48) * 0.004;
  const currentPrice = existing
    ? parseFloat(Math.max(1, existing.price * (1 + tickDeltaPct)).toFixed(2))
    : matchedBase.basePrice;

  const previousClose = matchedBase.basePrice * 0.988;
  const change = parseFloat((currentPrice - previousClose).toFixed(2));
  const changePercent = parseFloat(((change / previousClose) * 100).toFixed(2));
  const open = parseFloat((previousClose * 1.004).toFixed(2));
  const high = parseFloat(Math.max(currentPrice * 1.012, open * 1.008).toFixed(2));
  const low = parseFloat(Math.min(currentPrice * 0.988, open * 0.992).toFixed(2));
  const volume = (existing ? existing.volume : matchedBase.baseVolume) + Math.floor(Math.random() * 8500);
  const vwap = parseFloat(((high + low + currentPrice * 2) / 4).toFixed(2));
  const orderBook = generateOrderBook(currentPrice);

  const quote: MarketQuote = {
    symbol: matchedBase.symbol,
    companyName: matchedBase.companyName,
    price: currentPrice,
    change,
    changePercent,
    open,
    high,
    low,
    previousClose: parseFloat(previousClose.toFixed(2)),
    volume,
    avgVolume: matchedBase.avgVolume,
    marketCap: matchedBase.marketCap,
    peRatio: matchedBase.peRatio,
    vwap,
    bid: orderBook.bids[0].price,
    ask: orderBook.asks[0].price,
    bidSize: orderBook.bids[0].size,
    askSize: orderBook.asks[0].size,
    week52High: matchedBase.week52High,
    week52Low: matchedBase.week52Low,
    marketStatus: "REGULAR",
    timestamp: now.toLocaleTimeString(),
    orderBook,
    intradayTicks: existing?.intradayTicks?.length ? existing.intradayTicks : generateIntradayTicks(currentPrice),
  };

  // Append latest tick
  if (quote.intradayTicks.length > 0) {
    quote.intradayTicks[quote.intradayTicks.length - 1].price = currentPrice;
  }

  liveQuoteCache.set(cleanSymbol, quote);
  return quote;
}

// Financial News Wire with Dedicated Multi-Agent Interpretations
export function getFinancialNewsFeed(targetQuery: string): FinancialNewsItem[] {
  const cleanSymbol = targetQuery.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 5) || "NVDA";

  const newsDatabase: Record<string, FinancialNewsItem[]> = {
    NVDA: [
      {
        id: "news-nvda-1",
        title: "NVIDIA Next-Gen Rubin Architecture Taped Out Ahead of Schedule",
        source: "Bloomberg Technology",
        timestamp: "12 mins ago",
        relativeTime: "12m ago",
        summary: "Supply chain audits from TSMC CoWoS packaging facilities indicate high-bandwidth memory (HBM4) integration for NVIDIA's Rubin platform is progressing faster than consensus estimates.",
        category: "Technology",
        sentiment: "bullish",
        impactScore: 9,
        relatedTicker: "NVDA",
        affectedAgents: ["cto", "equityAnalyst", "cio"],
        agentReactions: [
          {
            agentId: "cto",
            agentName: "Dr. Aris Thorne",
            role: "Chief Technology Officer",
            take: "HBM4 3D stacking removes memory wall bottlenecks. Reinforces architectural moat through at least 2027.",
            impact: "positive",
          },
          {
            agentId: "equityAnalyst",
            agentName: "Elena Rostova, CFA",
            role: "Lead Equity Analyst",
            take: "Maintains >75% gross margin envelope. Dampens fears of ASP erosion as hyperscalers attempt custom ASICs.",
            impact: "positive",
          },
          {
            agentId: "cro",
            agentName: "Rachel Stern, FRM",
            role: "Chief Risk Officer",
            take: "Extreme concentration in TSMC Fab 18 and packaging chokepoint remains unhedged tail-risk.",
            impact: "negative",
          },
        ],
      },
      {
        id: "news-nvda-2",
        title: "Federal Reserve Holds Benchmark Rates Steady; Signals Data-Dependent Liquidity",
        source: "Wall Street Journal",
        timestamp: "42 mins ago",
        relativeTime: "42m ago",
        summary: "FOMC statement highlights persistent services inflation, tempering expectations for aggressive rate cuts. Mega-cap tech duration multiples face discount rate headwinds.",
        category: "Macro",
        sentiment: "neutral",
        impactScore: 7,
        relatedTicker: "NVDA",
        affectedAgents: ["macroStrategist", "cro", "cio"],
        agentReactions: [
          {
            agentId: "macroStrategist",
            agentName: "Henrik Lindqvist",
            role: "Global Macro Strategist",
            take: "10-year Treasury yield sticky near 4.15%. Growth multiples will rely on pure earnings delivery, not multiple expansion.",
            impact: "neutral",
          },
          {
            agentId: "cro",
            agentName: "Rachel Stern, FRM",
            role: "Chief Risk Officer",
            take: "Watch systematic volatility targeting funds (CTAs); any bond yield spike can trigger algorithmic equity de-leveraging.",
            impact: "negative",
          },
        ],
      },
      {
        id: "news-nvda-3",
        title: "Tier-1 Cloud Provider Capex Projections Revised Upward to $210B Aggregate",
        source: "Financial Times",
        timestamp: "1 hour ago",
        relativeTime: "1h ago",
        summary: "Big Tech quarterly filings show collective AI data center buildouts increased 18% quarter-over-quarter, led by accelerated cluster deployments.",
        category: "Earnings",
        sentiment: "bullish",
        impactScore: 8,
        relatedTicker: "NVDA",
        affectedAgents: ["equityAnalyst", "cio"],
        agentReactions: [
          {
            agentId: "cio",
            agentName: "Dr. Marcus Vance",
            role: "Chief Investment Officer",
            take: "Validates our thesis: enterprise AI spending is in mandatory arms-race mode. Reaffirming Overweight recommendation.",
            impact: "positive",
          },
          {
            agentId: "equityAnalyst",
            agentName: "Elena Rostova, CFA",
            role: "Lead Equity Analyst",
            take: "Raises FY26 revenue run-rate floor. Downward revisions to forward guidance are highly improbable over next 2 quarters.",
            impact: "positive",
          },
        ],
      },
      {
        id: "news-nvda-4",
        title: "Department of Commerce Evaluates Tightened Thresholds on Middle East GPU Shipments",
        source: "Reuters",
        timestamp: "2 hours ago",
        relativeTime: "2h ago",
        summary: "Bureau of Industry and Security considering lower compute-density caps for high-performance accelerator licenses across Gulf sovereign funds.",
        category: "Regulatory",
        sentiment: "bearish",
        impactScore: 6,
        relatedTicker: "NVDA",
        affectedAgents: ["cro", "macroStrategist"],
        agentReactions: [
          {
            agentId: "cro",
            agentName: "Rachel Stern, FRM",
            role: "Chief Risk Officer",
            take: "Sovereign AI demand was modeled as our secondary buffer. Recommend a 5% downside put collar overlay.",
            impact: "negative",
          },
          {
            agentId: "macroStrategist",
            agentName: "Henrik Lindqvist",
            role: "Global Macro Strategist",
            take: "Geopolitical friction is structural. Expect rerouting friction and delayed enterprise installations.",
            impact: "negative",
          },
        ],
      },
    ],
    MSFT: [
      {
        id: "news-msft-1",
        title: "Azure Cloud Revenue Acceleration Driven by Enterprise GenAI Workloads",
        source: "Bloomberg Markets",
        timestamp: "14 mins ago",
        relativeTime: "14m ago",
        summary: "Microsoft reported Azure growth of 33% constant currency, with AI services contributing 11 percentage points of sequential expansion. Commercial RPO backlog reached $259 Billion.",
        category: "Earnings",
        sentiment: "bullish",
        impactScore: 9,
        relatedTicker: "MSFT",
        affectedAgents: ["equityAnalyst", "cio", "cto"],
        agentReactions: [
          {
            agentId: "equityAnalyst",
            agentName: "Elena Rostova, CFA",
            role: "Lead Equity Analyst",
            take: "RPO backlog of $259B demonstrates unprecedented revenue visibility. Cloud gross margins holding steady above 71%.",
            impact: "positive",
          },
          {
            agentId: "cio",
            agentName: "Dr. Marcus Vance",
            role: "Chief Investment Officer",
            take: "Strong confirmation of our thesis: Microsoft remains the preeminent enterprise AI monetization vehicle. Reiterate Buy.",
            impact: "positive",
          },
          {
            agentId: "cro",
            agentName: "Rachel Stern, FRM",
            role: "Chief Risk Officer",
            take: "Quarterly CapEx run-rate of $19B must be monitored for return on capital inflection in upcoming fiscal year.",
            impact: "neutral",
          },
        ],
      },
      {
        id: "news-msft-2",
        title: "Microsoft Announces General Availability of Custom Maia 100 AI Accelerators in Azure Datacenters",
        source: "TechCrunch Enterprise",
        timestamp: "38 mins ago",
        relativeTime: "38m ago",
        summary: "First production clusters powered by in-house Maia 100 silicon and Cobalt 100 CPUs are now operational for internal Microsoft Copilot inferencing workloads.",
        category: "Technology",
        sentiment: "bullish",
        impactScore: 8,
        relatedTicker: "MSFT",
        affectedAgents: ["cto", "cro"],
        agentReactions: [
          {
            agentId: "cto",
            agentName: "Dr. Aris Thorne",
            role: "Chief Technology Officer",
            take: "In-house silicon rollout begins relieving GPU margin pressure and reduces single-vendor reliance on merchant silicon over 24-36 months.",
            impact: "positive",
          },
          {
            agentId: "cro",
            agentName: "Rachel Stern, FRM",
            role: "Chief Risk Officer",
            take: "Silicon diversification provides long-term operational resilience, though software stack optimization will take another 2 quarters to mature.",
            impact: "positive",
          },
        ],
      },
      {
        id: "news-msft-3",
        title: "European Commission Closes Cloud Licensing Inquiry Following Microsoft Interoperability Commitments",
        source: "Financial Times",
        timestamp: "1 hour ago",
        relativeTime: "1h ago",
        summary: "EU antitrust regulators have concluded preliminary market testing of Microsoft's revised licensing terms for rival European cloud providers without issuing formal statement of objections.",
        category: "Regulatory",
        sentiment: "bullish",
        impactScore: 7,
        relatedTicker: "MSFT",
        affectedAgents: ["macroStrategist", "cro"],
        agentReactions: [
          {
            agentId: "macroStrategist",
            agentName: "Henrik Lindqvist",
            role: "Global Macro Strategist",
            take: "Significant regulatory overhang lifted in Europe. Sovereign cloud contracts in Germany, France, and UK can proceed unimpeded.",
            impact: "positive",
          },
          {
            agentId: "cro",
            agentName: "Rachel Stern, FRM",
            role: "Chief Risk Officer",
            take: "Clears antitrust tail-risk in the EU, reducing potential legal fines and forced unbundling scenarios.",
            impact: "positive",
          },
        ],
      },
    ],
  };

  if (newsDatabase[cleanSymbol]) {
    return newsDatabase[cleanSymbol];
  }

  // Dynamically constructed news feed for any other ticker or query
  return [
    {
      id: `news-${cleanSymbol}-1`,
      title: `${targetQuery} Institutional Trading Volume Surges 45% Above 30-Day Median`,
      source: "Quantum Alpha Data Terminal",
      timestamp: "8 mins ago",
      relativeTime: "8m ago",
      summary: `Proprietary order flow metrics detected dark pool accumulation and block trade execution in ${targetQuery}, suggesting institutional repositioning.`,
      category: "Analyst Rating",
      sentiment: "bullish",
      impactScore: 8,
      relatedTicker: cleanSymbol,
      affectedAgents: ["equityAnalyst", "cio", "cro"],
      agentReactions: [
        {
          agentId: "equityAnalyst",
          agentName: "Elena Rostova, CFA",
          role: "Lead Equity Analyst",
          take: `Volume expansion accompanies strong fundamental support levels. Accumulation confirms bullish institutional conviction.`,
          impact: "positive",
        },
        {
          agentId: "cro",
          agentName: "Rachel Stern, FRM",
          role: "Chief Risk Officer",
          take: `Elevated volume also signals potential volatility expansion. Verify liquidity depth before expanding book size.`,
          impact: "neutral",
        },
      ],
    },
    {
      id: `news-${cleanSymbol}-2`,
      title: `Secular Technology Architecture Evolution Shifts Competitive Dynamics for ${targetQuery}`,
      source: "Tech Insights Wire",
      timestamp: "35 mins ago",
      relativeTime: "35m ago",
      summary: `Industry whitepapers review the patent portfolio, software ecosystem stickiness, and cost-to-scale advantages shaping the next 3-5 year roadmap.`,
      category: "Technology",
      sentiment: "bullish",
      impactScore: 7,
      relatedTicker: cleanSymbol,
      affectedAgents: ["cto", "cio"],
      agentReactions: [
        {
          agentId: "cto",
          agentName: "Dr. Aris Thorne",
          role: "Chief Technology Officer",
          take: `Secular trend moats remain resilient against early-stage open source or competing legacy substitutes.`,
          impact: "positive",
        },
      ],
    },
    {
      id: `news-${cleanSymbol}-3`,
      title: `Global Central Bank Cross-Currents and Sovereign Industrial Policies in Focus`,
      source: "Macro Capital Intelligence",
      timestamp: "1 hour ago",
      relativeTime: "1h ago",
      summary: `Supply chain onshoring and tariff discussions introduce non-linear friction across cross-border revenue streams.`,
      category: "Macro",
      sentiment: "neutral",
      impactScore: 6,
      relatedTicker: cleanSymbol,
      affectedAgents: ["macroStrategist", "cro"],
      agentReactions: [
        {
          agentId: "macroStrategist",
          agentName: "Henrik Lindqvist",
          role: "Global Macro Strategist",
          take: `Top-down macro regime favors resilient balance sheets with low refinancing exposure.`,
          impact: "neutral",
        },
        {
          agentId: "cio",
          agentName: "Dr. Marcus Vance",
          role: "Chief Investment Officer",
          take: `Maintain discipline. Incorporate macro rate assumptions directly into our fair-value terminal multiple.`,
          impact: "neutral",
        },
      ],
    },
  ];
}

/**
 * Fetch live equity quote directly from finviz.com via backend proxy
 */
export async function fetchLiveFinvizQuote(symbol: string): Promise<MarketQuote | null> {
  const cleanSymbol = symbol.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
  if (!cleanSymbol) return null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`/api/finviz?ticker=${encodeURIComponent(cleanSymbol)}`, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return null;
    }

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return null;
    }

    const text = await res.text();
    if (!text || !text.trim().startsWith("{")) {
      return null;
    }

    let data: any = null;
    try {
      data = JSON.parse(text);
    } catch {
      return null;
    }

    if (!data || !data.ok) {
      return null;
    }

    const price = data.price || 100;
    const orderBook = generateOrderBook(price);
    const existingTicks = liveQuoteCache.get(cleanSymbol)?.intradayTicks;

    let parsedAvgVol = 12000000;
    if (data.avgVolume) {
      const num = parseFloat(data.avgVolume);
      if (data.avgVolume.includes("M")) parsedAvgVol = Math.round(num * 1000000);
      else if (data.avgVolume.includes("B")) parsedAvgVol = Math.round(num * 1000000000);
      else if (data.avgVolume.includes("K")) parsedAvgVol = Math.round(num * 1000);
      else if (!isNaN(num)) parsedAvgVol = num;
    }

    const quote: MarketQuote = {
      symbol: data.symbol,
      companyName: data.companyName || cleanSymbol,
      price: price,
      change: data.change || 0,
      changePercent: data.changePercent || 0,
      open: data.prevClose ? parseFloat((data.prevClose * 1.002).toFixed(2)) : price,
      high: data.week52High || price * 1.05,
      low: data.week52Low || price * 0.95,
      previousClose: data.prevClose || price,
      volume: data.volume || 15000000,
      avgVolume: parsedAvgVol,
      marketCap: data.marketCap ? (data.marketCap.startsWith("$") ? data.marketCap : `$${data.marketCap}`) : "$100B",
      peRatio: data.peRatio || 25,
      vwap: parseFloat((price * 0.998).toFixed(2)),
      bid: orderBook.bids[0].price,
      ask: orderBook.asks[0].price,
      bidSize: orderBook.bids[0].size,
      askSize: orderBook.asks[0].size,
      week52High: data.week52High || price * 1.15,
      week52Low: data.week52Low || price * 0.85,
      marketStatus: "REGULAR",
      timestamp: new Date().toLocaleTimeString(),
      orderBook,
      intradayTicks: existingTicks?.length ? existingTicks : generateIntradayTicks(price),
      finvizData: data,
      isFinvizLive: true,
    };

    liveQuoteCache.set(cleanSymbol, quote);
    return quote;
  } catch (err) {
    // Non-fatal: smoothly fallback to institutional baseline quote without polluting console with error reports
    return null;
  }
}
