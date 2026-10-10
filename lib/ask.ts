import { calcAll, calcCity, recommendModel, readiness, STATUS_LABEL, BREAK_EVEN_VENDORS, impliedOverhead, type CityResult, type Plan } from "./calc";
import { CITIES, type City, type StateKey } from "./data/cities";
import { CONFLICTS } from "./data/conflicts";
import { FACTS, type Fact } from "./data/facts";
import { PROVIDERS } from "./data/providers";
import { STATES } from "./data/states";
import { money, usd } from "./format";

export type Intent = "incentives" | "cost" | "pay" | "rent" | "timeline" | "model" | "count" | "providers" | "tier2" | "talent" | "search" | "none";

export type Answer = {
  intent: Intent;
  /** The direct answer, in plain sentences. */
  answer: string;
  /** Sourced facts that back the answer. */
  facts: Fact[];
};

const CITY_ALIASES: Record<string, string[]> = {
  blr: ["bengaluru", "bangalore", "blr"],
  hyd: ["hyderabad", "hyd"],
  che: ["chennai", "madras"],
  pun: ["pune"],
  mum: ["mumbai", "bombay"],
  ncr: ["delhi", "ncr", "gurugram", "gurgaon", "noida"],
  mys: ["mysuru", "mysore"],
  cbe: ["coimbatore"],
  amd: ["ahmedabad", "gift city", "gandhinagar"],
  ngp: ["nagpur"],
  idr: ["indore"],
};

const STATE_ALIASES: Record<string, string[]> = {
  Karnataka: ["karnataka"],
  Maharashtra: ["maharashtra"],
  "Tamil Nadu": ["tamil nadu", "tamilnadu"],
  Gujarat: ["gujarat"],
  Telangana: ["telangana"],
  Haryana: ["haryana"],
  "Uttar Pradesh": ["uttar pradesh", " up "],
  "Madhya Pradesh": ["madhya pradesh", " mp "],
  Odisha: ["odisha", "orissa"],
};

const STATE_TO_KEY: Record<string, StateKey | undefined> = {
  Karnataka: "KA",
  Maharashtra: "MH",
  "Tamil Nadu": "TN",
  Gujarat: "GJ",
  Telangana: "TG",
  Haryana: "NCR",
  "Uttar Pradesh": "NCR",
  "Madhya Pradesh": "MP",
  Odisha: undefined,
};

const STOP = new Set("the a an of in for to is are what which how does do on and or with by at from it my our me i you we can much many be vs if".split(" "));
const tokens = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !STOP.has(w));

const SYN: Record<string, string> = {
  rent: "rent office lease space",
  office: "office rent space",
  salary: "salary pay cost",
  pay: "pay salary",
  cost: "cost salary rent fee",
  incentive: "incentives policy subsidy",
  incentives: "incentives policy subsidy",
  subsidy: "subsidy incentives",
  bangalore: "bengaluru",
  mysore: "mysuru",
  gurgaon: "gurugram",
  timeline: "timeline months",
  long: "timeline months",
  eor: "eor managed",
  provider: "provider partner bot",
  providers: "providers provider partner bot",
  tier: "tier-2 tier2",
};

/** Keyword retrieval over the fact base. */
export function searchFacts(q: string, limit = 4, boost = ""): Fact[] {
  let words = tokens(q + " " + boost);
  words = words.concat(...words.map((w) => (SYN[w] ? SYN[w].split(" ") : [])));
  const ws = new Set(words);
  return FACTS.map((f) => {
    const hay = new Set(tokens(f.text + " " + f.tags));
    let s = 0;
    ws.forEach((w) => {
      if (hay.has(w)) s += w.length > 3 ? 2 : 1;
    });
    return { f, s };
  })
    .filter((r) => r.s >= 2)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((r) => r.f);
}

function findCities(q: string): City[] {
  const s = ` ${q.toLowerCase()} `;
  return CITIES.filter((c) => CITY_ALIASES[c.id].some((a) => s.includes(a)));
}

function findStates(q: string): string[] {
  const s = ` ${q.toLowerCase()} `;
  return Object.keys(STATE_ALIASES).filter((k) => STATE_ALIASES[k].some((a) => s.includes(a)));
}

