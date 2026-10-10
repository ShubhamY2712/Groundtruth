const L = 1e5;
const CR = 1e7;

/** Indian-style money: ₹1.23 Cr, ₹45.6 L, ₹12,000. */
export function money(v: number): string {
  const a = Math.abs(v);
  const sign = v < 0 ? "−" : "";
  if (a >= CR) return `${sign}₹${(a / CR).toFixed(a >= 10 * CR ? 1 : 2)} Cr`;
  if (a >= L) return `${sign}₹${(a / L).toFixed(1)} L`;
  return `${sign}₹${Math.round(a).toLocaleString("en-IN")}`;
}

export function pct(v: number, digits = 0): string {
  return `${(v * 100).toFixed(digits)}%`;
}

export function usd(v: number): string {
  return `$${Math.round(v).toLocaleString("en-US")}`;
}
