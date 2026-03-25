import { motion, AnimatePresence } from "framer-motion";
import { Star, Award, Zap, ShieldAlert, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Scenario {
  id: string;
  name: string;
  runway: string;
  coverage: string;
  penalty: string;
  score: number;
  description: string;
}

interface DecisionEngineProps {
  scenarios: Scenario[];
  activeScenarioId: string;
  onSelect: (id: string) => void;
}

export function DecisionEngine({ scenarios, activeScenarioId, onSelect }: DecisionEngineProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-display font-bold text-white flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
              <Zap className="w-5 h-5 text-emerald-400 fill-emerald-400" />
            </div>
             Decision Engine
          </h2>
          <p className="text-[10px] text-emerald-400/60 uppercase tracking-[0.3em] font-black mt-2">Proprietary Optimization Logic v4.0</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
          <Award className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-white uppercase tracking-tight">Optimal Strategy Identified</span>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto custom-scrollbar-hidden">
        <table className="w-full text-left border-separate border-spacing-y-3">
          <thead>
            <tr className="text-[11px] text-white/40 uppercase tracking-[0.2em] font-black">
              <th className="pb-2 pl-6">Strategy</th>
              <th className="pb-2">Runway</th>
              <th className="pb-2">Coverage</th>
              <th className="pb-2">Penalty</th>
              <th className="pb-2 pr-6 text-right">Score</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {scenarios.map((sc, idx) => (
                <motion.tr
                  key={sc.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => onSelect(sc.id)}
                  className={cn(
                    "group cursor-pointer transition-all duration-500 relative overflow-hidden",
                    activeScenarioId === sc.id 
                      ? "bg-emerald-500/10 ring-1 ring-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.1)]" 
                      : "bg-white/[0.02] border border-transparent hover:bg-white/[0.05] hover:border-white/10"
                  )}
                  style={{ borderRadius: '20px' }}
                >
                  <td className="py-5 pl-6 rounded-l-2xl relative">
                    {activeScenarioId === sc.id && (
                      <motion.div layoutId="active-indicator" className="absolute left-0 top-4 bottom-4 w-1 bg-emerald-400 rounded-full shadow-[0_0_15px_rgba(16,185,129,1)]" />
                    )}
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center border transition-all duration-500",
                        activeScenarioId === sc.id ? "bg-emerald-500/20 border-emerald-500/40" : "bg-white/5 border-white/10 group-hover:border-white/20"
                      )}>
                        {idx === 0 ? <TrendingUp className="w-4 h-4 text-blue-400" /> : 
                         sc.score >= 0.9 ? <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> : 
                         <ShieldAlert className="w-4 h-4 text-emerald-400" />}
                      </div>
                      <span className={cn(
                        "text-sm font-bold transition-all duration-300",
                        activeScenarioId === sc.id ? "text-white" : "text-white/70 group-hover:text-white"
                      )}>{sc.name}</span>
                    </div>
                  </td>
                  <td className="py-5">
                    <span className="text-sm font-mono font-bold text-white/90">{sc.runway}</span>
                  </td>
                  <td className="py-5">
                    <div className="flex items-center gap-3">
                       <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5 backdrop-blur-sm">
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: sc.coverage }}
                           transition={{ duration: 1, ease: "easeOut" }}
                           className={cn(
                             "h-full rounded-full",
                             parseInt(sc.coverage) >= 80 ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : 
                             parseInt(sc.coverage) >= 70 ? "bg-blue-500" : "bg-red-500"
                           )} 
                         />
                       </div>
                       <span className="text-xs text-white/50 font-black tabular-nums">{sc.coverage}</span>
                    </div>
                  </td>
                  <td className="py-5">
                    <span className={cn(
                      "text-[10px] px-3 py-1 rounded-full uppercase font-black tracking-widest border transition-all duration-500",
                      sc.penalty === 'Low' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]" :
                      sc.penalty === 'Medium' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
                    )}>
                      {sc.penalty}
                    </span>
                  </td>
                  <td className="py-5 pr-6 rounded-r-2xl text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className={cn(
                        "text-base font-display font-black tracking-tighter",
                        sc.score >= 0.9 ? "text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]" :
                        sc.score >= 0.8 ? "text-emerald-400" : "text-white/40"
                      )}>
                        {sc.score >= 0.9 && "⭐ "}
                        {sc.score.toFixed(2)}
                      </span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}
