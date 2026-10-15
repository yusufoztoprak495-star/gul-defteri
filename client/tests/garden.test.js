import { describe, it, expect } from "vitest";
import { bloomStage } from "../src/lib/garden.js";

describe("bloomStage", () => {
  it("hiç çalışılmayan gün filiz olarak kalır", () => {
    expect(bloomStage(0, 3600)).toBe("none");
    expect(bloomStage(0, 0)).toBe("none");
  });

  it("haftanın en uzun gününe göre gonca, yarı açmış ve tam açmış olur", () => {
    expect(bloomStage(600, 3600)).toBe("bud");
    expect(bloomStage(1800, 3600)).toBe("half");
    expect(bloomStage(3000, 3600)).toBe("full");
    expect(bloomStage(3600, 3600)).toBe("full");
  });

  it("bozuk değerde filiz döner (NaN gül açmaz)", () => {
    expect(bloomStage(NaN, 3600)).toBe("none");
    expect(bloomStage(600, NaN)).toBe("none");
  });
});
