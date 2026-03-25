import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Activity, TrendingDown, TrendingUp, Zap, BarChart2, RefreshCw, CheckCircle2, ArrowRight } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { cn, formatCurrency } from "@/lib/utils";

const STARTING_BALANCE = 47230;
const BASE_DAILY_BURN = 8500;

type Scenario = {
  id: string;
  name: string;
  actions: string[];
  totalInjection: number;
  addedDays: number;
  color: string;
};

const SCENARIOS: Scenario[] = [
  {
    id: "none",
    name: "No Action",
    actions: [],
    totalInjection: 0,
    addedDays: 0,
    color: "#ef4444",
  },
  {
    id: "minimal",
    name: "Minimal Response",
    actions: ["Defer Supplier B (+$5,000)"],
    totalInjection: 5000,
    addedDays: 3,
    color: "#f59e0b",
  },
  {
    id: "balanced",
    name: "Balanced Strategy",
    actions: ["Defer Supplier B (+$5,000)", "Pause Marketing (+$2,000)", "Accelerate Invoice (+$8,000)"],
    totalInjection: 15000,
    addedDays: 8,
    color: "#3b82f6",
  },
  {
    id: "aggressive",
    name: "AI Suggested (Optimal)",
    actions: ["Defer Supplier B (+$5,000)", "Bridge Loan (+$15,000)", "Accelerate Invoice (+$8,000)", "Pause Marketing (+$2,000)"],
    totalInjection: 30000,
    addedDays: 16,
    color: "#10b981",
  },
];

const STRATEGY_CHECKBOXES = [
  { id: "1", label: "Defer Supplier B Payment", impact: 5000, days: 3 },
  { id: "2", label: "Apply for Bridge Loan", impact: 15000, days: 8 },
  { id: "3", label: "Accelerate Client A Invoice", impact: 8000, days: 4 },
  { id: "4", label: "Pause Marketing Budget", impact: 2000, days: 1 },
  { id: "5", label: "Negotiate Rent Deferral", impact: 8500, days: 4 },
  { id: "6", label: "Draw from Credit Line", impact: 20000, days: 10 },
];

