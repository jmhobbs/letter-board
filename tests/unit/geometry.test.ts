import { describe, expect, it } from "vitest";
import { clampRectToBounds, isPointInRect } from "../../src/core/geometry.ts";

describe("isPointInRect", () => {
  const rect = { x: 10, y: 10, width: 20, height: 20 };

  it("returns true for a point inside the rect", () => {
    expect(isPointInRect({ x: 15, y: 15 }, rect)).toBe(true);
  });

  it("returns true for a point exactly on the rect's edge", () => {
    expect(isPointInRect({ x: 10, y: 15 }, rect)).toBe(true);
    expect(isPointInRect({ x: 30, y: 15 }, rect)).toBe(true);
  });

  it("returns false for a point outside the rect", () => {
    expect(isPointInRect({ x: 5, y: 5 }, rect)).toBe(false);
    expect(isPointInRect({ x: 31, y: 15 }, rect)).toBe(false);
  });
});

describe("clampRectToBounds", () => {
  const bounds = { x: 0, y: 0, width: 100, height: 100 };

  it("leaves a rect fully inside the bounds unchanged", () => {
    const rect = { x: 10, y: 10, width: 20, height: 20 };
    expect(clampRectToBounds(rect, bounds)).toEqual(rect);
  });

  it("pulls a rect back that overflows the right/bottom edge", () => {
    const rect = { x: 90, y: 95, width: 20, height: 20 };
    expect(clampRectToBounds(rect, bounds)).toEqual({
      x: 80,
      y: 80,
      width: 20,
      height: 20,
    });
  });

  it("pulls a rect back that is positioned before the left/top edge", () => {
    const rect = { x: -10, y: -5, width: 20, height: 20 };
    expect(clampRectToBounds(rect, bounds)).toEqual({
      x: 0,
      y: 0,
      width: 20,
      height: 20,
    });
  });

  it("clamps to the bounds origin when the rect is larger than the bounds", () => {
    const rect = { x: 50, y: 50, width: 200, height: 200 };
    expect(clampRectToBounds(rect, bounds)).toEqual({
      x: 0,
      y: 0,
      width: 200,
      height: 200,
    });
  });
});
