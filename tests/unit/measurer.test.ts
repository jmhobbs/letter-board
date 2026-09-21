import { describe, expect, it } from "vitest";
import { DomElementMeasurer } from "../../src/dom/measurer.ts";

describe("DomElementMeasurer", () => {
  it("maps the element's bounding client rect to our Rect shape", () => {
    const element = document.createElement("div");
    element.getBoundingClientRect = () =>
      ({
        x: 10,
        y: 20,
        width: 30,
        height: 40,
        top: 20,
        left: 10,
        right: 40,
        bottom: 60,
        toJSON: () => ({}),
      }) as DOMRect;

    const measurer = new DomElementMeasurer();

    expect(measurer.measure(element)).toEqual({
      x: 10,
      y: 20,
      width: 30,
      height: 40,
    });
  });
});
