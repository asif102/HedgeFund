export type AgentId = "cio" | "equityAnalyst" | "cto" | "macroStrategist" | "cro";

export interface AgentProfile {
  id: AgentId;
  name: string;
  title: string;
  role: string;
  mandate: string;
  tone: string;
  avatarIcon: string;
  accentColor: string;
}

export interface ValuationMetric {
  metric: string;
  value: string;
  benchmark: string;
  assessment: string;
}

export interface Phase1Data {
  equityAnalyst: {
    agentName: string;
    mandate: string;
    keyFindings: string[];
    financialHealth: string;
    valuationMetrics: ValuationMetric[];
    moatAssessment: string;
  };
  cto: {
    agentName: string;
    mandate: string;
    keyFindings: string[];
    techStackAnalysis: string;
    scalabilityScore: number; // 0-100
    disruptionRisk: string;
    rdEfficiency: string;
  };
  macroStrategist: {
    agentName: string;
    mandate: string;
    keyFindings: string[];
    interestRateAndMonetaryContext: string;
    geopoliticalSupplyChainRisk: string;
    regulatoryHeadwindsTailwinds: string;
  };
  cro: {
    agentName: string;
    mandate: string;
    keyFindings: string[];
    topVulnerabilities: string[];
    tailRiskTriggers: string;
    liquidityAndExecutionRisk: string;
    hedgingRecommendation: string;
  };
  cio: {
    agentName: string;
    mandate: string;
    strategicOrientation: string;
    initialHypothesis: string;
    criticalQuestionsToResolve: string[];
  };
}

export interface DebateTurn {
  speaker: string;
  role: string;
  targetAddressed: string;
  argument: string;
  counterMetricOrFact: string;
  tone: string;
}

export interface MemorandumData {
  title: string;
  executiveSummary: {
    finalRecommendation: "Strong Buy" | "Buy" | "Hold" | "Short" | "Avoid" | string;
    targetHorizon: string;
    coreThesis: string;
    allocationWeight?: string;
  };
  fundamentalValuation: {
    financialHealth: string;
    valuationAssessment: string;
    competitiveMoat: string;
  };
  techTrendFeasibility: {
    innovationScorecard: string;
    disruptionRisk: string;
  };
  macroGeopoliticalDrivers: {
    tailwindsHeadwinds: string;
    globalPositioning: string;
  };
  riskAssessmentBearCase: {
    top3Vulnerabilities: string[];
    tailRiskWorstCase: string;
    suggestedHedgingStrategy: string;
  };
}

export interface SummarySnapshot {
  recommendation: string;
  targetHorizon: string;
  convictionScore: number; // 0-100
  targetPriceOrFairValue: string;
  riskRating: "Low" | "Moderate" | "Elevated" | "High" | "Extreme" | string;
  volatilityBeta?: string;
}

export interface SwarmAgentInsight {
  agentId: AgentId;
  agentName: string;
  mandate: string;
  score: number;
  stance: "BULLISH" | "NEUTRAL" | "BEARISH";
  evidence: string[];
  metricLabel: string;
  metricValue: string;
}

export interface SwarmCommitteeResult {
  symbol: string;
  price: number;
  consensusScore: number;
  consensusStance: "BULLISH" | "NEUTRAL" | "BEARISH";
  agents: SwarmAgentInsight[];
  calculatedAt: string;
  methodology: string;
}

export interface HedgeFundAnalysisResult {
  target: string;
  category: string;
  summarySnapshot: SummarySnapshot;
  phase1SegregatedResearch: Phase1Data;
  phase2InternalDebate: DebateTurn[];
  phase3Memorandum: MemorandumData;
}

// Real-Time Market Data Feeds
export interface IntradayTick {
  time: string;
  price: number;
  volume: number;
}

export interface OrderBookLevel {
  price: number;
  size: number;
  total: number;
}

export interface OrderBook {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  spread: number;
}

