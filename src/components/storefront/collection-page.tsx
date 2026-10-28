import Image from "next/image";
import Link from "next/link";
import type { Collection, Product } from "@/lib/data/types";
import { CollectionControls } from "./collection-controls";
import { ProductGrid } from "./product-grid";

export function CollectionPage({ collection, products, values, basePath }: { collection?: Collection; products: Product[]; values: Record<string, string | undefined>; basePath: string }) {
  const image = collection?.image;
  return <main className="collection-page">
    <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/collections/all">Shop</Link>{collection && <><span>/</span><span aria-current="page">{collection.title}</span></>}</nav>
    {collection && <section className="collection-hero"><div><p className="eyebrow">thoughtfully chosen</p><h1>{collection.title}</h1><p>{collection.description}</p></div>{image && <div className="collection-hero-image"><Image src={image} alt="" fill sizes="40vw" /></div>}</section>}
    {!collection && <header className="collection-title"><p className="eyebrow">soft beginnings, thoughtfully chosen</p><h1>Shop all</h1><p>Thoughtful essentials and meaningful gifts for little ones.</p></header>}
    <div className="collection-layout"><aside className="collection-sidebar"><CollectionControls basePath={basePath} values={values} /></aside><div className="collection-results"><div className="collection-results-bar"><span>{products.length} {products.length === 1 ? "piece" : "pieces"}</span><span>{values.size || values.gender || values.season || values.availability ? "Filters applied" : "Thoughtfully selected"}</span></div><ProductGrid products={products} view={values.view === "list" ? "list" : "grid"} /></div></div>
  </main>;
}
