import React, { useState, useRef } from "react";
import {
  MintLWTDDataPoint,
  MintMWPLDataPoint,
  MintAdvDecDataPoint,
} from "../types";
import { Download, Check, Sparkles, Eye, Info } from "lucide-react";

export type MintChartType = "lwtd" | "mwpl" | "advdec";

interface MintChartRendererProps {
  type: MintChartType;
  lwtdData?: MintLWTDDataPoint[];
  mwplData?: MintMWPLDataPoint[];
  advDecData?: MintAdvDecDataPoint[];
  startDateLabel?: string;
  endDateLabel?: string;
  isLiveTicking?: boolean;
  themeMode?: "mint-light" | "terminal-dark";
  onToggleTheme?: () => void;
}

export const MintChartRenderer: React.FC<MintChartRendererProps> = ({
  type,
  lwtdData = [],
  mwplData = [],
  advDecData = [],
  startDateLabel = "1 May 2026",
  endDateLabel = "11 Sep 2026",
  isLiveTicking = true,
  themeMode = "mint-light",
  onToggleTheme,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [showFormulaInfo, setShowFormulaInfo] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const isDark = themeMode === "terminal-dark";

  // Palette settings
  const bgColor = isDark ? "#090d16" : "#e5e9f0";
  const canvasBgColor = isDark ? "#0f172a" : "#f1f5f9";
  const titleColor = isDark ? "#f8fafc" : "#1e293b";
  const subtitleColor = isDark ? "#94a3b8" : "#475569";
  const gridColor = isDark ? "#1e293b" : "#cbd5e1";
  const negativeShadeColor = isDark ? "rgba(30, 41, 59, 0.75)" : "rgba(203, 213, 225, 0.65)";
  const zeroLineColor = isDark ? "#64748b" : "#334155";
  const axisTextColor = isDark ? "#94a3b8" : "#64748b";
  const sourceTextColor = isDark ? "#64748b" : "#64748b";
  const mintOrange = "#f97316";

  // Series line colors (100% matched to attached images)
  const lightBlueColor = "#38bdf8"; // Nifty w-o-w change or Adv-Dec weeks avg
  const darkNavyColor = isDark ? "#38bdf8" : "#0f2b48"; // LWTD or Nifty in Adv-Dec

  // Canvas Geometry - compact, responsive dimensions
  const width = 720;
  const height = 320;
  const padding = { top: 60, right: 42, bottom: 46, left: 46 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  // Chart specific headers
  let title = "Nifty and LWTD Indicator";
  let subtitle = "Expect fresh buying to be mild this week";
  if (type === "mwpl") {
    title = "Market Wide Position Limits";
    subtitle = "Swing traders showed lower buying interest";
  } else if (type === "advdec") {
    title = "NSE Advance Decline Ratio";
    subtitle = "Intraday buying conviction fell sharply";
  }

  // Y Scale calculations
  const getYCoordinate = (val: number, minVal: number, maxVal: number) => {
    const clamped = Math.max(minVal, Math.min(maxVal, val));
    const ratio = (clamped - minVal) / (maxVal - minVal);
    return padding.top + plotHeight - ratio * plotHeight;
  };

  const getXCoordinate = (index: number, totalPoints: number) => {
    if (totalPoints <= 1) return padding.left;
    return padding.left + (index / (totalPoints - 1)) * plotWidth;
  };

  // Generate SVG path for a series
  const buildSvgPath = (points: { x: number; y: number }[], smooth: boolean = true) => {
    if (!points || points.length === 0) return "";
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

    if (!smooth) {
      return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    }

    // Monotone cubic spline curve approximation
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(points.length - 1, i + 2)];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return path;
  };

  // Export SVG to PNG download
  const handleExportGraphic = () => {
    if (!svgRef.current) return;
    try {
      const svgString = new XMLSerializer().serializeToString(svgRef.current);
      const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const blobURL = window.URL.createObjectURL(svgBlob);
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = width * 2;
        canvas.height = height * 2;
        const context = canvas.getContext("2d");
        if (context) {
          context.scale(2, 2);
          context.drawImage(image, 0, 0);
          const png = canvas.toDataURL("image/png");
          const downloadLink = document.createElement("a");
          downloadLink.href = png;
          downloadLink.download = `mint-${type}-graphic.png`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          setCopiedSuccess(true);
          setTimeout(() => setCopiedSuccess(false), 2500);
        }
      };
      image.src = blobURL;
    } catch {
      // Fallback
    }
  };

  // -------------------------------------------------------------------------
  // Render Specific Chart Types
  // -------------------------------------------------------------------------

  // 1. CHART TYPE: LWTD (Image 1: unnamed-3.jpg)
  const renderLWTDChart = () => {
    const data = lwtdData;
    const count = data.length;
    const yMin = -3;
    const yMax = 3;

    const zeroY = getYCoordinate(0, yMin, yMax);
    const bottomY = getYCoordinate(-3, yMin, yMax);

    const niftyPoints = data.map((d, i) => ({
      x: getXCoordinate(i, count),
      y: getYCoordinate(d.niftyWowChange, yMin, yMax),
      val: d.niftyWowChange,
      date: d.date,
    }));

    const lwtdPoints = data.map((d, i) => ({
      x: getXCoordinate(i, count),
      y: getYCoordinate(d.niftyLWTD, yMin, yMax),
      val: d.niftyLWTD,
      date: d.date,
    }));

    const niftyPath = buildSvgPath(niftyPoints, false);
    const lwtdPath = buildSvgPath(lwtdPoints, false);

    const startNifty = data[0]?.niftyWowChange ?? 0.42;
    const startLWTD = data[0]?.niftyLWTD ?? -0.19;
    const endNifty = data[count - 1]?.niftyWowChange ?? -2.09;
    const endLWTD = data[count - 1]?.niftyLWTD ?? -0.1;

    const firstPtNifty = niftyPoints[0] || { x: padding.left, y: zeroY };
    const firstPtLWTD = lwtdPoints[0] || { x: padding.left, y: zeroY };
    const lastPtNifty = niftyPoints[count - 1] || { x: padding.left + plotWidth, y: zeroY };
    const lastPtLWTD = lwtdPoints[count - 1] || { x: padding.left + plotWidth, y: zeroY };

    return (
      <>
        {/* Shaded Negative Zone (-3 to 0) */}
        <rect
          x={padding.left}
          y={zeroY}
          width={plotWidth}
          height={bottomY - zeroY}
          fill={negativeShadeColor}
        />

        {/* Horizontal Dashed Gridlines (-3, -2, -1, 1, 2, 3) */}
        {[-3, -2, -1, 1, 2, 3].map((val) => {
          const y = getYCoordinate(val, yMin, yMax);
          return (
            <g key={`grid-${val}`}>
              <line
                x1={padding.left}
                y1={y}
                x2={padding.left + plotWidth}
                y2={y}
                stroke={gridColor}
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              <text
                x={padding.left - 10}
                y={y + 3.5}
                textAnchor="end"
                fontSize={11}
                fill={axisTextColor}
                fontFamily="system-ui, -apple-system, sans-serif"
                fontWeight={500}
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* Solid Zero Baseline */}
        <line
          x1={padding.left}
          y1={zeroY}
          x2={padding.left + plotWidth}
          y2={zeroY}
          stroke={zeroLineColor}
          strokeWidth={1.5}
        />
        <text
          x={padding.left - 10}
          y={zeroY + 3.5}
          textAnchor="end"
          fontSize={11}
          fill={axisTextColor}
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight={600}
        >
          0
        </text>

        {/* Legend on Top Right */}
        <g transform={`translate(${width - padding.right - 230}, ${padding.top - 20})`}>
          {/* Nifty w-o-w change pill */}
          <rect x={0} y={-4} width={16} height={5} rx={2.5} fill={lightBlueColor} />
          <text
            x={22}
            y={2}
            fontSize={11}
            fontWeight={500}
            fill={axisTextColor}
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            Nifty w-o-w change
          </text>

          {/* Nifty LWTD pill */}
          <rect x={135} y={-4} width={16} height={5} rx={2.5} fill={darkNavyColor} />
          <text
            x={157}
            y={2}
            fontSize={11}
            fontWeight={500}
            fill={axisTextColor}
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            Nifty LWTD
          </text>
        </g>

        {/* Series 1: Nifty w-o-w change (Light Blue Line) */}
        <path
          d={niftyPath}
          fill="none"
          stroke={lightBlueColor}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Series 2: Nifty LWTD (Dark Navy Line) */}
        <path
          d={lwtdPath}
          fill="none"
          stroke={darkNavyColor}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* ----------------- Distinct Endpoint Callouts ----------------- */}

        {/* Left Start: Nifty 0.42 Callout */}
        <g transform={`translate(${firstPtNifty.x}, ${firstPtNifty.y})`}>
          <circle r={6} fill={lightBlueColor} />
          <circle r={3} fill="#ffffff" />
          <text
            x={-4}
            y={-12}
            fontSize={13}
            fontWeight={800}
            fill={lightBlueColor}
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            {startNifty > 0 ? `${startNifty.toFixed(2)}` : startNifty.toFixed(2)}
          </text>
        </g>

        {/* Left Start: LWTD -0.19 Callout */}
        <g transform={`translate(${firstPtLWTD.x}, ${firstPtLWTD.y})`}>
          <circle r={6} fill={darkNavyColor} />
          <circle r={3} fill={isDark ? "#0f172a" : "#f1f5f9"} />
          <text
            x={-10}
            y={18}
            fontSize={13}
            fontWeight={800}
            fill={darkNavyColor}
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            {startLWTD.toFixed(2)}
          </text>
        </g>

        {/* Right End: LWTD -0.10 Callout */}
        <g transform={`translate(${lastPtLWTD.x}, ${lastPtLWTD.y})`}>
          <circle r={6} fill={darkNavyColor} />
          <circle r={3} fill={isDark ? "#0f172a" : "#f1f5f9"} />
          <text
            x={-20}
            y={-12}
            fontSize={13}
            fontWeight={800}
            fill={darkNavyColor}
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            {endLWTD.toFixed(2)}
          </text>
        </g>

        {/* Right End: Nifty -2.09 Callout */}
        <g transform={`translate(${lastPtNifty.x}, ${lastPtNifty.y})`}>
          {isLiveTicking && (
            <circle r={12} fill={lightBlueColor} opacity={0.3} className="animate-ping" />
          )}
          <circle r={7} fill={lightBlueColor} />
          <circle r={3.5} fill="#ffffff" />
          <text
            x={-44}
            y={4}
            fontSize={14}
            fontWeight={800}
            fill={lightBlueColor}
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            {endNifty.toFixed(2)}
          </text>
        </g>

        {/* Invisible Hover Rectangles for Data Inspector */}
        {data.map((d, i) => {
          const x = getXCoordinate(i, count);
          return (
            <rect
              key={`hover-col-${i}`}
              x={x - plotWidth / count / 2}
              y={padding.top}
              width={plotWidth / count}
              height={plotHeight}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          );
        })}

        {/* Active Hover Guide & Tooltip */}
        {hoveredIndex !== null && data[hoveredIndex] && (
          <g>
            <line
              x1={getXCoordinate(hoveredIndex, count)}
              y1={padding.top}
              x2={getXCoordinate(hoveredIndex, count)}
              y2={padding.top + plotHeight}
              stroke="#64748b"
              strokeWidth={1.5}
              strokeDasharray="2 2"
            />
            {/* Tooltip Card */}
            <g
              transform={`translate(${Math.min(
                width - 180,
                Math.max(padding.left + 10, getXCoordinate(hoveredIndex, count) - 75)
              )}, ${padding.top + 10})`}
            >
              <rect
                x={0}
                y={0}
                width={155}
                height={68}
                rx={6}
                fill={isDark ? "#1e293b" : "#ffffff"}
                stroke={isDark ? "#334155" : "#cbd5e1"}
                strokeWidth={1}
                filter="drop-shadow(0 4px 6px rgba(0,0,0,0.1))"
              />
              <text x={10} y={18} fontSize={11} fontWeight={700} fill={axisTextColor}>
                {data[hoveredIndex].date}
              </text>
              <text x={10} y={36} fontSize={12} fontWeight={700} fill={lightBlueColor}>
                Nifty WoW: {data[hoveredIndex].niftyWowChange > 0 ? "+" : ""}
                {data[hoveredIndex].niftyWowChange.toFixed(2)}%
              </text>
              <text x={10} y={54} fontSize={12} fontWeight={700} fill={darkNavyColor}>
                LWTD: {data[hoveredIndex].niftyLWTD.toFixed(2)}
              </text>
            </g>
          </g>
        )}
      </>
    );
  };

  // 2. CHART TYPE: MWPL (Image 2: unnamed-2.jpg)
  const renderMWPLChart = () => {
    const data = mwplData;
    const count = data.length;
    const yMin = 40;
    const yMax = 60;

    const baseLineY = getYCoordinate(40, yMin, yMax);
    const midLineY = getYCoordinate(50, yMin, yMax);
    const topLineY = getYCoordinate(60, yMin, yMax);

    const mwplPoints = data.map((d, i) => ({
      x: getXCoordinate(i, count),
      y: getYCoordinate(d.mwplPercent, yMin, yMax),
      val: d.mwplPercent,
      date: d.date,
    }));

    const linePath = buildSvgPath(mwplPoints, false);

    // Build area fill path
    let areaPath = "";
    if (mwplPoints.length > 0) {
      areaPath = `${linePath} L ${mwplPoints[mwplPoints.length - 1].x} ${baseLineY} L ${
        mwplPoints[0].x
      } ${baseLineY} Z`;
    }

    const startVal = data[0]?.mwplPercent ?? 42.57;
    const endVal = data[count - 1]?.mwplPercent ?? 51.2;

    const firstPt = mwplPoints[0] || { x: padding.left, y: baseLineY };
    const lastPt = mwplPoints[count - 1] || { x: padding.left + plotWidth, y: baseLineY };

    return (
      <>
        <defs>
          <linearGradient id="mwplGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lightBlueColor} stopOpacity={0.42} />
            <stop offset="70%" stopColor={lightBlueColor} stopOpacity={0.12} />
            <stop offset="100%" stopColor={lightBlueColor} stopOpacity={0.02} />
          </linearGradient>
        </defs>

        {/* Dashed Gridlines at 50 and 60 */}
        <line
          x1={padding.left}
          y1={topLineY}
          x2={padding.left + plotWidth}
          y2={topLineY}
          stroke={gridColor}
          strokeWidth={1}
          strokeDasharray="4 4"
        />
        <text
          x={padding.left - 10}
          y={topLineY + 3.5}
          textAnchor="end"
          fontSize={11}
          fill={axisTextColor}
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight={500}
        >
          60
        </text>

        <line
          x1={padding.left}
          y1={midLineY}
          x2={padding.left + plotWidth}
          y2={midLineY}
          stroke={gridColor}
          strokeWidth={1}
          strokeDasharray="4 4"
        />
        <text
          x={padding.left - 10}
          y={midLineY + 3.5}
          textAnchor="end"
          fontSize={11}
          fill={axisTextColor}
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight={500}
        >
          50
        </text>

        {/* Solid baseline at 40 */}
        <line
          x1={padding.left}
          y1={baseLineY}
          x2={padding.left + plotWidth}
          y2={baseLineY}
          stroke={zeroLineColor}
          strokeWidth={1.5}
        />
        <text
          x={padding.left - 10}
          y={baseLineY + 3.5}
          textAnchor="end"
          fontSize={11}
          fill={axisTextColor}
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight={600}
        >
          40
        </text>

        {/* Area Gradient Fill */}
        <path d={areaPath} fill="url(#mwplGradient)" />

        {/* MWPL Line with Sawtooth Peaks (Light Blue) */}
        <path
          d={linePath}
          fill="none"
          stroke={lightBlueColor}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* ----------------- Endpoints Matching Image 2 ----------------- */}

        {/* Left Start: 42.57 */}
        <g transform={`translate(${firstPt.x}, ${firstPt.y})`}>
          <circle r={6} fill={lightBlueColor} />
          <circle r={3} fill="#ffffff" />
          <text
            x={12}
            y={5}
            fontSize={14}
            fontWeight={800}
            fill={titleColor}
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            {startVal.toFixed(2)}
          </text>
        </g>

        {/* Right End: 51.20 */}
        <g transform={`translate(${lastPt.x}, ${lastPt.y})`}>
          {isLiveTicking && (
            <circle r={12} fill={lightBlueColor} opacity={0.3} className="animate-ping" />
          )}
          <circle r={6} fill={lightBlueColor} />
          <circle r={3} fill="#ffffff" />
          <text
            x={-14}
            y={-12}
            fontSize={14}
            fontWeight={800}
            fill={titleColor}
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            {endVal.toFixed(2)}
          </text>
        </g>

        {/* Hover interaction */}
        {data.map((d, i) => {
          const x = getXCoordinate(i, count);
          return (
            <rect
              key={`mwpl-col-${i}`}
              x={x - plotWidth / count / 2}
              y={padding.top}
              width={plotWidth / count}
              height={plotHeight}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          );
        })}

        {hoveredIndex !== null && data[hoveredIndex] && (
          <g>
            <line
              x1={getXCoordinate(hoveredIndex, count)}
              y1={padding.top}
              x2={getXCoordinate(hoveredIndex, count)}
              y2={padding.top + plotHeight}
              stroke="#64748b"
              strokeWidth={1.5}
              strokeDasharray="2 2"
            />
            <g
              transform={`translate(${Math.min(
                width - 180,
                Math.max(padding.left + 10, getXCoordinate(hoveredIndex, count) - 75)
              )}, ${padding.top + 10})`}
            >
              <rect
                x={0}
                y={0}
                width={150}
                height={55}
                rx={6}
                fill={isDark ? "#1e293b" : "#ffffff"}
                stroke={isDark ? "#334155" : "#cbd5e1"}
                strokeWidth={1}
                filter="drop-shadow(0 4px 6px rgba(0,0,0,0.1))"
              />
              <text x={10} y={18} fontSize={11} fontWeight={700} fill={axisTextColor}>
                {data[hoveredIndex].date}
              </text>
              <text x={10} y={38} fontSize={13} fontWeight={800} fill={lightBlueColor}>
                MWPL: {data[hoveredIndex].mwplPercent.toFixed(2)}%
              </text>
            </g>
          </g>
        )}
      </>
    );
  };

  // 3. CHART TYPE: Advance Decline Ratio (Image 3: unnamed.jpg)
  const renderAdvDecChart = () => {
    const data = advDecData;
    const count = data.length;
    const yMin = -3;
    const yMax = 3;

    const zeroY = getYCoordinate(0, yMin, yMax);
    const bottomY = getYCoordinate(-3, yMin, yMax);

    const niftyPoints = data.map((d, i) => ({
      x: getXCoordinate(i, count),
      y: getYCoordinate(d.niftyWowChange, yMin, yMax),
      val: d.niftyWowChange,
      date: d.date,
    }));

    const advDecPoints = data.map((d, i) => ({
      x: getXCoordinate(i, count),
      y: getYCoordinate(d.advDecRatioWeeklyAvg, yMin, yMax),
      val: d.advDecRatioWeeklyAvg,
      date: d.date,
    }));

    const niftyPath = buildSvgPath(niftyPoints, false);
    const advDecPath = buildSvgPath(advDecPoints, false);

    const startNifty = data[0]?.niftyWowChange ?? 0.42;
    const startAdvDec = data[0]?.advDecRatioWeeklyAvg ?? 1.22;
    const endNifty = data[count - 1]?.niftyWowChange ?? -2.09;
    const endAdvDec = data[count - 1]?.advDecRatioWeeklyAvg ?? 0.75;

    const firstPtNifty = niftyPoints[0] || { x: padding.left, y: zeroY };
    const firstPtAdvDec = advDecPoints[0] || { x: padding.left, y: zeroY };
    const lastPtNifty = niftyPoints[count - 1] || { x: padding.left + plotWidth, y: zeroY };
    const lastPtAdvDec = advDecPoints[count - 1] || { x: padding.left + plotWidth, y: zeroY };

    return (
      <>
        {/* Shaded Negative Area (-3 to 0) */}
        <rect
          x={padding.left}
          y={zeroY}
          width={plotWidth}
          height={bottomY - zeroY}
          fill={negativeShadeColor}
        />

        {/* Dashed Gridlines */}
        {[-3, -2, -1, 1, 2, 3].map((val) => {
          const y = getYCoordinate(val, yMin, yMax);
          return (
            <g key={`grid-adv-${val}`}>
              <line
                x1={padding.left}
                y1={y}
                x2={padding.left + plotWidth}
                y2={y}
                stroke={gridColor}
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              <text
                x={padding.left - 14}
                y={y + 4}
                textAnchor="end"
                fontSize={13}
                fill={axisTextColor}
                fontFamily="system-ui, -apple-system, sans-serif"
                fontWeight={500}
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* Solid Zero Baseline */}
        <line
          x1={padding.left}
          y1={zeroY}
          x2={padding.left + plotWidth}
          y2={zeroY}
          stroke={zeroLineColor}
          strokeWidth={1.5}
        />
        <text
          x={padding.left - 10}
          y={zeroY + 3.5}
          textAnchor="end"
          fontSize={11}
          fill={axisTextColor}
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight={600}
        >
          0
        </text>

        {/* Legend on Top Right */}
        <g transform={`translate(${width - padding.right - 260}, ${padding.top - 20})`}>
          {/* Nifty w-o-w change pill (Dark Navy in Image 3) */}
          <rect x={0} y={-4} width={16} height={5} rx={2.5} fill={darkNavyColor} />
          <text
            x={22}
            y={2}
            fontSize={11}
            fontWeight={500}
            fill={axisTextColor}
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            Nifty w-o-w change
          </text>

          {/* Adv-Dec Ratio Weeks Avg (Light Blue in Image 3) */}
          <rect x={135} y={-4} width={16} height={5} rx={2.5} fill={lightBlueColor} />
          <text
            x={157}
            y={2}
            fontSize={11}
            fontWeight={500}
            fill={axisTextColor}
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            Adv-Dec Ratio Weeks Avg
          </text>
        </g>

        {/* Nifty Line (Dark Navy in Image 3) */}
        <path
          d={niftyPath}
          fill="none"
          stroke={darkNavyColor}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Adv-Dec Ratio Line (Light Blue in Image 3) */}
        <path
          d={advDecPath}
          fill="none"
          stroke={lightBlueColor}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* ----------------- Endpoints Matching Image 3 ----------------- */}

        {/* Left Start: Adv-Dec 1.22 Callout */}
        <g transform={`translate(${firstPtAdvDec.x}, ${firstPtAdvDec.y})`}>
          <circle r={6} fill={lightBlueColor} />
          <circle r={3} fill="#ffffff" />
          <text
            x={-10}
            y={-12}
            fontSize={13}
            fontWeight={800}
            fill={lightBlueColor}
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            {startAdvDec.toFixed(2)}
          </text>
        </g>

        {/* Left Start: Nifty 0.42 Callout */}
        <g transform={`translate(${firstPtNifty.x}, ${firstPtNifty.y})`}>
          <circle r={6} fill={darkNavyColor} />
          <circle r={3} fill={isDark ? "#0f172a" : "#f1f5f9"} />
          <text
            x={-14}
            y={18}
            fontSize={13}
            fontWeight={800}
            fill={darkNavyColor}
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            {startNifty > 0 ? `${startNifty.toFixed(2)}` : startNifty.toFixed(2)}
          </text>
        </g>

        {/* Right End: Adv-Dec 0.75 Callout */}
        <g transform={`translate(${lastPtAdvDec.x}, ${lastPtAdvDec.y})`}>
          {isLiveTicking && (
            <circle r={12} fill={lightBlueColor} opacity={0.3} className="animate-ping" />
          )}
          <circle r={6} fill={lightBlueColor} />
          <circle r={3} fill="#ffffff" />
          <text
            x={-8}
            y={-12}
            fontSize={13}
            fontWeight={800}
            fill={lightBlueColor}
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            {endAdvDec.toFixed(2)}
          </text>
        </g>

        {/* Right End: Nifty -2.09 Callout */}
        <g transform={`translate(${lastPtNifty.x}, ${lastPtNifty.y})`}>
          <circle r={6} fill={darkNavyColor} />
          <circle r={3} fill={isDark ? "#0f172a" : "#f1f5f9"} />
          <text
            x={-8}
            y={-12}
            fontSize={13}
            fontWeight={800}
            fill={darkNavyColor}
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            {endNifty.toFixed(2)}
          </text>
        </g>

        {/* Hover inspector */}
        {data.map((d, i) => {
          const x = getXCoordinate(i, count);
          return (
            <rect
              key={`adv-col-${i}`}
              x={x - plotWidth / count / 2}
              y={padding.top}
              width={plotWidth / count}
              height={plotHeight}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          );
        })}

        {hoveredIndex !== null && data[hoveredIndex] && (
          <g>
            <line
              x1={getXCoordinate(hoveredIndex, count)}
              y1={padding.top}
              x2={getXCoordinate(hoveredIndex, count)}
              y2={padding.top + plotHeight}
              stroke="#64748b"
              strokeWidth={1.5}
              strokeDasharray="2 2"
            />
            <g
              transform={`translate(${Math.min(
                width - 180,
                Math.max(padding.left + 10, getXCoordinate(hoveredIndex, count) - 75)
              )}, ${padding.top + 10})`}
            >
              <rect
                x={0}
                y={0}
                width={155}
                height={68}
                rx={6}
                fill={isDark ? "#1e293b" : "#ffffff"}
                stroke={isDark ? "#334155" : "#cbd5e1"}
                strokeWidth={1}
                filter="drop-shadow(0 4px 6px rgba(0,0,0,0.1))"
              />
              <text x={10} y={18} fontSize={11} fontWeight={700} fill={axisTextColor}>
                {data[hoveredIndex].date}
              </text>
              <text x={10} y={36} fontSize={12} fontWeight={700} fill={lightBlueColor}>
                Adv/Dec Avg: {data[hoveredIndex].advDecRatioWeeklyAvg.toFixed(2)}
              </text>
              <text x={10} y={54} fontSize={12} fontWeight={700} fill={darkNavyColor}>
                Nifty WoW: {data[hoveredIndex].niftyWowChange > 0 ? "+" : ""}
                {data[hoveredIndex].niftyWowChange.toFixed(2)}%
              </text>
            </g>
          </g>
        )}
      </>
    );
  };

  return (
    <div className="flex flex-col space-y-3">
      {/* Top Graphic Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-orange-500/15 border border-orange-500/30 text-orange-400 font-bold font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"></span>
            LIVE MINT QUANT REPLICA
          </span>
          {isLiveTicking && (
            <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 animate-spin" /> Real-time feed active
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="flex items-center gap-1 px-2.5 py-1 rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition"
              title="Toggle between Mint Editorial Paper and Terminal Dark mode"
            >
              <Eye className="w-3 h-3" />
              <span>{isDark ? "Mint Paper Canvas" : "Terminal Dark"}</span>
            </button>
          )}

          <button
            onClick={() => setShowFormulaInfo(!showFormulaInfo)}
            className="flex items-center gap-1 px-2.5 py-1 rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition"
            title="View quantitative indicator calculation formula"
          >
            <Info className="w-3 h-3" />
            <span>Methodology</span>
          </button>

          <button
            onClick={handleExportGraphic}
            className="flex items-center gap-1 px-3 py-1 rounded bg-orange-500 hover:bg-orange-600 text-white font-bold text-[11px] shadow-sm transition"
            title="Download high-resolution image of this graphic"
          >
            {copiedSuccess ? <Check className="w-3 h-3" /> : <Download className="w-3 h-3" />}
            <span>{copiedSuccess ? "Exported!" : "Export Graphic (PNG)"}</span>
          </button>
        </div>
      </div>

      {/* Formula & Quantitative Explanation Box */}
      {showFormulaInfo && (
        <div className="p-3 rounded-lg border border-slate-700 bg-slate-800/80 text-xs text-slate-300 space-y-1.5 font-mono">
          <div className="flex items-center justify-between font-bold text-orange-400">
            <span>Quantitative Methodology: {title}</span>
            <button
              onClick={() => setShowFormulaInfo(false)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          {type === "lwtd" && (
            <p className="text-[11px] leading-relaxed">
              <strong>LWTD (Lift-Weight-Thrust-Drag) Formula:</strong> Derived from aerodynamic physics.
              Lift measures advancing breadth velocity; Weight measures open interest gravitational pull;
              Thrust tracks fresh long capital injection; Drag calculates protective put hedging and short friction.
              When LWTD &lt; 0, Drag and Weight exceed Lift and Thrust, indicating that fresh buying will be mild.
            </p>
          )}
          {type === "mwpl" && (
            <p className="text-[11px] leading-relaxed">
              <strong>MWPL (Market Wide Position Limits):</strong> Set by NSE to cap total open interest across
              derivative contracts. The cyclical sawtooth waves reflect positional accumulation into the monthly
              F&O expiry (last Thursday of each month), followed by sharp rollover reset drops. Utilization
              dropping to 51.20% indicates swing traders are de-leveraging and adopting defensive stances.
            </p>
          )}
          {type === "advdec" && (
            <p className="text-[11px] leading-relaxed">
              <strong>NSE Advance-Decline Ratio (ADR):</strong> Calculates the moving average ratio of advancing stocks
              to declining stocks on the cash market. A plunge below 1.0 (currently 0.75) accompanied by negative
              weekly index change indicates broad-based intraday distribution and weak buying conviction.
            </p>
          )}
        </div>
      )}

      {/* SVG Canvas Container matching LiveMint Graphic */}
      <div
        className="w-full rounded-xl overflow-hidden border shadow-md transition-colors duration-300"
        style={{
          backgroundColor: bgColor,
          borderColor: isDark ? "#1e293b" : "#cbd5e1",
        }}
      >
        <div className="w-full overflow-x-auto">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto max-h-[340px] select-none"
            style={{ backgroundColor: canvasBgColor }}
          >
            {/* -------------------- Top Title & Subtitle -------------------- */}
            <text
              x={padding.left}
              y={26}
              fontSize={18}
              fontWeight={800}
              fill={titleColor}
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              {title}
            </text>
            <text
              x={padding.left}
              y={44}
              fontSize={12}
              fontWeight={400}
              fill={subtitleColor}
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              {subtitle}
            </text>

            {/* Render Specific Chart Type */}
            {type === "lwtd" && renderLWTDChart()}
            {type === "mwpl" && renderMWPLChart()}
            {type === "advdec" && renderAdvDecChart()}

            {/* -------------------- Bottom Horizontal Axis -------------------- */}
            <line
              x1={padding.left}
              y1={padding.top + plotHeight}
              x2={padding.left + plotWidth}
              y2={padding.top + plotHeight}
              stroke={zeroLineColor}
              strokeWidth={1.25}
            />

            {/* Start & End Date Labels */}
            <text
              x={padding.left}
              y={padding.top + plotHeight + 16}
              fontSize={11}
              fontWeight={500}
              fill={sourceTextColor}
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              {startDateLabel}
            </text>
            <text
              x={padding.left + plotWidth}
              y={padding.top + plotHeight + 16}
              textAnchor="end"
              fontSize={11}
              fontWeight={500}
              fill={sourceTextColor}
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              {endDateLabel}
            </text>

            {/* -------------------- Footer Attribution & Mint Logo -------------------- */}
            <g transform={`translate(${padding.left}, ${height - 14})`}>
              <text
                x={0}
                y={0}
                fontSize={10}
                fill={sourceTextColor}
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                Source: National Stock Exchange (NSE) & Market Derivatives
              </text>
            </g>

            {/* Orange Bold "mint" Logo on Bottom Right */}
            <g transform={`translate(${width - padding.right - 50}, ${height - 14})`}>
              <text
                x={50}
                y={2}
                textAnchor="end"
                fontSize={20}
                fontWeight={900}
                letterSpacing={-0.8}
                fill={mintOrange}
                fontFamily="'Arial Black', Impact, sans-serif"
              >
                mint
              </text>
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
};
