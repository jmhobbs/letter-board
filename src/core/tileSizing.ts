import type { TileDefinition } from "../config/types.ts";
import type { Size } from "./geometry.ts";

const BASE_TILE_WIDTH = 64;
const TILE_HEIGHT = 64;
const EXTRA_WIDTH_PER_EXTRA_GLYPH = 40;

export function computeTileSize(tile: TileDefinition): Size {
  const extraGlyphs = tile.glyph.length - 1;
  return {
    width: BASE_TILE_WIDTH + extraGlyphs * EXTRA_WIDTH_PER_EXTRA_GLYPH,
    height: TILE_HEIGHT,
  };
}
