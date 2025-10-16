import { z } from "zod";

export const schema = z.object({
  tema: z.string().min(2, "tema muito curto"),
  duracaoSeg: z.number().int().min(10, "mínimo 10s").max(90, "máximo 90s"),
  tom: z.enum(["educativo", "humor", "autoridade", "emocional"]),
  persona: z.string().min(2, "persona muito curta"),
});

export type FormData = z.infer<typeof schema>;
export type ItemKind = "normal" | "variation";
export type UIMode = "form" | "chat";

export type SavedItem = {
  id: string;
  kind: ItemKind;
  createdAt: number;
  values: FormData;
  roteiro: string;
  like?: boolean | null;
};

export const PRESETS: Array<
  { label: string } & FormData
> = [
  { label: "Musculação", tema: "3 erros de iniciantes na musculação", persona: "iniciante de academia", tom: "educativo", duracaoSeg: 30 },
  { label: "Concursos", tema: "Como aplicar o 80/20 nos estudos", persona: "concurseiros iniciantes", tom: "autoridade", duracaoSeg: 30 },
  { label: "Negócios locais", tema: "Como barbearias atraem clientes com Reels", persona: "donos de barbearia", tom: "emocional", duracaoSeg: 30 },
  { label: "Saúde 30+", tema: "Sono e emagrecimento aos 30+", persona: "mulheres 30-49", tom: "educativo", duracaoSeg: 30 },
];

export function parseChatToFormData(input: string): FormData {
  const base: FormData = { tema: "", duracaoSeg: 30, tom: "educativo", persona: "" };
  const txt = input.toLowerCase();

  const dur = txt.match(/(\d{2})\s*(s|seg|segundos?)/);
  if (dur) {
    const n = parseInt(dur[1], 10);
    if (!Number.isNaN(n) && n >= 10 && n <= 90) base.duracaoSeg = n;
  }

  if (/(humor|engraçado|engracado)/.test(txt)) base.tom = "humor";
  if (/(autoridade|profissional|especialista)/.test(txt)) base.tom = "autoridade";
  if (/(emocional|inspirador|motivacional)/.test(txt)) base.tom = "emocional";
  if (/(educativo|explicativo|tutorial)/.test(txt)) base.tom = "educativo";

  const temaMatch = input.match(/tema\s*:\s*(.+)$/i) || input.match(/sobre\s+(.+?)(?:\s+para|\s+pra|$)/i);
  if (temaMatch) base.tema = temaMatch[1].trim();

  const personaMatch = input.match(/para\s+(.+?)(?:,|\.|;|$)/i) || input.match(/p\/\s*(.+?)(?:,|\.|;|$)/i);
  if (personaMatch) base.persona = personaMatch[1].trim();

  if (!base.tema) base.tema = input.replace(/\s+/g, " ").trim().slice(0, 80);
  if (!base.persona) base.persona = "público geral";
  return base;
}
