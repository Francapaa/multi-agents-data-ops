"use client";

import { useCallback, useEffect, useState } from "react";
import {
  MetricsCosts,
  MetricsHealth,
  MetricsOverview,
  RecentPostRow,
} from "../types";
import { PipelineStats } from "./PipelineStats";
import { PostsList } from "./PostsList";
import { ProjectStream } from "./ProjectStream";
import { ProjectsOverview } from "./ProjectsOverview";
import { SystemHealth } from "./SystemHealth";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

interface DashboardClientProps {
  accessToken: string | null;
  streamProjectId?: string;
}

export function DashboardClient({
  accessToken,
  streamProjectId,
}: DashboardClientProps) {
  const [overview, setOverview] = useState<MetricsOverview | null>(null);
  const [costs, setCosts] = useState<MetricsCosts | null>(null);
  const [health, setHealth] = useState<MetricsHealth | null>(null);
  const [posts, setPosts] = useState<RecentPostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMetrics = useCallback(async () => {
    if (!accessToken || !BACKEND_URL) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const headers = { Authorization: `Bearer ${accessToken}` };
      const [ov, co, he, rp] = await Promise.all([
        fetch(`${BACKEND_URL}/api/metrics/overview`, { headers, cache: "no-store" }),
        fetch(`${BACKEND_URL}/api/metrics/costs`, { headers, cache: "no-store" }),
        fetch(`${BACKEND_URL}/api/metrics/health`, { headers, cache: "no-store" }),
        fetch(`${BACKEND_URL}/api/metrics/recent-posts`, {
          headers,
          cache: "no-store",
        }),
      ]);
      if (!ov.ok || !co.ok || !he.ok || !rp.ok) {
        throw new Error("No se pudieron cargar las métricas");
      }
      setOverview(await ov.json());
      setCosts(await co.json());
      setHealth(await he.json());
      const recent = await rp.json();
      setPosts(recent.posts ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  if (!accessToken) {
    return (
      <p className="text-center text-slate-600 py-8">
        Iniciá sesión para ver el dashboard.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {error ? (
        <p className="text-sm text-red-600 text-center">{error}</p>
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
          onComplete={loadMetrics}
        />
      ) : null}

      <PostsList posts={posts} isLoading={loading} />
    </div>
  );
}
