import {
  addTileToBoard,
  type BoardTileInstance,
  moveTileOnBoard,
  removeTileFromBoard,
} from "../core/boardState.ts";
import type { Point } from "../core/geometry.ts";

export type BoardStateListener = (instances: BoardTileInstance[]) => void;

export interface BoardStateStore {
  getInstances(): BoardTileInstance[];
  addTile(instance: BoardTileInstance): void;
  removeTile(instanceId: string): void;
  moveTile(instanceId: string, position: Point): void;
  subscribe(listener: BoardStateListener): () => void;
}

export function createBoardStateStore(
  initial: BoardTileInstance[] = [],
): BoardStateStore {
  let instances = initial;
  const listeners = new Set<BoardStateListener>();

  function notify(): void {
    for (const listener of listeners) {
      listener(instances);
    }
  }

  return {
    getInstances: () => instances,
    addTile: (instance) => {
      instances = addTileToBoard(instances, instance);
      notify();
    },
    removeTile: (instanceId) => {
      instances = removeTileFromBoard(instances, instanceId);
      notify();
    },
    moveTile: (instanceId, position) => {
      instances = moveTileOnBoard(instances, instanceId, position);
      notify();
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
