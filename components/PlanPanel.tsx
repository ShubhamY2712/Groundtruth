"use client";

import { useMemo, useState, type ReactNode } from "react";
import { calcAll, recommendModel, readiness, type CityResult, type Plan } from "@/lib/calc";
import { money } from "@/lib/format";
import { memoText } from "@/lib/memo";
import type { TabId } from "./App";
import IndiaMap from "./IndiaMap";
import { AssumptionChip, Card, ConflictChip, EstimateChip, PanelHeader, Segmented, Slider, SourceChip, SourceChips, StatusPill } from "./ui";

type Props = { plan: Plan; update: (p: Partial<Plan>) => void; goTab: (t: TabId) => void };

export default function PlanPanel({ plan, update, goTab }: Props) {
  const rows = useMemo(() => calcAll(plan), [plan]);
  const [open, setOpen] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "map">("list");

  return (
    <div>
      <PanelHeader eyebrow="For first-time GCC teams · 10–500 people" title="Where should your first India centre go, and what will it really cost?">
        Set your team. Groundtruth ranks cities by fully-loaded cost, counts only the state incentives you actually qualify for, and shows the source behind every number. Dashed chips are assumptions you can change.
      </PanelHeader>

      <div className="grid items-start gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <Controls plan={plan} update={update} />
        <div className="flex min-w-0 flex-col gap-5">
          <Readout plan={plan} rows={rows} />

          <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-[15px] font-semibold text-slate-900">Year-one net cost by city</h3>
                <p className="text-xs text-slate-500">{view === "list" ? "Click a city for the breakdown, incentive eligibility and peers." : "Bubble size: known GCC count. Colour: year-one cost per engineer."}</p>
              </div>
              <div className="flex items-center gap-4">
                <Legend />
                <div className="w-40">
                  <Segmented label="View" value={view} onChange={setView} options={[{ value: "list", label: "List" }, { value: "map", label: "Map" }]} />
                </div>
              </div>
            </div>
            {view === "list" ? <CityList rows={rows} open={open} setOpen={setOpen} plan={plan} /> : <IndiaMap rows={rows} plan={plan} />}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <ModelCard n={plan.n} goTab={goTab} />
            <MemoCard plan={plan} rows={rows} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Controls({ plan, update }: { plan: Plan; update: (p: Partial<Plan>) => void }) {
  return (
    <Card className="flex flex-col gap-5 p-5 lg:sticky lg:top-28">
      <Slider id="n" label="Engineers in year one" value={plan.n} min={10} max={500} step={5} display={String(plan.n)} onChange={(v) => update({ n: v })} />
      <Slider
        id="senior"
        label="Senior share (6+ yrs)"
        value={plan.senior}
        min={0}
        max={80}
        step={5}
        display={`${plan.senior}%`}
        onChange={(v) => update({ senior: v })}
        hint={
          <>
            City pay medians from Flexiple&apos;s talent graph <SourceChip id="S2" />
          </>
        }
      />
      <hr className="border-slate-200" />
      <Slider id="overhead" label="Employer on-costs" value={plan.overhead} min={0} max={30} step={1} display={`${plan.overhead}%`} onChange={(v) => update({ overhead: v })} hint={<>PF, gratuity, insurance on top of salary <AssumptionChip /></>} />
      <Slider id="sqft" label="Office space per seat" value={plan.sqft} min={60} max={160} step={5} display={`${plan.sqft} sq ft`} onChange={(v) => update({ sqft: v })} hint={<>Leasable area per person <AssumptionChip /></>} />
      <div className="flex flex-col gap-1.5">
        <span className="text-[13px] font-medium text-slate-700">Office rent source</span>
        <Segmented label="Rent source" value={plan.rentSrc} onChange={(v) => update({ rentSrc: v })} options={[{ value: "kf", label: "Knight Frank" }, { value: "alt", label: "CRE Matrix" }]} />
        <p className="text-xs text-slate-500">
          Both Q1 2026. They disagree by up to 37% <ConflictChip />
        </p>
      </div>
      <hr className="border-slate-200" />
      <label className="flex items-start gap-2.5 text-[13px] text-slate-700" htmlFor="t2">
        <input id="t2" type="checkbox" checked={plan.includeTier2} onChange={(e) => update({ includeTier2: e.target.checked })} className="mt-0.5 size-4 accent-brand-600" />
        <span>
          <span className="font-medium">Include tier-2 cities</span>
          <span className="block text-xs text-slate-500">Mysuru, Coimbatore, Ahmedabad, Nagpur, Indore</span>
        </span>
      </label>
      {plan.includeTier2 && (
        <div className="flex flex-col gap-4 rounded-lg bg-slate-50 p-3">
          <Slider
            id="pd"
            label="Tier-2 pay discount"
            value={plan.payDiscount}
            min={0}
            max={40}
            step={5}
            display={`${plan.payDiscount}%`}
            onChange={(v) => update({ payDiscount: v })}
            hint={
              <>
                vs nearest metro. Sources say 15–35% <SourceChips ids={["S26", "S8"]} /> <AssumptionChip />
              </>
            }
          />
          <Slider
            id="rd"
            label="Tier-2 rent discount"
            value={plan.rentDiscount}
            min={0}
            max={60}
            step={5}
            display={`${plan.rentDiscount}%`}
            onChange={(v) => update({ rentDiscount: v })}
            hint={
              <>
                Source says 35–50% <SourceChip id="S28" /> <AssumptionChip />
              </>
            }
          />
        </div>
      )}
      <label className="flex items-start gap-2.5 text-[13px] text-slate-700" htmlFor="g2000">
        <input id="g2000" type="checkbox" checked={plan.g2000} onChange={(e) => update({ g2000: e.target.checked })} className="mt-0.5 size-4 accent-brand-600" />
        <span>
          <span className="font-medium">Parent is Forbes Global 2000 or Fortune 1000</span>
          <span className="block text-xs text-slate-500">Unlocks Tamil Nadu&apos;s payroll subsidy at 200+ jobs</span>
        </span>
      </label>
      <div className="flex flex-col gap-1.5">
        <span className="text-[13px] font-medium text-slate-700">Rank cities by</span>
        <Segmented label="Ranking" value={plan.rank} onChange={(v) => update({ rank: v })} options={[{ value: "y3", label: "3-year net cost" }, { value: "pool", label: "Talent depth" }]} />
      </div>
    </Card>
  );
}

function Readout({ plan, rows }: { plan: Plan; rows: CityResult[] }) {
  const metros = rows.filter((r) => r.city.tier === 1).sort((a, b) => a.y1 - b.y1);
  const tier2 = rows.filter((r) => r.city.tier === 2).sort((a, b) => a.y1 - b.y1);
  if (!metros.length) return null;
  const cheap = metros[0];
  const dear = metros[metros.length - 1];
  const sen = Math.round((plan.n * plan.senior) / 100);
  const share = (r: CityResult) => Math.round((r.talent / r.gross) * 100);
  const applied = rows.filter((r) => r.incentives.items.some((i) => i.status === "applied"));
  const estimated = rows.filter((r) => r.incentives.items.some((i) => i.status === "estimate") && !applied.includes(r));
  return (
    <Card className="p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Readout</p>
      <p className="mt-2 max-w-[75ch] text-[16px] leading-relaxed text-slate-800">
        For <b className="font-semibold">{plan.n} engineers</b> ({sen} senior), <b className="font-semibold">{cheap.city.name}</b> is the cheapest metro at <b className="font-semibold">{money(cheap.y1)}</b> in year one.{" "}
        <b className="font-semibold">{dear.city.name}</b> costs {(dear.y1 / cheap.y1).toFixed(1)}× as much. Talent is {Math.min(share(cheap), share(dear))}–{Math.max(share(cheap), share(dear))}% of the bill, so pay matters far more than rent.{" "}
        {tier2.length > 0 && (
          <>
            The cheapest tier-2 option is <b className="font-semibold">{tier2[0].city.name}</b> at {money(tier2[0].y1)}, with pay estimated {plan.payDiscount}% below the nearest metro.{" "}
          </>
        )}
        {applied.length > 0 ? (
          <>
            You qualify for incentives in <b className="font-semibold">{applied.map((r) => r.city.name).join(", ")}</b>.
          </>
        ) : (
          <>
            At this size you qualify for <b className="font-semibold">no confirmed state incentive</b> in any city{estimated.length ? ` (Gujarat's are estimates with unverified thresholds)` : ""}.{plan.n < 100 && " Cross 100 people to unlock Maharashtra and Beyond Bengaluru support."}
          </>
        )}
      </p>
    </Card>
  );
}

function Legend() {
  return (
    <div className="hidden items-center gap-3 text-xs text-slate-500 xl:flex">
      <span className="flex items-center gap-1.5">
        <i className="inline-block size-2.5 rounded-sm bg-brand-600" />
        Talent
      </span>
      <span className="flex items-center gap-1.5">
        <i className="inline-block size-2.5 rounded-sm bg-brand-200" />
        Office
      </span>
      <span className="flex items-center gap-1.5">
        <i className="inline-block size-2.5 rounded-sm bg-[repeating-linear-gradient(135deg,#10b981_0_2px,transparent_2px_4px)]" />
        Incentive
      </span>
    </div>
  );
}

function CityList({ rows, open, setOpen, plan }: { rows: CityResult[]; open: string | null; setOpen: (v: string | null) => void; plan: Plan }) {
  const maxGross = Math.max(...rows.map((r) => r.gross));
  return (
    <Card className="divide-y divide-slate-100 overflow-hidden">
      {rows.map((r, i) => {
        const isOpen = open === r.city.id;
        const incOnSpace = Math.min(r.incentives.y1, r.space);
        const incOnTalent = r.incentives.y1 - incOnSpace;
        return (
          <div key={r.city.id}>
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : r.city.id)}
              className="grid w-full grid-cols-[24px_minmax(0,1fr)_110px_16px] items-center gap-x-3 gap-y-2 px-4 py-3.5 text-left transition hover:bg-slate-50 sm:grid-cols-[28px_150px_minmax(0,1fr)_130px_16px]"
            >
              <span className="font-mono text-xs text-slate-400 tabular">{String(i + 1).padStart(2, "0")}</span>
              <span className="min-w-0">
                <span className="flex items-center gap-1.5 font-medium text-slate-900">
                  {r.city.name}
                  {r.city.tier === 2 && <span className="whitespace-nowrap rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Tier 2</span>}
                </span>
                <span className="block truncate text-xs text-slate-500">{r.city.state}</span>
              </span>
              <span className="col-span-4 col-start-2 row-start-2 flex h-3.5 overflow-hidden rounded bg-slate-100 sm:col-span-1 sm:col-start-3 sm:row-start-1" aria-hidden="true">
                <span className="h-full bg-brand-600" style={{ width: `${((r.talent - incOnTalent) / maxGross) * 100}%` }} />
                <span className="h-full bg-brand-200" style={{ width: `${((r.space - incOnSpace) / maxGross) * 100}%` }} />
                <span className="h-full bg-[repeating-linear-gradient(135deg,#10b981_0_3px,transparent_3px_6px)]" style={{ width: `${(r.incentives.y1 / maxGross) * 100}%` }} />
              </span>
              <span className="text-right font-mono text-sm font-medium text-slate-900 tabular">
                {money(r.y1)}
                <span className="block text-[11px] font-normal text-slate-500">3 yr {money(r.y3)}</span>
              </span>
              <svg className={`size-4 text-slate-400 transition ${isOpen ? "rotate-90" : ""}`} viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {isOpen && <CityDetail r={r} plan={plan} />}
          </div>
        );
      })}
    </Card>
  );
}

function Row({ label, value, strong }: { label: ReactNode; value: string; strong?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-dashed border-slate-200 pb-1.5 text-[13px]">
      <span className={strong ? "font-semibold text-slate-900" : "text-slate-600"}>{label}</span>
      <span className={`whitespace-nowrap font-mono tabular ${strong ? "font-semibold text-slate-900" : "text-slate-800"}`}>{value}</span>
    </div>
  );
}

function CityDetail({ r, plan }: { r: CityResult; plan: Plan }) {
  const c = r.city;
  const rentGap = r.rentAlt ? Math.round((Math.abs(r.rentAlt - r.rent) / Math.min(r.rentAlt, r.rent)) * 100) : 0;
  const rentSrc = c.rent ? (plan.rentSrc === "kf" ? "S4" : c.rent.altSrc) : plan.rentSrc === "kf" ? "S4" : "S5";
  return (
    <div className="grid gap-6 bg-slate-50/60 px-4 pt-2 pb-5 sm:pl-14 lg:grid-cols-[1.05fr_1.25fr_1fr]">
      <div className="flex flex-col gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Year-one cost</p>
        <Row label={`Salaries (${r.nJun} + ${r.nSen} senior)`} value={money(r.salary)} />
        <Row label={<>On-costs {plan.overhead}% <AssumptionChip /></>} value={money(r.talent - r.salary)} />
        <Row label={<>Office at ₹{r.rent}/sq ft {r.rentEstimated ? <EstimateChip /> : <SourceChip id={rentSrc} />}</>} value={money(r.space)} />
        {r.rentAlt !== null && !r.rentEstimated && <Row label={<>Other source says ₹{r.rentAlt} <ConflictChip>{rentGap}% apart</ConflictChip></>} value={money(plan.n * plan.sqft * r.rentAlt * 12)} />}
        <Row label="Incentives counted" value={`− ${money(r.incentives.y1)}`} />
        <Row label="Net year one" value={money(r.y1)} strong />
        <Row label="Per engineer" value={money(r.perHead)} />
      </div>
      <div className="flex flex-col gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Incentives · {c.state}</p>
        {r.incentives.items.map((it) => (
          <div key={it.label} className="flex flex-col gap-1">
            <div className="flex items-start gap-2">
              <StatusPill status={it.status} />
              <span className="text-[13px] font-medium leading-snug text-slate-800">
                {it.label} <SourceChips ids={it.src} />
              </span>
            </div>
            <p className="pl-1 text-xs leading-relaxed text-slate-500">{it.note}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Talent and peers</p>
        <Row label={<>Engineer median {r.payEstimated ? <EstimateChip /> : <SourceChip id="S2" />}</>} value={`₹${r.swe} L`} />
        <Row label="Senior (6+ yrs) median" value={`₹${r.seniorPay} L`} />
        <Row label="Professionals tracked" value={c.pool ? `${c.pool}M` : "not published"} />
        <Row label={<>GCCs here {c.gccs && <SourceChip id={c.gccs.src} />}</>} value={c.gccs?.label ?? "not published"} />
        <p className="text-xs leading-relaxed text-slate-500">
          {c.peers.length ? (
            <>
              Peers: <span className="font-medium text-slate-700">{c.peers.join(", ")}</span> <SourceChip id={c.tier === 2 ? "S7" : "S10"} />
            </>
          ) : (
            "No named peers in our sample yet."
          )}
        </p>
        {r.payEstimated && <p className="text-xs leading-relaxed text-amber-700">Pay is estimated: nearest-metro median minus {plan.payDiscount}%. No source publishes tier-2 pay by role.</p>}
        {c.note && <p className="text-xs leading-relaxed text-slate-500">{c.note}</p>}
      </div>
    </div>
  );
}

function ModelCard({ n, goTab }: { n: number; goTab: (t: TabId) => void }) {
  const m = recommendModel(n);
  return (
    <Card className="flex flex-col gap-3 p-5">
      <h3 className="text-[15px] font-semibold text-slate-900">Setup model</h3>
      <p className="text-[15px] font-medium text-slate-900">{m.title}.</p>
      <p className="text-[13px] leading-relaxed text-slate-600">
        {m.why} <SourceChips ids={m.src} />
      </p>
      <div className="flex flex-col gap-2">
        <Row label={<>Time to operational readiness <SourceChip id="S19" /></>} value={readiness(n).label} />
        <Row label="Notice periods to plan around" value="60–90 days" />
      </div>
      <button type="button" onClick={() => goTab("roadmap")} className="mt-1 self-start text-[13px] font-medium text-brand-600 hover:text-brand-700">
        See the week-by-week roadmap and break-even →
      </button>
    </Card>
  );
}

function MemoCard({ plan, rows }: { plan: Plan; rows: CityResult[] }) {
  const memo = useMemo(() => memoText(plan, rows), [plan, rows]);
  const [msg, setMsg] = useState<string | null>(null);
  const say = (m: string) => {
    setMsg(m);
    window.setTimeout(() => setMsg(null), 2200);
  };
  const copy = async (text: string, done: string) => {
    try {
      await navigator.clipboard.writeText(text);
      say(done);
    } catch {
      say("Copy failed. Select the text instead.");
    }
  };
  const download = () => {
    const blob = new Blob([memo], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `gcc-plan-${plan.n}-engineers.md`;
    a.click();
    URL.revokeObjectURL(a.href);
    say("Downloaded");
  };
  return (
    <Card className="flex min-w-0 flex-col gap-3 p-5">
      <h3 className="text-[15px] font-semibold text-slate-900">Board memo and share link</h3>
      <p className="text-[13px] text-slate-600">A Markdown summary of this plan with sources, and a link that reopens this exact scenario.</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => copy(memo, "Memo copied")} className="rounded-lg bg-brand-600 px-3.5 py-2 text-[13px] font-medium text-white shadow-sm hover:bg-brand-700">
          Copy memo
        </button>
        <button type="button" onClick={download} className="rounded-lg border border-slate-200 px-3.5 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50">
          Download .md
        </button>
        <button type="button" onClick={() => copy(window.location.href, "Link copied")} className="rounded-lg border border-slate-200 px-3.5 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50">
          Copy scenario link
        </button>
      </div>
      <p className="h-4 text-xs font-medium text-emerald-700" aria-live="polite">
        {msg}
      </p>
      <pre className="max-h-64 overflow-auto rounded-lg bg-slate-50 p-3 font-mono text-[11.5px] leading-relaxed whitespace-pre-wrap text-slate-700">{memo}</pre>
    </Card>
  );
}
