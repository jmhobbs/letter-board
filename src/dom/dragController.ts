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

export function computeDragVisualOpacity(
  clientPoint: Point,
  tray: Tray,
  measurer: ElementMeasurer,
): string {
  return isOverTray(clientPoint, tray, measurer) ? "0.75" : "";
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
  const hiddenOriginals = new Map<number, HTMLElement>();

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

    const clientPoint: Point = { x: event.clientX, y: event.clientY };
    visual.style.left = `${clientPoint.x - session.grabOffset.x}px`;
    visual.style.top = `${clientPoint.y - session.grabOffset.y}px`;
    visual.style.opacity = computeDragVisualOpacity(
      clientPoint,
      deps.tray,
      deps.measurer,
    );
  }

  function endSession(pointerId: number): void {
    sessions.delete(pointerId);
    visuals.get(pointerId)?.remove();
    visuals.delete(pointerId);
    const original = hiddenOriginals.get(pointerId);
    if (original) {
      original.style.visibility = "";
      hiddenOriginals.delete(pointerId);
    }
  }

  function onPointerUp(event: PointerEvent): void {
    const session = sessions.get(event.pointerId);
    if (!session) {
      return;
    }
    endSession(event.pointerId);
    resolveDrop(deps, session, { x: event.clientX, y: event.clientY });
  }

  function onPointerCancel(event: PointerEvent): void {
    if (!sessions.has(event.pointerId)) {
      return;
    }
    endSession(event.pointerId);
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
    const ghost = createGhostElement(deps, instance.tileDefinitionId);
    ghost.style.left = `${rect.x}px`;
    ghost.style.top = `${rect.y}px`;
    target.style.visibility = "hidden";
    hiddenOriginals.set(event.pointerId, target);
    startSession(
      event.pointerId,
      target,
      {
        kind: "move",
        instanceId,
        tileDefinitionId: instance.tileDefinitionId,
        grabOffset: { x: event.clientX - rect.x, y: event.clientY - rect.y },
      },
      ghost,
    );
  });

  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
  window.addEventListener("pointercancel", onPointerCancel);
}
