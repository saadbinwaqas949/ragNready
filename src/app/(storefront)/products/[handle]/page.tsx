import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/storefront/product-gallery";
import { ProductPurchase } from "@/components/storefront/product-purchase";
import { RecentlyViewed } from "@/components/storefront/recently-viewed";
import { ProductGrid } from "@/components/storefront/product-grid";
import { getProductByHandle, getProducts } from "@/lib/data";
import { formatPrice } from "@/lib/storefront/format";
import { getApprovedProductReviews } from "@/lib/data/reviews";
import { SHOW_REVIEWS } from "@/lib/site-config";
import { jsonLd } from "@/lib/seo/json-ld";
import { SITE_ORIGIN } from "@/lib/site";

export const revalidate = 3600;
const ProductReviews = dynamic(() => import("@/components/storefront/product-reviews").then((module) => module.ProductReviews));

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({ handle: product.handle }));
}

type PageProps = { params: Promise<{ handle: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProductByHandle(handle);
  if (!product) return { title: "Product not found" };
  const description = product.description.slice(0, 160);
  return { title: product.title, description, alternates: { canonical: `/products/${product.handle}` }, openGraph: { title: product.title, description, type: "website", images: product.images[0] ? [product.images[0].url] : [] } };
}

export default async function ProductPage({ params }: PageProps) {
  const { handle } = await params;
  const product = await getProductByHandle(handle);
  if (!product) notFound();
  const [allProducts, newestProducts, collectionProducts, reviews] = await Promise.all([
    getProducts(),
    getProducts({ sort: "newest" }),
    Promise.all(product.collection_handles.map((collectionHandle) => getProducts({ collectionHandle, sort: "newest" }))),
    SHOW_REVIEWS ? getApprovedProductReviews(product.id) : Promise.resolve([]),
  ]);
  const seen = new Set([product.id]);
  const recommendations = [
    ...collectionProducts.flat().sort((a, b) => b.created_at.localeCompare(a.created_at)),
    ...newestProducts,
  ].filter((candidate) => {
    if (seen.has(candidate.id)) return false;
    seen.add(candidate.id);
    return true;
  }).slice(0, 4);
  const productSchema = {
    "@context": "https://schema.org", "@type": "Product", name: product.title,
    description: product.description,
    image: product.images.map((image) => new URL(image.url, SITE_ORIGIN).toString()),
    sku: product.variants.find((variant) => variant.sku)?.sku,
    brand: { "@type": "Brand", name: "ragNready" },
    offers: { "@type": "Offer", url: new URL(`/products/${product.handle}`, SITE_ORIGIN).toString(), priceCurrency: "PKR", price: Number(product.price).toFixed(2), availability: product.is_sold_out ? "https://schema.org/OutOfStock" : "https://schema.org/InStock", itemCondition: "https://schema.org/NewCondition" },
  };
  return <main className="product-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(productSchema) }} />
    <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/collections/all">Shop</Link><span>/</span><span aria-current="page">{product.title}</span></nav>
    <section className="product-detail-layout"><ProductGallery title={product.title} images={product.images} /><div className="product-detail-copy">
      <div className="product-detail-labels">{product.compare_at_price && product.compare_at_price > product.price && <span className="product-badge product-badge-sale">Sale</span>}{product.is_sold_out && <span className="product-badge product-badge-sold">Sold out</span>}</div>
      <h1>{product.title}</h1><div className="product-detail-price">{formatPrice(Number(product.price))}{product.compare_at_price && product.compare_at_price > product.price && <s>{formatPrice(Number(product.compare_at_price))}</s>}</div>
      <p className="product-detail-description">{product.description}</p>
      <ProductPurchase product={product} />
      <div className="product-accordions"><details open><summary>Details</summary><p>{product.description}</p><p>Thoughtfully selected for newborn to 12 months.</p></details><details><summary>Fabric &amp; care</summary><p>{product.fabric_care || "Please follow the care instructions on the garment label. Wash with similar colours and handle gently."}</p></details><details><summary>Shipping &amp; returns</summary><p>Nationwide delivery across Pakistan. For help with an order, please visit our <Link href="/pages/shipping-returns">shipping and returns page</Link>.</p></details></div>
    </div></section>
    {SHOW_REVIEWS && <ProductReviews productId={product.id} reviews={reviews} />}
    {recommendations.length > 0 && <section className="section"><div className="section-head-row"><div><p className="eyebrow">thoughtfully chosen for you</p><h2 className="section-heading section-heading-left">You may also like</h2></div></div><ProductGrid products={recommendations} /></section>}
    <RecentlyViewed productId={product.id} products={allProducts} />
  </main>;
}
