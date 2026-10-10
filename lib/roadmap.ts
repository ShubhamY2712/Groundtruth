import { readiness, recommendModel } from "./calc";
import type { SourceId } from "./data/sources";

export type RoadmapRow = {
  id: string;
  label: string;
  detail: string;
  start: number; // week offset, inclusive
  end: number; // week offset, exclusive
  kind: "phase" | "bridge" | "optional";
  src: SourceId[];
};

export type Milestone = { label: string; week: number };

export type Roadmap = { rows: RoadmapRow[]; milestones: Milestone[]; totalWeeks: number; readinessLabel: string; model: ReturnType<typeof recommendModel> };

/**
 * Week-by-week setup plan. The base phases come from a 24-week plan for a 20–50 person centre (Wisemonk);
 * larger centres stretch them to the 6–9 and 9–12 month ranges the same source gives.
 */
export function buildRoadmap(n: number): Roadmap {
  const model = recommendModel(n);
  const r = readiness(n);
  const f = r.weeks / 24;
  const w = (x: number) => Math.round(x * f);
  const rows: RoadmapRow[] = [
    { id: "strategy", label: "Strategy and city", detail: "Mandate, budget, city shortlist, setup model", start: 0, end: w(4), kind: "phase", src: ["S19"] },
    model.key === "eor"
      ? { id: "entity", label: "Own entity (later)", detail: "Not needed below ~25 people; revisit as you grow", start: w(4), end: w(10), kind: "optional", src: ["S3", "S19"] }
      : { id: "entity", label: "Entity and compliance", detail: "SPICe+ incorporation, resident director, PAN/TAN/GST, PF/ESIC, bank accounts", start: w(4), end: w(10), kind: "phase", src: ["S3", "S19"] },
    { id: "bridge", label: "First hires via managed employment", detail: "EOR first hire in 1–2 weeks; no entity needed yet", start: w(4), end: w(4) + 4, kind: "bridge", src: ["S19"] },
    { id: "workspace", label: "Workspace", detail: "Managed space is fastest; custom fit-out adds 12–16 weeks", start: w(6), end: w(14), kind: "phase", src: ["S19"] },
    { id: "hiring", label: "Hiring", detail: "India head, leads, then team; plan for 60–90 day notice periods", start: w(8), end: w(18), kind: "phase", src: ["S19", "S20"] },
    { id: "golive", label: "Pilot and go-live", detail: "Knowledge transfer from HQ, first deliverables, SLAs", start: w(18), end: w(24), kind: "phase", src: ["S19"] },
  ];
  if (model.key !== "eor") {
    rows.splice(5, 0, { id: "transfer", label: "Move bridge hires to the entity", detail: "Once the entity can run payroll", start: w(10), end: w(10) + 3, kind: "bridge", src: ["S3"] });
  }
  const milestones: Milestone[] = [
    { label: "First hire", week: w(4) + 2 },
    ...(model.key === "eor" ? [] : [{ label: "Entity live", week: w(10) }]),
    { label: "Operational", week: w(24) },
  ];
  return { rows, milestones, totalWeeks: w(24), readinessLabel: r.label, model };
}

export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Month label for a week offset from a start month (0-based month index, full year). */
export function monthAt(startMonth: number, startYear: number, week: number) {
  const m = startMonth + Math.floor(week / 4.345);
  return `${MONTHS[m % 12]} ${String(startYear + Math.floor(m / 12)).slice(2)}`;
}
