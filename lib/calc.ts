import { CITIES, cityById, type City, type CityId } from "./data/cities";
import type { SourceId } from "./data/sources";

const L = 1e5; // one lakh
const CR = 1e7; // one crore
/** Roles above ₹1 lakh a month qualify for several payroll subsidies (₹12 L a year). */
const HIGH_PAY_THRESHOLD_L = 12;

export type Plan = {
  /** Engineers in year one. */
  n: number;
  /** Share of seniors (6+ years), percent. */
  senior: number;
  /** Employer on-costs on top of salary, percent. Assumption. */
  overhead: number;
  /** Leasable sq ft per seat. Assumption. */
  sqft: number;
  /** Which office-rent source to use for metros. */
  rentSrc: "kf" | "alt";
  /** Parent is Forbes Global 2000 or Fortune 1000. */
  g2000: boolean;
  /** Tier-2 pay discount vs the reference metro, percent. Assumption (sources say 15–35%). */
  payDiscount: number;
  /** Tier-2 rent discount vs the reference metro, percent. Assumption (source says 35–50%). */
  rentDiscount: number;
  includeTier2: boolean;
  rank: "y3" | "pool";
};

export const DEFAULT_PLAN: Plan = {
  n: 60,
  senior: 30,
  overhead: 12,
  sqft: 100,
  rentSrc: "kf",
  g2000: false,
  payDiscount: 20,
  rentDiscount: 40,
  includeTier2: true,
  rank: "y3",
};

export type IncentiveStatus = "applied" | "estimate" | "ineligible" | "elsewhere" | "notmodeled" | "draft" | "unverified";

export const STATUS_LABEL: Record<IncentiveStatus, string> = {
  applied: "you qualify",
  estimate: "estimated",
  ineligible: "not eligible",
  elsewhere: "not in this city",
  notmodeled: "not modelled",
  draft: "draft policy",
  unverified: "terms unverified",
};

export type IncentiveItem = {
  status: IncentiveStatus;
  label: string;
  note: string;
  src: SourceId[];
  y1: number;
  y3: number;
};

export type CityResult = {
  city: City;
  nSen: number;
  nJun: number;
  swe: number;
  seniorPay: number;
  payEstimated: boolean;
  rent: number;
  rentAlt: number | null;
  rentEstimated: boolean;
  salary: number;
  talent: number;
  space: number;
  gross: number;
  incentives: { items: IncentiveItem[]; y1: number; y3: number };
  y1: number;
  y3: number;
  /** Year-one net cost per engineer. */
  perHead: number;
};

type Ctx = { plan: Plan; city: City; nSen: number; nJun: number; swe: number; seniorPay: number; space: number };

function highPaid(c: Ctx) {
  const count = (c.swe > HIGH_PAY_THRESHOLD_L ? c.nJun : 0) + (c.seniorPay > HIGH_PAY_THRESHOLD_L ? c.nSen : 0);
  const salary = ((c.swe > HIGH_PAY_THRESHOLD_L ? c.nJun * c.swe : 0) + (c.seniorPay > HIGH_PAY_THRESHOLD_L ? c.nSen * c.seniorPay : 0)) * L;
  return { count, salary };
}

const money = (v: number) => (v >= CR ? `₹${(v / CR).toFixed(2)} Cr` : `₹${(v / L).toFixed(1)} L`);

