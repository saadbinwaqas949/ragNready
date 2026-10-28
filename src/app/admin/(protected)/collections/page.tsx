import { CollectionManager } from "@/components/admin/collection-manager";
import { getAdminCollections } from "@/lib/data/admin";

export default async function CollectionsPage() {
  const collections = await getAdminCollections();
  return <><div className="admin-page-heading"><div><h1>Collections</h1><p>Organize products into the groups shoppers browse.</p></div></div><CollectionManager collections={collections} /></>;
}
