export function formatPrice(amount: number) {
  return `Rs.${Number(amount).toLocaleString("en-PK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
