import type { ProductFilters } from "@/lib/data";

export type SearchValues = Record<string, string | string[] | undefined>;
export const SIZES = ["0-3 Months", "3-6 Months", "6-9 Months", "9-12 Months", "12-18 Months"];
const GENDERS = ["Boys", "Girls", "Unisex"] as const;
const SEASONS = ["Winter", "Summer", "All Seasons"] as const;
export const SORTS = [["featured", "Featured"], ["newest", "Newest"], ["price-ascending", "Price, low to high"], ["price-descending", "Price, high to low"]] as const;

const pick = <T extends string>(value: string | string[] | undefined, allowed: readonly T[]) => typeof value === "string" && (allowed as readonly string[]).includes(value) ? value as T : undefined;

/** Reads only known values from the URL; anything else is ignored. */
export function readFilters(params: SearchValues): ProductFilters {
  const size = pick(params.size, SIZES), gender = pick(params.gender, GENDERS), season = pick(params.season, SEASONS), sort = pick(params.sort, SORTS.map(([key]) => key));
  return { ...(size ? { size } : {}), ...(gender ? { gender } : {}), ...(season ? { season } : {}), ...(sort ? { sort } : {}) };
}
