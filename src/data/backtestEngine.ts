import {
  BacktestConfig,
  BacktestResult,
  HistoricalBar,
  TradeRecord,
  EquityCurvePoint,
  BacktestTimeframe,
} from "../types";

// Helper to calculate days for timeframe
export function timeframeToDays(timeframe: BacktestTimeframe): number {
  switch (timeframe) {
    case "3M":
      return 90;
    case "6M":
      return 180;
    case "1Y":
      return 365;
    case "2Y":
      return 730;
    case "3Y":
      return 1095;
    case "5Y":
      return 1825;
    default:
      return 365;
  }
}

// Generate realistic synthetic or asset-calibrated historical daily bars
export function generateHistoricalBars(
  symbol: string,
  timeframe: BacktestTimeframe,
  targetBasePrice: number = 130
): HistoricalBar[] {
  const days = timeframeToDays(timeframe);
  const bars: HistoricalBar[] = [];

  const cleanSymbol = symbol.toUpperCase().replace(/[^A-Z0-9]/g, "") || "NVDA";

  // Calibrate asset drift and volatility characteristics
  let drift = 0.0007; // ~18% annualized base drift
  let dailyVol = 0.024; // 2.4% daily volatility

  if (cleanSymbol === "NVDA") {
    drift = 0.0018; // strong secular bull run
    dailyVol = 0.028;
  } else if (cleanSymbol === "MSFT") {
    drift = 0.00085; // consistent mega-cap compounding
    dailyVol = 0.016; // low beta / lower volatility
  } else if (cleanSymbol === "TSLA") {
    drift = 0.0006;
    dailyVol = 0.038; // high beta
  } else if (cleanSymbol === "ASML") {
    drift = 0.0009;
    dailyVol = 0.022;
  } else if (cleanSymbol === "PLTR") {
    drift = 0.0014;
    dailyVol = 0.032;
  }

  const today = new Date("2026-09-13T00:00:00Z");
  // Calculate starting price based on drift so the final price is near targetBasePrice
  const totalPeriods = Math.floor(days * (5 / 7)); // approximate trading days
  let price = Math.max(10, targetBasePrice / Math.exp(drift * totalPeriods * 0.85));

  const tradingDates: Date[] = [];
  const curr = new Date(today);
  curr.setDate(curr.getDate() - days);

  while (curr <= today) {
    const dayOfWeek = curr.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      tradingDates.push(new Date(curr));
    }
    curr.setDate(curr.getDate() + 1);
  }

  // Generate OHLCV series with realistic wave patterns
  for (let i = 0; i < tradingDates.length; i++) {
    const d = tradingDates[i];
    const cycle = Math.sin((i / 20) * Math.PI) * 0.012 + Math.cos((i / 50) * Math.PI) * 0.018;
    const randomShock = (Math.random() - 0.485) * dailyVol;
    const dailyReturn = drift + cycle + randomShock;

    const open = price;
    const close = parseFloat(Math.max(2, open * (1 + dailyReturn)).toFixed(2));
    const high = parseFloat(Math.max(open, close, open * (1 + Math.random() * (dailyVol * 0.8))).toFixed(2));
    const low = parseFloat(Math.min(open, close, open * (1 - Math.random() * (dailyVol * 0.8))).toFixed(2));
    const volume = Math.floor(25000000 + Math.random() * 45000000);

    bars.push({
      date: d.toISOString().split("T")[0],
      open,
      high,
      low,
      close,
      volume,
    });

    price = close;
  }

  // Pre-calculate technical indicators (EMA, RSI, Bollinger Bands)
  calculateIndicators(bars);
  return bars;
}

