import { Upload, FileText, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function DataIngestionPanel() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Quick Ingest</h3>
        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold uppercase tracking-wider">OCR ACTIVE</span>
      </div>

      <motion.div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); setUploaded(true); }}
        className={cn(
          "flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all duration-300",
          isDragging ? "border-emerald-500 bg-emerald-500/5 scale-[0.98]" : "border-white/10 bg-white/5",
          uploaded ? "border-emerald-500/50 bg-emerald-500/5" : ""
        )}
      >
        {uploaded ? (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center p-4">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-white">Invoice_042.pdf</p>
            <p className="text-[10px] text-emerald-400 mt-1">Ingested successfully</p>
          </motion.div>
        ) : (
          <div className="text-center p-4">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
              <Upload className="w-5 h-5 text-white/40" />
            </div>
            <p className="text-xs font-medium text-white/80">Drop invoices or PDFs here</p>
            <p className="text-[10px] text-white/40 mt-1">Max 10MB · SOC2 Secure</p>
          </div>
        )}
      </motion.div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-white/3 border border-white/5">
          <FileText className="w-3 h-3 text-white/40" />
          <span className="text-[10px] text-white/60 truncate flex-1">Last processed: Amazon_AWS_Mar24.pdf</span>
          <span className="text-[10px] text-emerald-400 font-bold">$1,240</span>
        </div>
      </div>
    </div>
  );
}