function karnataka(c: Ctx): IncentiveItem[] {
  const { n } = c.plan;
  if (c.city.tier === 1) {
    return [
      { status: "elsewhere", label: "Rent support, 50% up to ₹2 Cr", note: "Beyond Bengaluru only (Mysuru, Mangaluru, Hubballi-Dharwad and others), new units with 100+ staff.", src: ["S13"], y1: 0, y3: 0 },
      { status: "elsewhere", label: "EPF reimbursement, ₹3,000 per employee per month", note: "Beyond Bengaluru only, new units with 100+ staff.", src: ["S13"], y1: 0, y3: 0 },
      { status: "notmodeled", label: "Electricity duty, skilling (20%, capped), internships (50% of stipend)", note: "Available in Bengaluru, but small and tied to actual bills and training spend.", src: ["S13"], y1: 0, y3: 0 },
    ];
  }
  const elig = n >= 100;
  const rent = elig ? Math.min(0.5 * c.space, 2 * CR) : 0;
  const epfYear = elig ? 3000 * 12 * n : 0;
  return [
    {
      status: elig ? "applied" : "ineligible",
      label: "Rent support, 50% up to ₹2 Cr for the first year",
      note: elig ? `Worth ${money(rent)} on your office cost.` : `Needs a new unit with 100+ staff. Your plan has ${n}.`,
      src: ["S13", "S12"],
      y1: rent,
      y3: rent,
    },
    {
      status: elig ? "applied" : "ineligible",
      label: "EPF reimbursement, ₹3,000 per employee per month for 2 years",
      note: elig ? `${n} employees × ₹36,000 a year = ${money(epfYear)} a year.` : "Same 100-staff threshold.",
      src: ["S13", "S12"],
      y1: epfYear,
      y3: epfYear * 2,
    },
    { status: "notmodeled", label: "Recruitment cost reimbursement up to 50% (max ₹7 Cr), property tax 30% for 3 years", note: "Depends on your recruitment spend and property. Nano GCCs (5–50 staff) have their own scheme; terms not published in sources checked.", src: ["S13", "S29"], y1: 0, y3: 0 },
  ];
}

function maharashtra(c: Ctx): IncentiveItem[] {
  const { n } = c.plan;
  const zone2 = c.city.id === "ngp";
  const elig = n >= 100;
  const cap = n >= 750 ? 4 * CR : n >= 500 ? 3 * CR : n >= 250 ? 2 * CR : 1 * CR;
  const hp = highPaid(c);
  const pEmp = Math.min(100, hp.count);
  const payTotal = elig ? Math.min(pEmp * 50000, 5 * CR) : 0;
  const rentPct = zone2 ? 0.2 : 0.1;
  const rentY1 = elig ? Math.min(rentPct * c.space, cap) : 0;
  const rentY3 = elig ? Math.min(rentPct * c.space * 3, cap) : 0;
  const zone = zone2 ? "Zone II" : "Zone I";
  return [
    {
      status: elig ? "applied" : "ineligible",
      label: `Payroll subsidy, ${zone} (${zone2 ? 50 : 40}% of salary, max ₹50,000 per employee, 100 employees)`,
      note: elig
        ? `${pEmp} roles earn over ₹1 L/month by median pay. Worth ${money(payTotal)} over 3 years, paid 30/30/40.`
        : `Needs a Small-class unit: 100+ employees or ₹50 Cr+ fixed investment. Your plan has ${n}.`,
      src: ["S14"],
      y1: payTotal * 0.3,
      y3: payTotal,
    },
    {
      status: elig ? "applied" : "ineligible",
      label: `Rent assistance, ${zone} (${zone2 ? 20 : 10}% of rent for 5 years)`,
      note: elig ? `Capped at ${money(cap)} for your size class. Not combinable with the capital subsidy.` : "Same 100-employee threshold.",
      src: ["S14"],
      y1: rentY1,
      y3: rentY3,
    },
    { status: "notmodeled", label: "Stamp duty waiver, electricity duty (100%, 10 years)" + (zone2 ? ", interest subsidy" : ""), note: "Real, but depends on your lease, power bills and loans. Operating guidelines not yet released.", src: ["S14"], y1: 0, y3: 0 },
  ];
}

