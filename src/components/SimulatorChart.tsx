import { Area, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine, CartesianGrid } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { useSimulator } from '@/hooks/use-simulator';
import { motion } from 'framer-motion';

interface SimulatorChartProps {
  data: any[];
  activeScenarioId?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    // Sort payload by value descending to easily read highest cash
    const sortedPayload = [...payload].sort((a, b) => (b.value || 0) - (a.value || 0));

    return (
      <div className="glass-card p-4 rounded-xl border border-white/20 min-w-[200px]">
        <p className="text-white font-medium mb-2">{`Day ${label}`}</p>
        <div className="space-y-1">
          {sortedPayload.map((entry: any, index: number) => {
            const isBaseline = entry.dataKey === 'baseline';
            const isOptimal = entry.dataKey === 'S0';
            const isSelected = entry.dataKey !== 'S0' && entry.dataKey !== 'baseline';

            let color = 'text-white/60';
            if (isBaseline) color = 'text-red-400 font-bold';
            if (isOptimal) color = 'text-emerald-400 font-bold';

            return (
              <p key={index} className={`${color} text-sm flex items-center justify-between gap-4`}>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                  {entry.dataKey}:
                </span>
                <span>{formatCurrency(entry.value || 0)}</span>
              </p>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

export function SimulatorChart({ data, activeScenarioId = 'S0' }: SimulatorChartProps) {
  // Find exhaustion points
  const crisisExhaustionDay = data.findIndex(d => d.baseline === 0);
  const optimizedExhaustionDay = data.findIndex(d => d[activeScenarioId] === 0);
  
  const optimizedDayDisplay = optimizedExhaustionDay === -1 ? '> 30' : optimizedExhaustionDay;
  const crisisDayDisplay = crisisExhaustionDay === -1 ? '> 30' : crisisExhaustionDay;

  return (
    <div className="h-full flex flex-col relative group">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-display font-semibold text-white flex items-center gap-2">
            Decision Engine Simulator
            <div className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 tracking-wider">
              7 Scenarios Active
            </div>
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Projected cash runway across AI strategies vs default trajectory</p>
        </div>
        
        <div className="flex gap-4">
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Optimal Strategy Exhaustion</p>
            <p className="text-lg font-bold text-emerald-400 font-display">Day {optimizedDayDisplay}</p>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Default Exhaustion</p>
            <p className="text-lg font-bold text-red-400 font-display">Day {crisisDayDisplay}</p>
          </div>
        </div>
      </div>

      <div className="flex-grow w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorOptimized" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
              dataKey="day" 
              stroke="rgba(255,255,255,0.2)" 
              tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} 
              tickFormatter={(v) => `D${v}`}
              minTickGap={20}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.2)" 
              tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}}
              tickFormatter={(v) => `$${v/1000}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            
            <ReferenceLine x={0} stroke="rgba(59, 130, 246, 0.5)" strokeWidth={2} strokeDasharray="3 3" label={{ position: 'top', value: 'Today', fill: '#3b82f6', fontSize: 12 }} />
            
            {/* Baseline / Crisis */}
            <Line 
              type="monotone" 
              name="Baseline (Crisis)"
              dataKey="baseline" 
              stroke="#ef4444" 
              strokeWidth={2} 
              strokeDasharray="5 5" 
              dot={false}
              isAnimationActive={true}
            />

            {/* Sub-optimal scenarios */}
            {['S1', 'S2', 'S3', 'S4', 'S5', 'S6'].map(sc => (
              <Line 
                key={sc}
                type="monotone" 
                dataKey={sc} 
                stroke={activeScenarioId === sc ? "#3b82f6" : "rgba(255,255,255,0.15)"} 
                strokeWidth={activeScenarioId === sc ? 2 : 1} 
                dot={false}
                isAnimationActive={false}
              />
            ))}
            
            {/* Optimal S0 Scenario */}
            <Area 
              type="monotone" 
              name="S0 Optimal"
              dataKey="S0" 
              stroke="#10b981" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorOptimized)" 
              isAnimationActive={true}
              animationDuration={800}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-emerald-500/10 blur-[100px] pointer-events-none rounded-full" />
    </div>
  );
}
