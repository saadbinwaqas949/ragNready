"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { shortSize } from "@/lib/storefront/product";

type Props = { basePath: string; current: Record<string, string | undefined>; sizes: string[]; genders: string[]; sorts: readonly (readonly [string, string])[] };

export function CollectionToolbar({ basePath, current, sizes, genders, sorts }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  function set(key: string, value: string | undefined) {
    const query = new URLSearchParams();
    for (const [name, existing] of Object.entries({ ...current, [key]: value })) if (existing && !(name === "sort" && existing === "featured")) query.set(name, existing);
    start(() => router.push(`${basePath}${query.size ? `?${query}` : ""}`, { scroll: false }));
  }
  const chip = (key: string, value: string, label: string) => {
    const active = current[key] === value;
    return <button key={value} type="button" className="pill" aria-pressed={active} aria-label={key === "size" ? value : undefined} onClick={() => set(key, active ? undefined : value)}>{label}</button>;
  };
  return <div className="toolbar" data-pending={pending || undefined}>
    <div className="toolbar-filters">
      {sizes.length > 1 && <div className="pill-row" role="group" aria-label="Filter by size">{sizes.map((size) => chip("size", size, shortSize(size)))}</div>}
      {genders.length > 1 && <div className="pill-row" role="group" aria-label="Filter by who it is for">{genders.map((gender) => chip("gender", gender, gender))}</div>}
    </div>
    <label className="sort-select"><span className="sr-only">Sort products</span><select value={current.sort ?? "featured"} onChange={(event) => set("sort", event.target.value)}>{sorts.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
  </div>;
}
