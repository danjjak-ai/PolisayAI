'use client';

import { useState, useEffect } from 'react';
import { Download, Activity, FileJson, Play, BarChart3, Settings2, Globe2, Share2 } from 'lucide-react';
import SpeakerVolumeChart from '@/components/charts/SpeakerVolumeChart';
import SentimentDistributionChart from '@/components/charts/SentimentDistributionChart';

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
  const [loadingStats, setLoadingStats] = useState(false);
  const [collections, setCollections] = useState<any[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);

  // Policy Categories State
  const [categories, setCategories] = useState<any[]>([]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatKeywords, setNewCatKeywords] = useState('');

  const fetchStatus = async () => {
    try {
      const res = await fetch(`/api/ndl/status?source=${source}&q=${query}`);
      const data = await res.json();
      setStatus(data);
      
      // If just completed, refresh stats
      if (data.status === 'completed' && status?.status === 'running') {
        fetchLocalStats();
      }
    } catch (e) { console.error(e); }
  };

  const fetchLocalStats = async (prefix?: string) => {
    setLoadingStats(true);
    try {
      const url = prefix ? `/api/ndl/analyze-local?prefix=${prefix}` : `/api/ndl/analyze-local?q=${query}`;
      const res = await fetch(url);
      const data = await res.json();
      setLocalStats(data);
    } catch (e) { console.error(e); }
    finally { setLoadingStats(false); }
  };

  const fetchCollections = async () => {
    try {
      const res = await fetch('/api/ndl/collections');
      const data = await res.json();
      setCollections(data);
    } catch (e) { console.error(e); }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/policy-categories');
      setCategories(await res.json());
    } catch (e) { console.error(e); }
  };

  const handleAddCategory = async () => {
    if (!newCatName || !newCatKeywords) return;
    try {
      const res = await fetch('/api/policy-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category_name: newCatName, keywords: newCatKeywords })
      });
      if (res.ok) {
        setNewCatName('');
        setNewCatKeywords('');
        fetchCategories();
      } else {
        alert('카테고리 추가 실패: ' + (await res.json()).error);
      }
    } catch (e) { console.error(e); }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await fetch('/api/policy-categories?id=' + id, { method: 'DELETE' });
      fetchCategories();
    } catch (e) { console.error(e); }
  };

  const startDownload = async () => {
    const searchParams = new URLSearchParams({
      source,
      q: query,
      pages: pages.toString(),
      ...Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== ''))
    });
    
    setStatus({ status: 'running', currentPage: 0, totalPage: pages, logs: ['収集リクエスト送信中...'] });
    fetch(`/api/ndl/download?${searchParams.toString()}`);
    setTimeout(fetchStatus, 500);
  };

  useEffect(() => {
    const interval = setInterval(fetchStatus, 2000);
    fetchLocalStats();
    fetchCollections();
    fetchCategories();
    return () => clearInterval(interval);
  }, [query, source]);

  return (
    <div style={{ padding: '2rem' }}>
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>データセンター</h1>
        <p style={{ color: 'var(--muted-foreground)' }}>日/韓 政策データおよびソーシャル世論収集マルチ制御システム</p>
      </header>

      {/* Source Selector Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { id: 'JP', label: '日本国会 (NDL)', icon: <Globe2 size={16} /> },
          { id: 'KR', label: '大韓民国国会 (OpenAPI)', icon: <Globe2 size={16} /> },
          { id: 'SOCIAL', label: 'ソーシャル/コミュニティ (Scraper)', icon: <Share2 size={16} /> }
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
            <Settings2 size={20} /> 詳細収集設定 ({source})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>基本キーワード</label>
                <input value={query} onChange={e => setQuery(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>収集ページ数</label>
                <input type="number" value={pages} onChange={e => setPages(parseInt(e.target.value))} style={inputStyle} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>開始日</label>
                <input type="date" value={params.from} onChange={e => setParams({...params, from: e.target.value})} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>終了日</label>
                <input type="date" value={params.until} onChange={e => setParams({...params, until: e.target.value})} style={inputStyle} />
              </div>
            </div>

            {/* Source Specific Params */}
            {source === 'JP' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>発言者 (Speaker)</label>
                  <input value={params.speaker} onChange={e => setParams({...params, speaker: e.target.value})} placeholder="例: 岸田" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>政党/会派 (Group)</label>
                  <input value={params.speakerGroup} onChange={e => setParams({...params, speakerGroup: e.target.value})} placeholder="例: 自民党" style={inputStyle} />
                </div>
              </div>
            )}

            {source === 'KR' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>提案者 (Proposer)</label>
                  <input value={params.proposer} onChange={e => setParams({...params, proposer: e.target.value})} placeholder="例: 洪吉童" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>国会回数 (Age)</label>
                  <select value={params.age} onChange={e => setParams({...params, age: e.target.value})} style={inputStyle}>
                    <option value="22">22代</option>
                    <option value="21">21代</option>
                    <option value="20">20代</option>
                  </select>
                </div>
              </div>
            )}

            <button onClick={startDownload} style={btnStyle} disabled={status?.status === 'running'}>
              <Play size={18} /> {source} データ収集開始
            </button>
          </div>
        </section>

        {/* Monitoring Side (Same as before but context-aware) */}
        <section className="glass" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={20} /> リアルタイム状態モニター
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
              <div style={{ 
                marginTop: '1rem', 
                padding: '1rem', 
                background: '#000', 
                borderRadius: '4px', 
                fontSize: '0.75rem', 
                fontFamily: 'monospace', 
                height: '150px', 
                overflowY: 'auto',
                border: '1px solid var(--border)'
              }}>
                {status.logs?.map((log: string, i: number) => (
                  <div key={i} style={{ color: '#0f0', marginBottom: '0.25rem' }}>{`> ${log}`}</div>
                ))}
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--muted-foreground)' }}>準備完了。パラメータを設定して収集を開始してください。</p>
          )}
        </section>

        {/* Policy Category Management */}
        <section className="glass" style={{ padding: '2rem', gridColumn: 'span 2' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Settings2 size={20} /> AI政策カテゴリー管理 (キーワードマッピング)
          </h2>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            分析エンジンがテキストを解析する際に認識する政策カテゴリーと一致するキーワードを設定します。ここに追加されたカテゴリーは、ダッシュボード全体と政策推移に動的に反映されます。
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>カテゴリー名 (例: 経済)</label>
              <input value={newCatName} onChange={e => setNewCatName(e.target.value)} style={inputStyle} placeholder="新規カテゴリーラベル" />
            </div>
            <div style={{ flex: 2 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>スキャンキーワード (カンマ区切り)</label>
              <input value={newCatKeywords} onChange={e => setNewCatKeywords(e.target.value)} style={inputStyle} placeholder="例: 経済, 賃金, 物価" />
            </div>
            <button onClick={handleAddCategory} style={{ ...btnStyle, width: 'auto', padding: '0.75rem 2rem' }}>
              項目追加
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {categories.map(cat => (
              <div key={cat.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid var(--border)', position: 'relative' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>{cat.category_name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', wordBreak: 'break-all' }}>
                  キーワード: {cat.keywords}
                </div>
                <button 
                  onClick={() => handleDeleteCategory(cat.id)}
                  style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.25rem' }}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Visualization & History Section */}
        <section style={{ background: 'var(--card)', borderRadius: '12px', padding: '2rem', border: '1px solid var(--border)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart3 size={20} /> データ可視化ライブラリ (現況)
            </h2>
            <div style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
              収集単位: <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{selectedCollection || '全体(最新)'}</span>
            </div>
          </div>

          {/* Collection Unit Selector */}
          <div style={{ marginBottom: '2rem', padding: '1rem', background: 'var(--muted)', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '0.875rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Globe2 size={16} /> 収集履歴 (収集単位の選択)
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              <button 
                onClick={() => { setSelectedCollection(null); fetchLocalStats(); }}
                style={{ 
                  padding: '0.5rem 1rem', 
                  borderRadius: '20px', 
                  fontSize: '0.75rem', 
                  whiteSpace: 'nowrap',
                  background: !selectedCollection ? 'var(--primary)' : 'transparent',
                  color: !selectedCollection ? 'white' : 'var(--foreground)',
                  border: '1px solid var(--primary)'
                }}
              >
                全体(最新)
              </button>
              {collections.map(c => (
                <button 
                  key={c.id}
                  onClick={() => { setSelectedCollection(c.id); fetchLocalStats(c.id); }}
                  style={{ 
                    padding: '0.5rem 1rem', 
                    borderRadius: '20px', 
                    fontSize: '0.75rem', 
                    whiteSpace: 'nowrap',
                    background: selectedCollection === c.id ? 'var(--primary)' : 'transparent',
                    color: selectedCollection === c.id ? 'white' : 'var(--foreground)',
                    border: '1px solid var(--border)'
                  }}
                >
                  {`${c.source} | ${c.query} (${c.from} ~ ${c.until})`}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: localStats?.analysis?.sentiment ? '1fr 1fr' : '1fr', gap: '2rem' }}>
            {loadingStats ? (
              <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', gridColumn: 'span 2' }}>
                <Activity className="animate-spin" size={24} style={{ marginRight: '0.5rem' }} />
                データ分析および可視化を準備中...
              </div>
            ) : (
              <>
                {localStats && localStats.analysis?.bySpeaker?.length > 0 && (
                  <SpeakerVolumeChart data={localStats.analysis.bySpeaker} />
                )}
                {localStats && localStats.analysis?.sentiment && (
                  <SentimentDistributionChart data={localStats.analysis.sentiment.distribution} />
                )}
                {!localStats?.analysis?.bySpeaker?.length && !localStats?.analysis?.sentiment && (
                  <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-foreground)', gridColumn: 'span 2' }}>
                    ローカルに保存された {source} データがありません。
                  </div>
                )}
              </>
            )}
          </div>
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
