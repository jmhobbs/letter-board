import type { Point, Size } from "./geometry.ts";

export interface BoardTileInstance {
  instanceId: string;
  tileDefinitionId: string;
  position: Point;
  size: Size;
}

export function addTileToBoard(
  board: BoardTileInstance[],
  instance: BoardTileInstance,
): BoardTileInstance[] {
  return [...board, instance];
}

export function removeTileFromBoard(
  board: BoardTileInstance[],
  instanceId: string,
): BoardTileInstance[] {
  return board.filter((instance) => instance.instanceId !== instanceId);
}

export function moveTileOnBoard(
  board: BoardTileInstance[],
  instanceId: string,
  position: Point,
): BoardTileInstance[] {
  return board.map((instance) =>
    instance.instanceId === instanceId ? { ...instance, position } : instance,
  );
}
