"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface ProjectsOverviewProps {
  totalProjects: number;
  isLoading: boolean;
}

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (value === 0) { setDisplay(0); return; }
    const start = performance.now();
    const duration = 600;
    let raf: number;

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <>{display}</>;
}

export function ProjectsOverview({ totalProjects, isLoading }: ProjectsOverviewProps) {
  return (
    <motion.div
      className="glass-card rounded-2xl p-6"
    >
      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-4">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      </div>
      <p className="text-sm text-slate-500 dark:text-gray-400 font-medium">
        Total Projects
      </p>
      {isLoading ? (
        <div className="mt-2 h-8 w-20 bg-slate-100 dark:bg-gray-800 rounded-lg" />
      ) : (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1], delay: 0.15 }}
          className="mt-1 text-4xl font-bold text-slate-900 dark:text-white font-display tracking-tight"
        >
          <AnimatedNumber value={totalProjects} />
        </motion.p>
      )}
    </motion.div>
  );
}
