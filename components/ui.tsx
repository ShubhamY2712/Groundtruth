"use client";

import { createContext, useContext, type ReactNode } from "react";
import { SOURCES, type Source, type SourceId } from "@/lib/data/sources";
import { STATUS_LABEL, type IncentiveStatus } from "@/lib/calc";

/** Lets any source chip jump to the source register. */
export const SourceNavContext = createContext<(id: SourceId) => void>(() => {});

export function SourceChip({ id }: { id: SourceId }) {
  const go = useContext(SourceNavContext);
  const s: Source = SOURCES[id];
  return (
    <button
      type="button"
      onClick={() => go(id)}
      title={s.title}
      className="ml-1 inline-flex items-center rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 align-[1px] font-mono text-[10.5px] leading-none text-slate-500 transition hover:border-brand-500 hover:text-brand-600"
    >
      {id}
    </button>
  );
}

export function SourceChips({ ids }: { ids: SourceId[] }) {
  return (
    <>
      {ids.map((id) => (
        <SourceChip key={id} id={id} />
      ))}
    </>
  );
}

export function AssumptionChip({ children = "assumption" }: { children?: ReactNode }) {
  return <span className="ml-1 inline-flex items-center rounded border border-dashed border-slate-400 px-1.5 py-0.5 align-[1px] font-mono text-[10.5px] leading-none text-slate-500">{children}</span>;
}

export function ConflictChip({ children = "conflict" }: { children?: ReactNode }) {
  return <span className="ml-1 inline-flex items-center whitespace-nowrap rounded bg-rose-50 px-1.5 py-0.5 align-[1px] font-mono text-[10.5px] font-medium leading-none text-rose-600">{children}</span>;
}

export function EstimateChip() {
  return <span className="ml-1 inline-flex items-center rounded bg-amber-50 px-1.5 py-0.5 align-[1px] font-mono text-[10.5px] font-medium leading-none text-amber-700">est.</span>;
}

const STATUS_STYLE: Record<IncentiveStatus, string> = {
  applied: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  estimate: "bg-amber-50 text-amber-700 ring-amber-200",
  ineligible: "bg-orange-50 text-orange-700 ring-orange-200",
  elsewhere: "bg-slate-100 text-slate-600 ring-slate-200",
  notmodeled: "bg-slate-100 text-slate-600 ring-slate-200",
  draft: "bg-slate-100 text-slate-600 ring-slate-200",
  unverified: "bg-rose-50 text-rose-700 ring-rose-200",
};

export function StatusPill({ status }: { status: IncentiveStatus }) {
  return <span className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${STATUS_STYLE[status]}`}>{STATUS_LABEL[status]}</span>;
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-900/[0.03] ${className}`}>{children}</div>;
}

export function PanelHeader({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <div className="mb-6 max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">{eyebrow}</p>
      <h2 className="mt-1.5 text-balance text-2xl font-semibold tracking-tight text-slate-900 sm:text-[28px]">{title}</h2>
      {children && <div className="mt-2 text-[15px] leading-relaxed text-slate-600">{children}</div>}
    </div>
  );
}

export function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="group" aria-label={label} className="flex rounded-lg bg-slate-100 p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={o.value === value}
          onClick={() => onChange(o.value)}
          className={`flex-1 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition ${o.value === value ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Slider({
  id,
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
  hint,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (v: number) => void;
  hint?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="flex items-baseline justify-between gap-2 text-[13px] font-medium text-slate-700">
        {label}
        <output htmlFor={id} className="font-mono text-[13px] font-medium text-brand-600 tabular">
          {display}
        </output>
      </label>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full" />
      {hint && <p className="text-xs leading-relaxed text-slate-500">{hint}</p>}
    </div>
  );
}
