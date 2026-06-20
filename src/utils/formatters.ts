export function formatShekel(amount: number): string {
  if (!isFinite(amount) || isNaN(amount)) return '₪0';
  return `₪${amount.toLocaleString('he-IL', { maximumFractionDigits: 0 })}`;
}

export function safeDiv(numerator: number, denominator: number): number {
  if (!denominator || !isFinite(denominator)) return 0;
  const result = numerator / denominator;
  return isFinite(result) ? result : 0;
}
