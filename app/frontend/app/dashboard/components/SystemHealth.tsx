"use client";

import { motion } from "framer-motion";
import type { MetricsHealth, MetricsOverview } from "../types";

interface SystemHealthProps {
  overview: MetricsOverview | null;
  health: MetricsHealth | null;
  isLoading: boolean;
}

export function SystemHealth({ overview, health, isLoading }: SystemHealthProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="bg-white rounded-2xl shadow-md border border-violet-100 p-5"
    >
      <p className="text-sm text-slate-500 uppercase tracking-wide font-medium">
        Salud del sistema
      </p>
      {isLoading || !overview || !health ? (
        <div className="mt-3 space-y-2">
          <div className="h-4 bg-slate-100 rounded animate-pulse" />
          <div className="h-4 bg-slate-100 rounded animate-pulse w-3/4" />
        </div>
      ) : (
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Tasa de éxito</dt>
            <dd className="font-semibold text-violet-700">
              {overview.success_rate.toFixed(1)}%
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Completados / fallidos</dt>
            <dd className="font-semibold text-slate-900">
              {overview.completed} / {overview.failed}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Reintentos (media)</dt>
            <dd className="font-semibold text-slate-900">
              {health.avg_retries.toFixed(2)}
            </dd>
          </div>
        </dl>
      )}
    </motion.div>
  );
}
