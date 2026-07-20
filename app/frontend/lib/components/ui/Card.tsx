"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
}

export function Card({ children, className = "", hoverable = false }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className={`bg-white dark:bg-gray-950 rounded-2xl ring-1 ring-slate-200/60 dark:ring-gray-800 p-5 ${
        hoverable ? "card-hover cursor-pointer" : ""
      } ${className}`}
    >
      {children}
    </motion.div>
  );
}

export default Card;