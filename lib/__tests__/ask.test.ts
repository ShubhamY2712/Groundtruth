import { describe, expect, it } from "vitest";
import { answerQuestion, detectIntent } from "../ask";
import { DEFAULT_PLAN } from "../calc";

describe("ask", () => {
  it("detects intents", () => {
    expect(detectIntent("What incentives does Maharashtra offer?")).toBe("incentives");
    expect(detectIntent("Which city is cheapest?")).toBe("cost");
    expect(detectIntent("How long does setup take?")).toBe("timeline");
    expect(detectIntent("When should we form our own entity?")).toBe("model");
    expect(detectIntent("Office rent in Pune")).toBe("rent");
  });

  it("answers first, then attaches sourced facts", () => {
    const a = answerQuestion("Which city is cheapest for our team?", DEFAULT_PLAN);
    expect(a.answer).toMatch(/Chennai/);
    expect(a.facts.length).toBeGreaterThan(0);
  });

  it("uses the plan's headcount for eligibility", () => {
    expect(answerQuestion("What incentives do we qualify for?", { ...DEFAULT_PLAN, includeTier2: false }).answer).toMatch(/no material state incentive|Gujarat/);
    expect(answerQuestion("What does Maharashtra offer?", { ...DEFAULT_PLAN, n: 150 }).answer).toMatch(/Pune/);
  });

  it("admits when the data is missing", () => {
    expect(answerQuestion("What is the weather in Goa?", DEFAULT_PLAN).answer).toMatch(/no sourced data/);
  });
});
