'use client';

import { useState, useEffect, useRef } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import { TrendingUp, Calendar, Filter, ChevronRight, Database, RefreshCw } from 'lucide-react';

const PRESET_COLORS: Record<string, string> = {
  '医療': '#3b82f6',
  'DX': '#8b5cf6',
  '経済': '#10b981',
  '環境': '#f59e0b',
  '教育': '#ef4444',
  'デジタル': '#06b6d4',
  '安全保障': '#1d4ed8',
  '税制': '#9333ea',
  '社会保障': '#f43f5e',
  '外交': '#0ea5e9'
};

const hashCode = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return hash;
};

const getColor = (key: string) => {
  if (PRESET_COLORS[key]) return PRESET_COLORS[key];
  const h = Math.abs(hashCode(key)) % 360;
  return `hsl(${h}, 70%, 55%)`;
};

export default function PolicyTrackingPage() {
  const [trends, setTrends] = useState<any[]>([]);
  const [topicKeys, setTopicKeys] = useState<string[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTopics, setActiveTopics] = useState<Set<string>>(new Set());
  const mounted = useRef(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tRes, sRes] = await Promise.all([
        fetch('/api/stats/trends'),
        fetch('/api/stats/summary'),
      ]);
      const tData = await tRes.json();
      const sData = await sRes.json();

      if (!mounted.current) return;

      setSummary(sData);

      if (Array.isArray(tData) && tData.length > 0) {
        // Detect which keys are topic keys (not 'date' and not 'count')
        const keys = Object.keys(tData[0]).filter(k => k !== 'date' && k !== 'count');
        const hasTopics = keys.length > 0;

        if (hasTopics) {
          setTopicKeys(keys);
          setActiveTopics(new Set(keys));
          setTrends(tData);
        } else {
          // Fallback: time-series with 'count'
          setTopicKeys(['count']);
          setActiveTopics(new Set(['count']));
          setTrends(tData);
        }
      } else {
        setTrends([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (mounted.current) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    return () => { mounted.current = false; };
  }, []);

  const toggleTopic = (key: string) => {
    setActiveTopics(prev => {
      const next = new Set(prev);
      if (next.has(key)) { if (next.size > 1) next.delete(key); }
      else next.add(key);
      return next;
    });
  };

  const recentPeaks = [...trends]
    .sort((a, b) => {
      const aTotal = topicKeys.reduce((s, k) => s + (a[k] || 0), 0);
      const bTotal = topicKeys.reduce((s, k) => s + (b[k] || 0), 0);
      return bTotal - aTotal;
    }).slice(0, 5);

  return (
    <div style={{ padding: '2rem' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Policy Trend Tracking</h1>
          <p style={{ color: 'var(--muted-foreground)' }}>다운로드된 국회 데이터 기반 정책 키워드 시계열 분석 ({trends.length}개 날짜 구간)</p>
        </div>
        <button onClick={fetchData} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--foreground)', cursor: 'pointer' }}>
          <RefreshCw size={14} /> 새로고침
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
        {/* Main Chart */}
        <div className="glass" style={{ padding: '2rem', minHeight: '500px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={18} color="var(--primary)" /> 정책 토픽 언급 추이
            </h2>
            {/* Topic toggle buttons */}
            {topicKeys.length > 1 && (
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {topicKeys.map(key => (
                  <button
                    key={key}
                    onClick={() => toggleTopic(key)}
                    style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      border: `1px solid ${getColor(key)}`,
                      background: activeTopics.has(key) ? getColor(key) : 'transparent',
                      color: activeTopics.has(key) ? 'white' : getColor(key),
                      cursor: 'pointer',
                    }}
                  >
                    {key}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{ height: '420px', width: '100%' }}>
            {loading ? (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', color: 'var(--muted-foreground)' }}>
                <div className="loader" />
                <p style={{ fontSize: '0.875rem' }}>데이터 분석 중...</p>
              </div>
            ) : trends.length === 0 ? (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', color: 'var(--muted-foreground)' }}>
                <Database size={40} style={{ opacity: 0.4 }} />
                <p style={{ fontSize: '0.875rem' }}>데이터가 없습니다. 데이터 센터에서 먼저 수집하세요.</p>
                <a href="/admin/data" style={{ color: 'var(--primary)', fontSize: '0.875rem' }}>→ 데이터 센터로 이동</a>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <defs>
                    {topicKeys.map(key => (
                      <linearGradient key={key} id={`grad_${key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={getColor(key)} stopOpacity={0.25} />
                        <stop offset="95%" stopColor={getColor(key)} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: 'var(--border)', borderRadius: '8px', color: 'white', fontSize: '0.8rem' }}
                  />
                  {topicKeys.length > 1 && <Legend wrapperStyle={{ fontSize: '0.8rem', paddingTop: '1rem' }} />}
                  {topicKeys.map(key => (
                    activeTopics.has(key) && (
                      <Area
                        key={key}
                        type="monotone"
                        dataKey={key}
                        name={key}
                        stroke={getColor(key)}
                        fill={`url(#grad_${key})`}
                        strokeWidth={2}
                        dot={false}
                      />
                    )
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.95rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={16} /> 언급량 피크 날짜
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentPeaks.map((t, i) => {
                const total = topicKeys.reduce((s, k) => s + (t[k] || 0), 0);
                return (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--muted-foreground)' }}>{t.date}</span>
                    <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{total}건</span>
                  </div>
                );
              })}
              {recentPeaks.length === 0 && <p style={{ color: 'var(--muted-foreground)', fontSize: '0.8rem' }}>데이터 없음</p>}
            </div>
          </div>

          <div className="glass" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.95rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={16} /> 활성 토픽
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {(summary?.topTopics || []).map((t: any) => (
                <span key={t.name} style={{
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '12px',
                  background: `${getColor(t.name)}22`,
                  border: `1px solid ${getColor(t.name)}`,
                  color: getColor(t.name),
                }}>
                  {t.name} ({t.count})
                </span>
              ))}
              {!summary?.topTopics?.length && <p style={{ color: 'var(--muted-foreground)', fontSize: '0.8rem' }}>데이터 없음</p>}
            </div>
          </div>

          <a href="/admin/data" className="button-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            데이터 추가 수집 <ChevronRight size={16} />
          </a>
        </div>
      </div>
    </div>
  );
}
