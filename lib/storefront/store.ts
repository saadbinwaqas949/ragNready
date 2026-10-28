"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

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
};

type ShopState = {
  cart: CartLine[];
  wishlist: string[];
  recentlyViewed: string[];
  hasHydrated: boolean;
  addToCart: (line: Omit<CartLine, "key">) => void;
  setQuantity: (key: string, quantity: number) => void;
  removeFromCart: (key: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  pushRecentlyViewed: (productId: string) => void;
  setHasHydrated: (value: boolean) => void;
};

export const useShopStore = create<ShopState>()(persist((set) => ({
  cart: [],
  wishlist: [],
  recentlyViewed: [],
  hasHydrated: false,
  addToCart: (line) => set((state) => {
    const key = `${line.productId}:${line.variantId ?? line.size ?? "one-size"}`;
    const existing = state.cart.find((item) => item.key === key);
    return { cart: existing ? state.cart.map((item) => item.key === key ? { ...item, quantity: item.quantity + line.quantity } : item) : [...state.cart, { ...line, key }] };
  }),
  setQuantity: (key, quantity) => set((state) => ({ cart: quantity < 1 ? state.cart.filter((item) => item.key !== key) : state.cart.map((item) => item.key === key ? { ...item, quantity } : item) })),
  removeFromCart: (key) => set((state) => ({ cart: state.cart.filter((item) => item.key !== key) })),
  clearCart: () => set({ cart: [] }),
  toggleWishlist: (productId) => set((state) => ({ wishlist: state.wishlist.includes(productId) ? state.wishlist.filter((id) => id !== productId) : [...state.wishlist, productId] })),
  pushRecentlyViewed: (productId) => set((state) => ({ recentlyViewed: [productId, ...state.recentlyViewed.filter((id) => id !== productId)].slice(0, 12) })),
  setHasHydrated: (value) => set({ hasHydrated: value }),
}), {
  name: "ragnready-shop",
  skipHydration: true,
  partialize: (state) => ({ cart: state.cart, wishlist: state.wishlist, recentlyViewed: state.recentlyViewed }),
  onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
}));
