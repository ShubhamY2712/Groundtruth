import { recommendModel, readiness, STATUS_LABEL, type CityResult, type Plan } from "./calc";
import { money } from "./format";

export function memoText(plan: Plan, rows: CityResult[]): string {
  const sen = Math.round((plan.n * plan.senior) / 100);
  const byCost = [...rows].sort((a, b) => a.y3 - b.y3);
  const model = recommendModel(plan.n);
  const lines: string[] = [];
  lines.push("# India GCC plan (draft)");
  lines.push("");
  lines.push(`Prepared with Groundtruth. Data as of Oct 2026.`);
  lines.push("");
  lines.push(`- Team: ${plan.n} engineers, ${sen} senior (6+ yrs)`);
  lines.push(`- Assumptions: ${plan.overhead}% employer on-costs, ${plan.sqft} sq ft per seat${plan.includeTier2 ? `, tier-2 pay ${plan.payDiscount}% and rent ${plan.rentDiscount}% below the nearest metro` : ""}`);
  lines.push(`- Rent source: ${plan.rentSrc === "kf" ? "Knight Frank" : "CRE Matrix"} Q1 2026`);
  lines.push("");
  lines.push("## Cities ranked by 3-year net cost");
  lines.push("");
  lines.push("| # | City | Year one | 3 years | Incentives, year one |");
  lines.push("|---|---|---|---|---|");
  byCost.forEach((r, i) => lines.push(`| ${i + 1} | ${r.city.name}${r.payEstimated ? " (est.)" : ""} | ${money(r.y1)} | ${money(r.y3)} | ${money(r.incentives.y1)} |`));
  lines.push("");
  lines.push("## Incentives");
  lines.push("");
  byCost.forEach((r) => {
    const a = r.incentives.items.filter((i) => ["applied", "estimate", "ineligible", "draft"].includes(i.status));
    if (a.length) lines.push(`- ${r.city.name}: ${a.map((i) => `${i.label} [${STATUS_LABEL[i.status]}]`).join("; ")}`);
  });
  lines.push("");
  lines.push("## Setup model and timeline");
  lines.push("");
  lines.push(`- ${model.title}. ${model.why}`);
  lines.push(`- Operational readiness: ${readiness(plan.n).label}`);
  lines.push("");
  lines.push("## Watch-outs");
  lines.push("");
  lines.push("- Office rent sources disagree by up to 37% for the same quarter (Knight Frank vs CRE Matrix).");
  lines.push("- Pay medians are city-wide, not role-matched; tier-2 pay is an estimate. Validate with 3–5 live offers.");
  lines.push("- Incentive figures are indicative. Confirm eligibility with counsel.");
  lines.push("");
  lines.push("Sources: Flexiple GCC pages (pay, GCC counts), Knight Frank and CRE Matrix (rents), Deloitte, KPMG, Swarajya and Rödl & Partner (state policies), Wisemonk (timelines).");
  return lines.join("\n");
}
