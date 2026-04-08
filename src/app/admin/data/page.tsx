'use client';

import { useState, useEffect } from 'react';
import { Download, Activity, FileJson, Play, BarChart3, Settings2, Globe2, Share2 } from 'lucide-react';
import SpeakerVolumeChart from '@/components/charts/SpeakerVolumeChart';

type DataSource = 'KR' | 'JP' | 'SOCIAL';

export default function NDLAdminPage() {
  const [source, setSource] = useState<DataSource>('JP');
  const [query, setQuery] = useState('医療');
  const [pages, setPages] = useState(2);
  
  // Detailed Parameters
  const [params, setParams] = useState({
    speaker: '',
    speakerGroup: '',
    from: '',
    until: '',
    committee: '',
    proposer: '',
    age: '21',
    platform: 'X'
  });

  const [status, setStatus] = useState<any>(null);
  const [localStats, setLocalStats] = useState<any>(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`/api/ndl/status?q=${query}`);
      const data = await res.json();
      setStatus(data);
    } catch (e) { console.error(e); }
  };

  const fetchLocalStats = async () => {
    try {
      const res = await fetch(`/api/ndl/analyze-local?q=${query}`);
      const data = await res.json();
      setLocalStats(data);
    } catch (e) { console.error(e); }
  };

  const startDownload = async () => {
    const searchParams = new URLSearchParams({
      source,
      q: query,
      pages: pages.toString(),
      ...Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== ''))
    });
    
    fetch(`/api/ndl/download?${searchParams.toString()}`);
    setTimeout(fetchStatus, 500);
  };

  useEffect(() => {
    const interval = setInterval(fetchStatus, 2000);
    fetchLocalStats();
    return () => clearInterval(interval);
  }, [query, source]);

  return (
    <div style={{ padding: '2rem' }}>
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>데이터 센터</h1>
        <p style={{ color: 'var(--muted-foreground)' }}>한/일 정책 데이터 및 소셜 여론 수집 멀티 제어 시스템</p>
      </header>

      {/* Source Selector Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { id: 'JP', label: '일본 국회 (NDL)', icon: <Globe2 size={16} /> },
          { id: 'KR', label: '대한민국 국회 (OpenAPI)', icon: <Globe2 size={16} /> },
          { id: 'SOCIAL', label: '소셜/커뮤니티 (Scraper)', icon: <Share2 size={16} /> }
        ].map(s => (
          <button
            key={s.id}
            onClick={() => setSource(s.id as DataSource)}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: 'var(--radius)',
              background: source === s.id ? 'var(--primary)' : 'var(--card)',
              border: '1px solid var(--border)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Advanced Config Section */}
        <section className="glass" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Settings2 size={20} /> 상세 수집 설정 ({source})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>기본 키워드</label>
                <input value={query} onChange={e => setQuery(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>수집 페이지</label>
                <input type="number" value={pages} onChange={e => setPages(parseInt(e.target.value))} style={inputStyle} />
              </div>
            </div>

            {/* Source Specific Params */}
            {source === 'JP' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>발언자 (Speaker)</label>
                  <input value={params.speaker} onChange={e => setParams({...params, speaker: e.target.value})} placeholder="예: 岸田" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>정당/회파 (Group)</label>
                  <input value={params.speakerGroup} onChange={e => setParams({...params, speakerGroup: e.target.value})} placeholder="예: 自民党" style={inputStyle} />
                </div>
              </div>
            )}

            {source === 'KR' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>제안자 (Proposer)</label>
                  <input value={params.proposer} onChange={e => setParams({...params, proposer: e.target.value})} placeholder="예: 홍길동" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>국회 대수 (Age)</label>
                  <select value={params.age} onChange={e => setParams({...params, age: e.target.value})} style={inputStyle}>
                    <option value="22">22대</option>
                    <option value="21">21대</option>
                    <option value="20">20대</option>
                  </select>
                </div>
              </div>
            )}

            <button onClick={startDownload} style={btnStyle} disabled={status?.status === 'running'}>
              <Play size={18} /> {source} 데이터 수집 시작
            </button>
          </div>
        </section>

        {/* Monitoring Side (Same as before but context-aware) */}
        <section className="glass" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={20} /> 실시간 상태 모니터
          </h2>
          {status && status.status !== 'idle' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>상태: <strong style={{ color: 'var(--primary)' }}>{status.status}</strong></span>
                <span>{status.currentPage} / {status.totalPage} Pages</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--muted)', borderRadius: '4px' }}>
                <div style={{ width: `${(status.currentPage / status.totalPage) * 100}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.5s' }} />
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--muted-foreground)' }}>준비 완료. 파라미터를 설정하고 수집을 시작하세요.</p>
          )}
        </section>

        {/* Analytics Section */}
        <section className="glass" style={{ padding: '2rem', gridColumn: 'span 2' }}>
           <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart3 size={20} /> 데이터 시각화 라이브러리 (현황)
          </h2>
          {localStats && localStats.analysis?.bySpeaker?.length > 0 ? (
            <SpeakerVolumeChart data={localStats.analysis.bySpeaker} />
          ) : (
            <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-foreground)' }}>
              로컬에 저장된 {source} 데이터가 없습니다.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '0.75rem',
  background: 'var(--muted)',
  border: '1px solid var(--border)',
  borderRadius: '4px',
  color: 'white',
  fontSize: '0.875rem'
};

const btnStyle = {
  marginTop: '1rem',
  background: 'var(--primary)',
  color: 'white',
  border: 'none',
  padding: '1rem',
  borderRadius: 'var(--radius)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  fontWeight: 'bold'
};
