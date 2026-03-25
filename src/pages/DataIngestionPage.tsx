import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/Sidebar";
import { 
  UploadCloud, 
  MessageSquare, 
  Plus, 
  CheckCircle2, 
  Repeat, 
  AlertTriangle, 
  X, 
  Loader2, 
  Database, 
  ArrowRight 
} from "lucide-react";
import { parseUnstructuredTextWithGemini, parseImageWithGemini } from "@/lib/ingestion/gemini";
import { parseSMS, parseCSVBulk } from "@/lib/ingestion/parsers";
import { processDeduplicationRun } from "@/lib/ingestion/deduplication";
import { projectSubscriptionObligations, type Frequency } from "@/lib/ingestion/subscriptions";
import { computeFeatureScores } from "@/lib/decision-engine/state-builder";
import { pushObligationsToDB } from "@/lib/supabase";
import { type ValidatedObligation } from "@/lib/ingestion/normalizer";
import { cn, formatCurrency } from "@/lib/utils";

type PipelineStatus = 'idle' | 'ingesting' | 'normalizing' | 'deduplicating' | 'pushing' | 'done' | 'error';

export default function DataIngestionPage() {
  const [activeTab, setActiveTab] = useState<'upload' | 'text' | 'manual' | 'subscription'>('manual');

  // Input state
  const [manualText, setManualText] = useState("");
  const [smsText, setSmsText] = useState("");
  const [subVendor, setSubVendor] = useState("");
  const [subAmount, setSubAmount] = useState("");
  const [subFrequency, setSubFrequency] = useState<Frequency>("Monthly");
  const [subDueDate, setSubDueDate] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  // Pipeline output state
  const [pipelineStatus, setPipelineStatus] = useState<PipelineStatus>('idle');
  const [pipelineStep, setPipelineStep] = useState(0); 
  const [stagedObligations, setStagedObligations] = useState<ValidatedObligation[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dbContext] = useState<ValidatedObligation[]>([]);

  const runPipeline = useCallback(async (incoming: ValidatedObligation[]) => {
    try {
      setPipelineStep(1); setPipelineStatus('normalizing');
      await sleep(1000); // Simulate processing time for "WOW" effect
      
      setPipelineStep(2); setPipelineStatus('deduplicating');
      await sleep(800);
      const deduped = processDeduplicationRun(incoming, dbContext);

      // FEATURE ENGINEERING AT INGESTION
      const currentCash = parseFloat(localStorage.getItem('finguard_cash_balance') || "50000");
      const enriched = deduped.map(ob => {
        const features = computeFeatureScores(ob, currentCash);
        return {
          ...ob,
          shortfall: features.shortfall,
          urgency: features.urgency,
          flexibility_score: features.flexibility_score,
          failures: features.failures,
          risk: features.risk
        };
      });

      setPipelineStep(3); setPipelineStatus('pushing');
      await sleep(1000);
      const result = await pushObligationsToDB(enriched);

      if (!result.success) throw new Error("Supabase push failed");

      setStagedObligations(prev => [...prev, ...enriched]);
      setPipelineStep(4); setPipelineStatus('done');
    } catch (err: any) {
      setErrorMsg(err.message || "Pipeline failed");
      setPipelineStatus('error');
    }
  }, [dbContext]);

  const handleManualSubmit = async () => {
    if (!manualText.trim()) return;
    try {
      setPipelineStatus('ingesting'); setPipelineStep(0); setErrorMsg(null);
      const parsed = await parseUnstructuredTextWithGemini(manualText);
      setManualText("");
      await runPipeline([parsed]);
    } catch (err: any) {
      setErrorMsg(err.message); setPipelineStatus('error');
    }
  };

  const handleSMSSubmit = async () => {
    if (!smsText.trim()) return;
    try {
      setPipelineStatus('ingesting'); setPipelineStep(0); setErrorMsg(null);
      const lines = smsText.split('\n').filter(l => l.trim());
      const parsed = lines.map(parseSMS).filter(Boolean) as ValidatedObligation[];
      if (!parsed.length) throw new Error("No SMS transactions detected. Are keywords like 'debited' or 'credited' present?");
      setSmsText("");
      await runPipeline(parsed);
    } catch (err: any) {
      setErrorMsg(err.message); setPipelineStatus('error');
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      setPipelineStatus('ingesting'); setPipelineStep(0); setErrorMsg(null);
      const parsed: ValidatedObligation[] = [];

      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        const text = await file.text();
        const extracted = parseCSVBulk(text);
        if (!extracted.length) throw new Error("Could not find any valid financial transactions in this CSV.");
        parsed.push(...extracted);
      } else {
        const base64 = await fileToBase64(file);
        const ob = await parseImageWithGemini(base64, file.type);
        if (ob) parsed.push(ob);
        else throw new Error("Gemini Vision could not find financial data in this image.");
      }

      await runPipeline(parsed);
    } catch (err: any) {
      setErrorMsg(err.message); setPipelineStatus('error');
    }
  };

  const handleSubscriptionSubmit = async () => {
    if (!subVendor || !subAmount || !subDueDate) return;
    try {
      setPipelineStatus('ingesting'); setPipelineStep(0); setErrorMsg(null);
      const projected = projectSubscriptionObligations({
        vendor: subVendor,
        amount: parseFloat(subAmount),
        frequency: subFrequency,
        nextDueDate: subDueDate,
      }, 90);
      setSubVendor(""); setSubAmount(""); setSubDueDate("");
      await runPipeline(projected);
    } catch (err: any) {
      setErrorMsg(err.message); setPipelineStatus('error');
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  }, [handleFileUpload]);

  const isProcessing = ['ingesting', 'normalizing', 'deduplicating', 'pushing'].includes(pipelineStatus);

  const tabs = [
    { id: 'manual', icon: Plus, label: "Manual Entry" },
    { id: 'upload', icon: UploadCloud, label: "Bank/Receipt Upload" },
    { id: 'text', icon: MessageSquare, label: "SMS Alerts" },
    { id: 'subscription', icon: Repeat, label: "Subscriptions" }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <div className="fixed inset-0 z-0 opacity-40 pointer-events-none mix-blend-screen"
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/bg-mesh.png)`, backgroundSize: "cover" }} />
      <Sidebar />
      <main className="flex-1 ml-20 lg:ml-80 p-6 lg:p-10 relative z-10 transition-all duration-500">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.2)]">
              <DatabaseIcon className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-white tracking-tight">Data Ingestion Hub</h1>
              <p className="text-sm text-muted-foreground uppercase tracking-[0.2em] font-black opacity-60">Autonomous Intelligence Pipeline</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Input Panel */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
            className="lg:col-span-5 glass-card rounded-[2.5rem] p-8 border border-white/5 relative overflow-hidden bg-white/[0.02]">
            
            <div className="flex space-x-1 border-b border-white/5 pb-6 mb-8 flex-wrap gap-y-3">
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                    activeTab === tab.id
                      ? "bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.1)]"
                      : "text-white/40 hover:bg-white/5 hover:text-white border border-transparent"
                  }`}>
                  <tab.icon className="w-4 h-4" />{tab.label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.2 }} className="min-h-[350px]">
                {activeTab === 'manual' && (
                  <div className="space-y-6">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-purple-500/5 blur-2xl rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity" />
                      <textarea
                        className="w-full h-44 bg-black/40 border border-white/5 rounded-[1.5rem] p-6 text-white text-base focus:outline-none focus:border-purple-500/30 focus:ring-1 focus:ring-purple-500/30 transition-all resize-none relative z-10 font-display italic leading-relaxed"
                        placeholder="e.g., 'Paid $1200 for rent on the 1st of every month'..."
                        value={manualText} onChange={e => setManualText(e.target.value)} />
                       <div className="absolute bottom-4 right-4 z-20">
                          <span className="text-[10px] text-purple-400 font-black uppercase tracking-widest bg-purple-500/10 px-2 py-1 rounded">AI Extract Ready</span>
                       </div>
                    </div>
                    <button disabled={isProcessing || !manualText.trim()} onClick={handleManualSubmit}
                      className="w-full py-4 rounded-[1.5rem] bg-gradient-to-r from-purple-500 to-indigo-600 hover:scale-[1.02] active:scale-[0.98] text-white font-black uppercase tracking-[0.2em] transition-all shadow-[0_10px_30px_rgba(168,85,247,0.3)] disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3">
                      {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing Logic...</> : <>Extract & Prowess <ArrowRight className="w-4 h-4" /></>}
                    </button>
                  </div>
                )}

                {activeTab === 'upload' && (
                  <div className="space-y-6">
                    <div
                      onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={cn("flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-[2rem] cursor-pointer transition-all relative group", isDragging ? "border-purple-400 bg-purple-500/10" : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-purple-500/30")}>
                      <UploadCloud className={cn("w-10 h-10 mb-4 transition-transform group-hover:scale-110", isDragging ? "text-purple-400" : "text-white/20")} />
                      <p className="text-sm text-white font-bold uppercase tracking-widest">Autonomous Capture</p>
                      <p className="text-[10px] text-white/40 mt-2 uppercase tracking-tight">CSV / JPG / PNG / PDF supported</p>
                      <input ref={fileInputRef} type="file" className="hidden" accept=".csv,.jpg,.jpeg,.png,.pdf"
                        onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }} />
                    </div>
                    {isProcessing && <p className="text-xs text-center text-purple-400 animate-pulse">Running extraction engine...</p>}
                  </div>
                )}

                {activeTab === 'text' && (
                  <div className="space-y-6">
                    <textarea
                      className="w-full h-44 bg-black/40 border border-white/5 rounded-[1.5rem] p-6 text-white text-sm focus:outline-none focus:border-purple-500/30 transition-all resize-none font-mono"
                      placeholder={"Paste SMS alerts here, one per line:\n\nINFO: Rs. 5000 debited to SBI Bank on 25-03-2026\nINFO: Rs. 2000 credited from Razorpay on 25-03-2026"}
                      value={smsText} onChange={e => setSmsText(e.target.value)} />
                    <button disabled={isProcessing || !smsText.trim()} onClick={handleSMSSubmit}
                      className="w-full py-4 rounded-[1.5rem] bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3">
                      {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> Parsing...</> : "Run Regex Parser"}
                    </button>
                    <p className="text-[10px] text-muted-foreground italic text-center">Expects keywords like 'debited' or 'credited'.</p>
                  </div>
                )}

                {activeTab === 'subscription' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] text-white/40 uppercase font-black tracking-widest ml-1">Vendor</label>
                        <input type="text" placeholder="AWS, Rent..." value={subVendor} onChange={e => setSubVendor(e.target.value)}
                          className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-white text-sm focus:border-purple-500/30 outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-white/40 uppercase font-black tracking-widest ml-1">Amount</label>
                        <input type="number" placeholder="0.00" value={subAmount} onChange={e => setSubAmount(e.target.value)}
                          className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-white text-sm focus:border-purple-500/30 outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-white/40 uppercase font-black tracking-widest ml-1">Frequency</label>
                        <select value={subFrequency} onChange={e => setSubFrequency(e.target.value as Frequency)}
                          className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-white text-sm focus:border-purple-500/30 outline-none appearance-none">
                          <option>Monthly</option><option>Weekly</option><option>Yearly</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-white/40 uppercase font-black tracking-widest ml-1">Next Due</label>
                        <input type="date" value={subDueDate} onChange={e => setSubDueDate(e.target.value)}
                          className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-white/50 text-sm focus:border-purple-500/30 outline-none [color-scheme:dark]" />
                      </div>
                    </div>
                    <button disabled={isProcessing || !subVendor || !subAmount || !subDueDate} onClick={handleSubscriptionSubmit}
                      className="w-full py-4 rounded-[1.5rem] bg-purple-500 text-white font-black uppercase tracking-[0.2em] transition-all shadow-[0_10px_30px_rgba(168,85,247,0.3)] flex items-center justify-center gap-3">
                      {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> Projecting...</> : "Register Plan"}
                    </button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Pipeline & Results Panel */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="lg:col-span-7 space-y-8">

            {/* Pipeline Stage Visualization */}
            <div className="glass-card rounded-[2rem] p-8 border border-white/5 flex justify-between items-center relative overflow-hidden bg-white/[0.01]">
              <Step label="Ingest" index={0} current={pipelineStep} status={pipelineStatus} />
              <div className="flex-1 h-px bg-white/5 mx-6" />
              <Step label="Normalize" index={1} current={pipelineStep} status={pipelineStatus} />
              <div className="flex-1 h-px bg-white/5 mx-6" />
              <Step label="Deduplicate" index={2} current={pipelineStep} status={pipelineStatus} />
              <div className="flex-1 h-px bg-white/5 mx-6" />
              <Step label="Commit" index={3} current={pipelineStep} status={pipelineStatus} />
            </div>

            {/* Error Alert */}
            <AnimatePresence>
              {pipelineStatus === 'error' && errorMsg && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-300 font-medium">{errorMsg}</p>
                  <button onClick={() => setPipelineStatus('idle')} className="ml-auto text-red-400 hover:text-red-300">
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Results Tracking */}
            <div className="glass-card rounded-[2.5rem] p-8 border border-white/5 min-h-[400px] relative overflow-hidden">
               <div className="flex justify-between items-end mb-8">
                 <div>
                   <h2 className="text-2xl font-display font-bold text-white tracking-tight">System Ledger Staging</h2>
                   <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mt-1">Validated & Normalized Operations</p>
                 </div>
                 <div className="flex gap-3">
                   {stagedObligations.length > 0 && (
                     <div className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                       {stagedObligations.length} Synchronized
                     </div>
                   )}
                   <div className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border", 
                     pipelineStatus === 'done' ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/20" :
                     pipelineStatus === 'error' ? "bg-red-500/20 text-red-300 border-red-500/20" :
                     isProcessing ? "bg-purple-500/20 text-purple-300 border-purple-500/20 animate-pulse" :
                     "bg-white/5 text-white/30 border-white/10")}>
                     {pipelineStatus === 'done' ? "Succeeded" : pipelineStatus === 'error' ? "Halted" : isProcessing ? "In Progress" : "Standby"}
                   </div>
                 </div>
               </div>

               <div className="bg-black/30 rounded-[1.5rem] border border-white/5 overflow-x-auto custom-scrollbar-hidden">
                <table className="w-full text-left">
                  <thead className="text-[10px] text-white/30 uppercase font-black tracking-widest border-b border-white/5">
                    <tr>
                      <th className="px-6 py-5">Origin/Entity</th>
                      <th className="px-6 py-5 text-right">Value</th>
                      <th className="px-6 py-5">Maturity</th>
                      <th className="px-6 py-5">Source</th>
                      <th className="px-6 py-5">Auth Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {stagedObligations.length === 0 ? (
                      <tr><td colSpan={5} className="px-6 py-20 text-center text-white/20 italic font-display">
                        Neural pipeline awaiting transaction input...
                      </td></tr>
                    ) : (
                      stagedObligations.slice(-20).reverse().map(ob => (
                        <tr key={ob.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-6 py-6">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">{ob.counterparty}</span>
                              <span className="text-[10px] text-white/30 uppercase tracking-tighter mt-1">{ob.type}</span>
                            </div>
                          </td>
                          <td className="px-6 py-6 text-right font-mono font-bold text-white tracking-widest">
                            {formatCurrency(ob.amount)}
                          </td>
                          <td className="px-6 py-6 font-mono text-xs text-white/50">{ob.due_date}</td>
                          <td className="px-6 py-6 text-white/40 text-[10px] font-bold uppercase tracking-widest">{ob.source}</td>
                          <td className="px-6 py-6">
                            <span className={cn("px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                              ob.status === 'verified' ? "bg-emerald-500/10 text-emerald-400" :
                              ob.status === 'flagged' ? "bg-amber-500/10 text-amber-400" : "bg-white/5 text-white/40")}>
                              {ob.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

function Step({ label, index, current, status }: { label: string; index: number; current: number; status: PipelineStatus }) {
  const isDone = current > index || status === 'done';
  const isActive = current === index && status !== 'idle' && status !== 'done' && status !== 'error';
  return (
    <div className="flex flex-col items-center gap-4">
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all duration-500",
        isDone ? "border-emerald-500 bg-emerald-500/20 text-emerald-400" :
        isActive ? "border-purple-500 bg-purple-500/20 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.4)]" :
        "border-white/10 bg-black/40 text-white/10")}>
        {isDone ? <CheckCircle2 className="w-6 h-6" /> :
         isActive ? <Loader2 className="w-6 h-6 animate-spin" /> :
         <div className="w-2 h-2 rounded-full bg-current" />}
      </div>
      <span className={cn("text-[9px] font-black uppercase tracking-[0.2em]", (isDone || isActive) ? "text-white" : "text-white/20")}>{label}</span>
    </div>
  );
}

function DatabaseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/>
    </svg>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }
