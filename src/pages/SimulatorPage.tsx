import { motion } from "framer-motion";
import { Activity, ShieldAlert, TrendingUp, CheckCircle, ArrowRight, Zap, BarChart2, TrendingDown } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { SimulatorChart } from "@/components/SimulatorChart";
import { useSimulator } from "@/hooks/use-simulator";
import { cn, formatCurrency } from "@/lib/utils";

export default function SimulatorPage() {
  const sim = useSimulator();

  // Find the optimal scenario for the metric strip or use defaults
  const optimalSc = sim.scenarios.find(s => s.isOptimal) || sim.scenarios[0];

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Premium Background */}
      <div
        className="fixed inset-0 z-0 opacity-40 pointer-events-none mix-blend-screen"
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/bg-mesh.png)`, backgroundSize: "cover" }}
      />
      
      <Sidebar />

      <main className="flex-1 ml-20 lg:ml-80 p-6 lg:p-10 relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <Activity className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-white tracking-tight">Simulator AI Projections</h1>
              <p className="text-sm text-muted-foreground uppercase tracking-[0.2em] font-black opacity-60">Multi-Strategy Simulation Engine</p>
            </div>
          </div>
        </motion.div>

        {/* Metric Strip (Integrated with real data) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Eval. Strategies", value: sim.scenarios.length, icon: <BarChart2 className="w-5 h-5 text-emerald-400" />, color: "emerald" },
            { label: "Optimal Runway", value: `+${optimalSc.runwayAddedDays} Days`, icon: <TrendingUp className="w-5 h-5 text-blue-400" />, color: "blue" },
            { label: "Max Coverage", value: `${optimalSc.coverage}%`, icon: <CheckCircle className="w-5 h-5 text-amber-400" />, color: "amber" },
            { label: "System Risk", value: "Low", icon: <ShieldAlert className="w-5 h-5 text-red-400" />, color: "red" },
          ].map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card rounded-[2rem] p-6 flex flex-col gap-4 border-white/5 hover:border-white/10 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                {m.icon}
              </div>
              <div className="space-y-1">
                <p className="text-xs text-white/40 uppercase font-black tracking-widest">{m.label}</p>
                <p className={cn("text-2xl font-display font-bold", `text-${m.color}-400`)}>{m.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Global Obligation Matrix */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-12 p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 glass-card relative overflow-hidden"
        >
           <div className="flex items-center justify-between mb-8">
             <div>
               <h2 className="text-xl font-display font-bold text-white">Evaluated Obligation Matrix</h2>
               <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mt-1">Foundational data for simulation</p>
             </div>
             <div className="px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-tight">Active Matrix v1.2</span>
             </div>
           </div>
           
           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
             {sim.obligations.map((o) => (
               <div key={o.id} className="p-4 bg-black/40 border border-white/5 rounded-2xl flex flex-col items-center text-center group hover:bg-white/5 transition-all">
                 <span className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-2 flex items-center gap-1">
                   Day {o.dueDay} 
                   <span className="w-1 h-1 rounded-full bg-red-400" />
                   R{o.riskWeight}
                 </span>
                 <span className="text-xs font-bold text-white truncate w-full mb-1">{o.vendor}</span>
                 <span className="text-xs text-amber-400 font-black">{formatCurrency(o.amount)}</span>
               </div>
             ))}
           </div>
        </motion.div>

        {/* Scenarios Grid */}
        <div className="space-y-12 mb-20">
          {sim.scenarios.map((sc, index) => {
            const isOptimal = sc.isOptimal;
            return (
              <motion.div 
                key={sc.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className={cn(
                  "rounded-[3rem] border p-8 lg:p-12 relative overflow-hidden glass-card transition-all duration-700",
                  isOptimal ? "bg-emerald-500/[0.03] border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.05)]" : "bg-white/[0.02] border-white/5"
                )}
              >
                {/* Optimal Background Glow */}
                {isOptimal && (
                  <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] pointer-events-none rounded-full" />
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
                  {/* Left Analysis Panel */}
                  <div className="lg:col-span-4 flex flex-col pt-4">
                    <div className="mb-10">
                      <div className="flex items-center gap-4 mb-4">
                        <h2 className={cn("text-3xl font-display font-bold", isOptimal ? "text-emerald-400" : "text-white")}>
                          {sc.name}
                        </h2>
                        {isOptimal && (
                          <div className="px-3 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-black tracking-widest uppercase shadow-[0_0_20px_rgba(16,185,129,0.3)] border border-emerald-400/50">
                            Optimal
                          </div>
                        )}
                      </div>
                      
                      <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                        <p className="text-sm text-white/70 leading-relaxed italic">
                          <span className="text-emerald-400 font-black uppercase text-[10px] block mb-2 tracking-widest">Algorithm Reasoning</span>
                          “{sc.description}”
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-10">
                      <div className="p-4 rounded-3xl bg-black/40 border border-white/5">
                        <p className="text-[10px] text-white/30 uppercase font-black tracking-[0.2em] mb-2">Stability</p>
                        <p className={cn("text-2xl font-display font-black", sc.riskLossMinimization > 75 ? "text-emerald-400" : "text-amber-400")}>{sc.riskLossMinimization}%</p>
                      </div>
                      <div className="p-4 rounded-3xl bg-black/40 border border-white/5">
                        <p className="text-[10px] text-white/30 uppercase font-black tracking-[0.2em] mb-2">Runway</p>
                        <p className="text-2xl font-display font-black text-blue-400">+{sc.runwayAddedDays}D</p>
                      </div>
                    </div>

                    <div className="p-6 rounded-3xl bg-blue-500/[0.03] border border-blue-500/10">
                        <p className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Deferred Logic ({sc.coverage}% Coverage)
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {sim.obligations.filter(o => sc.selectedObligations.includes(o.id)).map(o => (
                            <span key={o.id} className="text-[11px] font-bold text-blue-200 bg-blue-500/10 px-3 py-1.5 rounded-xl border border-blue-500/20">
                              {o.vendor}
                            </span>
                          ))}
                        </div>
                    </div>
                  </div>

                  {/* Right Visualization Panel */}
                  <div className="lg:col-span-8 h-[450px] relative rounded-3xl overflow-hidden bg-black/40 border border-white/5">
                    <SimulatorChart data={sim.chartData} activeScenarioId={sc.id} />
                    <div className="absolute bottom-6 right-6 flex items-center gap-6">
                       <div className="flex items-center gap-2">
                          <div className="w-8 h-1 bg-red-400/30 border-t border-red-400 border-dashed" />
                          <span className="text-[10px] text-white/40 uppercase font-black tracking-widest">Base Burn</span>
                       </div>
                       <div className="flex items-center gap-2">
                          <div className="w-8 h-1 bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                          <span className="text-[10px] text-white/40 uppercase font-black tracking-widest">Simulation</span>
                       </div>
                    </div>
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
