import { describe, expect, it } from "vitest";
import type { TileSetConfig } from "../../src/config/types.ts";
import { renderTray } from "../../src/dom/trayRenderer.ts";

const config: TileSetConfig = {
  categories: [
    { id: "consonant", label: "Consonant", color: "#1d4ed8" },
    { id: "vowel", label: "Vowel", color: "#b91c1c" },
  ],
  tiles: [
    { id: "consonant-b", categoryId: "consonant", glyph: "b" },
    { id: "consonant-c", categoryId: "consonant", glyph: "c" },
    { id: "vowel-a", categoryId: "vowel", glyph: "a" },
  ],
};

describe("renderTray", () => {
  it("renders one group per category, in category order", () => {
    const tray = renderTray(config);

    const groups = tray.element.querySelectorAll("[data-category-id]");
    expect(groups).toHaveLength(2);
    expect(groups[0]?.getAttribute("data-category-id")).toBe("consonant");
    expect(groups[1]?.getAttribute("data-category-id")).toBe("vowel");
  });

  it("renders one tile per configured tile, with its glyph and category color", () => {
    const tray = renderTray(config);

    const tiles = tray.element.querySelectorAll<HTMLElement>(".tray-tile");
    expect(tiles).toHaveLength(3);

    const consonantB = tray.element.querySelector<HTMLElement>(
      '[data-tile-id="consonant-b"]',
    );
    expect(consonantB?.textContent).toBe("b");
    expect(consonantB?.style.backgroundColor).toBe("rgb(29, 78, 216)");
    expect(consonantB?.style.width).toBe("64px");
    expect(consonantB?.style.height).toBe("64px");

    const vowelA = tray.element.querySelector<HTMLElement>(
      '[data-tile-id="vowel-a"]',
    );
    expect(vowelA?.textContent).toBe("a");
    expect(vowelA?.style.backgroundColor).toBe("rgb(185, 28, 28)");
  });

  it("always keeps the collapsed handle present in the DOM", () => {
    const tray = renderTray(config);

    expect(tray.element.contains(tray.collapsedHandleElement)).toBe(true);

    tray.expand();
    expect(tray.element.contains(tray.collapsedHandleElement)).toBe(true);

    tray.collapse();
    expect(tray.element.contains(tray.collapsedHandleElement)).toBe(true);
  });

  it("starts expanded: panel not collapsed, close tab visible, open tab hidden", () => {
    const tray = renderTray(config);

    expect(tray.isCollapsed()).toBe(false);
    expect(tray.panelElement.classList.contains("tray-panel--collapsed")).toBe(
      false,
    );
    expect(tray.toggleButton.hidden).toBe(false);
    expect(tray.collapsedHandleElement.hidden).toBe(true);
  });

  it("collapse() marks the panel collapsed and hides the close tab, revealing the open tab", () => {
    const tray = renderTray(config);

    tray.collapse();

    expect(tray.isCollapsed()).toBe(true);
    expect(tray.panelElement.classList.contains("tray-panel--collapsed")).toBe(
      true,
    );
    expect(tray.toggleButton.hidden).toBe(true);
    expect(tray.collapsedHandleElement.hidden).toBe(false);
  });

  it("expand() reverses collapse()", () => {
    const tray = renderTray(config);

    tray.collapse();
    tray.expand();

    expect(tray.isCollapsed()).toBe(false);
    expect(tray.panelElement.classList.contains("tray-panel--collapsed")).toBe(
      false,
    );
    expect(tray.toggleButton.hidden).toBe(false);
    expect(tray.collapsedHandleElement.hidden).toBe(true);
  });

  it("marks the tray itself collapsed too, so its border/background can be hidden and only the tab shows", () => {
    const tray = renderTray(config);

    expect(tray.element.classList.contains("tray--collapsed")).toBe(false);

    tray.collapse();
    expect(tray.element.classList.contains("tray--collapsed")).toBe(true);

    tray.expand();
    expect(tray.element.classList.contains("tray--collapsed")).toBe(false);
  });

  it("keeps the panel out of the DOM's hidden flow — it stays present so it can animate", () => {
    const tray = renderTray(config);

    tray.collapse();

    expect(tray.panelElement.hidden).toBe(false);
    expect(tray.element.contains(tray.panelElement)).toBe(true);
  });

  it("labels the close tab with x and the open tab with +", () => {
    const tray = renderTray(config);

    expect(tray.toggleButton.textContent).toBe("x");
    expect(tray.collapsedHandleElement.textContent).toBe("+");
  });

  it("keeps the toggle tab outside the scrollable panel", () => {
    const tray = renderTray(config);

    expect(tray.panelElement.contains(tray.toggleButton)).toBe(false);
    expect(tray.element.contains(tray.toggleButton)).toBe(true);
  });
});