function tamilNadu(c: Ctx): IncentiveItem[] {
  const { n, g2000 } = c.plan;
  const elig = g2000 && n >= 200;
  const hp = highPaid(c);
  const why: string[] = [];
  if (!g2000) why.push("the parent must be Forbes Global 2000 or Fortune 1000");
  if (n < 200) why.push(`it needs 200+ jobs (your plan: ${n})`);
  return [
    {
      status: elig ? "applied" : "ineligible",
      label: "Payroll subsidy: 30% / 20% / 10% over 3 years",
      note: elig
        ? `Only roles paying over ₹1 L/month count: ${hp.count} of your ${n} by median pay. Scheme runs to March 2027.`
        : `Not eligible: ${why.join(", and ")}. Even when eligible, only roles above ₹1 L/month count, which excludes the city's median engineer.`,
      src: ["S15", "S2"],
      y1: elig ? 0.3 * hp.salary : 0,
      y3: elig ? 0.6 * hp.salary : 0,
    },
  ];
}

function gujarat(c: Ctx): IncentiveItem[] {
  const { n } = c.plan;
  const egi = 50000 * n;
  const epfYear = 0.75 * 1800 * 12 * n;
  return [
    { status: "estimate", label: "One-time hiring incentive: 50% of CTC, capped at ₹50,000 per new hire (₹60,000 for women)", note: `${n} hires × ₹50,000. Eligibility thresholds were not in the sources checked.`, src: ["S16"], y1: egi, y3: egi },
    { status: "estimate", label: "EPF support: 75% (men) or 100% (women) for 5 years", note: "Assumes employer EPF on the ₹15,000 statutory wage ceiling (₹1,800 a month) at 75%.", src: ["S16"], y1: epfYear, y3: epfYear * 3 },
    { status: "notmodeled", label: "Capex support 20–30%, opex support 15%", note: "Needs your fit-out capex; eligible opex is not defined in the sources checked.", src: ["S16"], y1: 0, y3: 0 },
  ];
}

function incentiveItems(c: Ctx): IncentiveItem[] {
  switch (c.city.stateKey) {
    case "KA":
      return karnataka(c);
    case "MH":
      return maharashtra(c);
    case "TN":
      return tamilNadu(c);
    case "GJ":
      return gujarat(c);
    case "TG":
      return [{ status: "draft", label: "Telangana GCC policy", note: "Still being drafted (Sep 2026). Officials signal targeted support for new ecosystems such as AI, semiconductors and space, not broad subsidies.", src: ["S17"], y1: 0, y3: 0 }];
    case "NCR":
      return [
        { status: "unverified", label: "Haryana GCC Policy 2025 (Gurugram)", note: "Rent discounts, tax benefits and single-window clearance are announced. Amounts are not in any public summary we could check.", src: ["S18", "S11"], y1: 0, y3: 0 },
        { status: "unverified", label: "Uttar Pradesh GCC Policy 2024 (Noida)", note: "Reimburses rent, power, internet and local wages, with rates that vary by region. Noida rates not confirmed.", src: ["S12"], y1: 0, y3: 0 },
      ];
    case "MP":
      return [{ status: "unverified", label: "Madhya Pradesh GCC Policy 2025", note: "Capital subsidy up to 40%, payroll assistance and skilling support. Payroll amounts are not published in sources checked.", src: ["S12"], y1: 0, y3: 0 }];
  }
}

const COUNTED: IncentiveStatus[] = ["applied", "estimate"];

