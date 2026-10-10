"use client";

import { useState } from "react";
import type { CityResult, Plan } from "@/lib/calc";
import { INDIA_MAP } from "@/lib/data/india-map";
import { money } from "@/lib/format";
import { Card, EstimateChip, SourceChip, StatusPill } from "./ui";

/** Where each city's label sits relative to its bubble, chosen so dense clusters (Bengaluru, Mysuru, Coimbatore) don't collide. */
const LABEL: Record<string, "left" | "right" | "top"> = {
  blr: "top",
  hyd: "right",
  che: "right",
  pun: "right",
  mum: "top",
  ncr: "right",
  mys: "left",
  cbe: "left",
  amd: "top",
  ngp: "right",
  idr: "right",
};

const SCALE = ["#c7d2fe", "#a5b4fc", "#818cf8", "#6366f1", "#4338ca"];

export default function IndiaMap({ rows, plan }: { rows: CityResult[]; plan: Plan }) {
  const sorted = [...rows].sort((a, b) => a.perHead - b.perHead);
  const [sel, setSel] = useState<string>(sorted[0]?.city.id ?? "blr");
  const min = sorted[0]?.perHead ?? 0;
  const max = sorted[sorted.length - 1]?.perHead ?? 1;
  const color = (v: number) => SCALE[Math.min(SCALE.length - 1, Math.floor(((v - min) / (max - min || 1)) * SCALE.length))];
  const radius = (r: CityResult) => (r.city.gccs ? 6 + Math.sqrt(r.city.gccs.value) * 0.9 : 7);
  const selected = rows.find((r) => r.city.id === sel) ?? sorted[0];

  return (
    <Card className="grid gap-0 overflow-hidden md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
      <div className="relative bg-gradient-to-b from-slate-50 to-white p-3">
        <svg viewBox={`0 0 ${INDIA_MAP.width} ${INDIA_MAP.height}`} className="mx-auto h-auto w-full max-w-[520px]" role="img" aria-label="Map of India with candidate GCC cities sized by known GCC count and coloured by cost per engineer">
          <path d={INDIA_MAP.path} fill="#eef2ff" stroke="#c7d2fe" strokeWidth={1} strokeLinejoin="round" />
          {[...rows]
            .sort((a, b) => radius(b) - radius(a))
            .map((r) => {
              const p = INDIA_MAP.points[r.city.id];
              if (!p) return null;
              const rad = radius(r);
              const pos = LABEL[r.city.id] ?? "right";
              const tx = pos === "left" ? p.x - rad - 5 : pos === "right" ? p.x + rad + 5 : p.x;
              const ty = pos === "top" ? p.y - rad - 6 : p.y + 4;
              const anchor = pos === "left" ? "end" : pos === "right" ? "start" : "middle";
              const isSel = r.city.id === selected?.city.id;
              return (
                <g key={r.city.id} className="cursor-pointer" onClick={() => setSel(r.city.id)}>
                  <title>{`${r.city.name}: ${money(r.perHead)} per engineer, year one`}</title>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={rad}
                    fill={color(r.perHead)}
                    fillOpacity={r.city.gccs ? 0.9 : 0.55}
                    stroke={isSel ? "#0f172a" : "#ffffff"}
                    strokeWidth={isSel ? 2.5 : 1.5}
                    strokeDasharray={r.city.gccs ? undefined : "3 2"}
                  />
                  <text x={tx} y={ty} textAnchor={anchor} fontSize={12} fontWeight={isSel ? 700 : 600} fill="#0f172a" paintOrder="stroke" stroke="#ffffff" strokeWidth={3} strokeLinejoin="round">
                    {r.city.name}
                    <tspan fontWeight={500} fill="#475569">{` ${money(r.perHead)}`}</tspan>
                  </text>
                </g>
              );
            })}
        </svg>
        <div className="mx-auto mt-1 flex max-w-[520px] flex-wrap items-center justify-between gap-2 px-1 text-[11px] text-slate-500">
          <span className="flex items-center gap-2">
            <span>{money(min)}</span>
            <span className="flex h-2 w-24 overflow-hidden rounded">
              {SCALE.map((c) => (
                <span key={c} className="h-full flex-1" style={{ background: c }} />
              ))}
            </span>
            <span>{money(max)} per engineer</span>
          </span>
          <span>Dashed: GCC count not published</span>
        </div>
      </div>

      {selected && (
        <div className="flex flex-col gap-3 border-t border-slate-100 p-5 md:border-t-0 md:border-l">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{selected.city.tier === 2 ? "Tier-2 city" : "Metro"} · {selected.city.state}</p>
            <h4 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">{selected.city.name}</h4>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Year one, net" value={money(selected.y1)} />
            <Stat label="Per engineer" value={money(selected.perHead)} />
            <Stat label="Engineer median" value={`₹${selected.swe} L`} est={selected.payEstimated} />
            <Stat label="GCCs here" value={selected.city.gccs?.label ?? "n/a"} />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Incentives at {plan.n} engineers</p>
            {selected.incentives.items.slice(0, 3).map((it) => (
              <div key={it.label} className="flex items-start gap-2 text-[13px] leading-snug text-slate-700">
                <StatusPill status={it.status} />
                <span>{it.label}</span>
              </div>
            ))}
          </div>
          <p className="mt-auto text-xs leading-relaxed text-slate-500">
            Click any bubble to compare. Pay from Flexiple <SourceChip id="S2" />
            {selected.payEstimated ? "; tier-2 pay is estimated from the nearest metro." : "."}
          </p>
        </div>
      )}
    </Card>
  );
}

function Stat({ label, value, est }: { label: string; value: string; est?: boolean }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2.5">
      <p className="text-[11px] text-slate-500">{label}</p>
      <p className="mt-0.5 font-mono text-[15px] font-semibold text-slate-900 tabular">
        {value}
        {est && <EstimateChip />}
      </p>
    </div>
  );
}
