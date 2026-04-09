'use client';

import { useState, useEffect } from 'react';
import { User, MessageCircle, BarChart3, Search, RefreshCw, Database, CheckCircle2 } from 'lucide-react';

interface KOLStats {
  id: string;
  name: string;
  group: string;
  speechCount: number;
  meetingCount: number;
  isAnalyzed: boolean;
}

export default function KOLListPage() {
  const [kols, setKols] = useState<KOLStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchKols = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stats/kol');
      const data = await res.json();
      setKols(Array.isArray(data) ? data : []);
      setLastUpdated(new Date().toLocaleTimeString('ko-KR'));
    } catch (err) {
      console.error('Failed to fetch KOL stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchKols(); }, []);

  const filtered = kols.filter(k =>
    k.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    k.group?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const maxSpeeches = kols[0]?.speechCount || 1;

  return (
    <div style={{ padding: '2rem' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Stakeholder Influence Board</h1>
          <p style={{ color: 'var(--muted-foreground)' }}>
            ダウンロードされた国会発言データに基づく · 計 {kols.length}名 追跡中
            {lastUpdated && <span style={{ marginLeft: '1rem', fontSize: '0.75rem' }}>更新: {lastUpdated}</span>}
          </p>
        </div>
        <button onClick={fetchKols} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--foreground)', cursor: 'pointer' }}>
          <RefreshCw size={14} /> リフレッシュ
        </button>
      </header>

      {/* Search */}
      <div className="glass" style={{ padding: '0.75rem 1.25rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Search size={18} color="var(--muted-foreground)" />
        <input
          type="text"
          placeholder="名前または政党・会派で検索..."
          style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', width: '100%', fontSize: '0.95rem' }}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} style={{ background: 'none', border: 'none', color: 'var(--muted-foreground)', cursor: 'pointer', fontSize: '1.1rem' }}>×</button>
        )}
      </div>

      {/* Stats bar */}
      {!loading && kols.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: '総発言数', value: kols.reduce((s, k) => s + k.speechCount, 0).toLocaleString() + '件' },
            { label: 'データ分析完了', value: kols.filter(k => k.isAnalyzed).length + '名' },
            { label: '上位発言者', value: kols[0]?.name || '—' },
          ].map((s, i) => (
            <div key={i} className="glass" style={{ padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginBottom: '0.35rem' }}>{s.label}</div>
              <div style={{ fontWeight: 'bold', fontSize: '1.125rem', color: 'var(--primary)' }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      <div className="dashboard-grid">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', gridColumn: '1 / -1' }}>
            <div className="loader" style={{ margin: '0 auto 1rem' }} />
            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>ローカルデータから発言者統計を集計中...</p>
          </div>
        ) : filtered.length === 0 && searchTerm ? (
          <div style={{ textAlign: 'center', padding: '4rem', gridColumn: '1 / -1' }}>
            <p style={{ color: 'var(--muted-foreground)' }}>"{searchTerm}" の検索結果なし</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem', gridColumn: '1 / -1' }}>
            <Database size={48} style={{ opacity: 0.35, margin: '0 auto 1rem', display: 'block' }} />
            <p style={{ color: 'var(--muted-foreground)', marginBottom: '1rem' }}>ダウンロードされた国会発言データがありません。</p>
            <a href="/admin/data" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem' }}>→ データセンターで収集する</a>
          </div>
        ) : (
          filtered.map(kol => {
            const barWidth = Math.min(100, (kol.speechCount / maxSpeeches) * 100);
            return (
              <a key={kol.id} href={`/kol/${encodeURIComponent(kol.id)}`} style={{ textDecoration: 'none' }}>
                <div className="glass hover-lift" style={{ padding: '1.5rem', height: '100%', cursor: 'pointer' }}>
                  {/* Header row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(59,130,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(59,130,246,0.3)' }}>
                      <User size={22} color="var(--primary)" />
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'flex-start', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      {kol.isAnalyzed && (
                        <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem', borderRadius: '10px', background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <CheckCircle2 size={9} /> AI分析済
                        </span>
                      )}
                      <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem', borderRadius: '10px', background: 'rgba(59,130,246,0.12)', color: 'var(--primary)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {kol.group?.length > 12 ? kol.group.substring(0, 12) + '…' : kol.group}
                      </span>
                    </div>
                  </div>

                  <h2 style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>{kol.name}</h2>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: '0.8rem', marginBottom: '1.25rem' }}>Legislative Member</p>

                  {/* Influence bar */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--muted-foreground)', marginBottom: '0.3rem' }}>
                      <span>発言影響度</span>
                      <span>{barWidth.toFixed(0)}%</span>
                    </div>
                    <div style={{ height: '5px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${barWidth}%`, background: 'linear-gradient(90deg, var(--primary), var(--chart-2))', borderRadius: '3px', transition: 'width 1s ease' }} />
                    </div>
                  </div>

                  {/* Stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--muted-foreground)', fontSize: '0.7rem', marginBottom: '0.2rem' }}>
                        <MessageCircle size={12} /> 発言数
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary)' }}>{kol.speechCount.toLocaleString()}</div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--muted-foreground)', fontSize: '0.7rem', marginBottom: '0.2rem' }}>
                        <BarChart3 size={12} /> 参加フォーラム
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{kol.meetingCount}</div>
                    </div>
                  </div>

                  <div style={{ marginTop: '1.25rem', textAlign: 'center', padding: '0.5rem', background: 'rgba(59,130,246,0.08)', borderRadius: '6px', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600 }}>
                    詳細分析を見る →
                  </div>
                </div>
              </a>
            );
          })
        )}
      </div>
    </div>
  );
}
