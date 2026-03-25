import { ObligationRow, StrategyType } from './types';

/**
 * Deterministic strategy engine.
 * Chooses the best negotiation approach based on obligation characteristics.
 */
export function chooseStrategy(obligation: ObligationRow): StrategyType {
  const flexScore = obligation.flexibility_score ?? 5;

  if (flexScore > 7) return 'delay';          // High flexibility → request full delay
  if (obligation.amount > 20000) return 'payment_plan'; // Large amount → structured plan
  return 'partial';                            // Default → partial payment offer
}

/**
 * Human-readable label for each strategy type.
 */
export const STRATEGY_LABELS: Record<StrategyType, string> = {
  delay: 'Payment Deferral',
  payment_plan: 'Payment Plan / EMI',
  partial: 'Partial Payment',
};

/**
 * How many days of extension to request per strategy.
 */
export const STRATEGY_DAYS: Record<StrategyType, number> = {
  delay: 14,
  payment_plan: 30,
  partial: 7,
};
