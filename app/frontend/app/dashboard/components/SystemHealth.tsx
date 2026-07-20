"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { MetricsHealth, MetricsOverview } from "../types";

function AnimatedNumber({ value, decimals = 1 }: { value: number; decimals?: number }) {
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

interface SystemHealthProps {
  overview: MetricsOverview | null;
  health: MetricsHealth | null;
  isLoading: boolean;
}

export function SystemHealth({ overview, health, isLoading }: SystemHealthProps) {
  return (
    <motion.div
      className="glass-card rounded-2xl p-6"
    >
      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-4">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p className="text-sm text-slate-500 dark:text-gray-400 font-medium">
        System Health
      </p>
      {isLoading || !overview || !health ? (
        <div className="mt-3 space-y-2">
          <div className="h-5 bg-slate-100 dark:bg-gray-800 rounded" />
          <div className="h-5 bg-slate-100 dark:bg-gray-800 rounded w-3/4" />
        </div>
      ) : (
        <dl className="mt-3 space-y-3 text-sm">
          <div className="flex justify-between items-center gap-4">
            <dt className="text-slate-500 dark:text-gray-400 text-xs">Success rate</dt>
            <dd className="font-semibold text-emerald-600 dark:text-emerald-400">
              <AnimatedNumber value={overview.success_rate} decimals={1} />%
            </dd>
          </div>
          <div className="flex justify-between items-center gap-4">
            <dt className="text-slate-500 dark:text-gray-400 text-xs">Completed / Failed</dt>
            <dd className="font-semibold text-slate-900 dark:text-white">
              {overview.completed} / {overview.failed}
            </dd>
          </div>
          <div className="flex justify-between items-center gap-4">
            <dt className="text-slate-500 dark:text-gray-400 text-xs">Avg retries</dt>
            <dd className="font-semibold text-slate-900 dark:text-white">
              <AnimatedNumber value={health.avg_retries} decimals={2} />
            </dd>
          </div>
        </dl>
      )}
    </motion.div>
  );
}
