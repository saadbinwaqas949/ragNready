import Link from "next/link";
import Image from "next/image";
import { getAdminCollections, getAdminProducts } from "@/lib/data/admin";
import { ProductQuickToggles, DeleteProductButton } from "@/components/admin/product-controls";

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ q?: string; collection?: string; status?: string }> }) {
  const params = await searchParams;
  const [products, collections] = await Promise.all([getAdminProducts({ search: params.q, collection: params.collection, status: params.status }), getAdminCollections()]);
  return <>
    <div className="admin-page-heading"><div><h1>Products</h1><p>Manage your catalog, prices and stock.</p></div><Link className="admin-button admin-button-primary" href="/admin/products/new">Add product</Link></div>
    <form className="admin-toolbar" method="get">
      <input className="admin-input" name="q" placeholder="Search products" defaultValue={params.q ?? ""} aria-label="Search products" />
      <select className="admin-select" name="collection" defaultValue={params.collection ?? ""} aria-label="Filter by collection"><option value="">All collections</option>{collections.map((collection) => <option key={collection.id} value={collection.handle}>{collection.title}</option>)}</select>
      <select className="admin-select" name="status" defaultValue={params.status ?? ""} aria-label="Filter by status"><option value="">All statuses</option><option value="published">Published</option><option value="draft">Draft</option></select>
      <button className="admin-button" type="submit">Filter</button>
      {(params.q || params.collection || params.status) && <Link className="admin-button" href="/admin/products">Clear</Link>}
    </form>
    <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Product</th><th>Price</th><th>Stock</th><th>Collection</th><th>Status</th><th>Sold out</th><th>Actions</th></tr></thead><tbody>
      {products.map((product) => <tr key={product.id}>
        <td><div className="admin-product-cell"><div className="admin-thumb">{product.product_images?.[0]?.url ? <Image src={product.product_images[0].url} alt={product.product_images[0].alt || ""} width={46} height={52} /> : "Photo"}</div><div><Link className="admin-product-name" href={`/admin/products/${product.id}/edit`}>{product.title}</Link><div className="admin-product-handle">/{product.handle}</div></div></div></td>
        <td>Rs.{Number(product.price).toLocaleString("en-PK", { minimumFractionDigits: 2 })}{product.compare_at_price && <div className="admin-product-handle"><s>Rs.{Number(product.compare_at_price).toLocaleString("en-PK", { minimumFractionDigits: 2 })}</s></div>}</td>
        <td>{product.product_variants?.reduce((sum, variant) => sum + Number(variant.stock), 0) ?? 0} units</td>
        <td>{product.product_collections?.map((link) => link.collections?.title).filter(Boolean).join(", ") || "—"}</td>
        <td><span className={`admin-badge${product.status === "draft" ? " admin-badge-draft" : ""}`}>{product.status}</span></td>
        <td>{product.is_sold_out ? <span className="admin-badge admin-badge-soldout">Sold out</span> : "In stock"}</td>
        <td><div className="admin-inline-actions"><ProductQuickToggles id={product.id} status={product.status} isSoldOut={product.is_sold_out} /><Link className="admin-button" href={`/admin/products/${product.id}/edit`}>Edit</Link><DeleteProductButton id={product.id} /></div></td>
      </tr>)}
      {products.length === 0 && <tr><td className="admin-empty" colSpan={7}>No products match those filters.</td></tr>}
    </tbody></table></div>
  </>;
}
