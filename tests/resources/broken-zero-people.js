// broken-zero-people.js
// Bug: returns null instead of an empty array for invalid party sizes
export function splitBill(total, taxPercent, tipPercent, numPeople) {
  if (numPeople <= 0) return null; // should be [] or throw

  const totalWithTax = total * (1 + taxPercent / 100);
  const finalAmount = totalWithTax * (1 + tipPercent / 100);

  const totalCents = Math.round(finalAmount * 100);
  const perPersonCents = Math.floor(totalCents / numPeople);
  const remainderCents = totalCents % numPeople;

  const results = new Array(numPeople).fill(perPersonCents);
  results[0] += remainderCents;
  return results.map(c => c / 100);
}
