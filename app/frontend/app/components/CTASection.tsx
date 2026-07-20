"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

const easing = [0.23, 1, 0.32, 1] as const;

export function CTASection() {
  const shouldReduce = useReducedMotion();

  const animProps = shouldReduce
    ? { initial: { opacity: 0 }, whileInView: { opacity: 1 }, viewport: { once: true }, transition: { duration: 0.3 } }
    : {};

  return (
    <section className="border-t border-gray-100 dark:border-gray-800">
      <div className="relative max-w-6xl mx-auto px-6 py-28 md:py-36 text-center">
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden
        >
          <div
            className="absolute -top-20 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full opacity-30 dark:opacity-20"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(37,99,235,0.2) 0%, transparent 60%)",
              filter: "blur(60px)",
            }}
          />
        </div>

        <motion.h2
          className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-5 font-display leading-[1.15]"
          initial={shouldReduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
          whileInView={shouldReduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: easing }}
          {...animProps}
        >
          Ready to streamline your documentation?
        </motion.h2>
        <motion.p
          className="text-lg text-gray-600 dark:text-gray-300 mb-10 max-w-xl mx-auto"
          initial={shouldReduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
          whileInView={shouldReduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: easing, delay: shouldReduce ? 0 : 0.1 }}
          {...animProps}
        >
          From rough PRD to polished blog post in minutes, not days.
        </motion.p>
        <motion.div
          initial={shouldReduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
          whileInView={shouldReduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: easing, delay: shouldReduce ? 0 : 0.2 }}
          {...animProps}
        >
          <Link
            href="/auth/sign-up"
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-lg shadow-lg shadow-blue-200 dark:shadow-blue-900/50 btn-glow"
            style={{ transition: "transform 160ms cubic-bezier(0.23, 1, 0.32, 1)" }}
          >
            Get Started Free
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
