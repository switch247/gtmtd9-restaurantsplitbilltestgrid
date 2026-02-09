// broken-tax.js
// Bug: applies tax as an absolute amount instead of a percentage
export function splitBill(total, taxPercent, tipPercent, numPeople) {
  if (numPeople <= 0) return [];

  // BUG: treat taxPercent as dollars rather than percent
  const totalWithTax = total + taxPercent;
  const finalAmount = totalWithTax * (1 + tipPercent / 100);

  const totalCents = Math.round(finalAmount * 100);
  const perPersonCents = Math.floor(totalCents / numPeople);
  const remainderCents = totalCents % numPeople;

  const results = new Array(numPeople).fill(perPersonCents);
  results[0] += remainderCents;
  return results.map(c => c / 100);
}
