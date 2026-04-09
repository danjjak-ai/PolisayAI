'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Tag, BarChart3, MessageCircle, Calendar, Loader, Database } from 'lucide-react';

export default function KOLDetailPage() {
  const { id } = useParams();
  const decodedId = decodeURIComponent(id as string);

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeResult, setAnalyzeResult] = useState<any>(null);
  const [rawStats, setRawStats] = useState<any>(null);
  const [rawSpeeches, setRawSpeeches] = useState<any[]>([]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      // Fetch from SQLite profile
      const res = await fetch(`/api/kol/${encodeURIComponent(decodedId)}`);
      const data = await res.json();
      setProfile(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchRawStats = async () => {
    try {
      // Fetch aggregated raw stats for this speaker
      const res = await fetch(`/api/stats/kol`);
      const all = await res.json();
      const found = all.find((k: any) => k.name === decodedId || k.id === decodedId);
      if (found) setRawStats(found);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRawSpeeches = async () => {
    try {
      const res = await fetch(`/api/kol/${encodeURIComponent(decodedId)}/raw`);
      const data = await res.json();
      setRawSpeeches(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchRawStats();
    fetchRawSpeeches();
  }, [decodedId]);

  const triggerAnalysis = async () => {
    if (!profile) return;
    setAnalyzing(true);
    setAnalyzeResult(null);
    try {
      const res = await fetch('/api/analyze-and-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: decodedId, politician_id: profile.id || '1' }),
      });
      const data = await res.json();
      setAnalyzeResult(data);
      await fetchProfile();
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
        <Loader style={{ margin: '0 auto 1rem', animation: 'spin 1s linear infinite' }} size={30} />
        <p>데이터 로딩 중...</p>
      </div>
    );
  }

  const allTopics = Array.from(new Set(
    (profile?.recentActivity || []).flatMap((a: any) => (a.topics || '').split ? (a.topics || '').split(',') : (a.topics || []))
  )).filter(Boolean) as string[];

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <header style={{ marginBottom: '2rem' }}>
        <a href="/kol" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
          <ArrowLeft size={14} /> 목록으로 돌아가기
        </a>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>{decodedId}</h1>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>
              {profile?.country === 'KR' ? '🇰🇷 대한민국' : '🇯🇵 일본'} |&nbsp;
              {profile?.party || rawStats?.group || 'N/A'} |&nbsp;
              {profile?.position || '의원'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={fetchProfile} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--foreground)', cursor: 'pointer', fontSize: '0.85rem' }}>
              <RefreshCw size={13} /> 새로고침
            </button>
            <button
              onClick={triggerAnalysis}
              disabled={analyzing}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', background: analyzing ? 'var(--muted)' : 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: analyzing ? 'not-allowed' : 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
            >
              {analyzing ? <><Loader size={13} style={{ animation: 'spin 1s linear infinite' }} /> 분석 중...</> : '🔍 AI 분석 실행'}
            </button>
          </div>
        </div>
      </header>

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: '총 발언 수 (로컬)', value: rawStats?.speechCount?.toLocaleString() ?? '—', icon: <MessageCircle size={16} />, color: 'var(--primary)' },
          { label: '참여 회의 수', value: rawStats?.meetingCount ?? '—', icon: <Calendar size={16} />, color: 'var(--chart-3)' },
          { label: 'AI 분석 완료', value: profile?.recentActivity?.length ?? 0, icon: <BarChart3 size={16} />, color: 'var(--chart-2)' },
          { label: '토픽 분류 수', value: allTopics.length, icon: <Tag size={16} />, color: 'var(--chart-1)' },
        ].map((s, i) => (
          <div key={i} className="glass" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{s.label}</span>
              <span style={{ color: s.color }}>{s.icon}</span>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem' }}>
        {/* Main: Timeline */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Raw Speeches Preview */}
          {rawSpeeches.length > 0 && (
            <div className="glass" style={{ padding: '1.75rem', border: '1px solid rgba(59,130,246,0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Database size={18} color="var(--primary)" /> API 원문 발언 내역 (미분석)
                </h2>
                <span style={{ fontSize: '0.75rem', background: 'rgba(59,130,246,0.15)', color: 'var(--primary)', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
                  최근 {rawSpeeches.length}건 미리보기
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {rawSpeeches.map((r: any, idx: number) => (
                  <div key={idx} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                      <span>{r.date}</span>
                      <span>{r.nameOfMeeting}</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--foreground)', opacity: 0.9, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {r.speech}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="glass" style={{ padding: '1.75rem' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageCircle size={18} color="var(--primary)" /> AI 분석 발언 타임라인
            </h2>
            {profile?.recentActivity?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {profile.recentActivity.map((activity: any, idx: number) => {
                  const topics = typeof activity.topics === 'string'
                    ? activity.topics.split(',').filter(Boolean)
                    : (activity.topics || []);
                  return (
                    <div key={idx} style={{ borderLeft: '2px solid var(--primary)', paddingLeft: '1.25rem', position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '-5px', top: '4px', width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)' }}>
                          {new Date(activity.created_at).toLocaleDateString('ko-KR')}
                        </span>
                        {activity.policy_relevance > 0 && (
                          <span style={{ fontSize: '0.7rem', background: 'rgba(59,130,246,0.15)', color: 'var(--primary)', padding: '0.1rem 0.5rem', borderRadius: '8px' }}>
                            관련도 {(activity.policy_relevance * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
                      {activity.summary && (
                        <h3 style={{ fontSize: '0.95rem', margin: '0.2rem 0 0.5rem', fontWeight: 600 }}>{activity.summary}</h3>
                      )}
                      <p style={{ fontSize: '0.82rem', color: 'var(--foreground)', opacity: 0.75, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        "{activity.content}"
                      </p>
                      {topics.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.6rem' }}>
                          {topics.map((t: string) => (
                            <span key={t} style={{ fontSize: '0.7rem', background: 'rgba(139,92,246,0.15)', color: 'var(--chart-1)', padding: '0.1rem 0.5rem', borderRadius: '6px', border: '1px solid rgba(139,92,246,0.25)' }}>{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                <Database size={36} style={{ opacity: 0.35, margin: '0 auto 1rem', display: 'block' }} />
                <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>AI 분석된 발언 기록이 없습니다.</p>
                <p style={{ fontSize: '0.8rem' }}>우측 상단 <strong>AI 분석 실행</strong> 버튼으로 분석을 시작하세요.</p>
              </div>
            )}
          </div>

          {/* Analysis result panel */}
          {analyzeResult && (
            <div className="glass" style={{ padding: '1.5rem', border: '1px solid var(--chart-2)', borderRadius: '12px' }}>
              <h3 style={{ color: 'var(--chart-2)', marginBottom: '1rem', fontSize: '1rem' }}>📊 방금 분석 결과</h3>
              <pre style={{ fontSize: '0.8rem', background: 'rgba(0,0,0,0.25)', padding: '1rem', borderRadius: '8px', overflowX: 'auto', lineHeight: 1.6 }}>
                {JSON.stringify(analyzeResult.analysis, null, 2)}
              </pre>
            </div>
          )}
        </section>

        {/* Sidebar */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Key topics */}
          <div className="glass" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.95rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Tag size={16} color="var(--primary)" /> 주요 관심 토픽
            </h3>
            {allTopics.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {allTopics.slice(0, 15).map(t => (
                  <span key={t} style={{ fontSize: '0.78rem', background: 'var(--muted)', padding: '0.25rem 0.75rem', borderRadius: '12px', border: '1px solid var(--border)' }}>{t}</span>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--muted-foreground)', fontSize: '0.8rem' }}>분석 후 자동으로 추출됩니다.</p>
            )}
          </div>

          {/* Raw data stats from JSON files */}
          {rawStats && (
            <div className="glass" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>📁 로컬 데이터 기준 통계</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--muted-foreground)' }}>총 발언 기록</span>
                  <strong style={{ color: 'var(--primary)' }}>{rawStats.speechCount.toLocaleString()}건</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--muted-foreground)' }}>참여 회의</span>
                  <strong>{rawStats.meetingCount}개</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--muted-foreground)' }}>소속 그룹</span>
                  <strong style={{ maxWidth: '150px', textAlign: 'right', wordBreak: 'break-word' }}>{rawStats.group}</strong>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
