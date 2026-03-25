import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Sparkles, Send, Copy, SlidersHorizontal, CheckCircle, Clock, Plus, ChevronRight, Mail, MessageSquare, Phone } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { cn, formatCurrency } from "@/lib/utils";

type Channel = "email" | "sms" | "call";
type ToneLevel = 0 | 1 | 2;

type DraftTemplate = {
  id: string;
  counterparty: string;
  type: string;
  amount: number;
  status: "draft" | "sent" | "responded";
  daysAgo?: number;
  toneLabels: [string, string, string];
  drafts: [string, string, string];
};

const TEMPLATES: DraftTemplate[] = [
  {
    id: "1",
    counterparty: "Supplier B (Global Supplies Co.)",
    type: "Payment Deferral - Invoice #2847",
    amount: 5000,
    status: "draft",
    toneLabels: ["Firm / Formal", "Balanced", "Casual / Partner"],
    drafts: [
      "Dear Accounts Receivable Team,\n\nWe are formally requesting a 14-day extension on Invoice #2847 (Amount: $5,000) due to current cash flow constraints affecting our payment schedule.\n\nWe value our business relationship and commit to full payment by the extended deadline of April 13, 2026. Please confirm this arrangement at your earliest convenience.\n\nSincerely,\nAlex Chen\nCFO, Finguard Inc.",
      "Hi Global Supplies Team,\n\nWe'd like to request a short 14-day extension on Invoice #2847 ($5,000). We're managing some cash flow timing on our end and this brief window would be very helpful.\n\nWe truly appreciate our partnership and will ensure full payment by April 13, 2026.\n\nBest regards,\nAlex Chen | Finguard",
      "Hey Supplier B Team! 👋\n\nHope you're having a great week! We wanted to reach out about getting a bit more breathing room (14 days) on Invoice #2847. Things are moving fast on our end and this quick extension helps us align everything perfectly.\n\nYou've always been such a great partner — thanks in advance!\n\nCheers,\nAlex @ Finguard",
    ],
  },
  {
    id: "2",
    counterparty: "Metro Properties",
    type: "Rent Extension - Branch Office",
    amount: 4200,
    status: "sent",
    daysAgo: 2,
    toneLabels: ["Firm / Formal", "Balanced", "Casual / Partner"],
    drafts: [
      "Dear Metro Properties Management,\n\nWe formally request a 30-day deferral of our April branch office lease payment ($4,200) due to temporary operational constraints.\n\nWe will ensure full payment including any applicable late fees by May 15, 2026.\n\nSincerely,\nAlex Chen\nCFO, Finguard Inc.",
      "Hi Metro Properties,\n\nWe hope this message finds you well. We're reaching out about the possibility of a brief 30-day deferral on our April lease for the branch office ($4,200).\n\nWe'd love to discuss options that work for both parties.\n\nBest,\nAlex Chen | Finguard",
      "Hey Metro team!\n\nQuick question — any flexibility on our April branch rent? We'd love a 30-day window if possible. Happy to jump on a quick call to sort out details!\n\nThanks!\nAlex @ Finguard",
    ],
  },
  {
    id: "3",
    counterparty: "Chase Business Banking",
    type: "Credit Line Increase Request",
    amount: 20000,
    status: "responded",
    daysAgo: 5,
    toneLabels: ["Firm / Formal", "Balanced", "Casual / Partner"],
    drafts: [
      "Dear Chase Business Banking Team,\n\nWe are writing to formally request an increase to our existing business credit line by $20,000. Our account (#XXXX-4821) has maintained excellent standing for 36 months.\n\nPlease find attached our recent financial statements for review.\n\nSincerely,\nAlex Chen\nCFO, Finguard Inc.",
      "Hi Chase Team,\n\nWe'd like to explore increasing our business credit line by $20,000. Our account has been in excellent standing and we have some growth opportunities we'd like to capitalize on.\n\nWould you be available for a brief call this week?\n\nBest,\nAlex | Finguard",
      "Hey Chase!\n\nWe've been great customers for 3 years now and would love to bump up our credit line by $20k. Got some exciting things happening! Can we chat?\n\nThanks!\nAlex @ Finguard",
    ],
  },
];

const STATUS_CONFIG = {
  draft: { label: "Draft", color: "text-white/50", bg: "bg-white/8 border-white/10", icon: FileText },
  sent: { label: "Sent", color: "text-blue-400", bg: "bg-blue-500/15 border-blue-500/25", icon: Send },
  responded: { label: "Responded", color: "text-emerald-400", bg: "bg-emerald-500/15 border-emerald-500/25", icon: CheckCircle },
};

const CHANNEL_CONFIG: Record<Channel, { icon: any; label: string; color: string }> = {
  email: { icon: Mail, label: "Email", color: "text-blue-400" },
  sms: { icon: MessageSquare, label: "SMS", color: "text-emerald-400" },
  call: { icon: Phone, label: "Call Script", color: "text-amber-400" },
};

