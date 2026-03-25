import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/Sidebar";
import { UploadCloud, MessageSquare, Plus, CheckCircle2, Repeat, AlertTriangle, X, Loader2 } from "lucide-react";
import { parseUnstructuredTextWithGemini, parseImageWithGemini } from "@/lib/ingestion/gemini";
import { parseSMS, parseCSVLine } from "@/lib/ingestion/parsers";
import { processDeduplicationRun } from "@/lib/ingestion/deduplication";
import { projectSubscriptionLiabilities, type Frequency } from "@/lib/ingestion/subscriptions";
import { pushObligationsToDB } from "@/lib/supabase";
import { type ValidatedObligation } from "@/lib/ingestion/normalizer";
import { cn } from "@/lib/utils";

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
  const [pipelineStep, setPipelineStep] = useState(0); // 0-3
  const [stagedObligations, setStagedObligations] = useState<ValidatedObligation[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // EXISTING DB CONTEXT - in a real app this would be fetched from Supabase
  const [dbContext] = useState<ValidatedObligation[]>([]);

  const runPipeline = useCallback(async (incoming: ValidatedObligation[]) => {
    try {
      setPipelineStep(1); setPipelineStatus('normalizing');
      await sleep(400);
      // Already normalized by parsers/gemini → skip to dedup

      setPipelineStep(2); setPipelineStatus('deduplicating');
      await sleep(500);
      const deduped = processDeduplicationRun(incoming, dbContext);

      setPipelineStep(3); setPipelineStatus('pushing');
      await sleep(400);
      const result = await pushObligationsToDB(deduped);

      if (!result.success) throw new Error("Supabase push failed");

      setStagedObligations(prev => [...prev, ...deduped]);
      setPipelineStep(4); setPipelineStatus('done');
    } catch (err: any) {
      setErrorMsg(err.message || "Pipeline failed");
      setPipelineStatus('error');
    }
  }, [dbContext]);

  // === HANDLERS ===

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
        const lines = text.split('\n').slice(1); // Skip header row
        for (const line of lines) {
          if (!line.trim()) continue;
          const ob = parseCSVLine(line);
          if (ob) parsed.push(ob);
        }
        if (!parsed.length) throw new Error("CSV parsed but no valid lines found. Expected: Date, Description, Amount.");
      } else {
        // For images, use Gemini Vision
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
      const projected = projectSubscriptionLiabilities({
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
  }, []);

  const isProcessing = ['ingesting', 'normalizing', 'deduplicating', 'pushing'].includes(pipelineStatus);

  const tabs = [
    { id: 'manual', icon: Plus, label: "Manual" },
    { id: 'upload', icon: UploadCloud, label: "Upload" },
    { id: 'text', icon: MessageSquare, label: "SMS/Text" },
    { id: 'subscription', icon: Repeat, label: "Subscriptions" }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <div className="fixed inset-0 z-0 opacity-40 pointer-events-none mix-blend-screen"
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/bg-mesh.png)`, backgroundSize: "cover" }} />
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-6 lg:p-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.2)]">
              <DatabaseIcon className="w-5 h-5 text-purple-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Data Ingestion Hub</h1>
          </div>
          <p className="text-sm text-muted-foreground ml-12">
            Multi-modal pipeline — Parses → Normalizes → Deduplicates → Pushes to Supabase.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Input Panel */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
            className="lg:col-span-5 glass-card rounded-2xl p-6 border border-white/10">
            <div className="flex space-x-1.5 border-b border-white/10 pb-4 mb-6 flex-wrap gap-y-2">
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                      : "text-muted-foreground hover:bg-white/5 hover:text-white border border-transparent"
                  }`}>
                  <tab.icon className="w-3.5 h-3.5" />{tab.label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="min-h-[300px]">

                {activeTab === 'manual' && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-white/80 mb-2 block">Natural Language Entry</label>
                      <textarea
                        className="w-full h-36 bg-black/40 border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all resize-none"
                        placeholder="e.g., 'I received 500rs for catering today' or 'Paid $1200 for rent on the 1st'"
                        value={manualText} onChange={e => setManualText(e.target.value)} />
                      <p className="text-xs text-muted-foreground mt-1">⚡ Powered by Gemini Vision</p>
                    </div>
                    <button disabled={isProcessing || !manualText.trim()} onClick={handleManualSubmit}
                      className="w-full py-3 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-bold transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                      {isProcessing ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : "Extract & Ingest"}
                    </button>
                  </div>
                )}

                {activeTab === 'upload' && (
                  <div className="space-y-4">
                    <div
                      onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={cn("flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-xl cursor-pointer transition-all", isDragging ? "border-purple-400 bg-purple-500/10" : "border-white/20 bg-white/5 hover:bg-white/10 hover:border-purple-400")}>
                      <UploadCloud className={cn("w-8 h-8 mb-3", isDragging ? "text-purple-400" : "text-white/40")} />
                      <p className="text-sm text-white/80 font-medium">Drag & drop or click to upload</p>
                      <p className="text-xs text-muted-foreground mt-1">CSV for bank statements · JPG/PNG for receipts</p>
                      <input ref={fileInputRef} type="file" className="hidden" accept=".csv,.jpg,.jpeg,.png,.pdf"
                        onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }} />
                    </div>
                    {isProcessing && <p className="text-xs text-center text-purple-400 animate-pulse">Parsing file with Gemini...</p>}
                  </div>
                )}

                {activeTab === 'text' && (
                  <div className="space-y-4">
                    <textarea
                      className="w-full h-48 bg-black/40 border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-purple-500/50 resize-none font-mono"
                      placeholder={"Paste SMS alerts here, one per line:\n\nINFO: Rs. 5000 debited to SBI Bank on 25-03-2026\nINFO: Rs. 2000 credited from Razorpay on 25-03-2026"}
                      value={smsText} onChange={e => setSmsText(e.target.value)} />
                    <button disabled={isProcessing || !smsText.trim()} onClick={handleSMSSubmit}
                      className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                      {isProcessing ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : "Run Regex Parser"}
                    </button>
                  </div>
                )}

                {activeTab === 'subscription' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-white/80 mb-1.5 block">Vendor/Service</label>
                        <input type="text" placeholder="AWS, Netflix, Rent..." value={subVendor} onChange={e => setSubVendor(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:border-purple-500/50 outline-none" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-white/80 mb-1.5 block">Amount (₹/$)</label>
                        <input type="number" placeholder="50.00" value={subAmount} onChange={e => setSubAmount(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:border-purple-500/50 outline-none" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-white/80 mb-1.5 block">Frequency</label>
                        <select value={subFrequency} onChange={e => setSubFrequency(e.target.value as Frequency)}
                          className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:border-purple-500/50 outline-none appearance-none">
                          <option>Monthly</option><option>Weekly</option><option>Yearly</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-white/80 mb-1.5 block">Next Due Date</label>
                        <input type="date" value={subDueDate} onChange={e => setSubDueDate(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white/50 text-sm focus:border-purple-500/50 outline-none [color-scheme:dark]" />
                      </div>
                    </div>
                    <button disabled={isProcessing || !subVendor || !subAmount || !subDueDate} onClick={handleSubscriptionSubmit}
                      className="w-full py-3 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-bold transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                      {isProcessing ? <><Loader2 className="w-4 h-4 animate-spin" /> Projecting...</> : "Register Recurring Plan"}
                    </button>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Right Panel */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="lg:col-span-7 space-y-5">

            {/* Pipeline Steps */}
            <div className="glass-card rounded-2xl p-5 border border-white/10 flex justify-between items-center">
              <Step label="Ingest" index={0} current={pipelineStep} status={pipelineStatus} />
              <div className="flex-1 h-px bg-white/10 mx-3" />
              <Step label="Normalize" index={1} current={pipelineStep} status={pipelineStatus} />
              <div className="flex-1 h-px bg-white/10 mx-3" />
              <Step label="Deduplicate" index={2} current={pipelineStep} status={pipelineStatus} />
              <div className="flex-1 h-px bg-white/10 mx-3" />
              <Step label="Push to DB" index={3} current={pipelineStep} status={pipelineStatus} />
            </div>

            {/* Error Alert */}
            <AnimatePresence>
              {pipelineStatus === 'error' && errorMsg && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-300">{errorMsg}</p>
                  <button onClick={() => setPipelineStatus('idle')} className="ml-auto text-red-400 hover:text-red-300">
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Parsed Output Table */}
            <div className="glass-card rounded-2xl p-6 border border-white/10 min-h-[320px]">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-white">Parsed Obligations Staging</h2>
                <div className="flex items-center gap-2">
                  {stagedObligations.length > 0 && (
                    <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold tracking-wider uppercase">
                      {stagedObligations.length} Ingested
                    </span>
                  )}
                  <span className={cn("px-2.5 py-1 rounded text-[10px] font-bold tracking-wider uppercase", 
                    pipelineStatus === 'done' ? "bg-emerald-500/20 text-emerald-300" :
                    pipelineStatus === 'error' ? "bg-red-500/20 text-red-300" :
                    isProcessing ? "bg-purple-500/20 text-purple-300 animate-pulse" :
                    "bg-amber-500/20 text-amber-300")}>
                    {pipelineStatus === 'done' ? "Synced" : pipelineStatus === 'error' ? "Error" : isProcessing ? "Processing..." : "Awaiting Input"}
                  </span>
                </div>
              </div>

              <div className="bg-black/30 rounded-xl border border-white/5 overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">Counterparty</th>
                      <th className="px-4 py-3 font-medium text-right">Amount</th>
                      <th className="px-4 py-3 font-medium">Due Date</th>
                      <th className="px-4 py-3 font-medium">Source</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stagedObligations.length === 0 ? (
                      <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground italic">
                        Awaiting data input to begin parsing pipeline.
                      </td></tr>
                    ) : (
                      stagedObligations.slice(-20).reverse().map(ob => (
                        <tr key={ob.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="px-4 py-3">
                            <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                              ob.type === 'payable' ? "bg-red-500/20 text-red-300" : "bg-emerald-500/20 text-emerald-300")}>
                              {ob.type}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-white/80 max-w-[120px] truncate">{ob.counterparty}</td>
                          <td className="px-4 py-3 text-white font-mono text-right">₹{ob.amount.toLocaleString()}</td>
                          <td className="px-4 py-3 text-white/60 text-xs">{ob.due_date}</td>
                          <td className="px-4 py-3 text-white/50 text-xs">{ob.source}</td>
                          <td className="px-4 py-3">
                            <span className={cn("text-[10px] font-bold",
                              ob.status === 'verified' ? "text-emerald-400" :
                              ob.status === 'flagged' ? "text-amber-400" : "text-white/40")}>
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
    <div className="flex flex-col items-center gap-2">
      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all",
        isDone ? "border-emerald-500 bg-emerald-500 text-white" :
        isActive ? "border-purple-500 bg-purple-500/20 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.5)]" :
        "border-white/20 bg-black/40 text-muted-foreground")}>
        {isDone ? <CheckCircle2 className="w-4 h-4" /> :
         isActive ? <Loader2 className="w-4 h-4 animate-spin" /> :
         <div className="w-2 h-2 rounded-full bg-current" />}
      </div>
      <span className={cn("text-xs font-bold uppercase tracking-wider", (isDone || isActive) ? "text-white" : "text-muted-foreground")}>{label}</span>
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
