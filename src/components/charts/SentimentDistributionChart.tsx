'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface SentimentDistributionChartProps {
  data: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

export default function SentimentDistributionChart({ data }: SentimentDistributionChartProps) {
  const chartData = [
    { name: '肯定的', value: data.positive, color: '#10b981' }, // emerald-500
    { name: '中立的', value: data.neutral, color: '#f59e0b' },  // amber-500
    { name: '否定的', value: data.negative, color: '#ef4444' }   // red-500
  ].filter(d => d.value > 0);

  return (
    <div style={{ width: '100%', height: 300 }}>
      <h3 style={{ fontSize: '1rem', textAlign: 'center', marginBottom: '1rem' }}>ソーシャル世論感情分布</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px' }}
            itemStyle={{ color: 'white' }}
          />
          <Legend verticalAlign="bottom" height={36}/>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
