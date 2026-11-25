"use client";

import { useEffect, useRef } from "react";

/** x is where the garment hangs, on a wide line and on one narrow enough for phones. */
const garments = [
  { name: "romper", wide: 150, narrow: 92 }, { name: "cap", wide: 388, narrow: 246 }, { name: "bodysuit", wide: 610, narrow: 396 },
  { name: "frock", wide: 846, narrow: 568 }, { name: "socks", wide: 1064, narrow: 722 }, { name: "bib", wide: 1292, narrow: 868 },
] as const;
const lines = { wide: { width: 1440, height: 330 }, narrow: { width: 950, height: 330 } } as const;

const Peg = ({ x }: { x: number }) => <g transform={`translate(${x} -9)`}><rect className="peg" x="-4.5" width="9" height="28" rx="3.5" /><path className="peg-line" d="M-4.5 12h9" /></g>;

function Garment({ name }: { name: (typeof garments)[number]["name"] }) {
  switch (name) {
    case "bodysuit": return <>
      <path className="cloth cloth-seafoam" d="M-40 6Q-22 30 0 30T40 6l36 24-14 38-17-9-2 54c-2 24-16 36-28 42l-3 16h-24l-3-16c-12-6-26-18-28-42l-2-54-17 9-14-38Z" />
      <path className="stitch" d="M-36 13Q-20 37 0 37t36-24M-68 38l11 27M68 38 57 65M-38 118c4 17 14 27 24 33M38 118c-4 17-14 27-24 33" />
      <path className="embroidery" d="M-13 88a9 9 0 0 1 3-17 12 12 0 0 1 22 2 8 8 0 0 1 1 15Z" />
      <g className="snaps"><circle cx="-7" cy="164" r="2.2" /><circle cy="164" r="2.2" /><circle cx="7" cy="164" r="2.2" /></g>
      <Peg x={-40} /><Peg x={40} /></>;
    case "frock": return <>
      <path className="cloth cloth-blush" d="M-30 6Q-16 25 0 25T30 6l16 9c4 20-2 32-9 42l-3 22c20 34 38 70 48 106-15 10-30 10-41 4-13 8-27 8-41 0-14 8-28 8-41 0-11 6-26 6-41-4 10-36 28-72 48-106l-3-22c-7-10-13-22-9-42Z" />
      <path className="cloth-band" d="M-36 70c22 9 50 9 72 0l1 12c-23 9-51 9-74 0Z" />
      <path className="stitch" d="M-74 173c13 7 25 6 35 1 14 7 26 7 39 0 13 7 25 7 39 0 10 5 22 6 35-1M-27 12q13 19 27 19t27-19" />
      <path className="fold" d="M-24 92c-8 24-14 46-18 70M0 94v72M24 92c8 24 14 46 18 70" />
      <path className="embroidery" d="M0 74c-8-10-18-8-17 0s10 8 17 0c7 8 16 8 17 0s-9-10-17 0Zm0 0-7 17m7-17 7 17" />
      <Peg x={-30} /><Peg x={30} /></>;
    case "romper": return <>
      <path className="cloth cloth-sand" d="M-38 6Q-20 26 0 26T38 6l38 32-13 34-19-12-2 50 14 78c-12 8-24 8-34 3L6 128q-6-6-12 0l-16 63c-10 5-22 5-34-3l14-78-2-50-19 12-13-34Z" />
      <path className="stitch" d="M-34 13q17 19 34 19t34-19M-67 45l10 24M67 45 57 69M-53 178c10 5 19 5 28 2M53 178c-10 5-19 5-28 2M0 34v86" />
      <g className="snaps"><circle cy="46" r="3" /><circle cy="66" r="3" /><circle cy="86" r="3" /></g>
      <path className="fold" d="M-26 108c-3 20-7 38-10 54M26 108c3 20 7 38 10 54" />
      <Peg x={-38} /><Peg x={38} /></>;
    case "cap": return <>
      <circle className="cloth-band" cy="20" r="15" />
      <path className="cloth cloth-sunshine" d="M-52 104c-4-50 14-82 52-82s56 32 52 82Z" />
      <path className="fold" d="M-24 98c-3-32 4-54 16-66M0 98V30M24 98c3-32-4-54-16-66" />
      <rect className="cloth-band" x="-60" y="94" width="120" height="32" rx="15" />
      <path className="stitch" d="M-50 110H50" />
      <Peg x={0} /></>;
    case "socks": return <>
      {[-32, 34].map((offset) => <g key={offset} transform={`translate(${offset} 0) rotate(${offset > 0 ? 3 : -3})`}>
        <path className="cloth cloth-lavender" d="M-19 4h38v64c0 14 6 20 20 26 17 8 20 28 6 35-16 7-38 3-50-8-10-9-14-20-14-35Z" />
        <path className="cloth-band" d="M-19 4h38v18h-38Z" />
        <path className="stitch" d="M-14 30h28M8 124c10 3 22 4 33 0" />
        <Peg x={0} /></g>)}</>;
    case "bib": return <>
      <path className="cloth cloth-sky" d="M-52 2c3 38 22 52 52 52S49 40 52 2c22 34 22 66 6 92-12 20-34 28-58 28s-46-8-58-28c-16-26-16-58 6-92Z" />
      <path className="stitch" d="M-54 22c6 28 26 39 54 39s48-11 54-39M-60 64c2 34 28 51 60 51s58-17 60-51" />
      <path className="embroidery" d="m0 72 5 11 12 1-9 8 3 12-11-6-11 6 3-12-9-8 12-1Z" />
      <Peg x={-52} /><Peg x={52} /></>;
  }
}

