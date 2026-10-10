import type { SourceId } from "./sources";

export type ConflictValue = { value: number; display: string; who: string; src: SourceId };
export type Conflict = { question: string; values: ConflictValue[]; pick: number | null; why: string };

/** Where published sources disagree. `pick` is the index of the planner's default, or null when the planner shows the range. */
export const CONFLICTS: Conflict[] = [
  {
    question: "How many GCCs are there in India?",
    values: [
      { value: 536, display: "536", who: "Flexiple, verified own-team centres only, Aug 2026", src: "S2" },
      { value: 1600, display: "1,600+", who: "GCC Explorer directory", src: "S6" },
      { value: 1700, display: "~1,700", who: "Government figure, FY24", src: "S7" },
      { value: 1800, display: "1,800+", who: "Ceipal, no source given", src: "S8" },
      { value: 2117, display: "2,117", who: "Zinnov–nasscom, FY26", src: "S1" },
    ],
    pick: 4,
    why: "Definitions differ: companies vs centres (2,117 GCCs run 3,728 units), whether services-led centres count, and the data year. Default: Zinnov–nasscom for market size, Flexiple's verified list for named peers.",
  },
  {
    question: "How many GCCs are in Bengaluru?",
    values: [
      { value: 437, display: "437", who: "Flexiple, verified", src: "S2" },
      { value: 612, display: "612", who: "GCC Explorer", src: "S6" },
      { value: 880, display: "880+", who: "Zinnov, centres, 2025", src: "S9" },
      { value: 900, display: "900+", who: "JLL, units, Feb 2026 (via Flexiple)", src: "S2" },
    ],
    pick: 0,
    why: "Centres vs companies again, plus verification. Default: Flexiple's 437, because each is a named, checked profile.",
  },
  {
    question: "Bengaluru office rent, Q1 2026 (₹/sq ft/month)",
    values: [
      { value: 100.6, display: "₹100.6", who: "Knight Frank, average rent", src: "S4" },
      { value: 132.6, display: "₹132.6", who: "CRE Matrix, market rent", src: "S5" },
    ],
    pick: 0,
    why: "Achieved average rent vs asking market rent. The 32% gap is about ₹23 L a year on 6,000 sq ft. Default: Knight Frank, switchable in the planner.",
  },
  {
    question: "Mumbai office rent, Q1 2026 (₹/sq ft/month)",
    values: [
      { value: 125, display: "₹125", who: "Knight Frank", src: "S4" },
      { value: 170.8, display: "₹170.8", who: "CRE Matrix", src: "S5" },
    ],
    pick: 0,
    why: "The widest rent gap of the six metros, at 37%.",
  },
  {
    question: "New GCCs set up per year",
    values: [
      { value: 55, display: "~55/yr", who: "Zinnov: ~110 across 2024–25", src: "S9" },
      { value: 100, display: "~100/yr", who: "Zinnov: ~50 in H1 CY2025, annualised", src: "S9" },
      { value: 101, display: "100+/yr", who: "JLL: 200+ across 2024–25 (via Flexiple)", src: "S2" },
      { value: 240, display: "~240/yr", who: "HFS: ~120 in H1 2024 alone, annualised (via Ceipal)", src: "S10" },
    ],
    pick: null,
    why: "New parent companies vs new centres vs expansions. This matters to anyone sizing the market, and to states setting targets.",
  },
  {
    question: "Headcount where an own entity beats managed employment",
    values: [
      { value: 25, display: "25", who: "Flexiple", src: "S3" },
      { value: 40, display: "40", who: "Wisemonk, low end", src: "S19" },
      { value: 50, display: "50", who: "Wisemonk, high end", src: "S19" },
    ],
    pick: null,
    why: "Both sources sell managed employment or EOR. The planner shows 25–50 as a disputed zone, and the Roadmap tab shows what each vendor's numbers imply.",
  },
  {
    question: "How much cheaper is tier-2 talent?",
    values: [
      { value: 15, display: "15%", who: "Zinnov–KDEM, Karnataka clusters, low end", src: "S26" },
      { value: 25, display: "25%", who: "Zinnov–KDEM, high end", src: "S26" },
      { value: 35, display: "35%", who: "Ceipal, high end of 20–35%, no source given", src: "S8" },
    ],
    pick: null,
    why: "No source publishes tier-2 pay medians by role. The planner uses an editable 20% discount from the nearest metro, inside both ranges.",
  },
  {
    question: "Mid-market GCCs in India",
    values: [
      { value: 480, display: "480+", who: "Zinnov, 2025", src: "S9" },
      { value: 583, display: "583", who: "Zinnov–nasscom, 2026", src: "S1" },
    ],
    pick: 1,
    why: "Same analyst, one year apart: growth, reclassification or both. The report does not say which.",
  },
];
