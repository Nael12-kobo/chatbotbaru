"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

function getInitialDarkState(): boolean {
  if (typeof window === "undefined") return false;
  return (
    document.documentElement.classList.contains("dark") ||
    localStorage.getItem("theme") === "dark"
  );
}

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(getInitialDarkState);

  useEffect(() => {
    const isDarkMode = getInitialDarkState();
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
    document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "light" : "dark");
  };

  return (
    <Button
      onClick={toggleTheme}
      variant="outline"
      size="sm"
      className="size-9 p-0 rounded-full bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer shadow-sm flex items-center justify-center"
      title="Ubah Tema"
    >
      {isDark ? (
        <Sun className="size-4 text-yellow-400" />
      ) : (
        <Moon className="size-4 text-blue-600" />
      )}
    </Button>
  );
}