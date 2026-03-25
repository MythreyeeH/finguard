import { useState } from "react";
import { Home, Calculator, Truck, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn, formatCurrency } from "@/lib/utils";

const OBLIGATIONS = [
  {
    id: 1,
    title: "Rent (HQ)",
    amount: 8500,
    icon: Home,
    score: 9.2,
    color: "red",
    reasoning: "High priority: 10% late fee applies after Day 3. Legal risk of default is severe. Non-negotiable utility.",
    due: "In 3 Days"
  },
  {
    id: 2,
    title: "Tax Q2 Estimate",
    amount: 14200,
    icon: Calculator,
    score: 6.5,
    color: "amber",
    reasoning: "Medium priority: Deferral possible via IRS extension form 4868. Low immediate penalty but accrues interest.",
    due: "In 12 Days"
  },
  {
    id: 3,
    title: "Supplier B Invoice",
    amount: 5000,
    icon: Truck,
    score: 3.8,
    color: "emerald",
    reasoning: "Low priority: Supplier B has 'Strategic' relationship tier. 14-day grace period available without penalties.",
    due: "In 5 Days"
  }
];

export function PriorityMatrix() {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="h-full">
      <h3 className="text-lg font-display font-semibold text-white mb-4">Obligation Priority Matrix</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {OBLIGATIONS.map((ob, idx) => (
          <motion.div
            key={ob.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 + 0.3 }}
            className={cn(
              "relative glass-card rounded-xl p-5 overflow-hidden group hover:-translate-y-1 transition-transform duration-300",
              expandedId === ob.id ? "ring-1 ring-white/20" : ""
            )}
          >
            {/* Background Glow */}
            <div className={cn(
              "absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[50px] opacity-20 transition-opacity duration-500",
              ob.color === "red" ? "bg-red-500" : ob.color === "amber" ? "bg-amber-500" : "bg-emerald-500",
              expandedId === ob.id ? "opacity-40" : "group-hover:opacity-30"
            )} />

            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className={cn(
                "p-2.5 rounded-lg border",
                ob.color === "red" ? "bg-red-500/10 border-red-500/20 text-red-400" : 
                ob.color === "amber" ? "bg-amber-500/10 border-amber-500/20 text-amber-400" : 
                "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              )}>
                <ob.icon className="w-5 h-5" />
              </div>
              <div className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full border-2 font-display font-bold text-sm",
                ob.color === "red" ? "border-red-500/50 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.3)]" : 
                ob.color === "amber" ? "border-amber-500/50 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.3)]" : 
                "border-emerald-500/50 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
              )}>
                {ob.score}
              </div>
            </div>

            <div className="relative z-10">
              <h4 className="text-white font-medium">{ob.title}</h4>
              <p className="text-2xl font-display font-bold text-white mt-1">{formatCurrency(ob.amount)}</p>
              <p className="text-xs text-muted-foreground mt-1">Due {ob.due}</p>
            </div>

            <button 
              onClick={() => toggleExpand(ob.id)}
              className="mt-4 flex items-center justify-between w-full text-xs font-medium text-white/60 hover:text-white transition-colors relative z-10"
            >
              <span>View Reasoning</span>
              {expandedId === ob.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            <AnimatePresence>
              {expandedId === ob.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0, marginTop: 0 }}
                  animate={{ height: "auto", opacity: 1, marginTop: 12 }}
                  exit={{ height: 0, opacity: 0, marginTop: 0 }}
                  className="overflow-hidden relative z-10"
                >
                  <div className="p-3 rounded-lg bg-black/40 border border-white/5 text-xs text-white/80 leading-relaxed">
                    <span className="text-emerald-400 mr-1 font-semibold">AI:</span> 
                    {ob.reasoning}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
