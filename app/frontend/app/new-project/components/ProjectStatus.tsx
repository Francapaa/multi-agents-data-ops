"use client";

import { useEffect, useRef } from "react";
import { useProjectStream } from "@/app/dashboard/hooks/useProjectStream";

const STAGES = [
  { key: "research", label: "Investigando", color: "bg-blue-500" },
  { key: "writer", label: "Redactando", color: "bg-indigo-500" },
  { key: "fast_checker", label: "Verificando", color: "bg-violet-500" },
  { key: "polisher", label: "Puliendo", color: "bg-emerald-500" },
];

function stageIndex(status: string | null): number {
  if (!status) return -1;
  const idx = STAGES.findIndex((s) => status.startsWith(s.key));
  return idx;
}

interface ProjectStatusProps {
  projectId: string;
  onComplete?: () => void;
  token?: string | null;
}

export function ProjectStatus({ projectId, onComplete, token }: ProjectStatusProps) {
  const state = useProjectStream(projectId, () => {}, token);
  const hasOpenedRef = useRef(false);

  const current = stageIndex(state.status);
  const isError = !!state.error;
  const isComplete = !!state.complete;

  useEffect(() => {
    if (state.complete && !hasOpenedRef.current) {
      hasOpenedRef.current = true;
      window.open(`/new-project/${projectId}/result`, "_blank");
      onComplete?.();
    }
  }, [state.complete, projectId, onComplete]);

  return (
    <div className="space-y-4">
      {isError ? (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4">
          <p className="text-sm text-red-700 font-medium">Error en el pipeline</p>
          <p className="text-sm text-red-500 mt-1">{state.error}</p>
        </div>
      ) : isComplete && state.complete ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4">
          <p className="text-sm text-emerald-700 font-medium">Pipeline completado</p>
          <div className="mt-2 text-xs text-emerald-600 space-y-1">
            <p>Input tokens: {state.complete.total_input_tokens}</p>
            <p>Output tokens: {state.complete.total_output_tokens}</p>
            <p>Tiempo: {state.complete.execution_time}s</p>
            
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {STAGES.map((stage, i) => {
            const active = i === current;
            const done = i < current;
            return (
              <div key={stage.key} className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full shrink-0 transition-all duration-300 ${
                    done ? stage.color
                    : active ? `${stage.color} animate-pulse`
                    : "bg-slate-200"
                  }`}
                />
                <span
                  className={`text-sm transition-colors duration-300 ${
                    done || active ? "text-slate-800 font-medium" : "text-slate-400"
                  }`}
                >
                  {stage.label}
                </span>
                {active && state.progress != null ? (
                  <span className="text-xs text-slate-400 ml-auto">{state.progress}%</span>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
