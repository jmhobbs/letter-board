import { findCategory, findTileDefinition } from "../config/lookup.ts";
import type { TileSetConfig } from "../config/types.ts";
import type { BoardTileInstance } from "../core/boardState.ts";

export function renderBoard(
  boardElement: HTMLElement,
  instances: BoardTileInstance[],
  config: TileSetConfig,
): void {
  boardElement.innerHTML = "";

  for (const instance of instances) {
    const tile = findTileDefinition(config, instance.tileDefinitionId);
    const category = findCategory(config, tile.categoryId);

    const tileElement = document.createElement("div");
    tileElement.className = "board-tile";
    tileElement.dataset.instanceId = instance.instanceId;
    tileElement.textContent = tile.glyph;
    tileElement.style.backgroundColor = category.color;
    tileElement.style.position = "absolute";
    tileElement.style.left = `${instance.position.x}px`;
    tileElement.style.top = `${instance.position.y}px`;
    tileElement.style.width = `${instance.size.width}px`;
    tileElement.style.height = `${instance.size.height}px`;

    boardElement.appendChild(tileElement);
  }
}
