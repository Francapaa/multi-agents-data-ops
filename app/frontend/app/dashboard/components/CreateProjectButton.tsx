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
      router.push("/dashboard/new-project");
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg shadow-blue-600/25 transition-colors duration-200"
    >
      <span className="flex items-center justify-center gap-2">
        <svg
          className="w-5 h-5"
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
