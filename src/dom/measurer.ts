import type { Rect } from "../core/geometry.ts";

export interface ElementMeasurer {
  measure(element: HTMLElement): Rect;
}

export class DomElementMeasurer implements ElementMeasurer {
  measure(element: HTMLElement): Rect {
    const rect = element.getBoundingClientRect();
    return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
  }
}
