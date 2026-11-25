/** Rs.1,999 for whole amounts, Rs.1,999.50 otherwise. */
export function formatPrice(amount: number) {
  const value = Number(amount);
  const digits = Number.isInteger(value) ? 0 : 2;
  return `Rs.${value.toLocaleString("en-PK", { minimumFractionDigits: digits, maximumFractionDigits: 2 })}`;
}

export type DeliveryRates = { fee: number; freeOver: number | null };

export function deliveryFee(subtotal: number, rates: DeliveryRates) {
  return rates.freeOver !== null && subtotal >= rates.freeOver ? 0 : rates.fee;
}
