import { describe, expect, it } from "vitest";
import type { TileSetConfig } from "../../src/config/types.ts";
import type { Rect } from "../../src/core/geometry.ts";
import type { ElementMeasurer } from "../../src/dom/measurer.ts";
import { isOverTray } from "../../src/dom/trayDropTarget.ts";
import { renderTray } from "../../src/dom/trayRenderer.ts";

const config: TileSetConfig = {
  categories: [{ id: "consonant", label: "Consonant", color: "#1d4ed8" }],
  tiles: [{ id: "consonant-b", categoryId: "consonant", glyph: "b" }],
};

function makeFakeMeasurer(rects: Map<HTMLElement, Rect>): ElementMeasurer {
  return {
    measure: (element) => {
      const rect = rects.get(element);
      if (!rect) {
        throw new Error("no fake rect registered for element");
      }
      return rect;
    },
  };
}

describe("isOverTray", () => {
  it("is true for a point inside the expanded panel", () => {
    const tray = renderTray(config);
    const measurer = makeFakeMeasurer(
      new Map([[tray.panelElement, { x: 0, y: 0, width: 200, height: 400 }]]),
    );

    expect(isOverTray({ x: 100, y: 100 }, tray, measurer)).toBe(true);
  });

  it("is false for a point outside the expanded panel", () => {
    const tray = renderTray(config);
    const measurer = makeFakeMeasurer(
      new Map([[tray.panelElement, { x: 0, y: 0, width: 200, height: 400 }]]),
    );

    expect(isOverTray({ x: 500, y: 500 }, tray, measurer)).toBe(false);
  });

  it("checks the collapsed handle, not the panel, once collapsed", () => {
    const tray = renderTray(config);
    tray.collapse();
    const measurer = makeFakeMeasurer(
      new Map([
        [tray.panelElement, { x: 0, y: 0, width: 200, height: 400 }],
        [
          tray.collapsedHandleElement,
          { x: 900, y: 900, width: 40, height: 40 },
        ],
      ]),
    );

    expect(isOverTray({ x: 100, y: 100 }, tray, measurer)).toBe(false);
    expect(isOverTray({ x: 910, y: 910 }, tray, measurer)).toBe(true);
  });
});
