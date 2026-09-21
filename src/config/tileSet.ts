import {
  CONSONANT,
  CONSONANT_TEAM,
  V1_CATEGORIES,
  VOWEL,
  VOWEL_TEAM,
} from "./categories.ts";
import type { TileDefinition, TileSetConfig } from "./types.ts";

const CONSONANT_GLYPHS = [
  "b",
  "c",
  "d",
  "f",
  "g",
  "h",
  "j",
  "k",
  "l",
  "m",
  "n",
  "p",
  "q",
  "r",
  "s",
  "t",
  "v",
  "w",
  "x",
  "y",
  "z",
];

const VOWEL_GLYPHS = ["a", "e", "i", "o", "u"];

const CONSONANT_TEAM_GLYPHS = ["sh", "ch", "th", "wh", "ph", "ck", "ng"];

const VOWEL_TEAM_GLYPHS = [
  "ai",
  "ay",
  "ee",
  "ea",
  "oa",
  "ow",
  "oi",
  "oy",
  "ue",
  "oo",
];

function tilesFor(categoryId: string, glyphs: string[]): TileDefinition[] {
  return glyphs.map((glyph) => ({
    id: `${categoryId}-${glyph}`,
    categoryId,
    glyph,
  }));
}

export const V1_TILE_SET: TileSetConfig = {
  categories: V1_CATEGORIES,
  tiles: [
    ...tilesFor(CONSONANT.id, CONSONANT_GLYPHS),
    ...tilesFor(VOWEL.id, VOWEL_GLYPHS),
    ...tilesFor(CONSONANT_TEAM.id, CONSONANT_TEAM_GLYPHS),
    ...tilesFor(VOWEL_TEAM.id, VOWEL_TEAM_GLYPHS),
  ],
};
