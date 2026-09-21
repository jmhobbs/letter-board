import { describe, expect, it, vi } from "vitest";
import type { BoardTileInstance } from "../../src/core/boardState.ts";
import { createBoardStateStore } from "../../src/dom/boardStateStore.ts";

function makeInstance(instanceId: string): BoardTileInstance {
  return {
    instanceId,
    tileDefinitionId: "consonant-b",
    position: { x: 0, y: 0 },
    size: { width: 64, height: 64 },
  };
}

describe("createBoardStateStore", () => {
  it("starts with the given initial instances", () => {
    const store = createBoardStateStore([makeInstance("a")]);
    expect(store.getInstances()).toEqual([makeInstance("a")]);
  });

  it("defaults to an empty board when no initial instances are given", () => {
    const store = createBoardStateStore();
    expect(store.getInstances()).toEqual([]);
  });

  it("addTile updates state and notifies subscribers", () => {
    const store = createBoardStateStore();
    const listener = vi.fn();
    store.subscribe(listener);

    store.addTile(makeInstance("a"));

    expect(store.getInstances()).toEqual([makeInstance("a")]);
    expect(listener).toHaveBeenCalledWith([makeInstance("a")]);
  });

  it("removeTile updates state and notifies subscribers", () => {
    const store = createBoardStateStore([makeInstance("a")]);
    const listener = vi.fn();
    store.subscribe(listener);

    store.removeTile("a");

    expect(store.getInstances()).toEqual([]);
    expect(listener).toHaveBeenCalledWith([]);
  });

  it("moveTile updates state and notifies subscribers", () => {
    const store = createBoardStateStore([makeInstance("a")]);
    const listener = vi.fn();
    store.subscribe(listener);

    store.moveTile("a", { x: 10, y: 20 });

    expect(store.getInstances()).toEqual([
      { ...makeInstance("a"), position: { x: 10, y: 20 } },
    ]);
    expect(listener).toHaveBeenCalledWith([
      { ...makeInstance("a"), position: { x: 10, y: 20 } },
    ]);
  });

  it("stops notifying after unsubscribe", () => {
    const store = createBoardStateStore();
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);

    unsubscribe();
    store.addTile(makeInstance("a"));

    expect(listener).not.toHaveBeenCalled();
  });
});
