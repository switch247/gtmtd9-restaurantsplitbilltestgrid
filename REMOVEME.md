PROMPT:
Our POS system for 'Bistro Connect' features a bill-splitter utility used by waitstaff to handle group checks. We have received occasional reports from accounting that when groups of three or seven split a bill, the total of individual shares is sometimes off by one penny due to standard JavaScript floating-point division issues. 

You are tasked with writing a professional-grade test suite using a framework like Jest or Vitest to validate the `splitBill` function provided below. Your tests must prove that the function is 'penny-perfect'—meaning the sum of all individual payments must exactly equal the total bill plus tax and tip, with any remaining fractions of a cent allocated to the 'Lead Payer' (the first person in the array). 

Your test suite must specifically cover: 
1. Simple even splits without remainders.
2. Uneven splits (e.g., $10.00 split among 3 people) where the system must account for the floating 1-cent difference.
3. Dynamic tip and tax calculation based on percentage inputs.
4. Error handling for invalid party sizes (e.g., zero or negative people).
5. cover all scenarios and achieve 100% branch coverage

// filename: BillSplitter.js
/**
 * Splits a total bill amount among a group of people.
 * logic: Calculate total with tax/tip, divide, and floor values to the nearest cent.
 */
export function splitBill(total, taxPercent, tipPercent, numPeople) {
  if (numPeople <= 0) return [];

  const totalWithTax = total * (1 + taxPercent / 100);
  const finalAmount = totalWithTax * (1 + tipPercent / 100);

  // Convert to cents to handle rounding more predictably
  const totalCents = Math.round(finalAmount * 100);
  const perPersonCents = Math.floor(totalCents / numPeople);
  const remainderCents = totalCents % numPeople;

  const results = new Array(numPeople).fill(perPersonCents);

  // Add remainder cents to the first person (Lead Payer)
  results[0] += remainderCents;

  // Map back to dollars
  return results.map(cents => cents / 100);
}


PROBLEM STATEMENT:
Develop a rigorous unit testing suite for a restaurant bill-splitting utility in JavaScript. The objective is to verify mathematical accuracy down to the cent, ensuring the system handles floating-point rounding errors and remains perfectly accountable for taxes and tips across uneven party sizes.



REQUIREMENTS:

- Penny-Perfect Reconciliation: Implement a test scenario for a $100.00 bill split 3 ways with 10% tax and 15% tip. Your test must verify that the sum of the returned array precisely matches the total calculated amount (126.50) without a single cent of deviation.

- Remainder Allocation Check: Specifically verify that if there is a mathematical remainder (e.g., 10 divided by 3), the 'extra' penny is assigned exclusively to the first index (`result[0]`) and not distributed as a fraction of a cent.

- Percentage Boundary Validation: Write tests to ensure that 0% tax and 0% tip are handled correctly without returning NaN or zero values for the whole bill.

- Invalid Input Resilience: Test the function's response to an invalid number of people (0 or -1). The suite should assert that the function returns an empty array or throws a specific domain error, rather than attempting to divide by zero.

- Floating-Point Error Prevention: Create a 'High Volume' test with multiple varying amounts (e.g., $19.99, $4.32) and ensure that `Math.round` or the cent-conversion logic within the provided code correctly avoids standard JavaScript floating-point 'leakage' (like 0.30000000000000004).

- Testing Requirement (Happy Path): Verify a standard $60.00 bill for 4 people with 0% tax/tip results in exactly four entries of 15.00.

- Testing Requirement (Lead Payer Logic): Confirm that in a $0.05 bill split among 3 people, the first person pays 0.03 and the other two pay 0.01 each.

- Code Coverage Goal: Achieve 100% statement and branch coverage to ensure every line of the rounding and remainder-allocation logic is executed by the test suite.



<!-- helper command -->
git diff --no-index repository_before repository_after > patches/diff.patch
