export function BrandWordmark({ light = false }: { light?: boolean }) {
  return (
    <span className={`wordmark${light ? " wordmark-light" : ""}`} aria-label="ragNready">
      rag<span>N</span>ready
    </span>
  );
}
