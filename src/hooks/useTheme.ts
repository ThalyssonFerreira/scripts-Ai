import { useEffect, useState } from "react";
import { getSavedTheme, saveTheme } from "@/lib/utils";

export function useTheme() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const t = getSavedTheme();
    setTheme(t);
    document.documentElement.setAttribute("data-theme", t);
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    saveTheme(next);
  }

  return { theme, toggleTheme };
}
