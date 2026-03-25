import { useState, useMemo, useEffect } from 'react';
import { useObligations } from './use-obligations';
import { buildFinancialState } from '@/lib/decision-engine/state-builder';
import { fetchInitialBalance, saveInitialBalance } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export function useFinancialState() {
  const { user } = useAuth();
  const { obligations, loading, error } = useObligations();
  const [startingBalance, setStartingBalance] = useState(() => {
    const saved = localStorage.getItem('finguard_cash_balance');
    return saved ? parseFloat(saved) : 50000;
  });
  const [needsSetup, setNeedsSetup] = useState(false);

  // Load user's preferred starting balance from local storage & Supabase
  useEffect(() => {
    async function loadBalance() {
      let balanceLoaded = false;
      const res = await fetchInitialBalance(user?.id);
      if (res.success && res.data && typeof res.data.cash_balance === 'number') {
        const val = res.data.cash_balance;
        setStartingBalance(val);
        localStorage.setItem('finguard_cash_balance', val.toString());
        setNeedsSetup(false);
        balanceLoaded = true;
      }
      
      if (!balanceLoaded) {
        const saved = localStorage.getItem('finguard_cash_balance');
        if (saved) {
          setStartingBalance(parseFloat(saved));
          setNeedsSetup(false);
        } else {
          setNeedsSetup(true);
        }
      }
    }
    loadBalance();
  }, []);

  const updateBalance = async (newBalance: number) => {
    setStartingBalance(newBalance);
    localStorage.setItem('finguard_cash_balance', newBalance.toString());
    setNeedsSetup(false);
    await saveInitialBalance(newBalance, user?.id);
  };

  const state = useMemo(() => {
    if (!obligations) return null;
    return buildFinancialState(obligations, startingBalance, 100000); // 100k assumed revenue
  }, [obligations, startingBalance]);

  // Format the timeline for the CashFlowTimeline chart component
  const chartData = useMemo(() => {
    if (!state) return [];
    
    // The CashFlowTimeline normally expects { day, baseline, S0, etc. }
    // Since we are replacing the simulator scenarios with real timeline events,
    // we'll map the state timeline directly.
    return state.timeline.map((event, index) => {
      return {
        day: index,
        name: new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        baseline: event.cumulative,
        // The CashFlowTimeline expects S0, S1 etc for other lines if present.
        // For the main dashboard, we just need the baseline to show the cash curve.
        S0: event.cumulative, // We can alias it so the chart draws the S0 optimal line as the actual timeline
        counterparty: event.counterparty,
        delta: event.delta
      };
    });
  }, [state]);

  return {
    ...state,
    chartData,
    loading,
    error,
    updateBalance,
    needsSetup
  };
}
