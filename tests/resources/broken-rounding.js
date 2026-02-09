// broken-rounding.js
// Bug: rounds each individual's share independently to cents without preserving total, causing penny loss/gain
export function splitBill(total, taxPercent, tipPercent, numPeople) {
  if (numPeople <= 0) return [];

  const totalWithTax = total * (1 + taxPercent / 100);
  const finalAmount = totalWithTax * (1 + tipPercent / 100);

  // BUG: naive per-person rounding
  const raw = finalAmount / numPeople;
  const rounded = Math.round(raw * 100) / 100;
  return new Array(numPeople).fill(rounded);
}
