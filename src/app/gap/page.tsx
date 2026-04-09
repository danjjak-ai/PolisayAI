'use client';

import { useState, useEffect } from 'react';
import { Target, ArrowRight, AlertTriangle, ShieldCheck, RefreshCw, Database } from 'lucide-react';

const PRESET_DEMAND: Record<string, number> = {
  '医療': 0.85, 'DX': 0.70, '経済': 0.65, '環境': 0.60, '教育': 0.55,
  'デジタル': 0.70, '安全保障': 0.50, '税制': 0.45, '社会保障': 0.75, '外交': 0.40,
};

const getDemand = (topic: string) => {
  if (PRESET_DEMAND[topic]) return PRESET_DEMAND[topic];
  // Generate consistent pseudo-random demand (0.4 ~ 0.9)
  let hash = 0;
  for (let i = 0; i < topic.length; i++) hash = topic.charCodeAt(i) + ((hash << 5) - hash);
  const normalized = (Math.abs(hash) % 50) / 100; // 0.0 ~ 0.5
  return 0.4 + normalized;
};

function statusLabel(gap: number) {
  if (gap > 0.5) return { label: 'Critical Gap', color: '#ef4444' };
  if (gap > 0.3) return { label: 'Significant Gap', color: '#f59e0b' };
  if (gap > 0.1) return { label: 'Minor Gap', color: '#3b82f6' };
  return { label: 'Balanced', color: '#10b981' };
}

export default function GapAnalysisPage() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stats/summary');
      const data = await res.json();
      setSummary(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Build gap analysis from real keyword supply vs. demand baseline
  const gaps = (() => {
    if (!summary?.topTopics) return [];

    const totalRecords = summary.totalRecords || 1;
    const allTopics = new Set([
      ...Object.keys(PRESET_DEMAND),
      ...(summary.topTopics || []).map((t: any) => t.name),
    ]);

    return Array.from(allTopics).map(name => {
      const demand = getDemand(name);
      const found = summary.topTopics.find((t: any) => t.name === name);
      const rawCount = found?.count || 0;
      // Normalize supply as ratio of max topic count
      const maxCount = summary.topTopics[0]?.count || 1;
      const supply = Math.min(0.95, rawCount / maxCount);
      const gap = Math.max(0, demand - supply);
      const { label, color } = statusLabel(gap);

      return {
        name,
        demand,
        supply,
        gap,
        gapPct: (gap * 100).toFixed(0),
        label,
        color,
        count: rawCount,
      };
    }).sort((a, b) => b.gap - a.gap);
  })();

  const worstGap = gaps[0];
  const confidencePct = summary?.totalRecords
    ? Math.min(99, 60 + Math.min(39, Math.floor(summary.totalRecords / 500)))
    : 0;

  return (
    <div style={{ padding: '2rem' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Strategic Gap Analysis</h1>
          <p style={{ color: 'var(--muted-foreground)' }}>사회적 수요 vs. 입법 공급 격차 분석 · {summary?.totalRecords?.toLocaleString() ?? 0}건 기반</p>
        </div>
        <button onClick={fetchData} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--foreground)', cursor: 'pointer' }}>
          <RefreshCw size={14} /> 새로고침
        </button>
      </header>

      <div className="glass" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Target size={20} color="var(--primary)" /> Policy Supply vs. Social Demand
          </h2>
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 12, height: 12, background: 'var(--primary)', borderRadius: 2 }} />
              <span>Supply (입법 강도 / 데이터 점유)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 2, height: 16, background: 'white', borderRadius: 1 }} />
              <span>Demand (사회적 수요 목표)</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
            <div className="loader" style={{ margin: '0 auto 1rem' }} />
            정책 밀도 분석 중...
          </div>
        ) : gaps.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
            <Database size={40} style={{ opacity: 0.4, margin: '0 auto 1rem', display: 'block' }} />
            <p style={{ fontSize: '0.875rem' }}>데이터가 없습니다. 데이터 센터에서 먼저 수집하세요.</p>
            <a href="/admin/data" style={{ color: 'var(--primary)', fontSize: '0.875rem', marginTop: '0.5rem', display: 'inline-block' }}>→ 데이터 센터로 이동</a>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            {gaps.map((g, i) => (
              <div key={i} style={{ borderBottom: i < gaps.length - 1 ? '1px solid var(--border)' : 'none', paddingBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '1rem' }}>{g.name}</span>
                    <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem', borderRadius: '10px', background: `${g.color}18`, color: g.color, border: `1px solid ${g.color}55`, display: 'flex', alignItems: 'center', gap: '3px' }}>
                      {g.gap > 0.3 ? <AlertTriangle size={10} /> : <ShieldCheck size={10} />}
                      {g.label}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', display: 'flex', gap: '1.5rem' }}>
                    <span>수집: <strong style={{ color: 'var(--primary)' }}>{g.count}건</strong></span>
                    <span>격차: <strong style={{ color: g.color }}>{g.gapPct}%</strong></span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ position: 'relative', height: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'visible' }}>
                    {/* Demand marker */}
                    <div style={{
                      position: 'absolute',
                      left: `${g.demand * 100}%`,
                      top: '-4px', bottom: '-4px',
                      width: '2px', background: 'white',
                      zIndex: 3, boxShadow: '0 0 8px rgba(255,255,255,0.6)',
                    }} />
                    {/* Supply bar */}
                    <div style={{
                      height: '100%',
                      width: `${g.supply * 100}%`,
                      background: `linear-gradient(90deg, var(--primary), ${g.color})`,
                      borderRadius: '10px',
                      transition: 'width 1.5s ease-in-out',
                    }} />
                  </div>
                  <ArrowRight size={18} color="var(--muted-foreground)" />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.35rem', fontSize: '0.7rem', color: 'var(--muted-foreground)' }}>
                  <span>공급 {(g.supply * 100).toFixed(0)}%</span>
                  <span>목표 수요 {(g.demand * 100).toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom insight cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="glass" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>🔍 전략 권고</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', lineHeight: 1.7 }}>
            {worstGap
              ? <>현재 <strong style={{ color: '#ef4444' }}>{worstGap.name}</strong> 분야의 격차가 가장 심각합니다 ({worstGap.gapPct}% Gap). 해당 키워드로 추가 데이터 수집 및 KOL 모니터링을 권장합니다.</>
              : '데이터를 수집하면 전략적 권고사항이 표시됩니다.'}
          </p>
        </div>
        <div className="glass" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>📊 데이터 신뢰도</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', lineHeight: 1.7 }}>
            현재 분석 신뢰도 <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{confidencePct}%</span>.
            총 <strong>{summary?.totalRecords?.toLocaleString() ?? 0}건</strong>의 국회 발언 레코드 기반.
            {summary?.totalRecords < 500 && <span style={{ color: '#f59e0b' }}> 더 많은 데이터 수집을 권장합니다.</span>}
          </p>
        </div>
      </div>
    </div>
  );
}
