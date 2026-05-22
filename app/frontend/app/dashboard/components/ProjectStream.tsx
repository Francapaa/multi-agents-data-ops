"use client";

import { motion } from "framer-motion";
import { useProjectStream } from "../hooks/useProjectStream";

interface ProjectStreamProps {
  projectId: string | null | undefined;
  onComplete?: () => void;
}

export function ProjectStream({
  projectId,
  onComplete,
}: ProjectStreamProps) {
  const state = useProjectStream(projectId, (ev) => {
    if (ev === "complete") onComplete?.();
  });

  if (!projectId) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900 text-slate-100 rounded-2xl p-5 border border-slate-700"
    >
      <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">
        Pipeline en vivo (SSE)
      </p>
      {state.error ? (
        <p className="mt-2 text-sm text-red-400">{state.error}</p>
      ) : (
        <div className="mt-2 space-y-1 text-sm">
          <p>
            Estado:{" "}
            <span className="font-mono text-emerald-300">
              {state.status ?? "conectando…"}
            </span>
          </p>
          {state.progress != null ? (
            <div className="mt-2">
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${Math.min(100, state.progress)}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">{state.progress}%</p>
            </div>
          ) : null}
          {state.complete ? (
            <p className="text-xs text-slate-400 mt-2 font-mono">
              OK · in {state.complete.total_input_tokens} / out{" "}
              {state.complete.total_output_tokens} · {state.complete.execution_time}s
            </p>
          ) : null}
        </div>
      )}
    </motion.div>
  );
}
