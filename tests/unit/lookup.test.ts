import { describe, expect, it } from "vitest";
import { findCategory, findTileDefinition } from "../../src/config/lookup.ts";
import type { TileSetConfig } from "../../src/config/types.ts";

const config: TileSetConfig = {
  categories: [{ id: "consonant", label: "Consonant", color: "#1d4ed8" }],
  tiles: [{ id: "consonant-b", categoryId: "consonant", glyph: "b" }],
};

describe("findTileDefinition", () => {
  it("returns the matching tile definition", () => {
    expect(findTileDefinition(config, "consonant-b")).toEqual({
      id: "consonant-b",
      categoryId: "consonant",
      glyph: "b",
    });
  });

  it("throws when no tile matches the id", () => {
    expect(() => findTileDefinition(config, "does-not-exist")).toThrow();
  });
});

describe("findCategory", () => {
  it("returns the matching category definition", () => {
    expect(findCategory(config, "consonant")).toEqual({
      id: "consonant",
      label: "Consonant",
      color: "#1d4ed8",
    });
  });

  it("throws when no category matches the id", () => {
    expect(() => findCategory(config, "does-not-exist")).toThrow();
  });
});
