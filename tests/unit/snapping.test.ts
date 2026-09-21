import { describe, expect, it } from "vitest";
import { computeSnapPosition } from "../../src/core/snapping.ts";

describe("computeSnapPosition", () => {
  it("returns the raw drop position when there are no neighbor tiles", () => {
    const result = computeSnapPosition(
      { width: 64, height: 64 },
      { x: 50, y: 50 },
      [],
      { snapThresholdPx: 20 },
    );

    expect(result).toEqual({ position: { x: 50, y: 50 }, snappedTo: null });
  });

  it("snaps flush against a single neighbor within the threshold", () => {
    const result = computeSnapPosition(
      { width: 64, height: 64 },
      { x: 166, y: 105 },
      [{ instanceId: "n2", rect: { x: 100, y: 100, width: 64, height: 64 } }],
      { snapThresholdPx: 20 },
    );

    expect(result).toEqual({
      position: { x: 164, y: 100 },
      snappedTo: { instanceId: "n2", edge: "left" },
    });
  });

  it("does not snap when the nearest neighbor edge is beyond the threshold", () => {
    const result = computeSnapPosition(
      { width: 64, height: 64 },
      { x: 400, y: 400 },
      [{ instanceId: "n2", rect: { x: 100, y: 100, width: 64, height: 64 } }],
      { snapThresholdPx: 20 },
    );

    expect(result).toEqual({ position: { x: 400, y: 400 }, snappedTo: null });
  });

  it("picks the nearer of two candidate neighbors", () => {
    const result = computeSnapPosition(
      { width: 64, height: 64 },
      { x: 50, y: 5 },
      [
        { instanceId: "a", rect: { x: 0, y: 0, width: 64, height: 64 } },
        { instanceId: "b", rect: { x: 80, y: 0, width: 64, height: 64 } },
      ],
      { snapThresholdPx: 40 },
    );

    expect(result).toEqual({
      position: { x: 64, y: 0 },
      snappedTo: { instanceId: "a", edge: "left" },
    });
  });

  it("snaps a wider dragged tile using its own width, not a fixed width", () => {
    const result = computeSnapPosition(
      { width: 104, height: 64 },
      { x: 98, y: 102 },
      [{ instanceId: "n", rect: { x: 200, y: 100, width: 64, height: 64 } }],
      { snapThresholdPx: 20 },
    );

    expect(result).toEqual({
      position: { x: 96, y: 100 },
      snappedTo: { instanceId: "n", edge: "right" },
    });
  });
});
