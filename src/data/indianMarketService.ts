import {
  IndianIndexQuote,
  IndianStockQuote,
  IndianMarketBreadth,
  FiiDiiFlow,
  IndianMarketIndicatorsDataset,
  MintLWTDDataPoint,
  MintMWPLDataPoint,
  MintAdvDecDataPoint,
  AutomatedWeeklyTrend,
  IndianValueScreenerPayload,
  IndianValueScreenerStock,
} from "../types";

// Base institutional reference data for major Indian indices
export const BASE_INDIAN_INDICES: IndianIndexQuote[] = [
  {
    symbol: "NIFTY 50",
    name: "Nifty 50 Index (NSE)",
    price: 25356.5,
    change: -128.4,
    changePercent: -0.5,
    open: 25480.0,
    high: 25525.8,
    low: 25310.2,
    previousClose: 25484.9,
    peRatio: 22.8,
    volume: 384000000,
    exchange: "NSE",
  },
  {
    symbol: "SENSEX",
    name: "BSE Sensex 30 Index",
    price: 82890.9,
    change: -390.1,
    changePercent: -0.47,
    open: 83250.0,
    high: 83410.5,
    low: 82740.2,
    previousClose: 83281.0,
    peRatio: 23.4,
    volume: 24500000,
    exchange: "BSE",
  },
  {
    symbol: "BANK NIFTY",
    name: "Nifty Bank Index",
    price: 51980.2,
    change: -215.8,
    changePercent: -0.41,
    open: 52150.0,
    high: 52310.0,
    low: 51840.5,
    previousClose: 52196.0,
    peRatio: 16.2,
    volume: 182000000,
    exchange: "NSE",
  },
  {
    symbol: "NIFTY IT",
    name: "Nifty IT Sectoral Index",
    price: 35840.1,
    change: 142.5,
    changePercent: 0.4,
    open: 35700.0,
    high: 36010.0,
    low: 35680.0,
    previousClose: 35697.6,
    peRatio: 28.5,
    volume: 42000000,
    exchange: "NSE",
  },
  {
    symbol: "INDIA VIX",
    name: "NSE Volatility Index",
    price: 13.82,
    change: -0.34,
    changePercent: -2.4,
    open: 14.16,
    high: 14.45,
    low: 13.6,
    previousClose: 14.16,
    exchange: "NSE",
  },
  {
    symbol: "USD / INR",
    name: "US Dollar / Indian Rupee",
    price: 83.92,
    change: 0.04,
    changePercent: 0.05,
    open: 83.88,
    high: 83.96,
    low: 83.85,
    previousClose: 83.88,
    exchange: "NSE",
  },
];

// Top 10 Indian NSE Heavyweight Equities
export const TOP_INDIAN_EQUITIES: IndianStockQuote[] = [
  {
    symbol: "RELIANCE.NS",
    name: "Reliance Industries Ltd",
    price: 2984.6,
    change: -18.2,
    changePercent: -0.61,
    volume: 6420000,
    marketCapCr: "₹20.19 Lakh Cr",
    peRatio: 27.8,
    sector: "Oil, Gas & Consumables / Retail / Telecom",
    high52w: 3217.9,
    low52w: 2221.0,
    dayHigh: 3012.0,
    dayLow: 2972.5,
    trend: "neutral",
  },
  {
    symbol: "TCS.NS",
    name: "Tata Consultancy Services",
    price: 4312.4,
    change: 24.8,
    changePercent: 0.58,
    volume: 2150000,
    marketCapCr: "₹15.60 Lakh Cr",
    peRatio: 31.4,
    sector: "Information Technology - Software",
    high52w: 4592.2,
    low52w: 3311.0,
    dayHigh: 4338.0,
    dayLow: 4280.0,
    trend: "bullish",
  },
  {
    symbol: "HDFCBANK.NS",
    name: "HDFC Bank Ltd",
    price: 1648.75,
    change: -9.5,
    changePercent: -0.57,
    volume: 14800000,
    marketCapCr: "₹12.56 Lakh Cr",
    peRatio: 18.9,
    sector: "Financial Services - Private Bank",
    high52w: 1794.0,
    low52w: 1363.45,
    dayHigh: 1664.0,
    dayLow: 1641.1,
    trend: "neutral",
  },
  {
    symbol: "INFY.NS",
    name: "Infosys Ltd",
    price: 1845.3,
    change: 12.1,
    changePercent: 0.66,
    volume: 5800000,
    marketCapCr: "₹7.66 Lakh Cr",
    peRatio: 28.2,
    sector: "Information Technology - Software",
    high52w: 1953.9,
    low52w: 1351.65,
    dayHigh: 1858.0,
    dayLow: 1830.0,
    trend: "bullish",
  },
  {
    symbol: "ICICIBANK.NS",
    name: "ICICI Bank Ltd",
    price: 1224.6,
    change: -4.8,
    changePercent: -0.39,
    volume: 9100000,
    marketCapCr: "₹8.62 Lakh Cr",
    peRatio: 17.5,
    sector: "Financial Services - Private Bank",
    high52w: 1300.0,
    low52w: 914.0,
    dayHigh: 1236.0,
    dayLow: 1218.2,
    trend: "bullish",
  },
  {
    symbol: "BHARTIARTL.NS",
    name: "Bharti Airtel Ltd",
    price: 1542.1,
    change: 8.4,
    changePercent: 0.55,
    volume: 4800000,
    marketCapCr: "₹9.12 Lakh Cr",
    peRatio: 64.2,
    sector: "Telecommunication Services",
    high52w: 1610.0,
    low52w: 885.0,
    dayHigh: 1555.0,
    dayLow: 1528.0,
    trend: "bullish",
  },
  {
    symbol: "SBIN.NS",
    name: "State Bank of India",
    price: 792.3,
    change: -6.7,
    changePercent: -0.84,
    volume: 11200000,
    marketCapCr: "₹7.07 Lakh Cr",
    peRatio: 9.8,
    sector: "Financial Services - PSU Bank",
    high52w: 912.0,
    low52w: 555.25,
    dayHigh: 802.0,
    dayLow: 789.0,
    trend: "neutral",
  },
  {
    symbol: "LT.NS",
    name: "Larsen & Toubro Ltd",
    price: 3624.0,
    change: -28.0,
    changePercent: -0.77,
    volume: 2400000,
    marketCapCr: "₹4.98 Lakh Cr",
    peRatio: 36.5,
    sector: "Construction & Infrastructure",
    high52w: 3919.9,
    low52w: 2862.0,
    dayHigh: 3660.0,
    dayLow: 3605.0,
    trend: "neutral",
  },
  {
    symbol: "ITC.NS",
    name: "ITC Ltd",
    price: 504.8,
    change: 2.1,
    changePercent: 0.42,
    volume: 7800000,
    marketCapCr: "₹6.31 Lakh Cr",
    peRatio: 29.1,
    sector: "Fast Moving Consumer Goods (FMCG)",
    high52w: 526.0,
    low52w: 399.3,
    dayHigh: 508.0,
    dayLow: 501.5,
    trend: "bullish",
  },
  {
    symbol: "TATAMOTORS.NS",
    name: "Tata Motors Ltd",
    price: 982.5,
    change: -14.2,
    changePercent: -1.42,
    volume: 8900000,
    marketCapCr: "₹3.62 Lakh Cr",
    peRatio: 11.2,
    sector: "Automobile - Commercial & Passenger",
    high52w: 1179.0,
    low52w: 608.5,
    dayHigh: 998.0,
    dayLow: 978.0,
    trend: "neutral",
  },
];

