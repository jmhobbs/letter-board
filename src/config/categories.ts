import type { TileCategoryDefinition } from "./types.ts";

export const CONSONANT: TileCategoryDefinition = {
  id: "consonant",
  label: "Consonant",
  color: "#1d4ed8",
};

export const VOWEL: TileCategoryDefinition = {
  id: "vowel",
  label: "Vowel",
  color: "#b91c1c",
};

export const CONSONANT_TEAM: TileCategoryDefinition = {
  id: "consonant-team",
  label: "Consonant Team",
  color: "#1d4ed8",
};

export const VOWEL_TEAM: TileCategoryDefinition = {
  id: "vowel-team",
  label: "Vowel Team",
  color: "#b91c1c",
};

export const V1_CATEGORIES: TileCategoryDefinition[] = [
  CONSONANT,
  VOWEL,
  CONSONANT_TEAM,
  VOWEL_TEAM,
];
