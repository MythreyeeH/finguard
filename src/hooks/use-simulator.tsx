import { createContext, useContext, useState, useMemo, useEffect, useCallback, ReactNode } from 'react';
import { fetchPayableObligations, fetchInitialBalance } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export type Category = 'rent' | 'salary' | 'loan' | 'utilities' | 'supplier' | 'misc';

export type Obligation = {
  id: string;
  vendor: string;
  amount: number;
  dateIssued: string;
  dueDay: number;
  dueDate: string;
  category: Category;
  failures: number;
  riskWeight: number;
};

export type Scenario = {
  id: string;
  name: string;
  description: string;
  selectedObligations: string[];
  coverage: number;
  runwayAddedDays: number;
  riskLossMinimization: number;
  score: number;
  penalty: string;
  isOptimal?: boolean;
};

const BASE_DAILY_BURN = 850;

const FLEXIBILITY_MAP: Record<Category, number> = {
  rent: 1, salary: 1, loan: 2, utilities: 5, supplier: 9, misc: 10,
};

const PENALTY_MAP: Record<Category, number> = {
  rent: 10, salary: 10, loan: 9, utilities: 6, supplier: 3, misc: 2,
};

const BETA = {
  shortfall: 0.493506,
  urgency: 0.190236,
  failures: 0.526978,
};
const INTERCEPT = -2.243075;

function calculateRiskScore(ob: Omit<Obligation, 'riskWeight'>): number {
  const flexibility = FLEXIBILITY_MAP[ob.category] ?? 10;
  const penalty = PENALTY_MAP[ob.category] ?? 2;

  const shortfall = (ob.amount / 1000) * (penalty / 10);
  const urgency = (1 / (ob.dueDay + 1)) * (1 / flexibility);
  const failures = ob.failures;

  const z =
    shortfall * BETA.shortfall +
    urgency * BETA.urgency +
    failures * BETA.failures +
    INTERCEPT;

  return 1 / (1 + Math.exp(-z));
}

function mapVendorToCategory(vendor: string): Category {
  const v = (vendor || '').toLowerCase();
  if (v.includes('rent')) return 'rent';
  if (v.includes('salary') || v.includes('payroll')) return 'salary';
  if (v.includes('loan') || v.includes('bank')) return 'loan';
  if (v.includes('utility') || v.includes('utilities') || v.includes('power')) return 'utilities';
  if (v.includes('supplier') || v.includes('vendor')) return 'supplier';
  return 'misc';
}

const VALID_CATEGORIES = new Set<Category>(['rent', 'salary', 'loan', 'utilities', 'supplier', 'misc']);

function resolveCategory(dbCategory: string | undefined, vendor: string): Category {
  const normalized = (dbCategory || '').trim().toLowerCase();
  if (VALID_CATEGORIES.has(normalized as Category)) {
    return normalized as Category;
  }
  return mapVendorToCategory(vendor);
}

