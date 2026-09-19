import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Zap,
  Activity,
  Sliders,
  Maximize2,
  Minimize2,
  Shield,
  TrendingUp,
  Cpu,
  Globe,
  DollarSign,
  Layers,
  Sparkles,
  Info,
  CheckCircle2,
  Clock,
  ArrowRight,
  Terminal,
  BarChart2,
} from "lucide-react";
import { MarketQuote, SwarmCommitteeResult } from "../types";

interface AgentNode {
  id: string;
  name: string;
  codename: string;
  role: string;
  color: string;
  badgeBg: string;
  borderColor: string;
  icon: React.ReactNode;
  angle: number; // in radians
  distance: number; // normalized radius
  status: "ACTIVE" | "PROCESSING" | "QUEUED" | "DEBATING" | "SETTLED";
  metricLabel: string;
  metricValue: string;
  currentThought: string;
}

interface Particle {
  x: number;
  y: number;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  progress: number;
  speed: number;
  color: string;
  size: number;
  payloadText?: string;
  trail: { x: number; y: number; alpha: number }[];
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  alpha: number;
}

interface SwarmActivityLog {
  id: string;
  time: string;
  agent: string;
  agentColor: string;
  action: string;
  detail: string;
  delta?: string;
  deltaPositive?: boolean;
}

interface SwarmLensAnimationProps {
  quote?: MarketQuote;
  committee?: SwarmCommitteeResult | null;
  currentTarget?: string;
  onNavigateToAgent?: (agentId: string) => void;
  onNavigateToTab?: (tab: "memorandum" | "phase1" | "phase2" | "backtester" | "scenarios" | "news") => void;
}