function generateData(injection: number, addedDays: number) {
  return Array.from({ length: 31 }).map((_, day) => {
    const crisis = Math.max(0, STARTING_BALANCE - day * BASE_DAILY_BURN);
    const optimizedBurn = BASE_DAILY_BURN * 0.88;
    const optimized = Math.max(0, STARTING_BALANCE + (day >= 2 ? injection : 0) - day * optimizedBurn);
    return { day, name: `D${day}`, crisis, optimized };
  });
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/90 border border-white/10 rounded-xl p-3 text-xs space-y-1 backdrop-blur-md">
        <p className="text-white/60 font-medium mb-2">{label}</p>
        {payload.map((p: any) => (
          <div key={p.name} className="flex justify-between gap-6">
            <span style={{ color: p.color }}>{p.name === "crisis" ? "Crisis Path" : "Strategy Path"}</span>
            <span className="text-white font-bold">{formatCurrency(p.value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function SimulatorPage() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [compareMode, setCompareMode] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState("aggressive");

  const activeStrategies = STRATEGY_CHECKBOXES.filter((s) => checked[s.id]);
  const netInjection = activeStrategies.reduce((s, a) => s + a.impact, 0);
  const addedDays = activeStrategies.reduce((s, a) => s + a.days, 0);
  const currentDTZ = 5 + addedDays;

  const chartData = useMemo(() => generateData(netInjection, addedDays), [netInjection, addedDays]);

  const toggle = (id: string) => setChecked((prev) => ({ ...prev, [id]: !prev[id] }));

  const scenario = SCENARIOS.find((s) => s.id === selectedScenario) ?? SCENARIOS[3];

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <div
        className="fixed inset-0 z-0 opacity-40 pointer-events-none mix-blend-screen"
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/bg-mesh.png)`, backgroundSize: "cover" }}
      />
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-6 lg:p-8 relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
              <Activity className="w-5 h-5 text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Gap Theory Simulator</h1>
          </div>
          <p className="text-sm text-muted-foreground ml-12">
            Model cash flow scenarios and find your optimal survival strategy.
          </p>
        </motion.div>

        {/* Metric Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Starting Balance", value: formatCurrency(STARTING_BALANCE), icon: <BarChart2 className="w-4 h-4 text-emerald-400" />, color: "emerald" },
            { label: "Daily Burn Rate", value: formatCurrency(BASE_DAILY_BURN), icon: <TrendingDown className="w-4 h-4 text-red-400" />, color: "red" },
            { label: "Net Cash Injected", value: formatCurrency(netInjection), icon: <TrendingUp className="w-4 h-4 text-blue-400" />, color: "blue" },
            { label: "Days to Zero", value: `${currentDTZ} days`, icon: <Zap className="w-4 h-4 text-amber-400" />, color: currentDTZ < 7 ? "red" : "emerald" },
          ].map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass-card rounded-xl p-4 flex items-center gap-3"
            >
              <div className="p-2 rounded-lg bg-white/5">{m.icon}</div>
              <div>
                <p className="text-xs text-muted-foreground">{m.label}</p>
                <p className={cn("text-lg font-bold", m.color === "red" ? "text-red-400" : m.color === "emerald" ? "text-emerald-400" : m.color === "blue" ? "text-blue-400" : "text-amber-400")}>{m.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-6">
          {/* Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="xl:col-span-3 glass-card rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-white">Cash Runway Projection</h2>
                <p className="text-xs text-muted-foreground mt-0.5">30-day forward simulation</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-0.5 bg-red-400 border-dashed border-t-2 border-red-400" />
                  <span className="text-muted-foreground">Crisis Path</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-0.5 bg-emerald-400" />
                  <span className="text-muted-foreground">Strategy Path</span>
                </div>
                <div className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 text-[10px] font-bold">
                  Exhaustion: Day {currentDTZ}
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={340}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="crisisGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="optimGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine x="D0" stroke="#3b82f6" strokeWidth={2} strokeDasharray="4 2" label={{ value: "Today", position: "top", fill: "#60a5fa", fontSize: 11 }} />
                <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
                <Area type="monotone" dataKey="crisis" stroke="#ef4444" strokeWidth={2} strokeDasharray="6 3" fill="url(#crisisGrad)" animationDuration={800} />
                <Area type="monotone" dataKey="optimized" stroke="#10b981" strokeWidth={2.5} fill="url(#optimGrad)" animationDuration={800} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Strategy Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="xl:col-span-1 glass-card rounded-2xl p-6"
          >
            <h2 className="text-base font-semibold text-white mb-1">Strategy Levers</h2>
            <p className="text-xs text-muted-foreground mb-5">Toggle actions to model impact</p>
            <div className="space-y-3">
              {STRATEGY_CHECKBOXES.map((s) => (
                <label key={s.id} className="flex items-start gap-3 cursor-pointer group">
                  <div
                    onClick={() => toggle(s.id)}
                    className={cn(
                      "mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200",
                      checked[s.id]
                        ? "bg-emerald-500 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                        : "border-white/20 group-hover:border-emerald-500/50"
                    )}
                  >
                    {checked[s.id] && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-medium leading-tight", checked[s.id] ? "text-white" : "text-white/70")}>{s.label}</p>
                    <p className="text-xs text-emerald-400 mt-0.5">+{formatCurrency(s.impact)} · +{s.days}d runway</p>
                  </div>
                </label>
              ))}
            </div>
            {Object.values(checked).some(Boolean) && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
              >
                <p className="text-xs text-emerald-400 font-medium">Net Impact</p>
                <p className="text-xl font-bold text-emerald-300 mt-0.5">+{formatCurrency(netInjection)}</p>
                <p className="text-xs text-white/60 mt-1">Extends runway by <strong className="text-white">+{addedDays} days</strong></p>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Scenario Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white">Scenario Comparison</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Compare outcomes across different strategy levels</p>
            </div>
            <button
              onClick={() => setCompareMode(!compareMode)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 text-sm font-medium transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              {compareMode ? "Hide Detail" : "Show Detail"}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {SCENARIOS.map((sc) => (
              <motion.div
                key={sc.id}
                whileHover={{ y: -3 }}
                onClick={() => setSelectedScenario(sc.id)}
                className={cn(
                  "p-5 rounded-xl border cursor-pointer transition-all duration-200",
                  selectedScenario === sc.id
                    ? "border-white/20 bg-white/8"
                    : "border-white/8 bg-white/3 hover:border-white/15"
                )}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sc.color, boxShadow: `0 0 8px ${sc.color}80` }} />
                  <p className="text-sm font-semibold text-white">{sc.name}</p>
                </div>
                <p className="text-2xl font-bold" style={{ color: sc.color }}>{5 + sc.addedDays} <span className="text-sm font-normal text-white/50">days</span></p>
                <p className="text-xs text-muted-foreground mt-1">+{formatCurrency(sc.totalInjection)} injected</p>
                {compareMode && sc.actions.length > 0 && (
                  <ul className="mt-3 space-y-1">
                    {sc.actions.map((a) => (
                      <li key={a} className="flex items-center gap-1.5 text-xs text-white/60">
                        <ArrowRight className="w-3 h-3 text-emerald-500/60 flex-shrink-0" />
                        {a}
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
