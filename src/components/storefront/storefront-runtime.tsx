"use client";

import { useEffect } from "react";
import { useShopStore } from "@/lib/storefront/store";

const hasSessionCookie = () => /(?:^|;\s*)sb-[^=]*-auth-token/.test(document.cookie);

/** Restores the saved cart and wishlist, and keeps a signed-in customer's wishlist in sync. */
export function StorefrontRuntime() {
  useEffect(() => {
    const { setHasHydrated } = useShopStore.getState();
    const stop = useShopStore.persist.onFinishHydration(() => setHasHydrated(true));
    if (useShopStore.persist.hasHydrated()) setHasHydrated(true);
    else void useShopStore.persist.rehydrate();
    return stop;
  }, []);

  useEffect(() => {
    // Guests never download the auth client.
    if (!hasSessionCookie()) return;
    let cancelled = false;
    let stopSync = () => {};
    void (async () => {
      const { createSupabaseBrowserClient } = await import("@/lib/supabase/client");
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) return;
      useShopStore.getState().setSignedIn(true);

      const { data, error } = await supabase.from("wishlists").select("product_id");
      if (error || cancelled) return;
      const saved = (data ?? []).map((row) => row.product_id as string);
      // Only the first sync after signing in merges; later visits trust the account, so removals stick.
      const mergedKey = `ragnready-wishlist-${user.id}`;
      const local = useShopStore.getState().wishlist;
      const next = window.localStorage.getItem(mergedKey) ? saved : [...new Set([...saved, ...local])];
      window.localStorage.setItem(mergedKey, "1");
      useShopStore.getState().setWishlist(next);
      const add = (ids: string[]) => ids.length ? supabase.from("wishlists").upsert(ids.map((product_id) => ({ user_id: user.id, product_id })), { onConflict: "user_id,product_id", ignoreDuplicates: true }).then(() => undefined) : undefined;
      // One row per call: a wishlisted product that no longer exists must not block the others.
      for (const id of next.filter((item) => !saved.includes(item))) await add([id]);
      if (cancelled) return;

      let previous = next;
      stopSync = useShopStore.subscribe((state) => {
        if (state.wishlist === previous) return;
        const added = state.wishlist.filter((id) => !previous.includes(id));
        const removed = previous.filter((id) => !state.wishlist.includes(id));
        previous = state.wishlist;
        void add(added);
        if (removed.length) void supabase.from("wishlists").delete().eq("user_id", user.id).in("product_id", removed).then(() => undefined);
      });
    })();
    return () => { cancelled = true; stopSync(); };
  }, []);

  return null;
}