export const BASE_TIJORI_VALUE_SCREENER: IndianValueScreenerStock[] = [
  {
    symbol: "COALINDIA.NS",
    name: "Coal India Ltd",
    sector: "Energy",
    cmp: 496.8,
    peRatio: 6.9,
    pbRatio: 2.1,
    roePercent: 30.4,
    debtToEquity: 0.05,
    marketCapCr: 306050,
    valueScore: 87,
    valueRationale: "Single-digit P/E with high cash generation and strong ROE profile.",
    sourceUrl: "https://www.tijori.com/stocks/COALINDIA",
  },
  {
    symbol: "POWERGRID.NS",
    name: "Power Grid Corporation of India Ltd",
    sector: "Utilities",
    cmp: 352.4,
    peRatio: 15.1,
    pbRatio: 2.4,
    roePercent: 17.8,
    debtToEquity: 1.15,
    marketCapCr: 327860,
    valueScore: 79,
    valueRationale: "Defensive utility franchise with stable return ratios and predictable cash flows.",
    sourceUrl: "https://www.tijori.com/stocks/POWERGRID",
  },
  {
    symbol: "NTPC.NS",
    name: "NTPC Ltd",
    sector: "Utilities",
    cmp: 422.6,
    peRatio: 14.4,
    pbRatio: 2.2,
    roePercent: 15.6,
    debtToEquity: 1.32,
    marketCapCr: 409330,
    valueScore: 76,
    valueRationale: "Reasonable valuation with visible earnings and regulated growth capex.",
    sourceUrl: "https://www.tijori.com/stocks/NTPC",
  },
  {
    symbol: "BPCL.NS",
    name: "Bharat Petroleum Corporation Ltd",
    sector: "Oil & Gas",
    cmp: 379.2,
    peRatio: 8.4,
    pbRatio: 1.5,
    roePercent: 19.1,
    debtToEquity: 0.83,
    marketCapCr: 164430,
    valueScore: 82,
    valueRationale: "Low earnings multiple and improved balance sheet vs prior down-cycle.",
    sourceUrl: "https://www.tijori.com/stocks/BPCL",
  },
  {
    symbol: "BANKBARODA.NS",
    name: "Bank of Baroda",
    sector: "Financial Services",
    cmp: 284.7,
    peRatio: 6.8,
    pbRatio: 1.1,
    roePercent: 16.9,
    debtToEquity: 0.0,
    marketCapCr: 147240,
    valueScore: 84,
    valueRationale: "Attractive P/B and P/E combination with improving return metrics.",
    sourceUrl: "https://www.tijori.com/stocks/BANKBARODA",
  },
];

// Live Market Breadth (NSE Cash Market)
export const BASE_MARKET_BREADTH: IndianMarketBreadth = {
  advances: 1142,
  declines: 1518,
  unchanged: 84,
  totalTraded: 2744,
  adrRatio: 0.75, // Matches the 0.75 in the uploaded image!
  sentiment: "Weak Conviction / Declines Dominate",
};

