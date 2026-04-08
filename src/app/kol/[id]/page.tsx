'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function KOLDetailPage() {
  const { id } = useParams();
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const triggerAnalysis = async () => {
    setAnalyzing(true);
    try {
      const res = await fetch('/api/analyze-and-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: '의료 DX', politician_id: id })
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <a href="/kol" style={{ color: 'var(--primary)', fontSize: '0.875rem', marginBottom: '1rem', display: 'block' }}>← 목록으로 돌아가기</a>
          <h1 style={{ fontSize: '2.5rem' }}>홍길동 의원</h1>
          <p style={{ color: 'var(--muted-foreground)' }}>대한민국 국회 | 더불어민주당 | 보건복지위원회</p>
        </div>
        <button 
          onClick={triggerAnalysis}
          disabled={analyzing}
          style={{ 
            background: 'var(--primary)', 
            color: 'white', 
            border: 'none', 
            padding: '0.75rem 1.5rem', 
            borderRadius: 'var(--radius)',
            cursor: 'pointer',
            opacity: analyzing ? 0.7 : 1
          }}
        >
          {analyzing ? '실시간 분석 중...' : '신규 데이터 수집 및 분석 실행'}
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
        {/* Main Analysis Section */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="glass" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>정책 발언 타임라인</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ borderLeft: '2px solid var(--primary)', paddingLeft: '1.5rem', position: 'relative' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>2024.04.08</span>
                <h3 style={{ fontSize: '1.125rem', margin: '0.25rem 0' }}>의료법 일부개정법률안 발제</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--foreground)', opacity: 0.8 }}>"디지털 헬스케어의 법적 근거 마련은 더 이상 미룰 수 없는 시대적 과제입니다."</p>
                <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', padding: '0.125rem 0.5rem', borderRadius: '4px' }}>의료DX</span>
                  <span style={{ fontSize: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', padding: '0.125rem 0.5rem', borderRadius: '4px' }}>입법</span>
                </div>
              </div>
              {/* More items */}
            </div>
          </div>

          {result && (
            <div className="glass animate-fade-in" style={{ padding: '2rem', border: '1px solid var(--chart-2)' }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--chart-2)' }}>실시간 분석 결과</h2>
              <pre style={{ fontSize: '0.875rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', overflowX: 'auto' }}>
                {JSON.stringify(result.analysis, null, 2)}
              </pre>
            </div>
          )}
        </section>

        {/* Sidebar Info */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="glass" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>주요 관심 토픽</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {['지역의료', '건보공단', '비급여관리', '원격의료', '디지털격차'].map(t => (
                <span key={t} style={{ fontSize: '0.75rem', background: 'var(--muted)', padding: '0.25rem 0.75rem', borderRadius: '12px' }}>{t}</span>
              ))}
            </div>
          </div>

          <div className="glass" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>네트워크 영향력</h3>
            <div style={{ height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>
              공동발의 네트워크 차트 (준비 중)
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