export const SwarmLensAnimation: React.FC<SwarmLensAnimationProps> = ({
  quote,
  committee,
  currentTarget = "NVDA (NVIDIA Corporation)",
  onNavigateToAgent,
  onNavigateToTab,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [activeStage, setActiveStage] = useState<number>(2); // 0 to 5
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [timelineSec, setTimelineSec] = useState<number>(10);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [activePipelineFilter, setActivePipelineFilter] = useState<string>("ALL");

  // Simulated metrics matching the high-tech quant desk
  const [pnlValue, setPnlValue] = useState<number>(237562);
  const [winRate, setWinRate] = useState<number>(78.4);
  const [avgEdge, setAvgEdge] = useState<number>(1.78);
  const [posteriorProbability, setPosteriorProbability] = useState<number>(84.2);
  const [lensHovered, setLensHovered] = useState<boolean>(false);

  // Pipeline stages ribbon
  const stages = [
    { num: "01", name: "SPOTTER", agent: "HENRIK", label: "Macro & TSMC Regime", status: "DONE", color: "#06b6d4" },
    { num: "02", name: "PRICING", agent: "ELENA", label: "Fundamental DCF & P/E", status: "ACTIVE", color: "#f59e0b" },
    { num: "03", name: "EDGE", agent: "ARIS", label: "Silicon Architecture Moat", status: "ON DECK", color: "#ec4899" },
    { num: "04", name: "KELLY", agent: "RACHEL", label: "Tail-Risk & Position Sizing", status: "QUEUED", color: "#a855f7" },
    { num: "05", name: "TAKER", agent: "MARCUS", label: "Bayesian Consensus Engine", status: "QUEUED", color: "#3b82f6" },
    { num: "06", name: "CLOSER", agent: "ENGINE", label: "vWAP Fill & Settlement", status: "STANDBY", color: "#f97316" },
  ];

  // Agent Node Definitions arranged radially around the central "THE LENS"
  const agents: AgentNode[] = useMemo(
    () => {
      const insightIds: Record<string, string> = {
        macro_analyst: "macroStrategist",
        equity_analyst: "equityAnalyst",
        silicon_specialist: "cto",
        risk_officer: "cro",
        strategist: "cio",
      };

      return [
      {
        id: "macro_analyst",
        name: "Henrik Lindqvist",
        codename: "SPOTTER",
        role: "Global Macro & Supply Chain",
        color: "#06b6d4",
        badgeBg: "rgba(6, 182, 212, 0.15)",
        borderColor: "#0891b2",
        icon: <Globe className="w-4 h-4 text-cyan-400" />,
        angle: (Math.PI * 7) / 6, // Top-Left (~210 deg)
        distance: 0.72,
        status: "ACTIVE",
        metricLabel: "TSMC Risk Factor",
        metricValue: "LOW (0.12)",
        currentThought: "Tape confirms Taiwan Strait logistics clear; CapEx rate regime holds steady.",
      },
      {
        id: "equity_analyst",
        name: "Elena Rostova, CFA",
        codename: "PRIOR",
        role: "Equity Research & DCF",
        color: "#f59e0b",
        badgeBg: "rgba(245, 158, 11, 0.15)",
        borderColor: "#d97706",
        icon: <DollarSign className="w-4 h-4 text-amber-400" />,
        angle: Math.PI, // Mid-Left (180 deg)
        distance: 0.74,
        status: "PROCESSING",
        metricLabel: "Base DCF Fair Value",
        metricValue: quote ? `$${(quote.price * 1.15).toFixed(2)}` : "$248.50",
        currentThought: "Gross margins expand to 75.2%; PEG multiple at 0.88 implies mispricing.",
      },
      {
        id: "silicon_specialist",
        name: "Dr. Aris Thorne",
        codename: "EDGE",
        role: "Silicon Architecture & Moat",
        color: "#ec4899",
        badgeBg: "rgba(236, 72, 153, 0.15)",
        borderColor: "#db2777",
        icon: <Cpu className="w-4 h-4 text-pink-400" />,
        angle: (Math.PI * 5) / 6, // Bottom-Left (~150 deg)
        distance: 0.73,
        status: "ACTIVE",
        metricLabel: "Hardware Moat Score",
        metricValue: "96 / 100",
        currentThought: "NVLink 5.0 interconnect bandwidth creates a 24-month switching cost moat.",
      },
      {
        id: "risk_officer",
        name: "Rachel Stern, FRM",
        codename: "KELLY",
        role: "Chief Risk Officer",
        color: "#a855f7",
        badgeBg: "rgba(168, 85, 247, 0.15)",
        borderColor: "#9333ea",
        icon: <Shield className="w-4 h-4 text-purple-400" />,
        angle: (Math.PI * 11) / 6, // Top-Right (~330 deg)
        distance: 0.72,
        status: "PROCESSING",
        metricLabel: "Drawdown Guard",
        metricValue: "-4.2% Max",
        currentThought: "CapEx air-pocket stress scenario modeled; mandating 25% collar delta hedge.",
      },
      {
        id: "strategist",
        name: "Dr. Marcus Vance",
        codename: "TAKER",
        role: "Chief Investment Officer",
        color: "#3b82f6",
        badgeBg: "rgba(59, 130, 246, 0.15)",
        borderColor: "#2563eb",
        icon: <TrendingUp className="w-4 h-4 text-blue-400" />,
        angle: 0, // Mid-Right (0 deg)
        distance: 0.75,
        status: "ACTIVE",
        metricLabel: "Consensus Weight",
        metricValue: "84% BUY",
        currentThought: "Aggregating Bayesian priors. Probability of positive asymmetry exceeds 78%.",
      },
      {
        id: "execution_engine",
        name: "Quantum Alpha Core",
        codename: "CLOSER",
        role: "Liquidity & Order Book Settle",
        color: "#f97316",
        badgeBg: "rgba(249, 115, 22, 0.15)",
        borderColor: "#ea580c",
        icon: <Zap className="w-4 h-4 text-orange-400" />,
        angle: Math.PI / 6, // Bottom-Right (~30 deg)
        distance: 0.72,
        status: "ACTIVE",
        metricLabel: "Avg Slip / Edge",
        metricValue: "+1.78¢ Edge",
        currentThought: "Crossing spread on passive block at VWAP -0.14%; book fill clean.",
      },
      ].map((agent) => {
        const insight = committee?.agents.find((item) => item.agentId === insightIds[agent.id]);
        if (!insight) return agent;
        return {
          ...agent,
          status: insight.stance === "BULLISH" ? "ACTIVE" : insight.stance === "BEARISH" ? "DEBATING" : "PROCESSING",
          metricLabel: insight.metricLabel,
          metricValue: insight.metricValue,
          currentThought: `${insight.stance}: ${insight.evidence.join(" • ")}`,
        };
      });
    },
    [quote, committee]
  );

  // Streaming real-time activity log
  const [activityLogs, setActivityLogs] = useState<SwarmActivityLog[]>([
    {
      id: "log-1",
      time: "19:45:51",
      agent: "SPOTTER",
      agentColor: "#06b6d4",
      action: "SCAN",
      detail: "chainlink round in - no gap vs cex",
      delta: "+0.14%",
      deltaPositive: true,
    },
    {
      id: "log-2",
      time: "19:45:49",
      agent: "PRIOR",
      agentColor: "#f59e0b",
      action: "RESEARCH",
      detail: "reading 509 posts on the same strike",
      delta: "+$34.91",
      deltaPositive: true,
    },
    {
      id: "log-3",
      time: "19:45:47",
      agent: "EDGE",
      agentColor: "#ec4899",
      action: "EDGE",
      detail: "edge decayed 4.4 -> 0.6¢ - handed back",
      delta: "-$12.37",
      deltaPositive: false,
    },
    {
      id: "log-4",
      time: "19:45:45",
      agent: "KELLY",
      agentColor: "#a855f7",
      action: "RESIZE",
      detail: "drawdown guard 4.2/10 - size cut one notch",
      delta: "SIZE -15%",
      deltaPositive: false,
    },
    {
      id: "log-5",
      time: "19:45:42",
      agent: "TAKER",
      agentColor: "#3b82f6",
      action: "BUY",
      detail: "took eth 5m tape at 384 - 13.0k clip",
      delta: "+$10.58",
      deltaPositive: true,
    },
    {
      id: "log-6",
      time: "19:45:40",
      agent: "CLOSER",
      agentColor: "#f97316",
      action: "SETTLE",
      detail: "ledger clean 76.1% first pass",
      delta: "+$840",
      deltaPositive: true,
    },
  ]);

  // Particles and shockwaves mutable state for Canvas loop
  const particlesRef = useRef<Particle[]>([]);
  const shockwavesRef = useRef<Shockwave[]>([]);
  const animFrameIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  // Trigger burst of multi-agent interactions
  const triggerDebateBurst = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Create shockwave at center
    shockwavesRef.current.push({
      x: centerX,
      y: centerY,
      radius: 10,
      maxRadius: Math.min(centerX, centerY) * 0.9,
      color: "#38bdf8",
      alpha: 1.0,
    });

    // Spawn 24 high-speed packet particles from all agents to the core and cross-talk
    agents.forEach((agent) => {
      const radius = Math.min(centerX, centerY) * agent.distance;
      const nodeX = centerX + Math.cos(agent.angle) * radius;
      const nodeY = centerY + Math.sin(agent.angle) * radius;

      // Pulse at agent node
      shockwavesRef.current.push({
        x: nodeX,
        y: nodeY,
        radius: 6,
        maxRadius: 40,
        color: agent.color,
        alpha: 0.9,
      });

      // Stream to center
      for (let i = 0; i < 4; i++) {
        particlesRef.current.push({
          x: nodeX,
          y: nodeY,
          sourceX: nodeX,
          sourceY: nodeY,
          targetX: centerX,
          targetY: centerY,
          progress: Math.random() * 0.25,
          speed: (0.012 + Math.random() * 0.01) * speedMultiplier,
          color: agent.color,
          size: 3 + Math.random() * 2,
          payloadText: `${agent.codename}: ${agent.metricValue}`,
          trail: [],
        });
      }
    });

    // Add log entry
    const newLog: SwarmActivityLog = {
      id: `log-${Date.now()}`,
      time: new Date().toLocaleTimeString(),
      agent: "SWARM",
      agentColor: "#38bdf8",
      action: "SYNTHESIS_BURST",
      detail: "multi-agent tensor debate executed across 6 stations",
      delta: `+${(Math.random() * 2.5).toFixed(2)}¢`,
      deltaPositive: true,
    };
    setActivityLogs((prev) => [newLog, ...prev.slice(0, 15)]);
    setPnlValue((prev) => prev + Math.round((Math.random() * 120 - 30) * 10));
  }, [agents, speedMultiplier]);

  // Main Canvas Rendering Engine (60 FPS Bezier Web + Glowing Particles)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let resizeTimer: any;
    const handleResize = () => {
      if (!containerRef.current || !canvas) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // Canvas Loop
    const render = (time: number) => {
      const dt = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      if (!canvas || !ctx) return;
      const rect = containerRef.current?.getBoundingClientRect();
      const width = rect?.width || 800;
      const height = rect?.height || 560;

      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const baseRadius = Math.min(centerX, centerY);

      // 1. Draw subtle radar grid background
      ctx.save();
      ctx.strokeStyle = "rgba(30, 41, 59, 0.4)";
      ctx.lineWidth = 1;

      // Concentric range circles
      [0.3, 0.5, 0.72, 0.95].forEach((rFactor) => {
        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius * rFactor, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Crosshairs
      ctx.strokeStyle = "rgba(51, 65, 85, 0.25)";
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.moveTo(centerX - baseRadius * 0.95, centerY);
      ctx.lineTo(centerX + baseRadius * 0.95, centerY);
      ctx.moveTo(centerX, centerY - baseRadius * 0.95);
      ctx.lineTo(centerX, centerY + baseRadius * 0.95);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // 2. Draw Bezier Splines from each Agent to Center and Cross-Debates
      agents.forEach((agent, idx) => {
        const radius = baseRadius * agent.distance;
        const nodeX = centerX + Math.cos(agent.angle) * radius;
        const nodeY = centerY + Math.sin(agent.angle) * radius;

        // Primary Bezier beam to Central Core
        ctx.save();
        const grad = ctx.createLinearGradient(nodeX, nodeY, centerX, centerY);
        grad.addColorStop(0, agent.color + "99");
        grad.addColorStop(0.5, agent.color + "33");
        grad.addColorStop(1, "rgba(255, 255, 255, 0.8)");

        ctx.strokeStyle = grad;
        ctx.lineWidth = selectedAgentId === agent.id ? 2.5 : 1.2;

        // Draw curved spline with gentle harmonic oscillation
        const waveOffset = Math.sin(time * 0.002 + idx) * 15;
        const ctrlX = (nodeX + centerX) / 2 + Math.sin(agent.angle + Math.PI / 2) * waveOffset;
        const ctrlY = (nodeY + centerY) / 2 + Math.cos(agent.angle + Math.PI / 2) * waveOffset;

        ctx.beginPath();
        ctx.moveTo(nodeX, nodeY);
        ctx.quadraticCurveTo(ctrlX, ctrlY, centerX, centerY);
        ctx.stroke();

        // Cross-connections between neighboring agents
        const nextAgent = agents[(idx + 1) % agents.length];
        const nextRad = baseRadius * nextAgent.distance;
        const nextX = centerX + Math.cos(nextAgent.angle) * nextRad;
        const nextY = centerY + Math.sin(nextAgent.angle) * nextRad;

        ctx.strokeStyle = "rgba(71, 85, 105, 0.25)";
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(nodeX, nodeY);
        ctx.lineTo(nextX, nextY);
        ctx.stroke();

        ctx.restore();

        // Spawn periodic background particles if playing
        if (isPlaying && Math.random() < 0.08 * speedMultiplier) {
          particlesRef.current.push({
            x: nodeX,
            y: nodeY,
            sourceX: nodeX,
            sourceY: nodeY,
            targetX: centerX,
            targetY: centerY,
            progress: 0,
            speed: (0.007 + Math.random() * 0.007) * speedMultiplier,
            color: agent.color,
            size: 2.5,
            trail: [],
          });
        }
      });

      // 3. Update & Draw Particles with Glowing Fading Trails
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        if (isPlaying) {
          p.progress += p.speed;

          // Interpolate along curved path
          const t = p.progress;
          p.x = (1 - t) * p.sourceX + t * p.targetX;
          p.y = (1 - t) * p.sourceY + t * p.targetY;

          // Record trail
          p.trail.unshift({ x: p.x, y: p.y, alpha: 1.0 });
          if (p.trail.length > 8) p.trail.pop();
        }

        // Render trail
        ctx.save();
        p.trail.forEach((tPt, tIdx) => {
          const alpha = (1 - tIdx / p.trail.length) * 0.6;
          ctx.fillStyle = p.color;
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(tPt.x, tPt.y, p.size * (1 - tIdx / p.trail.length * 0.5), 0, Math.PI * 2);
          ctx.fill();
        });

        // Render head particle with intense glow
        ctx.globalAlpha = 1.0;
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Destination reached -> trigger micro ripple at center
        if (p.progress >= 1.0) {
          shockwavesRef.current.push({
            x: p.targetX,
            y: p.targetY,
            radius: 3,
            maxRadius: 28,
            color: p.color,
            alpha: 0.8,
          });
          particlesRef.current.splice(i, 1);
        }
      }

      // 4. Update & Draw Shockwaves
      for (let i = shockwavesRef.current.length - 1; i >= 0; i--) {
        const sw = shockwavesRef.current[i];
        if (isPlaying) {
          sw.radius += 1.8 * speedMultiplier;
          sw.alpha = Math.max(0, 1 - sw.radius / sw.maxRadius);
        }

        ctx.save();
        ctx.strokeStyle = sw.color;
        ctx.globalAlpha = sw.alpha;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        if (sw.radius >= sw.maxRadius || sw.alpha <= 0.05) {
          shockwavesRef.current.splice(i, 1);
        }
      }

      // 5. Central "THE LENS" Core Nexus Graphic
      ctx.save();
      const lensRadius = baseRadius * 0.16;

      // Outer pulsating aura
      const auraPulse = Math.sin(time * 0.003) * 6;
      const lensGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        lensRadius * 0.4,
        centerX,
        centerY,
        lensRadius + 14 + auraPulse
      );
      lensGrad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
      lensGrad.addColorStop(0.35, "rgba(56, 189, 248, 0.45)");
      lensGrad.addColorStop(0.7, "rgba(14, 165, 233, 0.15)");
      lensGrad.addColorStop(1, "rgba(14, 165, 233, 0)");

      ctx.fillStyle = lensGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, lensRadius + 14 + auraPulse, 0, Math.PI * 2);
      ctx.fill();

      // Core Solid Glass Disc
      ctx.fillStyle = "#090d16";
      ctx.strokeStyle = lensHovered ? "#38bdf8" : "rgba(255, 255, 255, 0.85)";
      ctx.lineWidth = 3;
      ctx.shadowColor = "#38bdf8";
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(centerX, centerY, lensRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Internal aperture geometric marks (Two vertical pill bars matching Daniro's Grok Lens)
      ctx.fillStyle = "#ffffff";
      ctx.shadowBlur = 0;
      const barW = lensRadius * 0.18;
      const barH = lensRadius * 0.62;
      const barGap = lensRadius * 0.22;

      // Left bar
      ctx.beginPath();
      ctx.roundRect(centerX - barGap - barW, centerY - barH / 2, barW, barH, 4);
      ctx.fill();

      // Right bar
      ctx.beginPath();
      ctx.roundRect(centerX + barGap, centerY - barH / 2, barW, barH, 4);
      ctx.fill();

      ctx.restore();

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, [agents, isPlaying, speedMultiplier, selectedAgentId, lensHovered]);

  // Timeline playback simulation
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setTimelineSec((prev) => {
        const next = prev + 1;
        if (next > 25) {
          // Loop back
          return 0;
        }
        return next;
      });

      // Shift active stage according to time progress
      setActiveStage((prev) => (prev + 1) % 6);

      // Random telemetry fluctuations for realism
      setPnlValue((prev) => prev + Math.round((Math.random() - 0.45) * 45));
    }, 1000 / speedMultiplier);

    return () => clearInterval(interval);
  }, [isPlaying, speedMultiplier]);

  // Current ticker symbol
  const activeSymbol = quote?.symbol || "NVDA";
  const activePrice = quote?.price || 218.29;
  const displayedPosterior = committee?.consensusScore ?? posteriorProbability;

  return (
    <div
      ref={containerRef}
      className={`relative w-full bg-[#050811] text-slate-100 rounded-xl border border-slate-800/80 shadow-2xl overflow-hidden font-mono select-none flex flex-col ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none border-none" : "min-h-[920px]"
      }`}
    >
      {/* ========================================================================= */}
      {/* 1. TOP HUD HEADER BAR (Matching GROK DESK / SWARM ONLINE in reference)   */}
      {/* ========================================================================= */}
      <div className="border-b border-slate-800/90 bg-[#080d1a] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Branding & Core Swarm Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]"></span>
            <span className="font-bold text-white tracking-wider text-sm flex items-center gap-1.5">
              QUANTUM DESK <span className="text-slate-500 font-normal">|</span>
              <span className="text-emerald-400 font-semibold">SWARM ONLINE</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-800 text-[11px] text-slate-400">
            <span className="px-1.5 py-0.5 rounded bg-slate-800/80 text-cyan-300 font-bold">
              SIX AGENTS, ONE BOOK
            </span>
            <span>TARGET: <strong className="text-white">{activeSymbol}</strong></span>
          </div>
        </div>

        {/* Center: Live Quant Arbitrage & Compute Cost Metrics */}
        <div className="hidden lg:flex items-center gap-5 text-[11px]">
          <div className="flex flex-col items-end">
            <span className="text-slate-400 text-[10px] uppercase">Human Desk Est.</span>
            <span className="text-slate-300 font-bold">$318k / YR</span>
          </div>
          <div className="w-px h-5 bg-slate-800"></div>
          <div className="flex flex-col items-end">
            <span className="text-cyan-400 text-[10px] uppercase">Swarm Run Cost</span>
            <span className="text-cyan-300 font-bold">$3.1k / YR</span>
          </div>
          <div className="w-px h-5 bg-slate-800"></div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-[11px]">
            <Zap className="w-3 h-3 text-emerald-400" />
            <span>102x CHEAPER</span>
          </div>
        </div>

        {/* Right: Live UTC Timestamp & Execution Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono text-xs">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>19:45:52 UTC</span>
          </div>

          <button
            onClick={triggerDebateBurst}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-300 hover:text-white transition active:scale-95 text-xs font-semibold"
            title="Trigger multi-agent debate tensor packet exchange"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            <span>Debate Burst</span>
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Swarm Terminal"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. PIPELINE RIBBON STRIP (Matching stages 01-06 in reference image)      */}
      {/* ========================================================================= */}
      <div className="border-b border-slate-800/80 bg-[#070b16] px-4 py-2 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2 min-w-max">
          {stages.map((stg, i) => {
            const isActive = activeStage === i;
            return (
              <div
                key={stg.num}
                onClick={() => {
                  setActiveStage(i);
                  const linkedAgent = agents[i];
                  if (linkedAgent) setSelectedAgentId(linkedAgent.id);
                }}
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg border transition cursor-pointer ${
                  isActive
                    ? "bg-slate-800/90 border-slate-600 shadow-[0_0_12px_rgba(56,189,248,0.2)]"
                    : "bg-slate-900/40 border-slate-800/60 hover:bg-slate-800/50"
                }`}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: stg.color }}
                ></div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[10px] text-slate-500 font-bold">{stg.num}</span>
                  <span className="text-xs font-bold text-white tracking-wide">{stg.name}</span>
                  <span className="text-[10px] text-slate-400">[{stg.agent}]</span>
                </div>
                <span
                  className="text-[9px] font-bold px-1.5 py-0.2 rounded uppercase"
                  style={{
                    backgroundColor: isActive ? stg.color + "33" : "rgba(30, 41, 59, 0.5)",
                    color: isActive ? stg.color : "#94a3b8",
                  }}
                >
                  {isActive ? "ACTIVE" : stg.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN INTERACTIVE CENTRAL STAGE ("THE LENS" VISUALIZATION CANVAS)      */}
      {/* ========================================================================= */}
      <div className="relative flex-1 min-h-[540px] lg:min-h-[600px] w-full flex items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.08),transparent_38%),linear-gradient(180deg,#050811,#02040a)]">
        {/* Background HTML5 Canvas (Splines, Particles, Shockwaves, Core) */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full cursor-crosshair"
          onMouseEnter={() => setLensHovered(true)}
          onMouseLeave={() => setLensHovered(false)}
        />

        {/* LEFT OVERLAY: Order Book Depth Ladder (Matching Vertical Green/Red Bars in Image) */}
        <div className="absolute left-3 top-4 bottom-4 w-44 pointer-events-none hidden md:flex flex-col justify-between rounded-lg border border-slate-800/70 bg-[#050811]/90 px-2 py-2 text-[10px] font-mono backdrop-blur-sm z-10">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-slate-400 border-b border-slate-800/80 pb-1">
              <span className="flex items-center gap-1 text-slate-300 font-bold">
                <Layers className="w-3 h-3 text-cyan-400" /> BOOK DEPTH
              </span>
              <span className="text-[9px] text-emerald-400">TAPE LIVE</span>
            </div>
            <div className="text-slate-300 font-bold text-xs pt-1">
              ${activePrice.toFixed(2)}
            </div>
            <div className="text-[9px] text-slate-500">
              {quote?.changePercent ? `${quote.changePercent > 0 ? "+" : ""}${quote.changePercent}%` : "+0.85%"}
            </div>
          </div>

          {/* Depth Histogram Bars */}
          <div className="space-y-1 my-auto pr-2">
            {/* Asks (Red/Orange) */}
            {[
              { p: activePrice + 0.65, vol: 1420, pct: 45 },
              { p: activePrice + 0.45, vol: 2850, pct: 75 },
              { p: activePrice + 0.25, vol: 3940, pct: 90 },
              { p: activePrice + 0.10, vol: 1820, pct: 55 },
            ].map((ask, i) => (
              <div key={i} className="flex items-center justify-between gap-1.5 text-[9px]">
                <span className="text-rose-400">${ask.p.toFixed(2)}</span>
                <div className="flex-1 bg-slate-900 h-2 rounded-xs overflow-hidden flex justify-end">
                  <div
                    className="bg-rose-500/60 h-full rounded-xs transition-all duration-300"
                    style={{ width: `${ask.pct}%` }}
                  ></div>
                </div>
                <span className="text-slate-500 w-7 text-right">{ask.vol}</span>
              </div>
            ))}

            {/* Mid Price Spread Divider */}
            <div className="border-y border-slate-700/60 py-0.5 text-center text-[9px] text-slate-400 font-semibold bg-slate-900/60">
              SPREAD: 0.02¢
            </div>

            {/* Bids (Green/Cyan) */}
            {[
              { p: activePrice - 0.10, vol: 2410, pct: 65 },
              { p: activePrice - 0.25, vol: 4120, pct: 95 },
              { p: activePrice - 0.45, vol: 3200, pct: 80 },
              { p: activePrice - 0.65, vol: 1190, pct: 40 },
            ].map((bid, i) => (
              <div key={i} className="flex items-center justify-between gap-1.5 text-[9px]">
                <span className="text-emerald-400">${bid.p.toFixed(2)}</span>
                <div className="flex-1 bg-slate-900 h-2 rounded-xs overflow-hidden flex justify-start">
                  <div
                    className="bg-emerald-500/60 h-full rounded-xs transition-all duration-300"
                    style={{ width: `${bid.pct}%` }}
                  ></div>
                </div>
                <span className="text-slate-500 w-7 text-left">{bid.vol}</span>
              </div>
            ))}
          </div>

          <div className="text-[9px] text-slate-500 border-t border-slate-800/80 pt-1 flex justify-between">
            <span>VOL: {quote?.volume ? (quote.volume / 1000000).toFixed(1) + "M" : "18.5M"}</span>
            <span className="text-cyan-400">MATCH: 92%</span>
          </div>
        </div>

        {/* RIGHT OVERLAY: Strike Pricing / Odds Spectrum (Matching Right Side in Image) */}
        <div className="absolute right-3 top-4 bottom-4 w-44 pointer-events-none hidden md:flex flex-col justify-between rounded-lg border border-slate-800/70 bg-[#050811]/90 px-2 py-2 text-[10px] font-mono backdrop-blur-sm z-10 text-right">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-slate-400 border-b border-slate-800/80 pb-1">
              <span className="text-[9px] text-purple-400">FAIR ODDS</span>
              <span className="flex items-center gap-1 text-slate-300 font-bold">
                PRICING WINDOW <Sliders className="w-3 h-3 text-purple-400" />
              </span>
            </div>
            <div className="text-purple-300 font-bold text-xs pt-1">
              53.1¢ <span className="text-[9px] text-slate-400 font-normal">MODEL ODDS</span>
            </div>
            <div className="text-[9px] text-slate-500">
              STAGE 02 • PRICING LOOP #3
            </div>
          </div>

          {/* Model strike probability distributions */}
          <div className="space-y-2 my-auto pl-2">
            {[
              { strike: "OUTPERFORM", odds: "84.2%", color: "#38bdf8" },
              { strike: "BASELINE", odds: "62.5%", color: "#a855f7" },
              { strike: "TAIL RISK COLLAR", odds: "15.8%", color: "#ec4899" },
            ].map((stk, i) => (
              <div key={i} className="space-y-0.5">
                <div className="flex justify-between text-[9px]">
                  <span className="text-slate-400">{stk.strike}</span>
                  <span className="font-bold text-slate-200">{stk.odds}</span>
                </div>
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: stk.odds,
                      backgroundColor: stk.color,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-[9px] text-slate-500 border-t border-slate-800/80 pt-1 flex justify-between">
            <span className="text-emerald-400">EDGE: +2.7¢</span>
            <span>OPEN: 3 TICKETS</span>
          </div>
        </div>

        {/* FLOATING AGENT INTERACTION NODES (Positioned radially around The Lens) */}
        {agents.map((agent) => {
          const isSelected = selectedAgentId === agent.id;
          // Calculate relative percent positions
          // angle: 0 rad is at (x: 1, y: 0) relative to center
          // Keep the agent orbit inside the side-panel gutters.
          const dist = 0.22;
          const leftPct = 50 + Math.cos(agent.angle) * (dist * 100);
          const topPct = 50 + Math.sin(agent.angle) * (dist * 100);

          return (
            <div
              key={agent.id}
              style={{
                left: `${leftPct}%`,
                top: `${topPct}%`,
                transform: "translate(-50%, -50%)",
              }}
              onClick={() => {
                setSelectedAgentId(isSelected ? null : agent.id);
                if (onNavigateToAgent) onNavigateToAgent(agent.id);
              }}
              className={`absolute cursor-pointer transition-all duration-300 z-20 group ${
                isSelected ? "scale-110 z-30" : "hover:scale-105 animate-swarm-agent"
              }`}
            >
              {/* Agent Node Badge Card */}
              <div
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border backdrop-blur-md shadow-xl"
                style={{
                  backgroundColor: isSelected ? "#0f172a" : "#090d16eb",
                  borderColor: isSelected ? agent.color : agent.borderColor + "80",
                  boxShadow: isSelected ? `0 0 20px ${agent.color}55` : "0 4px 14px rgba(0,0,0,0.6)",
                }}
              >
                {/* Colored Icon Pill */}
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shadow-inner"
                  style={{
                    backgroundColor: agent.badgeBg,
                    border: `1px solid ${agent.color}66`,
                  }}
                >
                  {agent.icon}
                </div>

                {/* Node Title & Metric */}
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-bold text-white tracking-wide">
                      {agent.codename}
                    </span>
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: agent.color }}
                    ></span>
                  </div>
                  <span className="text-[9px] text-slate-400 whitespace-nowrap">
                    {agent.metricLabel}: <strong className="text-slate-200">{agent.metricValue}</strong>
                  </span>
                </div>
              </div>

              {/* Hover Thought Callout */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-2 rounded-lg bg-slate-900/95 border border-slate-700 shadow-2xl text-[10px] text-slate-300 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-40">
                <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 pb-1 border-b border-slate-800">
                  <span style={{ color: agent.color }}>{agent.name}</span>
                  <span className="uppercase text-emerald-400">{agent.status}</span>
                </div>
                <p className="pt-1 text-slate-300 leading-snug">{agent.currentThought}</p>
                <div className="text-[9px] text-cyan-400 pt-1 font-semibold flex items-center gap-1">
                  Click to inspect dossier <ArrowRight className="w-2.5 h-2.5" />
                </div>
              </div>
            </div>
          );
        })}

        {/* Central Core Label Pill ("THE LENS") */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-12 pointer-events-none text-center z-10">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-[10px] text-slate-300 font-semibold shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
            <span>THE LENS • BAYESIAN CORE</span>
          </div>
          <p className="text-[9px] text-slate-500 pt-0.5">
            TAPE IN • 2,048 FUTURES OUT
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. BOTTOM TELEMETRY GRID (Matching 5 Quant Panels in reference image)     */}
      {/* ========================================================================= */}
      <div className="border-t border-slate-800/90 bg-[#060a14] p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
        {/* PANEL 1: Swarm PnL & Win Rate */}
        <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800/80 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-300 font-bold">
              <Activity className="w-3.5 h-3.5 text-emerald-400" /> SWARM PNL
            </span>
            <span className="text-[9px] text-emerald-400 font-semibold px-1.5 py-0.2 rounded bg-emerald-500/10">
              RUNNING 171D
            </span>
          </div>

          <div>
            <div className="text-xl font-black text-emerald-400 tracking-tight">
              ${pnlValue.toLocaleString()}
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-0.5">
              <span>ROI: <strong className="text-emerald-300">+17,177%</strong></span>
              <span>•</span>
              <span>SEED: $1.4k</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1 text-[9px] text-slate-400 border-t border-slate-800/80 pt-1.5">
            <div>
              <span className="text-slate-500 block">TICKETS</span>
              <strong className="text-slate-200">101,639</strong>
            </div>
            <div>
              <span className="text-slate-500 block">WIN RATE</span>
              <strong className="text-emerald-400">{winRate}%</strong>
            </div>
            <div>
              <span className="text-slate-500 block">MAX DD</span>
              <strong className="text-rose-400">4.2%</strong>
            </div>
          </div>
        </div>

        {/* PANEL 2: Live Price & Oracle Feed */}
        <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800/80 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-300 font-bold">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" /> {activeSymbol} / USD
            </span>
            <span className="text-[9px] text-cyan-400 font-semibold">5M CHAINLINK</span>
          </div>

          <div>
            <div className="text-xl font-black text-white tracking-tight flex items-baseline gap-2">
              ${activePrice.toFixed(2)}
              <span className="text-xs font-semibold text-emerald-400">
                {quote?.changePercent ? `${quote.changePercent > 0 ? "+" : ""}${quote.changePercent}%` : "+0.85%"}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 pt-0.5">
              VWAP: <strong className="text-slate-300">${quote?.vwap ? quote.vwap.toFixed(2) : (activePrice * 0.998).toFixed(2)}</strong>
            </div>
          </div>

          {/* Micro Mini Sparkline Bar */}
          <div className="border-t border-slate-800/80 pt-1.5 space-y-1">
            <div className="flex justify-between text-[9px] text-slate-500">
              <span>52W LOW: ${quote?.week52Low || (activePrice * 0.82).toFixed(2)}</span>
              <span>52W HIGH: ${quote?.week52High || (activePrice * 1.18).toFixed(2)}</span>
            </div>
            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden flex">
              <div className="bg-emerald-500 h-full w-[70%]"></div>
              <div className="bg-rose-500 h-full w-[30%]"></div>
            </div>
          </div>
        </div>

        {/* PANEL 3: Bayesian Update Curve */}
        <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800/80 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-300 font-bold">
              <BarChart2 className="w-3.5 h-3.5 text-purple-400" /> BAYESIAN UPDATE
            </span>
            <span className="text-[9px] text-purple-300">PRIOR • BOOK</span>
          </div>

          {/* SVG Gaussian Distribution Curves (Prior vs Posterior) */}
          <div className="relative h-14 w-full flex items-end">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40">
              {/* Prior Curve (Grey) */}
              <path
                d="M 5,38 Q 40,38 50,15 Q 60,38 95,38"
                fill="none"
                stroke="#64748b"
                strokeWidth="1.5"
                strokeDasharray="2,2"
              />
              {/* Posterior Curve (Glowing Green Shifted Right) */}
              <path
                d="M 15,38 Q 50,38 65,4 Q 80,38 98,38"
                fill="rgba(16, 185, 129, 0.15)"
                stroke="#10b981"
                strokeWidth="2"
              />
              {/* Target Price Marker */}
              <line x1="65" y1="2" x2="65" y2="38" stroke="#38bdf8" strokeWidth="1" strokeDasharray="1,1" />
            </svg>
            <span className="absolute right-1 top-0 text-[8px] font-bold text-cyan-400">
              +14.2% SHIFT
            </span>
          </div>

          <div className="flex items-center justify-between text-[9px] text-slate-400 border-t border-slate-800/80 pt-1">
            <span>PRIOR: 50.0%</span>
            <span className="text-emerald-400 font-bold">CONSENSUS: {displayedPosterior}%</span>
          </div>
        </div>

        {/* PANEL 4: Streaming Multi-Agent Packet Activity Log */}
        <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800/80 flex flex-col justify-between space-y-1.5 md:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-1">
            <span className="flex items-center gap-1.5 text-slate-300 font-bold">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" /> PACKET STREAM
            </span>
            <span className="text-[9px] text-slate-500">6 AGENTS</span>
          </div>

          {/* Monospace Scrolling Log Rows */}
          <div className="space-y-1 h-20 overflow-y-auto scrollbar-none text-[9px]">
            {activityLogs.slice(0, 4).map((log) => (
              <div key={log.id} className="flex items-center justify-between gap-1 leading-tight">
                <span className="font-bold whitespace-nowrap" style={{ color: log.agentColor }}>
                  {log.agent}
                </span>
                <span className="text-slate-400 truncate flex-1 pl-1">
                  {log.detail}
                </span>
                {log.delta && (
                  <span
                    className={`font-mono font-bold whitespace-nowrap ${
                      log.deltaPositive ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {log.delta}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="text-[8px] text-slate-500 border-t border-slate-800/80 pt-1 flex justify-between">
            <span>PACKETS: 1,420/s</span>
            <span className="text-emerald-400">0 DROPS</span>
          </div>
        </div>

        {/* PANEL 5: Signal Feature Heatmap / Spectrogram */}
        <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800/80 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-300 font-bold">
              <Layers className="w-3.5 h-3.5 text-amber-400" /> SPECTROGRAM
            </span>
            <span className="text-[9px] text-amber-400 font-bold">18 FEATS</span>
          </div>

          {/* Animated 3x6 Heatmap Grid Matrix */}
          <div className="grid grid-cols-6 gap-1 h-12 py-1">
            {[
              0.8, 0.9, 0.4, 0.2, 0.7, 0.95,
              0.3, 0.85, 0.9, 0.6, 0.1, 0.75,
              0.65, 0.4, 0.8, 0.95, 0.3, 0.88,
            ].map((val, idx) => {
              // Color spectrum from deep blue to amber to green
              const bg =
                val > 0.8
                  ? "rgba(245, 158, 11, 0.85)"
                  : val > 0.5
                  ? "rgba(16, 185, 129, 0.65)"
                  : "rgba(30, 41, 59, 0.8)";
              return (
                <div
                  key={idx}
                  className="rounded-xs transition-colors duration-500"
                  style={{ backgroundColor: bg }}
                  title={`Feature ${idx + 1}: ${(val * 100).toFixed(0)}%`}
                ></div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[9px] text-slate-400 border-t border-slate-800/80 pt-1">
            <span>REGIME: VOL-COMPRESSED</span>
            <span className="text-cyan-400">HOT: 2/18</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. BOTTOM PLAYBACK SCRUBBER BAR (Matching Video Timeline in Reference)   */}
      {/* ========================================================================= */}
      <div className="border-t border-slate-800 bg-[#050811] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Play/Pause & Reset */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 hover:text-white transition"
            title={isPlaying ? "Pause Animation" : "Play Animation"}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          <button
            onClick={() => {
              setTimelineSec(0);
              particlesRef.current = [];
              shockwavesRef.current = [];
            }}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
            title="Reset Timeline"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Timeline Timecode */}
          <span className="font-mono text-xs text-slate-300 pl-1">
            0:{timelineSec < 10 ? `0${timelineSec}` : timelineSec} / 0:25
          </span>
        </div>

        {/* Scrubber Progress Bar */}
        <div className="flex-1 max-w-md mx-2 flex items-center">
          <input
            type="range"
            min="0"
            max="25"
            value={timelineSec}
            onChange={(e) => setTimelineSec(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        {/* Speed Controls (0.5x, 1x, 2x, 5x) */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-500">SPEED:</span>
          {[0.5, 1, 2, 5].map((s) => (
            <button
              key={s}
              onClick={() => setSpeedMultiplier(s)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                speedMultiplier === s
                  ? "bg-cyan-500 text-slate-950"
                  : "bg-slate-800/80 text-slate-400 hover:text-white"
              }`}
            >
              {s}x
            </button>
          ))}
        </div>

        {/* Tab Shortcuts to Deep Dossiers */}
        {onNavigateToTab && (
          <div className="hidden xl:flex items-center gap-2 pl-3 border-l border-slate-800 text-[11px]">
            <span className="text-slate-500">DRILLDOWN:</span>
            <button
              onClick={() => onNavigateToTab("phase1")}
              className="hover:text-cyan-300 text-slate-400 transition underline"
            >
              Phase 1
            </button>
            <span className="text-slate-600">•</span>
            <button
              onClick={() => onNavigateToTab("phase2")}
              className="hover:text-rose-300 text-slate-400 transition underline"
            >
              Phase 2 Debate
            </button>
            <span className="text-slate-600">•</span>
            <button
              onClick={() => onNavigateToTab("memorandum")}
              className="hover:text-amber-300 text-slate-400 transition underline"
            >
              Memorandum
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
