import { motion } from "framer-motion";
import { Activity, ShieldAlert, TrendingUp, CheckCircle, ArrowRight } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { SimulatorChart } from "@/components/SimulatorChart";
import { useSimulator } from "@/hooks/use-simulator";
import { cn, formatCurrency } from "@/lib/utils";

export default function SimulatorPage() {
  const sim = useSimulator();

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <div
        className="fixed inset-0 z-0 opacity-40 pointer-events-none mix-blend-screen"
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/bg-mesh.png)`, backgroundSize: "cover" }}
      />
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-6 lg:p-8 relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <Activity className="w-5 h-5 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Gap Theory AI Projections</h1>
          </div>
          <p className="text-sm text-muted-foreground ml-12">
            Detailed breakdown of all 7 evaluated autonomous strategies and their systemic impact.
          </p>
        </motion.div>

        {/* Global Overview Box */}
        <div className="mb-10 p-6 rounded-2xl bg-white/5 border border-white/10 glass-card">
           <h2 className="text-lg font-semibold text-white mb-4">Hardcoded Obligation Matrix</h2>
           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
             {sim.obligations.map((o) => (
               <div key={o.id} className="p-3 bg-black/40 border border-white/5 rounded-xl flex flex-col items-center text-center">
                 <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide mb-1 flex items-center gap-1">Day {o.dueDay} <span className="text-red-400">R{o.riskWeight}</span></span>
                 <span className="text-sm font-semibold text-white/90 truncate w-full">{o.vendor}</span>
                 <span className="text-xs text-amber-400 font-bold mt-0.5">${(o.amount / 1000).toFixed(1)}k</span>
               </div>
             ))}
           </div>
        </div>

        {/* 7 Scenarios Rendered Consecutively */}
        <div className="space-y-12">
          {sim.scenarios.map((sc, index) => {
            const isOptimal = sc.isOptimal;
            return (
              <motion.div 
                key={sc.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "rounded-2xl border p-6 lg:p-8 relative overflow-hidden glass-card",
                  isOptimal ? "bg-emerald-500/5 border-emerald-500/30" : "bg-white/5 border-white/10"
                )}
              >
                {/* Optimal Background Glow */}
                {isOptimal && (
                  <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[100px] pointer-events-none rounded-full" />
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
                  {/* Left Metadata Panel */}
                  <div className="lg:col-span-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className={cn("text-2xl font-bold font-display", isOptimal ? "text-emerald-400" : "text-white")}>
                          {sc.name}
                        </h2>
                        {isOptimal && (
                          <span className="px-2.5 py-1 rounded bg-emerald-500 text-white text-[10px] font-bold tracking-wider uppercase shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                            AI Preferred
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-white/70 mb-6 leading-relaxed">
                        <strong className="text-white/90">Algorithm Logic: </strong> 
                        {sc.description}
                      </p>

                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1 mb-1"><ShieldAlert className="w-3.5 h-3.5" /> Risk Loss Proj.</p>
                          <p className={cn("text-xl font-bold", sc.riskLossMinimization > 75 ? "text-emerald-400" : "text-amber-400")}>{sc.riskLossMinimization}% Minimization</p>
                        </div>
                        <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1 mb-1"><TrendingUp className="w-3.5 h-3.5" /> Runway Extension</p>
                          <p className="text-xl font-bold text-blue-400">+{sc.runwayAddedDays} Days</p>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                          <p className="text-[11px] text-blue-300 flex items-center gap-1 mb-2 font-bold uppercase tracking-wider"><CheckCircle className="w-3.5 h-3.5" /> Subset Executed ({sc.coverage}% Coverage)</p>
                          <ul className="space-y-1.5 flex flex-wrap gap-2">
                            {sim.obligations.filter(o => sc.selectedObligations.includes(o.id)).map(o => (
                              <li key={o.id} className="text-xs text-blue-200 bg-blue-500/20 px-2 py-1 rounded flex items-center gap-1">
                                {o.vendor} <span className="opacity-50">| {(o.amount/1000).toFixed(1)}k</span>
                              </li>
                            ))}
                          </ul>
                      </div>
                    </div>
                  </div>

                  {/* Right Chart Panel */}
                  <div className="lg:col-span-8 h-[350px]">
                    <SimulatorChart data={sim.chartData} activeScenarioId={sc.id} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
