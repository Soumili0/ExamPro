import { useLocation, useNavigate } from 'react-router-dom';

function ScoreRing({ score, size = 100 }) {
  const max = 10;
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / max) * circumference;
  const color = score >= 8 ? '#10b981' : score >= 6 ? '#f59e0b' : score >= 4 ? '#f97316' : '#ef4444';

  return (
    <svg width={size} height={size} style={{ display: 'block' }}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth="10" />
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke={color} strokeWidth="10"
        strokeDasharray={`${filled} ${circumference - filled}`}
        strokeLinecap="round"
        style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dasharray 0.6s ease' }}
      />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fontSize={size * 0.24} fontWeight="800" fill={color}>
        {score}
      </text>
    </svg>
  );
}

export default function InterviewResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const { result, jobRole } = location.state || {};

  if (!result) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' }}>
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>😕</div>
          <p style={{ color: '#64748b' }}>No result data found.</p>
          <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => navigate('/user/interview')}>
            Start New Interview
          </button>
        </div>
      </div>
    );
  }

  const { overallScore, overallFeedback, performanceLevel, feedbacks = [] } = result;

  const levelConfig = {
    'Excellent':          { color: '#059669', bg: 'linear-gradient(135deg,#059669,#065f46)', icon: '🏆', badge: 'badge-green' },
    'Good':               { color: '#0284c7', bg: 'linear-gradient(135deg,#0284c7,#1e3a5f)', icon: '⭐', badge: 'badge-blue' },
    'Average':            { color: '#d97706', bg: 'linear-gradient(135deg,#d97706,#78350f)', icon: '📈', badge: 'badge-purple' },
    'Needs Improvement':  { color: '#dc2626', bg: 'linear-gradient(135deg,#dc2626,#7f1d1d)', icon: '💪', badge: 'badge-red' },
  };
  const lc = levelConfig[performanceLevel] || levelConfig['Average'];

  const categoryStats = feedbacks.reduce((acc, fb) => {
    const cat = fb.category || 'General';
    if (!acc[cat]) acc[cat] = { total: 0, count: 0 };
    acc[cat].total += fb.score;
    acc[cat].count += 1;
    return acc;
  }, {});

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>

      {/* Top bar */}
      <div style={{ background: 'linear-gradient(135deg,#1e1b4b,#4c1d95)', padding: '0 32px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ color: '#fff', fontWeight: '800', fontSize: '18px' }}>
          🤖 <span style={{ color: '#a78bfa' }}>AI</span> Interview Results
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-ghost" style={{ color: '#c4b5fd', borderColor: 'rgba(255,255,255,0.2)', padding: '7px 14px', fontSize: '13px' }} onClick={() => navigate('/user/interview')}>
            🔄 New Interview
          </button>
          <button className="btn btn-ghost" style={{ color: '#c4b5fd', borderColor: 'rgba(255,255,255,0.2)', padding: '7px 14px', fontSize: '13px' }} onClick={() => navigate('/user/dashboard')}>
            🏠 Dashboard
          </button>
        </div>
      </div>

      <div className="interview-container" style={{ paddingTop: '32px' }}>
        <div className="fade-in">

          {/* Hero result banner */}
          <div style={{ background: lc.bg, borderRadius: '20px', padding: '40px', color: '#fff', marginBottom: '24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '250px', height: '250px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ fontSize: '52px', marginBottom: '8px' }}>{lc.icon}</div>
              <h1 style={{ margin: '0 0 6px', fontSize: '28px', fontWeight: '900' }}>
                {performanceLevel}!
              </h1>
              <p style={{ margin: '0 0 28px', opacity: 0.85, fontSize: '15px' }}>💼 {jobRole} Interview Complete</p>

              {/* Big score */}
              <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(255,255,255,0.15)', borderRadius: '20px', padding: '20px 40px', border: '2px solid rgba(255,255,255,0.25)' }}>
                <div style={{ fontSize: '52px', fontWeight: '900', lineHeight: 1 }}>{overallScore}</div>
                <div style={{ fontSize: '15px', opacity: 0.85, marginTop: '4px' }}>out of 10</div>
              </div>
            </div>
          </div>

          {/* Overall feedback + category breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '20px', marginBottom: '24px', alignItems: 'start' }}>
            <div className="card">
              <h3 style={{ margin: '0 0 12px', fontSize: '16px', color: '#1e1b4b', fontWeight: '700' }}>
                💬 Overall Feedback
              </h3>
              <p style={{ margin: 0, color: '#334155', lineHeight: '1.8', fontSize: '15px' }}>{overallFeedback}</p>
            </div>

            <div className="card" style={{ minWidth: '220px' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#1e1b4b', fontWeight: '700' }}>
                📊 By Category
              </h3>
              {Object.entries(categoryStats).map(([cat, stat]) => {
                const avg = (stat.total / stat.count).toFixed(1);
                const pct = (stat.total / (stat.count * 10)) * 100;
                return (
                  <div key={cat} style={{ marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '5px' }}>
                      <span style={{ fontWeight: '600', color: '#334155' }}>{cat}</span>
                      <span style={{ fontWeight: '700', color: '#4f46e5' }}>{avg}/10</span>
                    </div>
                    <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: pct >= 70 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444', borderRadius: '3px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Per-question feedback */}
          <h2 style={{ margin: '0 0 16px', fontSize: '20px', color: '#1e1b4b', fontWeight: '700' }}>
            📋 Detailed Question Feedback
          </h2>

          {feedbacks.map((fb, i) => {
            const scoreColor = fb.score >= 8 ? '#059669' : fb.score >= 6 ? '#d97706' : fb.score >= 4 ? '#f97316' : '#dc2626';
            const cardClass = fb.score >= 7 ? 'correct' : fb.score >= 4 ? 'partial' : 'incorrect';

            return (
              <div key={i} className={`feedback-card ${cardClass}`} style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: '700', fontSize: '13px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Q{fb.index}
                      </span>
                      <span className={`badge ${fb.category === 'Technical' ? 'badge-blue' : fb.category === 'Behavioral' ? 'badge-green' : 'badge-purple'}`}>
                        {fb.category}
                      </span>
                    </div>
                    <h4 style={{ margin: '0', fontSize: '16px', color: '#1e1b4b', lineHeight: '1.6', fontWeight: '600' }}>
                      {fb.question}
                    </h4>
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    <ScoreRing score={fb.score} size={72} />
                  </div>
                </div>

                {/* Your answer */}
                <div style={{ background: 'rgba(255,255,255,0.6)', borderRadius: '10px', padding: '14px', marginBottom: '12px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', marginBottom: '6px' }}>
                    Your Answer
                  </div>
                  <p style={{ margin: 0, color: '#334155', fontSize: '14px', lineHeight: '1.7', fontStyle: fb.userAnswer?.trim() ? 'normal' : 'italic' }}>
                    {fb.userAnswer?.trim() || 'No answer provided'}
                  </p>
                </div>
                {/* AI Feedback */}
                <div style={{ background: 'rgba(255,255,255,0.6)', borderRadius: '10px', padding: '14px', marginBottom: '12px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#7c3aed', marginBottom: '6px' }}>
                    🤖 AI Feedback
                  </div>
                  <p style={{ margin: 0, color: '#334155', fontSize: '14px', lineHeight: '1.7' }}>{fb.feedback}</p>
                </div>

                {/* Ideal answer */}
                {fb.idealAnswer && (
                  <div style={{ background: 'rgba(255,255,255,0.6)', borderRadius: '10px', padding: '14px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#059669', marginBottom: '6px' }}>
                      ✅ Ideal Answer
                    </div>
                    <p style={{ margin: 0, color: '#334155', fontSize: '14px', lineHeight: '1.7' }}>{fb.idealAnswer}</p>
                  </div>
                )}
              </div>
            );
          })}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px', flexWrap: 'wrap' }}>
            <button className="btn btn-ai" style={{ flex: 1, padding: '14px', fontSize: '15px' }} onClick={() => navigate('/user/interview')}>
              🔄 Practice Again
            </button>
            <button className="btn btn-primary" style={{ flex: 1, padding: '14px', fontSize: '15px' }} onClick={() => navigate('/user/dashboard')}>
              🏠 Back to Dashboard
            </button>
          </div>

          {/* Tips */}
          <div className="card" style={{ marginTop: '20px', background: 'linear-gradient(135deg,#ede9fe,#fce7f3)' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '16px', color: '#4c1d95' }}>💡 Tips to Improve</h3>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#334155', fontSize: '14px', lineHeight: '2' }}>
              <li>Use the <strong>STAR method</strong> (Situation, Task, Action, Result) for behavioral questions.</li>
              <li>Be <strong>specific with examples</strong> from your real experience or projects.</li>
              <li>For technical questions, explain your <strong>thought process</strong> step by step.</li>
              <li>Practice regularly — consistent repetition builds interview confidence.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
