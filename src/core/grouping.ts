import type {
  TileCategoryDefinition,
  TileDefinition,
  TileSetConfig,
} from "../config/types.ts";

export interface TileCategoryGroup {
  category: TileCategoryDefinition;
  tiles: TileDefinition[];
}

export function groupTilesByCategory(
  config: TileSetConfig,
): TileCategoryGroup[] {
  return config.categories.map((category) => ({
    category,
    tiles: config.tiles.filter((tile) => tile.categoryId === category.id),
  }));
}
