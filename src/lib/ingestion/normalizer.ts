export type IngestionSource = 'sms' | 'email' | 'image' | 'csv' | 'manual' | 'subscription';

export type RawInput = {
  raw_data: string | File;
  source: IngestionSource;
  timestamp: Date;
};

export type ValidatedObligation = {
  id: string;
  type: 'payable' | 'receivable';
  amount: number;
  date: string; // ISO yyyy-mm-dd format
  due_date: string; // ISO yyyy-mm-dd format
  counterparty: string;
  source: IngestionSource;
  status: 'pending' | 'verified' | 'flagged';
  is_deferrable: boolean;
};

/**
 * Normalizes arbitrarily extracted JSON or raw data into a strictly typed Obligation.
 * Applies validation checks (amount > 0, valid dates, required fields).
 */
export function normalizeAndValidate(extractedParams: any, source: IngestionSource): ValidatedObligation {
  const amount = parseFloat(extractedParams.amount);
  const type = extractedParams.type?.toLowerCase();

  let status: 'pending' | 'verified' | 'flagged' = 'pending';
  
  // Validation constraints
  if (isNaN(amount) || amount <= 0) status = 'flagged';
  if (type !== 'payable' && type !== 'receivable') status = 'flagged';
  
  const dateStr = extractedParams.date ? new Date(extractedParams.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
  const dueDateStr = extractedParams.due_date ? new Date(extractedParams.due_date).toISOString().split('T')[0] : dateStr;

  return {
    id: extractedParams.id || crypto.randomUUID(),
    type: (type === 'receivable') ? 'receivable' : 'payable',
    amount: isNaN(amount) ? 0 : amount,
    date: dateStr,
    due_date: dueDateStr,
    counterparty: extractedParams.counterparty || 'Unknown Vendor',
    source,
    status,
    is_deferrable: extractedParams.deferrable ?? true
  };
}
