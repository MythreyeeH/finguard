import { motion } from "framer-motion";
import { CheckCircle2, TrendingUp, Zap } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

const LEVERS = [
  { id: "1", label: "Defer Rent", impact: 8500, days: 4 },
  { id: "2", label: "Apply Bridge Loan", impact: 15000, days: 8 },
  { id: "3", label: "Invoice Factoring", impact: 12000, days: 5 },
];

interface SimulatorLeversPanelProps {
  checked: Record<string, boolean>;
  onToggle: (id: string) => void;
  netImpact: number;
  addedDays: number;
}

export function SimulatorLeversPanel({ checked, onToggle, netImpact, addedDays }: SimulatorLeversPanelProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Simulator Levers</h3>
        <div className="flex items-center gap-2">
           <Zap className="w-3 h-3 text-amber-400" />
           <span className="text-[10px] text-amber-400 font-bold">+{addedDays}d Runway</span>
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto pr-1">
        {LEVERS.map((lever) => (
          <label 
            key={lever.id} 
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all group",
              checked[lever.id] ? "bg-emerald-500/10 border-emerald-500/30" : "bg-white/3 border-white/5 hover:border-white/10"
            )}
            onClick={() => onToggle(lever.id)}
          >
            <div className={cn(
              "w-4 h-4 rounded-md border flex items-center justify-center transition-all",
              checked[lever.id] ? "bg-emerald-500 border-emerald-500" : "border-white/20"
            )}>
              {checked[lever.id] && <CheckCircle2 className="w-3 h-3 text-white" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white/90 truncate">{lever.label}</p>
              <p className="text-[10px] text-emerald-400/80 mt-0.5">+{formatCurrency(lever.impact)}</p>
            </div>
          </label>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-white/40 uppercase tracking-tighter font-bold font-display">Simulated Impact</p>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            <span className="text-sm font-bold text-white">+{formatCurrency(netImpact)}</span>
          </div>
        </div>
        <button className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 text-[10px] font-bold border border-blue-500/30 hover:bg-blue-500/30 transition-all">
          Deploy Strategy
        </button>
      </div>
    </div>
  );
}
