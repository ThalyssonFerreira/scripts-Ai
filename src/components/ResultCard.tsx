"use client";

import { Copy, ThumbsDown, ThumbsUp, Download } from "lucide-react";
import clsx from "clsx";

type Props = {
  roteiro: string;
  charCount: number;
  onCopy: () => void;
  onLike: (like: boolean) => void;
  onDownloadTxt: () => void;
  onDownloadMd: () => void;
};

export default function ResultCard({
  roteiro, charCount, onCopy, onLike, onDownloadTxt, onDownloadMd,
}: Props) {
  return (
    <div className="card-glass p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="section-title">Roteiro</h2>
        <div className="flex items-center gap-3 text-sm text-slate-300">
          <span>{charCount} caracteres</span>
          <button onClick={onCopy} disabled={!roteiro} className={clsx("btn-ghost px-3 py-1.5", !roteiro && "opacity-50 cursor-not-allowed")}>
            <Copy className="size-4" />
            Copiar
          </button>
          <button onClick={onDownloadTxt} disabled={!roteiro} className={clsx("btn-ghost px-3 py-1.5", !roteiro && "opacity-50 cursor-not-allowed")}>
            <Download className="size-4" /> .txt
          </button>
          <button onClick={onDownloadMd} disabled={!roteiro} className={clsx("btn-ghost px-3 py-1.5", !roteiro && "opacity-50 cursor-not-allowed")}>
            <Download className="size-4" /> .md
          </button>
        </div>
      </div>
      <pre className="whitespace-pre-wrap rounded-xl border border-white/10 bg-black/30 p-4 mt-3 min-h-[180px]">{roteiro || "—"}</pre>
      {roteiro && (
        <div className="mt-3 flex items-center gap-2">
          <button className="btn-ghost" onClick={() => onLike(true)}><ThumbsUp className="size-4" /> Gostei</button>
          <button className="btn-ghost" onClick={() => onLike(false)}><ThumbsDown className="size-4" /> Não curti</button>
        </div>
      )}
    </div>
  );
}
