import { ProductEditor } from "@/components/admin/product-editor";
import { getAdminCollections } from "@/lib/data/admin";

export default async function NewProductPage() {
  const collections = await getAdminCollections();
  return <><div className="admin-page-heading"><div><h1>Add product</h1><p>Add details, photos and stock for each size.</p></div></div><ProductEditor collections={collections} /></>;
}
