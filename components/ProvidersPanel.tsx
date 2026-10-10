"use client";

import { useState } from "react";
import { GRADES, PROVIDERS, type Grade } from "@/lib/data/providers";
import { Card, PanelHeader, SourceChip } from "./ui";

const GRADE_STYLE: Record<Grade, string> = {
  A: "bg-emerald-600 text-white",
  B: "bg-brand-100 text-brand-700",
  C: "bg-amber-100 text-amber-800",
  D: "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200",
};

function GradeBadge({ g }: { g: Grade }) {
  return (
    <span title={GRADES[g].title} className={`inline-grid size-6 shrink-0 place-items-center rounded-md font-mono text-xs font-semibold ${GRADE_STYLE[g]}`}>
      {g}
    </span>
  );
}

export default function ProvidersPanel() {
  const [cat, setCat] = useState("All");
  const counts: Record<Grade, number> = { A: 0, B: 0, C: 0, D: 0 };
  PROVIDERS.forEach((p) => p.evidence.forEach((e) => counts[e.grade]++));
  const cats = ["All", ...Array.from(new Set(PROVIDERS.map((p) => p.category)))];
  const best = (p: (typeof PROVIDERS)[number]) => p.evidence.map((e) => e.grade).sort()[0];
  const list = PROVIDERS.filter((p) => cat === "All" || p.category === cat).sort((a, b) => best(a).localeCompare(best(b)));

  return (
    <div>
      <PanelHeader eyebrow="Track records, graded by evidence" title="Who has actually delivered, and how do we know?">
        Every provider claims GCC experience. Groundtruth grades each claim by the strength of its evidence, so a named client deal outranks a marketing number. Nobody has grade A evidence yet, because no one collects it. That is the gap this product fills.
      </PanelHeader>

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {(Object.keys(GRADES) as Grade[]).map((g) => (
          <Card key={g} className="p-4">
            <div className="flex items-center gap-2">
              <GradeBadge g={g} />
              <span className="text-sm font-semibold text-slate-900">{GRADES[g].title}</span>
              <span className="ml-auto font-mono text-lg font-semibold text-slate-900 tabular">{counts[g]}</span>
            </div>
            <p className="mt-1.5 text-xs text-slate-500">{GRADES[g].desc}</p>
          </Card>
        ))}
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {cats.map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={c === cat}
            onClick={() => setCat(c)}
            className={`rounded-full border px-3 py-1.5 text-[13px] font-medium transition ${c === cat ? "border-brand-600 bg-brand-50 text-brand-700" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((p) => (
          <Card key={p.name} className="p-5">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-slate-900">{p.name}</h3>
              {p.self && <span className="rounded bg-brand-600 px-1.5 py-0.5 text-[10.5px] font-semibold text-white">This is us</span>}
            </div>
            <p className="mb-3 text-xs text-slate-500">{p.category}</p>
            <div className="flex flex-col gap-2.5">
              {p.evidence.map((e) => (
                <div key={e.text} className="flex items-start gap-2.5 text-[13px] leading-snug text-slate-700">
                  <GradeBadge g={e.grade} />
                  <span>
                    {e.text} <SourceChip id={e.src} />
                  </span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