export function detectIntent(q: string): Intent {
  const s = q.toLowerCase();
  if (/incentive|subsid|polic|qualif|eligib|rebate|reimburse|grant|benefit|(rent|epf|payroll|capex|opex|capital|state|government) (support|assistance)/.test(s)) return "incentives";
  if (/tier.?2|tier.?ii|beyond|smaller cit|emerging cit|non.?metro/.test(s)) return "tier2";
  if (/entity|\beor\b|employer of record|managed employment|incorporat|break.?even|\bbot\b|build.operate|setup model|which model/.test(s)) return "model";
  if (/how long|timeline|how much time|weeks|months|roadmap|when can|go.?live/.test(s)) return "timeline";
  if (/rent|office|lease|sq ?ft|workspace|real estate/.test(s)) return "rent";
  if (/salary|salaries|\bpay\b|ctc|wage|compensation|median/.test(s)) return "pay";
  if (/provider|vendor|partner|advisor|consultant|who (can|should|will)? ?(build|set ?up|help)|track record/.test(s)) return "providers";
  if (/talent|pool|depth|professionals|supply/.test(s)) return "talent";
  if (/how many|number of|count/.test(s) && /gcc|centre|center/.test(s)) return "count";
  if (/cheap|expensive|cost|where should|which city|best city|budget|compare|afford/.test(s)) return "cost";
  return "search";
}

const cityLine = (r: CityResult) => `${r.city.name} ${money(r.y1)} in year one (${money(r.perHead)} per engineer)`;

function incentiveSummary(r: CityResult): string {
  const counted = r.incentives.items.filter((i) => i.status === "applied" || i.status === "estimate");
  if (counted.length) {
    return `In ${r.city.name} you get about ${money(r.incentives.y1)} in year one: ${counted.map((i) => `${i.label} (${STATUS_LABEL[i.status]})`).join("; ")}.`;
  }
  const first = r.incentives.items[0];
  return `In ${r.city.name} you qualify for nothing material right now. ${first ? `${first.label}: ${first.note}` : ""}`;
}

/** "200 engineers", "a team of 150", "80 people": a headcount in the question overrides the plan's. */
export function findHeadcount(q: string): number | null {
  const m =
    q.match(/\b(\d{2,3})[\s-]*(?:engineers?|people|persons?|staff|employees?|devs?|developers?|members?|hires?|seats?|fte)\b/i) ??
    q.match(/\bteam of (\d{2,3})\b/i);
  if (!m) return null;
  const n = Number(m[1]);
  return n >= 10 && n <= 500 ? n : null;
}

