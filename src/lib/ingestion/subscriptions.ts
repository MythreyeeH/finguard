import { ValidatedObligation } from "./normalizer";

export type Frequency = 'Weekly' | 'Monthly' | 'Yearly';

export type SubscriptionPlan = {
  vendor: string;
  amount: number;
  frequency: Frequency;
  nextDueDate: string; // ISO Date YYYY-MM-DD
};

/**
 * Projects a recurring subscription plan into explicit future obligations
 * over a specified time horizon (default 90 days) so that the engine can
 * simulate cash exhaustion accurately.
 */
export function projectSubscriptionLiabilities(
  plan: SubscriptionPlan,
  horizonDays: number = 90
): ValidatedObligation[] {
  const projectedObligations: ValidatedObligation[] = [];
  
  let currentDue = new Date(plan.nextDueDate);
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() + horizonDays);

  while (currentDue <= cutoffDate) {
    const dateStr = currentDue.toISOString().split('T')[0];
    
    projectedObligations.push({
      id: `sub-${crypto.randomUUID()}`,
      type: 'payable',
      amount: plan.amount,
      date: dateStr,
      due_date: dateStr,
      counterparty: plan.vendor,
      source: 'subscription',
      status: 'verified', // Subscriptions map exactly to known liabilities
      is_deferrable: false // Usually subscriptions are hard liabilities
    });

    // Advance to next period
    if (plan.frequency === 'Weekly') {
      currentDue.setDate(currentDue.getDate() + 7);
    } else if (plan.frequency === 'Monthly') {
      currentDue.setMonth(currentDue.getMonth() + 1);
    } else if (plan.frequency === 'Yearly') {
      currentDue.setFullYear(currentDue.getFullYear() + 1);
    }
  }

  return projectedObligations;
}
