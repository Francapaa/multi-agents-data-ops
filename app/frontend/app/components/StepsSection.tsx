"use client";

import { motion, useReducedMotion } from "framer-motion";

const easing = [0.23, 1, 0.32, 1] as const;

const steps = [
  {
    number: "01",
    title: "Upload Your PRD",
    description:
      "Submit your Product Requirements Document. The platform parses and structures the content for AI processing.",
  },
  {
    number: "02",
    title: "AI Multi-Agent Pipeline",
    description:
      "Specialized agents research, write, fact-check, and polish your content with confidence-based validation.",
  },
  {
    number: "03",
    title: "Publish & Share",
    description:
      "Get a publication-ready blog post. Monitor token usage and costs throughout the process.",
  },
];

export function StepsSection() {
  const shouldReduce = useReducedMotion();

  return (
    <section className="border-t border-gray-100 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-6 py-24 md:py-32">
        <motion.h2
          className="text-4xl md:text-5xl font-bold text-center text-gray-900 dark:text-white mb-20 font-display"
          initial={shouldReduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
          whileInView={shouldReduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: easing }}
        >
          How It Works
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-12 md:gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              className="text-center"
              initial={shouldReduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
              whileInView={shouldReduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, ease: easing, delay: shouldReduce ? 0 : i * 0.12 }}
            >
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6 font-display tracking-tight">
                {step.number}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {step.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed max-w-sm mx-auto text-[15px]">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
