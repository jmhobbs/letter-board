import type {
  TileCategoryDefinition,
  TileDefinition,
  TileSetConfig,
} from "./types.ts";

export function findTileDefinition(
  config: TileSetConfig,
  tileDefinitionId: string,
): TileDefinition {
  const tile = config.tiles.find(
    (candidate) => candidate.id === tileDefinitionId,
  );
  if (!tile) {
    throw new Error(`Unknown tile definition id: ${tileDefinitionId}`);
  }
  return tile;
}

export function findCategory(
  config: TileSetConfig,
  categoryId: string,
): TileCategoryDefinition {
  const category = config.categories.find(
    (candidate) => candidate.id === categoryId,
  );
  if (!category) {
    throw new Error(`Unknown category id: ${categoryId}`);
  }
  return category;
}
