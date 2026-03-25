import { Link, useLocation } from "wouter";
import { LayoutDashboard, Activity, FileText, ShieldAlert, Settings, LogOut, Database } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Activity, label: "Simulator", href: "/simulator" },
  { icon: ShieldAlert, label: "Obligations", href: "/obligations" },
  { icon: FileText, label: "Negotiation Hub", href: "/negotiation" },
  { icon: Database, label: "Data Ingestion", href: "/ingestion" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-screen w-20 lg:w-64 glass-card border-l-0 border-y-0 flex flex-col justify-between transition-all duration-300 z-50">
      <div>
        <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-400 to-cyan-500 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
            <span className="text-white font-bold font-display text-lg">F</span>
          </div>
          <span className="hidden lg:block ml-3 font-display font-bold text-xl text-white tracking-wide">
            Finguard.
          </span>
        </div>

        <nav className="mt-8 px-3 flex flex-col gap-2">
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href} className="block">
                <div
                  className={cn(
                    "flex items-center px-3 lg:px-4 py-3 rounded-xl transition-all duration-200 group cursor-pointer",
                    isActive
                      ? "bg-white/10 text-white shadow-inner border border-white/5"
                      : "text-muted-foreground hover:bg-white/5 hover:text-white"
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-5 h-5 transition-colors",
                      isActive ? "text-emerald-400" : "group-hover:text-emerald-400"
                    )}
                  />
                  <span className="hidden lg:block ml-3 font-medium text-sm">
                    {item.label}
                  </span>
                  
                  {isActive && (
                    <div className="hidden lg:block ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center justify-center lg:justify-start gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
          <img 
            src={`${import.meta.env.BASE_URL}images/avatar.png`} 
            alt="User" 
            className="w-10 h-10 rounded-full border-2 border-emerald-500/30 object-cover bg-black"
          />
          <div className="hidden lg:block">
            <p className="text-sm font-semibold text-white">Alex Chen</p>
            <p className="text-xs text-muted-foreground">CFO</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
