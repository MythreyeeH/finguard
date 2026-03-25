import { ValidatedObligation, normalizeAndValidate } from "./normalizer";

/**
 * Parses raw SMS Transaction Alerts
 * Looks for exact trigger keywords (debited/credited) and leverages regex for amounts/dates.
 */
export function parseSMS(rawText: string): ValidatedObligation | null {
  const cleanText = rawText.toLowerCase().trim();
  
  const isPayable = cleanText.includes("debited") || cleanText.includes("paid") || cleanText.includes("sent");
  const isReceivable = cleanText.includes("credited") || cleanText.includes("received");

  if (!isPayable && !isReceivable) return null;

  // Amount Extraction (e.g. Rs. 500, Rs.500, $500, 500)
  const amountMatch = cleanText.match(/(?:rs\.?|inr|\$)?\s?(\d+(?:,\d+)*(?:\.\d{1,2})?)/);
  if (!amountMatch) return null;
  const amountStr = amountMatch[1].replace(/,/g, '');

  // Default Counterparty from known SMS structures usually coming after "to" or "from"
  let vendor = "Unknown SMS Entity";
  const toMatch = cleanText.match(/to\s+([a-zA-Z\s0-9]+?)(?:\s+on|\s+via|\.|$)/);
  const fromMatch = cleanText.match(/from\s+([a-zA-Z\s0-9]+?)(?:\s+on|\s+via|\.|$)/);
  
  if (isPayable && toMatch) vendor = toMatch[1].trim();
  if (isReceivable && fromMatch) vendor = fromMatch[1].trim();

  return normalizeAndValidate({
    amount: amountStr,
    type: isPayable ? 'payable' : 'receivable',
    counterparty: vendor,
    date: new Date().toISOString()
  }, 'sms');
}

/**
 * Extremely basic CSV line parser.
 * Assumes format: Date, Description, Amount, Type
 */
export function parseCSVLine(line: string): ValidatedObligation | null {
  const parts = line.split(',').map(s => s.trim().replace(/^"|"$/g, ''));
  if (parts.length < 3) return null;

  const [dateStr, desc, amountStr] = parts;
  
  // Basic heuristic: if amount is negative, payable.
  const rawAmt = parseFloat(amountStr);
  if (isNaN(rawAmt)) return null;

  const type = rawAmt < 0 ? 'payable' : 'receivable';

  return normalizeAndValidate({
    amount: Math.abs(rawAmt).toString(),
    type,
    counterparty: desc || 'Unknown CSV Entity',
    date: dateStr
  }, 'csv');
}
