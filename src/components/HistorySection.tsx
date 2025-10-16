"use client";

import { Copy, History, Rows3, ThumbsDown, ThumbsUp } from "lucide-react";
import type { SavedItem } from "@/lib/schema";

type Props = {
  items: SavedItem[];
  onCopy: (text: string) => void;
  onRestore: (id: string) => void;
  onClearAll: () => void;
  onLike: (id: string, like: boolean) => void;
};

export default function HistorySection({
  items, onCopy, onRestore, onClearAll, onLike,
}: Props) {
  const normal = items.filter((h) => h.kind === "normal");
  const vars = items.filter((h) => h.kind === "variation");

  return (
    <div className="card-glass p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="section-title">Histórico</h2>
        {items.length > 0 && (
          <button className="btn-ghost" onClick={onClearAll}>
            <History className="size-4" />
            Limpar histórico
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <p className="text-slate-400 mt-2">Nada aqui ainda. Gere um roteiro e ele aparece nesta lista.</p>
      ) : (
        <div className="grid gap-6">
          <section>
            <h3 className="mb-2 text-sm font-medium opacity-80">Roteiros</h3>
            {normal.length === 0 ? (
              <p className="text-slate-500 text-sm">Sem roteiros normais ainda.</p>
            ) : (
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {normal.map((h) => (
                  <li key={h.id} className="card-glass p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-slate-400">{new Date(h.createdAt).toLocaleString()}</div>
                      <span className="badge">Roteiro</span>
                    </div>
                    <div className="mt-2 text-sm font-medium">{h.values.tema}</div>
                    <pre className="whitespace-pre-wrap text-sm mt-2 max-h-48 overflow-auto">{h.roteiro}</pre>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <button className="btn-ghost" onClick={() => onCopy(h.roteiro)}><Copy className="size-4" /> Copiar</button>
                      <button className="btn-ghost" onClick={() => onRestore(h.id)}><Rows3 className="size-4" /> Restaurar</button>
                      <button className={`btn-ghost ${h.like === true ? "opacity-60" : ""}`} onClick={() => onLike(h.id, true)}><ThumbsUp className="size-4" /> Gostei</button>
                      <button className={`btn-ghost ${h.like === false ? "opacity-60" : ""}`} onClick={() => onLike(h.id, false)}><ThumbsDown className="size-4" /> Não curti</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h3 className="mb-2 text-sm font-medium opacity-80">Variações</h3>
            {vars.length === 0 ? (
              <p className="text-slate-500 text-sm">Sem variações ainda.</p>
            ) : (
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vars.map((h) => (
                  <li key={h.id} className="card-glass p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-slate-400">{new Date(h.createdAt).toLocaleString()}</div>
                      <span className="badge">Variação</span>
                    </div>
                    <div className="mt-2 text-sm font-medium">{h.values.tema}</div>
                    <pre className="whitespace-pre-wrap text-sm mt-2 max-h-48 overflow-auto">{h.roteiro}</pre>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <button className="btn-ghost" onClick={() => onCopy(h.roteiro)}><Copy className="size-4" /> Copiar</button>
                      <button className="btn-ghost" onClick={() => onRestore(h.id)}><Rows3 className="size-4" /> Restaurar</button>
                      <button className={`btn-ghost ${h.like === true ? "opacity-60" : ""}`} onClick={() => onLike(h.id, true)}><ThumbsUp className="size-4" /> Gostei</button>
                      <button className={`btn-ghost ${h.like === false ? "opacity-60" : ""}`} onClick={() => onLike(h.id, false)}><ThumbsDown className="size-4" /> Não curti</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
