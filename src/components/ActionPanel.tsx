import { Check, Info, ShieldAlert, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Scenario } from "@/hooks/use-simulator";
import { motion } from "framer-motion";

interface ActionPanelProps {
  scenarios: Scenario[];
  activeScenarioId: string;
  onSelect: (id: string) => void;
  netImpact: number;
}

export function ActionPanel({ scenarios, activeScenarioId, onSelect, netImpact }: ActionPanelProps) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xl font-display font-semibold text-white">Decision Engine</h2>
        <span className="bg-blue-500/20 text-blue-300 text-[10px] uppercase font-bold px-2 py-0.5 rounded border border-blue-500/30">Auto</span>
      </div>
      
      <p className="text-xs text-muted-foreground mb-4">Select an AI-generated scenario to visualize its impact on your cash timeline.</p>

      <div className="flex-grow space-y-3 overflow-y-auto pr-2 custom-scrollbar">
        {scenarios.map((scenario, idx) => {
          const isActive = scenario.id === activeScenarioId;
          const isOptimal = scenario.isOptimal;

          return (
            <motion.div
              key={scenario.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => onSelect(scenario.id)}
              className={cn(
                "p-3 rounded-xl border transition-all duration-300 cursor-pointer relative overflow-hidden group",
                isActive 
                  ? "bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
                  : "bg-white/[0.02] border-white/10 hover:bg-white/[0.05] hover:border-white/20"
              )}
            >
              {/* Background gradient for active */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/10 opacity-50 pointer-events-none" />
              )}

              <div className="relative z-10 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {isOptimal && (
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                    )}
                    <h3 className={cn("text-sm font-bold", isActive ? "text-white" : "text-white/80")}>
                      {scenario.name}
                    </h3>
                  </div>
                  {isOptimal && (
                    <span className="text-[9px] uppercase tracking-wider font-bold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">
                      Optimal
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-white/50 leading-relaxed">
                  {scenario.description}
                </p>

                <div className="grid grid-cols-3 gap-2 mt-1">
                  <div className="bg-black/20 rounded p-1.5 flex flex-col items-center justify-center">
                    <span className="text-[9px] text-muted-foreground flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> Risk Loss</span>
                    <span className={cn("text-xs font-bold", scenario.riskLossMinimization > 75 ? "text-emerald-400" : "text-amber-400")}>
                      {scenario.riskLossMinimization}%
                    </span>
                  </div>
                  <div className="bg-black/20 rounded p-1.5 flex flex-col items-center justify-center">
                    <span className="text-[9px] text-muted-foreground flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Extra Days</span>
                    <span className="text-xs font-bold text-blue-400">
                      +{scenario.runwayAddedDays}d
                    </span>
                  </div>
                  <div className="bg-black/20 rounded p-1.5 flex flex-col items-center justify-center">
                    <span className="text-[9px] text-muted-foreground flex items-center gap-1"><Check className="w-3 h-3" /> Coverage</span>
                    <span className="text-xs font-bold text-white/80">
                      {scenario.coverage}%
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex justify-between items-center bg-emerald-500/5 border border-emerald-500/20 p-3 rounded-xl">
          <div className="flex items-center gap-2 text-sm text-emerald-400">
            <Info className="w-4 h-4" />
            <span className="font-medium">Runway Maximized</span>
          </div>
          <button className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            Deploy Actions
          </button>
        </div>
      </div>
    </div>
  );
}