export function calcCity(city: City, plan: Plan): CityResult {
  const nSen = Math.round((plan.n * plan.senior) / 100);
  const nJun = plan.n - nSen;
  const payBase = city.pay ?? cityById(city.payRef as CityId).pay!;
  const payFactor = city.pay ? 1 : 1 - plan.payDiscount / 100;
  const swe = round1(payBase.swe * payFactor);
  const seniorPay = round1(payBase.senior * payFactor);

  let rent: number;
  let rentAlt: number | null;
  let rentEstimated = false;
  if (city.rent) {
    rent = plan.rentSrc === "kf" ? city.rent.kf : city.rent.alt;
    rentAlt = plan.rentSrc === "kf" ? city.rent.alt : city.rent.kf;
  } else {
    const ref = cityById(city.rentRef as CityId).rent!;
    const f = 1 - plan.rentDiscount / 100;
    rent = round1((plan.rentSrc === "kf" ? ref.kf : ref.alt) * f);
    rentAlt = round1((plan.rentSrc === "kf" ? ref.alt : ref.kf) * f);
    rentEstimated = true;
  }

  const salary = (nJun * swe + nSen * seniorPay) * L;
  const talent = salary * (1 + plan.overhead / 100);
  const space = plan.n * plan.sqft * rent * 12;
  const ctx: Ctx = { plan, city, nSen, nJun, swe, seniorPay, space };
  const items = incentiveItems(ctx);
  const inc = items.filter((i) => COUNTED.includes(i.status));
  const y1Inc = inc.reduce((a, i) => a + i.y1, 0);
  const y3Inc = inc.reduce((a, i) => a + i.y3, 0);
  const gross = talent + space;
  const y1 = gross - y1Inc;
  return {
    city,
    nSen,
    nJun,
    swe,
    seniorPay,
    payEstimated: !city.pay,
    rent,
    rentAlt,
    rentEstimated,
    salary,
    talent,
    space,
    gross,
    incentives: { items, y1: y1Inc, y3: y3Inc },
    y1,
    y3: 3 * gross - y3Inc,
    perHead: y1 / plan.n,
  };
}

export function calcAll(plan: Plan): CityResult[] {
  const rows = CITIES.filter((c) => plan.includeTier2 || c.tier === 1).map((c) => calcCity(c, plan));
  return rows.sort((a, b) => (plan.rank === "pool" ? (b.city.pool ?? 0) - (a.city.pool ?? 0) : a.y3 - b.y3));
}

function round1(v: number) {
  return Math.round(v * 10) / 10;
}

/* ---------- Setup model and break-even ---------- */

export type ModelAdvice = { key: "eor" | "disputed" | "entity"; title: string; why: string; src: SourceId[] };

export function recommendModel(n: number): ModelAdvice {
  if (n < 25)
    return { key: "eor", title: "Start with managed employment (EOR)", why: "Both sources agree an own entity does not pay off below 25 people. First hires in 1–4 weeks, no incorporation.", src: ["S3", "S19"] };
  if (n <= 50)
    return { key: "disputed", title: "Managed employment now, incorporate in parallel", why: "This is the disputed zone: Flexiple puts the break-even at 25 people, Wisemonk at 40–50. Both sell managed employment, so treat the range as real.", src: ["S3", "S19"] };
  return { key: "entity", title: "Own entity, hiring under managed employment while it forms", why: "Past 50 people both sources favour an entity. Incorporation to working bank accounts takes about 4–6 months.", src: ["S3", "S19"] };
}

export function readiness(n: number) {
  if (n <= 50) return { label: "4–6 months", weeks: 24 };
  if (n <= 200) return { label: "6–9 months", weeks: 36 };
  return { label: "9–12+ months", weeks: 48 };
}

export type BreakEvenVendor = { name: string; fee: number; breakEven: [number, number]; src: SourceId[]; color: string };

/** Each vendor's per-person fee and its own stated break-even. Fee × break-even = the entity running cost each vendor implies. */
export const BREAK_EVEN_VENDORS: BreakEvenVendor[] = [
  { name: "Flexiple managed employment", fee: 299, breakEven: [25, 25], src: ["S27", "S3"], color: "#4F46E5" },
  { name: "Wisemonk EOR", fee: 99, breakEven: [40, 50], src: ["S19"], color: "#F59E0B" },
];

export function impliedOverhead(v: BreakEvenVendor): [number, number] {
  return [v.fee * v.breakEven[0], v.fee * v.breakEven[1]];
}

export { L, CR, HIGH_PAY_THRESHOLD_L };
