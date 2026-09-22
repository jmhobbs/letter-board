import type { Point, Rect, Size } from "./geometry.ts";

export type SnapEdge = "left" | "right";

export interface SnapCandidateTile {
  instanceId: string;
  rect: Rect;
}

export interface SnapMatch {
  instanceId: string;
  edge: SnapEdge;
}

export interface SnapResult {
  position: Point;
  snappedTo: SnapMatch | null;
}

export interface SnapOptions {
  snapThresholdPx: number;
}

interface Candidate {
  position: Point;
  match: SnapMatch;
  distance: number;
}

function distanceBetween(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function candidatesForNeighbor(
  draggedSize: Size,
  dropPosition: Point,
  neighbor: SnapCandidateTile,
): Candidate[] {
  const { rect } = neighbor;

  const flushPositions: Array<{ position: Point; edge: SnapEdge }> = [
    { position: { x: rect.x + rect.width, y: rect.y }, edge: "left" },
    { position: { x: rect.x - draggedSize.width, y: rect.y }, edge: "right" },
  ];

  return flushPositions.map(({ position, edge }) => ({
    position,
    match: { instanceId: neighbor.instanceId, edge },
    distance: distanceBetween(dropPosition, position),
  }));
}

export function computeSnapPosition(
  draggedSize: Size,
  dropPosition: Point,
  otherTiles: SnapCandidateTile[],
  options: SnapOptions,
): SnapResult {
  const candidates = otherTiles.flatMap((neighbor) =>
    candidatesForNeighbor(draggedSize, dropPosition, neighbor),
  );

  let best: Candidate | null = null;
  for (const candidate of candidates) {
    const withinThreshold = candidate.distance <= options.snapThresholdPx;
    const isBetterThanCurrentBest =
      best === null || candidate.distance < best.distance;
    if (withinThreshold && isBetterThanCurrentBest) {
      best = candidate;
    }
  }

  if (best === null) {
    return { position: dropPosition, snappedTo: null };
  }

  return { position: best.position, snappedTo: best.match };
}
