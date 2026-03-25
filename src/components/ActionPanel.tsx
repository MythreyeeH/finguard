import { Mail, Calendar, CreditCard, ArrowRight, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ActionPanelProps {
  onAction?: (actionId: string) => void;
}

export function ActionPanel({ onAction }: ActionPanelProps) {
  const actions = [
    { 
      id: "email",
      label: "Send Negotiation Email", 
      icon: Mail, 
      color: "from-blue-500 to-cyan-500", 
      description: "AI-drafted deferral request for Supplier B" 
    },
    { 
      id: "reschedule",
      label: "Reschedule Payment", 
      icon: Calendar, 
      color: "from-amber-500 to-orange-500", 
      description: "Move Rent (HQ) to next billing cycle" 
    },
    { 
      id: "emi",
      label: "Convert to EMI", 
      icon: CreditCard, 
      color: "from-emerald-500 to-teal-500", 
      description: "Split Supplier D into 3 installments" 
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
          <Zap className="w-5 h-5 text-emerald-400 fill-emerald-400" />
        </div>
        <div>
          <h2 className="text-xl font-display font-bold text-white tracking-tight">Product Layer</h2>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black mt-1">Ready for Execution</p>
        </div>
      </div>

      <div className="space-y-4">
        {actions.map((action, idx) => (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => onAction?.(action.id)}
            className="group p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all cursor-pointer relative overflow-hidden active:scale-[0.98]"
          >
            <div className="flex items-center gap-5 relative z-10">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-500 group-hover:scale-110 bg-gradient-to-br", 
                action.color
              )}>
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors uppercase tracking-wider">
                  {action.label}
                </h3>
                <p className="text-[11px] text-white/40 truncate mt-1 leading-relaxed">
                  {action.description}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="w-4 h-4 text-white" />
              </div>
            </div>
            
            {/* Background Glow on Hover */}
            <div className={cn(
              "absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity bg-gradient-to-r",
              action.color
            )} />
          </motion.div>
        ))}
      </div>

      <div className="mt-auto pt-10">
        <div className="bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-[2rem] text-center backdrop-blur-sm">
          <p className="text-[10px] text-emerald-500/60 uppercase font-black tracking-[0.2em] mb-3">System Confidence</p>
          <div className="flex items-center justify-center gap-2">
            <div className="h-1.5 w-24 bg-white/5 rounded-full overflow-hidden">
               <div className="h-full bg-emerald-500 w-[94%]" />
            </div>
            <span className="text-sm font-bold text-white">94%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
