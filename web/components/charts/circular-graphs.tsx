'use client';

import { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';

interface CircularDonutProps {
  percentage: number;
  label: string;
  sublabel: string;
  trend?: 'up' | 'down';
  trendValue?: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function CircularDonutGraph({
  percentage,
  label,
  sublabel,
  trend = 'up',
  size = 56,
  strokeWidth = 6.5,
  className = '',
}: CircularDonutProps) {
  const [animatedPct, setAnimatedPct] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPct(percentage);
    }, 150);
    return () => clearTimeout(timer);
  }, [percentage]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedPct / 100) * circumference;

  const strokeColor = percentage >= 70 ? '#10B981' : percentage >= 35 ? '#3B82F6' : '#8B5CF6';

  return (
    <div className={`flex items-center gap-3.5 group cursor-pointer ${className}`}>
      {/* SVG Donut Ring */}
      <div className="relative shrink-0 flex items-center justify-center" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="-rotate-90 transform transition-transform duration-500 group-hover:scale-105"
        >
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#242B3D"
            strokeWidth={strokeWidth}
          />
          {/* Animated active stroke */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Cutout or Arrow Indicator */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-5 h-5 rounded-full bg-[#181D2D] border border-white/[0.1] shadow-sm flex items-center justify-center">
            {trend === 'up' ? (
              <ArrowUpRight className="w-3 h-3 text-emerald-400" />
            ) : (
              <ArrowDownRight className="w-3 h-3 text-rose-400" />
            )}
          </div>
        </div>
      </div>

      {/* Metric details */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-1">
          <p className="text-sm font-bold text-white tracking-tight font-display group-hover:text-blue-400 transition-colors">
            {label}
          </p>
          {trend === 'up' ? (
            <span className="text-[10px] text-emerald-400 font-semibold">↗</span>
          ) : (
            <span className="text-[10px] text-rose-400 font-semibold">↙</span>
          )}
        </div>
        <p className="text-xs text-zinc-400 font-medium capitalize mt-0.5">{sublabel}</p>
      </div>
    </div>
  );
}

interface MultiSegmentDonutProps {
  segments: {
    label: string;
    value: number;
    color: string;
    percentage: number;
  }[];
  totalLabel: string;
  totalValue: string | number;
  size?: number;
  showLegend?: boolean;
}

export function MultiSegmentDonutChart({
  segments,
  totalLabel,
  totalValue,
  size = 140,
  showLegend = true,
}: MultiSegmentDonutProps) {
  const [mounted, setMounted] = useState(false);
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    setMounted(true);
  }, []);

  let accumulatedPercent = 0;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="-rotate-90 transform transition-transform duration-500 hover:scale-105"
        >
          {/* Base track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#242B3D"
            strokeWidth={strokeWidth}
          />

          {/* Slices */}
          {segments.map((seg, i) => {
            const strokeDasharray = `${(seg.percentage / 100) * circumference} ${circumference}`;
            const strokeDashoffset = mounted
              ? -((accumulatedPercent / 100) * circumference)
              : circumference;
            accumulatedPercent += seg.percentage;

            if (seg.percentage === 0) return null;

            return (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            );
          })}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
          <span className="text-xl font-bold font-display text-white leading-none">{totalValue}</span>
          {totalLabel && (
            <span className="text-[10px] uppercase font-semibold tracking-wider text-zinc-400 mt-1">{totalLabel}</span>
          )}
        </div>
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-4 w-full">
          {segments.map((seg, idx) => (
            <div key={idx} className="flex items-center gap-1.5 text-xs">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
              <span className="text-zinc-400 truncate">{seg.label}:</span>
              <span className="font-semibold text-white ml-auto">{seg.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface ExecutiveProgressRingProps {
  percentage: number;
  title: string;
  description: string;
  size?: number;
}

export function ExecutiveProgressRing({
  percentage,
  title,
  description,
  size = 72,
}: ExecutiveProgressRingProps) {
  const [animatedPct, setAnimatedPct] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPct(percentage);
    }, 200);
    return () => clearTimeout(timer);
  }, [percentage]);

  const strokeWidth = 7;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedPct / 100) * circumference;
  const strokeColor = percentage >= 70 ? '#10B981' : percentage >= 35 ? '#3B82F6' : '#8B5CF6';

  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#181D2D] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300 shadow-sm">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#242B3D"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-white font-display">{percentage}%</span>
        </div>
      </div>
      <div>
        <h4 className="text-xs font-bold text-white uppercase tracking-wider">{title}</h4>
        <p className="text-xs text-zinc-400 mt-0.5">{description}</p>
      </div>
    </div>
  );
}