// Institutional Flows (FII vs DII in ₹ Crores)
export const BASE_FII_DII_FLOWS: FiiDiiFlow[] = [
  { date: "Current Session", fiiNetCr: -1842.5, diiNetCr: 2410.8, totalNetCr: 568.3 },
  { date: "Previous Session", fiiNetCr: -2340.0, diiNetCr: 2890.4, totalNetCr: 550.4 },
  { date: "3 Sessions Ago", fiiNetCr: -980.2, diiNetCr: 1650.0, totalNetCr: 669.8 },
  { date: "4 Sessions Ago", fiiNetCr: 125.0, diiNetCr: 840.5, totalNetCr: 965.5 },
  { date: "5 Sessions Ago", fiiNetCr: -1420.0, diiNetCr: 1980.0, totalNetCr: 560.0 },
];

// ---------------------------------------------------------------------------
// Mint Indicator Dataset 1: Nifty and LWTD Indicator (unnamed-3.jpg)
// ---------------------------------------------------------------------------
// Matches exact values in image:
// Start: 1 May 2026, Nifty w-o-w change = 0.42, LWTD = -0.19
// End: 11 Sep 2026, Nifty w-o-w change = -2.09, LWTD = -0.10
export const MINT_LWTD_DATA: MintLWTDDataPoint[] = [
  { date: "1 May 2026", niftyWowChange: 0.42, niftyLWTD: -0.19, niftyClose: 24450 },
  { date: "8 May 2026", niftyWowChange: 0.72, niftyLWTD: 0.25, niftyClose: 24620 },
  { date: "15 May 2026", niftyWowChange: -2.2, niftyLWTD: -0.32, niftyClose: 24080 },
  { date: "22 May 2026", niftyWowChange: 0.3, niftyLWTD: -0.12, niftyClose: 24150 },
  { date: "29 May 2026", niftyWowChange: -0.72, niftyLWTD: 0.24, niftyClose: 23980 },
  { date: "5 Jun 2026", niftyWowChange: -0.78, niftyLWTD: 0.08, niftyClose: 23790 },
  { date: "12 Jun 2026", niftyWowChange: 1.05, niftyLWTD: 0.12, niftyClose: 24040 },
  { date: "19 Jun 2026", niftyWowChange: 1.62, niftyLWTD: 0.55, niftyClose: 24430 },
  { date: "26 Jun 2026", niftyWowChange: 0.18, niftyLWTD: -0.42, niftyClose: 24470 },
  { date: "3 Jul 2026", niftyWowChange: 0.82, niftyLWTD: -0.31, niftyClose: 24670 },
  { date: "10 Jul 2026", niftyWowChange: -0.45, niftyLWTD: 0.18, niftyClose: 24560 },
  { date: "17 Jul 2026", niftyWowChange: 0.52, niftyLWTD: -0.92, niftyClose: 24690 },
  { date: "24 Jul 2026", niftyWowChange: -2.32, niftyLWTD: 0.18, niftyClose: 24120 },
  { date: "31 Jul 2026", niftyWowChange: 2.58, niftyLWTD: 0.41, niftyClose: 24740 },
  { date: "7 Aug 2026", niftyWowChange: 0.35, niftyLWTD: 0.32, niftyClose: 24830 },
  { date: "14 Aug 2026", niftyWowChange: -0.84, niftyLWTD: -0.12, niftyClose: 24620 },
  { date: "21 Aug 2026", niftyWowChange: -0.42, niftyLWTD: -0.01, niftyClose: 24520 },
  { date: "28 Aug 2026", niftyWowChange: -0.31, niftyLWTD: -0.18, niftyClose: 24440 },
  { date: "4 Sep 2026", niftyWowChange: -1.25, niftyLWTD: -0.09, niftyClose: 24130 },
  { date: "11 Sep 2026", niftyWowChange: -2.09, niftyLWTD: -0.1, niftyClose: 23625 },
];

// ---------------------------------------------------------------------------
// Mint Indicator Dataset 2: Market Wide Position Limits (unnamed-2.jpg)
// ---------------------------------------------------------------------------
// Matches exact values in image:
// Start: 1 May 2026 = 42.57%
// End: 11 Sep 2026 = 51.20%
// 4 distinct monthly expiry cycles showing sawtooth peaks up to 58% and post-expiry resets to 43-46%
export const MINT_MWPL_DATA: MintMWPLDataPoint[] = [
  { date: "1 May 2026", mwplPercent: 42.57, openInterestContracts: 4850000 },
  { date: "8 May 2026", mwplPercent: 51.2, openInterestContracts: 5420000 },
  { date: "15 May 2026", mwplPercent: 55.4, openInterestContracts: 5980000 },
  { date: "22 May 2026", mwplPercent: 56.8, openInterestContracts: 6150000 },
  { date: "29 May 2026", mwplPercent: 43.1, openInterestContracts: 4900000, isExpiryWeek: true },
  { date: "5 Jun 2026", mwplPercent: 48.6, openInterestContracts: 5210000 },
  { date: "12 Jun 2026", mwplPercent: 52.4, openInterestContracts: 5680000 },
  { date: "19 Jun 2026", mwplPercent: 56.9, openInterestContracts: 6220000 },
  { date: "26 Jun 2026", mwplPercent: 57.2, openInterestContracts: 6310000, isExpiryWeek: true },
  { date: "3 Jul 2026", mwplPercent: 46.5, openInterestContracts: 5100000 },
  { date: "10 Jul 2026", mwplPercent: 51.8, openInterestContracts: 5590000 },
  { date: "17 Jul 2026", mwplPercent: 58.0, openInterestContracts: 6410000 },
  { date: "24 Jul 2026", mwplPercent: 56.8, openInterestContracts: 6280000 },
  { date: "31 Jul 2026", mwplPercent: 45.8, openInterestContracts: 5020000, isExpiryWeek: true },
  { date: "7 Aug 2026", mwplPercent: 52.1, openInterestContracts: 5670000 },
  { date: "14 Aug 2026", mwplPercent: 58.7, openInterestContracts: 6520000 },
  { date: "21 Aug 2026", mwplPercent: 57.1, openInterestContracts: 6380000 },
  { date: "28 Aug 2026", mwplPercent: 45.2, openInterestContracts: 4950000, isExpiryWeek: true },
  { date: "4 Sep 2026", mwplPercent: 50.4, openInterestContracts: 5490000 },
  { date: "11 Sep 2026", mwplPercent: 51.2, openInterestContracts: 5580000 },
];

