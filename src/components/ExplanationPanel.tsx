import { Sparkles, Info, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

interface ExplanationPanelProps {
  explanation: string;
}

export function ExplanationPanel({ explanation }: ExplanationPanelProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-blue-400" />
        </div>
        <h2 className="text-xl font-display font-bold text-white tracking-tight">AI Strategy Insight</h2>
      </div>
      
      <div className="flex-grow p-6 rounded-[2rem] bg-blue-500/5 border border-blue-500/10 relative overflow-hidden group backdrop-blur-md">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
          <Info className="w-32 h-32 text-blue-400" />
        </div>
        
        <motion.div 
          key={explanation}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10"
        >
          <p className="text-lg font-medium text-white/90 leading-relaxed italic font-display">
            “{explanation}”
          </p>
        </motion.div>
        
        <div className="mt-8 flex items-center gap-6 text-[10px] text-blue-400/60 uppercase font-black tracking-[0.2em] relative z-10">
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            Risk-Optimized
          </span>
          <span className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Penalty-Aware
          </span>
          <span className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Strategy locked
          </span>
        </div>
      </div>
    </div>
  );
}
