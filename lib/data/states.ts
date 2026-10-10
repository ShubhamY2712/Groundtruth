import type { SourceId } from "./sources";

export type PolicyStatus = "notified" | "partial" | "thin" | "draft";

export type StatePolicy = {
  name: string;
  status: PolicyStatus;
  statusLabel: string;
  targets: [string, string][];
  items: string[];
  catch: string;
  cities: string;
  src: SourceId[];
};

export const STATUS_TEXT: Record<PolicyStatus, string> = {
  notified: "Terms published and checked",
  partial: "Notified, but key terms or guidelines missing",
  thin: "Announced, amounts not in sources we could check",
  draft: "Nothing to claim yet",
};

export const STATES: StatePolicy[] = [
  {
    name: "Karnataka",
    status: "notified",
    statusLabel: "Notified Nov 2024",
    targets: [["500", "new GCCs by 2029"], ["3.5 L", "jobs"]],
    items: ["Rent support up to 50%, capped at ₹2 Cr", "EPF reimbursement up to ₹3,000 per employee per month", "Recruitment cost reimbursement up to 50%, max ₹7 Cr", "Property tax 30% for 3 years"],
    catch: "All four apply only Beyond Bengaluru (Mysuru, Mangaluru, Hubballi-Dharwad), to new units with 100+ staff. Bengaluru gets electricity duty, skilling and internship support.",
    cities: "Bengaluru, Mysuru",
    src: ["S13", "S12", "S11"],
  },
  {
    name: "Maharashtra",
    status: "partial",
    statusLabel: "Notified 2025 · guidelines pending",
    targets: [["~400", "new GCCs by 2030"], ["4 L", "jobs"]],
    items: ["Payroll subsidy 40% (Zone I) or 50% (Zone II), max ₹50,000 per employee, 100 employees, 3 years", "Rent assistance 10% (Zone I) or 20% (Zone II) for 5 years", "Capital subsidy 20% of fixed investment, as an alternative to rent support", "Stamp duty waiver, electricity duty 100% for 10 years"],
    catch: "Needs 100+ employees or ₹50 Cr+ investment. Payroll subsidy only counts staff earning over ₹1 L/month. Mumbai and Pune are Zone I; Nagpur is Zone II.",
    cities: "Mumbai, Pune, Nagpur",
    src: ["S14", "S2"],
  },
  {
    name: "Tamil Nadu",
    status: "notified",
    statusLabel: "Budget scheme, to Mar 2027",
    targets: [["50", "GCCs eligible"]],
    items: ["Payroll subsidy 30% in year 1, 20% in year 2, 10% in year 3"],
    catch: "Parent must be Forbes Global 2000 or Fortune 1000 and commit 200+ jobs. Only roles paying over ₹1 L/month count.",
    cities: "Chennai, Coimbatore",
    src: ["S15", "S2"],
  },
  {
    name: "Gujarat",
    status: "notified",
    statusLabel: "Policy 2025–30",
    targets: [["250+", "new units"], ["50,000+", "jobs"]],
    items: ["Capex support 20% (non-IT) or 30% (IT), cap ₹50 Cr below ₹250 Cr investment", "Opex support 15%, cap ₹20 Cr", "One-time 50% of CTC per new hire, capped at ₹50,000 (₹60,000 for women)", "EPF support 75% (men) or 100% (women) for 5 years"],
    catch: "Among the richest per-head packages. Eligibility thresholds were not in the sources checked, so the planner marks these as estimates.",
    cities: "Ahmedabad, GIFT City",
    src: ["S16"],
  },
  {
    name: "Uttar Pradesh",
    status: "thin",
    statusLabel: "Policy 2024",
    targets: [["1,000+", "GCCs targeted"], ["5 L", "jobs"]],
    items: ["Land cost support 30–50% by region", "Capital subsidy up to 25%", "Reimbursement of rent, power, internet and local wages", "Full stamp duty exemption"],
    catch: "Rates vary by region and the Noida rates were not in the summaries we could check.",
    cities: "Noida (NCR)",
    src: ["S12"],
  },
  {
    name: "Madhya Pradesh",
    status: "thin",
    statusLabel: "Policy 2025",
    targets: [["50+", "GCCs"], ["37,000", "jobs"]],
    items: ["Capital subsidy up to 40%", "Payroll assistance and skilling incentives", "R&D support"],
    catch: "Built for Indore and Bhopal. Payroll amounts not published in sources checked.",
    cities: "Indore",
    src: ["S12"],
  },
  {
    name: "Haryana",
    status: "thin",
    statusLabel: "Policy 2025",
    targets: [],
    items: ["Rent discounts and tax benefits", "Single-window clearance", "Extra benefits outside Gurugram"],
    catch: "Covers Gurugram, but amounts are not in public summaries we could check.",
    cities: "Gurugram (NCR)",
    src: ["S18", "S11"],
  },
  {
    name: "Odisha",
    status: "thin",
    statusLabel: "Policy 2025",
    targets: [["5", "GCC hubs"], ["50,000+", "jobs"]],
    items: ["Concessional land", "Rent and power tariff support", "SGST reimbursement, relocation help"],
    catch: "Amounts not published in sources checked.",
    cities: "Bhubaneswar",
    src: ["S12"],
  },
  {
    name: "Telangana",
    status: "draft",
    statusLabel: "Draft, Sep 2026",
    targets: [["100", "GCCs this FY"], ["~55", "already set up"]],
    items: ["Targeted support for AI, semiconductors, space, quantum, life sciences", "Push towards Warangal, Karimnagar, Nizamabad, Adilabad"],
    catch: "Hyderabad wins GCCs without a notified GCC policy. Nothing to claim yet.",
    cities: "Hyderabad",
    src: ["S17"],
  },
];