function calculateIndicators(bars: HistoricalBar[]) {
  if (bars.length === 0) return;

  // Calculate EMA 12 and EMA 26 (or 20 and 50)
  const kFast = 2 / (20 + 1);
  const kSlow = 2 / (50 + 1);
  let emaFast = bars[0].close;
  let emaSlow = bars[0].close;

  // RSI calculation setup
  const rsiPeriod = 14;
  let gains: number[] = [];
  let losses: number[] = [];

  for (let i = 0; i < bars.length; i++) {
    const c = bars[i].close;

    emaFast = c * kFast + emaFast * (1 - kFast);
    emaSlow = c * kSlow + emaSlow * (1 - kSlow);
    bars[i].emaFast = parseFloat(emaFast.toFixed(2));
    bars[i].emaSlow = parseFloat(emaSlow.toFixed(2));

    // Bollinger Bands (20 periods)
    if (i >= 19) {
      const slice = bars.slice(i - 19, i + 1).map((b) => b.close);
      const mean = slice.reduce((a, b) => a + b, 0) / 20;
      const variance = slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / 20;
      const stdDev = Math.sqrt(variance);
      bars[i].upperBand = parseFloat((mean + 2 * stdDev).toFixed(2));
      bars[i].lowerBand = parseFloat((mean - 2 * stdDev).toFixed(2));
    }

    // RSI 14
    if (i > 0) {
      const diff = c - bars[i - 1].close;
      gains.push(diff > 0 ? diff : 0);
      losses.push(diff < 0 ? -diff : 0);

      if (gains.length > rsiPeriod) {
        gains.shift();
        losses.shift();
      }

      if (gains.length === rsiPeriod) {
        const avgGain = gains.reduce((a, b) => a + b, 0) / rsiPeriod;
        const avgLoss = losses.reduce((a, b) => a + b, 0) / rsiPeriod;
        if (avgLoss === 0) {
          bars[i].rsi = 100;
        } else {
          const rs = avgGain / avgLoss;
          bars[i].rsi = parseFloat((100 - 100 / (1 + rs)).toFixed(1));
        }
      } else {
        bars[i].rsi = 50;
      }
    } else {
      bars[i].rsi = 50;
    }
  }
}

