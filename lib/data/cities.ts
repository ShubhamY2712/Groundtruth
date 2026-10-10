import type { SourceId } from "./sources";

export type CityId = "blr" | "hyd" | "che" | "pun" | "mum" | "ncr" | "mys" | "cbe" | "amd" | "ngp" | "idr";
export type StateKey = "KA" | "TG" | "TN" | "MH" | "NCR" | "GJ" | "MP";

export type City = {
  id: CityId;
  name: string;
  state: string;
  stateKey: StateKey;
  tier: 1 | 2;
  /** Sourced pay medians in ₹ lakh a year (Flexiple talent graph). Tier-2 cities have none published. */
  pay?: { swe: number; senior: number };
  /** Tier-2: pay estimated as this metro's medians minus the tier-2 pay discount assumption. */
  payRef?: CityId;
  /** Office rent, ₹ per sq ft per month. */
  rent?: { kf: number; alt: number; altSrc: SourceId };
  /** Tier-2 without a published rent: estimated from this metro's rent minus the tier-2 rent discount. */
  rentRef?: CityId;
  /** Professionals tracked by Flexiple, millions. */
  pool?: number;
  gccs?: { label: string; value: number; src: SourceId };
  peers: string[];
  note?: string;
};

export const CITIES: City[] = [
  { id: "blr", name: "Bengaluru", state: "Karnataka", stateKey: "KA", tier: 1, pay: { swe: 15.7, senior: 32.5 }, rent: { kf: 100.6, alt: 132.6, altSrc: "S5" }, pool: 7.1, gccs: { label: "437", value: 437, src: "S2" }, peers: ["Ferguson", "Deepwatch", "Zeiss India", "Best Buy", "Rakuten (expansion)"] },
  { id: "hyd", name: "Hyderabad", state: "Telangana", stateKey: "TG", tier: 1, pay: { swe: 10.4, senior: 24.2 }, rent: { kf: 77.5, alt: 76.8, altSrc: "S5" }, pool: 5.3, gccs: { label: "299", value: 299, src: "S2" }, peers: ["UBS", "LPL Financial", "Costco", "Eli Lilly", "Vanguard", "Marriott", "T-Mobile US", "Western Union"] },
  { id: "che", name: "Chennai", state: "Tamil Nadu", stateKey: "TN", tier: 1, pay: { swe: 7.6, senior: 19.1 }, rent: { kf: 74.5, alt: 83.3, altSrc: "S5" }, pool: 4.1, gccs: { label: "244", value: 244, src: "S2" }, peers: ["Walmart Global Tech (2nd GCC)"] },
  { id: "pun", name: "Pune", state: "Maharashtra", stateKey: "MH", tier: 1, pay: { swe: 9.5, senior: 22.3 }, rent: { kf: 80.9, alt: 90.2, altSrc: "S5" }, pool: 2.4, gccs: { label: "169", value: 169, src: "S2" }, peers: ["Medtronic"] },
  { id: "mum", name: "Mumbai", state: "Maharashtra", stateKey: "MH", tier: 1, pay: { swe: 9.7, senior: 22.8 }, rent: { kf: 125, alt: 170.8, altSrc: "S5" }, pool: 5.8, gccs: { label: "283", value: 283, src: "S2" }, peers: [] },
  { id: "ncr", name: "Delhi NCR", state: "Haryana · UP · Delhi", stateKey: "NCR", tier: 1, pay: { swe: 14.1, senior: 24 }, rent: { kf: 105, alt: 102.9, altSrc: "S5" }, pool: 5.0, gccs: { label: "277", value: 277, src: "S2" }, peers: ["OpenAI (New Delhi)", "Carlsberg (Gurugram)", "DAMAC (Noida)"] },
  { id: "mys", name: "Mysuru", state: "Karnataka", stateKey: "KA", tier: 2, payRef: "blr", rentRef: "blr", peers: [], note: "Beyond Bengaluru cluster. No published GCC count." },
  { id: "cbe", name: "Coimbatore", state: "Tamil Nadu", stateKey: "TN", tier: 2, payRef: "che", rentRef: "che", gccs: { label: "60+", value: 60, src: "S7" }, peers: ["Amazon", "Bosch Global Software Technologies", "Colruyt Group"] },
  { id: "amd", name: "Ahmedabad", state: "Gujarat", stateKey: "GJ", tier: 2, payRef: "pun", rent: { kf: 45, alt: 50, altSrc: "S28" }, gccs: { label: "45+", value: 45, src: "S7" }, peers: ["S&P Global", "Bank of America", "Cadence"], note: "Includes GIFT City corridor." },
  { id: "ngp", name: "Nagpur", state: "Maharashtra", stateKey: "MH", tier: 2, payRef: "pun", rentRef: "pun", peers: [], note: "Maharashtra Zone II: richer incentives than Mumbai and Pune." },
  { id: "idr", name: "Indore", state: "Madhya Pradesh", stateKey: "MP", tier: 2, payRef: "pun", rentRef: "pun", peers: [], note: "MP's GCC policy is built for Indore and Bhopal." },
];

export const cityById = (id: CityId): City => {
  const c = CITIES.find((x) => x.id === id);
  if (!c) throw new Error(`Unknown city ${id}`);
  return c;
};
