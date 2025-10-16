"use client";

import { Copy, Rows3 } from "lucide-react";

type Props = {
  variations: string[];
  onCopy: (text: string) => void;
};

export default function VariationsGrid({ variations, onCopy }: Props) {
  if (variations.length === 0) return null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
      {variations.map((v, i) => (
        <div key={i} className="card-glass p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="badge"><Rows3 className="size-3.5" /> Variação {i + 1}</div>
            <button className="btn-ghost px-2 py-1" onClick={() => onCopy(v)}><Copy className="size-4" /> Copiar</button>
          </div>
          <pre className="whitespace-pre-wrap text-sm">{v}</pre>
        </div>
      ))}
    </div>
  );
}
