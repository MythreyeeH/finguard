import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/Sidebar";
import { DecisionEngine, Scenario } from "@/components/DecisionEngine";
import { ExplanationPanel } from "@/components/ExplanationPanel";
import { ActionPanel } from "@/components/ActionPanel";
import { NegotiationHub } from "@/components/NegotiationHub";
import { Zap, ChevronRight } from "lucide-react";

const STRATEGIES: Scenario[] = [
  {
    id: "greedy",
    name: "Greedy Approach",
    runway: "5 days",
    coverage: "60%",
    penalty: "High",
    score: 0.60,
    description: "Prioritizes immediate cash savings but incurs significant late fees and relationship damage."
  },
  {
    id: "knapsack",
    name: "Knapsack (Optimal)",
    runway: "10 days",
    coverage: "80%",
    penalty: "Low",
    score: 0.90,
    description: "Highly optimized selection of payments to defer. Minimizes penalties while maximizing available runway. This plan was selected because it extends runway by 5 days while minimizing penalties. Rent was prioritized due to high urgency and legal risk, while supplier payments were delayed."
  },
  {
    id: "small-first",
    name: "Small-First",
    runway: "7 days",
    coverage: "75%",
    penalty: "Medium",
    score: 0.75,
    description: "Clears small obligations first to reduce the number of creditors, but may miss critical large payments."
  }
];

export default function ActionsPage() {
  const [activeScenarioId, setActiveScenarioId] = useState("knapsack");
  const [showNegotiation, setShowNegotiation] = useState(false);

  const activeScenario = STRATEGIES.find(s => s.id === activeScenarioId) || STRATEGIES[1];

  const handleAction = (actionId: string) => {
    if (actionId === "email") {
      setShowNegotiation(true);
      // Wait for the next tick to scroll to the negotiation section
      setTimeout(() => {
        document.getElementById("negotiation-section")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <div 
        className="fixed inset-0 z-0 opacity-40 pointer-events-none mix-blend-screen"
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/bg-mesh.png)`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      />

      <Sidebar />

      <main className="flex-1 lg:ml-80 p-6 lg:p-10 relative z-10 transition-all duration-500">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-[1.25rem] bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-display font-bold text-white tracking-tight">Strategic Actions Center</h1>
                <p className="text-muted-foreground text-sm mt-1 uppercase font-black tracking-[0.2em] opacity-60">Think. Reason. Execute.</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="h-10 px-4 rounded-xl bg-white/5 border border-white/10 flex items-center text-xs font-bold text-white/50 gap-2">
                <span>Last optimized</span>
                <span className="text-emerald-400">2 minutes ago</span>
             </div>
          </div>
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-12">
          {/* Decision Engine Column */}
          <div className="xl:col-span-2 space-y-8">
            <div className="glass-card rounded-[2.5rem] p-8 border-white/5 shadow-2xl relative overflow-hidden h-full">
              <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
                <Zap className="w-96 h-96 text-white" />
              </div>
              <DecisionEngine 
                scenarios={STRATEGIES} 
                activeScenarioId={activeScenarioId} 
                onSelect={setActiveScenarioId} 
              />
            </div>
          </div>

          {/* Reasoning & Execution Sidebar */}
          <div className="xl:col-span-1 space-y-8">
            {/* Explanation Panel */}
            <div className="glass-card rounded-[2.5rem] p-8 border-white/5 shadow-xl">
               <ExplanationPanel explanation={activeScenario.description} />
            </div>

            {/* Action Panel */}
            <div className="glass-card rounded-[2.5rem] p-8 border-white/5 shadow-xl bg-emerald-500/[0.02]">
               <ActionPanel onAction={handleAction} />
            </div>
          </div>
        </div>

        {/* Negotiation Section (Appears when action triggered) */}
        <AnimatePresence>
          {showNegotiation && (
            <motion.div 
              id="negotiation-section"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-12 space-y-6 pt-12 border-t border-white/5"
            >
              <div className="flex items-center gap-3 px-4">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Active Workflow</span>
                <ChevronRight className="w-4 h-4 text-white/20" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">Negotiation Drafting</span>
              </div>
              <div className="glass-card rounded-[3rem] p-1 border-white/5 shadow-2xl">
                 <NegotiationHub />
              </div>
              <div className="flex justify-center pt-8">
                 <button 
                   onClick={() => setShowNegotiation(false)}
                   className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 hover:text-white transition-colors"
                 >
                   Dismiss Workflow
                 </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
