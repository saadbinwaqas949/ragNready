"use client";

import { useCallback, useEffect } from "react";
import { useShopStore, type CartCheckLine } from "@/lib/storefront/store";
import type { DeliveryRates } from "@/lib/storefront/format";

/** Refreshes saved cart lines with live price and stock whenever a cart view opens. */
export function useCartCheck(active: boolean) {
  const hasHydrated = useShopStore((state) => state.hasHydrated);
  const lineKeys = useShopStore((state) => state.cart.map((line) => line.key).join("|"));

  const check = useCallback(async () => {
    const { cart, applyCartCheck } = useShopStore.getState();
    if (!cart.length) return;
    try {
      const response = await fetch("/api/cart", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: cart.map(({ key, productId, size }) => ({ key, productId, size })) }) });
      if (!response.ok) return;
      const data = await response.json() as { lines: CartCheckLine[]; delivery: DeliveryRates };
      applyCartCheck(data.lines, data.delivery);
    } catch { /* The server checks price and stock again when the order is placed. */ }
  }, []);

  useEffect(() => { if (active && hasHydrated && lineKeys) void check(); }, [active, hasHydrated, lineKeys, check]);
  return check;
}
