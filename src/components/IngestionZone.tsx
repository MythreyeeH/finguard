import { useState } from "react";
import { UploadCloud, FileText, CheckCircle2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function IngestionZone() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadState, setUploadState] = useState<'idle' | 'scanning' | 'done'>('idle');

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (uploadState !== 'idle') return;
    
    setUploadState('scanning');
    setTimeout(() => {
      setUploadState('done');
      setTimeout(() => setUploadState('idle'), 4000); // Reset after 4s
    }, 2000);
  };

  return (
    <div className="glass-card rounded-2xl p-6 h-full flex flex-col">
      <h3 className="text-lg font-display font-semibold text-white mb-4">Ingestion Zone</h3>
      
      <div 
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "flex-grow rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center transition-all duration-300 relative overflow-hidden",
          isDragging ? "border-emerald-400 bg-emerald-400/5" : "border-white/20 bg-white/5",
          uploadState === 'done' ? "border-emerald-500/50 bg-emerald-500/10" : ""
        )}
      >
        <AnimatePresence mode="wait">
          {uploadState === 'idle' && (
            <motion.div 
              key="idle"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center"
            >
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-3">
                <UploadCloud className="w-6 h-6 text-white/70" />
              </div>
              <p className="text-sm font-medium text-white">Drop invoices or PDFs here</p>
              <p className="text-xs text-muted-foreground mt-1">OCR will auto-extract obligations</p>
            </motion.div>
          )}

          {uploadState === 'scanning' && (
            <motion.div 
              key="scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center w-full"
            >
              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-3" />
              <p className="text-sm font-medium text-emerald-400">Scanning document...</p>
              <div className="w-full max-w-[200px] h-1.5 bg-white/10 rounded-full mt-4 overflow-hidden">
                <motion.div 
                  className="h-full bg-emerald-400"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
              </div>
            </motion.div>
          )}

          {uploadState === 'done' && (
            <motion.div 
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center w-full text-left"
            >
              <div className="flex items-center gap-2 text-emerald-400 mb-4 w-full justify-center">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm font-medium">Extracted Successfully</span>
              </div>
              
              <div className="w-full bg-black/40 rounded-lg p-3 border border-white/10 text-xs">
                <div className="flex justify-between text-muted-foreground mb-1">
                  <span>Vendor</span>
                  <span className="text-white">Cloudflare AWS</span>
                </div>
                <div className="flex justify-between text-muted-foreground mb-1">
                  <span>Amount</span>
                  <span className="text-white">$1,240.00</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Due Date</span>
                  <span className="text-white">Oct 15, 2024</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scanning Laser Line Effect */}
        {uploadState === 'scanning' && (
          <motion.div 
            className="absolute left-0 right-0 h-0.5 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
            animate={{ top: ["0%", "100%", "0%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        )}
      </div>
    </div>
  );
}
