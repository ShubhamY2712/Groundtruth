"use client";

import { useEffect, useRef, useState } from "react";
import { answerQuestion, SUGGESTED_QUESTIONS, type Answer } from "@/lib/ask";
import type { Plan } from "@/lib/calc";
import { Card, PanelHeader, SourceChips } from "./ui";

type Turn = { id: number; question: string; result: Answer; ai?: { text: string; model: string } | null; aiState: "off" | "loading" | "done" | "error" };

export default function AskPanel({ plan }: { plan: Plan }) {
  const [q, setQ] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [ai, setAi] = useState<{ enabled: boolean; model?: string }>({ enabled: false });
  const nextId = useRef(1);

  useEffect(() => {
    fetch("/api/ask")
      .then((r) => (r.ok ? r.json() : { enabled: false }))
      .then((j) => setAi({ enabled: Boolean(j.enabled), model: j.model }))
      .catch(() => setAi({ enabled: false }));
  }, []);

  const ask = async (question: string) => {
    const text = question.trim();
    if (!text) return;
    const id = nextId.current++;
    const result = answerQuestion(text, plan);
    const turn: Turn = { id, question: text, result, aiState: ai.enabled ? "loading" : "off" };
    setTurns((t) => [turn, ...t].slice(0, 6));
    setQ("");
    if (!ai.enabled) return;
    try {
      const r = await fetch("/api/ask", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ question: text, plan }) });
      if (!r.ok) throw new Error(String(r.status));
      const j = (await r.json()) as { answer: string; model: string };
      setTurns((t) => t.map((x) => (x.id === id ? { ...x, ai: { text: j.answer, model: j.model }, aiState: "done" } : x)));
    } catch {
      setTurns((t) => t.map((x) => (x.id === id ? { ...x, aiState: "error" } : x)));
    }
  };

  return (
    <div className="max-w-4xl">
      <PanelHeader eyebrow="Answers from the sourced dataset" title="Ask Groundtruth">
        Ask in plain English. You get a direct answer first, worked out from your plan ({plan.n} engineers, or the team size you name), followed by the sourced facts behind it. If the data isn&apos;t there, it says so instead of guessing.
        {ai.enabled && ` AI answers are on (${ai.model}) and are limited to the same facts.`}
      </PanelHeader>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(q);
        }}
        className="flex gap-2"
      >
        <input
          id="question"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="e.g. What incentives do we qualify for in Maharashtra?"
          aria-label="Your question"
          className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-[15px] shadow-sm outline-none placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
        <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-brand-700">
          Ask
        </button>
      </form>

      <div className="mt-3 mb-6 flex flex-wrap gap-2">
        {SUGGESTED_QUESTIONS.map((s) => (
          <button key={s} type="button" onClick={() => ask(s)} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[12.5px] text-slate-600 transition hover:border-brand-500 hover:text-brand-700">
            {s}
          </button>
        ))}
      </div>

      {turns.length === 0 && (
        <Card className="border-dashed p-6 text-center text-sm text-slate-500">Pick a suggested question or type your own. Answers use the plan you set on the Plan tab.</Card>
      )}

      <div className="flex flex-col gap-5">
        {turns.map((t) => (
          <Card key={t.id} className="overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50 px-5 py-3 text-sm font-medium text-slate-900">{t.question}</div>
            <div className="flex flex-col gap-4 p-5">
              <div>
                <p className="mb-1.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-brand-700">
                  Answer
                  {t.aiState === "done" && t.ai && <span className="rounded bg-brand-50 px-1.5 py-0.5 font-medium normal-case tracking-normal text-brand-700">written by {t.ai.model} from the facts below</span>}
                  {t.aiState === "loading" && <span className="font-medium normal-case tracking-normal text-slate-400">AI is refining…</span>}
                </p>
                <p className="text-[15px] leading-relaxed whitespace-pre-line text-slate-800">{t.aiState === "done" && t.ai ? t.ai.text : t.result.answer}</p>
                {t.aiState === "done" && t.ai && (
                  <details className="mt-2 text-xs text-slate-500">
                    <summary className="cursor-pointer">Show the computed answer</summary>
                    <p className="mt-1 leading-relaxed">{t.result.answer}</p>
                  </details>
                )}
                {t.aiState === "error" && <p className="mt-1 text-xs text-slate-500">AI unavailable right now; this is the computed answer.</p>}
              </div>
              {t.result.facts.length > 0 && (
                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Sourced facts behind this answer</p>
                  <ol className="flex flex-col gap-2">
                    {t.result.facts.map((f) => (
                      <li key={f.id} className="grid grid-cols-[32px_minmax(0,1fr)] gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2 text-[13px] leading-relaxed text-slate-700">
                        <span className="font-mono text-[11px] text-slate-400">{f.id}</span>
                        <span>
                          {f.text} <SourceChips ids={f.src} />
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