/** One washing line. Garments drift in the breeze and swing when the pointer brushes past. */
function Line({ layout }: { layout: keyof typeof lines }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const nodes = Array.from(svg.querySelectorAll<SVGGElement>(".garment-swing"));
    const state = nodes.map((node, index) => ({ node, angle: 0, velocity: index % 2 ? 26 : -26, phase: index * 1.7 }));
    let frame = 0, last = 0, visible = true;

    const tick = (time: number) => {
      const step = Math.min((time - last) / 1000, 0.034);
      last = time;
      for (const item of state) {
        const breeze = Math.sin(time / 1500 + item.phase) * 2.1 + Math.sin(time / 610 + item.phase * 2) * 0.6;
        item.velocity += (-26 * (item.angle - breeze) - 2.4 * item.velocity) * step;
        item.angle += item.velocity * step;
        item.node.setAttribute("transform", `rotate(${item.angle.toFixed(2)})`);
      }
      frame = window.requestAnimationFrame(tick);
    };
    const start = () => { if (!frame && visible && !document.hidden) { last = performance.now(); frame = window.requestAnimationFrame(tick); } };
    const stop = () => { window.cancelAnimationFrame(frame); frame = 0; };

    let previousX = 0;
    const onMove = (event: PointerEvent) => {
      const speed = Math.max(-60, Math.min(60, event.clientX - previousX));
      previousX = event.clientX;
      for (const item of state) {
        const box = item.node.getBoundingClientRect();
        if (event.clientX > box.left - 14 && event.clientX < box.right + 14 && event.clientY > box.top - 10 && event.clientY < box.bottom + 20) item.velocity = Math.max(-90, Math.min(90, item.velocity - speed * 0.9));
      }
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) start(); else stop(); });
    observer.observe(svg);
    const onVisibility = () => { if (document.hidden) stop(); else start(); };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pointermove", onMove, { passive: true });
    start();
    return () => { stop(); observer.disconnect(); document.removeEventListener("visibilitychange", onVisibility); window.removeEventListener("pointermove", onMove); };
  }, []);

  const { width, height } = lines[layout];
  // The line sags like a real one.
  const lineY = (x: number) => 46 + 58 * (1 - ((x - width / 2) / (width / 2 + 40)) ** 2);
  const stringPath = `M-40 ${lineY(-40).toFixed(1)}${Array.from({ length: Math.ceil(width / 40) + 3 }, (_, index) => { const x = index * 40; return `L${x} ${lineY(x).toFixed(1)}`; }).join("")}`;
  return <svg ref={svgRef} className={`clothesline clothesline-${layout}`} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMin slice" role="img" aria-label="Baby clothes drying on a washing line">
    <path className="clothesline-string" d={stringPath} />
    {garments.map((garment, index) => { const x = garment[layout], name = garment.name; return <g key={name} transform={`translate(${x} ${lineY(x).toFixed(1)})`}><g className="garment" style={{ "--drop": `${120 + index * 90}ms` } as React.CSSProperties}><g className="garment-swing"><Garment name={name} /></g></g></g>; })}
  </svg>;
}

/** Only one of the two is displayed; the hidden one never animates. */
export function HeroClothesline() {
  return <><Line layout="wide" /><Line layout="narrow" /></>;
}
