'use client';

import { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Calendar, Filter, TrendingUp, ChevronRight } from 'lucide-react';

export default function PolicyTrackingPage() {
  const [trends, setTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats/trends')
      .then(res => res.json())
      .then(data => {
        setTrends(data);
        setLoading(true); // Small delay to show transitions
        setTimeout(() => setLoading(false), 500);
      });
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Policy Sentiment & Trend Tracking</h1>
        <p style={{ color: 'var(--muted-foreground)' }}>Monitoring the velocity and volume of policy-related discussions across legislative forums.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
        {/* Main Chart Section */}
        <div className="glass" style={{ padding: '2rem', minHeight: '500px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} color="var(--primary)" /> Discussion Momentum
            </h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="glass" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}>1 Month</button>
              <button className="glass" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', borderColor: 'var(--primary)' }}>3 Months</button>
              <button className="glass" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}>1 Year</button>
            </div>
          </div>

          <div style={{ height: '400px', width: '100%' }}>
            {loading ? (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p>Loading historical trend data...</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="var(--muted-foreground)" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="var(--muted-foreground)" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                      borderColor: 'var(--border)',
                      borderRadius: '8px',
                      color: 'white'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="var(--primary)" 
                    fillOpacity={1} 
                    fill="url(#colorCount)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Sidebar Insights */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={18} /> Recent Peaks
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {trends.slice(-3).reverse().map((t, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--muted-foreground)' }}>{t.date}</span>
                  <span style={{ fontWeight: 'bold' }}>{t.count} records</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={18} /> Active Topics
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {['Healthcare', 'Defense', 'Energy', 'Welfare', 'Economy'].map(tag => (
                <span key={tag} style={{ 
                  fontSize: '0.75rem', 
                  padding: '0.25rem 0.6rem', 
                  borderRadius: '12px', 
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border)'
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <a href="/admin/data" className="button-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            Add New Data Source <ChevronRight size={16} />
          </a>
        </div>
      </div>
    </div>
  );
}
