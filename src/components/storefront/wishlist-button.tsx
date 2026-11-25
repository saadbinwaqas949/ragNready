"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { useShopStore } from "@/lib/storefront/store";

export function WishlistButton({ productId, title, className = "heart-button", withLabel = false }: { productId: string; title: string; className?: string; withLabel?: boolean }) {
  const saved = useShopStore((state) => state.hasHydrated && state.wishlist.includes(productId));
  const toggle = useShopStore((state) => state.toggleWishlist);
  const [burst, setBurst] = useState(0);
  return <button type="button" className={`${className}${saved ? " is-active" : ""}`} aria-pressed={saved} aria-label={withLabel ? undefined : saved ? `Remove ${title} from wishlist` : `Save ${title} to wishlist`} onClick={() => { if (!saved) setBurst((value) => value + 1); toggle(productId); }}>
    <span className="heart-icon" key={burst}><Heart aria-hidden="true" />{burst > 0 && saved && <span className="heart-burst" aria-hidden="true">{[0, 1, 2, 3, 4, 5].map((index) => <i key={index} style={{ "--angle": `${index * 60}deg` } as React.CSSProperties} />)}</span>}</span>
    {withLabel && <span>{saved ? "Saved to wishlist" : "Save to wishlist"}</span>}
  </button>;
}
