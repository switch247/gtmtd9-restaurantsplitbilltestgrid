// broken-remainder.js
// Bug: gives remainder cents to the last person instead of the first (lead payer)
export function splitBill(total, taxPercent, tipPercent, numPeople) {
  if (numPeople <= 0) return [];

  const totalWithTax = total * (1 + taxPercent / 100);
  const finalAmount = totalWithTax * (1 + tipPercent / 100);

  const totalCents = Math.round(finalAmount * 100);
  const perPersonCents = Math.floor(totalCents / numPeople);
  const remainderCents = totalCents % numPeople;

  const results = new Array(numPeople).fill(perPersonCents);

  // BUG: add remainder to last person instead of first
  results[numPeople - 1] += remainderCents;

  return results.map(c => c / 100);
}
