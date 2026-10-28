import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/storefront/product-gallery";
import { ProductPurchase } from "@/components/storefront/product-purchase";
import { RecentlyViewed } from "@/components/storefront/recently-viewed";
import { ProductGrid } from "@/components/storefront/product-grid";
import { getProductByHandle, getProducts } from "@/lib/data";
import { formatPrice } from "@/lib/storefront/format";
import { sampleReviews } from "@/lib/data/sample-reviews";
import { jsonLd } from "@/lib/seo/json-ld";
import { SITE_ORIGIN } from "@/lib/site";

export const revalidate = 3600;

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
  const [product, allProducts, giftProducts] = await Promise.all([
    getProductByHandle(handle), getProducts(), getProducts({ collectionHandle: "gift-set" }),
  ]);
  if (!product) notFound();
  const crossSell = giftProducts.filter((item) => item.id !== product.id).slice(0, 4);
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
      <a className="review-summary" href="#reviews"><span>★★★★★</span><span>Sample review preview</span><span>({sampleReviews.length})</span></a>
      <p className="product-detail-description">{product.description}</p>
      <ProductPurchase product={product} />
      <div className="product-accordions"><details open><summary>Details</summary><p>{product.description}</p><p>Thoughtfully selected for newborn to 12 months.</p></details><details><summary>Fabric &amp; care</summary><p>{product.fabric_care || "Please follow the care instructions on the garment label. Wash with similar colours and handle gently."}</p></details><details><summary>Shipping &amp; returns</summary><p>Nationwide delivery across Pakistan. For help with an order, please visit our <Link href="/pages/shipping-returns">shipping and returns page</Link>.</p></details></div>
    </div></section>
    {crossSell.length > 0 && <section className="section"><div className="section-head-row"><div><p className="eyebrow">a thoughtful little extra</p><h2 className="section-heading section-heading-left">Complete the gift set</h2></div><Link className="text-link" href="/collections/gift-set">Explore gifts →</Link></div><ProductGrid products={crossSell} /></section>}
    <RecentlyViewed productId={product.id} products={allProducts} />
    <section className="section product-reviews" id="reviews"><div className="section-head-row"><div><p className="eyebrow">kind words from our community</p><h2 className="section-heading section-heading-left">Customer reviews</h2></div><div className="review-rating-large">★★★★★ <span>{sampleReviews.length} sample reviews</span></div></div><p className="sample-review-note">Sample review content shown for layout preview.</p><div className="reviews-row">{sampleReviews.slice(0, 3).map((review) => <article className="review-card" key={review.name}><div className="review-stars">★★★★★</div><p>“{review.text}”</p><div className="review-person"><strong>{review.name}</strong><span>{review.city} · <span className="verified-badge">Verified</span></span></div></article>)}</div></section>
  </main>;
}
