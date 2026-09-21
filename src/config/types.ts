export type CategoryId = string;

export interface TileCategoryDefinition {
  id: CategoryId;
  label: string;
  color: string;
}

export interface TileDefinition {
  id: string;
  categoryId: CategoryId;
  glyph: string;
}

export interface TileSetConfig {
  categories: TileCategoryDefinition[];
  tiles: TileDefinition[];
}
