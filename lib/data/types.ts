export type ProductImageInput = { url: string; alt: string; position: number };
export type VariantInput = { size: string; stock: number; sku?: string | null };

export type ProductInput = {
  id?: string;
  title: string;
  handle: string;
  description: string;
  price: number;
  compare_at_price?: number | null;
  gender: "Boys" | "Girls" | "Unisex";
  season: "Winter" | "Summer" | "All Seasons";
  status: "draft" | "published";
  is_sold_out: boolean;
  badges?: string[];
  sort_order?: number;
  fabric_care?: string;
  images: ProductImageInput[];
  variants: VariantInput[];
  collection_handles: string[];
};

export type Product = Omit<ProductInput, "images" | "variants" | "collection_handles"> & {
  id: string;
  images: ProductImageInput[];
  variants: (VariantInput & { id: string })[];
  collection_handles: string[];
  created_at: string;
  updated_at: string;
};

export type CollectionInput = {
  id?: string;
  title: string;
  handle: string;
  description: string;
  image?: string | null;
  sort_order?: number;
};

export type Collection = CollectionInput & { id: string; created_at: string; updated_at: string };

export type SiteSettings = {
  id: string;
  store_name: string;
  tagline: string;
  phone: string;
  whatsapp_number: string;
  email: string;
  address: string;
  social_links: Record<string, string>;
  legal_owner_line: string | null;
  announcement_messages: string[];
  hero_headline: string;
  hero_subtext: string;
  hero_cta_text: string;
  popup_discount_code: string;
  is_published: boolean;
  updated_at: string;
};