export default function NegotiationPage() {
  const [selected, setSelected] = useState<string>("1");
  const [tones, setTones] = useState<Record<string, number>>({ "1": 50, "2": 50, "3": 50 });
  const [copied, setCopied] = useState(false);
  const [channel, setChannel] = useState<Channel>("email");

  const template = TEMPLATES.find((t) => t.id === selected)!;
  const tone = tones[selected] ?? 50;
  const toneLevel: ToneLevel = tone < 33 ? 0 : tone < 66 ? 1 : 2;
  const emailText = template.drafts[toneLevel];

  const handleCopy = () => {
    navigator.clipboard.writeText(emailText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTone = (val: number) => setTones((prev) => ({ ...prev, [selected]: val }));

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
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-400" />
              </div>
              <h1 className="text-2xl font-bold text-white">Negotiation Hub</h1>
            </div>
            <p className="text-sm text-muted-foreground ml-12">AI-assisted drafts for deferral requests, extensions, and financing.</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-semibold shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_28px_rgba(59,130,246,0.5)] transition-all">
            <Plus className="w-4 h-4" />
            New Draft
          </button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Active Drafts", value: TEMPLATES.filter(t => t.status === "draft").length, color: "white" },
            { label: "Sent", value: TEMPLATES.filter(t => t.status === "sent").length, color: "blue" },
            { label: "Responded", value: TEMPLATES.filter(t => t.status === "responded").length, color: "emerald" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="glass-card rounded-xl p-4 text-center">
              <p className={cn("text-3xl font-bold", s.color === "emerald" ? "text-emerald-400" : s.color === "blue" ? "text-blue-400" : "text-white")}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Draft List */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="xl:col-span-1 space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-4">Communications</h2>
            {TEMPLATES.map((t) => {
              const s = STATUS_CONFIG[t.status];
              const isActive = selected === t.id;
              return (
                <motion.div
                  key={t.id}
                  whileHover={{ x: 2 }}
                  onClick={() => setSelected(t.id)}
                  className={cn(
                    "p-4 rounded-xl border cursor-pointer transition-all duration-200",
                    isActive ? "bg-white/8 border-white/20" : "bg-white/3 border-white/8 hover:bg-white/5 hover:border-white/15"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{t.counterparty}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{t.type}</p>
                      <p className="text-xs text-emerald-400 font-medium mt-1.5">{formatCurrency(t.amount)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <span className={cn("flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border", s.bg, s.color)}>
                        <s.icon className="w-2.5 h-2.5" />
                        {s.label}
                      </span>
                      {t.daysAgo && <span className="text-[10px] text-white/30">{t.daysAgo}d ago</span>}
                    </div>
                  </div>
                  {isActive && <ChevronRight className="w-3 h-3 text-emerald-400 mt-2 ml-auto" />}
                </motion.div>
              );
            })}
          </motion.div>

          {/* Editor */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="xl:col-span-2 glass-card rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />

            {/* Editor Header */}
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30 flex-shrink-0">
                <Sparkles className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-white">{template.counterparty}</p>
                <p className="text-xs text-muted-foreground">{template.type}</p>
              </div>
              {/* Channel Switcher */}
              <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 border border-white/10">
                {(Object.keys(CHANNEL_CONFIG) as Channel[]).map((ch) => {
                  const cfg = CHANNEL_CONFIG[ch];
                  return (
                    <button
                      key={ch}
                      onClick={() => setChannel(ch)}
                      className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                        channel === ch ? "bg-white/15 text-white" : "text-white/40 hover:text-white/70"
                      )}
                    >
                      <cfg.icon className={cn("w-3.5 h-3.5", channel === ch ? cfg.color : "")} />
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
              {/* Tone Control */}
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-medium text-white flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4 text-blue-400" />
                      Tone
                    </label>
                    <span className="text-xs font-bold text-blue-300 px-2 py-0.5 rounded-md bg-blue-500/15 border border-blue-500/20">
                      {template.toneLabels[toneLevel]}
                    </span>
                  </div>
                  <input
                    type="range" min="0" max="100" value={tone}
                    onChange={(e) => handleTone(parseInt(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer accent-blue-500"
                    style={{ background: `linear-gradient(to right, #3b82f6 ${tone}%, rgba(255,255,255,0.1) ${tone}%)` }}
                  />
                  <div className="flex justify-between mt-2 text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                    <span>Formal</span>
                    <span>Friendly</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/8 space-y-3">
                  <p className="text-xs font-medium text-white">AI Context</p>
                  <ul className="space-y-2">
                    {[
                      `To: ${template.counterparty.split("(")[0].trim()}`,
                      `Amount: ${formatCurrency(template.amount)}`,
                      `Type: ${template.type.split(" - ")[0]}`,
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <div className="w-1 h-1 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/8">
                  <p className="text-xs font-medium text-white mb-2">Response Rate</p>
                  <div className="flex items-end gap-1">
                    <span className="text-2xl font-bold text-emerald-400">{toneLevel === 0 ? "78" : toneLevel === 1 ? "85" : "71"}%</span>
                    <span className="text-xs text-muted-foreground mb-1">avg response</span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${toneLevel === 0 ? 78 : toneLevel === 1 ? 85 : 71}%` }} />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1.5">Based on similar {template.type.split(" - ")[0].toLowerCase()} requests</p>
                </div>
              </div>

              {/* Email Draft */}
              <div className="lg:col-span-2 flex flex-col">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${selected}-${toneLevel}`}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="flex-1 p-5 rounded-t-xl bg-black/40 border border-white/10 font-mono text-sm text-white/90 whitespace-pre-wrap leading-relaxed min-h-[260px]"
                  >
                    {emailText}
                  </motion.div>
                </AnimatePresence>
                <div className="p-3 rounded-b-xl bg-white/5 border-x border-b border-white/10 flex justify-between items-center gap-3">
                  <span className="text-xs text-muted-foreground">{emailText.length} characters</span>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-all"
                    >
                      {copied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      {copied ? "Copied!" : "Copy"}
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-400 text-white text-sm font-medium transition-all shadow-[0_0_15px_rgba(59,130,246,0.4)]">
                      <Send className="w-4 h-4" />
                      Send via Gmail
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
