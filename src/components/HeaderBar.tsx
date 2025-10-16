"use client";

import { SunMedium, MoonStar } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import Link from "next/link";

export default function HeaderBar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="header-blur">
      <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
        <nav className="flex items-center gap-4 text-sm">
          <a href="#top" className="badge">Início</a>
          <a href="#form" className="badge">Gerar</a>
          <a href="#result" className="badge">Resultados</a>
          <a href="#history" className="badge">Histórico</a>
          <Link href="/sobre" className="badge hover:text-blue-400 transition">
            Sobre
          </Link>
        </nav>
        <button onClick={toggleTheme} className="btn-ghost" aria-label="Alternar tema">
          {theme === "dark" ? <SunMedium className="size-4" /> : <MoonStar className="size-4" />}
          {theme === "dark" ? "Claro" : "Escuro"}
        </button>
      </div>
    </header>
  );
}
