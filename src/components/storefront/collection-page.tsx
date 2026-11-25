import Link from "next/link";
import type { Collection, Product } from "@/lib/data/types";
import { SORTS } from "@/lib/storefront/filters";
import { CollectionToolbar } from "./collection-toolbar";
import { ProductGrid } from "./product-grid";

type Props = { collection?: Collection; products: Product[]; allProducts: Product[]; basePath: string; current: Record<string, string | undefined> };

export function CollectionPage({ collection, products, allProducts, basePath, current }: Props) {
  const sizes = [...new Set(allProducts.flatMap((product) => product.variants.filter((variant) => variant.stock > 0).map((variant) => variant.size)))].sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
  const genders = [...new Set(allProducts.map((product) => product.gender))];
  return <main className="section page-full">
    <header className="collection-head"><h1 className="page-title">{collection?.title ?? "Shop all"}</h1><p className="page-intro">{collection?.description || "Everything in the shop, from first bodysuits to gift sets."}</p></header>
    {allProducts.length > 1 && <CollectionToolbar basePath={basePath} current={current} sizes={sizes} genders={genders} sorts={SORTS} />}
    {products.length ? <ProductGrid products={products} priority /> : <div className="empty-state"><p>{allProducts.length ? "Nothing matches those filters right now." : "New pieces for this collection are on the way."}</p><Link className="button button-primary" href={allProducts.length ? basePath : "/collections/all"}>{allProducts.length ? "Clear filters" : "Shop all"}</Link></div>}
  </main>;
}
