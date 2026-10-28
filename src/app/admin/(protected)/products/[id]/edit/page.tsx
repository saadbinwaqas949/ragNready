import { notFound } from "next/navigation";
import { ProductEditor } from "@/components/admin/product-editor";
import { getAdminCollections, getAdminProduct } from "@/lib/data/admin";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, collections] = await Promise.all([getAdminProduct(id), getAdminCollections()]);
  if (!product) notFound();
  return <><div className="admin-page-heading"><div><h1>Edit product</h1><p>Update product details, photos and stock.</p></div></div><ProductEditor product={product} collections={collections} /></>;
}
