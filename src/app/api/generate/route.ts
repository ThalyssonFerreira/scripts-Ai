import { NextResponse } from "next/server";
import { z, ZodError } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REQUEST_TIMEOUT_MS = 60_000 as const;

const bodySchema = z.object({
  tema: z.string().min(2, "tema muito curto"),
  duracaoSeg: z.number().int().min(10, "mínimo 10s").max(90, "máximo 90s"),
  tom: z.enum(["educativo", "humor", "autoridade", "emocional"]),
  persona: z.string().min(2, "persona muito curta"),
});

type ApiVersion = "v1";
type GeminiPart = { text?: string };
type GeminiContent = { parts?: GeminiPart[] };
type GeminiCandidate = { content?: GeminiContent };
type GeminiError = { message?: string };
type GeminiResponse = { candidates?: GeminiCandidate[]; error?: GeminiError };

const systemPrompt = `
Você é um roteirista especialista em vídeos curtos (TikTok/Reels) com foco em retenção.
Entregue um roteiro no formato:

- HOOK (1 frase forte)
- CONTEXTO (1-2 linhas)
- DESENVOLVIMENTO (bullet points por cena, 4-6 itens)
- CTA (1 frase)

Regras:
- PT-BR, direto, sem enrolação.
- Tempo alvo: {{DURACAO}} segundos.
- Tom: {{TOM}}.
- Persona: {{PERSONA}}.
- Linguagem simples e ritmo rápido.
`.trim();

function zodMsg(err: ZodError): string {
  return err.issues.map((i) => `${i.path.join(".") || "body"}: ${i.message}`).join(" | ");
}
function normalizeModel(name: string): string {
  return name.replace(/^models\//i, "");
}
function pickModelAndVersion(): { model: string; version: ApiVersion } {
  const rawModel = (process.env.GEMINI_MODEL || "gemini-2.5-flash").trim();
  const version = ((process.env.GEMINI_API_VERSION || "v1").trim() as ApiVersion);
  return { model: normalizeModel(rawModel), version };
}

async function callGemini({
  apiKey,
  model,
  prompt,
  version,
  useQueryParam,
  signal,
}: {
  apiKey: string;
  model: string;
  prompt: string;
  version: ApiVersion;
  useQueryParam: boolean;
  signal?: AbortSignal;
}): Promise<string> {
  const base = `https://generativelanguage.googleapis.com/${version}/models/${normalizeModel(model)}:generateContent`;
  const url = useQueryParam ? `${base}?key=${encodeURIComponent(apiKey)}` : base;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...(useQueryParam ? {} : { "x-goog-api-key": apiKey }),
    },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    }),
    signal,
    cache: "no-store",
    next: { revalidate: 0 },
    keepalive: true,
  });

  const txt = await res.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(txt);
  } catch {
    throw new Error(`[${version}] Resposta não-JSON (${res.status}): ${txt.slice(0, 240)}`);
  }
  const json = parsed as GeminiResponse;

  if (!res.ok) {
    const msg = typeof json.error?.message === "string" ? json.error.message : `Falha ${res.status}`;
    throw new Error(`[${version}] ${msg}`);
  }

  const candidates = Array.isArray(json.candidates) ? json.candidates : [];
  if (candidates.length === 0) throw new Error(`[${version}] Estrutura inesperada na resposta.`);

  const parts = Array.isArray(candidates[0]?.content?.parts) ? candidates[0].content?.parts ?? [] : [];
  const text = parts[0]?.text;

  if (typeof text !== "string" || text.trim().length === 0) throw new Error(`[${version}] Texto não encontrado na resposta.`);
  return text;
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

export async function GET() {
  return new NextResponse(
    JSON.stringify({ ok: false, error: "Use POST em /api/generate com JSON válido." }),
    { status: 405, headers: { Allow: "POST" } }
  );
}

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: "GEMINI_API_KEY não configurada" }, { status: 500 });
  }

  const ct = req.headers.get("content-type") || "";
  if (!ct.toLowerCase().includes("application/json")) {
    return NextResponse.json({ ok: false, error: "Content-Type deve ser application/json" }, { status: 415 });
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido no body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: zodMsg(parsed.error) }, { status: 400 });
  }

  const { tema, duracaoSeg, tom, persona } = parsed.data;
  const { model, version } = pickModelAndVersion();

  const finalPrompt =
    systemPrompt
      .replace("{{DURACAO}}", String(duracaoSeg))
      .replace("{{TOM}}", tom)
      .replace("{{PERSONA}}", persona) +
    `

---
TEMA: ${tema}
DURAÇÃO: ${duracaoSeg}s
TOM: ${tom}
PERSONA: ${persona}
`;

  const ac = new AbortController();
  const to = setTimeout(() => ac.abort(), REQUEST_TIMEOUT_MS);

  try {
    try {
      const roteiro = await callGemini({ apiKey, model, prompt: finalPrompt, version, useQueryParam: false, signal: ac.signal });
      return NextResponse.json({ ok: true, model, version, roteiro });
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      if (/abort/i.test(errMsg) || /network/i.test(errMsg) || /fetch/i.test(errMsg) || /timed out/i.test(errMsg)) {
        const roteiro = await callGemini({ apiKey, model, prompt: finalPrompt, version, useQueryParam: true, signal: ac.signal });
        return NextResponse.json({ ok: true, model, version, roteiro });
      }
      throw e;
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = /401|403/.test(msg) ? 401 : /404/.test(msg) ? 404 : /abort/i.test(msg) ? 504 : 400;
    return NextResponse.json({ ok: false, error: msg }, { status });
  } finally {
    clearTimeout(to);
  }
}