export interface FinvizData {
  ok: boolean;
  symbol: string;
  companyName: string;
  sector?: string;
  industry?: string;
  price: number;
  change: number;
  changePercent: number;
  prevClose: number;
  marketCap: string;
  enterpriseValue?: string;
  peRatio?: number | null;
  forwardPE?: number | null;
  peg?: string | null;
  ps?: string | null;
  pb?: string | null;
  pfcf?: string | null;
  quickRatio?: string | null;
  currentRatio?: string | null;
  debtEq?: string | null;
  epsTTM?: string | null;
  epsNextY?: string | null;
  grossMargin?: string | null;
  operMargin?: string | null;
  profitMargin?: string | null;
  targetPrice?: string | null;
  index?: string | null;
  week52High?: number | null;
  week52Low?: number | null;
  beta?: number | null;
  rsi?: number | null;
  volume: number;
  avgVolume?: string;
  perfYTD?: string | null;
  perfQuarter?: string | null;
  perfYear?: string | null;
  sourceUrl: string;
  fetchedAt: string;
}

export interface MarketQuote {
  symbol: string;
  companyName: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  previousClose: number;
  volume: number;
  avgVolume: number;
  marketCap: string;
  peRatio: number;
  vwap: number;
  bid: number;
  ask: number;
  bidSize: number;
  askSize: number;
  week52High: number;
  week52Low: number;
  marketStatus: "REGULAR" | "PRE_MARKET" | "AFTER_HOURS" | "CLOSED";
  timestamp: string;
  orderBook: OrderBook;
  intradayTicks: IntradayTick[];
  finvizData?: FinvizData;
  isFinvizLive?: boolean;
}

export interface AgentReaction {
  agentId: AgentId;
  agentName: string;
  role: string;
  take: string;
  impact: "positive" | "negative" | "neutral";
}

export interface FinancialNewsItem {
  id: string;
  title: string;
  source: string;
  timestamp: string;
  relativeTime: string;
  summary: string;
  category: "Earnings" | "Macro" | "Technology" | "Regulatory" | "Supply Chain" | "Analyst Rating";
  sentiment: "bullish" | "bearish" | "neutral";
  impactScore: number; // 1-10
  relatedTicker: string;
  affectedAgents: AgentId[];
  agentReactions: AgentReaction[];
}

// Historical Data Backtester
export type BacktestTimeframe = "3M" | "6M" | "1Y" | "2Y" | "3Y" | "5Y";

export type StrategyType =
  | "agentic_consensus"
  | "agent_cio_momentum"
  | "agent_equity_value"
  | "agent_cto_breakout"
  | "agent_macro_regime"
  | "agent_cro_hedge"
  | "ema_crossover"
  | "rsi_bollinger"
  | "momentum_breakout"
  | "custom";

export interface BacktestConfig {
  strategyId: StrategyType;
  strategyName: string;
  symbol: string;
  timeframe: BacktestTimeframe;
  initialCapital: number;
  positionSizePct: number; // 10-100
  stopLossPct: number; // 1-30
  takeProfitPct: number; // 5-100
  enableCroHedging: boolean;
  slippageBps: number;
  commissionPerTrade: number;
  // Custom indicator parameters
  fastEma?: number;
  slowEma?: number;
  rsiPeriod?: number;
  rsiOversold?: number;
  rsiOverbought?: number;
  agentConvictionThreshold?: number;
}

export interface HistoricalBar {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  emaFast?: number;
  emaSlow?: number;
  rsi?: number;
  upperBand?: number;
  lowerBand?: number;
}

export interface TradeRecord {
  id: string;
  entryDate: string;
  exitDate?: string;
  type: "LONG" | "HEDGE_COLLAR" | "SHORT";
  entryPrice: number;
  exitPrice?: number;
  shares: number;
  initialValue: number;
  exitValue?: number;
  pnl?: number;
  pnlPct?: number;
  holdingDays?: number;
  status: "OPEN" | "CLOSED";
  triggerReason: string;
  exitReason?: string;
  agentSignature: string;
}

export interface EquityCurvePoint {
  date: string;
  strategyEquity: number;
  benchmarkEquity: number;
  drawdownPct: number;
  sp500Equity: number;
}