// ---------------------------------------------------------------------------
// Mint Indicator Dataset 3: NSE Advance Decline Ratio (unnamed.jpg)
// ---------------------------------------------------------------------------
// Matches exact values in image:
// Start: 1 May 2026, Adv-Dec Weeks Avg = 1.22, Nifty w-o-w change = 0.42
// End: 11 Sep 2026, Adv-Dec Weeks Avg = 0.75, Nifty w-o-w change = -2.09
export const MINT_ADV_DEC_DATA: MintAdvDecDataPoint[] = [
  { date: "1 May 2026", advDecRatioWeeklyAvg: 1.22, niftyWowChange: 0.42, advances: 1480, declines: 1210 },
  { date: "8 May 2026", advDecRatioWeeklyAvg: 1.68, niftyWowChange: 0.72, advances: 1720, declines: 1024 },
  { date: "15 May 2026", advDecRatioWeeklyAvg: 0.81, niftyWowChange: -2.2, advances: 1050, declines: 1694 },
  { date: "22 May 2026", advDecRatioWeeklyAvg: 1.21, niftyWowChange: 0.3, advances: 1470, declines: 1214 },
  { date: "29 May 2026", advDecRatioWeeklyAvg: 1.22, niftyWowChange: -0.72, advances: 1480, declines: 1210 },
  { date: "5 Jun 2026", advDecRatioWeeklyAvg: 1.05, niftyWowChange: -0.78, advances: 1390, declines: 1324 },
  { date: "12 Jun 2026", advDecRatioWeeklyAvg: 1.62, niftyWowChange: 1.05, advances: 1700, declines: 1050 },
  { date: "19 Jun 2026", advDecRatioWeeklyAvg: 1.65, niftyWowChange: 1.62, advances: 1725, declines: 1045 },
  { date: "26 Jun 2026", advDecRatioWeeklyAvg: 0.88, niftyWowChange: 0.18, advances: 1280, declines: 1450 },
  { date: "3 Jul 2026", advDecRatioWeeklyAvg: 1.28, niftyWowChange: 0.82, advances: 1530, declines: 1195 },
  { date: "10 Jul 2026", advDecRatioWeeklyAvg: 1.45, niftyWowChange: -0.45, advances: 1620, declines: 1118 },
  { date: "17 Jul 2026", advDecRatioWeeklyAvg: 0.88, niftyWowChange: 0.52, advances: 1280, declines: 1454 },
  { date: "24 Jul 2026", advDecRatioWeeklyAvg: 0.89, niftyWowChange: -2.32, advances: 1285, declines: 1445 },
  { date: "31 Jul 2026", advDecRatioWeeklyAvg: 1.38, niftyWowChange: 2.58, advances: 1580, declines: 1145 },
  { date: "7 Aug 2026", advDecRatioWeeklyAvg: 1.45, niftyWowChange: 0.35, advances: 1620, declines: 1115 },
  { date: "14 Aug 2026", advDecRatioWeeklyAvg: 0.88, niftyWowChange: -0.84, advances: 1280, declines: 1450 },
  { date: "21 Aug 2026", advDecRatioWeeklyAvg: 0.98, niftyWowChange: -0.42, advances: 1350, declines: 1370 },
  { date: "28 Aug 2026", advDecRatioWeeklyAvg: 1.02, niftyWowChange: -0.31, advances: 1380, declines: 1350 },
  { date: "4 Sep 2026", advDecRatioWeeklyAvg: 0.96, niftyWowChange: -1.25, advances: 1340, declines: 1395 },
  { date: "11 Sep 2026", advDecRatioWeeklyAvg: 0.75, niftyWowChange: -2.09, advances: 1142, declines: 1518 },
];

