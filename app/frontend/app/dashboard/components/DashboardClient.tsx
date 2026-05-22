"use client";

import { useDashboard } from "../hooks/useDashboard";
import { PipelineStats } from "./PipelineStats";
import { PostsList } from "./PostsList";
import { ProjectStream } from "./ProjectStream";
import { ProjectsOverview } from "./ProjectsOverview";
import { SystemHealth } from "./SystemHealth";

interface DashboardClientProps {
  accessToken: string | null;
  streamProjectId?: string;
}

export function DashboardClient({
  accessToken,
  streamProjectId,
}: DashboardClientProps) {
  const {
    overview,
    costs,
    health,
    posts,
    loading,
    error,
    partialErrors,
    refetch,
  } = useDashboard(accessToken);

  if (!accessToken) {
    return (
      <p className="text-center text-slate-600 py-8">
        Iniciá sesión para ver el dashboard.
      </p>
    );
  }

  const hasPartialErrors = Object.keys(partialErrors).length > 0;

  return (
    <div className="space-y-8">
      {error ? (
        <p className="text-sm text-red-600 text-center">{error}</p>
      ) : null}

      {hasPartialErrors && !error ? (
        <p className="text-xs text-amber-600 text-center">
          Algunos datos no pudieron cargarse.
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ProjectsOverview
          totalProjects={overview?.total ?? 0}
          isLoading={loading}
        />
        <PipelineStats costs={costs} isLoading={loading} />
        <SystemHealth
          overview={overview}
          health={health}
          isLoading={loading}
        />
      </div>

      {streamProjectId ? (
        <ProjectStream
          projectId={streamProjectId}
          accessToken={accessToken}
          onComplete={refetch}
        />
      ) : null}

      <PostsList posts={posts} isLoading={loading} />
    </div>
  );
}
