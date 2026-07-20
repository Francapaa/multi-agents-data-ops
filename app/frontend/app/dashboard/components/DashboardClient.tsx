"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useDashboard } from "../hooks/useDashboard";
import { DashboardClientProps } from "../types";
import { PipelineStats } from "./PipelineStats";
import { PostsList } from "./PostsList";
import { ProjectStream } from "./ProjectStream";
import { ProjectsOverview } from "./ProjectsOverview";
import { SystemHealth } from "./SystemHealth";

const easeOut = [0.23, 1, 0.32, 1] as const;

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: easeOut },
  },
};

export function DashboardClient({
  streamProjectId,
  initialData,
  token,
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
  } = useDashboard(initialData ?? null);

  const hasPartialErrors = Object.keys(partialErrors).length > 0;
  const shouldReduce = useReducedMotion();

  return (
    <motion.div
      className="space-y-8"
      variants={shouldReduce ? undefined : containerVariants}
      initial={shouldReduce ? undefined : "hidden"}
      animate={shouldReduce ? undefined : "visible"}
    >
      {error ? (
        <p className="text-sm text-red-600 text-center">{error}</p>
      ) : null}

      {hasPartialErrors && !error ? (
        <p className="text-xs text-amber-600 text-center">
          Some data could not be loaded.
        </p>
      ) : null}

      <motion.div
        className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        variants={shouldReduce ? undefined : cardVariants}
      >
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
      </motion.div>

      {streamProjectId ? (
        <motion.div variants={shouldReduce ? undefined : cardVariants}>
          <ProjectStream
            projectId={streamProjectId}
            token={token}
            onComplete={refetch}
          />
        </motion.div>
      ) : null}

      <motion.div variants={shouldReduce ? undefined : cardVariants}>
        <PostsList posts={posts} isLoading={loading} />
      </motion.div>
    </motion.div>
  );
}
