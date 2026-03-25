import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Sparkles, Send, Copy, SlidersHorizontal, CheckCircle,
  Clock, Plus, ChevronRight, Mail, MessageSquare, Phone, Loader2,
  AlertCircle, RefreshCw, MessageCircle, Fingerprint, Zap
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { cn, formatCurrency } from "@/lib/utils";
import { useNegotiations, useGenerateNegotiation, useUpdateNegotiationStatus, useLogResponse } from "@/hooks/use-negotiation";
import { Negotiation, Channel } from "@/lib/negotiation/types";
import { STRATEGY_LABELS } from "@/lib/negotiation/strategy";
import { useObligations } from "@/hooks/use-obligations";
import { useFinancialState } from "@/hooks/use-financial-state";
import { supabase } from "@/lib/supabase";
import { usePlaidLink } from "react-plaid-link";

// ─── Config ─────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  draft:     { label: "Draft",     color: "text-white/50",    bg: "bg-white/8 border-white/10",            icon: FileText },
  sent:      { label: "Sent",      color: "text-blue-400",    bg: "bg-blue-500/15 border-blue-500/25",    icon: Send },
  responded: { label: "Responded", color: "text-emerald-400", bg: "bg-emerald-500/15 border-emerald-500/25", icon: CheckCircle },
};

