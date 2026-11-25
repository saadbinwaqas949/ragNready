const steps = [["new", "Received"], ["confirmed", "Confirmed"], ["shipped", "On its way"], ["delivered", "Delivered"]] as const;

export const statusLabel = (status: string) => status === "cancelled" ? "Cancelled" : steps.find(([key]) => key === status)?.[1] ?? status;

export function OrderProgress({ status }: { status: string }) {
  if (status === "cancelled") return <p className="form-alert">This order was cancelled.</p>;
  const current = Math.max(0, steps.findIndex(([key]) => key === status));
  return <ol className="order-progress" style={{ "--progress": current / (steps.length - 1) } as React.CSSProperties}>{steps.map(([key, label], index) => <li key={key} className={index <= current ? "is-done" : undefined} aria-current={index === current ? "step" : undefined}><i aria-hidden="true" />{label}</li>)}</ol>;
}
