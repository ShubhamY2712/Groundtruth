"use client";

import { useMemo, useState } from "react";
import { BREAK_EVEN_VENDORS, impliedOverhead, type Plan } from "@/lib/calc";
import { usd } from "@/lib/format";
import { buildRoadmap, monthAt, MONTHS } from "@/lib/roadmap";
import { Card, PanelHeader, Slider, SourceChips } from "./ui";

export default function RoadmapPanel({ plan, update }: { plan: Plan; update: (p: Partial<Plan>) => void }) {
  const [start, setStart] = useState(() => {
    const d = new Date();
    const m = d.getMonth() + 1;
    return { month: m % 12, year: d.getFullYear() + (m > 11 ? 1 : 0) };
  });
  const rm = useMemo(() => buildRoadmap(plan.n), [plan.n]);
  const span = rm.totalWeeks + 3;
  const ticks = Array.from({ length: Math.ceil(span / 4.345) + 1 }, (_, i) => i * 4.345).filter((w) => w <= span);
  const startOptions = Array.from({ length: 6 }, (_, i) => {
    const now = new Date();
    const m = now.getMonth() + i;
    return { month: m % 12, year: now.getFullYear() + Math.floor(m / 12) };
  });

  return (
    <div>
      <PanelHeader eyebrow="Setup roadmap" title={`From decision to an operational ${plan.n}‑person centre in ${rm.readinessLabel}`}>
        A week-by-week plan built from published setup timelines, adjusted for your team size and the setup model the planner recommends. Change the headcount to see the plan stretch.
      </PanelHeader>

      <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <Card className="flex flex-col gap-5 p-5 lg:sticky lg:top-28 lg:self-start">
          <Slider id="rn" label="Engineers in year one" value={plan.n} min={10} max={500} step={5} display={String(plan.n)} onChange={(v) => update({ n: v })} />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="start" className="text-[13px] font-medium text-slate-700">
              Decision month
            </label>
            <select
              id="start"
              value={`${start.year}-${start.month}`}
              onChange={(e) => {
                const [y, m] = e.target.value.split("-").map(Number);
                setStart({ year: y, month: m });
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              {startOptions.map((o) => (
                <option key={`${o.year}-${o.month}`} value={`${o.year}-${o.month}`}>
                  {MONTHS[o.month]} {o.year}
                </option>
              ))}
            </select>
          </div>
          <div className="rounded-lg bg-brand-50 p-3.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-700">Recommended model</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{rm.model.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              {rm.model.why} <SourceChips ids={rm.model.src} />
            </p>
          </div>
          <div className="flex flex-col gap-1.5 text-[13px]">
            {rm.milestones.map((m) => (
              <div key={m.label} className="flex justify-between border-b border-dashed border-slate-200 pb-1.5">
                <span className="text-slate-600">{m.label}</span>
                <span className="font-mono font-medium text-slate-900 tabular">
                  {monthAt(start.month, start.year, m.week)} · wk {m.week}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex min-w-0 flex-col gap-6">
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <div className="min-w-[680px] p-5">
                <div className="grid grid-cols-[200px_minmax(0,1fr)] gap-x-4">
                  <div />
                  <div className="relative mb-2 h-5 text-[11px] text-slate-500">
                    {ticks.map((w) => (
                      <span key={w} className="absolute -translate-x-1/2 font-mono tabular" style={{ left: `${(w / span) * 100}%` }}>
                        {monthAt(start.month, start.year, w)}
                      </span>
                    ))}
                  </div>
                  {rm.rows.map((row) => (
                    <GanttRow key={row.id} row={row} span={span} ticks={ticks} />
                  ))}
                  <div />
                  <div className="relative mt-1 h-10">
                    {rm.milestones.map((m) => (
                      <span key={m.label} className="absolute top-0 flex -translate-x-1/2 flex-col items-center text-[11px] font-medium text-slate-700" style={{ left: `${(m.week / span) * 100}%` }}>
                        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                          <path d="M5 0l5 5-5 5-5-5z" fill="#0f172a" />
                        </svg>
                        <span className="whitespace-nowrap">{m.label}</span>
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <i className="inline-block h-2.5 w-5 rounded-sm bg-brand-600" /> Core phase
                  </span>
                  <span className="flex items-center gap-1.5">
                    <i className="inline-block h-2.5 w-5 rounded-sm bg-amber-400" /> Managed-employment bridge
                  </span>
                  <span className="flex items-center gap-1.5">
                    <i className="inline-block h-2.5 w-5 rounded-sm border border-dashed border-slate-400 bg-slate-100" /> Optional
                  </span>
                </div>
              </div>
            </div>
          </Card>
          <BreakEven n={plan.n} />
        </div>
      </div>
    </div>
  );
}

function GanttRow({ row, span, ticks }: { row: ReturnType<typeof buildRoadmap>["rows"][number]; span: number; ticks: number[] }) {
  const style =
    row.kind === "phase" ? "bg-brand-600 text-white" : row.kind === "bridge" ? "bg-amber-400 text-amber-950" : "border border-dashed border-slate-400 bg-slate-100 text-slate-600";
  return (
    <>
      <div className="flex flex-col justify-center border-t border-slate-100 py-2.5">
        <span className="text-[13px] font-medium text-slate-900">
          {row.label} <SourceChips ids={row.src} />
        </span>
        <span className="text-[11.5px] leading-snug text-slate-500">{row.detail}</span>
      </div>
      <div className="relative border-t border-slate-100">
        {ticks.map((w) => (
          <span key={w} className="absolute top-0 bottom-0 w-px bg-slate-100" style={{ left: `${(w / span) * 100}%` }} />
        ))}
        <span
          className={`absolute top-1/2 flex h-7 -translate-y-1/2 items-center overflow-hidden rounded-md px-2 font-mono text-[11px] font-medium whitespace-nowrap ${style}`}
          style={{ left: `${(row.start / span) * 100}%`, width: `${((row.end - row.start) / span) * 100}%` }}
        >
          {row.end - row.start >= 5 ? `wk ${row.start}–${row.end}` : ""}
        </span>
        {row.end - row.start < 5 && (
          <span className="absolute top-1/2 -translate-y-1/2 pl-2 font-mono text-[11px] font-medium whitespace-nowrap text-slate-600" style={{ left: `${(row.end / span) * 100}%` }}>
            wk {row.start}–{row.end}
          </span>
        )}
      </div>
    </>
  );
}

function BreakEven({ n }: { n: number }) {
  const W = 640;
  const H = 300;
  const pad = { l: 64, r: 20, t: 30, b: 40 };
  const xMax = Math.max(100, Math.ceil((n + 10) / 50) * 50);
  const yMax = Math.ceil((BREAK_EVEN_VENDORS[0].fee * xMax) / 5000) * 5000;
  const x = (v: number) => pad.l + (v / xMax) * (W - pad.l - pad.r);
  const y = (v: number) => H - pad.b - (v / yMax) * (H - pad.t - pad.b);
  const yTicks = Array.from({ length: 5 }, (_, i) => (yMax / 4) * i);
  const xTicks = Array.from({ length: xMax / 25 + 1 }, (_, i) => i * 25);
  const flex = BREAK_EVEN_VENDORS[0];
  const flexOver = impliedOverhead(flex)[0];
  const monthlyFee = flex.fee * n;

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-2xl">
          <h3 className="text-[15px] font-semibold text-slate-900">When does your own entity pay off?</h3>
          <p className="mt-1 text-[13px] leading-relaxed text-slate-600">
            Each line is a vendor&apos;s per-person fee. Each dashed level is the monthly entity running cost that vendor&apos;s own stated break-even implies (fee × break-even headcount). Where they cross is the break-even.
          </p>
        </div>
        <div className="rounded-lg bg-slate-50 px-3.5 py-2.5 text-[13px]">
          <p className="text-slate-500">At {n} people, by Flexiple&apos;s numbers</p>
          <p className="font-mono font-semibold text-slate-900 tabular">
            {usd(monthlyFee)} fees vs {usd(flexOver)} entity
          </p>
        </div>
      </div>
      <div className="mt-4 overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full min-w-[520px]" role="img" aria-label="Break-even chart: managed employment fees vs implied entity running cost by headcount">
          {yTicks.map((t) => (
            <g key={t}>
              <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="#f1f5f9" />
              <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" fontSize={11} fill="#64748b">
                {t === 0 ? "$0" : `$${t / 1000}K`}
              </text>
            </g>
          ))}
          {xTicks.map((t) => (
            <text key={t} x={x(t)} y={H - pad.b + 18} textAnchor="middle" fontSize={11} fill="#64748b">
              {t}
            </text>
          ))}
          <text x={(pad.l + W - pad.r) / 2} y={H - 4} textAnchor="middle" fontSize={11} fill="#64748b">
            Headcount
          </text>
          <text x={pad.l - 8} y={12} textAnchor="end" fontSize={11} fill="#64748b">
            per month
          </text>
          {BREAK_EVEN_VENDORS.map((v) => {
            const [lo, hi] = impliedOverhead(v);
            const endX = Math.min(xMax, yMax / v.fee);
            return (
              <g key={v.name}>
                {lo !== hi && <rect x={pad.l} width={W - pad.l - pad.r} y={y(hi)} height={y(lo) - y(hi)} fill={v.color} fillOpacity={0.08} />}
                <line x1={pad.l} x2={W - pad.r} y1={y(lo)} y2={y(lo)} stroke={v.color} strokeDasharray="5 4" strokeWidth={1.5} />
                <line x1={x(0)} y1={y(0)} x2={x(endX)} y2={y(v.fee * endX)} stroke={v.color} strokeWidth={2.5} />
                <circle cx={x(v.breakEven[0])} cy={y(lo)} r={5} fill="#fff" stroke={v.color} strokeWidth={2.5} />
                <text x={x(v.breakEven[0]) - 8} y={y(lo) + (v.fee > 200 ? -10 : 18)} textAnchor="end" fontSize={11.5} fontWeight={600} fill={v.color === "#F59E0B" ? "#b45309" : v.color} paintOrder="stroke" stroke="#ffffff" strokeWidth={4} strokeLinejoin="round">
                  {v.breakEven[0] === v.breakEven[1] ? `${v.breakEven[0]} people` : `${v.breakEven[0]}–${v.breakEven[1]} people`}
                </text>
              </g>
            );
          })}
          <line x1={x(n)} x2={x(n)} y1={pad.t} y2={H - pad.b} stroke="#0f172a" strokeWidth={1.5} />
          <text x={x(n) + 6} y={pad.t + 10} fontSize={11.5} fontWeight={600} fill="#0f172a">
            You: {n}
          </text>
        </svg>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-600">
        {BREAK_EVEN_VENDORS.map((v) => {
          const [lo, hi] = impliedOverhead(v);
          return (
            <span key={v.name} className="flex items-center gap-1.5">
              <i className="inline-block h-0.5 w-5" style={{ background: v.color }} />
              {v.name}: {usd(v.fee)}/person/month, implies {lo === hi ? usd(lo) : `${usd(lo)}–${usd(hi)}`} a month to run an entity <SourceChips ids={v.src} />
            </span>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-slate-500">Derived values, not published ones. The two vendors sell different services, which is partly why their break-evens differ.</p>
    </Card>
  );
}
