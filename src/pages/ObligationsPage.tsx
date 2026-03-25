import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Plus, Search, Filter, Home, Calculator, Truck, Zap, CreditCard, Building, ChevronDown, ChevronUp, AlertCircle, CheckCircle, Clock, X } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { cn, formatCurrency } from "@/lib/utils";
import { useObligations, Obligation as DbObligation } from "@/hooks/use-obligations";
import { differenceInDays, parseISO } from "date-fns";

type Status = "overdue" | "due-soon" | "upcoming" | "paid";
type Priority = "critical" | "high" | "medium" | "low";

type Obligation = {
  id: number;
  name: string;
  amount: number;
  dueDate: string;
  dueDays: number;
  category: string;
  icon: any;
  score: number;
  priority: Priority;
  status: Status;
  counterparty: string;
  penaltyRate?: string;
  notes: string;
  canDefer: boolean;
};

const CATEGORY_ICONS: Record<string, any> = {
  "Real Estate": Home,
  "Compliance": Calculator,
  "Vendor": Truck,
  "Technology": Zap,
  "Finance": CreditCard,
  "HR": CheckCircle,
  "Legal": ShieldAlert,
  "Utility": Building
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  overdue: { label: "Overdue", color: "text-red-400", bg: "bg-red-500/20 border-red-500/30", icon: AlertCircle },
  "due-soon": { label: "Due Soon", color: "text-amber-400", bg: "bg-amber-500/20 border-amber-500/30", icon: Clock },
  upcoming: { label: "Upcoming", color: "text-blue-400", bg: "bg-blue-500/20 border-blue-500/30", icon: Clock },
  paid: { label: "Paid", color: "text-emerald-400", bg: "bg-emerald-500/20 border-emerald-500/30", icon: CheckCircle },
  pending: { label: "Pending", color: "text-slate-400", bg: "bg-slate-500/20 border-slate-500/30", icon: Clock },
  verified: { label: "Verified", color: "text-emerald-400", bg: "bg-emerald-500/20 border-emerald-500/30", icon: CheckCircle },
  flagged: { label: "Flagged", color: "text-red-400", bg: "bg-red-500/20 border-red-500/30", icon: AlertCircle },
};

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string }> = {
  critical: { label: "Critical", color: "text-red-400" },
  high: { label: "High", color: "text-amber-400" },
  medium: { label: "Medium", color: "text-blue-400" },
  low: { label: "Low", color: "text-emerald-400" },
};

