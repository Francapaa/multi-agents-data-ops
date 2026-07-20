"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface CreateProjectButtonProps {
  onCreateProject?: () => void;
}

export function CreateProjectButton({ onCreateProject }: CreateProjectButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onCreateProject) {
      onCreateProject();
    } else {
      router.push("/new-project");
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
      className="relative w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg shadow-blue-600/25 btn-glow overflow-hidden group"
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        <svg
          className="w-5 h-5 transition-transform duration-200 group-hover:rotate-90"
          style={{ transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)" }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
        Start a Project
      </span>
    </motion.button>
  );
}
