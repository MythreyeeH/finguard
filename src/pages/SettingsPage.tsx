import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, Bell, Shield, Link2, User, Palette, Database, ChevronRight, Check, AlertTriangle, Zap, Globe, Moon } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { cn } from "@/lib/utils";
import { fetchInitialBalance, saveInitialBalance } from "@/lib/supabase";

type Tab = "profile" | "alerts" | "integrations" | "appearance" | "security";

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "alerts", label: "Alerts & Notifications", icon: Bell },
  { id: "integrations", label: "Integrations", icon: Link2 },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "security", label: "Security", icon: Shield },
];

const INTEGRATIONS = [
  { id: "plaid", name: "Plaid", description: "Bank account data aggregation", status: "connected", logo: "🏦", category: "Banking" },
  { id: "quickbooks", name: "QuickBooks", description: "Accounting and bookkeeping sync", status: "connected", logo: "📊", category: "Accounting" },
  { id: "stripe", name: "Stripe", description: "Payment processing and revenue", status: "disconnected", logo: "💳", category: "Payments" },
  { id: "gmail", name: "Gmail", description: "Send negotiation emails directly", status: "connected", logo: "✉️", category: "Communication" },
  { id: "slack", name: "Slack", description: "Alert notifications in channels", status: "disconnected", logo: "💬", category: "Communication" },
  { id: "xero", name: "Xero", description: "Alternative accounting integration", status: "disconnected", logo: "📈", category: "Accounting" },
];

