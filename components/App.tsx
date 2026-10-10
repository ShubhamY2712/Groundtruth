"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DEFAULT_PLAN, type Plan } from "@/lib/calc";
import { CONFLICTS } from "@/lib/data/conflicts";
import { FACTS } from "@/lib/data/facts";
import { sourceList, type SourceId } from "@/lib/data/sources";
import { SITE } from "@/lib/site";
import { SourceNavContext } from "./ui";
import PlanPanel from "./PlanPanel";
import RoadmapPanel from "./RoadmapPanel";
import IncentivesPanel from "./IncentivesPanel";
import SourcesPanel from "./SourcesPanel";
import ProvidersPanel from "./ProvidersPanel";
import AskPanel from "./AskPanel";

const TABS = [
  { id: "plan", label: "Plan" },
  { id: "roadmap", label: "Roadmap" },
  { id: "incentives", label: "State incentives" },
  { id: "sources", label: "Where sources disagree" },
  { id: "providers", label: "Providers" },
  { id: "ask", label: "Ask" },
] as const;
export type TabId = (typeof TABS)[number]["id"];

/** Plan fields kept in the URL so a scenario can be shared as a link. */
const PARAMS: [keyof Plan, string][] = [
  ["n", "n"],
  ["senior", "s"],
  ["overhead", "oc"],
  ["sqft", "sq"],
  ["rentSrc", "rent"],
  ["g2000", "g2k"],
  ["payDiscount", "pd"],
  ["rentDiscount", "rd"],
  ["includeTier2", "t2"],
  ["rank", "rank"],
];

function readUrl(): { plan: Plan; tab: TabId } {
  const sp = new URLSearchParams(window.location.search);
  const plan: Plan = { ...DEFAULT_PLAN };
  for (const [key, p] of PARAMS) {
    const v = sp.get(p);
    if (v === null) continue;
    const def = DEFAULT_PLAN[key];
    if (typeof def === "number") {
      const num = Number(v);
      if (Number.isFinite(num)) (plan[key] as number) = num;
    } else if (typeof def === "boolean") (plan[key] as boolean) = v === "1";
    else (plan[key] as string) = v;
  }
  plan.n = Math.min(500, Math.max(10, plan.n));
  if (plan.rentSrc !== "kf" && plan.rentSrc !== "alt") plan.rentSrc = "kf";
  if (plan.rank !== "y3" && plan.rank !== "pool") plan.rank = "y3";
  const t = sp.get("tab");
  const tab = (TABS.find((x) => x.id === t)?.id ?? "plan") as TabId;
  return { plan, tab };
}

function writeUrl(plan: Plan, tab: TabId) {
  const sp = new URLSearchParams();
  if (tab !== "plan") sp.set("tab", tab);
  for (const [key, p] of PARAMS) {
    if (plan[key] === DEFAULT_PLAN[key]) continue;
    const v = plan[key];
    sp.set(p, typeof v === "boolean" ? (v ? "1" : "0") : String(v));
  }
  const q = sp.toString();
  window.history.replaceState(null, "", q ? `?${q}` : window.location.pathname);
}

export default function App() {
  const [plan, setPlan] = useState<Plan>(DEFAULT_PLAN);
  const [tab, setTab] = useState<TabId>("plan");
  const [ready, setReady] = useState(false);
  const [flash, setFlash] = useState<SourceId | null>(null);

  useEffect(() => {
    const s = readUrl();
    setPlan(s.plan);
    setTab(s.tab);
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) writeUrl(plan, tab);
  }, [plan, tab, ready]);

  const update = useCallback((patch: Partial<Plan>) => setPlan((p) => ({ ...p, ...patch })), []);

  const goToSource = useCallback((id: SourceId) => {
    setTab("sources");
    setFlash(id);
    window.setTimeout(() => document.getElementById(`src-${id}`)?.scrollIntoView({ block: "center", behavior: "smooth" }), 60);
    window.setTimeout(() => setFlash(null), 2000);
  }, []);

  const stats = useMemo(() => ({ facts: FACTS.length, sources: sourceList.length, conflicts: CONFLICTS.length }), []);

  return (
    <SourceNavContext.Provider value={goToSource}>
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-3.5 pb-2">
            <div className="flex items-center gap-2.5">
              <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true">
                <rect width="32" height="32" rx="8" fill="#4F46E5" />
                <path d="M16 7v13M9 20h14M16 20l-5.5 6M16 20l5.5 6" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" fill="none" />
              </svg>
              <span className="text-lg font-semibold tracking-tight">Groundtruth</span>
            </div>
            <span className="hidden text-sm text-slate-500 md:inline">Plan an India GCC on numbers you can trace</span>
            <div className="ml-auto flex items-center gap-4 text-xs text-slate-500">
              <span className="hidden sm:inline">
                Data as of <b className="font-medium text-slate-700">Oct 2026</b> · <b className="font-medium text-slate-700">{stats.sources}</b> sources ·{" "}
                <b className="font-medium text-slate-700">{stats.conflicts}</b> conflicts flagged
              </span>
              <a href={SITE.repoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50">
                <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" fill="currentColor">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                </svg>
                Code
              </a>
            </div>
          </div>
          <nav role="tablist" aria-label="Sections" className="-mb-px flex gap-1 overflow-x-auto [scrollbar-width:none]">
            {TABS.map((t) => (
              <button
                key={t.id}
                role="tab"
                id={`tab-${t.id}`}
                aria-selected={tab === t.id}
                aria-controls={`panel-${t.id}`}
                onClick={() => setTab(t.id)}
                className={`whitespace-nowrap border-b-2 px-3 pt-2 pb-2.5 text-sm font-medium transition ${tab === t.id ? "border-brand-600 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-800"}`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6" id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`}>
        {tab === "plan" && <PlanPanel plan={plan} update={update} goTab={setTab} />}
        {tab === "roadmap" && <RoadmapPanel plan={plan} update={update} />}
        {tab === "incentives" && <IncentivesPanel plan={plan} />}
        {tab === "sources" && <SourcesPanel flash={flash} />}
        {tab === "providers" && <ProvidersPanel />}
        {tab === "ask" && <AskPanel plan={plan} />}
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs leading-relaxed text-slate-500 sm:px-6">
          <p>
            Built by {SITE.author} for the Flexiple AI Product assignment. Compiled from public sources, Oct 2026. Pay medians and GCC counts from Flexiple&apos;s public GCC pages. Map boundary: Survey of India outline via the DataMeet community (CC BY 4.0).
          </p>
          <p>Incentive amounts are indicative, not legal or tax advice. Confirm eligibility with counsel before relying on them.</p>
        </div>
      </footer>
    </SourceNavContext.Provider>
  );
}
