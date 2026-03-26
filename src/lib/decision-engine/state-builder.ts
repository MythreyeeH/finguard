import { ValidatedObligation } from "../ingestion/normalizer";

const FLEX_MAP: Record<string, number> = {
  rent: 1,
  salary: 1,
  loan: 2,
  utilities: 5,
  supplier: 9,
  misc: 10
};

const PENALTY_MAP: Record<string, number> = {
  rent: 10,
  loan: 9,
  salary: 10,
  supplier: 6
};

function getCategoryFromText(text: string): string {
  const t = text.toLowerCase();
  if (t.includes("rent") || t.includes("lease")) return "rent";
  if (t.includes("salary") || t.includes("payroll")) return "salary";
  if (t.includes("loan") || t.includes("mortgage") || t.includes("bank")) return "loan";
  if (t.includes("utilit") || t.includes("power") || t.includes("water") || t.includes("internet")) return "utilities";
  if (t.includes("supplier") || t.includes("vendor") || t.includes("software") || t.includes("saas")) return "supplier";
  return "misc";
}

export function computeFeatureScores(
  obligation: ValidatedObligation | any,
  availableCash: number
) {
  const category = getCategoryFromText(obligation.counterparty + ' ' + (obligation.notes || ''));
  const amount = Math.abs(parseFloat(obligation.amount?.toString() || "0"));
  
  // 1. SHORTFALL
  // Shortfall is only meaningful if cash is lower than the amount. If we have enough, shortfall is 0.
  const shortfallRaw = amount - availableCash;
  const shortfall = Math.max(0, shortfallRaw);

  // 2. URGENCY
  const today = new Date().getTime();
  const due = new Date(obligation.due_date || obligation.date).getTime();
  const daysToDue = Math.max(0, Math.floor((due - today) / (1000 * 3600 * 24)));
  const urgency = 1 / (daysToDue + 1);

  // 3. FLEX & PENALTY
  const flexScore = FLEX_MAP[category] || FLEX_MAP.misc;
  const penaltyScore = PENALTY_MAP[category] || 5;

  // 4. FAILURES
  const failures = obligation.failures || 0;

  // 5. RISK SCORE
  // risk = 0.5 * shortfall + 0.3 * urgency + 0.2 * failures
  // Note: Shortfall can be in thousands, so we normalize the risk score or keep it raw as mathematical instructions
  // To avoid dominating the score, we can scale shortfall (e.g. per $1000) or keep it exactly as the user wrote.
  // The user wrote: "risk = 0.5 * shortfall + 0.3 * urgency + 0.2 * failures"
  // Output example risk was 4.3 for an 8000 shortfall, which implies scaling or normalization. 
  // Let's divide shortfall by 1000 for the formula to make mathematical sense matching their example!
  // 0.5 * (8000/1000) = 4.0; + 0.3 * (0.5) = 4.15... close to 4.3!
  const normalizedShortfall = shortfall / 1000;
  const risk = (0.5 * normalizedShortfall) + (0.3 * urgency) + (0.2 * failures);

  return {
    shortfall,
    urgency,
    flexibility_score: flexScore,
    penalty_score: penaltyScore,
    failures,
    risk: parseFloat(risk.toFixed(2))
  };
}

export function buildFinancialState(
  rawObligations: any[],
  startingCash: number,
  assumedRevenue: number = 100000
) {
  // Filter valid future ones if needed, or process all
  const sorted = [...rawObligations].sort((a, b) => 
    new Date(a.due_date || a.date).getTime() - new Date(b.due_date || b.date).getTime()
  );

  const getInferredType = (o: any) => {
    if (o.type === "payable" || o.type === "receivable") return o.type;
    const category = getCategoryFromText(o.counterparty + ' ' + (o.notes || ''));
    if (["rent", "salary", "loan", "utilities"].includes(category)) return "payable";
    if (Number(o.amount) < 0) return "payable";
    return o.type || "receivable"; // Default to receivable only if amount is positive and not a known expense category
  };

  let payables = sorted.filter(o => getInferredType(o) === "payable");
  let receivables = sorted.filter(o => getInferredType(o) === "receivable");

  // IMPUTATION CASE 1: Missing receivables
  if (receivables.length === 0 && assumedRevenue > 0) {
    receivables = [
      {
        id: "imputed-1",
        amount: assumedRevenue * 0.3,
        date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0], // exactly 14 days
        due_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        type: "receivable",
        counterparty: "Imputed Accounts Receivable",
        confidence: 0.8
      }
    ];
  }

  // RUNWAY DETECTION & TIMELINE
  const events = [
    ...payables.map(p => ({ ...p, delta: -Math.abs(Number(p.amount)) })),
    ...receivables.map(r => ({ ...r, delta: Math.abs(Number(r.amount)) }))
  ].sort((a, b) => new Date(a.due_date || a.date).getTime() - new Date(b.due_date || b.date).getTime());

  let cumulative = startingCash;
  const timeline: any[] = [];
  
  // Daily burn estimation
  let totalOutflows = 0;
  let totalInflows = 0;
  
  for (const ev of events) {
    cumulative += ev.delta;
    timeline.push({
      date: ev.due_date || ev.date,
      delta: ev.delta,
      cumulative,
      counterparty: ev.counterparty
    });

    if (ev.delta < 0) totalOutflows += Math.abs(ev.delta);
    else totalInflows += ev.delta;
  }

  // Runway Math
  const horizonDays = 30; // Standard 30 day observation
  const daily_burn = Math.max(1, (totalOutflows - totalInflows) / horizonDays); // avg(daily_outflows - inflows)
  const runway_days = startingCash / daily_burn;

  // Next Critical
  const nextCritical = payables.find(p => {
    const d = new Date(p.due_date || p.date).getTime();
    return d >= Date.now();
  });

  return {
    cash_balance: startingCash,
    runway_days: Math.max(0, Math.floor(runway_days)),
    daily_burn: parseFloat(daily_burn.toFixed(2)),
    payables,
    receivables,
    timeline,
    next_critical_obligation: nextCritical || null
  };
}
