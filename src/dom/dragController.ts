import { findCategory, findTileDefinition } from "../config/lookup.ts";
import type { TileSetConfig } from "../config/types.ts";
import type { Point } from "../core/geometry.ts";
import { computeSnapPosition } from "../core/snapping.ts";
import { computeTileSize } from "../core/tileSizing.ts";
import type { BoardStateStore } from "./boardStateStore.ts";
import type { ElementMeasurer } from "./measurer.ts";
import { isOverTray } from "./trayDropTarget.ts";
import type { Tray } from "./trayRenderer.ts";

export interface DragSession {
  pointerId: number;
  kind: "spawn" | "move";
  tileDefinitionId: string;
  instanceId?: string;
  grabOffset: Point;
}

export interface DragControllerDeps {
  measurer: ElementMeasurer;
  store: BoardStateStore;
  tray: Tray;
  boardElement: HTMLElement;
  config: TileSetConfig;
  snapThresholdPx: number;
  generateInstanceId: () => string;
}

export function resolveDrop(
  deps: DragControllerDeps,
  session: DragSession,
  clientPoint: Point,
): void {
  if (isOverTray(clientPoint, deps.tray, deps.measurer)) {
    if (session.kind === "move" && session.instanceId) {
      deps.store.removeTile(session.instanceId);
    }
    return;
  }

  const boardRect = deps.measurer.measure(deps.boardElement);
  const dropPosition: Point = {
    x: clientPoint.x - boardRect.x - session.grabOffset.x,
    y: clientPoint.y - boardRect.y - session.grabOffset.y,
  };

  const tile = findTileDefinition(deps.config, session.tileDefinitionId);
  const size = computeTileSize(tile);

  const otherInstances = deps.store
    .getInstances()
    .filter((instance) => instance.instanceId !== session.instanceId)
    .map((instance) => ({
      instanceId: instance.instanceId,
      rect: { ...instance.position, ...instance.size },
    }));

  const snapResult = computeSnapPosition(size, dropPosition, otherInstances, {
    snapThresholdPx: deps.snapThresholdPx,
  });

  if (session.kind === "move" && session.instanceId) {
    deps.store.moveTile(session.instanceId, snapResult.position);
    return;
  }

  deps.store.addTile({
    instanceId: deps.generateInstanceId(),
    tileDefinitionId: session.tileDefinitionId,
    position: snapResult.position,
    size,
  });
}

function createGhostElement(
  deps: DragControllerDeps,
  tileDefinitionId: string,
): HTMLElement {
  const tile = findTileDefinition(deps.config, tileDefinitionId);
  const category = findCategory(deps.config, tile.categoryId);
  const size = computeTileSize(tile);

  const ghost = document.createElement("div");
  ghost.className = "drag-ghost";
  ghost.textContent = tile.glyph;
  ghost.style.backgroundColor = category.color;
  ghost.style.width = `${size.width}px`;
  ghost.style.height = `${size.height}px`;
  document.body.appendChild(ghost);
  return ghost;
}

export function attachDragController(deps: DragControllerDeps): void {
  const sessions = new Map<number, DragSession>();
  const visuals = new Map<number, HTMLElement>();

  function startSession(
    pointerId: number,
    element: Element,
    session: Omit<DragSession, "pointerId">,
    visual: HTMLElement,
  ): void {
    sessions.set(pointerId, { ...session, pointerId });
    visuals.set(pointerId, visual);
    element.setPointerCapture(pointerId);
  }

  function onPointerMove(event: PointerEvent): void {
    const session = sessions.get(event.pointerId);
    const visual = visuals.get(event.pointerId);
    if (!session || !visual) {
      return;
    }

    if (session.kind === "move") {
      const boardRect = deps.measurer.measure(deps.boardElement);
      visual.style.left = `${event.clientX - boardRect.x - session.grabOffset.x}px`;
      visual.style.top = `${event.clientY - boardRect.y - session.grabOffset.y}px`;
    } else {
      visual.style.left = `${event.clientX - session.grabOffset.x}px`;
      visual.style.top = `${event.clientY - session.grabOffset.y}px`;
    }
  }

  function onPointerUp(event: PointerEvent): void {
    const session = sessions.get(event.pointerId);
    const visual = visuals.get(event.pointerId);
    if (!session) {
      return;
    }
    sessions.delete(event.pointerId);
    visuals.delete(event.pointerId);
    if (session.kind === "spawn" && visual) {
      visual.remove();
    }
    resolveDrop(deps, session, { x: event.clientX, y: event.clientY });
  }

  for (const trayTileElement of deps.tray.panelElement.querySelectorAll<HTMLElement>(
    ".tray-tile",
  )) {
    trayTileElement.addEventListener("pointerdown", (event) => {
      const tileDefinitionId = trayTileElement.dataset.tileId;
      if (!tileDefinitionId) {
        return;
      }
      const rect = deps.measurer.measure(trayTileElement);
      const ghost = createGhostElement(deps, tileDefinitionId);
      ghost.style.left = `${rect.x}px`;
      ghost.style.top = `${rect.y}px`;
      startSession(
        event.pointerId,
        trayTileElement,
        {
          kind: "spawn",
          tileDefinitionId,
          grabOffset: { x: event.clientX - rect.x, y: event.clientY - rect.y },
        },
        ghost,
      );
    });
  }

  deps.boardElement.addEventListener("pointerdown", (event) => {
    const target = (event.target as HTMLElement).closest<HTMLElement>(
      ".board-tile",
    );
    if (!target) {
      return;
    }
    const instanceId = target.dataset.instanceId;
    if (!instanceId) {
      return;
    }
    const instance = deps.store
      .getInstances()
      .find((candidate) => candidate.instanceId === instanceId);
    if (!instance) {
      return;
    }
    const rect = deps.measurer.measure(target);
    startSession(
      event.pointerId,
      target,
      {
        kind: "move",
        instanceId,
        tileDefinitionId: instance.tileDefinitionId,
        grabOffset: { x: event.clientX - rect.x, y: event.clientY - rect.y },
      },
      target,
    );
  });

  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
}
