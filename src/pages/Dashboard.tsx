import { AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { useSimulator } from "@/hooks/use-simulator";
import { formatCurrency, cn } from "@/lib/utils";
import { Sidebar } from "@/components/Sidebar";
import { SimulatorChart } from "@/components/SimulatorChart";
import { ActionPanel } from "@/components/ActionPanel";
import { PriorityMatrix } from "@/components/PriorityMatrix";
import { CounterpartyList } from "@/components/CounterpartyList";
import { NegotiationHub } from "@/components/NegotiationHub";
import { IngestionZone } from "@/components/IngestionZone";

export default function Dashboard() {
  const sim = useSimulator();

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Background Image Mesh */}
      <div 
        className="fixed inset-0 z-0 opacity-40 pointer-events-none mix-blend-screen"
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/bg-mesh.png)`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      />

      <Sidebar />

      <main className="flex-1 lg:ml-64 p-4 lg:p-8 relative z-10">
        
        {/* Emergency Alert Banner */}
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: sim.currentDTZ < 7 ? 'auto' : 0, opacity: sim.currentDTZ < 7 ? 1 : 0 }}
          className="overflow-hidden"
        >
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3 backdrop-blur-md">
            <AlertTriangle className="text-red-400 w-6 h-6 animate-pulse" />
            <p className="text-red-200 text-sm font-medium">
              <strong className="text-red-400 font-bold tracking-wider">CRITICAL ALERT:</strong> Cash reserves projected to exhaust in {sim.currentDTZ} days. Immediate optimization required.
            </p>
          </div>
        </motion.div>

        {/* Top Liquidity Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <svg className="w-16 h-16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
            </div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Current Cash Balance</h3>
            <p className="text-4xl font-display font-bold text-white">
              {formatCurrency(sim.currentBalance)}
            </p>
            <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Verified via Plaid (1m ago)
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-6 border-amber-500/20"
          >
            <h3 className="text-sm font-medium text-amber-500/80 mb-1">Next Critical Obligation</h3>
            <p className="text-2xl font-display font-semibold text-white truncate">Rent (HQ)</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-amber-400 font-bold">$8,500</span>
              <span className="text-xs px-2 py-1 rounded bg-amber-500/20 text-amber-300">Due in 3 days</span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className={cn(
              "glass-card rounded-2xl p-6 flex items-center gap-6",
              sim.currentDTZ < 7 ? "border-red-500/30 bg-red-500/5" : "border-emerald-500/20"
            )}
          >
            {/* Circular Progress Ring */}
            <div className="relative w-20 h-20 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                <motion.path 
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                  fill="none" 
                  stroke={sim.currentDTZ < 7 ? "#ef4444" : "#10b981"} 
                  strokeWidth="3" 
                  strokeDasharray={`${Math.min(100, (sim.currentDTZ / 30) * 100)}, 100`}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={cn("text-2xl font-display font-bold leading-none", sim.currentDTZ < 7 ? "text-red-400" : "text-emerald-400")}>{sim.currentDTZ}</span>
                <span className="text-[10px] text-white/60">Days</span>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Days to Zero (DTZ)</h3>
              <p className="text-xs text-white/80 mt-1 leading-relaxed">
                Runway extended by <span className="text-emerald-400 font-bold">+{sim.currentDTZ - sim.baseDTZ} days</span> via active strategies.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Bento Grid Main */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Simulator Chart (Left, Span 2) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
            className="lg:col-span-2 glass-card rounded-2xl p-6 h-[400px]"
          >
            <SimulatorChart data={sim.chartData} activeScenarioId={sim.activeScenarioId} />
          </motion.div>

          {/* Action Control Panel (Right, Span 1) */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
            className="lg:col-span-1 glass-card rounded-2xl p-6 h-[400px]"
          >
            <ActionPanel scenarios={sim.scenarios} activeScenarioId={sim.activeScenarioId} onSelect={sim.setActiveScenarioId} netImpact={sim.netImpact} />
          </motion.div>
        </div>

        {/* Bottom Bento Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
          {/* Priority Matrix */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="lg:col-span-2 xl:col-span-2 glass-card rounded-2xl p-6"
          >
            <PriorityMatrix />
          </motion.div>

          {/* Counterparty Profiles */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            className="glass-card rounded-2xl p-6"
          >
            <CounterpartyList />
          </motion.div>

          {/* Ingestion Zone */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
            className="lg:col-span-3 xl:col-span-1"
          >
            <IngestionZone />
          </motion.div>
        </div>

        {/* Negotiation Hub */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
          className="mb-8"
        >
          {sim.activeScenarioId === 'S0' && (
            <NegotiationHub />
          )}
        </motion.div>

      </main>
    </div>
  );
}
