import type { SourceId } from "./sources";

export type Fact = { id: string; text: string; src: SourceId[]; tags: string };

const raw: [string, SourceId[], string][] = [
  ["India has 2,117 GCCs running 3,728 units, employing 2.36 million people, with $98.4B revenue (FY26).", ["S1"], "count how many total gccs india size market revenue employees headcount"],
  ["506 Forbes Global 2000 companies have a GCC in India; 583 GCCs are mid-market and 504 are PE-backed.", ["S1"], "mid-market midmarket pe private equity forbes companies count"],
  ["Flexiple has verified 536 GCCs across six metros and tracks 48 new centres and expansions announced since Jan 2025.", ["S2"], "verified directory flexiple new announced upcoming count"],
  ["Six cities (Bengaluru, Hyderabad, NCR, Pune, Mumbai, Chennai) host about 92% of India's GCCs.", ["S9"], "cities concentration share which cities lead metros"],
  ["Software engineer median pay: Bengaluru ₹15.7 L, Delhi ₹14.1 L, Hyderabad ₹10.4 L, Mumbai ₹9.7 L, Pune ₹9.5 L, Chennai ₹7.6 L a year.", ["S2"], "salary pay cost engineer median talent bengaluru hyderabad chennai pune mumbai delhi ncr cheapest"],
  ["Senior (6+ yrs) median pay: Bengaluru ₹32.5 L, Hyderabad ₹24.2 L, Delhi ₹24 L, Mumbai ₹22.8 L, Pune ₹22.3 L, Chennai ₹19.1 L.", ["S2"], "senior salary pay cost experienced"],
  ["Professionals tracked: Bengaluru 7.1M, Mumbai 5.8M, Hyderabad 5.3M, Delhi 5M, Chennai 4.1M, Pune 2.4M.", ["S2"], "talent pool depth professionals supply"],
  ["Knight Frank Q1 2026 average office rent (₹/sq ft/month): Mumbai 125, Delhi-NCR 105, Bengaluru 100.6, Pune 80.9, Hyderabad 77.5, Chennai 74.5, Kolkata 48.3, Ahmedabad 45.", ["S4"], "rent office space real estate cost lease bengaluru mumbai pune hyderabad chennai kolkata ahmedabad"],
  ["CRE Matrix Q1 2026 market rent (₹/sq ft/month): Mumbai 170.8, Bengaluru 132.6, Delhi NCR 102.9, Pune 90.2, Chennai 83.3, Hyderabad 76.8. Vacancy is 24.2% in Hyderabad, 11.4% in Bengaluru.", ["S5"], "rent office vacancy space real estate"],
  ["Tier-2 office rents run 35–50% below the top six metros; Ahmedabad averages about ₹50/sq ft/month.", ["S28"], "tier-2 tier2 rent office emerging smaller cities ahmedabad indore coimbatore"],
  ["Karnataka's Beyond Bengaluru clusters (Mysuru, Mangaluru, Hubballi–Dharwad) offer 15–25% lower costs and attrition, per the state.", ["S26"], "tier-2 tier2 mysuru beyond bengaluru cost attrition cheaper karnataka"],
  ["Emerging cities host 220+ GCC units; GCC job openings there grew 42% vs 19% in metros.", ["S30"], "tier-2 tier2 emerging growth jobs smaller cities"],
  ["Coimbatore has 60+ GCC units and Ahmedabad 45+ (including Amazon, Bosch, S&P Global, Bank of America).", ["S7"], "tier-2 tier2 coimbatore ahmedabad count gccs peers"],
  ["GCCs took about 43% of office leasing in the top cities in H1 2026, up from about 29% in 2022.", ["S11"], "leasing office demand real estate share"],
  ["Karnataka (2024–29) targets 500 new GCCs. Rent support (50%, up to ₹2 Cr), EPF reimbursement (₹3,000/employee/month) and recruitment support apply only Beyond Bengaluru, for new units with 100+ staff.", ["S13"], "karnataka bengaluru mysuru incentives policy rent epf beyond subsidy"],
  ["Maharashtra GCC Policy 2025: payroll subsidy 40% (Zone I: Mumbai, Pune) or 50% (Zone II: e.g. Nagpur), max ₹50,000 per employee and 100 employees, for staff earning over ₹1 L/month; rent assistance 10% / 20% for 5 years; needs 100+ employees or ₹50 Cr+ investment.", ["S14"], "maharashtra mumbai pune nagpur payroll incentives policy rent subsidy zone"],
  ["Tamil Nadu pays a payroll subsidy of 30%, 20% and 10% over three years for GCC jobs paying over ₹1 L/month; parents must be Forbes Global 2000 or Fortune 1000 and commit 200+ jobs; runs to March 2027.", ["S15", "S2"], "tamil nadu chennai coimbatore payroll subsidy incentives policy"],
  ["Gujarat GCC Policy 2025–30: capex support 20–30%, opex 15%, one-time 50% of CTC per hire (capped at ₹50,000, or ₹60,000 for women), EPF support 75–100% for 5 years.", ["S16"], "gujarat ahmedabad gift city incentives policy capex opex subsidy"],
  ["Telangana has no notified GCC policy; one is being drafted (Sep 2026), focused on AI, semiconductors and space. Hyderabad added about 55 GCCs this financial year.", ["S17"], "telangana hyderabad policy incentives draft"],
  ["Haryana announced a GCC policy in 2025 covering Gurugram with rent discounts and tax benefits; amounts were not in public summaries.", ["S18"], "haryana gurugram gurgaon ncr delhi policy incentives"],
  ["Madhya Pradesh's GCC Policy 2025 offers capital subsidy up to 40% and payroll assistance for Indore and Bhopal, targeting 50+ GCCs.", ["S12"], "madhya pradesh mp indore bhopal policy incentives"],
  ["Ten states have GCC policies or frameworks, together targeting about 1,380 new GCCs and 1.18 million jobs by 2029–31.", ["S11"], "states policies targets competition how many states"],
  ["About 110 new GCCs were set up between early 2024 and late 2025, about 50 of them in H1 CY2025.", ["S9"], "new gccs per year pace setups upcoming"],
  ["Flexiple puts the break-even for an own entity at 25 people; Wisemonk puts it at 40–50 people.", ["S3", "S19"], "entity eor managed employment break-even model when incorporate"],
  ["Setup to operational readiness takes about 4–6 months for 20–50 people, 6–9 months for 50–200, and 9–12+ months above 200. Notice periods add 60–90 days.", ["S19"], "timeline how long setup time months weeks"],
  ["Incorporation to working bank accounts takes 4–6 months; an India-resident director is required under Section 149(3) of the Companies Act.", ["S3"], "entity incorporation legal director steps compliance registrations timeline"],
  ["EOR fees start around $99 per employee per month (Wisemonk); Flexiple charges $299 per person per month during a GCC build.", ["S19", "S27"], "eor cost fee price managed employment flexiple wisemonk"],
  ["Infosys won a $500M+ build-operate-transfer deal to build Truist's Hyderabad GCC (about 4,500 staff).", ["S21"], "bot build operate transfer infosys truist provider deal partner"],
  ["HCLTech is building Western Union's second India GCC in Hyderabad under BOT, with 400+ staff.", ["S22"], "bot hcltech western union provider partner"],
  ["ANSR says it has set up 170 centres and plans 200 more in five years, about 80% in India.", ["S23"], "ansr provider setup partner track record"],
  ["Everest Group rated 32 GCC setup providers in 2025; the report costs $6,499.", ["S24"], "providers rating analyst everest who to choose partner"],
  ["Bengaluru attrition is about 25%, per Wisemonk, adding 15–20% to the real annual cost per engineer (vendor estimate, unsourced).", ["S20"], "attrition bengaluru retention cost"],
  ["Recent Hyderabad entrants include UBS, LPL Financial, Costco, Eli Lilly, Vanguard, Marriott and T-Mobile US.", ["S10"], "hyderabad new gccs companies peers who"],
  ["Mid-market GCCs number 480+ (2025); 35% were set up in the last two years, and nearly half are in Karnataka.", ["S9", "S26"], "mid-market midmarket first-time new karnataka"],
];

export const FACTS: Fact[] = raw.map(([text, src, tags], i) => ({ id: `F${i + 1}`, text, src, tags }));
