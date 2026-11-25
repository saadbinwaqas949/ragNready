"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DeliveryRates } from "./format";

export type CartLine = {
  key: string;
  productId: string;
  handle: string;
  title: string;
  price: number;
  image: string;
  size: string | null;
  variantId: string | null;
  quantity: number;
  /** Units available when last checked; undefined until the first check. */
  stock?: number;
};

export type CartCheckLine = { key: string; stock: number; variantId: string | null; price: number | null; title: string | null; image: string | null };

const MAX_PER_LINE = 20;
const cap = (quantity: number, stock?: number) => Math.max(1, Math.min(quantity, MAX_PER_LINE, stock ?? MAX_PER_LINE));

type ShopState = {
  cart: CartLine[];
  wishlist: string[];
  recentlyViewed: string[];
  hasHydrated: boolean;
  cartOpen: boolean;
  searchOpen: boolean;
  signedIn: boolean;
  delivery: DeliveryRates | null;
  addToCart: (line: Omit<CartLine, "key">) => void;
  setQuantity: (key: string, quantity: number) => void;
  removeFromCart: (key: string) => void;
  clearCart: () => void;
  applyCartCheck: (lines: CartCheckLine[], delivery: DeliveryRates) => void;
  toggleWishlist: (productId: string) => void;
  setWishlist: (ids: string[]) => void;
  pushRecentlyViewed: (productId: string) => void;
  setHasHydrated: (value: boolean) => void;
  setCartOpen: (value: boolean) => void;
  setSearchOpen: (value: boolean) => void;
  setSignedIn: (value: boolean) => void;
};

export const useShopStore = create<ShopState>()(persist((set) => ({
  cart: [],
  wishlist: [],
  recentlyViewed: [],
  hasHydrated: false,
  cartOpen: false,
  searchOpen: false,
  signedIn: false,
  delivery: null,
  addToCart: (line) => set((state) => {
    const key = `${line.productId}:${line.size ?? "one-size"}`;
    const existing = state.cart.find((item) => item.key === key);
    return { cart: existing
      ? state.cart.map((item) => item.key === key ? { ...item, ...line, key, quantity: cap(item.quantity + line.quantity, line.stock) } : item)
      : [...state.cart, { ...line, key, quantity: cap(line.quantity, line.stock) }] };
  }),
  setQuantity: (key, quantity) => set((state) => ({ cart: quantity < 1 ? state.cart.filter((item) => item.key !== key) : state.cart.map((item) => item.key === key ? { ...item, quantity: cap(quantity, item.stock) } : item) })),
  removeFromCart: (key) => set((state) => ({ cart: state.cart.filter((item) => item.key !== key) })),
  clearCart: () => set({ cart: [] }),
  applyCartCheck: (lines, delivery) => set((state) => ({
    delivery,
    cart: state.cart.map((item) => {
      const fresh = lines.find((line) => line.key === item.key);
      if (!fresh) return item;
      return { ...item, stock: fresh.stock, variantId: fresh.variantId ?? item.variantId, price: fresh.price ?? item.price, title: fresh.title ?? item.title, image: fresh.image ?? item.image, quantity: fresh.stock > 0 ? cap(item.quantity, fresh.stock) : item.quantity };
    }),
  })),
  toggleWishlist: (productId) => set((state) => ({ wishlist: state.wishlist.includes(productId) ? state.wishlist.filter((id) => id !== productId) : [...state.wishlist, productId] })),
  setWishlist: (ids) => set({ wishlist: ids }),
  pushRecentlyViewed: (productId) => set((state) => ({ recentlyViewed: [productId, ...state.recentlyViewed.filter((id) => id !== productId)].slice(0, 12) })),
  setHasHydrated: (value) => set({ hasHydrated: value }),
  setCartOpen: (value) => set({ cartOpen: value }),
  setSearchOpen: (value) => set({ searchOpen: value }),
  setSignedIn: (value) => set({ signedIn: value }),
}), {
  name: "ragnready-shop",
  version: 2,
  // Version 1 keyed lines by size id; rebuild keys so old carts keep working.
  migrate: (saved) => {
    const state = (saved ?? {}) as Partial<ShopState>;
    return { ...state, cart: (state.cart ?? []).map((line) => ({ ...line, key: `${line.productId}:${line.size ?? "one-size"}` })) } as ShopState;
  },
  skipHydration: true,
  partialize: (state) => ({ cart: state.cart, wishlist: state.wishlist, recentlyViewed: state.recentlyViewed }),
  onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
}));

export const cartSubtotal = (cart: CartLine[]) => cart.reduce((sum, line) => line.stock === 0 ? sum : sum + line.price * line.quantity, 0);
export const cartCount = (cart: CartLine[]) => cart.reduce((sum, line) => sum + line.quantity, 0);
