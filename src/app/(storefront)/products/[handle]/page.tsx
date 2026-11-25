import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HandCoins, MessageCircle, Truck } from "lucide-react";
import { ProductGallery } from "@/components/storefront/product-gallery";
import { ProductPurchase } from "@/components/storefront/product-purchase";
import { RecentlyViewed } from "@/components/storefront/recently-viewed";
import { ProductGrid } from "@/components/storefront/product-grid";
import { getProductByHandle, getProducts, getSiteSettings } from "@/lib/data";
import { formatPrice } from "@/lib/storefront/format";
import { isSoldOut, salePriceFrom } from "@/lib/storefront/product";
import { whatsAppLink } from "@/lib/storefront/phone";
import { getApprovedProductReviews } from "@/lib/data/reviews";
import { SHOW_REVIEWS } from "@/lib/site-config";
import { jsonLd } from "@/lib/seo/json-ld";
import { SITE_CONTACT_FALLBACKS, SITE_ORIGIN } from "@/lib/site";

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
  const [allProducts, settings, reviews] = await Promise.all([getProducts(), getSiteSettings(), SHOW_REVIEWS ? getApprovedProductReviews(product.id) : Promise.resolve([])]);
  // Same collection first, then everything else; newest first within each, sold-out pieces last.
  const rank = (candidate: (typeof allProducts)[number]) => (isSoldOut(candidate) ? 2 : 0) + (candidate.collection_handles.some((item) => product.collection_handles.includes(item)) ? 0 : 1);
  const recommendations = allProducts.filter((candidate) => candidate.id !== product.id).sort((a, b) => rank(a) - rank(b) || b.created_at.localeCompare(a.created_at)).slice(0, 4);
  const soldOut = isSoldOut(product);
  const before = salePriceFrom(product);
  const url = new URL(`/products/${product.handle}`, SITE_ORIGIN).toString();
  const whatsappHref = whatsAppLink(settings?.whatsapp_number || SITE_CONTACT_FALLBACKS.whatsapp_number, `Hi ragNready! I have a question about "${product.title}". ${url}`);
  const freeOver = settings?.free_delivery_over, fee = Number(settings?.delivery_fee ?? 0);
  const deliveryText = fee === 0 ? "Free delivery across Pakistan" : freeOver ? `Free delivery on orders from ${formatPrice(Number(freeOver))}` : `Delivery across Pakistan, ${formatPrice(fee)}`;
  const productSchema = {
    "@context": "https://schema.org", "@type": "Product", name: product.title, description: product.description,
    image: product.images.map((image) => new URL(image.url, SITE_ORIGIN).toString()),
    sku: product.variants.find((variant) => variant.sku)?.sku,
    brand: { "@type": "Brand", name: "ragNready" },
    offers: { "@type": "Offer", url, priceCurrency: "PKR", price: Number(product.price).toFixed(2), availability: soldOut ? "https://schema.org/OutOfStock" : "https://schema.org/InStock", itemCondition: "https://schema.org/NewCondition" },
  };
  const meta = [product.gender === "Unisex" ? "For boys and girls" : `For ${product.gender.toLowerCase()}`, product.season === "All Seasons" ? "All year round" : `${product.season} wear`];
  return <main className="product-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(productSchema) }} />
    <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/collections/all">Shop</Link><span aria-hidden="true">/</span><span aria-current="page">{product.title}</span></nav>
    <section className="product-layout"><ProductGallery title={product.title} images={product.images} /><div className="product-copy">
      <h1>{product.title}</h1>
      <p className="price price-large"><span>{formatPrice(Number(product.price))}</span>{before && <><s>{formatPrice(before)}</s><span className="flag flag-sale">Save {Math.round((1 - Number(product.price) / before) * 100)}%</span></>}{soldOut && <span className="flag flag-sold">Sold out</span>}</p>
      <p className="product-meta">{meta.join(", ")}</p>
      <ProductPurchase product={product} whatsappHref={whatsappHref} />
      <ul className="product-assurance"><li><HandCoins aria-hidden="true" />Cash on delivery</li><li><Truck aria-hidden="true" />{deliveryText}</li><li><MessageCircle aria-hidden="true" />Order confirmed on WhatsApp</li></ul>
      <div className="accordions">
        {product.description && <details open><summary>Details</summary><p>{product.description}</p></details>}
        <details><summary>Fabric and care</summary><p>{product.fabric_care || "Follow the care label. Wash gently with similar colours."}</p></details>
        <details><summary>Delivery and returns</summary><p>{deliveryText}. If something is not right, read our <Link className="stitch-link is-drawn" href="/pages/shipping-returns">shipping and returns</Link> page or message us.</p></details>
      </div>
    </div></section>
    {SHOW_REVIEWS && <ProductReviews productId={product.id} reviews={reviews} />}
    {recommendations.length > 0 && <section className="section"><div className="section-head"><h2>You may also like</h2></div><ProductGrid products={recommendations} /></section>}
    <RecentlyViewed productId={product.id} products={allProducts} exclude={recommendations.map((item) => item.id)} />
  </main>;
}
