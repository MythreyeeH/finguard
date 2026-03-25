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
 * Robust native CSV parser.
 * Dynamically identifies dates, amounts, and descriptions.
 */
export function parseCSVBulk(text: string): ValidatedObligation[] {
  const lines = text.split(/\r?\n/);
  const results: ValidatedObligation[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    
    // Split by comma, respecting quotes
    const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(s => s.trim().replace(/^"|"$/g, ''));
    if (parts.length < 2) continue;
    
    // Find Amount (right-most numeric column)
    let amountIdx = -1;
    let amountVal = 0;
    
    for (let j = parts.length - 1; j >= 0; j--) {
      const cleanNum = parts[j].replace(/[^0-9.-]/g, '');
      if (cleanNum && cleanNum !== '-' && cleanNum !== '.') {
        const parsed = parseFloat(cleanNum);
        if (!isNaN(parsed)) {
          amountIdx = j;
          amountVal = parsed;
          break;
        }
      }
    }
    
    if (amountIdx === -1) continue; // Skip headers or invalid rows
    
    // Find Date
    let dateStr = new Date().toISOString();
    let dateIdx = -1;
    for (let j = 0; j < parts.length; j++) {
      if (j !== amountIdx && parts[j].match(/\d{1,4}[-/]\d{1,2}[-/]\d{1,4}/)) {
        dateStr = parts[j];
        dateIdx = j;
        break;
      }
    }
    
    // Find Description (longest remaining text)
    let desc = 'Unknown Entity';
    let maxLen = 0;
    for (let j = 0; j < parts.length; j++) {
      if (j !== amountIdx && j !== dateIdx) {
        if (parts[j].length > maxLen) {
          maxLen = parts[j].length;
          desc = parts[j];
        }
      }
    }
    
    // Determine type
    let type: 'payable' | 'receivable' = amountVal < 0 ? 'payable' : 'receivable';
    
    // Analyze keywords if amount was parsed as strictly positive
    if (amountVal >= 0) {
      const lowerLine = line.toLowerCase();
      if (parts.some(p => ['debit', 'dr', 'withdrawal', 'expense'].includes(p.toLowerCase()))) {
        type = 'payable';
      } else if (parts.some(p => ['credit', 'cr', 'deposit', 'income'].includes(p.toLowerCase()))) {
        type = 'receivable';
      } else if (lowerLine.includes('paid') || lowerLine.includes('fee')) {
        type = 'payable';
      }
    }

    try {
      const ob = normalizeAndValidate({
        amount: Math.abs(amountVal).toString(),
        type,
        counterparty: desc,
        date: dateStr
      }, 'csv');
      results.push(ob);
    } catch {
      // Ignore rows that fail validation (e.g., zero amount)
    }
  }
  
  return results;
}