export interface BacktestResult {
  config: BacktestConfig;
  symbol: string;
  startDate: string;
  endDate: string;
  initialCapital: number;
  finalEquity: number;
  totalReturnPct: number;
  cagr: number; // Annualized return
  benchmarkReturnPct: number;
  sp500ReturnPct: number;
  alpha: number;
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdownPct: number;
  maxDrawdownDurationDays: number;
  winRatePct: number;
  profitFactor: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  avgWinPct: number;
  avgLossPct: number;
  largestWinPct: number;
  largestLossPct: number;
  equityCurve: EquityCurvePoint[];
  trades: TradeRecord[];
  agentAudits: {
    cioVerdict: string;
    croRiskAudit: string;
    equityValuationAudit: string;
  };
}

// ---------------------------------------------------------------------------
// Indian Equity Market & LiveMint / Moneycontrol Quantitative Indicators
// ---------------------------------------------------------------------------

export interface IndianIndexQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  previousClose: number;
  peRatio?: number;
  volume?: number;
  exchange: "NSE" | "BSE";
  isRealtime?: boolean;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  lastTradeTime?: string;
  marketStatus?: string;
}

export interface IndianStockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCapCr: string; // In INR Crores / Lakh Crores
  peRatio: number;
  sector: string;
  high52w: number;
  low52w: number;
  dayHigh: number;
  dayLow: number;
  trend: "bullish" | "bearish" | "neutral";
  isRealtime?: boolean;
  lastTradeTime?: string;
}

export interface IndianMarketBreadth {
  advances: number;
  declines: number;
  unchanged: number;
  totalTraded: number;
  adrRatio: number; // Advances / Declines
  sentiment: "Bullish Breadth" | "Neutral Breadth" | "Weak Conviction / Declines Dominate";
}

export interface FiiDiiFlow {
  date: string;
  fiiNetCr: number; // Negative = Net Seller, Positive = Net Buyer (₹ Cr)
  diiNetCr: number;
  totalNetCr: number;
}

// Mint Graphic 1: Nifty and LWTD Indicator (Lift-Weight-Thrust-Drag)
export interface MintLWTDDataPoint {
  date: string; // e.g. "1 May 2026", "8 May", "11 Sep 2026"
  niftyWowChange: number; // Nifty week-over-week % change (e.g. 0.42 to -2.09)
  niftyLWTD: number; // Lift-Weight-Thrust-Drag indicator oscillator (e.g. -0.19 to -0.10)
  niftyClose?: number;
}

// Mint Graphic 2: Market Wide Position Limits (MWPL)
export interface MintMWPLDataPoint {
  date: string;
  mwplPercent: number; // % utilization of F&O position limits (e.g. 42.57 to 51.20)
  openInterestContracts?: number;
  isExpiryWeek?: boolean;
}

// Mint Graphic 3: NSE Advance Decline Ratio
export interface MintAdvDecDataPoint {
  date: string;
  niftyWowChange: number; // Nifty week-over-week % change (e.g. 0.42 to -2.09)
  advDecRatioWeeklyAvg: number; // Adv-Dec Ratio Weeks Avg (e.g. 1.22 to 0.75)
  advances?: number;
  declines?: number;
}

export interface IndianMarketIndicatorsDataset {
  timeframe: string;
  updatedAt: string;
  source: string;
  author: string;
  graphicDesigner: string;
  lwtd: {
    title: string;
    subtitle: string;
    startNiftyWow: number;
    startLWTD: number;
    endNiftyWow: number;
    endLWTD: number;
    series: MintLWTDDataPoint[];
    interpretation: string;
  };
  mwpl: {
    title: string;
    subtitle: string;
    startMWPL: number;
    endMWPL: number;
    series: MintMWPLDataPoint[];
    interpretation: string;
  };
  advDec: {
    title: string;
    subtitle: string;
    startAdvDec: number;
    startNiftyWow: number;
    endAdvDec: number;
    endNiftyWow: number;
    series: MintAdvDecDataPoint[];
    interpretation: string;
  };
}

