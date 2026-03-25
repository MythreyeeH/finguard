import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Plus, Search, Filter, Home, Calculator, Truck, Zap, CreditCard, Building, ChevronDown, ChevronUp, AlertCircle, CheckCircle, Clock, X } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { cn, formatCurrency } from "@/lib/utils";

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

const OBLIGATIONS: Obligation[] = [
  { id: 1, name: "Office Rent (HQ)", amount: 8500, dueDate: "Mar 28, 2026", dueDays: 3, category: "Real Estate", icon: Home, score: 9.2, priority: "critical", status: "due-soon", counterparty: "City Landlord LLC", penaltyRate: "10%", notes: "Late fee applies after Day 3. No deferral option.", canDefer: false },
  { id: 2, name: "Q2 Tax Estimate", amount: 14200, dueDate: "Apr 6, 2026", dueDays: 12, category: "Compliance", icon: Calculator, score: 6.5, priority: "high", status: "upcoming", counterparty: "IRS", penaltyRate: "0.5%/mo", notes: "Extension possible via Form 4868. Low immediate risk.", canDefer: true },
  { id: 3, name: "Supplier B Invoice #2847", amount: 5000, dueDate: "Mar 30, 2026", dueDays: 5, category: "Vendor", icon: Truck, score: 3.8, priority: "low", status: "upcoming", counterparty: "Global Supplies Co.", penaltyRate: "None", notes: "Strategic tier supplier. 14-day grace period available.", canDefer: true },
  { id: 4, name: "Cloud Infrastructure", amount: 3200, dueDate: "Apr 1, 2026", dueDays: 7, category: "Technology", icon: Zap, score: 7.1, priority: "high", status: "upcoming", counterparty: "AWS", penaltyRate: "Service cut", notes: "Risk of service interruption if unpaid. Critical infrastructure.", canDefer: false },
  { id: 5, name: "Business Credit Card", amount: 2100, dueDate: "Mar 26, 2026", dueDays: 1, category: "Finance", icon: CreditCard, score: 8.4, priority: "critical", status: "due-soon", counterparty: "Chase Business", penaltyRate: "25% APR", notes: "Minimum payment due tomorrow. High interest rate.", canDefer: false },
  { id: 6, name: "Office Lease (Branch)", amount: 4200, dueDate: "Apr 15, 2026", dueDays: 21, category: "Real Estate", icon: Building, score: 5.0, priority: "medium", status: "upcoming", counterparty: "Metro Properties", penaltyRate: "5%", notes: "Secondary office. Can negotiate 30-day extension.", canDefer: true },
  { id: 7, name: "Payroll Run", amount: 32500, dueDate: "Mar 31, 2026", dueDays: 6, category: "HR", icon: CheckCircle, score: 10.0, priority: "critical", status: "due-soon", counterparty: "Staff (15 employees)", penaltyRate: "Legal risk", notes: "Non-negotiable. Payroll must clear on time.", canDefer: false },
];

const STATUS_CONFIG: Record<Status, { label: string; color: string; bg: string; icon: any }> = {
  overdue: { label: "Overdue", color: "text-red-400", bg: "bg-red-500/20 border-red-500/30", icon: AlertCircle },
  "due-soon": { label: "Due Soon", color: "text-amber-400", bg: "bg-amber-500/20 border-amber-500/30", icon: Clock },
  upcoming: { label: "Upcoming", color: "text-blue-400", bg: "bg-blue-500/20 border-blue-500/30", icon: Clock },
  paid: { label: "Paid", color: "text-emerald-400", bg: "bg-emerald-500/20 border-emerald-500/30", icon: CheckCircle },
};

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string }> = {
  critical: { label: "Critical", color: "text-red-400" },
  high: { label: "High", color: "text-amber-400" },
  medium: { label: "Medium", color: "text-blue-400" },
  low: { label: "Low", color: "text-emerald-400" },
};

export default function ObligationsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Priority | "all">("all");
  const [sortBy, setSortBy] = useState<"score" | "amount" | "days">("score");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const totalDue = OBLIGATIONS.reduce((s, o) => s + o.amount, 0);
  const critical = OBLIGATIONS.filter((o) => o.priority === "critical").length;

  const filtered = OBLIGATIONS.filter((o) => {
    const matchSearch = o.name.toLowerCase().includes(search.toLowerCase()) || o.counterparty.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || o.priority === filter;
    return matchSearch && matchFilter;
  }).sort((a, b) => {
    if (sortBy === "score") return b.score - a.score;
    if (sortBy === "amount") return b.amount - a.amount;
    return a.dueDays - b.dueDays;
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <div className="fixed inset-0 z-0 opacity-40 pointer-events-none mix-blend-screen"
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/bg-mesh.png)`, backgroundSize: "cover" }} />
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-6 lg:p-8 relative z-10">
        {/* Header */}
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

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Obligations", value: formatCurrency(totalDue), sub: `${OBLIGATIONS.length} items`, color: "blue" },
            { label: "Critical Priority", value: `${critical} items`, sub: "Immediate action needed", color: "red" },
            { label: "Due in 7 Days", value: formatCurrency(OBLIGATIONS.filter(o => o.dueDays <= 7).reduce((s, o) => s + o.amount, 0)), sub: `${OBLIGATIONS.filter(o => o.dueDays <= 7).length} obligations`, color: "amber" },
            { label: "Deferrable Amount", value: formatCurrency(OBLIGATIONS.filter(o => o.canDefer).reduce((s, o) => s + o.amount, 0)), sub: "With negotiation", color: "emerald" },
          ].map((c, i) => (
            <motion.div key={c.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="glass-card rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-1">{c.label}</p>
              <p className={cn("text-xl font-bold", c.color === "red" ? "text-red-400" : c.color === "amber" ? "text-amber-400" : c.color === "emerald" ? "text-emerald-400" : "text-blue-400")}>{c.value}</p>
              <p className="text-xs text-white/40 mt-0.5">{c.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
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

        {/* Obligations Table */}
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
                              <ob.icon className="w-4 h-4 text-white/60" />
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
                          <span className={cn("flex items-center gap-1.5 w-fit px-2 py-1 rounded-full border text-xs font-medium", status.bg, status.color)}>
                            <status.icon className="w-3 h-3" />
                            {status.label}
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
                  {[
                    { label: "Obligation Name", placeholder: "e.g. Office Rent" },
                    { label: "Counterparty", placeholder: "e.g. City Landlord LLC" },
                    { label: "Amount ($)", placeholder: "0.00" },
                    { label: "Due Date", placeholder: "YYYY-MM-DD" },
                  ].map((field) => (
                    <div key={field.label}>
                      <label className="block text-xs text-muted-foreground mb-1.5">{field.label}</label>
                      <input
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-emerald-500/50 transition-colors"
                        placeholder={field.placeholder}
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold mt-2"
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
