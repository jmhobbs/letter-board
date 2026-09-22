import { describe, expect, it } from "vitest";
import type { BoardTileInstance } from "../../src/core/boardState.ts";
import { computeTouchingSides } from "../../src/core/touching.ts";

function makeInstance(
  instanceId: string,
  x: number,
  y: number,
  width = 64,
): BoardTileInstance {
  return {
    instanceId,
    tileDefinitionId: "consonant-b",
    position: { x, y },
    size: { width, height: 64 },
  };
}

describe("computeTouchingSides", () => {
  it("marks two flush, same-row tiles as touching on their shared edge", () => {
    const instances = [makeInstance("a", 0, 0), makeInstance("b", 64, 0)];

    const sides = computeTouchingSides(instances);

    expect(sides.get("a")).toEqual({ left: false, right: true });
    expect(sides.get("b")).toEqual({ left: true, right: false });
  });

  it("marks neither tile touching when there is a gap between them", () => {
    const instances = [makeInstance("a", 0, 0), makeInstance("b", 100, 0)];

    const sides = computeTouchingSides(instances);

    expect(sides.get("a")).toEqual({ left: false, right: false });
    expect(sides.get("b")).toEqual({ left: false, right: false });
  });

  it("marks the middle tile of a three-tile row as touching on both sides", () => {
    const instances = [
      makeInstance("a", 0, 0),
      makeInstance("b", 64, 0),
      makeInstance("c", 128, 0),
    ];

    const sides = computeTouchingSides(instances);

    expect(sides.get("a")).toEqual({ left: false, right: true });
    expect(sides.get("b")).toEqual({ left: true, right: true });
    expect(sides.get("c")).toEqual({ left: true, right: false });
  });

  it("does not mark tiles touching when they are stacked vertically instead of side by side", () => {
    const instances = [makeInstance("a", 0, 0), makeInstance("b", 0, 64)];

    const sides = computeTouchingSides(instances);

    expect(sides.get("a")).toEqual({ left: false, right: false });
    expect(sides.get("b")).toEqual({ left: false, right: false });
  });

  it("accounts for the dragged tile's own width when checking flushness", () => {
    const instances = [
      makeInstance("wide", 0, 0, 104),
      makeInstance("b", 104, 0),
    ];

    const sides = computeTouchingSides(instances);

    expect(sides.get("wide")).toEqual({ left: false, right: true });
    expect(sides.get("b")).toEqual({ left: true, right: false });
  });
});
