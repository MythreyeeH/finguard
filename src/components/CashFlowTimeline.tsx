import { Area, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine, CartesianGrid, AreaChart } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { motion } from 'framer-motion';

interface CashFlowTimelineProps {
  data: any[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-4 rounded-xl border border-white/20 min-w-[200px] backdrop-blur-xl">
        <p className="text-white font-medium mb-2">{`Day ${label}`}</p>
        <div className="space-y-2">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-xs text-white/70">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}:
              </span>
              <span className="text-xs font-bold text-white">{formatCurrency(entry.value || 0)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export function CashFlowTimeline({ data }: CashFlowTimelineProps) {
  // Find insolvency point (first day where baseline hits 0 after day 0)
  const insolvencyDay = data.findIndex(d => d.baseline === 0 && d.day > 0);

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-display font-semibold text-white">Cash Flow Timeline</h2>
          <p className="text-sm text-muted-foreground mt-1">90-day liquidity projection: Inflows vs Outflows</p>
        </div>
        
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
            <span className="text-xs text-muted-foreground">Inflows</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/50" />
            <span className="text-xs text-muted-foreground">Outflows</span>
          </div>
        </div>
      </div>

      <div className="flex-grow w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
              dataKey="day" 
              stroke="rgba(255,255,255,0.2)" 
              tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 10}} 
              tickFormatter={(v) => v % 10 === 0 ? `D${v}` : ''}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.2)" 
              tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 10}}
              tickFormatter={(v) => `$${v/1000}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {insolvencyDay !== -1 && (
              <ReferenceLine 
                x={insolvencyDay} 
                stroke="#ef4444" 
                strokeWidth={2} 
                strokeDasharray="3 3" 
                label={{ 
                  position: 'top', 
                  value: '❌ Insolvency', 
                  fill: '#f87171', 
                  fontSize: 10,
                  fontWeight: 'bold'
                }} 
              />
            )}

            <Area 
              type="monotone" 
              name="Cash Balance"
              dataKey="baseline" 
              stroke="#3b82f6" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorCash)" 
            />

            <Line 
              type="step" 
              name="Inflows"
              dataKey="inflow" 
              stroke="#10b981" 
              strokeWidth={0}
              dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }}
            />

            <Line 
              type="step" 
              name="Outflows"
              dataKey="outflow" 
              stroke="#ef4444" 
              strokeWidth={0}
              dot={{ r: 4, fill: '#ef4444', strokeWidth: 0 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
