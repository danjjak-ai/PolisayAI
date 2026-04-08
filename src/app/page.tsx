'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  MessageSquare, 
  TrendingUp, 
  AlertCircle,
  Clock,
  Target
} from 'lucide-react';

export default function Dashboard() {
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    fetch('/api/stats/summary')
      .then(res => res.json())
      .then(data => setSummary(data));
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <header style={{ marginBottom: "3rem" }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>Intelligence Dashboard</h1>
        <p style={{ color: "var(--muted-foreground)" }}>Real-time analysis of legislative data and stakeholder influence.</p>
      </header>

      {/* Metric Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem", marginBottom: "3rem" }}>
        <div className="glass" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
            <span style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}>Total Records (Aquired)</span>
            <MessageSquare size={18} color="var(--primary)" />
          </div>
          <div style={{ fontSize: "2rem", fontWeight: "bold" }}>{summary?.totalRecords || '...'}</div>
          <div style={{ fontSize: "0.75rem", color: "#10b981", marginTop: "0.5rem" }}>+12% from last fetch</div>
        </div>

        <div className="glass" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
            <span style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}>KOLs Tracked</span>
            <Users size={18} color="var(--chart-1)" />
          </div>
          <div style={{ fontSize: "2rem", fontWeight: "bold" }}>{summary?.totalSpeakers || '...'}</div>
          <div style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", marginTop: "0.5rem" }}>Active political influencers</div>
        </div>

        <div className="glass" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
            <span style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}>Anomalies Detected</span>
            <AlertCircle size={18} color="var(--chart-4)" />
          </div>
          <div style={{ fontSize: "2rem", fontWeight: "bold" }}>7</div>
          <div style={{ fontSize: "0.75rem", color: "#ef4444", marginTop: "0.5rem" }}>4 critical policy shifts</div>
        </div>

        <div className="glass" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
            <span style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}>Meeting Forums</span>
            <Clock size={18} color="var(--chart-3)" />
          </div>
          <div style={{ fontSize: "2rem", fontWeight: "bold" }}>{summary?.totalMeetings || '...'}</div>
          <div style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", marginTop: "0.5rem" }}>Committee engagements</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
        {/* Topic Trends */}
        <section className="glass" style={{ padding: "2rem" }}>
          <h2 style={{ fontSize: "1.25rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
             <TrendingUp size={20} /> Policy Topic Trends
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {summary?.topTopics?.map((topic: any) => (
              <div key={topic.name}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "0.875rem" }}>
                  <span>{topic.name}</span>
                  <span style={{ color: "var(--primary)" }}>{topic.count} mentions</span>
                </div>
                <div style={{ height: "8px", background: "rgba(255,255,255,0.05)", borderRadius: "4px" }}>
                  <div style={{ 
                    height: "100%", 
                    width: `${Math.min(100, (topic.count / summary.totalRecords) * 100 * 5)}%`, 
                    background: "var(--primary)", 
                    borderRadius: "4px",
                    transition: "width 1s ease-out"
                  }}></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Action Center */}
        <section className="glass" style={{ padding: "1.5rem" }}>
          <h2 style={{ fontSize: "1.25rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Target size={20} /> Alert Feed
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
             <div style={{ padding: "1rem", background: "rgba(239, 68, 68, 0.1)", borderLeft: "4px solid #ef4444", borderRadius: "4px" }}>
               <div style={{ fontWeight: "bold", fontSize: "0.875rem" }}>Sudden Shift: DX Policy</div>
               <div style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", marginTop: "0.25rem" }}>Legislative momentum increased by 40% in last 2JSON batches.</div>
             </div>
             <div style={{ padding: "1rem", background: "rgba(59, 130, 246, 0.1)", borderLeft: "4px solid var(--primary)", borderRadius: "4px" }}>
               <div style={{ fontWeight: "bold", fontSize: "0.875rem" }}>New KOL Discovery</div>
               <div style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", marginTop: "0.25rem" }}>A new stakeholder group identified from JP Diet records.</div>
             </div>
          </div>
        </section>
      </div>
    </div>
  );
}