export function answerQuestion(question: string, basePlan: Plan): Answer {
  const q = question.trim();
  if (!q) return { intent: "none", answer: "", facts: [] };
  const asked = findHeadcount(q);
  const plan: Plan = asked ? { ...basePlan, n: asked } : basePlan;
  const cities = findCities(q);
  const states = findStates(q);
  let intent = detectIntent(q);
  // "What does Maharashtra offer?" is about incentives; "Tell me about Pune" is about cost.
  if (intent === "search" && states.length) intent = "incentives";
  else if (intent === "search" && cities.length) intent = "cost";
  const all = calcAll({ ...plan, includeTier2: true, rank: "y3" });
  const byId = (id: string) => all.find((r) => r.city.id === id)!;
  const n = plan.n;
  let answer = "";
  let boost = "";

  switch (intent) {
    case "incentives": {
      if (cities.length) {
        answer = cities.map((c) => incentiveSummary(byId(c.id))).join(" ");
      } else if (states.length) {
        answer = states
          .map((st) => {
            const pol = STATES.find((s) => s.name === st);
            const key = STATE_TO_KEY[st];
            const inPlan = all.filter((r) => key && r.city.stateKey === key);
            const head = pol ? `${pol.name} (${pol.statusLabel}): ${pol.items.slice(0, 2).join("; ")}. Catch: ${pol.catch}` : `${st}: no policy in the dataset.`;
            const yours = inPlan.length ? ` For your ${n} engineers: ${inPlan.map((r) => `${r.city.name} ${r.incentives.y1 > 0 ? money(r.incentives.y1) + " in year one" : "nothing material"}`).join(", ")}.` : "";
            return head + yours;
          })
          .join(" ");
      } else {
        const got = all.filter((r) => r.incentives.y1 > 0);
        answer = got.length
          ? `At ${n} engineers you qualify for incentives in ${got.map((r) => `${r.city.name} (${money(r.incentives.y1)} in year one)`).join(", ")}. Elsewhere, thresholds or zone rules rule you out.`
          : `At ${n} engineers you qualify for no material state incentive in any city modelled. Maharashtra and Beyond Bengaluru need 100+ staff; Tamil Nadu needs 200+ jobs and a Global 2000 parent.`;
        if (!got.some((r) => r.incentives.items.some((i) => i.status === "applied")) && got.length)
          answer += " Gujarat's figures are estimates: its eligibility thresholds were not in the sources checked.";
      }
      boost = "incentives policy subsidy";
      break;
    }
    case "cost": {
      if (cities.length) {
        answer = cities.map((c) => {
          const r = byId(c.id);
          const rank = all.indexOf(r) + 1;
          return `${cityLine(r)}, ranked ${rank} of ${all.length} by 3-year net cost for ${n} engineers.${r.payEstimated ? " Pay here is estimated from the nearest metro." : ""}`;
        }).join(" ");
      } else {
        const metros = all.filter((r) => r.city.tier === 1);
        const cheapest = metros[0];
        const dearest = metros[metros.length - 1];
        const t2 = all.filter((r) => r.city.tier === 2)[0];
        answer = `For ${n} engineers, the cheapest metro is ${cityLine(cheapest)}; the most expensive is ${cityLine(dearest)}, ${(dearest.y1 / cheapest.y1).toFixed(1)}× as much. Talent is over 90% of the bill.`;
        if (t2) answer += ` The cheapest tier-2 option is ${t2.city.name} at ${money(t2.y1)}, but its pay is an estimate.`;
      }
      boost = "salary pay rent cost";
      break;
    }
    case "pay": {
      const list = cities.length ? cities : CITIES.filter((c) => c.tier === 1);
      answer = list
        .map((c) => {
          const r = calcCity(c, plan);
          return `${c.name}: software engineer median ₹${r.swe} L, senior ₹${r.seniorPay} L a year${r.payEstimated ? ` (estimated: nearest-metro median minus ${plan.payDiscount}%)` : ""}.`;
        })
        .join(" ");
      boost = "salary pay median";
      break;
    }
    case "rent": {
      const list = cities.length ? cities : CITIES.filter((c) => c.tier === 1);
      answer = list
        .map((c) => {
          const r = calcCity(c, { ...plan, rentSrc: "kf" });
          if (r.rentEstimated) return `${c.name}: about ₹${r.rent}/sq ft/month (estimated, ${plan.rentDiscount}% below the nearest metro).`;
          const gap = Math.round((Math.abs(c.rent!.alt - c.rent!.kf) / Math.min(c.rent!.alt, c.rent!.kf)) * 100);
          return `${c.name}: ₹${c.rent!.kf}/sq ft/month (Knight Frank) vs ₹${c.rent!.alt} (${c.rent!.altSrc === "S5" ? "CRE Matrix" : "Beacon Filing"}), ${gap}% apart.`;
        })
        .join(" ");
      answer += " Rent is under 10% of a GCC's cost, so pay matters far more.";
      boost = "rent office";
      break;
    }
    case "timeline": {
      const r = readiness(n);
      answer = `For ${n} people, plan on ${r.label} to operational readiness. Incorporation to working bank accounts alone takes 4–6 months, so first hires usually start under managed employment, and 60–90 day notice periods push joining dates. The Roadmap tab lays this out week by week.`;
      boost = "timeline months";
      break;
    }
    case "model": {
      if (/\bbot\b|build.operate/i.test(q)) {
        answer = `Infosys and HCLTech have press-reported BOT deals: Infosys is building Truist's Hyderabad centre (about 4,500 staff) and HCLTech Western Union's (400+). Cognizant is named as a partner on Citizens Financial's (secondary source). BOT suits large centres; at ${n} engineers the planner recommends: ${recommendModel(n).title.toLowerCase()}.`;
        boost = "bot build-operate-transfer provider";
        break;
      }
      const m = recommendModel(n);
      const [f, w] = BREAK_EVEN_VENDORS.map(impliedOverhead);
      answer = `${m.title}. ${m.why} The vendors' own numbers imply an entity costs about ${usd(f[0])} a month to run (Flexiple) or ${usd(w[0])}–${usd(w[1])} (Wisemonk).`;
      boost = "entity eor break-even";
      break;
    }
    case "count": {
      const c = cities[0];
      const conflict = c?.id === "blr" ? CONFLICTS[1] : CONFLICTS[0];
      if (c && c.id !== "blr") {
        answer = c.gccs ? `${c.name}: ${c.gccs.label} GCCs in the source we use. Other sources may count centres rather than companies.` : `No published GCC count for ${c.name} in the sources checked.`;
      } else {
        answer = `It depends on the source: ${conflict.values.map((v) => `${v.display} (${v.who})`).join(", ")}. ${conflict.why}`;
      }
      boost = "count gccs";
      break;
    }
    case "providers": {
      const strong = PROVIDERS.filter((p) => p.evidence.some((e) => e.grade === "B"));
      answer = `Providers with a named, press-reported deal: ${strong.map((p) => `${p.name} (${p.evidence.find((e) => e.grade === "B")!.text})`).join("; ")}. Most other claims are self-reported, and none are client-verified yet.`;
      boost = "provider partner bot";
      break;
    }
    case "tier2": {
      const t2 = all.filter((r) => r.city.tier === 2);
      const bestMetro = all.filter((r) => r.city.tier === 1)[0];
      const saving = t2.length ? Math.round((1 - t2[0].y1 / bestMetro.y1) * 100) : 0;
      const verdict = saving > 0
        ? `On cost, likely yes: ${t2[0].city.name} comes out ${saving}% below ${bestMetro.city.name}, the cheapest metro, but tier-2 pay is an estimate and talent pools are unpublished, so validate with live offers. `
        : `On cost, not at this size: no tier-2 city beats ${bestMetro.city.name}. `;
      answer = verdict + `Tier-2 options for ${n} engineers: ${t2.map((r) => `${r.city.name} ${money(r.y1)}`).join(", ")} in year one. No source publishes tier-2 pay medians, so pay is estimated at ${plan.payDiscount}% below the nearest metro. Incentives are richer here: Mysuru gets Karnataka's rent and EPF support and Nagpur gets Maharashtra's Zone II rates, both from 100 staff.`;
      boost = "tier-2 tier2 emerging";
      break;
    }
    case "talent": {
      const metros = CITIES.filter((c) => c.pool).sort((a, b) => (b.pool ?? 0) - (a.pool ?? 0));
      answer = `Deepest pools by professionals tracked: ${metros.map((c) => `${c.name} ${c.pool}M`).join(", ")}. Tier-2 cities have no published figure.`;
      boost = "talent pool";
      break;
    }
    default:
      break;
  }

  // Weight the entities the question names so their facts rank first.
  const entityBoost = [...states, ...cities.map((c) => c.name)].join(" ").toLowerCase();
  const ranked = searchFacts(q, 8, `${boost} ${entityBoost} ${entityBoost}`);
  const names = [...states, ...cities.map((c) => c.name)].map((x) => x.toLowerCase());
  const onTopic = names.length ? ranked.filter((f) => names.some((nm) => (f.text + " " + f.tags).toLowerCase().includes(nm))) : [];
  const facts = (onTopic.length ? onTopic : ranked).slice(0, 4);
  if (answer && asked && asked !== basePlan.n) {
    answer += ` (Worked out for the ${asked} engineers in your question; your plan is set to ${basePlan.n}.)`;
  }
  if (!answer) {
    answer = facts.length
      ? `The closest sourced fact: ${facts[0].text}`
      : "Groundtruth has no sourced data for that yet. It covers GCC counts, city pay and rent, state incentives, setup models, timelines and provider evidence.";
  }
  return { intent, answer, facts };
}

export const SUGGESTED_QUESTIONS = [
  "Which city is cheapest for our team?",
  "What incentives do we qualify for?",
  "What does Maharashtra offer?",
  "Do Bengaluru GCCs get rent support?",
  "How long does setup take?",
  "When should we form our own entity?",
  "Who builds GCCs under BOT?",
  "Is a tier-2 city worth it?",
];