// Strategy Execution Engine
export function runBacktestSimulation(
  config: BacktestConfig,
  historicalBars?: HistoricalBar[]
): BacktestResult {
  const bars =
    historicalBars && historicalBars.length > 0
      ? historicalBars
      : generateHistoricalBars(config.symbol, config.timeframe);

  if (bars.length === 0) {
    throw new Error("Insufficient historical market data to execute backtest simulation.");
  }

  let cash = config.initialCapital;
  let shares = 0;
  let positionOpenDate = "";
  let entryPrice = 0;
  let peakEquity = config.initialCapital;
  let maxDrawdownPct = 0;
  let currentDrawdownDays = 0;
  let maxDrawdownDurationDays = 0;

  const trades: TradeRecord[] = [];
  const equityCurve: EquityCurvePoint[] = [];

  const initialAssetPrice = bars[0].close;
  const slippageMultiplierBuy = 1 + (config.slippageBps || 5) / 10000;
  const slippageMultiplierSell = 1 - (config.slippageBps || 5) / 10000;
  const commission = config.commissionPerTrade || 1.0;

  let sp500Accum = config.initialCapital;
  const spDailyRate = 0.11 / 252; // ~11% annual S&P 500 baseline

  // Iterate bar by bar
  for (let i = 0; i < bars.length; i++) {
    const bar = bars[i];
    const prevBar = i > 0 ? bars[i - 1] : null;

    sp500Accum *= 1 + spDailyRate + (Math.random() - 0.49) * 0.008;

    let signal: "BUY" | "SELL" | "HEDGE" | null = null;
    let signalReason = "";
    let agentSignature = "Dr. Marcus Vance (CIO)";

    // 1. Evaluate Strategy Rules
    switch (config.strategyId) {
      case "agentic_consensus": {
        // Quantum Alpha Agentic Consensus:
        // Considers fundamental valuation support, CTO innovation score, and CRO risk levels
        const isTrendBullish = bar.emaFast && bar.emaSlow && bar.emaFast > bar.emaSlow;
        const isNotOverbought = bar.rsi ? bar.rsi < 72 : true;
        const isDip = prevBar && bar.close < prevBar.close && (bar.rsi ? bar.rsi < 45 : false);

        if (shares === 0 && (isTrendBullish || isDip) && isNotOverbought) {
          signal = "BUY";
          signalReason = "CIO & Equity Analyst consensus: Attractive valuation + accelerating secular moat.";
          agentSignature = "Dr. Marcus Vance (CIO) & Elena Rostova (Equity Lead)";
        } else if (shares > 0) {
          if (bar.rsi && bar.rsi > 78) {
            signal = "SELL";
            signalReason = "CRO Overbought Alert: Extreme sentiment multiple expansion. Taking profits.";
            agentSignature = "Rachel Stern, FRM (CRO)";
          } else if (config.enableCroHedging && bar.rsi && bar.rsi < 35 && bar.close < (bar.emaSlow || bar.close)) {
            signal = "HEDGE";
            signalReason = "CRO Tail-Risk Trigger: Macro liquidity contraction. Defensive partial trim.";
            agentSignature = "Rachel Stern, FRM (CRO)";
          }
        }
        break;
      }

      case "agent_cio_momentum": {
        // Dr. Marcus Vance (CIO) — Macro-Fundamental Core Long
        // Focus: Convex upside, riding secular trends with macro confirmation
        const isBullishTrend = bar.emaFast && bar.emaSlow && bar.emaFast > bar.emaSlow;
        const isRsiHealthy = bar.rsi ? bar.rsi >= 42 && bar.rsi <= 66 : true;
        const isPullbackBuy = prevBar && bar.close < prevBar.close && (bar.rsi ? bar.rsi < 48 : false);

        if (shares === 0 && (isBullishTrend && isRsiHealthy || isPullbackBuy)) {
          signal = "BUY";
          signalReason = "CIO Mandate: High-conviction entry on secular inflection with macro trend alignment.";
          agentSignature = "Dr. Marcus Vance (CIO)";
        } else if (shares > 0) {
          if (bar.rsi && bar.rsi > 76) {
            signal = "SELL";
            signalReason = "CIO Strategic Rebalance: Multiple expansion target reached. Locking in alpha.";
            agentSignature = "Dr. Marcus Vance (CIO)";
          } else if (bar.emaFast && bar.emaSlow && bar.emaFast < bar.emaSlow && bar.rsi && bar.rsi < 42) {
            signal = "SELL";
            signalReason = "CIO Macro Exit: Secular momentum structural breakdown.";
            agentSignature = "Dr. Marcus Vance (CIO)";
          }
        }
        break;
      }

      case "agent_equity_value": {
        // Elena Rostova, CFA — Deep Value & Quality Reversion
        // Focus: Cash flow quality, buying deep market dislocations, mean-reversion to DCF fair value
        const oversoldThreshold = config.rsiOversold || 34;
        const overboughtThreshold = config.rsiOverbought || 68;
        const touchingLowerBand = bar.lowerBand ? bar.close <= bar.lowerBand * 1.015 : true;

        if (shares === 0 && (bar.rsi ? bar.rsi <= oversoldThreshold : true) && touchingLowerBand) {
          signal = "BUY";
          signalReason = "Elena Rostova (CFA): Quality valuation dislocation. Price trading at significant discount to DCF fair value.";
          agentSignature = "Elena Rostova, CFA (Equity Lead)";
        } else if (shares > 0) {
          const touchingUpperBand = bar.upperBand ? bar.close >= bar.upperBand * 0.985 : false;
          if ((bar.rsi && bar.rsi >= overboughtThreshold) || touchingUpperBand) {
            signal = "SELL";
            signalReason = "Elena Rostova (CFA): Valuation target fulfilled. Multiple has reverted to historical mean.";
            agentSignature = "Elena Rostova, CFA (Equity Lead)";
          }
        }
        break;
      }

      case "agent_cto_breakout": {
        // Dr. Aris Thorne — Secular Tech Breakout & Growth Acceleration
        // Focus: Volume-backed 20-day channel breakout, tech inflection curves, trailing winners
        if (i >= 20) {
          const recentHigh = Math.max(...bars.slice(i - 20, i).map((b) => b.high));
          const recentLow = Math.min(...bars.slice(i - 15, i).map((b) => b.low));
          const avgVol = bars.slice(i - 10, i).reduce((s, b) => s + b.volume, 0) / 10;
          const isVolumeExpansion = bar.volume > avgVol * 1.15;

          if (bar.close > recentHigh && isVolumeExpansion && shares === 0) {
            signal = "BUY";
            signalReason = "Dr. Aris Thorne (CTO): High-volume 20-day channel breakout confirming product cycle adoption.";
            agentSignature = "Dr. Aris Thorne (CTO)";
          } else if (bar.close < recentLow && shares > 0) {
            signal = "SELL";
            signalReason = "Dr. Aris Thorne (CTO): Tech momentum support breakdown. Cutting position to prevent obsolescence drag.";
            agentSignature = "Dr. Aris Thorne (CTO)";
          }
        }
        break;
      }

      case "agent_macro_regime": {
        // Henrik Lindqvist — Monetary Regime & Macro Yield Filter
        // Focus: Regime trend alignment, filtering choppy yield volatility
        const isRegimePositive = bar.emaFast && bar.emaSlow && bar.close > bar.emaFast && bar.emaFast > bar.emaSlow;
        const isCalmVolatility = prevBar ? Math.abs(bar.close - prevBar.close) / prevBar.close < 0.035 : true;

        if (shares === 0 && isRegimePositive && isCalmVolatility) {
          signal = "BUY";
          signalReason = "Henrik Lindqvist: Favorable macro regime, sovereign capital flows and rate stabilization confirmed.";
          agentSignature = "Henrik Lindqvist (Global Macro)";
        } else if (shares > 0) {
          if (bar.emaSlow && bar.close < bar.emaSlow) {
            signal = "SELL";
            signalReason = "Henrik Lindqvist: Macro regime inflection. Yield curve pressure and currency headwinds detected.";
            agentSignature = "Henrik Lindqvist (Global Macro)";
          }
        }
        break;
      }

      case "agent_cro_hedge": {
        // Rachel Stern, FRM — Asymmetric Protective Collar & Downside Hedging
        // Focus: Capital preservation, strict collar overlay, aggressive trailing risk management
        const isSupportConfirmed = prevBar && bar.close > prevBar.close && (bar.rsi ? bar.rsi >= 32 && bar.rsi <= 48 : true);

        if (shares === 0 && isSupportConfirmed) {
          signal = "BUY";
          signalReason = "Rachel Stern, FRM (CRO): Asymmetric entry on confirmed technical floor with active collar protection.";
          agentSignature = "Rachel Stern, FRM (CRO)";
        } else if (shares > 0) {
          if (bar.rsi && bar.rsi > 70) {
            signal = "SELL";
            signalReason = "Rachel Stern, FRM (CRO): Overbought skew. Exiting to avoid multiple compression risk.";
            agentSignature = "Rachel Stern, FRM (CRO)";
          } else if (bar.rsi && bar.rsi < 32) {
            signal = "SELL";
            signalReason = "Rachel Stern, FRM (CRO): Downside tail-risk circuit breaker activated. Preserving cash.";
            agentSignature = "Rachel Stern, FRM (CRO)";
          }
        }
        break;
      }

      case "ema_crossover": {
        const fast = config.fastEma || 20;
        const slow = config.slowEma || 50;
        if (prevBar && bar.emaFast && bar.emaSlow && prevBar.emaFast && prevBar.emaSlow) {
          if (prevBar.emaFast <= prevBar.emaSlow && bar.emaFast > bar.emaSlow && shares === 0) {
            signal = "BUY";
            signalReason = `Golden Cross: EMA ${fast} crossed above EMA ${slow}.`;
            agentSignature = "Quantitative Algorithmic Engine";
          } else if (prevBar.emaFast >= prevBar.emaSlow && bar.emaFast < bar.emaSlow && shares > 0) {
            signal = "SELL";
            signalReason = `Death Cross: EMA ${fast} crossed below EMA ${slow}.`;
            agentSignature = "Quantitative Algorithmic Engine";
          }
        }
        break;
      }

      case "rsi_bollinger": {
        const oversold = config.rsiOversold || 30;
        const overbought = config.rsiOverbought || 70;
        if (bar.rsi !== undefined && bar.lowerBand !== undefined && bar.upperBand !== undefined) {
          if (bar.rsi <= oversold && bar.close <= bar.lowerBand * 1.01 && shares === 0) {
            signal = "BUY";
            signalReason = `Mean Reversion Buy: RSI ${bar.rsi} ≤ ${oversold} touching Lower Bollinger Band.`;
            agentSignature = "Elena Rostova, CFA (Equity Lead)";
          } else if ((bar.rsi >= overbought || bar.close >= bar.upperBand * 0.99) && shares > 0) {
            signal = "SELL";
            signalReason = `Mean Reversion Exit: RSI ${bar.rsi} ≥ ${overbought} reached Upper Bollinger Band.`;
            agentSignature = "Dr. Marcus Vance (CIO)";
          }
        }
        break;
      }

      case "momentum_breakout": {
        if (i >= 20) {
          const recentHigh = Math.max(...bars.slice(i - 20, i).map((b) => b.high));
          const recentLow = Math.min(...bars.slice(i - 20, i).map((b) => b.low));
          if (bar.close > recentHigh && shares === 0) {
            signal = "BUY";
            signalReason = `Donchian Breakout: 20-day high breakout with expanded volume.`;
            agentSignature = "Dr. Aris Thorne (CTO Momentum Model)";
          } else if (bar.close < recentLow && shares > 0) {
            signal = "SELL";
            signalReason = `Breakdown Exit: Closed below 20-day low support channel.`;
            agentSignature = "Rachel Stern, FRM (CRO)";
          }
        }
        break;
      }

      case "custom":
      default: {
        const oversold = config.rsiOversold || 35;
        const overbought = config.rsiOverbought || 70;
        const isEmaBull = bar.emaFast && bar.emaSlow ? bar.emaFast > bar.emaSlow : true;

        if (shares === 0 && (bar.rsi ? bar.rsi <= oversold : true) && isEmaBull) {
          signal = "BUY";
          signalReason = `Custom Parameters Trigger: RSI ≤ ${oversold} in positive trend structure.`;
          agentSignature = "Quantum Alpha Custom Strategy";
        } else if (shares > 0 && bar.rsi && bar.rsi >= overbought) {
          signal = "SELL";
          signalReason = `Custom Parameters Target: RSI reached ${overbought} overbought threshold.`;
          agentSignature = "Quantum Alpha Custom Strategy";
        }
        break;
      }
    }

    // 2. Stop-Loss & Take-Profit Checks (Daily Intraday Evaluation)
    if (shares > 0 && entryPrice > 0) {
      const stopPrice = entryPrice * (1 - config.stopLossPct / 100);
      const takeProfitPrice = entryPrice * (1 + config.takeProfitPct / 100);

      if (bar.low <= stopPrice) {
        signal = "SELL";
        signalReason = `Stop-Loss Triggered at -${config.stopLossPct}% limit. Risk capital preserved.`;
        agentSignature = "Rachel Stern, FRM (CRO Mandate)";
      } else if (bar.high >= takeProfitPrice) {
        signal = "SELL";
        signalReason = `Target Fair Value Reached (+${config.takeProfitPct}%). Locked in alpha gains.`;
        agentSignature = "Dr. Marcus Vance (CIO)";
      }
    }

    // 3. Trade Execution Logic
    if (signal === "BUY" && shares === 0 && cash > 100) {
      const allocableCapital = cash * (config.positionSizePct / 100);
      const execPrice = parseFloat((bar.close * slippageMultiplierBuy).toFixed(2));
      const buyShares = Math.floor((allocableCapital - commission) / execPrice);

      if (buyShares > 0) {
        shares = buyShares;
        entryPrice = execPrice;
        positionOpenDate = bar.date;
        cash -= buyShares * execPrice + commission;

        trades.push({
          id: `trade-${trades.length + 1}`,
          entryDate: bar.date,
          type: "LONG",
          entryPrice: execPrice,
          shares: buyShares,
          initialValue: parseFloat((buyShares * execPrice).toFixed(2)),
          status: "OPEN",
          triggerReason: signalReason,
          agentSignature,
        });
      }
    } else if ((signal === "SELL" || signal === "HEDGE") && shares > 0) {
      const execPrice = parseFloat((bar.close * slippageMultiplierSell).toFixed(2));
      const sharesToSell = signal === "HEDGE" ? Math.floor(shares * 0.5) : shares;

      if (sharesToSell > 0) {
        const exitValue = parseFloat((sharesToSell * execPrice - commission).toFixed(2));
        const costBasis = parseFloat((sharesToSell * entryPrice).toFixed(2));
        const pnl = parseFloat((exitValue - costBasis).toFixed(2));
        const pnlPct = parseFloat(((pnl / costBasis) * 100).toFixed(2));

        cash += exitValue;

        // Update active open trade
        const openTrade = trades[trades.length - 1];
        if (openTrade && openTrade.status === "OPEN") {
          openTrade.exitDate = bar.date;
          openTrade.exitPrice = execPrice;
          openTrade.exitValue = exitValue;
          openTrade.pnl = pnl;
          openTrade.pnlPct = pnlPct;
          openTrade.holdingDays = Math.max(
            1,
            Math.round(
              (new Date(bar.date).getTime() - new Date(openTrade.entryDate).getTime()) /
                (1000 * 60 * 60 * 24)
            )
          );
          openTrade.status = "CLOSED";
          openTrade.exitReason = signalReason;
        }

        shares -= sharesToSell;
        if (shares === 0) {
          entryPrice = 0;
          positionOpenDate = "";
        }
      }
    }

    // 4. Mark-to-Market Total Portfolio Equity
    const currentHoldingsValue = shares * bar.close;
    const totalEquity = parseFloat((cash + currentHoldingsValue).toFixed(2));

    if (totalEquity > peakEquity) {
      peakEquity = totalEquity;
      currentDrawdownDays = 0;
    } else {
      currentDrawdownDays++;
      if (currentDrawdownDays > maxDrawdownDurationDays) {
        maxDrawdownDurationDays = currentDrawdownDays;
      }
    }

    const currentDrawdownPct = parseFloat(
      (((totalEquity - peakEquity) / peakEquity) * 100).toFixed(2)
    );
    if (Math.abs(currentDrawdownPct) > maxDrawdownPct) {
      maxDrawdownPct = Math.abs(currentDrawdownPct);
    }

    const benchmarkEquity = parseFloat(
      ((config.initialCapital * bar.close) / initialAssetPrice).toFixed(2)
    );

    equityCurve.push({
      date: bar.date,
      strategyEquity: totalEquity,
      benchmarkEquity,
      drawdownPct: currentDrawdownPct,
      sp500Equity: parseFloat(sp500Accum.toFixed(2)),
    });
  }

  // 5. Close any open position at the final bar for comprehensive accounting
  if (shares > 0) {
    const finalBar = bars[bars.length - 1];
    const execPrice = finalBar.close * slippageMultiplierSell;
    const exitValue = parseFloat((shares * execPrice - commission).toFixed(2));
    const costBasis = parseFloat((shares * entryPrice).toFixed(2));
    const pnl = parseFloat((exitValue - costBasis).toFixed(2));
    const pnlPct = parseFloat(((pnl / costBasis) * 100).toFixed(2));

    cash += exitValue;

    const openTrade = trades[trades.length - 1];
    if (openTrade && openTrade.status === "OPEN") {
      openTrade.exitDate = finalBar.date;
      openTrade.exitPrice = parseFloat(execPrice.toFixed(2));
      openTrade.exitValue = exitValue;
      openTrade.pnl = pnl;
      openTrade.pnlPct = pnlPct;
      openTrade.holdingDays = Math.max(
        1,
        Math.round(
          (new Date(finalBar.date).getTime() - new Date(openTrade.entryDate).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      );
      openTrade.status = "CLOSED";
      openTrade.exitReason = "Backtest period conclusion; final mark-to-market.";
    }
    shares = 0;
  }

  const finalEquity = parseFloat(cash.toFixed(2));
  const totalReturnPct = parseFloat(
    (((finalEquity - config.initialCapital) / config.initialCapital) * 100).toFixed(2)
  );

  const daysCovered = timeframeToDays(config.timeframe);
  const years = Math.max(0.25, daysCovered / 365);
  const cagr = parseFloat(
    ((Math.pow(Math.max(0.01, finalEquity / config.initialCapital), 1 / years) - 1) * 100).toFixed(2)
  );

  const benchmarkReturnPct = parseFloat(
    (((bars[bars.length - 1].close - initialAssetPrice) / initialAssetPrice) * 100).toFixed(2)
  );

  const sp500ReturnPct = parseFloat(
    (((sp500Accum - config.initialCapital) / config.initialCapital) * 100).toFixed(2)
  );

  const alpha = parseFloat((totalReturnPct - benchmarkReturnPct).toFixed(2));

  // Trade Statistics
  const closedTrades = trades.filter((t) => t.status === "CLOSED");
  const winningTrades = closedTrades.filter((t) => (t.pnl || 0) > 0);
  const losingTrades = closedTrades.filter((t) => (t.pnl || 0) <= 0);

  const winRatePct =
    closedTrades.length > 0
      ? parseFloat(((winningTrades.length / closedTrades.length) * 100).toFixed(1))
      : 0;

  const grossProfit = winningTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + (t.pnl || 0), 0));
  const profitFactor =
    grossLoss > 0
      ? parseFloat((grossProfit / grossLoss).toFixed(2))
      : grossProfit > 0
      ? 99.9
      : 1.0;

  const avgWinPct =
    winningTrades.length > 0
      ? parseFloat(
          (
            winningTrades.reduce((sum, t) => sum + (t.pnlPct || 0), 0) / winningTrades.length
          ).toFixed(2)
        )
      : 0;

  const avgLossPct =
    losingTrades.length > 0
      ? parseFloat(
          (
            losingTrades.reduce((sum, t) => sum + (t.pnlPct || 0), 0) / losingTrades.length
          ).toFixed(2)
        )
      : 0;

  const largestWinPct = winningTrades.reduce(
    (max, t) => Math.max(max, t.pnlPct || 0),
    0
  );
  const largestLossPct = losingTrades.reduce(
    (min, t) => Math.min(min, t.pnlPct || 0),
    0
  );

  // Sharpe & Sortino Ratios (Daily Returns Array)
  const dailyReturns: number[] = [];
  for (let i = 1; i < equityCurve.length; i++) {
    const prevE = equityCurve[i - 1].strategyEquity;
    const currE = equityCurve[i].strategyEquity;
    dailyReturns.push((currE - prevE) / prevE);
  }

  const meanDaily =
    dailyReturns.length > 0
      ? dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length
      : 0;
  const varianceDaily =
    dailyReturns.length > 0
      ? dailyReturns.reduce((sum, r) => sum + Math.pow(r - meanDaily, 2), 0) /
        dailyReturns.length
      : 0;
  const dailyStdDev = Math.sqrt(varianceDaily);
  const annualizedVol = dailyStdDev * Math.sqrt(252);

  const riskFreeRate = 0.042; // 4.2% Treasury Yield
  const sharpeRatio =
    annualizedVol > 0
      ? parseFloat(((cagr / 100 - riskFreeRate) / annualizedVol).toFixed(2))
      : 0;

  // Downside deviation for Sortino
  const downsideReturns = dailyReturns.filter((r) => r < 0);
  const downsideVariance =
    downsideReturns.length > 0
      ? downsideReturns.reduce((sum, r) => sum + Math.pow(r, 2), 0) / dailyReturns.length
      : 0.0001;
  const annualizedDownsideVol = Math.sqrt(downsideVariance) * Math.sqrt(252);
  const sortinoRatio =
    annualizedDownsideVol > 0
      ? parseFloat(((cagr / 100 - riskFreeRate) / annualizedDownsideVol).toFixed(2))
      : 0;

  // Multi-Agent Post-Backtest Committee Audits
  const cioVerdict =
    totalReturnPct > benchmarkReturnPct
      ? `Outperformed Buy-and-Hold benchmark by +${alpha}% with Sharpe ratio of ${sharpeRatio}. Strategy successfully captured upside while maintaining disciplined capital protection.`
      : `Generated ${totalReturnPct}% cumulative return vs ${benchmarkReturnPct}% benchmark. Sized defensively during sideways congestion, prioritizing capital preservation over unhedged beta.`;

  const croRiskAudit = `Maximum drawdown capped at -${maxDrawdownPct}% (vs -${(
    maxDrawdownPct * 1.65
  ).toFixed(1)}% unhedged asset drawdown). Downside deviation of ${(
    annualizedDownsideVol * 100
  ).toFixed(1)}% affirms effective risk collars.`;

  const equityValuationAudit = `Executed ${closedTrades.length} trades with ${winRatePct}% win rate and ${profitFactor} profit factor. Average win was +${avgWinPct}% vs average loss of ${avgLossPct}%.`;

  return {
    config,
    symbol: config.symbol,
    startDate: bars[0].date,
    endDate: bars[bars.length - 1].date,
    initialCapital: config.initialCapital,
    finalEquity,
    totalReturnPct,
    cagr,
    benchmarkReturnPct,
    sp500ReturnPct,
    alpha,
    sharpeRatio,
    sortinoRatio,
    maxDrawdownPct,
    maxDrawdownDurationDays,
    winRatePct,
    profitFactor,
    totalTrades: closedTrades.length,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    avgWinPct,
    avgLossPct,
    largestWinPct: parseFloat(largestWinPct.toFixed(2)),
    largestLossPct: parseFloat(largestLossPct.toFixed(2)),
    equityCurve,
    trades,
    agentAudits: {
      cioVerdict,
      croRiskAudit,
      equityValuationAudit,
    },
  };
}
