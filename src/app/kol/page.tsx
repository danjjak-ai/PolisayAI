'use client';

import { useState, useEffect } from 'react';
import { User, MessageCircle, BarChart3, Search } from 'lucide-react';

interface KOLStats {
  id: string;
  name: string;
  group: string;
  speechCount: number;
  meetingCount: number;
}

export default function KOLListPage() {
  const [kols, setKols] = useState<KOLStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/api/stats/kol')
      .then(res => res.json())
      .then(data => {
        setKols(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch KOL stats:', err);
        setLoading(false);
      });
  }, []);

  const filteredKols = kols.filter(kol => 
    kol.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    kol.group.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '2rem' }}>
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Stakeholder Influence Board</h1>
        <p style={{ color: 'var(--muted-foreground)' }}>Analysis of key opinion leaders and their legislative activity from raw data records.</p>
      </header>

      {/* Search Bar */}
      <div className="glass" style={{ padding: '0.75rem 1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Search size={20} color="var(--muted-foreground)" />
        <input 
          type="text" 
          placeholder="Search by name or party..." 
          style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', width: '100%', fontSize: '1rem' }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="dashboard-grid">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', gridColumn: '1 / -1' }}>
            <div className="loader" style={{ marginBottom: '1rem' }}></div>
            <p>Aggregating stakeholder data from local archives...</p>
          </div>
        ) : filteredKols.length > 0 ? (
          filteredKols.map(kol => (
            <div key={kol.id} className="glass hover-lift" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={24} color="var(--primary)" />
                </div>
                <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.2)', color: 'var(--primary)', height: 'fit-content' }}>
                  {kol.group.length > 10 ? kol.group.substring(0, 10) + '...' : kol.group}
                </span>
              </div>
              
              <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{kol.name}</h2>
              <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Legislative Member</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted-foreground)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                    <MessageCircle size={14} /> Speeches
                  </div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{kol.speechCount}</div>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted-foreground)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                    <BarChart3 size={14} /> Forums
                  </div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{kol.meetingCount}</div>
                </div>
              </div>

              <button className="button-primary" style={{ width: '100%', marginTop: '1.5rem', padding: '0.5rem', fontSize: '0.875rem' }}>
                View Analysis Detail
              </button>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem', gridColumn: '1 / -1' }}>
            <p style={{ color: 'var(--muted-foreground)' }}>No stakeholders found matching "{searchTerm}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