function calculateDueDay(d: string): number {
  const due = new Date(d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return diff < 0 ? 0 : diff;
}

interface SimulatorContextType {
  obligations: Obligation[];
  scenarios: Scenario[];
  activeScenarioId: string;
  setActiveScenarioId: (id: string) => void;
  activeScenario: Scenario;
  chartData: any[];
  baseDTZ: number;
  currentDTZ: number;
  currentBalance: number;
  nextCritical: Obligation | null;
  startingBalance: number;
  baseDailyBurn: number;
}

const SimulatorContext = createContext<SimulatorContextType | undefined>(undefined);

const FALLBACK_SCENARIO: Scenario = {
  id: 'idle',
  name: 'N/A',
  description: '',
  runwayAddedDays: 0,
  coverage: 0,
  selectedObligations: [],
  riskLossMinimization: 0,
  score: 0,
  penalty: 'Low',
};

export function SimulatorProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [dynamicBalance, setDynamicBalance] = useState<number>(55000);
  const [rawData, setRawData] = useState<Omit<Obligation, 'riskWeight'>[]>([]);
  const [activeScenarioId, setActiveScenarioId] = useState<string>('S0');

  useEffect(() => {
    async function loadBalance() {
      const saved = localStorage.getItem('finguard_cash_balance');
      if (saved) setDynamicBalance(parseFloat(saved));

      if (user?.id) {
        const res = await fetchInitialBalance(user.id);
        if (res.success && res.data && typeof res.data.cash_balance === 'number') {
          setDynamicBalance(res.data.cash_balance);
        }
      }
    }
    loadBalance();
  }, [user]);

  useEffect(() => {
    async function load() {
      const { success, data: dbData } = await fetchPayableObligations(user?.id);
      if (success && dbData && dbData.length > 0) {
        setRawData(
          dbData.map((d: any) => ({
            id: d.id,
            vendor: d.counterparty || 'Unknown',
            amount: parseFloat(d.amount) || 0,
            dateIssued: d.date || '',           
            dueDate: d.due_date || '',           
            dueDay: calculateDueDay(d.due_date), 
            category: resolveCategory(d.category, d.counterparty),
            failures: d.failures || 0,
          }))
        );
      } else {
        setRawData([
          { id: 'o1', vendor: 'Marketing (Google)', amount: 2000, dateIssued: '', dueDate: '', dueDay: 1, category: 'misc', failures: 0 },
          { id: 'o2', vendor: 'Payroll (Staff)', amount: 18000, dateIssued: '', dueDate: '', dueDay: 2, category: 'salary', failures: 1 },
          { id: 'o3', vendor: 'Rent (HQ)', amount: 12000, dateIssued: '', dueDate: '', dueDay: 3, category: 'rent', failures: 0 },
          { id: 'o4', vendor: 'Supplier C', amount: 25000, dateIssued: '', dueDate: '', dueDay: 5, category: 'supplier', failures: 0 },
          { id: 'o5', vendor: 'AWS Credits', amount: 1500, dateIssued: '', dueDate: '', dueDay: 7, category: 'utilities', failures: 0 },
          { id: 'o6', vendor: 'Loan Repayment', amount: 5000, dateIssued: '', dueDate: '', dueDay: 10, category: 'loan', failures: 0 },
          { id: 'o7', vendor: 'Quarterly Tax', amount: 8000, dateIssued: '', dueDate: '', dueDay: 14, category: 'misc', failures: 0 },
          { id: 'o8', vendor: 'Supplier D', amount: 12000, dateIssued: '', dueDate: '', dueDay: 18, category: 'supplier', failures: 2 },
        ]);
      }
    }
    load();
  }, [user]);

  const obligations = useMemo<Obligation[]>(
    () =>
      rawData
        .map(o => ({ ...o, riskWeight: calculateRiskScore(o) }))
        .sort((a, b) => a.dueDay - b.dueDay),
    [rawData]
  );

  const totalRisk = useMemo(
    () => obligations.reduce((sum, o) => sum + o.riskWeight, 0),
    [obligations]
  );

  const evaluateScenario = useCallback(
    (subset: Obligation[]) => {
      console.log("---- DEBUG START ----");
      console.log("SUBSET (PAID):", subset.map(o => ({ id: o.id, category: o.category, dueDay: o.dueDay })));
      console.log("ALL OBLIGATIONS:", obligations.map(o => ({ id: o.id, category: o.category, dueDay: o.dueDay })));
      
      const unpaidCritical = obligations.filter(o =>
        FLEXIBILITY_MAP[o.category] <= 2 &&
        !subset.some(sub => sub.id === o.id)
      );

      console.log("UNPAID CRITICAL:", unpaidCritical);
      console.log("---- DEBUG END ----");

      let totalPaid = 0;
      let riskAvoided = 0;
      let criticalPaid = 0;

      subset.forEach(o => {
        totalPaid += o.amount;
        riskAvoided += o.riskWeight;
        if (FLEXIBILITY_MAP[o.category] <= 2) criticalPaid++;
      });

      const coverage = Math.round(
        (subset.length / obligations.length) * 100
      );
      const maxRunway = Math.max(0, Math.floor((dynamicBalance - totalPaid) / BASE_DAILY_BURN));

      let earliestUnpaidCriticalDay = Infinity;
      obligations.forEach(o => {
        if (
          FLEXIBILITY_MAP[o.category] <= 2 &&
          !subset.some(sub => sub.id === o.id) &&
          o.dueDay < earliestUnpaidCriticalDay
        ) {
          earliestUnpaidCriticalDay = o.dueDay;
        }
      });

      const runwayAddedDays =
        earliestUnpaidCriticalDay === Infinity
          ? maxRunway
          : Math.min(maxRunway, earliestUnpaidCriticalDay);

      const riskLossMinimization = Math.round(
        (riskAvoided / Math.max(0.001, totalRisk)) * 100
      );

      return { coverage, runwayAddedDays, riskLossMinimization, score: riskAvoided };
    },
    [obligations, totalRisk, dynamicBalance]
  );

  const runScenario = useCallback((list: Obligation[]): Obligation[] => {
    let budget = dynamicBalance;
    const selected: Obligation[] = [];
    for (const o of list) {
      if (budget >= o.amount) {
        selected.push(o);
        budget -= o.amount;
      }
    }
    return selected;
  }, [dynamicBalance]);

  const scenarios = useMemo<Scenario[]>(() => {
    const sortedByRisk = [...obligations].sort((a, b) => b.riskWeight - a.riskWeight);
    const s0Set = runScenario(sortedByRisk);
    const s1Set = runScenario(sortedByRisk.filter(o => FLEXIBILITY_MAP[o.category] <= 2));
    const largest = [...obligations].sort((a, b) => b.amount - a.amount)[0];
    const s2Set = runScenario(sortedByRisk.filter(o => o.id !== largest?.id));
    const s3Set = runScenario([...obligations].sort((a, b) => a.amount - b.amount));
    const s4Set = s0Set.slice(0, Math.max(0, s0Set.length - 1));
    const densitySorted = [...obligations].sort(
      (a, b) =>
        b.riskWeight / (b.amount / 1000 || 1) -
        a.riskWeight / (a.amount / 1000 || 1)
    );
    const s6Set = runScenario(densitySorted);
    const topCritical = obligations
      .filter(o => FLEXIBILITY_MAP[o.category] <= 2)
      .sort((a, b) => b.riskWeight - a.riskWeight)[0];
    const s7Set = runScenario(obligations.filter(o => o.id !== topCritical?.id));

    return [
      { id: 'S0', name: 'Greedy', description: 'Highest-risk weight prioritized first.', selectedObligations: s0Set.map(o => o.id), ...evaluateScenario(s0Set), isOptimal: true, penalty: 'Low' },
      { id: 'S1', name: 'Critical', description: 'Minimal survival. Only paying rent and payroll.', selectedObligations: s1Set.map(o => o.id), ...evaluateScenario(s1Set), penalty: 'Medium' },
      { id: 'S2', name: 'Skip Largest', description: 'Ignoring the biggest bill to save cash for smaller ones.', selectedObligations: s2Set.map(o => o.id), ...evaluateScenario(s2Set), penalty: 'Medium' },
      { id: 'S3', name: 'Smallest First', description: 'Maximize creditor count by paying lowest amounts first.', selectedObligations: s3Set.map(o => o.id), ...evaluateScenario(s3Set), penalty: 'High' },
      { id: 'S4', name: 'Greedy Minus One', description: 'Greedy selection with the lowest-priority obligation removed.', selectedObligations: s4Set.map(o => o.id), ...evaluateScenario(s4Set), penalty: 'Low' },
      { id: 'S6', name: 'Knapsack', description: 'Mathematical packing maximizing risk-minimization per dollar.', selectedObligations: s6Set.map(o => o.id), ...evaluateScenario(s6Set), penalty: 'Low' },
      { id: 'S7', name: 'Delay Critical', description: 'Variance test: what happens if you delay the top critical obligation?', selectedObligations: s7Set.map(o => o.id), ...evaluateScenario(s7Set), penalty: 'CRITICAL' },
    ];
  }, [obligations, evaluateScenario, runScenario]);

  const activeScenario = useMemo(
    () => scenarios.find(s => s.id === activeScenarioId) ?? scenarios[0] ?? FALLBACK_SCENARIO,
    [scenarios, activeScenarioId]
  );

  const chartData = useMemo(() => {
    return Array.from({ length: 31 }).map((_, day) => {
      const dataPoint: any = { day, name: `Day ${day}` };
      let baselineBalance = dynamicBalance - day * BASE_DAILY_BURN;
      baselineBalance -= obligations.filter(o => o.dueDay <= day).reduce((sum, o) => sum + o.amount, 0);
      dataPoint.baseline = baselineBalance;

      scenarios.forEach(scen => {
        let scBalance = dynamicBalance - day * BASE_DAILY_BURN;
        const paid = obligations.filter(o => o.dueDay <= day && scen.selectedObligations.includes(o.id));
        const unpaid = obligations.filter(o => o.dueDay <= day && !scen.selectedObligations.includes(o.id));
        scBalance -= paid.reduce((sum, o) => sum + o.amount, 0);
        dataPoint[scen.id] = scBalance;
        dataPoint[`${scen.id}_deficit`] = -unpaid.reduce((sum, o) => sum + o.amount, 0);
      });
      return dataPoint;
    });
  }, [obligations, scenarios, dynamicBalance]);

  const baseDTZ = useMemo(() => {
    const idx = chartData.findIndex(d => d.baseline <= 0);
    return idx !== -1 ? idx : 31;
  }, [chartData]);

  const currentDTZ = useMemo(() => {
    const idx = chartData.findIndex(d => d[activeScenarioId] <= 0);
    return idx !== -1 ? idx : 31;
  }, [chartData, activeScenarioId]);

  const totalPaid = useMemo(
    () =>
      obligations
        .filter(o => activeScenario.selectedObligations.includes(o.id))
        .reduce((sum, o) => sum + o.amount, 0),
    [obligations, activeScenario]
  );

  const nextCritical = useMemo(
    () =>
      obligations
        .filter(o => FLEXIBILITY_MAP[o.category] <= 2)
        .sort((a, b) => a.dueDay - b.dueDay)[0] ?? null,
    [obligations]
  );

  return (
    <SimulatorContext.Provider
      value={{
        obligations,
        scenarios,
        activeScenarioId,
        setActiveScenarioId,
        activeScenario,
        chartData,
        baseDTZ,
        currentDTZ,
        currentBalance: dynamicBalance - totalPaid,
        nextCritical,
        startingBalance: dynamicBalance,
        baseDailyBurn: BASE_DAILY_BURN,
      }}
    >
      {children}
    </SimulatorContext.Provider>
  );
}

export function useSimulator() {
  const context = useContext(SimulatorContext);
  if (!context) throw new Error('useSimulator must be used within a SimulatorProvider');
  return context;
}
