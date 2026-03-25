import { ValidatedObligation } from "./normalizer";

/**
 * Implements a hierarchical missing-data imputation pipeline for financial obligations.
 * Used when bulk records (e.g. from bank APIs or aggregate CSVs) are missing line-item categorizations.
 */

// Global benchmark sectors (mocked representations for retail, SaaS, Service)
const SECTOR_RATIOS: Record<string, number> = {
  retail: 0.35,
  saas: 0.15,
  service: 0.40
};

export function imputeMissingValues(
  currentPayables: ValidatedObligation[],
  knownTotalObligations: number | null,
  sectorContext: 'retail' | 'saas' | 'service' | 'unknown' = 'unknown',
  totalRevenue: number | null = null
): ValidatedObligation[] {
  let imputedCollection = [...currentPayables];
  
  const sumOfKnown = imputedCollection.reduce((acc, obj) => acc + obj.amount, 0);

  // Strategy 1: Zero / Default fallback
  // If we know total obligations perfectly matches our parsed items, no hidden gaps exist.
  if (knownTotalObligations !== null && sumOfKnown >= knownTotalObligations) {
    return imputedCollection;
  }

  // Strategy 2/3: Sector Ratio Expansion mapping
  // If we lack concrete data but know revenue, impute an "Estimated Uncaptured Sector Payables" block.
  if (knownTotalObligations === null && totalRevenue !== null && sectorContext !== 'unknown') {
    const projectedTotal = totalRevenue * SECTOR_RATIOS[sectorContext];
    if (projectedTotal > sumOfKnown) {
        imputedCollection.push({
            id: 'imputed-sector-gap',
            type: 'payable',
            amount: projectedTotal - sumOfKnown,
            date: new Date().toISOString().split('T')[0],
            due_date: new Date().toISOString().split('T')[0],
            counterparty: 'Estimated Undiscovered Overhead',
            source: 'manual',
            status: 'flagged',
            is_deferrable: false
        });
        return imputedCollection;
    }
  }

  // Strategy 4: Adjustment Scaling Factor (Mathematical weighting)
  // If we have a hard knownTotalObligations that is GREATER than what we parsed,
  // we scale the known variable costs proportionally, OR create a monolithic adjustment block.
  if (knownTotalObligations !== null && knownTotalObligations > sumOfKnown) {
     const uncapturedObligationAmt = knownTotalObligations - sumOfKnown;
     // Add mathematical block to maintain accuracy for Simulator Engine
     imputedCollection.push({
        id: `imputed-scale-gap-${Date.now()}`,
        type: 'payable',
        amount: uncapturedObligationAmt,
        date: new Date().toISOString().split('T')[0],
        due_date: new Date().toISOString().split('T')[0],
        counterparty: 'Uncategorized Scaled Obligations',
        source: 'manual', 
        status: 'flagged',
        is_deferrable: false
     });
  }

  return imputedCollection;
}
