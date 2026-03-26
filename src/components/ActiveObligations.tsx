import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, Calendar, Tag } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";

interface Obligation {
  id: string;
  counterparty: string;
  amount: number;
  due_date?: string;
  date?: string;
  category: string;
}

interface ActiveObligationsProps {
  payables: Obligation[];
  receivables: Obligation[];
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    // Try to fix common weird formats or just return the raw string if short
    return dateStr.slice(0, 10);
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function ActiveObligations({ payables, receivables }: ActiveObligationsProps) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-10">
      {/* Payables Section */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2 mb-4 px-2">
          <ArrowDownRight className="w-5 h-5 text-red-400" />
          <h2 className="text-sm font-black text-red-400 uppercase tracking-widest">Upcoming Outflows (Payables)</h2>
        </div>
        <div className="space-y-3">
          {payables.length > 0 ? payables.slice(0, 5).map((p, i) => (
            <motion.div 
              key={p.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card rounded-2xl p-4 flex items-center justify-between border-red-500/10 hover:border-red-500/30 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
                  <ArrowDownRight className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white tracking-tight">{p.counterparty}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <Calendar className="w-3 h-3" /> {formatDate(p.due_date || p.date)}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-white/40 uppercase font-black tracking-tighter">
                    <Tag className="w-3 h-3" /> {p.category}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-lg font-black text-red-400 tracking-tighter">
              -{formatCurrency(Math.abs(p.amount))}
            </p>
            </motion.div>
          )) : (
            <p className="text-xs text-white/20 italic p-4 text-center">No upcoming payables</p>
          )}
        </div>
      </div>

      {/* Receivables Section */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2 mb-4 px-2">
          <ArrowUpRight className="w-5 h-5 text-emerald-400" />
          <h2 className="text-sm font-black text-emerald-400 uppercase tracking-widest">Expected Inflows (Receivables)</h2>
        </div>
        <div className="space-y-3">
          {receivables.length > 0 ? receivables.slice(0, 5).map((r, i) => (
            <motion.div 
              key={r.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card rounded-2xl p-4 flex items-center justify-between border-emerald-500/10 hover:border-emerald-500/30 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white tracking-tight">{r.counterparty}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <Calendar className="w-3 h-3" /> {formatDate(r.due_date || r.date)}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-white/40 uppercase font-black tracking-tighter">
                    <Tag className="w-3 h-3" /> {r.category}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-lg font-black text-emerald-400 tracking-tighter">
              +{formatCurrency(Math.abs(r.amount))}
            </p>
            </motion.div>
          )) : (
            <p className="text-xs text-white/20 italic p-4 text-center">No upcoming receivables</p>
          )}
        </div>
      </div>
    </div>
  );
}
