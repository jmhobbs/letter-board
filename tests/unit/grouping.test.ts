import { describe, expect, it } from "vitest";
import type { TileSetConfig } from "../../src/config/types.ts";
import { groupTilesByCategory } from "../../src/core/grouping.ts";

describe("groupTilesByCategory", () => {
  it("groups tiles under their configured category, in category order", () => {
    const config: TileSetConfig = {
      categories: [
        { id: "consonant", label: "Consonant", color: "blue" },
        { id: "vowel", label: "Vowel", color: "red" },
      ],
      tiles: [
        { id: "vowel-a", categoryId: "vowel", glyph: "a" },
        { id: "consonant-b", categoryId: "consonant", glyph: "b" },
        { id: "consonant-c", categoryId: "consonant", glyph: "c" },
      ],
    };

    const groups = groupTilesByCategory(config);

    expect(groups).toEqual([
      {
        category: { id: "consonant", label: "Consonant", color: "blue" },
        tiles: [
          { id: "consonant-b", categoryId: "consonant", glyph: "b" },
          { id: "consonant-c", categoryId: "consonant", glyph: "c" },
        ],
      },
      {
        category: { id: "vowel", label: "Vowel", color: "red" },
        tiles: [{ id: "vowel-a", categoryId: "vowel", glyph: "a" }],
      },
    ]);
  });

  it("supports an arbitrary category not among the shipped four, with no special-casing", () => {
    const config: TileSetConfig = {
      categories: [
        { id: "silent-e-marker", label: "Silent E Marker", color: "green" },
      ],
      tiles: [{ id: "silent-e", categoryId: "silent-e-marker", glyph: "e" }],
    };

    const groups = groupTilesByCategory(config);

    expect(groups).toEqual([
      {
        category: {
          id: "silent-e-marker",
          label: "Silent E Marker",
          color: "green",
        },
        tiles: [{ id: "silent-e", categoryId: "silent-e-marker", glyph: "e" }],
      },
    ]);
  });

  it("produces an empty tile list for a category with no matching tiles", () => {
    const config: TileSetConfig = {
      categories: [{ id: "vowel-team", label: "Vowel Team", color: "red" }],
      tiles: [],
    };

    const groups = groupTilesByCategory(config);

    expect(groups).toEqual([
      {
        category: { id: "vowel-team", label: "Vowel Team", color: "red" },
        tiles: [],
      },
    ]);
  });
});
