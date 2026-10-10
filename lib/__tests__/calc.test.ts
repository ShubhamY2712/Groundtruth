import { describe, expect, it } from "vitest";
import { calcAll, calcCity, DEFAULT_PLAN, recommendModel, BREAK_EVEN_VENDORS, impliedOverhead } from "../calc";
import { cityById } from "../data/cities";

const plan = { ...DEFAULT_PLAN };

describe("cost model", () => {
  it("matches the worked example: 60 engineers in Chennai cost about ₹7.96 Cr in year one", () => {
    const r = calcCity(cityById("che"), plan);
    expect(r.nSen).toBe(18);
    expect(r.y1 / 1e7).toBeCloseTo(7.96, 2);
  });

  it("ranks Chennai as the cheapest metro and Bengaluru as the most expensive at default settings", () => {
    const metros = calcAll({ ...plan, includeTier2: false });
    expect(metros[0].city.id).toBe("che");
    expect(metros[metros.length - 1].city.id).toBe("blr");
  });

  it("estimates tier-2 pay from the reference metro minus the pay discount", () => {
    const r = calcCity(cityById("mys"), { ...plan, payDiscount: 20 });
    expect(r.payEstimated).toBe(true);
    expect(r.swe).toBeCloseTo(15.7 * 0.8, 1);
  });

  it("switches rent source for metros", () => {
    const kf = calcCity(cityById("blr"), plan);
    const cre = calcCity(cityById("blr"), { ...plan, rentSrc: "alt" });
    expect(kf.rent).toBe(100.6);
    expect(cre.rent).toBe(132.6);
  });
});

describe("incentive engine", () => {
  it("gives nothing in Maharashtra below 100 employees", () => {
    const r = calcCity(cityById("pun"), { ...plan, n: 60 });
    expect(r.incentives.y1).toBe(0);
    expect(r.incentives.items[0].status).toBe("ineligible");
  });

  it("unlocks Maharashtra payroll and rent support at 120 employees, under 1% of cost in Pune", () => {
    const r = calcCity(cityById("pun"), { ...plan, n: 120 });
    expect(r.incentives.y1).toBeGreaterThan(0);
    expect(r.incentives.y1 / r.gross).toBeLessThan(0.01);
  });

  it("never gives Bengaluru the Beyond Bengaluru rent or EPF support", () => {
    const r = calcCity(cityById("blr"), { ...plan, n: 300 });
    expect(r.incentives.y1).toBe(0);
  });

  it("gives Mysuru rent and EPF support from 100 staff", () => {
    const r = calcCity(cityById("mys"), { ...plan, n: 100 });
    expect(r.incentives.items.filter((i) => i.status === "applied")).toHaveLength(2);
    expect(r.incentives.y1).toBeGreaterThanOrEqual(100 * 36000);
  });

  it("requires a Global 2000 parent and 200 jobs for Tamil Nadu", () => {
    expect(calcCity(cityById("che"), { ...plan, n: 250 }).incentives.y1).toBe(0);
    expect(calcCity(cityById("che"), { ...plan, n: 250, g2000: true }).incentives.y1).toBeGreaterThan(0);
  });

  it("counts unverified and draft policies as zero", () => {
    expect(calcCity(cityById("hyd"), { ...plan, n: 400 }).incentives.y1).toBe(0);
    expect(calcCity(cityById("ncr"), { ...plan, n: 400 }).incentives.y1).toBe(0);
  });
});

describe("setup model", () => {
  it("recommends EOR below 25, flags 25–50 as disputed, entity above 50", () => {
    expect(recommendModel(20).key).toBe("eor");
    expect(recommendModel(40).key).toBe("disputed");
    expect(recommendModel(60).key).toBe("entity");
  });

  it("derives each vendor's implied entity overhead from fee × break-even", () => {
    expect(impliedOverhead(BREAK_EVEN_VENDORS[0])).toEqual([7475, 7475]);
    expect(impliedOverhead(BREAK_EVEN_VENDORS[1])).toEqual([3960, 4950]);
  });
});