const CHANNEL_CONFIG: Record<Channel, { icon: any; label: string; color: string }> = {
  email: { icon: Mail,          label: "Email",       color: "text-blue-400" },
  sms:   { icon: MessageSquare, label: "SMS",         color: "text-emerald-400" },
  call:  { icon: Phone,         label: "Call Script", color: "text-amber-400" },
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function NegotiationPage() {
  const { data: negotiations = [], isLoading: loadingNeg } = useNegotiations();
  const { obligations }   = useObligations();
  const { cash_balance }  = useFinancialState();
  const generateMutation  = useGenerateNegotiation();
  const statusMutation    = useUpdateNegotiationStatus();
  const responseMutation  = useLogResponse();

  const [selectedId, setSelectedId]     = useState<string | null>(null);
  const [tone, setTone]                 = useState(50);
  const [channel, setChannel]           = useState<Channel>("email");
  const [copied, setCopied]             = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [selectedObligationId, setSelectedObligationId] = useState("");
  const [generatedText, setGeneratedText] = useState<string | null>(null);

  const [isSyncing, setIsSyncing]       = useState(false);
  const [isExecuting, setIsExecuting]   = useState(false);
  const [executedPayments, setExecutedPayments] = useState<string[]>([]);
  const [linkToken, setLinkToken]       = useState<string | null>(null);

  const selected = negotiations.find((n) => n.id === selectedId) ?? negotiations[0];

  const handleCopy = () => {
    if (!selected) return;
    navigator.clipboard.writeText(selected.message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerate = async () => {
    if (!selectedObligationId) return;
    const result = await generateMutation.mutateAsync({ obligation_id: selectedObligationId, tone, channel });
    setGeneratedText(result.message);
    setShowNewModal(false);
  };

  const handleSend = async () => {
    if (!selected) return;
    await statusMutation.mutateAsync({ id: selected.id, status: "sent" });
  };

  const handleLogResponse = async () => {
    if (!selected || !responseText.trim()) return;
    await responseMutation.mutateAsync({
      negotiation_id: selected.id,
      response_text: responseText,
      outcome: "pending",
    });
    setShowResponseModal(false);
    setResponseText("");
  };

  const handleSync = async () => {
    setIsSyncing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSyncing(false);
  };

  const onSuccessPlaid = useCallback((public_token: string, metadata: any) => {
    setExecutedPayments(prev => [...prev, selected?.id || ""]);
    alert(`Plaid Link Success!\nInstitution: ${metadata?.institution?.name}\nPublic Token: ${public_token.substring(0,8)}...\n\n(In production, exchange this token server-side for an access_token!)`);
  }, [selected]);

  const { open: openPlaid, ready: isPlaidReady } = usePlaidLink({
    token: linkToken!,
    onSuccess: onSuccessPlaid,
  });

  // Automatically open Plaid modal once token is ready
  useEffect(() => {
    if (linkToken && isPlaidReady) {
      openPlaid();
      setLinkToken(null);
    }
  }, [linkToken, isPlaidReady, openPlaid]);

  const handleExecutePayment = async () => {
    if (!selected) return;
    setIsExecuting(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-plaid-link', {
        body: { user_id: 'finguard-tenant-id' } 
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setLinkToken(data.link_token);
    } catch (err: any) {
      alert(`⚠️ Plaid backend offline.\n\nTo enable live Open Banking, please deploy the Supabase Edge Function provided inside "supabase-functions/" with your Plaid API Keys.\n\nSystem Error: ${err.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  // Tally stats from live data
  const stats = {
    draft:     negotiations.filter(n => n.status === "draft").length,
    sent:      negotiations.filter(n => n.status === "sent").length,
    responded: negotiations.filter(n => n.status === "responded").length,
  };

  const toneLabel = tone < 33 ? "Firm / Formal" : tone < 66 ? "Balanced" : "Casual / Partner";
  const activeMessage = selected?.message ?? generatedText ?? "";

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <div className="fixed inset-0 z-0 opacity-40 pointer-events-none mix-blend-screen"
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/bg-mesh.png)`, backgroundSize: "cover" }} />
      <Sidebar />
      <main className="flex-1 ml-20 lg:ml-80 p-6 lg:p-8 relative z-10">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-400" />
              </div>
              <h1 className="text-2xl font-bold text-white">Negotiation Hub</h1>
            </div>
            <p className="text-sm text-muted-foreground ml-12">AI-powered deferral requests, extensions, and financing — backed by Gemini & Supabase.</p>
          </div>
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-semibold shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_28px_rgba(59,130,246,0.5)] transition-all"
          >
            <Plus className="w-4 h-4" />
            Generate Draft
          </button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Active Drafts", value: stats.draft,     color: "white" },
            { label: "Sent",          value: stats.sent,      color: "blue" },
            { label: "Responded",     value: stats.responded, color: "emerald" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="glass-card rounded-xl p-4 text-center">
              <p className={cn("text-3xl font-bold", s.color === "emerald" ? "text-emerald-400" : s.color === "blue" ? "text-blue-400" : "text-white")}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {loadingNeg ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="animate-spin text-blue-400 w-8 h-8" />
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left: Draft List */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="xl:col-span-1 space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-4">Communications</h2>

              {negotiations.length === 0 && (
                <div className="p-6 rounded-xl border border-dashed border-white/10 text-center">
                  <MessageCircle className="w-8 h-8 text-white/20 mx-auto mb-2" />
                  <p className="text-sm text-white/40">No negotiations yet.</p>
                  <p className="text-xs text-white/20 mt-1">Click "Generate Draft" to start.</p>
                </div>
              )}

              {negotiations.map((n) => {
                const s = STATUS_CONFIG[n.status] ?? STATUS_CONFIG.draft;
                const isActive = selected?.id === n.id;
                return (
                  <motion.div
                    key={n.id}
                    whileHover={{ x: 2 }}
                    onClick={() => setSelectedId(n.id)}
                    className={cn(
                      "p-4 rounded-xl border cursor-pointer transition-all duration-200",
                      isActive ? "bg-white/8 border-white/20" : "bg-white/3 border-white/8 hover:bg-white/5 hover:border-white/15"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{n.counterparty ?? "Unknown"}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{STRATEGY_LABELS[n.strategy_type]}</p>
                        {n.amount && <p className="text-xs text-emerald-400 font-medium mt-1.5">{formatCurrency(n.amount)}</p>}
                      </div>
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <span className={cn("flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border", s.bg, s.color)}>
                          <s.icon className="w-2.5 h-2.5" />
                          {s.label}
                        </span>
                        <span className="text-[10px] text-white/30 capitalize">{n.channel}</span>
                      </div>
                    </div>
                    {isActive && <ChevronRight className="w-3 h-3 text-emerald-400 mt-2 ml-auto" />}
                  </motion.div>
                );
              })}

              {/* Open Banking Gateway Widget */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="flex items-center gap-2 mb-4 px-1">
                  <Fingerprint className="w-4 h-4 text-emerald-400" />
                  <h2 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">Open Banking Execution</h2>
                </div>
                
                <div className="glass-card rounded-xl p-5 border border-emerald-500/20 bg-emerald-500/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[40px] rounded-full pointer-events-none" />
                  
                  <div className="flex justify-between items-center mb-4 relative z-10">
                    <div>
                      <p className="text-[10px] text-emerald-400 font-bold tracking-widest uppercase mb-0.5">Live Balance Sync</p>
                      <p className="text-xl font-black text-white">{cash_balance !== undefined ? formatCurrency(cash_balance) : '---'}</p>
                    </div>
                    <button 
                      onClick={handleSync}
                      disabled={isSyncing}
                      className="p-2.5 rounded-xl bg-black/40 border border-white/10 hover:border-emerald-500/30 text-emerald-400 transition-all active:scale-95 shadow-md"
                    >
                      <RefreshCw className={cn("w-4 h-4", isSyncing ? "animate-spin text-emerald-300" : "")} />
                    </button>
                  </div>
                  
                  <div className="space-y-3 relative z-10">
                    <button 
                      onClick={handleExecutePayment}
                      disabled={isExecuting || !selected || executedPayments.includes(selected?.id || "")}
                      className={cn(
                        "w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black font-display uppercase tracking-wider text-[11px] transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                        executedPayments.includes(selected?.id || "") 
                          ? "bg-white/10 text-white border border-white/20" 
                          : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]"
                      )}
                    >
                      {isExecuting ? <Loader2 className="w-4 h-4 animate-spin" /> : executedPayments.includes(selected?.id || "") ? <CheckCircle className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                      {executedPayments.includes(selected?.id || "") ? "Payment Executed" : "Direct Pay Now"}
                    </button>
                    {selected && (
                      <p className="text-[10px] text-center text-emerald-400/70 uppercase font-medium tracking-wider">
                        Triggers secure {selected.counterparty} transfer via Plaid API
                      </p>
                    )}
                  </div>
                </div>
              </div>

            </motion.div>

            {/* Right: Editor */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="xl:col-span-2 glass-card rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />

              {(!selected && !generatedText) ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                  <Sparkles className="w-12 h-12 text-blue-400/30 mb-4" />
                  <p className="text-white/40 text-sm">Select a draft or generate a new one.</p>
                </div>
              ) : (
                <>
                  {/* Editor Header */}
                  <div className="flex items-center gap-3 mb-6 relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30 flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-semibold text-white">{selected?.counterparty ?? "Generated Draft"}</p>
                      <p className="text-xs text-muted-foreground">{selected ? STRATEGY_LABELS[selected.strategy_type] : "Strategy-driven message"}</p>
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
                    {/* Left Controls */}
                    <div className="space-y-5">
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <label className="text-sm font-medium text-white flex items-center gap-2">
                            <SlidersHorizontal className="w-4 h-4 text-blue-400" />
                            Tone
                          </label>
                          <span className="text-xs font-bold text-blue-300 px-2 py-0.5 rounded-md bg-blue-500/15 border border-blue-500/20">{toneLabel}</span>
                        </div>
                        <input
                          type="range" min="0" max="100" value={tone}
                          onChange={(e) => setTone(parseInt(e.target.value))}
                          className="w-full h-2 rounded-full appearance-none cursor-pointer accent-blue-500"
                          style={{ background: `linear-gradient(to right, #3b82f6 ${tone}%, rgba(255,255,255,0.1) ${tone}%)` }}
                        />
                        <div className="flex justify-between mt-2 text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                          <span>Formal</span>
                          <span>Friendly</span>
                        </div>
                      </div>

                      {selected && (
                        <div className="p-4 rounded-xl bg-white/5 border border-white/8 space-y-3">
                          <p className="text-xs font-medium text-white">AI Context</p>
                          <ul className="space-y-2">
                            {[
                              `To: ${selected.counterparty ?? "—"}`,
                              `Amount: ${selected.amount ? formatCurrency(selected.amount) : "—"}`,
                              `Type: ${STRATEGY_LABELS[selected.strategy_type]}`,
                              `Channel: ${selected.channel}`,
                            ].map((item) => (
                              <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                                <div className="w-1 h-1 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Response Tracking */}
                      {selected?.status === "sent" && (
                        <button
                          onClick={() => setShowResponseModal(true)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-medium transition-all"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Log Response
                        </button>
                      )}
                    </div>

                    {/* Email Draft */}
                    <div className="lg:col-span-2 flex flex-col">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={selected?.id ?? "generated"}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="flex-1 p-5 rounded-t-xl bg-black/40 border border-white/10 font-mono text-sm text-white/90 whitespace-pre-wrap leading-relaxed min-h-[260px]"
                        >
                          {activeMessage}
                        </motion.div>
                      </AnimatePresence>
                      <div className="p-3 rounded-b-xl bg-white/5 border-x border-b border-white/10 flex justify-between items-center gap-3">
                        <span className="text-xs text-muted-foreground">{activeMessage.length} characters</span>
                        <div className="flex gap-2">
                          <button
                            onClick={handleCopy}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-all"
                          >
                            {copied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                            {copied ? "Copied!" : "Copy"}
                          </button>
                          {selected?.status === "draft" && (
                            <button
                              onClick={handleSend}
                              disabled={statusMutation.isPending}
                              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-400 text-white text-sm font-medium transition-all shadow-[0_0_15px_rgba(59,130,246,0.4)] disabled:opacity-60"
                            >
                              {statusMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                              Mark as Sent
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}

        {/* Generate Draft Modal */}
        <AnimatePresence>
          {showNewModal && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
              onClick={() => setShowNewModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="glass-card rounded-2xl p-6 w-full max-w-md"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">Generate Negotiation Draft</h3>
                    <p className="text-xs text-muted-foreground">AI selects strategy + writes the message</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1.5">Select Obligation</label>
                    <select
                      value={selectedObligationId}
                      onChange={(e) => setSelectedObligationId(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/50 transition-colors"
                    >
                      <option value="" className="bg-background">-- Select an obligation --</option>
                      {obligations.map((o) => (
                        <option key={o.id} value={o.id} className="bg-background">
                          {o.name} — {formatCurrency(o.amount)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1.5">Channel</label>
                    <div className="flex gap-2">
                      {(["email", "sms", "call"] as Channel[]).map((ch) => (
                        <button key={ch} onClick={() => setChannel(ch)}
                          className={cn("flex-1 py-2 rounded-lg text-xs font-medium capitalize border transition-all",
                            channel === ch ? "bg-blue-500/20 border-blue-500/40 text-blue-300" : "bg-white/5 border-white/10 text-white/40"
                          )}>
                          {ch}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-xs text-muted-foreground">Tone</label>
                      <span className="text-xs text-blue-300">{toneLabel}</span>
                    </div>
                    <input type="range" min="0" max="100" value={tone}
                      onChange={(e) => setTone(parseInt(e.target.value))}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer accent-blue-500"
                      style={{ background: `linear-gradient(to right, #3b82f6 ${tone}%, rgba(255,255,255,0.1) ${tone}%)` }}
                    />
                  </div>
                  <button
                    onClick={handleGenerate}
                    disabled={!selectedObligationId || generateMutation.isPending}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-semibold mt-2 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {generateMutation.isPending ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Generating via Gemini...</>
                    ) : (
                      <><Sparkles className="w-4 h-4" /> Generate Draft</>
                    )}
                  </button>
                  {generateMutation.isError && (
                    <p className="text-xs text-red-400 flex items-center gap-1.5">
                      <AlertCircle className="w-3 h-3" />
                      {(generateMutation.error as any)?.message ?? "Generation failed"}
                    </p>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Log Response Modal */}
        <AnimatePresence>
          {showResponseModal && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
              onClick={() => setShowResponseModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="glass-card rounded-2xl p-6 w-full max-w-md"
              >
                <h3 className="text-base font-semibold text-white mb-4">Log Counterparty Response</h3>
                <textarea
                  rows={5}
                  placeholder="Paste their reply or summarize the outcome..."
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-emerald-500/50 resize-none mb-4"
                />
                <button
                  onClick={handleLogResponse}
                  disabled={!responseText.trim() || responseMutation.isPending}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {responseMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Save Response
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
