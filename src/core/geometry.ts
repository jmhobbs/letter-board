export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Rect extends Point, Size {}

export function isPointInRect(point: Point, rect: Rect): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

export function clampRectToBounds(rect: Rect, bounds: Rect): Rect {
  const maxX = Math.max(bounds.x, bounds.x + bounds.width - rect.width);
  const maxY = Math.max(bounds.y, bounds.y + bounds.height - rect.height);

  return {
    ...rect,
    x: Math.min(Math.max(rect.x, bounds.x), maxX),
    y: Math.min(Math.max(rect.y, bounds.y), maxY),
  };
}
