import { describe, expect, it } from "vitest";
import { computeTileSize } from "../../src/core/tileSizing.ts";

describe("computeTileSize", () => {
  it("gives a single-letter tile the base width and height", () => {
    const size = computeTileSize({
      id: "consonant-b",
      categoryId: "consonant",
      glyph: "b",
    });
    expect(size).toEqual({ width: 64, height: 64 });
  });

  it("gives a two-letter team tile a wider width, same height", () => {
    const size = computeTileSize({
      id: "consonant-team-sh",
      categoryId: "consonant-team",
      glyph: "sh",
    });
    expect(size).toEqual({ width: 104, height: 64 });
  });

  it("sizes purely from glyph length, independent of category", () => {
    const consonantTeam = computeTileSize({
      id: "consonant-team-th",
      categoryId: "consonant-team",
      glyph: "th",
    });
    const vowelTeam = computeTileSize({
      id: "vowel-team-ea",
      categoryId: "vowel-team",
      glyph: "ea",
    });
    expect(consonantTeam).toEqual(vowelTeam);
  });
});
