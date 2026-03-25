import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/utils";

const COUNTERPARTIES = [
  { name: "Acme Corp", tier: "Strategic", color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20", amount: 45000 },
  { name: "City Landlord", tier: "Utility", color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20", amount: 8500 },
  { name: "Tax Authority", tier: "Compliance", color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20", amount: 0 },
  { name: "Global Supplies", tier: "Partnership", color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20", amount: 12000 },
];

export function CounterpartyList() {
  return (
    <div className="h-full">
      <h3 className="text-lg font-display font-semibold text-white mb-4">Counterparty Profiles</h3>
      <div className="flex flex-col gap-3">
        {COUNTERPARTIES.map((cp, idx) => (
          <motion.div 
            key={cp.name}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 + 0.4 }}
            className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center font-bold text-xs text-white">
                {cp.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{cp.name}</p>
                <div className={`inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold border ${cp.bg} ${cp.color} ${cp.border}`}>
                  {cp.tier}
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-white">{cp.amount ? formatCurrency(cp.amount) : "Varies"}</p>
              <p className="text-[10px] text-muted-foreground">/mo avg</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
