"use client";

import { motion } from "framer-motion";

interface ErrorMessageProps {
  message: string;
  className?: string;
}

export function ErrorMessage({ message, className = "" }: ErrorMessageProps) {
  if (!message) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm ${className}`}
    >
      {message}
    </motion.div>
  );
}

export default ErrorMessage;