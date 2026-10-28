"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useShopStore } from "@/lib/storefront/store";

gsap.registerPlugin(ScrollTrigger);

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
    const lenis = new Lenis({ autoRaf: false, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    const parallax = gsap.utils.toArray<HTMLElement>("[data-parallax]").map((element) => gsap.to(element, {
      yPercent: Number(element.dataset.parallax ?? -8), ease: "none",
      scrollTrigger: { trigger: element, start: "top bottom", end: "bottom top", scrub: 0.6 },
    }));
    return () => { gsap.ticker.remove(tick); parallax.forEach((tween) => tween.scrollTrigger?.kill()); parallax.forEach((tween) => tween.kill()); lenis.destroy(); };
  }, [reduced]);

  return <div ref={progressRef} className="scroll-progress" aria-hidden="true" style={{ transform: "scaleX(0)" }} />;
}
