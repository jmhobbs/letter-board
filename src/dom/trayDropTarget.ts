import { isPointInRect, type Point } from "../core/geometry.ts";
import type { ElementMeasurer } from "./measurer.ts";
import type { Tray } from "./trayRenderer.ts";

export function isOverTray(
  clientPoint: Point,
  tray: Tray,
  measurer: ElementMeasurer,
): boolean {
  const targetElement = tray.isCollapsed()
    ? tray.collapsedHandleElement
    : tray.panelElement;
  return isPointInRect(clientPoint, measurer.measure(targetElement));
}
