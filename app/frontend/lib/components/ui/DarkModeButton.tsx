"use client";

import { useTheme } from "@teispace/next-themes";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-gray-200 dark:bg-gray-800 text-black dark:text-white transition-colors"
    >
      {resolvedTheme === "dark" ? "Modo claro" : "Modo oscuro"}
    </button>
  );
}
