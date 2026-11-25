/** Returns a Pakistani number as 923XXXXXXXXX digits, or other numbers as plain international digits. */
export function phoneDigits(value: string) {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("920")) digits = `92${digits.slice(3)}`;
  if (digits.startsWith("0")) return `92${digits.slice(1)}`;
  if (digits.startsWith("3") && digits.length === 10 && !value.trim().startsWith("+")) return `92${digits}`;
  return digits;
}

/** Pakistani mobile numbers must be complete; other countries only need a plausible length. */
export function isWhatsAppNumber(value: string) {
  if (!/^[\d\s+()-]+$/.test(value.trim())) return false;
  const digits = phoneDigits(value);
  if (digits.startsWith("92")) return /^923\d{9}$/.test(digits);
  return value.trim().startsWith("+") && digits.length >= 8 && digits.length <= 15;
}

export function whatsAppLink(phone: string, text?: string) {
  return `https://wa.me/${phoneDigits(phone)}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}
