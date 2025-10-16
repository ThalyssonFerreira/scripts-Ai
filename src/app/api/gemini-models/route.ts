import { NextResponse } from "next/server";

type ApiVersion = "v1" | "v1beta";

type Model = {
  name: string;
  displayName?: string;
  supportedGenerationMethods?: string[];
};

type ListModelsResponse = {
  models?: Model[];
};

function isModel(x: unknown): x is Model {
  if (typeof x !== "object" || x === null) return false;
  const r = x as Record<string, unknown>;
  return typeof r.name === "string";
}

function isListModelsResponse(x: unknown): x is ListModelsResponse {
  if (typeof x !== "object" || x === null) return false;
  const r = x as Record<string, unknown>;
  if (!("models" in r)) return true; // pode não vir models
  if (!Array.isArray(r.models)) return false;
  return r.models.every(isModel);
}

async function listModels(apiKey: string, version: ApiVersion): Promise<Model[]> {
  const url = `https://generativelanguage.googleapis.com/${version}/models?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url);
  const txt = await res.text();

  let json: unknown;
  try {
    json = JSON.parse(txt);
  } catch {
    throw new Error(`[${version}] Resposta não-JSON: ${txt.slice(0, 200)}`);
  }

  if (!res.ok) {
    throw new Error(`[${version}] Falha ${res.status}: ${txt.slice(0, 200)}`);
  }

  if (!isListModelsResponse(json)) {
    throw new Error(`[${version}] Estrutura inesperada em listModels.`);
  }

  return json.models ?? [];
}

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: "GEMINI_API_KEY não configurada" }, { status: 500 });
  }

  try {
    // tenta v1 e v1beta
    const [m1, m2] = await Promise.allSettled([
      listModels(apiKey, "v1"),
      listModels(apiKey, "v1beta"),
    ]);

    const out: { version: ApiVersion; models: Model[] }[] = [];

    if (m1.status === "fulfilled") out.push({ version: "v1", models: m1.value });
    if (m2.status === "fulfilled") out.push({ version: "v1beta", models: m2.value });

    if (out.length === 0) {
      const err1 = m1.status === "rejected" ? m1.reason instanceof Error ? m1.reason.message : String(m1.reason) : "";
      const err2 = m2.status === "rejected" ? m2.reason instanceof Error ? m2.reason.message : String(m2.reason) : "";
      return NextResponse.json({ ok: false, error: `Falha ao listar modelos. v1: ${err1} | v1beta: ${err2}` }, { status: 400 });
    }

    return NextResponse.json({ ok: true, data: out });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}
