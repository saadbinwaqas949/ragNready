"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { BrandWordmark } from "@/components/brand-wordmark";

export function BrandedPreloader() {
  const [visible, setVisible] = useState(false);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (window.sessionStorage.getItem("ragnready-preloader-seen")) return;
    window.sessionStorage.setItem("ragnready-preloader-seen", "true");
    setVisible(true);
    const timer = window.setTimeout(() => setVisible(false), reduced ? 180 : 680);
    return () => window.clearTimeout(timer);
  }, [reduced]);

  return <AnimatePresence>
    {visible && <motion.div className="branded-preloader" aria-hidden="true" initial={{ opacity: 1 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 0.24 }}>
      <motion.div initial={reduced ? false : { y: 8, scale: 0.92 }} animate={reduced ? undefined : { y: [8, -8, 0], scale: [0.92, 1.04, 1] }} transition={{ duration: 0.58, times: [0, 0.6, 1], ease: "easeOut" }}><BrandWordmark /></motion.div>
    </motion.div>}
  </AnimatePresence>;
}
