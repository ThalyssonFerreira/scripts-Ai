"use client";

import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { FormData } from "@/lib/schema";
import { schema, PRESETS } from "@/lib/schema";
import clsx from "clsx";
import { Wand2, Loader2, Shuffle, Tag, History } from "lucide-react";
import PresetGrid from "./PresetGrid";

type Props = {
  disabled: boolean;
  loadingVaria: boolean;
  loadingTags: boolean;
  onSubmit: SubmitHandler<FormData>;
  onClear: () => void;
  onVaria: () => void;
  onTags: () => void;
  setValues: (v: FormData) => void;
};

const fieldClass =
  "w-full rounded-xl border border-slate-700/80 bg-slate-900/70 text-slate-100 placeholder-slate-400 " +
  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition " +
  "min-h-12 px-4 py-3 text-base md:text-lg";

const selectClass = fieldClass + " appearance-none";

export default function FormGenerator({
  disabled, loadingVaria, loadingTags, onSubmit, onClear, onVaria, onTags, setValues,
}: Props) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { tema: "Peixe-leão é praga no Brasil", duracaoSeg: 30, tom: "educativo", persona: "curiosos de biologia" },
    mode: "onChange",
  });

  function applyPreset(label: string) {
    const p = PRESETS.find((x) => x.label === label);
    if (!p) return;
    form.setValue("tema", p.tema, { shouldValidate: true });
    form.setValue("persona", p.persona, { shouldValidate: true });
    form.setValue("tom", p.tom, { shouldValidate: true });
    form.setValue("duracaoSeg", p.duracaoSeg, { shouldValidate: true });
  }

  function handleSubmitInternal(data: FormData) {
    setValues(data);
    return onSubmit(data);
  }

  return (
    <div className="card-glass p-6 md:p-8 space-y-6">
      <PresetGrid onPick={applyPreset} />

      <form onSubmit={form.handleSubmit(handleSubmitInternal)} className="grid gap-6">
        <label className="grid gap-2 min-w-0">
          <span className="text-base md:text-lg font-medium text-slate-200">Tema</span>
          <input
            {...form.register("tema")}
            className={fieldClass}
            placeholder="Ex.: Dicas para iniciantes em musculação"
            autoComplete="off"
          />
          {form.formState.errors.tema && (
            <span className="text-red-400 text-sm md:text-base">{form.formState.errors.tema.message}</span>
          )}
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          <label className="grid gap-2 min-w-0">
            <span className="text-base md:text-lg font-medium text-slate-200">Duração (seg)</span>
            <input
              type="number"
              min={10}
              max={90}
              inputMode="numeric"
              {...form.register("duracaoSeg", { valueAsNumber: true })}
              className={fieldClass}
            />
            {form.formState.errors.duracaoSeg && (
              <span className="text-red-400 text-sm md:text-base">{form.formState.errors.duracaoSeg.message}</span>
            )}
          </label>

          <label className="grid gap-2 min-w-0">
            <span className="text-base md:text-lg font-medium text-slate-200">Tom</span>
            <select {...form.register("tom")} className={selectClass}>
              <option className="bg-slate-900 text-slate-100" value="educativo">Educativo</option>
              <option className="bg-slate-900 text-slate-100" value="humor">Humor</option>
              <option className="bg-slate-900 text-slate-100" value="autoridade">Autoridade</option>
              <option className="bg-slate-900 text-slate-100" value="emocional">Emocional</option>
            </select>
            {form.formState.errors.tom && (
              <span className="text-red-400 text-sm md:text-base">{form.formState.errors.tom.message}</span>
            )}
          </label>

          <label className="grid gap-2 min-w-0">
            <span className="text-base md:text-lg font-medium text-slate-200">Persona</span>
            <input
              {...form.register("persona")}
              className={fieldClass}
              placeholder="Ex.: donos de pequenos negócios"
              autoComplete="off"
            />
            {form.formState.errors.persona && (
              <span className="text-red-400 text-sm md:text-base">{form.formState.errors.persona.message}</span>
            )}
          </label>
        </div>

        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 md:gap-5 mt-2">
          <button
            type="submit"
            disabled={disabled}
            className={clsx(
              "btn-primary w-full sm:w-auto h-12 px-5 text-base md:text-lg",
              disabled && "opacity-60 cursor-not-allowed"
            )}
          >
            <Wand2 className="size-5" />
            Gerar roteiro
          </button>

          <a
            href="https://try.elevenlabs.io/jwv2p8j618ir"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost w-full sm:w-auto h-12 px-5 text-base md:text-lg sm:hidden"
            aria-label="Use o ElevenLabs para transformar o roteiro em voz"
          >
            🎙 Transformar roteiro em voz (ElevenLabs)
          </a>
          <div className="hidden sm:flex items-center text-sm md:text-base text-slate-300">
            🎙 Quer transformar seu roteiro em voz?{" "}
            <a
              href="https://try.elevenlabs.io/jwv2p8j618ir"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 text-blue-400 hover:underline hover:text-blue-300 transition-colors"
            >
              Use o ElevenLabs
            </a>
          </div>

          <button
            type="button"
            onClick={onClear}
            className="btn-ghost w-full sm:w-auto h-12 px-5 text-base md:text-lg"
          >
            <History className="size-5" />
            Limpar
          </button>

          <button
            type="button"
            onClick={onVaria}
            disabled={loadingVaria}
            className={clsx(
              "btn-ghost w-full sm:w-auto h-12 px-5 text-base md:text-lg",
              loadingVaria && "opacity-60 cursor-not-allowed"
            )}
          >
            {loadingVaria ? <Loader2 className="size-5 animate-spin" /> : <Shuffle className="size-5" />}
            Gerar 3 variações
          </button>

          <button
            type="button"
            onClick={onTags}
            disabled={loadingTags}
            className={clsx(
              "btn-ghost w-full sm:w-auto h-12 px-5 text-base md:text-lg",
              loadingTags && "opacity-60 cursor-not-allowed"
            )}
          >
            {loadingTags ? <Loader2 className="size-5 animate-spin" /> : <Tag className="size-5" />}
            Títulos & Hashtags
          </button>
        </div>
      </form>
    </div>
  );
}
