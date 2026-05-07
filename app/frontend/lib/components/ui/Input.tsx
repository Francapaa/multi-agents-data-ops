"use client";

import { motion } from "framer-motion";

interface InputProps {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
  minLength?: number;
  autoComplete?: string;
}

export function Input({ label, name, type = "text", required, placeholder, className = "", minLength, autoComplete }: InputProps) {
  const inputId = name.toLowerCase().replace(/\s+/g, "-");

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        id={inputId}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        minLength={minLength}
        autoComplete={autoComplete}
        className={`w-full px-4 py-3 rounded-lg border border-gray-200 transition-all duration-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${className}`}
      />
    </motion.div>
  );
}

export default Input;