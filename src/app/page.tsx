"use client";

import { useMemo, useState } from "react";
import { toast, Toaster } from "sonner";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import HeaderBar from "@/components/HeaderBar";
import FormGenerator from "@/components/FormGenerator";
import ChatBox from "@/components/ChatBox";
import ResultCard from "@/components/ResultCard";
import VariationsGrid from "@/components/VariationsGrid";
import HistorySection from "@/components/HistorySection";
import { useHistory } from "@/hooks/useHistory";
import { copyText, downloadText, uid } from "@/lib/utils";
import type { FormData, SavedItem, UIMode } from "@/lib/schema";
import { parseChatToFormData } from "@/lib/schema";

export default function Page() {
  const { history, persist, clear, setLike, restore } = useHistory();

  const [mode, setMode] = useState<UIMode>("form");
  const [formValues, setFormValues] = useState<FormData>({ tema: "Peixe-leão é praga no Brasil", duracaoSeg: 30, tom: "educativo", persona: "curiosos de biologia" });
  const [roteiro, setRoteiro] = useState("");
  const [variations, setVariations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [genLoading, setGenLoading] = useState(false);
  const [thLoading, setThLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([]);

  const charCount = useMemo(() => roteiro.length, [roteiro]);

  function persistAdd(item: SavedItem) {
    const newHist = [item, ...history].slice(0, 200);
    persist(newHist);
  }

  function clearAll() {
    setRoteiro("");
    setVariations([]);
    setChatMessages([]);
    setFormValues({ tema: "", duracaoSeg: 30, tom: "educativo", persona: "" });
  }

  async function onSubmit(values: FormData) {
    setLoading(true);
    setVariations([]);
    setRoteiro("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Falha ao gerar");
      const text: string = data.roteiro;
      setRoteiro(text);
      persistAdd({ id: uid(), kind: "normal", createdAt: Date.now(), values, roteiro: text, like: null });
      if (mode === "chat") setChatMessages((m) => [...m, { role: "assistant", text }]);
      toast.success("Roteiro gerado", { icon: <CheckCircle2 /> });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro desconhecido";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function generateVariations() {
    setGenLoading(true);
    setVariations([]);
    setRoteiro("");
    const values = formValues;
    try {
      const calls = [1, 2, 3].map((i) =>
        fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...values, tema: `${values.tema} (variação ${i})` }),
        }).then((r) => r.json())
      );
      const results = await Promise.all(calls);
      const ok = results.filter((r) => r?.ok && typeof r.roteiro === "string").map((r) => r.roteiro as string);
      setVariations(ok);
      const items: SavedItem[] = ok.map((text, idx) => ({
        id: uid(),
        kind: "variation",
        createdAt: Date.now(),
        values: { ...values, tema: `${values.tema} (variação ${idx + 1})` },
        roteiro: text,
        like: null,
      }));
      persist([...items, ...history].slice(0, 200));
      if (ok.length === 0) throw new Error("Falha ao gerar variações");
      toast.success(`Geradas ${ok.length} variações`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro desconhecido";
      toast.error(msg);
    } finally {
      setGenLoading(false);
    }
  }

  async function genTitlesHashtags() {
    if (!roteiro) {
      toast.message("Gere um roteiro primeiro.");
      return;
    }
    setThLoading(true);
    try {
      const values = formValues;
      const prompt =
        `Gere 5 títulos curtos e 15 hashtags em PT-BR para o roteiro abaixo, sem explicações.\n` +
        `Formato:\n- TÍTULOS:\n1) ...\n2) ...\n3) ...\n4) ...\n5) ...\n\n- HASHTAGS:\n#...\n#...\n(uma por linha)\n\nROTEIRO:\n${roteiro}`;
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, tema: prompt }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Falha ao gerar títulos/hashtags");
      const text: string = data.roteiro;
      await copyText(text);
      toast.success("Títulos e hashtags gerados (copiados)");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro desconhecido";
      toast.error(msg);
    } finally {
      setThLoading(false);
    }
  }

  function likeFromCurrent(v: boolean) {
    if (!roteiro) return;
    const item = history.find((h) => h.roteiro === roteiro);
    if (!item) return;
    setLike(item.id, v);
    toast.success(v ? "Marcado como gostei" : "Marcado como não curti");
  }

  function restoreFromHistory(id: string) {
    const item = restore(id);
    if (!item) return;
    setFormValues(item.values);
    setRoteiro(item.roteiro);
    toast.success("Roteiro restaurado");
  }

  async function submitChat(text: string) {
    setChatMessages((m) => [...m, { role: "user", text }]);
    const parsed = parseChatToFormData(text);
    setFormValues(parsed);

    const wantsVariations = /\bvaria(?:c|ç)oes?\s*3\b|\b3\s*varia(?:c|ç)oes?\b/i.test(text);
    if (wantsVariations) {
      await generateVariations();
      return;
    }
    await onSubmit(parsed);
  }

  return (
    <main className="min-h-screen">
      <Toaster richColors />
      <HeaderBar />

      <div id="top" className="relative">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mx-auto max-w-6xl px-6 pt-10 pb-4">
          <div className="space-y-2">
            <div className="badge"><span>Gerador de Scripts • IA</span></div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Reels/TikTok</h1>
            <p className="text-slate-300/90 max-w-2xl">Roteiros curtos, diretos e com retenção alta.</p>
          </div>
        </motion.div>

        <motion.div id="form" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }} className="mx-auto max-w-6xl px-6 pb-10">
          {mode === "form" ? (
            <FormGenerator
              disabled={loading}
              loadingVaria={genLoading}
              loadingTags={thLoading}
              onSubmit={onSubmit}
              onClear={clearAll}
              onVaria={generateVariations}
              onTags={genTitlesHashtags}
              setValues={setFormValues}
            />
          ) : (
            <ChatBox
              loading={loading}
              messages={chatMessages}
              onSubmit={submitChat}
              onClear={() => { setChatMessages([]); }}
              onVaria={generateVariations}
              onTags={genTitlesHashtags}
              canVaria={!genLoading}
              canTags={!thLoading && !!roteiro}
            />
          )}

          <div className="mt-6 mb-2 text-center">
            <p className="text-slate-400 text-sm sm:text-base">
              💬 Não quer preencher o formulário? <span className="text-blue-400 font-medium">Use o modo chat abaixo!</span>
            </p>
          </div>

          <div className="mt-3 flex flex-wrap justify-center gap-3">
            <button
              className={`btn-ghost px-5 py-2 rounded-lg transition ${mode === "form" ? "bg-blue-600/20 text-blue-300 ring-2 ring-blue-500/50" : "hover:bg-slate-800/50"}`}
              onClick={() => setMode("form")}
            >
              Formulário
            </button>
            <button
              className={`btn-ghost px-5 py-2 rounded-lg transition ${mode === "chat" ? "bg-blue-600/20 text-blue-300 ring-2 ring-blue-500/50" : "hover:bg-slate-800/50"}`}
              onClick={() => setMode("chat")}
            >
              Chat
            </button>
          </div>
        </motion.div>

        <motion.div id="result" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="mx-auto max-w-6xl px-6 pb-12">
          <ResultCard
            roteiro={roteiro}
            charCount={charCount}
            onCopy={() => copyText(roteiro)}
            onLike={likeFromCurrent}
            onDownloadTxt={() => downloadText("roteiro.txt", roteiro)}
            onDownloadMd={() => downloadText("roteiro.md", roteiro)}
          />
          <VariationsGrid variations={variations} onCopy={(t) => copyText(t)} />
        </motion.div>

        <motion.div id="history" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }} className="mx-auto max-w-6xl px-6 pb-24">
          <HistorySection
            items={history}
            onCopy={(t) => copyText(t)}
            onRestore={restoreFromHistory}
            onClearAll={clear}
            onLike={setLike}
          />
        </motion.div>
      </div>
    </main>
  );
}
