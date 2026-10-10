import type { SourceId } from "./sources";

export type Grade = "A" | "B" | "C" | "D";

export const GRADES: Record<Grade, { title: string; desc: string }> = {
  A: { title: "Client-verified", desc: "Confirmed by the client inside Groundtruth" },
  B: { title: "Named deal, press", desc: "A named client deal or agreement reported by press" },
  C: { title: "Secondary list", desc: "Named in a compiled list, not a primary report" },
  D: { title: "Self-reported", desc: "The provider's own claim or marketing" },
};

export type Provider = { name: string; category: string; self?: boolean; evidence: { grade: Grade; text: string; src: SourceId }[] };

export const PROVIDERS: Provider[] = [
  { name: "Infosys", category: "Build-operate-transfer", evidence: [{ grade: "B", text: "BOT for Truist Financial, Hyderabad: about 4,500 staff, $500M+, awarded Mar 2026", src: "S21" }] },
  { name: "HCLTech", category: "Build-operate-transfer", evidence: [{ grade: "B", text: "BOT for Western Union's second India GCC, Hyderabad, 400+ staff (Dec 2025)", src: "S22" }] },
  { name: "Cognizant", category: "Build-operate-transfer", evidence: [{ grade: "C", text: "Partner on Citizens Financial Group's Hyderabad GCC (2024)", src: "S10" }] },
  {
    name: "ANSR",
    category: "GCC setup partner",
    evidence: [
      { grade: "D", text: "Says it has set up 170 centres with about 2 lakh employees", src: "S23" },
      { grade: "B", text: "MoUs with Maharashtra (Navi Mumbai GCC City) and Andhra Pradesh (Visakhapatnam campus)", src: "S12" },
    ],
  },
  {
    name: "EY",
    category: "Advisor",
    evidence: [
      { grade: "C", text: "Partner on Daikin's Gurugram GCC (2024)", src: "S10" },
    ],
  },
  { name: "Zinnov", category: "Advisor", evidence: [{ grade: "D", text: "Says it has delivered 220+ GCC setups and placed 250,000+ people", src: "S1" }] },
  { name: "Everest Group", category: "Analyst", evidence: [{ grade: "D", text: "Rates 32 GCC setup providers in a $6,499 report; ratings not public", src: "S24" }] },
  { name: "Flexiple", category: "Managed employment → entity", self: true, evidence: [{ grade: "D", text: "GCC build-out at $299 per person per month during the build, from its own pricing page", src: "S27" }] },
  { name: "Wisemonk", category: "Employer of record", evidence: [{ grade: "D", text: "EOR at $99 per employee per month; publishes setup timelines", src: "S19" }] },
  { name: "Knight Frank, CBRE, JLL, Colliers", category: "Real estate", evidence: [{ grade: "D", text: "Publish GCC leasing research; no per-client delivery records public", src: "S4" }] },
];