// Automated Weekly Trend Calculation for Indian Equity Models
export interface AutomatedWeeklyTrend {
  calculatedAt: string;
  regime: string;
  confidenceScore: number;
  algorithmicSynthesis: {
    executiveSummary: string;
    actionableConclusions: string[];
    primaryBias: string;
  };
  niftyTrend: {
    trendDirection: "bullish" | "bearish" | "neutral";
    currentClose: number;
    priorWeekClose: number;
    wowPointChange: number;
    wowPercentChange: number;
  };
  lwtdAerodynamic: {
    currentLWTD: number;
    weeklyMovingAverage: number;
    regime: string;
    liftVsDragRatio: {
      liftPercent: number;
      dragPercent: number;
    };
  };
  mwplRollover: {
    currentMWPL: number;
    priorMWPL: number;
    weeklyShiftPercent: number;
    daysToExpiry: number;
    swingTraderBias: string;
  };
  advanceDeclineBreadth: {
    currentRatio: number;
    status: string;
    breadthDivergencePercent: number;
    advancesCount: number;
    declinesCount: number;
  };
  expectedVolatilityCone: {
    vixLevel: number;
    projectedWeeklyRange: {
      lower: number;
      upper: number;
      supportLevel: number;
      resistanceLevel: number;
      expectedPointsMove: number;
      expectedPercentageMove: number;
    };
  };
  // Flat legacy aliases for full compatibility
  niftyCurrentPrice?: number;
  niftyPriorWeekClose?: number;
  niftyWeeklyReturn?: number;
  niftyWeeklyTrendDirection?: "BULLISH" | "BEARISH" | "NEUTRAL";
  currentLWTD?: number;
  lwtd4WeekAvg?: number;
  lwtdRegime?: string;
  liftScore?: number;
  dragScore?: number;
  currentMWPL?: number;
  priorWeekMWPL?: number;
  mwplWeeklyChange?: number;
  mwplStatus?: string;
  currentADR?: number;
  adr4WeekAvg?: number;
  adrBreadthDivergence?: number;
  breadthStatus?: string;
  primaryWeeklyBias?: string;
  projectedRangeLow?: number;
  projectedRangeHigh?: number;
  keyDrivers?: string[];
  actionableSummary?: string;
}

// Finviz S&P 500 Sector Rotation Types
export type RotationQuadrant = "Leading" | "Weakening" | "Lagging" | "Improving";

export interface FinvizStockItem {
  ticker: string;
  name: string;
  sector: string;
  industry: string;
  price: number;
  change: number; // 1D %
  perf1W: number; // 1W %
  perf1M: number; // 1M %
  perf3M: number; // 3M %
  perfYTD: number; // YTD %
  volume: string;
  relVolume: number;
  pe: number | null;
  marketCap: string;
  marketCapNum: number; // in billions
  rotationQuadrant: RotationQuadrant;
  rsRatio: number; // Relative strength ratio vs SPY benchmark (100 is benchmark)
  rsMomentum: number; // Rate of change of RS ratio
}

export interface FinvizIndustryGroup {
  industry: string;
  sector: string;
  stockCount: number;
  perf1D: number;
  perf1W: number;
  perf1M: number;
  perf3M: number;
  perfYTD: number;
  totalMarketCap: string;
  marketCapNum: number;
  rotationQuadrant: RotationQuadrant;
  stocks: FinvizStockItem[];
}

export interface FinvizSectorGroup {
  sector: string;
  etfTicker: string; // e.g. XLK, XLF
  weightInSP500: number; // % e.g. 31.8
  perf1D: number;
  perf1W: number;
  perf1M: number;
  perf3M: number;
  perfYTD: number;
  rotationQuadrant: RotationQuadrant;
  rsRatio: number;
  rsMomentum: number;
  industries: FinvizIndustryGroup[];
  stocks: FinvizStockItem[];
}

export interface FinvizSectorRotationPayload {
  asOf: string;
  benchmark: string; // "S&P 500 (SPY)"
  sectors: FinvizSectorGroup[];
  allIndustries: FinvizIndustryGroup[];
  allStocks: FinvizStockItem[];
  marketBreadth: {
    leadingCount: number;
    improvingCount: number;
    weakeningCount: number;
    laggingCount: number;
  };
}
