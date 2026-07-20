"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { MetricsCosts } from "../types";

function AnimatedNumber({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (value === 0) { setDisplay(0); return; }
    const start = performance.now();
    const duration = 600;
    let raf: number;

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(eased * value);
      if (progress < 1) raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <>{display.toFixed(decimals)}</>;
}

interface PipelineStatsProps {
  costs: MetricsCosts | null;
  isLoading: boolean;
}

export function PipelineStats({ costs, isLoading }: PipelineStatsProps) {
  return (
    <motion.div
      className="glass-card rounded-2xl p-6"
    >
      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-4">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
      <p className="text-sm text-slate-500 dark:text-gray-400 font-medium">
        Pipeline Usage
      </p>
      {isLoading || !costs ? (
        <div className="mt-3 space-y-2">
          <div className="h-5 bg-slate-100 dark:bg-gray-800 rounded" />
          <div className="h-5 bg-slate-100 dark:bg-gray-800 rounded w-2/3" />
        </div>
      ) : (
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <div>
            <dt className="text-slate-500 dark:text-gray-400 text-xs">Input tokens</dt>
            <dd className="font-semibold text-slate-900 dark:text-white mt-0.5">
              <AnimatedNumber value={costs.input_tokens} />
            </dd>
          </div>
          <div>
            <dt className="text-slate-500 dark:text-gray-400 text-xs">Output tokens</dt>
            <dd className="font-semibold text-slate-900 dark:text-white mt-0.5">
              <AnimatedNumber value={costs.output_tokens} />
            </dd>
          </div>
          <div>
            <dt className="text-slate-500 dark:text-gray-400 text-xs">Cost (USD)</dt>
            <dd className="font-semibold text-blue-600 mt-0.5">
              $<AnimatedNumber value={costs.cost_usd} decimals={6} />
            </dd>
          </div>
          <div>
            <dt className="text-slate-500 dark:text-gray-400 text-xs">Avg time (s)</dt>
            <dd className="font-semibold text-slate-900 dark:text-white mt-0.5">
              <AnimatedNumber value={costs.avg_time_seconds} decimals={1} />
            </dd>
          </div>
        </dl>
      )}
    </motion.div>
  );
}
