import { describe, expect, it, vi } from "vitest";
import type { TileSetConfig } from "../../src/config/types.ts";
import type { BoardTileInstance } from "../../src/core/boardState.ts";
import type { Rect } from "../../src/core/geometry.ts";
import type { BoardStateStore } from "../../src/dom/boardStateStore.ts";
import { resolveDrop } from "../../src/dom/dragController.ts";
import type { ElementMeasurer } from "../../src/dom/measurer.ts";
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

function makeFakeStore(instances: BoardTileInstance[]): BoardStateStore {
  return {
    getInstances: () => instances,
    addTile: vi.fn(),
    removeTile: vi.fn(),
    moveTile: vi.fn(),
    subscribe: vi.fn(() => () => {}),
  };
}

describe("resolveDrop", () => {
  it("removes the dragged instance when a move-drag is dropped over the tray", () => {
    const tray = renderTray(config);
    const boardElement = document.createElement("div");
    const measurer = makeFakeMeasurer(
      new Map([
        [tray.panelElement, { x: 0, y: 0, width: 200, height: 400 }],
        [boardElement, { x: 0, y: 0, width: 800, height: 600 }],
      ]),
    );
    const store = makeFakeStore([]);

    resolveDrop(
      {
        measurer,
        store,
        tray,
        boardElement,
        config,
        snapThresholdPx: 20,
        generateInstanceId: () => "unused",
      },
      {
        pointerId: 1,
        kind: "move",
        instanceId: "abc",
        tileDefinitionId: "consonant-b",
        grabOffset: { x: 0, y: 0 },
      },
      { x: 100, y: 100 },
    );

    expect(store.removeTile).toHaveBeenCalledWith("abc");
    expect(store.addTile).not.toHaveBeenCalled();
    expect(store.moveTile).not.toHaveBeenCalled();
  });

  it("does nothing when a spawn-drag is dropped back over the tray", () => {
    const tray = renderTray(config);
    const boardElement = document.createElement("div");
    const measurer = makeFakeMeasurer(
      new Map([
        [tray.panelElement, { x: 0, y: 0, width: 200, height: 400 }],
        [boardElement, { x: 0, y: 0, width: 800, height: 600 }],
      ]),
    );
    const store = makeFakeStore([]);

    resolveDrop(
      {
        measurer,
        store,
        tray,
        boardElement,
        config,
        snapThresholdPx: 20,
        generateInstanceId: () => "unused",
      },
      {
        pointerId: 1,
        kind: "spawn",
        tileDefinitionId: "consonant-b",
        grabOffset: { x: 0, y: 0 },
      },
      { x: 100, y: 100 },
    );

    expect(store.removeTile).not.toHaveBeenCalled();
    expect(store.addTile).not.toHaveBeenCalled();
    expect(store.moveTile).not.toHaveBeenCalled();
  });

  it("adds a new tile instance at the board-local drop position when a spawn-drag lands on the board", () => {
    const tray = renderTray(config);
    tray.collapse();
    const boardElement = document.createElement("div");
    const measurer = makeFakeMeasurer(
      new Map<HTMLElement, Rect>([
        [
          tray.collapsedHandleElement,
          { x: 900, y: 900, width: 40, height: 40 },
        ],
        [boardElement, { x: 0, y: 0, width: 800, height: 600 }],
      ]),
    );
    const store = makeFakeStore([]);

    resolveDrop(
      {
        measurer,
        store,
        tray,
        boardElement,
        config,
        snapThresholdPx: 20,
        generateInstanceId: () => "test-id",
      },
      {
        pointerId: 1,
        kind: "spawn",
        tileDefinitionId: "consonant-b",
        grabOffset: { x: 0, y: 0 },
      },
      { x: 100, y: 120 },
    );

    expect(store.addTile).toHaveBeenCalledWith({
      instanceId: "test-id",
      tileDefinitionId: "consonant-b",
      position: { x: 100, y: 120 },
      size: { width: 64, height: 64 },
    });
  });

  it("moves the dragged instance and snaps it against the nearest neighbor, excluding itself", () => {
    const tray = renderTray(config);
    tray.collapse();
    const boardElement = document.createElement("div");
    const measurer = makeFakeMeasurer(
      new Map<HTMLElement, Rect>([
        [
          tray.collapsedHandleElement,
          { x: 900, y: 900, width: 40, height: 40 },
        ],
        [boardElement, { x: 0, y: 0, width: 800, height: 600 }],
      ]),
    );
    const store = makeFakeStore([
      {
        instanceId: "abc",
        tileDefinitionId: "consonant-b",
        position: { x: 5, y: 5 },
        size: { width: 64, height: 64 },
      },
      {
        instanceId: "neighbor1",
        tileDefinitionId: "consonant-b",
        position: { x: 150, y: 120 },
        size: { width: 64, height: 64 },
      },
    ]);

    resolveDrop(
      {
        measurer,
        store,
        tray,
        boardElement,
        config,
        snapThresholdPx: 20,
        generateInstanceId: () => "unused",
      },
      {
        pointerId: 1,
        kind: "move",
        instanceId: "abc",
        tileDefinitionId: "consonant-b",
        grabOffset: { x: 0, y: 0 },
      },
      { x: 100, y: 120 },
    );

    expect(store.moveTile).toHaveBeenCalledWith("abc", { x: 86, y: 120 });
    expect(store.addTile).not.toHaveBeenCalled();
  });
});
