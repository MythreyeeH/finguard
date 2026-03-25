import { ValidatedObligation } from "./normalizer";

// Basic Levenshtein distance calculation without external dependencies
function levenshteinDistance(a: string, b: string): number {
  const matrix = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));

  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // Deletion
        matrix[i][j - 1] + 1,      // Insertion
        matrix[i - 1][j - 1] + cost // Substitution
      );
    }
  }

  return matrix[a.length][b.length];
}

function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  if (s1 === s2) return 1.0;
  
  const distance = levenshteinDistance(s1, s2);
  const maxLength = Math.max(s1.length, s2.length);
  return maxLength === 0 ? 1.0 : 1.0 - (distance / maxLength);
}

/**
 * Fuzzy deduplication algorithm using Levenshtein distance matching.
 * Strategy:
 * 1. Sim_score > 0.85 (Vendor similarity)
 * 2. Amount within ±5% tolerance
 * 3. Date within ±3 days tolerance
 */
export function fuzzyDedupe(
  newEntry: ValidatedObligation, 
  existingDBEntries: ValidatedObligation[]
): { isDuplicate: boolean; duplicateOf?: string } {
  
  const newDate = new Date(newEntry.due_date).getTime();
  
  for (const existing of existingDBEntries) {
    if (existing.type !== newEntry.type) continue;

    // Condition 1: Vendor Similarity > 85%
    const simScore = calculateSimilarity(newEntry.counterparty, existing.counterparty);
    if (simScore <= 0.85) continue;

    // Condition 2: Amount ±5%
    const amountDiff = Math.abs(newEntry.amount - existing.amount);
    const amountTolerance = existing.amount * 0.05;
    if (amountDiff > amountTolerance) continue;

    // Condition 3: Date ±3 Days
    const existingDate = new Date(existing.due_date).getTime();
    const dateDiffDays = Math.abs(newDate - existingDate) / (1000 * 3600 * 24);
    if (dateDiffDays > 3) continue;

    // All fuzz conditions met -> Flagged as duplicate
    return { isDuplicate: true, duplicateOf: existing.id };
  }

  return { isDuplicate: false };
}

/**
 * Sweeps an array of incoming entries and filters out duplicates against the DB base.
 */
export function processDeduplicationRun(
  incomingEntries: ValidatedObligation[], 
  databaseContext: ValidatedObligation[]
): ValidatedObligation[] {
  const uniqueCleanData: ValidatedObligation[] = [];
  const currentContext = [...databaseContext];
  
  for (const entry of incomingEntries) {
    const check = fuzzyDedupe(entry, currentContext);
    if (!check.isDuplicate) {
      uniqueCleanData.push(entry);
      currentContext.push(entry); // Ensure intra-batch duplicates are also caught
    }
  }
  
  return uniqueCleanData;
}
