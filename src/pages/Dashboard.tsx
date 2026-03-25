import { AlertTriangle, TrendingDown, Wallet, Zap, Calendar, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { useSimulator } from "@/hooks/use-simulator";
import { formatCurrency, cn } from "@/lib/utils";
import { Sidebar } from "@/components/Sidebar";
import { CashFlowTimeline } from "@/components/CashFlowTimeline";

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

      {/* Dashboard is focused ONLY on Metrics and Timeline now */}
      <main className="flex-1 lg:ml-80 p-4 lg:p-10 relative z-10 transition-all duration-300">
        
        {/* Emergency Alert Banner */}
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: sim.currentDTZ < 7 ? 'auto' : 0, opacity: sim.currentDTZ < 7 ? 1 : 0 }}
          className="overflow-hidden"
        >
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3 backdrop-blur-md">
            <AlertTriangle className="text-red-400 w-6 h-6 animate-pulse" />
            <p className="text-red-200 text-sm font-medium">
              <strong className="text-red-400 font-bold tracking-wider">CRITICAL ALERT:</strong> Liquidity crisis triggered. Runway estimated at {sim.currentDTZ} days.
            </p>
          </div>
        </motion.div>

        {/* Primary Metrics Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-3xl p-8 relative overflow-hidden border-white/5"
          >
            <div className="absolute top-0 right-0 p-6 opacity-5">
              <Wallet className="w-16 h-16" />
            </div>
            <h3 className="text-[10px] font-black text-muted-foreground m-b-2 uppercase tracking-[0.2em]">Cash Balance</h3>
            <p className="text-4xl font-display font-bold text-white tracking-tighter">
              {formatCurrency(sim.currentBalance)}
            </p>
            <div className="mt-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Live Sync Auto</span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="glass-card rounded-3xl p-8 border-amber-500/10"
          >
            <h3 className="text-[10px] font-black text-amber-500/60 mb-2 uppercase tracking-[0.2em]">Next Critical Ob</h3>
            <p className="text-2xl font-display font-bold text-white truncate">HQ Lease Renewal</p>
            <div className="flex items-center gap-3 mt-4">
              <span className="text-xl font-black text-amber-400">$8,500</span>
              <span className="text-[10px] px-2 py-1 rounded-full bg-amber-500/10 text-amber-400 font-black border border-amber-500/20">T-MINUS 3d</span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="glass-card rounded-3xl p-8 border-emerald-500/10"
          >
            <h3 className="text-[10px] font-black text-emerald-400/60 mb-2 uppercase tracking-[0.2em]">Days to Zero</h3>
            <p className={cn("text-4xl font-display font-bold tabular-nums", sim.currentDTZ < 7 ? "text-red-400" : "text-emerald-400")}>
              {sim.currentDTZ} Days
            </p>
            <div className="mt-4 flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-emerald-400" />
                <span className="text-[10px] text-emerald-400/80 font-bold">+{sim.currentDTZ - sim.baseDTZ} day extension active</span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="glass-card rounded-3xl p-8 border-red-500/10"
          >
            <h3 className="text-[10px] font-black text-red-500/60 mb-2 uppercase tracking-[0.2em]">Daily Burn Rate</h3>
            <p className="text-4xl font-display font-bold text-white tabular-nums">
              {formatCurrency(850)}
            </p>
            <div className="mt-4 flex items-center gap-2">
               <TrendingDown className="w-4 h-4 text-red-400" />
               <span className="text-[10px] text-red-400 font-bold uppercase tracking-widest">+5% MOM</span>
            </div>
          </motion.div>
        </div>

        {/* CASH FLOW TIMELINE (MOST IMPORTANT VISUAL) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="glass-card rounded-[2rem] p-10 border-white/5 min-h-[650px] flex flex-col shadow-2xl overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none">
             <Activity className="w-96 h-96 text-white" />
          </div>
          <CashFlowTimeline data={sim.chartData} />
        </motion.div>

      </main>
    </div>
  );
}
