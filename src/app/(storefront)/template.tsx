import type { ReactNode } from "react";

/** Remounts on every navigation, so the CSS entrance replays. */
export default function StorefrontTemplate({ children }: { children: ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
