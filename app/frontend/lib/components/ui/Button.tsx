"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ButtonProps {
  variant?: "primary" | "secondary" | "outline";
  isLoading?: boolean;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
}

const variants = {
  primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200",
  secondary: "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-md",
  outline: "bg-transparent hover:bg-gray-50 text-gray-700 border border-gray-200",
};

export function Button({ variant = "primary", isLoading, children, className = "", disabled, type = "submit", onClick }: ButtonProps) {
  return (
    <motion.button
      type={type}
      disabled={disabled || isLoading}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`w-full py-3 px-4 font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      style={{ transition: "transform 160ms cubic-bezier(0.23, 1, 0.32, 1)" }}
    >
      {isLoading ? "Loading..." : children}
    </motion.button>
  );
}

export default Button;