import type { BoardTileInstance } from "./boardState.ts";

export interface TouchingSides {
  left: boolean;
  right: boolean;
}

const TOUCH_EPSILON_PX = 1;

function markTouching(
  sides: Map<string, TouchingSides>,
  instanceId: string,
  side: keyof TouchingSides,
): void {
  const current = sides.get(instanceId);
  if (current) {
    current[side] = true;
  }
}

export function computeTouchingSides(
  instances: BoardTileInstance[],
): Map<string, TouchingSides> {
  const sides = new Map<string, TouchingSides>();
  for (const instance of instances) {
    sides.set(instance.instanceId, { left: false, right: false });
  }

  for (const a of instances) {
    for (const b of instances) {
      if (a.instanceId === b.instanceId) {
        continue;
      }

      const sameRow = Math.abs(a.position.y - b.position.y) <= TOUCH_EPSILON_PX;
      if (!sameRow) {
        continue;
      }

      const aRightEdge = a.position.x + a.size.width;
      if (Math.abs(aRightEdge - b.position.x) <= TOUCH_EPSILON_PX) {
        markTouching(sides, a.instanceId, "right");
        markTouching(sides, b.instanceId, "left");
      }
    }
  }

  return sides;
}
