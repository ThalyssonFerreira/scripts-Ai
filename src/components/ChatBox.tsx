"use client";

import { useState } from "react";
import { Loader2, Send, Shuffle, Tag, History } from "lucide-react";
import clsx from "clsx";

type Msg = { role: "user" | "assistant"; text: string };

type Props = {
  loading: boolean;
  messages: Msg[];
  onSubmit: (text: string) => Promise<void>;
  onClear: () => void;
  onVaria: () => Promise<void>;
  onTags: () => Promise<void>;
  canVaria: boolean;
  canTags: boolean;
};

export default function ChatBox({
  loading, messages, onSubmit, onClear, onVaria, onTags, canVaria, canTags,
}: Props) {
  const [chatInput, setChatInput] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = chatInput.trim();
    if (!text) return;
    setChatInput("");
    await onSubmit(text);
  }

  return (
    <div className="card-glass p-5 sm:p-6 grid gap-3">
      <div className="card-glass p-4 max-h-[320px] overflow-auto">
        {messages.length === 0 ? (
          <p className="text-slate-400 text-sm">
            Ex.: <em>“gera um roteiro de 30s, tom humor, para mães de primeira viagem, tema: rotina da manhã”</em>
          </p>
        ) : (
          <ul className="space-y-3">
            {messages.map((m, i) => (
              <li key={i} className={clsx("rounded-lg p-3", m.role === "user" ? "bg-white/10" : "bg-black/30")}>
                <div className="text-xs opacity-70 mb-1">{m.role === "user" ? "Você" : "IA"}</div>
                <div className="whitespace-pre-wrap text-sm">{m.text}</div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          className="input w-full"
          placeholder="Digite sua ideia…"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          disabled={loading}
        />
        <button type="submit" className={clsx("btn-primary", loading && "opacity-60 cursor-not-allowed")} disabled={loading}>
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          Enviar
        </button>
        <button type="button" onClick={onClear} className="btn-ghost">
          <History className="size-4" />
          Limpar
        </button>
      </form>

      <div className="flex items-center gap-3">
        <button type="button" onClick={onVaria} disabled={!canVaria} className={clsx("btn-ghost", !canVaria && "opacity-60 cursor-not-allowed")}>
          <Shuffle className="size-4" />
          Gerar 3 variações
        </button>
        <button type="button" onClick={onTags} disabled={!canTags} className={clsx("btn-ghost", !canTags && "opacity-60 cursor-not-allowed")}>
          <Tag className="size-4" />
          Títulos & Hashtags
        </button>
      </div>
    </div>
  );
}