export default function ObligationsPage() {
  const { obligations: dbObligations, loading, addObligation, error: dbError } = useObligations();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Priority | "all">("all");
  const [sortBy, setSortBy] = useState<"score" | "amount" | "days">("score");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Map database obligations to local UI format
  const obligations = dbObligations.map(o => ({
    ...o,
    dueDays: differenceInDays(parseISO(o.dueDate), new Date()),
    icon: CATEGORY_ICONS[o.category] || Building,
    canDefer: o.canDeferText !== "None"
  }));

  const totalDue = obligations.reduce((s, o) => s + o.amount, 0);
  const criticalCount = obligations.filter((o) => o.priority === "critical").length;

  const filtered = obligations.filter((o) => {
    const matchSearch = o.name.toLowerCase().includes(search.toLowerCase()) || o.counterparty.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || o.priority === filter;
    return matchSearch && matchFilter;
  }).sort((a, b) => {
    if (sortBy === "score") return b.score - a.score;
    if (sortBy === "amount") return b.amount - a.amount;
    return (a.dueDays || 0) - (b.dueDays || 0);
  });

  const [newObligation, setNewObligation] = useState({
    name: "",
    counterparty: "",
    amount: "",
    dueDate: "",
    category: "Finance"
  });

  const handleAdd = async () => {
    if (!newObligation.name || !newObligation.amount || !newObligation.dueDate) return;
    
    const res = await addObligation({
      name: newObligation.name,
      counterparty: newObligation.counterparty || "Unknown",
      amount: parseFloat(newObligation.amount),
      dueDate: newObligation.dueDate,
      category: newObligation.category,
      status: "upcoming",
      priority: "medium",
      score: 5.0,
      notes: "Manually added obligation.",
      canDeferText: "Available",
    });

    if (res.success) {
      setShowAddModal(false);
      setNewObligation({ name: "", counterparty: "", amount: "", dueDate: "", category: "Finance" });
    } else {
      alert("Failed to add obligation: " + res.error);
    }
  };

  if (loading) {
     return (
       <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
       </div>
     );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <div className="fixed inset-0 z-0 opacity-40 pointer-events-none mix-blend-screen"
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/bg-mesh.png)`, backgroundSize: "cover" }} />
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-6 lg:p-8 relative z-10">
        {/* Header (Same) */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-red-400" />
              </div>
              <h1 className="text-2xl font-bold text-white">Obligations</h1>
            </div>
            <p className="text-sm text-muted-foreground ml-12">Track, prioritize, and manage all financial obligations.</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_28px_rgba(16,185,129,0.5)] transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Obligation
          </button>
        </motion.div>

        {/* ... (Summary Cards, Filters - Same logic) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Obligations", value: formatCurrency(totalDue), sub: `${obligations.length} items`, color: "blue" },
            { label: "Critical Priority", value: `${criticalCount} items`, sub: "Immediate action needed", color: "red" },
            { label: "Due in 7 Days", value: formatCurrency(obligations.filter(o => o.dueDays <= 7).reduce((s, o) => s + o.amount, 0)), sub: `${obligations.filter(o => o.dueDays <= 7).length} obligations`, color: "amber" },
            { label: "Deferrable Amount", value: formatCurrency(obligations.filter(o => o.canDefer).reduce((s, o) => s + o.amount, 0)), sub: "With negotiation", color: "emerald" },
          ].map((c, i) => (
            <motion.div key={c.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="glass-card rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-1">{c.label}</p>
              <p className={cn("text-xl font-bold", c.color === "red" ? "text-red-400" : c.color === "amber" ? "text-amber-400" : c.color === "emerald" ? "text-emerald-400" : "text-blue-400")}>{c.value}</p>
              <p className="text-xs text-white/40 mt-0.5">{c.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* ... (Filter section - Same) */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="glass-card rounded-xl p-4 mb-6 flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-white/5 rounded-lg px-3 py-2 border border-white/10">
            <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <input
              type="text"
              placeholder="Search obligations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm text-white placeholder:text-white/30 outline-none w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            {(["all", "critical", "high", "medium", "low"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize",
                  filter === f ? "bg-white/15 text-white" : "text-white/50 hover:bg-white/8 hover:text-white"
                )}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-muted-foreground">Sort:</span>
            {(["score", "amount", "days"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize",
                  sortBy === s ? "bg-white/15 text-white" : "text-white/50 hover:bg-white/8 hover:text-white"
                )}
              >
                {s === "days" ? "Due Date" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ... (Table UI - Same) */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="text-left text-xs text-muted-foreground font-medium px-5 py-3.5">Obligation</th>
                  <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3.5 hidden md:table-cell">Category</th>
                  <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3.5">Amount</th>
                  <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3.5 hidden lg:table-cell">Due Date</th>
                  <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3.5 hidden lg:table-cell">Priority Score</th>
                  <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3.5">Status</th>
                  <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3.5 hidden xl:table-cell">Deferrable</th>
                  <th className="px-4 py-3.5" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((ob, idx) => {
                  const status = STATUS_CONFIG[ob.status];
                  const priority = PRIORITY_CONFIG[ob.priority];
                  const isExpanded = expandedId === ob.id;
                  const IconComp = ob.icon || Building;
                  return (
                    <React.Fragment key={ob.id}>
                      <motion.tr
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={cn("border-b border-white/5 hover:bg-white/3 transition-colors cursor-pointer", isExpanded && "bg-white/5")}
                        onClick={() => setExpandedId(isExpanded ? null : ob.id)}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                              <IconComp className="w-4 h-4 text-white/60" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{ob.name}</p>
                              <p className="text-xs text-muted-foreground">{ob.counterparty}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 hidden md:table-cell">
                          <span className="text-xs text-white/60 px-2 py-1 rounded-md bg-white/5 border border-white/8">{ob.category}</span>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm font-bold text-white">{formatCurrency(ob.amount)}</p>
                        </td>
                        <td className="px-4 py-4 hidden lg:table-cell">
                          <p className="text-sm text-white/80">{ob.dueDate}</p>
                          <p className={cn("text-xs font-medium", ob.dueDays <= 3 ? "text-red-400" : ob.dueDays <= 7 ? "text-amber-400" : "text-white/40")}>in {ob.dueDays}d</p>
                        </td>
                        <td className="px-4 py-4 hidden lg:table-cell">
                          <div className="flex items-center gap-2">
                            <div className={cn("w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold",
                              ob.score >= 8 ? "border-red-500/60 text-red-400" : ob.score >= 5 ? "border-amber-500/60 text-amber-400" : "border-emerald-500/60 text-emerald-400"
                            )}>
                              {ob.score}
                            </div>
                            <span className={cn("text-xs font-medium", priority.color)}>{priority.label}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={cn("flex items-center gap-1.5 w-fit px-2 py-1 rounded-full border text-xs font-medium", status?.bg || "bg-white/5", status?.color || "text-white")}>
                            {status?.icon && <status.icon className="w-3 h-3" />}
                            {status?.label || ob.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 hidden xl:table-cell">
                          {ob.canDefer
                            ? <span className="text-xs text-emerald-400 font-medium">✓ Yes</span>
                            : <span className="text-xs text-red-400/70">✗ No</span>}
                        </td>
                        <td className="px-4 py-4">
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/20" />}
                        </td>
                      </motion.tr>
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.tr
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            <td colSpan={8} className="px-5 pb-5 pt-0 bg-white/3 border-b border-white/5">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                                <div className="p-4 rounded-xl bg-black/30 border border-white/8">
                                  <p className="text-xs text-muted-foreground mb-1">Penalty Rate</p>
                                  <p className="text-sm font-semibold text-white">{ob.penaltyRate ?? "None"}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-black/30 border border-white/8 md:col-span-2">
                                  <p className="text-xs text-emerald-400 font-semibold mb-1 flex items-center gap-1">
                                    <span>AI Reasoning</span>
                                  </p>
                                  <p className="text-sm text-white/80 leading-relaxed">{ob.notes}</p>
                                </div>
                              </div>
                              {ob.canDefer && (
                                <button className="mt-3 flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 text-xs font-medium transition-all">
                                  Draft Deferral Request →
                                </button>
                              )}
                            </td>
                          </motion.tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Add Obligation Modal */}
        <AnimatePresence>
          {showAddModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
              onClick={() => setShowAddModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="glass-card rounded-2xl p-6 w-full max-w-md"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Add New Obligation</h3>
                  <button onClick={() => setShowAddModal(false)} className="text-white/40 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1.5">Obligation Name</label>
                    <input
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-emerald-500/50 transition-colors"
                      placeholder="e.g. Office Rent"
                      value={newObligation.name}
                      onChange={(e) => setNewObligation({ ...newObligation, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1.5">Counterparty</label>
                    <input
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-emerald-500/50 transition-colors"
                      placeholder="e.g. City Landlord LLC"
                      value={newObligation.counterparty}
                      onChange={(e) => setNewObligation({ ...newObligation, counterparty: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1.5">Amount ($)</label>
                    <input
                      type="number"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-emerald-500/50 transition-colors"
                      placeholder="0.00"
                      value={newObligation.amount}
                      onChange={(e) => setNewObligation({ ...newObligation, amount: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1.5">Due Date</label>
                    <input
                      type="date"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-emerald-500/50 transition-colors"
                      value={newObligation.dueDate}
                      onChange={(e) => setNewObligation({ ...newObligation, dueDate: e.target.value })}
                    />
                  </div>
                  <button
                    onClick={handleAdd}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold mt-2 active:scale-[0.98] transition-all"
                  >
                    Add Obligation
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
