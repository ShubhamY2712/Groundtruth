import { describe, expect, it } from "vitest";
import { buildRoadmap } from "../roadmap";

describe("roadmap", () => {
  it("fits a 40-person centre into about 24 weeks", () => {
    expect(buildRoadmap(40).totalWeeks).toBe(24);
  });
  it("stretches for larger centres", () => {
    expect(buildRoadmap(150).totalWeeks).toBe(36);
    expect(buildRoadmap(300).totalWeeks).toBe(48);
  });
  it("marks the entity optional for small EOR teams", () => {
    expect(buildRoadmap(15).rows.find((r) => r.id === "entity")?.kind).toBe("optional");
  });
});
