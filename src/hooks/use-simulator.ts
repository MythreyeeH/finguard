import { useState, useMemo } from 'react';

export type Obligation = {
  id: string;
  vendor: string;
  amount: number;
  dueDay: number; // 0 is today
  riskWeight: number; // For risk calculation
};

export type Scenario = {
  id: string;
  name: string;
  description: string;
  selectedObligations: string[]; // IDs of obligations to pay
  riskLossMinimization: number; // percentage or raw score
  runwayAddedDays: number;
  coverage: number; // % of critical obligations handled
  isOptimal?: boolean;
};

export function useSimulator() {
  const [activeScenarioId, setActiveScenarioId] = useState<string>('S0');

  const startingBalance = 47230;
  
  // Base daily burn (non-obligation ops like payroll/fixed costs)
  const baseDailyBurn = 850;

  // Ordered list of obligations (chronological by dueDay)
  const obligations = useMemo<Obligation[]>(() => [
    { id: 'o1', vendor: 'Marketing (Google)', amount: 2000, dueDay: 1, riskWeight: 2 },
    { id: 'o2', vendor: 'Supplier B', amount: 5000, dueDay: 2, riskWeight: 8 },
    { id: 'o3', vendor: 'Rent (HQ)', amount: 8500, dueDay: 3, riskWeight: 10 },
    { id: 'o4', vendor: 'Supplier C', amount: 15000, dueDay: 5, riskWeight: 9 },
    { id: 'o5', vendor: 'SaaS Tools', amount: 1200, dueDay: 7, riskWeight: 3 },
    { id: 'o6', vendor: 'Legal Fees', amount: 4000, dueDay: 10, riskWeight: 5 },
    { id: 'o7', vendor: 'Supplier D', amount: 18000, dueDay: 14, riskWeight: 8 },
    { id: 'o8', vendor: 'Insurance', amount: 3000, dueDay: 18, riskWeight: 7 },
  ], []);

  // Generate 7 scenarios based on Decision Engine rules
  const scenarios = useMemo<Scenario[]>(() => {
    return [
      { id: 'S0', name: 'S0 Greedy', description: 'Sort risk desc, add until cash=0', selectedObligations: ['o3', 'o4', 'o2', 'o7'], riskLossMinimization: 82, runwayAddedDays: 14, coverage: 85, isOptimal: true },
      { id: 'S1', name: 'S1 Critical', description: 'Filter FLEX<=2, greedy', selectedObligations: ['o3', 'o4', 'o2'], riskLossMinimization: 75, runwayAddedDays: 18, coverage: 100 },
      { id: 'S2', name: 'S2 Skip Largest', description: 'Exclude max amount (Supplier D)', selectedObligations: ['o3', 'o4', 'o2', 'o6', 'o1', 'o5'], riskLossMinimization: 68, runwayAddedDays: 11, coverage: 78 },
      { id: 'S3', name: 'S3 Smallest-First', description: 'Sort amount asc', selectedObligations: ['o5', 'o1', 'o8', 'o6', 'o2'], riskLossMinimization: 45, runwayAddedDays: 7, coverage: 40 },
      { id: 'S4', name: 'S4 Swap 1', description: 'Swap marginal items from S0', selectedObligations: ['o3', 'o4', 'o7', 'o6'], riskLossMinimization: 79, runwayAddedDays: 12, coverage: 82 },
      { id: 'S5', name: 'S5 Swap 2', description: 'Swap marginal items from S1', selectedObligations: ['o3', 'o2', 'o7', 'o1'], riskLossMinimization: 71, runwayAddedDays: 13, coverage: 75 },
      { id: 'S6', name: 'S6 Knapsack', description: 'Max risk s.t. amount <= cash', selectedObligations: ['o3', 'o4', 'o2', 'o6', 'o1'], riskLossMinimization: 80, runwayAddedDays: 15, coverage: 84 },
    ];
  }, []);

  // Generate 30 days of chart data and determine exhaustion points
  const chartData = useMemo(() => {
    return Array.from({ length: 31 }).map((_, day) => {
      const dataPoint: any = { day, name: `Day ${day}` };
      
      // Default (Crisis) Baseline: Pays everything as it comes until cash = 0
      let crisisBalance = startingBalance - (day * baseDailyBurn);
      const crisisPaid = obligations.filter(o => o.dueDay <= day);
      crisisBalance -= crisisPaid.reduce((sum, o) => sum + o.amount, 0);
      dataPoint.baseline = Math.max(0, crisisBalance);

      // Plot scenarios (Only subtracting cash for the ones explicitly selected)
      scenarios.forEach(scen => {
        let scBalance = startingBalance - (day * baseDailyBurn);
        const scenPaid = obligations.filter(o => o.dueDay <= day && scen.selectedObligations.includes(o.id));
        scBalance -= scenPaid.reduce((sum, o) => sum + o.amount, 0);
        dataPoint[scen.id] = Math.max(0, scBalance);
      });

      return dataPoint;
    });
  }, [obligations, scenarios, startingBalance, baseDailyBurn]);

  // Find zero cash day for baseline and optimal scenarios
  const baseDTZ = chartData.findIndex(d => d.baseline === 0) !== -1 ? chartData.findIndex(d => d.baseline === 0) : 31;
  const currentDTZ = chartData.findIndex(d => d.S0 === 0) !== -1 ? chartData.findIndex(d => d.S0 === 0) : 31;

  const activeScenario = scenarios.find(s => s.id === activeScenarioId) || scenarios[0];
  const netImpact = obligations
    .filter(o => !activeScenario.selectedObligations.includes(o.id))
    .reduce((sum, o) => sum + o.amount, 0);

  return {
    scenarios,
    activeScenarioId,
    setActiveScenarioId,
    activeScenario,
    obligations,
    startingBalance,
    currentBalance: startingBalance,
    baseDTZ,
    currentDTZ,
    netImpact,
    chartData
  };
}
