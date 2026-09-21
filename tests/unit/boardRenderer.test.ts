import { describe, expect, it } from "vitest";
import type { TileSetConfig } from "../../src/config/types.ts";
import type { BoardTileInstance } from "../../src/core/boardState.ts";
import { renderBoard } from "../../src/dom/boardRenderer.ts";

const config: TileSetConfig = {
  categories: [
    { id: "consonant", label: "Consonant", color: "#1d4ed8" },
    { id: "vowel", label: "Vowel", color: "#b91c1c" },
  ],
  tiles: [
    { id: "consonant-b", categoryId: "consonant", glyph: "b" },
    { id: "vowel-a", categoryId: "vowel", glyph: "a" },
  ],
};

describe("renderBoard", () => {
  it("renders one tile element per board instance, positioned and sized from state", () => {
    const boardElement = document.createElement("div");
    const instances: BoardTileInstance[] = [
      {
        instanceId: "i1",
        tileDefinitionId: "consonant-b",
        position: { x: 40, y: 60 },
        size: { width: 64, height: 64 },
      },
    ];

    renderBoard(boardElement, instances, config);

    const tileElement = boardElement.querySelector<HTMLElement>(
      '[data-instance-id="i1"]',
    );
    expect(tileElement?.textContent).toBe("b");
    expect(tileElement?.style.backgroundColor).toBe("rgb(29, 78, 216)");
    expect(tileElement?.style.left).toBe("40px");
    expect(tileElement?.style.top).toBe("60px");
    expect(tileElement?.style.width).toBe("64px");
    expect(tileElement?.style.height).toBe("64px");
  });

  it("renders multiple instances of the same tile definition independently", () => {
    const boardElement = document.createElement("div");
    const instances: BoardTileInstance[] = [
      {
        instanceId: "i1",
        tileDefinitionId: "vowel-a",
        position: { x: 0, y: 0 },
        size: { width: 64, height: 64 },
      },
      {
        instanceId: "i2",
        tileDefinitionId: "vowel-a",
        position: { x: 100, y: 0 },
        size: { width: 64, height: 64 },
      },
    ];

    renderBoard(boardElement, instances, config);

    expect(boardElement.querySelectorAll(".board-tile")).toHaveLength(2);
  });

  it("fully replaces prior content on re-render, without duplicating tiles", () => {
    const boardElement = document.createElement("div");
    const first: BoardTileInstance[] = [
      {
        instanceId: "i1",
        tileDefinitionId: "consonant-b",
        position: { x: 0, y: 0 },
        size: { width: 64, height: 64 },
      },
    ];

    renderBoard(boardElement, first, config);
    renderBoard(boardElement, first, config);

    expect(boardElement.querySelectorAll(".board-tile")).toHaveLength(1);
  });
});
