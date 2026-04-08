'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DataItem {
  speaker: string;
  count: number;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export default function SpeakerVolumeChart({ data }: { data: DataItem[] }) {
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <BarChart data={data.slice(0, 8)} layout="vertical" margin={{ left: 20, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#26262b" horizontal={false} />
          <XAxis type="number" hide />
          <YAxis 
            dataKey="speaker" 
            type="category" 
            tick={{ fill: '#94a3b8', fontSize: 12 }} 
            width={100}
          />
          <Tooltip 
            contentStyle={{ background: '#141417', border: '1px solid #26262b', borderRadius: '8px' }}
            itemStyle={{ color: '#f8fafc' }}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
