"use client";

import { motion } from "framer-motion";

interface ProjectsOverviewProps {
  totalProjects: number;
  isLoading: boolean;
}

export function ProjectsOverview({ totalProjects, isLoading }: ProjectsOverviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
      className="bg-white rounded-2xl shadow-lg border border-blue-100 p-8"
    >
      <p className="text-sm text-slate-500 uppercase tracking-wide font-medium">
        Total Projects
      </p>
      {isLoading ? (
        <div className="mt-2 h-12 w-20 bg-slate-100 rounded-lg animate-pulse" />
      ) : (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.1 }}
          className="mt-2 text-5xl font-bold text-slate-900"
        >
          {totalProjects}
        </motion.p>
      )}
    </motion.div>
  );
}
