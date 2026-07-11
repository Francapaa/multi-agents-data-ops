"use client";

import { useState } from "react";
import { ProjectStatus } from "../../components/ProjectStatus";

interface ProjectViewProps {
  projectId: string;
  token?: string | null;
}

export function ProjectView({ projectId, token }: ProjectViewProps) {
  const [isComplete, setIsComplete] = useState(false);

  return (
    <div className="space-y-8">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm px-6 py-5">
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`w-2 h-2 rounded-full ${
              isComplete ? "bg-emerald-500" : "bg-emerald-500 animate-pulse"
            }`}
          />
          <span className="text-sm font-medium text-slate-700">
            {isComplete ? "Pipeline completado" : "Pipeline en ejecución"}
          </span>
        </div>

        <ProjectStatus projectId={projectId} token={token} onComplete={() => setIsComplete(true)} />
      </div>

      <div className="flex justify-center">
        <a
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al dashboard
        </a>
      </div>
    </div>
  );
}
