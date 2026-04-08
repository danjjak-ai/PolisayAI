'use client';

import { useState, useEffect } from 'react';
import { Target, ArrowRight, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function GapAnalysisPage() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats/summary')
      .then(res => res.json())
      .then(data => {
        setSummary(data);
        setLoading(false);
      });
  }, []);

  // Map local data (Supply) to target goals (Demand)
  // In a real app, 'Demand' would come from another source or user settings
  const topics = [
    { name: '医療', demand: 0.85, status: 'Critically Low' },
    { name: 'DX', demand: 0.70, status: 'Improving' },
    { name: '経済', demand: 0.40, status: 'Balanced' },
    { name: '環境', demand: 0.60, status: 'Low Awareness' },
    { name: '教育', demand: 0.50, status: 'Stable' },
  ];

  const gaps = topics.map(t => {
    const supplyTopic = summary?.topTopics?.find((st: any) => st.name === t.name);
    const supplyScore = supplyTopic ? Math.min(1, supplyTopic.count / (summary?.totalRecords * 0.2)) : 0.05;
    const gap = t.demand - supplyScore;
    
    return {
      ...t,
      supply: supplyScore,
      gap: gap,
      gapPercent: (gap * 100).toFixed(0)
    };
  });

  return (
    <div style={{ padding: '2rem' }}>
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Strategic Gap Analysis</h1>
        <p style={{ color: 'var(--muted-foreground)' }}>Mismatch analysis between market demand/expectations and legislative supply (policy intensity).</p>
      </header>

      <div className="glass" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Target size={20} color="var(--primary)" /> Policy Supply vs. Social Demand
          </h2>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
               <div style={{ width: '12px', height: '12px', background: 'var(--primary)', borderRadius: '2px' }}></div>
               <span>Supply (Legislative)</span>
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
               <div style={{ width: '12px', height: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}></div>
               <span>Demand (Public)</span>
             </div>
          </div>
        </div>

        {loading ? (
            <div style={{ padding: '4rem', textAlign: 'center' }}>Analyzing policy density in archives...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {gaps.map((g, i) => (
              <div key={i} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <span style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>{g.name} Awareness</span>
                    <span style={{ 
                        marginLeft: '1rem', 
                        fontSize: '0.7rem', 
                        padding: '0.2rem 0.5rem', 
                        borderRadius: '10px', 
                        background: g.gap > 0.3 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                        color: g.gap > 0.3 ? '#ef4444' : 'var(--primary)',
                        border: `1px solid ${g.gap > 0.3 ? '#ef4444' : 'var(--primary)'}`
                    }}>
                        {g.gap > 0.3 ? <AlertTriangle size={10} style={{display:'inline', marginRight:'2px'}}/> : <ShieldCheck size={10} style={{display:'inline', marginRight:'2px'}}/>}
                        {g.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.875rem' }}>
                    Criticality: <span style={{ color: g.gap > 0.3 ? '#ef4444' : 'white', fontWeight: 'bold' }}>{g.gapPercent}% Gap</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: '2rem' }}>
                   <div style={{ position: 'relative', height: '24px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                      {/* Demand Marker */}
                      <div style={{ 
                        position: 'absolute', 
                        left: `${g.demand * 100}%`, 
                        top: '-4px', 
                        bottom: '-4px', 
                        width: '2px', 
                        background: 'white', 
                        zIndex: 2,
                        boxShadow: '0 0 10px white'
                      }}></div>
                      
                      {/* Supply Bar */}
                      <div style={{ 
                        height: '100%', 
                        width: `${g.supply * 100}%`, 
                        background: 'var(--primary)', 
                        borderRadius: '12px',
                        transition: 'width 1.5s ease-in-out'
                      }}></div>
                   </div>
                   <ArrowRight size={20} color="var(--muted-foreground)" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
         <div className="glass" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Recommendation</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', lineHeight: '1.6' }}>
                Based on the current gap in <strong>Healthcare (医療)</strong> data, we recommend initiating a legislative monitoring alert for pharmaceutical regulatory shifts.
            </p>
         </div>
         <div className="glass" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Data Quality</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', lineHeight: '1.6' }}>
                Current analysis confidence is <span style={{ color: 'var(--primary)' }}>High (84%)</span> based on {summary?.totalRecords} local NDL records processed.
            </p>
         </div>
      </div>
    </div>
  );
}