const ALERT_SETTINGS = [
  { id: "dtz7", label: "Days to Zero < 7 days", description: "Critical runway alert", defaultOn: true },
  { id: "dtz14", label: "Days to Zero < 14 days", description: "Early warning runway alert", defaultOn: true },
  { id: "obligation", label: "New obligation due", description: "3 days before due date", defaultOn: true },
  { id: "overdue", label: "Overdue obligation", description: "Immediate notification when overdue", defaultOn: true },
  { id: "threshold", label: "Balance below threshold", description: "When cash drops below $10,000", defaultOn: false },
  { id: "email_response", label: "Negotiation email responded", description: "When counterparty replies", defaultOn: false },
];

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={cn("relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0", on ? "bg-emerald-500" : "bg-white/15")}
    >
      <div className={cn("absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200", on ? "translate-x-5" : "translate-x-0")} />
    </button>
  );
}

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>("profile");
  const [alerts, setAlerts] = useState<Record<string, boolean>>(
    Object.fromEntries(ALERT_SETTINGS.map((a) => [a.id, a.defaultOn]))
  );
  const [saved, setSaved] = useState(false);
  const [cashBalance, setCashBalance] = useState(() => 
    localStorage.getItem('finguard_cash_balance') || "50000"
  );

  // Synchronize on load
  useEffect(() => {
    fetchInitialBalance().then(res => {
      if (res.success && res.data && typeof res.data.cash_balance === 'number') {
        const val = res.data.cash_balance.toString();
        setCashBalance(val);
        localStorage.setItem('finguard_cash_balance', val);
      }
    });
  }, []);

  const handleSave = async () => {
    localStorage.setItem('finguard_cash_balance', cashBalance);
    await saveInitialBalance(Number(cashBalance));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <div className="fixed inset-0 z-0 opacity-40 pointer-events-none mix-blend-screen"
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/bg-mesh.png)`, backgroundSize: "cover" }} />
      <Sidebar />
      <main className="flex-1 ml-20 lg:ml-80 p-6 lg:p-8 relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center">
              <Settings className="w-5 h-5 text-white/70" />
            </div>
            <h1 className="text-2xl font-bold text-white">Settings</h1>
          </div>
          <p className="text-sm text-muted-foreground ml-12">Manage your account, notifications, and integrations.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Tab Nav */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-1">
            <div className="glass-card rounded-2xl p-3 space-y-1">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                    tab === t.id ? "bg-white/10 text-white" : "text-muted-foreground hover:bg-white/5 hover:text-white"
                  )}
                >
                  <t.icon className={cn("w-4 h-4", tab === t.id ? "text-emerald-400" : "")} />
                  {t.label}
                  {tab === t.id && <ChevronRight className="w-3.5 h-3.5 ml-auto text-emerald-400" />}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="lg:col-span-3"
          >
            {/* PROFILE */}
            {tab === "profile" && (
              <div className="glass-card rounded-2xl p-6 space-y-6">
                <h2 className="text-lg font-semibold text-white">Profile Information</h2>
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <img src={`${import.meta.env.BASE_URL}images/avatar.png`} alt="Avatar" className="w-20 h-20 rounded-2xl border-2 border-emerald-500/30 object-cover bg-black" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-background flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-lg">Alex Chen</p>
                    <p className="text-sm text-muted-foreground">CFO · Finguard Inc.</p>
                    <button className="mt-2 text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors">Change photo</button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "Full Name", value: "Alex Chen" },
                    { label: "Job Title", value: "CFO" },
                    { label: "Email", value: "alex.chen@finguard.io" },
                    { label: "Company", value: "Finguard Inc." },
                    { label: "Time Zone", value: "US/Pacific (GMT-7)" },
                  ].map((f) => (
                    <div key={f.label}>
                      <label className="block text-xs text-muted-foreground mb-1.5">{f.label}</label>
                      <input
                        defaultValue={f.value}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-500/50 transition-colors"
                      />
                    </div>
                  ))}
                  <div>
                      <label className="block text-xs text-emerald-400 font-bold mb-1.5 uppercase tracking-widest">Base Cash Balance ($)</label>
                      <input
                        value={cashBalance}
                        onChange={(e) => setCashBalance(e.target.value)}
                        type="number"
                        className="w-full bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2.5 text-sm text-emerald-300 font-bold outline-none focus:border-emerald-400 transition-colors"
                      />
                    </div>
                </div>
                <div className="pt-2 flex justify-end">
                  <button onClick={handleSave} className={cn("flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all", saved ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]")}>
                    {saved ? <><Check className="w-4 h-4" /> Saved!</> : "Save Changes"}
                  </button>
                </div>
              </div>
            )}

            {/* ALERTS */}
            {tab === "alerts" && (
              <div className="glass-card rounded-2xl p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">Alert Preferences</h2>
                  <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {Object.values(alerts).filter(Boolean).length} alerts active
                  </div>
                </div>

                <div className="space-y-3">
                  {ALERT_SETTINGS.map((a, i) => (
                    <motion.div key={a.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between p-4 rounded-xl bg-white/3 border border-white/8 hover:bg-white/5 transition-colors">
                      <div>
                        <p className="text-sm font-medium text-white">{a.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{a.description}</p>
                      </div>
                      <Toggle on={alerts[a.id]} onChange={() => setAlerts((prev) => ({ ...prev, [a.id]: !prev[a.id] }))} />
                    </motion.div>
                  ))}
                </div>

                <div className="pt-2">
                  <h3 className="text-sm font-semibold text-white mb-3">Delivery Channels</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "In-App", icon: Zap, active: true },
                      { label: "Email", icon: Globe, active: true },
                      { label: "Slack", icon: Bell, active: false },
                    ].map((ch) => (
                      <div key={ch.label} className={cn("p-3 rounded-xl border text-center", ch.active ? "bg-emerald-500/10 border-emerald-500/25" : "bg-white/3 border-white/8")}>
                        <ch.icon className={cn("w-5 h-5 mx-auto mb-1.5", ch.active ? "text-emerald-400" : "text-white/30")} />
                        <p className={cn("text-xs font-medium", ch.active ? "text-white" : "text-white/40")}>{ch.label}</p>
                        <p className={cn("text-[10px] mt-0.5", ch.active ? "text-emerald-400" : "text-white/25")}>{ch.active ? "Active" : "Connect"}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* INTEGRATIONS */}
            {tab === "integrations" && (
              <div className="glass-card rounded-2xl p-6 space-y-6">
                <h2 className="text-lg font-semibold text-white">Connected Integrations</h2>
                <div className="space-y-3">
                  {INTEGRATIONS.map((int, i) => (
                    <motion.div key={int.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                      className="flex items-center gap-4 p-4 rounded-xl bg-white/3 border border-white/8 hover:bg-white/5 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center text-xl flex-shrink-0">
                        {int.logo}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-white">{int.name}</p>
                          <span className="text-[10px] text-white/30 px-1.5 py-0.5 rounded bg-white/5 border border-white/8">{int.category}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{int.description}</p>
                      </div>
                      <button className={cn("flex-shrink-0 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all",
                        int.status === "connected"
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/25"
                          : "bg-white/8 text-white/60 border border-white/15 hover:bg-blue-500/15 hover:text-blue-400 hover:border-blue-500/25"
                      )}>
                        {int.status === "connected" ? "Connected ✓" : "Connect"}
                      </button>
                    </motion.div>
                  ))}
                </div>
                <div className="p-4 rounded-xl bg-blue-500/8 border border-blue-500/20 flex items-start gap-3">
                  <Database className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-300">API Access</p>
                    <p className="text-xs text-blue-300/60 mt-0.5">Connect your own data sources via the Finguard REST API.</p>
                    <button className="mt-2 text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors">View API Docs →</button>
                  </div>
                </div>
              </div>
            )}

            {/* APPEARANCE */}
            {tab === "appearance" && (
              <div className="glass-card rounded-2xl p-6 space-y-6">
                <h2 className="text-lg font-semibold text-white">Appearance</h2>
                <div>
                  <p className="text-sm text-muted-foreground mb-3">Theme Mode</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Dark", icon: Moon, active: true },
                      { label: "Light", icon: Globe, active: false },
                      { label: "System", icon: Zap, active: false },
                    ].map((t) => (
                      <div key={t.label} className={cn("p-4 rounded-xl border cursor-pointer text-center transition-all", t.active ? "bg-white/10 border-white/25" : "bg-white/3 border-white/8 hover:bg-white/5")}>
                        <t.icon className={cn("w-5 h-5 mx-auto mb-2", t.active ? "text-emerald-400" : "text-white/30")} />
                        <p className={cn("text-sm font-medium", t.active ? "text-white" : "text-white/40")}>{t.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-3">Accent Color</p>
                  <div className="flex gap-3">
                    {["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444"].map((color) => (
                      <button key={color} className="w-9 h-9 rounded-full border-2 border-transparent hover:border-white/50 transition-all relative flex-shrink-0" style={{ backgroundColor: color }}>
                        {color === "#10b981" && <Check className="w-4 h-4 text-white absolute inset-0 m-auto" />}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-3">Dashboard Density</p>
                  <div className="grid grid-cols-3 gap-3">
                    {["Compact", "Default", "Spacious"].map((d, i) => (
                      <div key={d} className={cn("p-3 rounded-xl border cursor-pointer text-center transition-all", i === 1 ? "bg-white/10 border-white/25" : "bg-white/3 border-white/8 hover:bg-white/5")}>
                        <p className={cn("text-sm font-medium", i === 1 ? "text-white" : "text-white/40")}>{d}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SECURITY */}
            {tab === "security" && (
              <div className="glass-card rounded-2xl p-6 space-y-6">
                <h2 className="text-lg font-semibold text-white">Security Settings</h2>
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-white/3 border border-white/8">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm font-medium text-white">Change Password</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Last changed 45 days ago</p>
                      </div>
                      <Shield className="w-5 h-5 text-white/30" />
                    </div>
                    <div className="space-y-3">
                      {["Current Password", "New Password", "Confirm New Password"].map((label) => (
                        <div key={label}>
                          <label className="block text-xs text-muted-foreground mb-1.5">{label}</label>
                          <input type="password" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-500/50 transition-colors" placeholder="••••••••" />
                        </div>
                      ))}
                      <button className="mt-1 px-4 py-2 rounded-lg bg-white/8 hover:bg-white/12 text-white text-sm font-medium transition-all border border-white/12">Update Password</button>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white/3 border border-white/8 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">Two-Factor Authentication</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Protect your account with 2FA</p>
                    </div>
                    <button className="px-4 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-sm font-medium transition-all border border-emerald-500/25">Enable 2FA</button>
                  </div>

                  <div className="p-4 rounded-xl bg-white/3 border border-white/8">
                    <p className="text-sm font-medium text-white mb-3">Active Sessions</p>
                    {[
                      { device: "MacBook Pro · Chrome", location: "San Francisco, CA", current: true },
                      { device: "iPhone 15 · Safari", location: "San Francisco, CA", current: false },
                    ].map((s) => (
                      <div key={s.device} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                        <div>
                          <p className="text-sm text-white flex items-center gap-2">
                            {s.device}
                            {s.current && <span className="text-[10px] text-emerald-400 bg-emerald-500/15 border border-emerald-500/20 px-1.5 py-0.5 rounded-full font-semibold">Current</span>}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">{s.location}</p>
                        </div>
                        {!s.current && <button className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors">Revoke</button>}
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-xl bg-red-500/8 border border-red-500/20">
                    <p className="text-sm font-medium text-red-300 mb-1">Danger Zone</p>
                    <p className="text-xs text-red-300/60 mb-3">Permanently delete your account and all associated data.</p>
                    <button className="px-4 py-2 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-400 text-sm font-medium transition-all border border-red-500/25">Delete Account</button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
