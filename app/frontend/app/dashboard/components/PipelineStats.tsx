"use client";

import { motion } from "framer-motion";
import type { MetricsCosts } from "../types";

interface PipelineStatsProps {
  costs: MetricsCosts | null;
  isLoading: boolean;
}

export function PipelineStats({ costs, isLoading }: PipelineStatsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-md border border-emerald-100 p-5"
    >
      <p className="text-sm text-slate-500 uppercase tracking-wide font-medium">
        Pipeline (tokens y coste)
      </p>
      {isLoading || !costs ? (
        <div className="mt-3 space-y-2">
          <div className="h-4 bg-slate-100 rounded animate-pulse" />
          <div className="h-4 bg-slate-100 rounded animate-pulse w-2/3" />
        </div>
      ) : (
        <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-slate-500">Input tokens</dt>
            <dd className="font-semibold text-slate-900">
              {costs.input_tokens.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Output tokens</dt>
            <dd className="font-semibold text-slate-900">
              {costs.output_tokens.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Coste (USD)</dt>
            <dd className="font-semibold text-emerald-700">
              ${costs.cost_usd.toFixed(6)}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Tiempo medio (s)</dt>
            <dd className="font-semibold text-slate-900">
              {costs.avg_time_seconds.toFixed(1)}
            </dd>
          </div>
        </dl>
      )}
    </motion.div>
  );
}
