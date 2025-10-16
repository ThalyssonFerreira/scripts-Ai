import { useEffect, useState } from "react";
import type { SavedItem } from "@/lib/schema";

export function useHistory() {
  const [history, setHistory] = useState<SavedItem[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem("history");
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as SavedItem[];
        if (Array.isArray(parsed)) setHistory(parsed);
      } catch {}
    }
  }, []);

  function persist(items: SavedItem[]) {
    setHistory(items);
    localStorage.setItem("history", JSON.stringify(items));
  }

  function clear() {
    persist([]);
  }

  function setLike(id: string, like: boolean) {
    const next = history.map((h) => (h.id === id ? { ...h, like } : h));
    persist(next);
  }

  function restore(id: string) {
    return history.find((h) => h.id === id) || null;
  }

  return { history, persist, clear, setLike, restore };
}