export const INITIAL_INDICATOR_DATASET: IndianMarketIndicatorsDataset = {
  timeframe: "1 May 2026 - 11 Sep 2026 (Weekly)",
  updatedAt: new Date().toISOString(),
  source: "National Stock Exchange (NSE) & Market Derivatives",
  author: "Quantitative Derivatives Desk",
  graphicDesigner: "Quantitative Research Team",
  lwtd: {
    title: "Nifty and LWTD Indicator",
    subtitle: "Expect fresh buying to be mild this week",
    startNiftyWow: 0.42,
    startLWTD: -0.19,
    endNiftyWow: -2.09,
    endLWTD: -0.1,
    series: MINT_LWTD_DATA,
    interpretation:
      "The Lift-Weight-Thrust-Drag (LWTD) indicator stands at -0.10 while the Nifty week-on-week change fell to -2.09%. Because LWTD remains submerged in negative aerodynamic territory, gravitational weight and hedge drag exceed forward thrust. Fresh institutional long accumulation is projected to remain mild and selective.",
  },
  mwpl: {
    title: "Market Wide Position Limits",
    subtitle: "Swing traders showed lower buying interest",
    startMWPL: 42.57,
    endMWPL: 51.2,
    series: MINT_MWPL_DATA,
    interpretation:
      "Market Wide Position Limits (MWPL) utilization is currently at 51.20%, down from historical mid-cycle peaks of 58.70%. Swing traders and leveraged proprietary books have reduced exposure, confirming risk aversion ahead of upcoming index derivative rollover adjustments.",
  },
  advDec: {
    title: "NSE Advance Decline Ratio",
    subtitle: "Intraday buying conviction fell sharply",
    startAdvDec: 1.22,
    startNiftyWow: 0.42,
    endAdvDec: 0.75,
    endNiftyWow: -2.09,
    series: MINT_ADV_DEC_DATA,
    interpretation:
      "The weekly average Advance-Decline Ratio has fallen from a healthy 1.22 at cycle inception to 0.75 today (1,142 advances vs 1,518 declines). This severe breadth contraction illustrates that intraday buying conviction has evaporated, leaving market leadership fragile and concentrated.",
  },
};

// State cache for live ticking
let currentIndianQuotes = [...BASE_INDIAN_INDICES];
let currentIndianStocks = [...TOP_INDIAN_EQUITIES];
let currentBreadth = { ...BASE_MARKET_BREADTH };
let currentIndicators = JSON.parse(JSON.stringify(INITIAL_INDICATOR_DATASET)) as IndianMarketIndicatorsDataset;
let currentTijoriValueScreener = [...BASE_TIJORI_VALUE_SCREENER];

/**
 * Fetch Indian market quotes and breadth from server or local service
 */
