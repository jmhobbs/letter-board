import { describe, expect, it } from "vitest";
import type { BoardTileInstance } from "../../src/core/boardState.ts";
import {
  addTileToBoard,
  moveTileOnBoard,
  removeTileFromBoard,
} from "../../src/core/boardState.ts";

function makeInstance(instanceId: string, x = 0, y = 0): BoardTileInstance {
  return {
    instanceId,
    tileDefinitionId: "consonant-b",
    position: { x, y },
    size: { width: 64, height: 64 },
  };
}

describe("addTileToBoard", () => {
  it("appends a new tile instance to the board", () => {
    const board = [makeInstance("a")];
    const instance = makeInstance("b");

    expect(addTileToBoard(board, instance)).toEqual([
      makeInstance("a"),
      makeInstance("b"),
    ]);
  });
});

describe("removeTileFromBoard", () => {
  it("removes the tile instance with the matching id", () => {
    const board = [makeInstance("a"), makeInstance("b")];

    expect(removeTileFromBoard(board, "a")).toEqual([makeInstance("b")]);
  });

  it("is a no-op when the instance id is not on the board", () => {
    const board = [makeInstance("a")];

    expect(removeTileFromBoard(board, "does-not-exist")).toEqual(board);
  });
});

describe("moveTileOnBoard", () => {
  it("updates the position of the matching tile instance", () => {
    const board = [makeInstance("a", 0, 0)];

    expect(moveTileOnBoard(board, "a", { x: 50, y: 75 })).toEqual([
      makeInstance("a", 50, 75),
    ]);
  });

  it("is a no-op when the instance id is not on the board", () => {
    const board = [makeInstance("a", 0, 0)];

    expect(moveTileOnBoard(board, "does-not-exist", { x: 50, y: 75 })).toEqual(
      board,
    );
  });

  it("does not move any other tile instance", () => {
    const board = [makeInstance("a", 0, 0), makeInstance("b", 10, 10)];

    expect(moveTileOnBoard(board, "a", { x: 50, y: 75 })).toEqual([
      makeInstance("a", 50, 75),
      makeInstance("b", 10, 10),
    ]);
  });
});
