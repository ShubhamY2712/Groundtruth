"use client";

import { CONFLICTS } from "@/lib/data/conflicts";
import { sourceList, type SourceId } from "@/lib/data/sources";
import { Card, PanelHeader, SourceChip } from "./ui";

export default function SourcesPanel({ flash }: { flash: SourceId | null }) {
  return (
    <div>
      <PanelHeader eyebrow="The information asymmetry, measured" title="Even the basics change depending on who you ask">
        Groundtruth never picks a winner silently. It shows every published value with its date and definition, and the spread between them. Where the planner needs one value, the filled dot marks its default and the reason is stated.
      </PanelHeader>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {CONFLICTS.map((c) => {
          const nums = c.values.map((v) => v.value);
          const lo = Math.min(...nums);
          const hi = Math.max(...nums);
          const spread = hi / lo;
          const pos = (v: number) => (hi === lo ? 50 : ((v - lo) / (hi - lo)) * 100);
          return (
            <Card key={c.question} className="flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-[15px] font-semibold leading-snug text-slate-900">{c.question}</h3>
                <span className="shrink-0 whitespace-nowrap rounded bg-rose-50 px-1.5 py-0.5 font-mono text-[11px] font-medium text-rose-600">
                  {spread >= 1.95 ? `${spread.toFixed(1)}× spread` : `${Math.round((spread - 1) * 100)}% apart`}
                </span>
              </div>
              <div className="relative mx-2 mt-5 mb-3 h-4" aria-hidden="true">
                <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded bg-rose-100" />
                {c.values.map((v, i) => (
                  <span
                    key={v.who}
                    className={`absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-rose-500 ${i === c.pick ? "bg-rose-500" : "bg-white"}`}
                    style={{ left: `${pos(v.value)}%` }}
                  />
                ))}
              </div>
              <ul className="flex flex-col gap-1.5 text-[13px]">
                {c.values.map((v, i) => (
                  <li key={v.who} className="grid grid-cols-[76px_minmax(0,1fr)] gap-2">
                    <b className="font-mono font-medium text-slate-900 tabular">{v.display}</b>
                    <span className="text-slate-600">
                      {v.who} <SourceChip id={v.src} />
                      {i === c.pick && <span className="ml-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-rose-600">default</span>}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 border-t border-dashed border-slate-200 pt-3 text-[12.5px] leading-relaxed text-slate-500">{c.why}</p>
            </Card>
          );
        })}
      </div>

      <h3 className="mt-10 text-lg font-semibold tracking-tight text-slate-900">Source register</h3>
      <p className="mt-1 mb-4 text-[13px] text-slate-500">Every chip in Groundtruth links here. Sources with a commercial interest in the answer are marked.</p>
      <Card className="p-2">
        <ul className="grid gap-x-8 md:grid-cols-2">
          {sourceList.map(([id, s]) => (
            <li key={id} id={`src-${id}`} className={`grid grid-cols-[44px_minmax(0,1fr)] gap-2 rounded-md border-b border-slate-100 px-3 py-2.5 text-[13px] transition-colors ${flash === id ? "bg-amber-100" : ""}`}>
              <span className="pt-0.5 font-mono text-xs text-slate-400">{id}</span>
              <span>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-slate-800 underline decoration-slate-300 underline-offset-2 hover:text-brand-600 hover:decoration-brand-500">
                  {s.title}
                </a>
                {s.self && <span className="ml-2 rounded bg-brand-50 px-1.5 py-0.5 text-[10.5px] font-medium text-brand-700">Flexiple</span>}
                {s.vendor && <span className="ml-2 rounded bg-amber-50 px-1.5 py-0.5 text-[10.5px] font-medium text-amber-700">commercial interest</span>}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
