import type { TileSetConfig } from "../config/types.ts";
import { groupTilesByCategory } from "../core/grouping.ts";
import { computeTileSize } from "../core/tileSizing.ts";

export interface Tray {
  element: HTMLElement;
  panelElement: HTMLElement;
  collapsedHandleElement: HTMLElement;
  toggleButton: HTMLButtonElement;
  isCollapsed(): boolean;
  collapse(): void;
  expand(): void;
}

export function renderTray(config: TileSetConfig): Tray {
  const element = document.createElement("div");
  element.className = "tray";

  const panelElement = document.createElement("div");
  panelElement.className = "tray-panel";

  const toggleButton = document.createElement("button");
  toggleButton.type = "button";
  toggleButton.className = "tray-tab tray-toggle";
  toggleButton.textContent = "x";

  for (const group of groupTilesByCategory(config)) {
    const groupElement = document.createElement("div");
    groupElement.className = "tray-group";
    groupElement.dataset.categoryId = group.category.id;

    const labelElement = document.createElement("h3");
    labelElement.textContent = group.category.label;
    groupElement.appendChild(labelElement);

    const tilesElement = document.createElement("div");
    tilesElement.className = "tray-group-tiles";

    for (const tile of group.tiles) {
      const size = computeTileSize(tile);
      const tileElement = document.createElement("div");
      tileElement.className = "tray-tile";
      tileElement.dataset.tileId = tile.id;
      tileElement.style.backgroundColor = group.category.color;
      tileElement.style.width = `${size.width}px`;
      tileElement.style.height = `${size.height}px`;
      tileElement.textContent = tile.glyph;
      tilesElement.appendChild(tileElement);
    }

    groupElement.appendChild(tilesElement);
    panelElement.appendChild(groupElement);
  }

  const collapsedHandleElement = document.createElement("button");
  collapsedHandleElement.type = "button";
  collapsedHandleElement.className = "tray-tab tray-handle";
  collapsedHandleElement.textContent = "+";

  element.appendChild(toggleButton);
  element.appendChild(panelElement);
  element.appendChild(collapsedHandleElement);

  let collapsed = false;

  function applyVisibility(): void {
    element.classList.toggle("tray--collapsed", collapsed);
    panelElement.classList.toggle("tray-panel--collapsed", collapsed);
    toggleButton.hidden = collapsed;
    collapsedHandleElement.hidden = !collapsed;
  }

  applyVisibility();

  return {
    element,
    panelElement,
    collapsedHandleElement,
    toggleButton,
    isCollapsed: () => collapsed,
    collapse: () => {
      collapsed = true;
      applyVisibility();
    },
    expand: () => {
      collapsed = false;
      applyVisibility();
    },
  };
}
