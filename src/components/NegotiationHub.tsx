import { useState } from "react";
import { Send, Copy, Sparkles, SlidersHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function NegotiationHub() {
  const [tone, setTone] = useState(50);
  const [copied, setCopied] = useState(false);

  const getEmailText = () => {
    if (tone < 33) {
      return "Dear Supplier B,\n\nWe are formally requesting a 14-day extension on Invoice #2847 due to temporary cash flow constraints. We value our relationship and assure you full payment will be disbursed by the extended date.\n\nSincerely,\nFinguard Finance";
    } else if (tone < 66) {
      return "Hi Supplier B Team,\n\nWe'd like to request a short 14-day extension on Invoice #2847. We're managing some current cash flow timing and this brief window would help us optimize our payables. We appreciate your partnership.\n\nBest,\nFinguard Finance";
    } else {
      return "Hey Supplier B Team,\n\nHope you're having a great week! We wanted to reach out about getting a bit more time (14 days) on Invoice #2847. Things are moving fast on our end and this quick extension helps us align things perfectly. Thanks for being such a great partner!\n\nCheers,\nFinguard Finance";
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getEmailText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />
      
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
          <Sparkles className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-display font-semibold text-white">Negotiation Hub</h2>
          <p className="text-sm text-muted-foreground">AI-Assisted Deferral Request for Supplier B</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        <div className="lg:col-span-1 space-y-6">
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-medium text-white flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-blue-400" />
                Communication Tone
              </label>
              <span className="text-xs text-blue-400 font-medium">
                {tone < 33 ? "Formal" : tone < 66 ? "Balanced" : "Friendly"}
              </span>
            </div>
            
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={tone} 
              onChange={(e) => setTone(parseInt(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all"
            />
            <div className="flex justify-between mt-2 text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
              <span>Firm / Formal</span>
              <span>Casual / Partner</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <h4 className="text-sm font-medium text-white mb-2">Context Provided to AI</h4>
            <ul className="text-xs text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-emerald-400 mt-1.5" />
                Target: Supplier B (Strategic Tier)
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-emerald-400 mt-1.5" />
                Goal: 14-day extension
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-emerald-400 mt-1.5" />
                Invoice: #2847 ($5,000)
              </li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="h-full flex flex-col">
            <div className="flex-grow p-5 rounded-t-xl bg-black/40 border border-white/10 font-mono text-sm text-white/90 whitespace-pre-wrap leading-relaxed">
              {getEmailText()}
            </div>
            <div className="p-3 rounded-b-xl bg-white/5 border-x border-b border-white/10 flex justify-end gap-3">
              <button 
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-all"
              >
                {copied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy"}
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-400 text-white text-sm font-medium transition-all shadow-[0_0_15px_rgba(59,130,246,0.4)]">
                <Send className="w-4 h-4" />
                Draft in Gmail
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckCircle({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
