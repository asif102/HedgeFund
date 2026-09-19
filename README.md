# Quantum Alpha Capital

## Overview

Quantum Alpha Capital is a React + TypeScript dashboard for a multi-agent AI hedge fund workflow. The application models an institutional research desk that evaluates a target stock or theme, runs multi-agent research analysis, reviews sector rotation, tracks live market feed data, and simulates historical strategy performance. The Agent Should comes up with some Hedging Strategy when the macro changes .

The project blends:

- AI-powered research analysis using Google Gemini
- Live market price and news feed simulation
- Multi-phase investment research workflow
- Backtesting for candidate strategies
- Sector and macro screening
- Indian equity desk and market context
- Hedging Stategy

---

## Core Requirements

### 1. Multi-agent investment workflow
The platform is designed around a hedge-fund-like analyst team with distinct roles, including:

- CIO
- Equity Analyst
- CTO
- Macro Strategist
- CRO

These agents produce structured research outputs across the investment lifecycle.

### 2. AI-assisted stock analysis
Users can search for a company, ticker, or concept. The app attempts to analyze it through a backend API using Gemini,
with fallback benchmark coverage if the API is unavailable or rate-limited.

### 3. Structured investment output
The analysis result includes:

- Target and category
- Summary snapshot
- Phase 1 segregated research
- Phase 2 internal debate
- Phase 3 memorandum

### 4. Live market data integration
The app supports:

- real-time quote refresh
- market data polling and countdown-based auto-refresh
- live Finviz-backed market metadata fallback
- price, change, volume, market cap, and sector fields

### 5. Research and decision support
The dashboard includes modules for:

- sector rotation analysis
- historical backtesting
- scenario modeling
- news feed tracking
- Indian market desk
- target search and benchmark selection

### 6. Resilient service behavior
The backend is built to degrade gracefully when external services are unavailable:

- missing Gemini API key falls back to archived benchmark data
- finviz fetch failures use synthesized institutional data
- cached responses reduce repeated external calls

---

## Technology Stack

- React 19
- TypeScript
- Vite
- Express server
- Google GenAI SDK
- Recharts for charting
- Lucide icons
- Tailwind CSS support via Vite plugin

---

## Project Structure

```text
HedgeFund/
├── index.html
├── metadata.json
├── package.json
├── server.ts
├── tsconfig.json
├── vite.config.ts
├── src/
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   ├── types.ts
│   └── components/
│       ├── AgentRosterHeader.tsx
│       ├── FinvizSectorRotation.tsx
│       ├── HistoricalBacktester.tsx
│       ├── IndianEquityDesk.tsx
│       ├── LiveFinancialNewsFeed.tsx
│       ├── LiveMarketFeedBar.tsx
│       ├── MintChartRenderer.tsx
│       ├── Phase1SegregatedResearch.tsx
│       ├── Phase2InternalDebate.tsx
│       ├── Phase3Memorandum.tsx
│       ├── ScenarioModeling.tsx
│       ├── SummarySnapshotBar.tsx
│       ├── SwarmLensAnimation.tsx
│       └── TargetSearchBar.tsx
│   └── data/
│       ├── backtestEngine.ts
│       ├── benchmarkCases.ts
│       ├── finvizSectorData.ts
│       ├── indianMarketService.ts
│       └── marketDataService.ts
```

### Key files

- `server.ts` – Express API server and live data proxy logic
- `src/App.tsx` – top-level app state, analysis flow, tab switching, and live market refresh logic
- `src/types.ts` – shared types for agents, analysis outputs, market data, and backtest strategy models
- `src/data/benchmarkCases.ts` – default benchmark and institutional case data
- `src/data/marketDataService.ts` – market quote/news fetch utilities
- `src/data/finvizSectorData.ts` – sector rotation payload generation

---

## Functional Modules

### Target search and analysis
The app allows users to input a stock or concept, then resolves it to a benchmark or triggers AI analysis. It supports known cases such as:

- NVDA
- ASML
- TSLA
- PLTR
- MSFT
- AAPL
- AMD
- GOOGL
- AMZN
- META

### Market feed
The dashboard displays quote information, price movement, volume, market cap, and timing data for the active symbol.

### Research phases
The workflow is organized into stages:

1. Phase 1: segregated research
2. Phase 2: internal debate
3. Phase 3: final memorandum

### Backtesting
The historical backtester uses strategy types such as:

- agentic consensus
- CIO momentum
- equity value
- CTO breakout
- macro regime
- CRO hedge
- EMA crossover
- RSI Bollinger
- momentum breakout

### Scenario and macro tools
The app includes scenario modeling and market rotation views to evaluate portfolio and sector conditions.

### India market desk
A dedicated Indian equity desk provides localized research and market context for Indian equity data flows.

---

## Environment and Setup

### Install dependencies

```bash
npm install
```

### Start the app in development mode

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

### Start the production server

```bash
npm start
```

### Type checking

```bash
npm run lint
```

---

## Required environment variables

The server expects a Gemini API key when using live AI analysis:

```bash
GEMINI_API_KEY=your_key_here
```

If the key is missing, the app still loads institutional benchmark data and uses fallback workflows rather than failing completely.

---

## Runtime Notes

- The app runs through an Express server and Vite integration.
- The backend endpoint `/api/analyze` is used for AI-based analysis requests.
- Live external data is protected using cached Finviz responses and fallback synthesized values.
- The UI is designed as a single-page research dashboard rather than a conventional trading application.

---

## Summary

This project is a research-driven, hedge-fund simulation platform that combines AI analysis, market intelligence, and portfolio strategy workflows into a single dashboard. It is intended to emulate an institutional investment team with analyst-level research, debate, and decision support.
