"use client";

import { motion } from "framer-motion";
import { useProjectStream } from "../hooks/useProjectStream";

interface ProjectStreamProps {
  projectId: string | null | undefined;
  onComplete?: () => void;
  token?: string | null;
}

export function ProjectStream({
  projectId,
  onComplete,
  token,
}: ProjectStreamProps) {
  const state = useProjectStream(projectId, (ev) => {
    if (ev === "complete") onComplete?.();
  }, token);

  if (!projectId) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
        </span>
        <p className="text-sm font-medium text-slate-900 dark:text-white">
          Pipeline Live
        </p>
      </div>
      {state.error ? (
        <p className="text-sm text-red-500">{state.error}</p>
      ) : (
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-gray-400">Status</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium">
              {state.status ?? "connecting…"}
            </span>
          </div>
          {state.progress != null ? (
            <div>
              <div className="h-2 bg-slate-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full"
                  style={{ width: `${Math.min(100, state.progress)}%`, transition: "width 400ms cubic-bezier(0.23, 1, 0.32, 1)" }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-1.5 text-right">{state.progress}%</p>
            </div>
          ) : null}
          {state.complete ? (
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-gray-400 pt-2 border-t border-slate-100 dark:border-gray-800">
              <span>in {state.complete.total_input_tokens}</span>
              <span>out {state.complete.total_output_tokens}</span>
              <span>{state.complete.execution_time}s</span>
            </div>
          ) : null}
        </div>
      )}
    </motion.div>
  );
}
