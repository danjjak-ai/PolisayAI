'use client';

import { useState, useEffect } from 'react';
import { Users, MessageSquare, TrendingUp, AlertCircle, Clock, Database, RefreshCw } from 'lucide-react';

export default function Dashboard() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchSummary = async () => {
    try {
      const res = await fetch('/api/stats/summary');
      const data = await res.json();
      setSummary(data);
      setLastUpdated(new Date().toLocaleTimeString('ko-KR'));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const maxCount = summary?.topTopics?.[0]?.count || 1;

  return (
    <div style={{ padding: '2rem' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Intelligence Dashboard</h1>
          <p style={{ color: 'var(--muted-foreground)' }}>ダウンロードされた日本国会・ソーシャルデータに基づくリアルタイム分析</p>
        </div>
        <button
          onClick={fetchSummary}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--foreground)', cursor: 'pointer', fontSize: '0.875rem' }}
        >
          <RefreshCw size={14} /> リフレッシュ
          {lastUpdated && <span style={{ color: 'var(--muted-foreground)', marginLeft: '0.25rem' }}>{lastUpdated}</span>}
        </button>
      </header>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {[
          { label: '総収集発言数', value: summary?.totalRecords, icon: <MessageSquare size={18} />, color: 'var(--primary)', sub: 'ローカルJSONファイル基準' },
          { label: '追跡発言者数', value: summary?.totalSpeakers, icon: <Users size={18} />, color: 'var(--chart-1)', sub: '国会議員 / 発言者' },
          { label: '参加会議数', value: summary?.totalMeetings, icon: <Clock size={18} />, color: 'var(--chart-3)', sub: '委員会・本会議等' },
          { label: 'トピック分布数', value: summary?.topTopics?.length, icon: <Database size={18} />, color: 'var(--chart-2)', sub: 'キーワードベース分類' },
        ].map((card, i) => (
          <div key={i} className="glass" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ color: 'var(--muted-foreground)', fontSize: '0.8rem' }}>{card.label}</span>
              <span style={{ color: card.color }}>{card.icon}</span>
            </div>
            <div style={{ fontSize: '2.25rem', fontWeight: 'bold', color: card.color }}>
              {loading ? <span className="loader" style={{ width: 24, height: 24, display: 'inline-block' }} /> : (card.value ?? 0).toLocaleString()}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginTop: '0.5rem' }}>{card.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Topic Trends */}
        <section className="glass" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.125rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={18} color="var(--primary)" /> 政策トピック言及頻度
          </h2>
          {loading ? (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-foreground)' }}>データ集計中...</div>
          ) : summary?.topTopics?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {summary.topTopics.map((topic: any) => (
                <div key={topic.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.875rem' }}>
                    <span style={{ fontWeight: 500 }}>{topic.name}</span>
                    <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{topic.count.toLocaleString()} 件</span>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.min(100, (topic.count / maxCount) * 100)}%`,
                      background: 'linear-gradient(90deg, var(--primary), var(--chart-2))',
                      borderRadius: '4px',
                      transition: 'width 1.2s ease-out',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted-foreground)' }}>
              <Database size={32} style={{ marginBottom: '1rem', opacity: 0.4 }} />
              <p style={{ fontSize: '0.875rem' }}>データセンターでJPデータを先に収集してください。</p>
              <a href="/admin/data" style={{ color: 'var(--primary)', fontSize: '0.875rem', marginTop: '0.5rem', display: 'inline-block' }}>→ データセンターへ移動</a>
            </div>
          )}
        </section>

        {/* Alert / Info Panel */}
        <section className="glass" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.125rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} /> データ現況
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: 'rgba(59,130,246,0.08)', borderLeft: '3px solid var(--primary)', borderRadius: '4px' }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>最新の収集日</div>
              <div style={{ fontSize: '1rem', color: 'var(--primary)', marginTop: '0.25rem' }}>
                {summary?.recentDate || '—'}
              </div>
            </div>
            <div style={{ padding: '1rem', background: 'rgba(16,185,129,0.08)', borderLeft: '3px solid #10b981', borderRadius: '4px' }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>上位トピック</div>
              <div style={{ fontSize: '1rem', color: '#10b981', marginTop: '0.25rem' }}>
                {summary?.topTopics?.[0]?.name ?? '—'} ({summary?.topTopics?.[0]?.count ?? 0}件)
              </div>
            </div>
            <div style={{ padding: '1rem', background: 'rgba(245,158,11,0.08)', borderLeft: '3px solid #f59e0b', borderRadius: '4px' }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>データ不足トピック</div>
              <div style={{ fontSize: '1rem', color: '#f59e0b', marginTop: '0.25rem' }}>
                {summary?.topTopics?.filter((t: any) => t.count < 10).map((t: any) => t.name).join(', ') || '—'}
              </div>
            </div>
            <a href="/admin/data" style={{ display: 'block', textAlign: 'center', padding: '0.75rem', background: 'var(--primary)', borderRadius: '8px', color: 'white', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none', marginTop: '0.5rem' }}>
              + データ収集
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
