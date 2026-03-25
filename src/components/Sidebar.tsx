import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Activity, 
  FileText, 
  ShieldAlert, 
  Settings, 
  UploadCloud, 
  Zap, 
  Target,
  BarChart3,
  MessageSquare,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Main View", href: "/", category: "Overview" },
  { icon: BarChart3, label: "Simulator", href: "/simulator", category: "Strategy" },
  { icon: ShieldAlert, label: "Obligations", href: "/obligations", category: "Operations" },
  { icon: MessageSquare, label: "Negotiation Hub", href: "/negotiation", category: "Operations" },
  { icon: Zap, label: "Execution Center", href: "/actions", category: "Strategy" },
  { icon: UploadCloud, label: "Data Ingest", href: "/ingestion", category: "System" },
];

export function Sidebar() {
  const [location] = useLocation();
  const { user, signOut } = useAuth();

  const groupedNav = NAV_ITEMS.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof NAV_ITEMS>);

  return (
    <aside className="fixed left-0 top-0 h-screen w-20 lg:w-80 glass-card border-x-0 border-y-0 flex flex-col transition-all duration-300 z-50 overflow-hidden bg-background/95 backdrop-blur-xl">
      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col p-4 gap-8">
        
        {/* LOGO SECTION */}
        <div className="flex items-center gap-3 px-2 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-400 to-cyan-500 shadow-lg shadow-emerald-500/20 flex items-center justify-center shrink-0">
            <span className="text-white font-bold font-display text-2xl">F</span>
          </div>
          <div className="hidden lg:block">
            <h1 className="font-display font-bold text-xl text-white leading-none">Finguard.</h1>
            <p className="text-[10px] text-emerald-400 uppercase font-black tracking-widest mt-1 opacity-60">Intelligence Hub</p>
          </div>
        </div>

        {/* NAVIGATION SECTIONS */}
        <div className="flex flex-col gap-8">
          {Object.entries(groupedNav).map(([category, items]) => (
            <div key={category} className="flex flex-col gap-2">
              <h4 className="hidden lg:block px-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-1">
                {category}
              </h4>
              <nav className="flex flex-col gap-1">
                {items.map((item) => {
                  const isActive = location === item.href;
                  return (
                    <Link key={item.href} href={item.href} className="block">
                      <div className={cn(
                        "flex items-center px-4 py-3 rounded-2xl transition-all duration-300 group cursor-pointer relative",
                        isActive 
                          ? "bg-emerald-500/10 text-white shadow-[0_0_20px_rgba(16,185,129,0.05)]" 
                          : "text-muted-foreground hover:bg-white/5 hover:text-white"
                      )}>
                        {isActive && (
                          <div className="absolute left-0 w-1 h-6 bg-emerald-500 rounded-r-full" />
                        )}
                        <item.icon className={cn(
                          "w-5 h-5 transition-transform duration-300 group-hover:scale-110", 
                          isActive ? "text-emerald-400" : "group-hover:text-emerald-400"
                        )} />
                        <span className="hidden lg:block ml-4 text-sm font-bold tracking-tight">{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </div>

      {/* USER CONTEXT & SETTINGS */}
      <div className="p-4 border-t border-white/5 bg-background/50">
        <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition-all group cursor-pointer">
          <div className="relative">
             <img 
               src={`${import.meta.env.BASE_URL}images/avatar.png`} 
               alt="Alex Chen" 
               className="w-10 h-10 rounded-full border border-emerald-500/30 object-cover bg-black group-hover:border-emerald-400 transition-colors"
             />
             <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-background rounded-full shadow-lg shadow-emerald-500/50" />
          </div>
          <div className="hidden lg:block overflow-hidden">
            <p className="text-sm font-bold text-white truncate group-hover:text-emerald-400 transition-colors">{user?.email || "Finguard Exec"}</p>
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest truncate mt-0.5">Authenticated Tenant</p>
          </div>
        </div>
        
        <Link href="/settings" className="block mt-2">
          <div className={cn(
            "flex items-center px-4 py-3 rounded-2xl transition-all group cursor-pointer",
            location === "/settings" ? "bg-white/10 text-white" : "text-muted-foreground hover:bg-white/5 hover:text-white"
          )}>
            <Settings className={cn("w-5 h-5", location === "/settings" ? "text-emerald-400" : "group-hover:text-emerald-400")} />
            <span className="hidden lg:block ml-4 text-sm font-bold tracking-tight">System Preferences</span>
          </div>
        </Link>

        <button onClick={signOut} className={cn(
            "w-full mt-2 flex items-center px-4 py-3 rounded-2xl transition-all group cursor-pointer text-muted-foreground hover:bg-red-500/10 hover:text-red-400"
          )}>
            <LogOut className="w-5 h-5 group-hover:text-red-400 text-muted-foreground" />
            <span className="hidden lg:block ml-4 text-sm font-bold tracking-tight">Disconnect Session</span>
        </button>
      </div>
    </aside>
  );
}
