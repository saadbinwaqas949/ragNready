"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { useShopStore } from "@/lib/storefront/store";

export function MotionRuntime() {
  const reduced = useReducedMotion();
  const setHasHydrated = useShopStore((state) => state.setHasHydrated);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = useShopStore.persist.onFinishHydration(() => setHasHydrated(true));
    if (useShopStore.persist.hasHydrated()) setHasHydrated(true);
    else void useShopStore.persist.rehydrate();
    return unsubscribe;
  }, [setHasHydrated]);

  useEffect(() => {
    let frame = 0;
    const updateProgress = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
      const range = document.documentElement.scrollHeight - window.innerHeight;
        if (progressRef.current) progressRef.current.style.transform = `scaleX(${range > 0 ? window.scrollY / range : 0})`;
      });
    };
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    return () => { window.removeEventListener("scroll", updateProgress); window.removeEventListener("resize", updateProgress); if (frame) window.cancelAnimationFrame(frame); };
  }, []);

  useEffect(() => {
    if (reduced) return;
    let cancelled = false;
    let stopRuntime = () => {};
    const timer = window.setTimeout(() => {
      void (async () => {
        const { default: Lenis } = await import("lenis");
        if (cancelled) return;
        const lenis = new Lenis({ autoRaf: false, smoothWheel: true });
        let stopParallax = () => {};
        let frame = 0;
        const tick = (time: number) => { lenis.raf(time); frame = window.requestAnimationFrame(tick); };
        frame = window.requestAnimationFrame(tick);
        if (document.querySelector("[data-parallax]")) {
          const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
          if (cancelled) { window.cancelAnimationFrame(frame); lenis.destroy(); return; }
          gsap.registerPlugin(ScrollTrigger);
          lenis.on("scroll", ScrollTrigger.update);
          const parallax = gsap.utils.toArray<HTMLElement>("[data-parallax]").map((element) => gsap.to(element, {
            yPercent: Number(element.dataset.parallax ?? -8), ease: "none",
            scrollTrigger: { trigger: element, start: "top bottom", end: "bottom top", scrub: 0.6 },
          }));
          stopParallax = () => { parallax.forEach((tween) => tween.scrollTrigger?.kill()); parallax.forEach((tween) => tween.kill()); };
        }
        if (cancelled) { window.cancelAnimationFrame(frame); stopParallax(); lenis.destroy(); return; }
        stopRuntime = () => { window.cancelAnimationFrame(frame); stopParallax(); lenis.destroy(); };
      })();
    }, 1200);
    return () => { cancelled = true; window.clearTimeout(timer); stopRuntime(); };
  }, [reduced]);

  return <div ref={progressRef} className="scroll-progress" aria-hidden="true" style={{ transform: "scaleX(0)" }} />;
}
