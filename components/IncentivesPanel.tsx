"use client";

import { useMemo } from "react";
import { calcAll, type IncentiveStatus, type Plan } from "@/lib/calc";
import { STATES, STATUS_TEXT, type PolicyStatus } from "@/lib/data/states";
import { money } from "@/lib/format";
import { Card, PanelHeader, SourceChips, StatusPill } from "./ui";

const POLICY_STYLE: Record<PolicyStatus, string> = {
  notified: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  partial: "bg-amber-50 text-amber-700 ring-amber-200",
  thin: "bg-rose-50 text-rose-700 ring-rose-200",
  draft: "bg-slate-100 text-slate-600 ring-slate-200",
};

const RANK: IncentiveStatus[] = ["applied", "estimate", "ineligible", "unverified", "draft", "elsewhere", "notmodeled"];

export default function IncentivesPanel({ plan }: { plan: Plan }) {
  const rows = useMemo(() => calcAll({ ...plan, includeTier2: true, rank: "y3" }).sort((a, b) => b.incentives.y1 - a.incentives.y1), [plan]);
  return (
    <div>
      <PanelHeader eyebrow="State GCC policies · as published" title="Ten states want GCCs. Most incentives have a catch.">
        States target about 1,380 new GCCs and 1.18 million jobs by 2029–31 <SourceChips ids={["S11"]} />, while the market adds roughly 55–100 a year <SourceChips ids={["S9"]} />. The terms sit in policy PDFs, thresholds differ, and several headline incentives skip the metros where most GCCs go.
      </PanelHeader>

      <Card className="mb-6 overflow-hidden">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-100 px-5 py-4">
          <h3 className="text-[15px] font-semibold text-slate-900">What you qualify for at {plan.n} engineers</h3>
          <p className="text-xs text-slate-500">Change the team size on the Plan tab</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-[13px]">
            <thead className="bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="px-5 py-2.5 font-medium">City</th>
                <th className="px-3 py-2.5 font-medium">Best status</th>
                <th className="px-3 py-2.5 font-medium">Main reason</th>
                <th className="px-5 py-2.5 text-right font-medium">Year one</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => {
                const best = [...r.incentives.items].sort((a, b) => RANK.indexOf(a.status) - RANK.indexOf(b.status))[0];
                return (
                  <tr key={r.city.id}>
                    <td className="px-5 py-3 font-medium text-slate-900">
                      {r.city.name}
                      <span className="block text-xs font-normal text-slate-500">{r.city.state}</span>
                    </td>
                    <td className="px-3 py-3">{best && <StatusPill status={best.status} />}</td>
                    <td className="max-w-md px-3 py-3 text-slate-600">{best?.note}</td>
                    <td className="px-5 py-3 text-right font-mono font-medium text-slate-900 tabular">{money(r.incentives.y1)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mb-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-600">
        {(Object.keys(STATUS_TEXT) as PolicyStatus[]).map((k) => (
          <span key={k} className="flex items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${POLICY_STYLE[k]}`}>{k === "thin" ? "terms unverified" : k}</span>
            {STATUS_TEXT[k]}
          </span>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {STATES.map((s) => (
          <Card key={s.name} className="flex flex-col gap-3 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">{s.name}</h3>
                <p className="text-xs text-slate-500">{s.cities}</p>
              </div>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${POLICY_STYLE[s.status]}`}>{s.statusLabel}</span>
            </div>
            {s.targets.length > 0 && (
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                {s.targets.map(([v, l]) => (
                  <span key={l}>
                    <b className="font-mono font-semibold text-slate-800">{v}</b> {l}
                  </span>
                ))}
              </div>
            )}
            <ul className="flex list-disc flex-col gap-1 pl-4 text-[13px] text-slate-700 marker:text-slate-300">
              {s.items.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
            <p className="mt-auto rounded-lg bg-slate-50 p-3 text-[12.5px] leading-relaxed text-slate-600">
              <b className="font-semibold text-slate-900">Catch: </b>
              {s.catch} <SourceChips ids={s.src} />
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
