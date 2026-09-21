import "./styles/main.css";
import { V1_TILE_SET } from "./config/tileSet.ts";
import type { TileSetConfig } from "./config/types.ts";
import { renderBoard } from "./dom/boardRenderer.ts";
import { createBoardStateStore } from "./dom/boardStateStore.ts";
import { attachDragController } from "./dom/dragController.ts";
import { DomElementMeasurer } from "./dom/measurer.ts";
import { renderTray } from "./dom/trayRenderer.ts";

const SNAP_THRESHOLD_PX = 24;

export function bootstrap(
  appElement: HTMLElement,
  config: TileSetConfig,
): void {
  const boardElement = document.createElement("div");
  boardElement.className = "board";

  const tray = renderTray(config);
  tray.toggleButton.addEventListener("click", () => {
    tray.collapse();
  });
  tray.collapsedHandleElement.addEventListener("click", () => {
    tray.expand();
  });

  appElement.appendChild(boardElement);
  appElement.appendChild(tray.element);

  const store = createBoardStateStore();
  store.subscribe((instances) => {
    renderBoard(boardElement, instances, config);
  });

  attachDragController({
    measurer: new DomElementMeasurer(),
    store,
    tray,
    boardElement,
    config,
    snapThresholdPx: SNAP_THRESHOLD_PX,
    generateInstanceId: () => crypto.randomUUID(),
  });
}

const app = document.querySelector<HTMLDivElement>("#app");
if (app) {
  bootstrap(app, V1_TILE_SET);
}