export async function getIndianMarketOverview(forceFresh = false): Promise<{
  indices: IndianIndexQuote[];
  stocks: IndianStockQuote[];
  breadth: IndianMarketBreadth;
  fiiDii: FiiDiiFlow[];
  isRealtime?: boolean;
  timestamp?: string;
  source?: string;
}> {
  try {
    const res = await fetch(`/api/india/market${forceFresh ? "?fresh=1" : ""}`);
    if (res.ok) {
      const data = await res.json();
      if (data.ok && data.indices) {
        currentIndianQuotes = data.indices;
        if (data.stocks) currentIndianStocks = data.stocks;
        if (data.breadth) currentBreadth = data.breadth;

        // Sync Mint Indicators with real-time Nifty quote
        const liveNifty = data.indices.find((i: IndianIndexQuote) => i.symbol === "NIFTY 50");
        if (liveNifty) {
          syncIndicatorsWithNifty(liveNifty, currentBreadth.adrRatio);
        }

        return {
          indices: data.indices,
          stocks: data.stocks || currentIndianStocks,
          breadth: data.breadth || currentBreadth,
          fiiDii: data.fiiDii || BASE_FII_DII_FLOWS,
          isRealtime: data.isRealtime ?? true,
          timestamp: data.timestamp,
          source: data.source,
        };
      }
    }
  } catch {
    // Graceful fallback to cached state
  }

  return {
    indices: currentIndianQuotes,
    stocks: currentIndianStocks,
    breadth: currentBreadth,
    fiiDii: BASE_FII_DII_FLOWS,
    isRealtime: false,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Synchronize the latest point in Mint quantitative graphics with live Nifty and Breadth
 */
export function syncIndicatorsWithNifty(niftyQuote: IndianIndexQuote, adrRatio: number) {
  const liveNiftyPct = niftyQuote.changePercent;

  // 1. Update LWTD latest point
  const lwtdArr = currentIndicators.lwtd.series;
  if (lwtdArr.length > 0) {
    const lastIndex = lwtdArr.length - 1;
    const liveLWTD = parseFloat((((adrRatio - 1) * 0.4) + (liveNiftyPct * 0.06) - 0.08).toFixed(2));
    lwtdArr[lastIndex] = {
      ...lwtdArr[lastIndex],
      niftyWowChange: liveNiftyPct,
      niftyLWTD: Math.min(0.8, Math.max(-1.2, liveLWTD)),
      niftyClose: niftyQuote.price,
    };
    currentIndicators.lwtd.endNiftyWow = liveNiftyPct;
    currentIndicators.lwtd.endLWTD = lwtdArr[lastIndex].niftyLWTD;
  }

  // 2. Update Adv-Dec latest point
  const advDecArr = currentIndicators.advDec.series;
  if (advDecArr.length > 0) {
    const lastIdx = advDecArr.length - 1;
    advDecArr[lastIdx] = {
      ...advDecArr[lastIdx],
      niftyWowChange: liveNiftyPct,
      advDecRatioWeeklyAvg: adrRatio,
    };
    currentIndicators.advDec.endNiftyWow = liveNiftyPct;
    currentIndicators.advDec.endAdvDec = adrRatio;
  }
}

/**
 * Fetch the 3 Mint quantitative indicators datasets
 */
export async function getIndianIndicatorsDataset(): Promise<IndianMarketIndicatorsDataset> {
  try {
    const res = await fetch("/api/india/indicators");
    if (res.ok) {
      const data = await res.json();
      if (data.ok && data.dataset) {
        currentIndicators = data.dataset;
        return data.dataset;
      }
    }
  } catch {
    // Graceful fallback
  }

  return currentIndicators;
}

/**
 * Fetch curated value-buying candidates from Tijori screener endpoint
 */
export async function getTijoriValueScreener(forceFresh = false): Promise<IndianValueScreenerPayload> {
  try {
    const res = await fetch(`/api/india/tijori-value-screener${forceFresh ? "?fresh=1" : ""}`);
    if (res.ok) {
      const data = await res.json();
      if (data.ok && Array.isArray(data.stocks) && data.stocks.length > 0) {
        currentTijoriValueScreener = data.stocks;
        return {
          screenerName: data.screenerName || "Tijori Value Screener",
          source: data.source || "Tijori",
          fetchedAt: data.fetchedAt || new Date().toISOString(),
          stocks: data.stocks,
        };
      }
    }
  } catch {
    // Graceful fallback
  }

  return {
    screenerName: "Tijori Value Screener (Curated Fallback)",
    source: "Tijori + Internal Quant Curation",
    fetchedAt: new Date().toISOString(),
    stocks: currentTijoriValueScreener,
  };
}

/**
 * Simulate live stochastic tick updates to Indian indices and stocks
 */
export function generateLiveIndianTick(): {
  indices: IndianIndexQuote[];
  stocks: IndianStockQuote[];
  breadth: IndianMarketBreadth;
  indicators: IndianMarketIndicatorsDataset;
} {
  // Jitter indices with realistic basis point drift
  currentIndianQuotes = currentIndianQuotes.map((idx) => {
    const deltaBps = (Math.random() - 0.51) * 0.0012;
    const newPrice = parseFloat((idx.price * (1 + deltaBps)).toFixed(2));
    const newChange = parseFloat((newPrice - idx.previousClose).toFixed(2));
    const newChangePercent = parseFloat(((newChange / idx.previousClose) * 100).toFixed(2));
    const newHigh = Math.max(idx.high, newPrice);
    const newLow = Math.min(idx.low, newPrice);

    return {
      ...idx,
      price: newPrice,
      change: newChange,
      changePercent: newChangePercent,
      high: newHigh,
      low: newLow,
      volume: (idx.volume || 1000000) + Math.floor(Math.random() * 25000),
    };
  });

  // Jitter equities
  currentIndianStocks = currentIndianStocks.map((stock) => {
    const deltaBps = (Math.random() - 0.5) * 0.002;
    const newPrice = parseFloat((stock.price * (1 + deltaBps)).toFixed(2));
    const prevClose = stock.price - stock.change;
    const newChange = parseFloat((newPrice - prevClose).toFixed(2));
    const newChangePercent = parseFloat(((newChange / prevClose) * 100).toFixed(2));

    return {
      ...stock,
      price: newPrice,
      change: newChange,
      changePercent: newChangePercent,
      volume: stock.volume + Math.floor(Math.random() * 15000),
      dayHigh: Math.max(stock.dayHigh, newPrice),
      dayLow: Math.min(stock.dayLow, newPrice),
    };
  });

  // Update market breadth
  const advShift = Math.floor((Math.random() - 0.5) * 6);
  const newAdv = Math.max(600, Math.min(2000, currentBreadth.advances + advShift));
  const newDec = currentBreadth.totalTraded - newAdv - currentBreadth.unchanged;
  const newAdr = parseFloat((newAdv / (newDec || 1)).toFixed(2));

  currentBreadth = {
    ...currentBreadth,
    advances: newAdv,
    declines: newDec,
    adrRatio: newAdr,
    sentiment:
      newAdr > 1.2
        ? "Bullish Breadth"
        : newAdr >= 0.9
        ? "Neutral Breadth"
        : "Weak Conviction / Declines Dominate",
  };

  // Sync latest point in the Mint indicators to mirror live Nifty movement!
  const niftyQuote = currentIndianQuotes.find((i) => i.symbol === "NIFTY 50");
  if (niftyQuote) {
    const liveNiftyPct = niftyQuote.changePercent;
    // Update LWTD latest point
    const lwtdArr = currentIndicators.lwtd.series;
    if (lwtdArr.length > 0) {
      const lastIndex = lwtdArr.length - 1;
      // Synthesize live LWTD from breadth and momentum
      const liveLWTD = parseFloat((((newAdr - 1) * 0.4) + (liveNiftyPct * 0.06) - 0.08).toFixed(2));
      lwtdArr[lastIndex] = {
        ...lwtdArr[lastIndex],
        niftyWowChange: liveNiftyPct,
        niftyLWTD: Math.min(0.8, Math.max(-1.2, liveLWTD)),
        niftyClose: niftyQuote.price,
      };
      currentIndicators.lwtd.endNiftyWow = liveNiftyPct;
      currentIndicators.lwtd.endLWTD = lwtdArr[lastIndex].niftyLWTD;
    }

    // Update MWPL latest point
    const mwplArr = currentIndicators.mwpl.series;
    if (mwplArr.length > 0) {
      const lastIdx = mwplArr.length - 1;
      const jitterMwpl = parseFloat((mwplArr[lastIdx].mwplPercent + (Math.random() - 0.5) * 0.04).toFixed(2));
      mwplArr[lastIdx] = {
        ...mwplArr[lastIdx],
        mwplPercent: jitterMwpl,
      };
      currentIndicators.mwpl.endMWPL = jitterMwpl;
    }

    // Update Adv-Dec latest point
    const advDecArr = currentIndicators.advDec.series;
    if (advDecArr.length > 0) {
      const lastIdx = advDecArr.length - 1;
      advDecArr[lastIdx] = {
        ...advDecArr[lastIdx],
        niftyWowChange: liveNiftyPct,
        advDecRatioWeeklyAvg: newAdr,
        advances: newAdv,
        declines: newDec,
      };
      currentIndicators.advDec.endNiftyWow = liveNiftyPct;
      currentIndicators.advDec.endAdvDec = newAdr;
    }
  }

  return {
    indices: currentIndianQuotes,
    stocks: currentIndianStocks,
    breadth: currentBreadth,
    indicators: currentIndicators,
  };
}

/**
 * Automatically calculate comprehensive weekly trends for Indian market models
 * Dynamically evaluates Nifty WoW performance, LWTD aerodynamic vector,
 * MWPL rollover momentum, cash market advance/decline breadth, and projected trading volatility band.
 */
export function calculateAutomatedWeeklyTrend(
  niftyQuote: IndianIndexQuote,
  breadth: IndianMarketBreadth,
  indicators: IndianMarketIndicatorsDataset,
  vixPrice = 13.85
): AutomatedWeeklyTrend {
  // Baseline prior Friday close for the current weekly candle calculation
  const priorWeekClose = 24130.0;
  const currentPrice = niftyQuote?.price || 24200.0;
  const weeklyReturn = parseFloat((((currentPrice - priorWeekClose) / priorWeekClose) * 100).toFixed(2));
  const weeklyPointChange = parseFloat((currentPrice - priorWeekClose).toFixed(2));
  const trendDir: "bullish" | "bearish" | "neutral" =
    weeklyReturn > 0.2 ? "bullish" : weeklyReturn < -0.2 ? "bearish" : "neutral";

  // 1. LWTD Aerodynamic Vector
  const lwtdSeries = indicators?.lwtd?.series || [];
  const currentLWTD = indicators?.lwtd?.endLWTD ?? (lwtdSeries[lwtdSeries.length - 1]?.niftyLWTD ?? -0.10);
  const recent4Lwtd = lwtdSeries.slice(-4).map((d) => d.niftyLWTD);
  const lwtd4WeekAvg = parseFloat(
    (recent4Lwtd.reduce((a, b) => a + b, 0) / (recent4Lwtd.length || 1)).toFixed(2)
  );
  const lwtdRegime = currentLWTD > 0.05 ? "Positive Lift" : currentLWTD < -0.05 ? "Sub-Zero Drag" : "Neutral Drift";
  const advances = breadth?.advances || 1142;
  const declines = breadth?.declines || 1518;
  const totalTraded = breadth?.totalTraded || (advances + declines);
  const liftScore = Math.round(Math.max(10, Math.min(92, (advances / (totalTraded || 1)) * 100)));
  const dragScore = 100 - liftScore;

  // 2. MWPL Leverage & Rollover Momentum
  const mwplSeries = indicators?.mwpl?.series || [];
  const currentMWPL = indicators?.mwpl?.endMWPL ?? 51.20;
  const priorMWPL = mwplSeries.length >= 2 ? mwplSeries[mwplSeries.length - 2].mwplPercent : 50.40;
  const mwplWeeklyChange = parseFloat((currentMWPL - priorMWPL).toFixed(2));
  const daysToExpiry = 12; // Standard NSE F&O cycle
  const mwplBias = mwplWeeklyChange > 0.8
    ? "Aggressive Leverage Expansion"
    : currentMWPL < 52
    ? "Defensive De-leveraging"
    : "Steady Rollover";

  // 3. Cash Market ADR Breadth Ratio
  const currentADR = indicators?.advDec?.endAdvDec ?? breadth?.adrRatio ?? 0.75;
  const advDecSeries = indicators?.advDec?.series || [];
  const recent4Adr = advDecSeries.slice(-4).map((d) => d.advDecRatioWeeklyAvg);
  const adr4WeekAvg = parseFloat(
    (recent4Adr.reduce((a, b) => a + b, 0) / (recent4Adr.length || 1)).toFixed(2)
  );
  const adrDivergence = parseFloat((((currentADR - 1.0) / 1.0) * 100).toFixed(1));
  const breadthStatus = currentADR >= 1.15
    ? "Broad Accumulation"
    : currentADR <= 0.85
    ? "Institutional Distribution"
    : "Selective Dispersion";

  // 4. Synthesized Regime
  let regime = "Defensive Consolidation / Subdued Breadth";
  let primaryBias = "Cautious Hedging";
  if (currentLWTD > 0.1 && weeklyReturn > 0.5 && currentADR > 1.1) {
    regime = "Aerodynamic Bullish Thrust";
    primaryBias = "Aggressive Buy-on-Dips";
  } else if (currentLWTD >= 0 && weeklyReturn >= 0) {
    regime = "Mild Accumulation / Selective Momentum";
    primaryBias = "Overweight Quality Leaders";
  } else if (currentLWTD < -0.15 || currentADR < 0.7) {
    regime = "Severe Aerodynamic Drag / Downside Risk";
    primaryBias = "Defensive Collar & Cash Preservation";
  }

  // Volatility Cone based on India VIX
  const weeklyStdDev = vixPrice / Math.sqrt(52) / 100;
  const expectedPoints = Math.round(currentPrice * weeklyStdDev);
  const projectedLow = Math.round(currentPrice - expectedPoints);
  const projectedHigh = Math.round(currentPrice + expectedPoints);
  const supportLevel = Math.round(currentPrice * 0.985);
  const resistanceLevel = Math.round(currentPrice * 1.015);

  const confidence = Math.min(
    96,
    Math.max(68, Math.round(76 + Math.abs(currentLWTD) * 32 + Math.abs(weeklyReturn) * 4))
  );

  const executiveSummary =
    currentLWTD < 0
      ? `Automated weekly calculation establishes a "${regime}" regime. Aerodynamic drag (${dragScore}%) outweighs upward thrust (${liftScore}%), and MWPL utilization (${currentMWPL.toFixed(1)}%) indicates disciplined long unwinding. Price is trading near ₹${currentPrice.toLocaleString("en-IN")}, with intermediate resistance anchored at ₹${resistanceLevel.toLocaleString("en-IN")} and primary support collar at ₹${supportLevel.toLocaleString("en-IN")}.`
      : `Automated weekly calculation confirms a "${regime}" posture. Positive aerodynamic lift (${liftScore}%) is outpacing drag (${dragScore}%), with market breadth supporting rotation towards ₹${projectedHigh.toLocaleString("en-IN")}.`;

  const actionableConclusions = [
    `Maintain disciplined stop buffers: algorithmic risk band spans ₹${projectedLow.toLocaleString("en-IN")} — ₹${projectedHigh.toLocaleString("en-IN")}`,
    `Market Breadth ADR is ${currentADR.toFixed(2)} (${adrDivergence}% divergence against parity; ${advances} Adv vs ${declines} Dec)`,
    `F&O Position limits indicate ${mwplBias} with ${daysToExpiry} days remaining until monthly NSE settlement`,
  ];

  const calcTimestamp = new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return {
    calculatedAt: calcTimestamp,
    regime,
    confidenceScore: confidence,
    algorithmicSynthesis: {
      executiveSummary,
      actionableConclusions,
      primaryBias,
    },
    niftyTrend: {
      trendDirection: trendDir,
      currentClose: currentPrice,
      priorWeekClose,
      wowPointChange: weeklyPointChange,
      wowPercentChange: weeklyReturn,
    },
    lwtdAerodynamic: {
      currentLWTD,
      weeklyMovingAverage: lwtd4WeekAvg,
      regime: lwtdRegime,
      liftVsDragRatio: {
        liftPercent: liftScore,
        dragPercent: dragScore,
      },
    },
    mwplRollover: {
      currentMWPL,
      priorMWPL,
      weeklyShiftPercent: mwplWeeklyChange,
      daysToExpiry,
      swingTraderBias: mwplBias,
    },
    advanceDeclineBreadth: {
      currentRatio: currentADR,
      status: breadthStatus,
      breadthDivergencePercent: adrDivergence,
      advancesCount: advances,
      declinesCount: declines,
    },
    expectedVolatilityCone: {
      vixLevel: vixPrice,
      projectedWeeklyRange: {
        lower: projectedLow,
        upper: projectedHigh,
        supportLevel,
        resistanceLevel,
        expectedPointsMove: expectedPoints,
        expectedPercentageMove: parseFloat((weeklyStdDev * 100).toFixed(2)),
      },
    },
    // Backward compatibility fields
    niftyCurrentPrice: currentPrice,
    niftyPriorWeekClose: priorWeekClose,
    niftyWeeklyReturn: weeklyReturn,
    niftyWeeklyTrendDirection: trendDir === "bullish" ? "BULLISH" : trendDir === "bearish" ? "BEARISH" : "NEUTRAL",
    currentLWTD,
    lwtd4WeekAvg,
    lwtdRegime: currentLWTD > 0.05 ? "POSITIVE_LIFT" : currentLWTD < -0.05 ? "SUB_ZERO_DRAG" : "NEUTRAL_DRIFT",
    liftScore,
    dragScore,
    currentMWPL,
    priorWeekMWPL: priorMWPL,
    mwplWeeklyChange,
    mwplStatus: mwplWeeklyChange > 0.8 ? "EXPANDING_LEVERAGE" : currentMWPL < 52 ? "DELEVERAGING_DEFENSIVE" : "EXPIRY_ROLLOVER",
    daysToExpiry,
    currentADR,
    adr4WeekAvg,
    adrBreadthDivergence: adrDivergence,
    breadthStatus: currentADR >= 1.15 ? "BROAD_ACCUMULATION" : currentADR <= 0.85 ? "HEAVY_DISTRIBUTION" : "SELECTIVE_ROTATION",
    primaryWeeklyBias: "DEFENSIVE_CONSOLIDATION",
    projectedRangeLow: projectedLow,
    projectedRangeHigh: projectedHigh,
    keyDrivers: actionableConclusions,
    actionableSummary: executiveSummary,
  };
}
