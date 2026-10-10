import { NextResponse } from "next/server";
import { answerQuestion } from "@/lib/ask";
import { DEFAULT_PLAN, type Plan } from "@/lib/calc";
import { FACTS } from "@/lib/data/facts";

/**
 * Optional AI-written answers. Set ANTHROPIC_API_KEY or OPENAI_API_KEY in the environment to turn them on.
 * Without a key the app still works: the client shows the computed answer and the sourced facts.
 */
const anthropicKey = process.env.ANTHROPIC_API_KEY;
const openaiKey = process.env.OPENAI_API_KEY;
const anthropicModel = process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5";
const openaiModel = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

function provider() {
  if (anthropicKey) return { name: "anthropic" as const, model: anthropicModel };
  if (openaiKey) return { name: "openai" as const, model: openaiModel };
  return null;
}

export async function GET() {
  const p = provider();
  return NextResponse.json({ enabled: Boolean(p), model: p?.model ?? null });
}

function clamp(v: unknown, min: number, max: number, def: number) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : def;
}

function sanitizePlan(raw: unknown): Plan {
  const p = (raw ?? {}) as Partial<Record<keyof Plan, unknown>>;
  return {
    n: clamp(p.n, 10, 500, DEFAULT_PLAN.n),
    senior: clamp(p.senior, 0, 80, DEFAULT_PLAN.senior),
    overhead: clamp(p.overhead, 0, 30, DEFAULT_PLAN.overhead),
    sqft: clamp(p.sqft, 60, 160, DEFAULT_PLAN.sqft),
    rentSrc: p.rentSrc === "alt" ? "alt" : "kf",
    g2000: p.g2000 === true,
    payDiscount: clamp(p.payDiscount, 0, 40, DEFAULT_PLAN.payDiscount),
    rentDiscount: clamp(p.rentDiscount, 0, 60, DEFAULT_PLAN.rentDiscount),
    includeTier2: p.includeTier2 !== false,
    rank: "y3",
  };
}

export async function POST(req: Request) {
  const p = provider();
  if (!p) return NextResponse.json({ error: "AI answers are not configured" }, { status: 501 });

  let body: { question?: unknown; plan?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const question = typeof body.question === "string" ? body.question.trim().slice(0, 400) : "";
  if (!question) return NextResponse.json({ error: "Question is required" }, { status: 400 });

  const plan = sanitizePlan(body.plan);
  const computed = answerQuestion(question, plan);
  const facts = FACTS.map((f) => `[${f.id}] ${f.text}`).join("\n");
  const prompt = `You answer questions for a company planning its first Global Capability Centre (GCC) in India.
Use ONLY the facts and the computed answer below. Do not use outside knowledge and do not estimate new numbers.
Start with a direct one- or two-sentence answer, then add at most two short sentences of context. Cite facts inline like [F5].
If the facts do not answer the question, reply exactly: "Groundtruth has no sourced data for that yet."

The user's plan: ${plan.n} engineers, ${plan.senior}% senior.
Computed answer from the planner (trust its numbers): ${computed.answer}

FACTS:
${facts}

QUESTION: ${question}`;

  try {
    let text = "";
    if (p.name === "anthropic") {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "content-type": "application/json", "x-api-key": anthropicKey!, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({ model: p.model, max_tokens: 400, messages: [{ role: "user", content: prompt }] }),
      });
      if (!r.ok) throw new Error(`Anthropic ${r.status}`);
      const j = (await r.json()) as { content?: { type: string; text?: string }[] };
      text = (j.content ?? []).filter((c) => c.type === "text").map((c) => c.text ?? "").join("").trim();
    } else {
      const r = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${openaiKey}` },
        body: JSON.stringify({ model: p.model, max_tokens: 400, messages: [{ role: "user", content: prompt }] }),
      });
      if (!r.ok) throw new Error(`OpenAI ${r.status}`);
      const j = (await r.json()) as { choices?: { message?: { content?: string } }[] };
      text = j.choices?.[0]?.message?.content?.trim() ?? "";
    }
    if (!text) throw new Error("Empty answer");
    return NextResponse.json({ answer: text, model: p.model });
  } catch (e) {
    console.error("ask route failed", e);
    return NextResponse.json({ error: "AI request failed" }, { status: 502 });
  }
}
