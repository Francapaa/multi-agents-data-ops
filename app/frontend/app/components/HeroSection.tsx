"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";

const easeOut = [0.23, 1, 0.32, 1] as const;

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easeOut },
  },
};

export function HeroSection() {
  const shouldReduce = useReducedMotion();
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (shouldReduce || !titleRef.current) return;
    // Trigger clip-path reveal after mount
    requestAnimationFrame(() => {
      titleRef.current?.classList.add("revealed");
    });
  }, [shouldReduce]);

  if (shouldReduce) {
    return (
      <section className="relative max-w-6xl mx-auto px-6 pt-28 pb-20 md:pt-36 md:pb-28 text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white leading-[1.1] mb-6 font-display">
          From PRD to{" "}
          <span className="heading-gradient">Blog Post</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
          Transform your Product Requirements Documents into polished,
          publication-ready blog posts with an AI-powered multi-agent pipeline.
        </p>
        <Link
          href="/auth/sign-up"
          className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-lg shadow-lg shadow-blue-200 dark:shadow-blue-900/50 btn-glow"
          style={{ transition: "transform 160ms cubic-bezier(0.23, 1, 0.32, 1)" }}
        >
          Start Transforming
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </section>
    );
  }

  return (
    <section className="relative max-w-6xl mx-auto px-6 pt-28 pb-20 md:pt-36 md:pb-28 text-center">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <h1
            ref={titleRef}
            className="clip-reveal text-5xl md:text-7xl font-bold text-gray-900 dark:text-white leading-[1.1] mb-6 font-display inline-block"
          >
            From PRD to{" "}
            <span className="heading-gradient">Blog Post</span>
          </h1>
        </motion.div>

        <motion.p
          variants={itemVariants}
          className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Transform your Product Requirements Documents into polished,
          publication-ready blog posts with an AI-powered multi-agent pipeline.
        </motion.p>

        <motion.div variants={itemVariants}>
          <Link
            href="/auth/sign-up"
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-lg shadow-lg shadow-blue-200 dark:shadow-blue-900/50 btn-glow"
            style={{ transition: "transform 160ms cubic-bezier(0.23, 1, 0.32, 1)" }}
          >
            Start Transforming
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
