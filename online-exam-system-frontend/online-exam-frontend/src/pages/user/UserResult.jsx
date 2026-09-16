import { useLocation, useNavigate } from 'react-router-dom';

export default function UserResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const { score = 0, totalQuestions = 0 } = location.state || {};
  const percentage = totalQuestions > 0 ? ((score / totalQuestions) * 100).toFixed(1) : 0;
  const passed = Number(percentage) >= 60;
  const incorrect = totalQuestions - score;

  const getGrade = (p) => {
    if (p >= 90) return { grade: 'A+', color: '#059669', bg: '#ecfdf5' };
    if (p >= 80) return { grade: 'A',  color: '#0284c7', bg: '#eff6ff' };
    if (p >= 70) return { grade: 'B',  color: '#7c3aed', bg: '#ede9fe' };
    if (p >= 60) return { grade: 'C',  color: '#d97706', bg: '#fffbeb' };
    return              { grade: 'F',  color: '#dc2626', bg: '#fef2f2' };
  };
  const { grade, color, bg } = getGrade(Number(percentage));

  const circleColor = passed
    ? 'linear-gradient(135deg,#059669,#10b981)'
    : 'linear-gradient(135deg,#dc2626,#ef4444)';

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '600px' }} className="fade-in">

        {/* Hero score card */}
        <div style={{ background: passed ? 'linear-gradient(135deg,#059669,#065f46)' : 'linear-gradient(135deg,#dc2626,#7f1d1d)', borderRadius: '20px', padding: '40px', textAlign: 'center', color: '#fff', marginBottom: '20px' }}>
          <div style={{ fontSize: '52px', marginBottom: '12px' }}>{passed ? '🏆' : '📚'}</div>
          <h1 style={{ margin: '0 0 8px', fontSize: '28px', fontWeight: '800' }}>
            {passed ? 'Congratulations!' : 'Keep Practicing!'}
          </h1>
          <p style={{ margin: '0 0 28px', opacity: 0.85, fontSize: '15px' }}>
            {passed ? "You passed the exam. Great job!" : "You didn't pass this time, but you can do it!"}
          </p>

          {/* Score circle */}
          <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(255,255,255,0.15)', borderRadius: '50%', width: '130px', height: '130px', justifyContent: 'center', margin: '0 auto', border: '4px solid rgba(255,255,255,0.3)' }}>
            <div style={{ fontSize: '36px', fontWeight: '900', lineHeight: 1 }}>{score}/{totalQuestions}</div>
            <div style={{ fontSize: '14px', opacity: 0.85 }}>Score</div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px', marginBottom: '20px' }}>
          {[
            { label: 'Percentage', value: `${percentage}%`, icon: '📈', color: '#4f46e5' },
            { label: 'Grade',      value: grade,            icon: '🎓', color },
            { label: 'Status',     value: passed ? 'Passed' : 'Failed', icon: passed ? '✅' : '❌', color: passed ? '#059669' : '#dc2626' },
          ].map(s => (
            <div key={s.label} className="card" style={{ textAlign: 'center', padding: '20px 14px', background: s.label === 'Grade' ? bg : '#fff' }}>
              <div style={{ fontSize: '28px', marginBottom: '6px' }}>{s.icon}</div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Breakdown */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <h2 style={{ margin: '0 0 20px', fontSize: '17px', color: '#1e1b4b', fontWeight: '700' }}>📋 Result Breakdown</h2>
          {[
            { label: 'Total Questions', value: totalQuestions, icon: '❓' },
            { label: 'Correct Answers', value: score,           icon: '✅', color: '#059669' },
            { label: 'Wrong Answers',   value: incorrect,       icon: '❌', color: '#dc2626' },
            { label: 'Passing Score',   value: '60%',           icon: '🎯' },
          ].map(row => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: '14px', color: '#64748b' }}>{row.icon} {row.label}</span>
              <span style={{ fontWeight: '700', fontSize: '16px', color: row.color || '#1e1b4b' }}>{row.value}</span>
            </div>
          ))}

          {/* Visual bar */}
          <div style={{ marginTop: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>
              <span>Your Score</span><span>{percentage}%</span>
            </div>
            <div style={{ height: '10px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ width: `${percentage}%`, height: '100%', background: passed ? 'linear-gradient(90deg,#059669,#10b981)' : 'linear-gradient(90deg,#dc2626,#ef4444)', borderRadius: '999px', transition: 'width 0.6s ease' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ width: '1px', height: '12px', background: '#94a3b8', position: 'relative', left: `calc(60% - 1px)`, marginTop: '-10px' }} />
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'left', marginLeft: 'calc(60% - 14px)' }}>60% pass</div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-primary" style={{ flex: 1, padding: '13px', fontSize: '15px' }} onClick={() => navigate('/user/dashboard')}>
            🏠 Back to Dashboard
          </button>
          <button
            className="btn"
            style={{ flex: 1, padding: '13px', fontSize: '15px', background: 'linear-gradient(135deg,#7c3aed,#db2777)', color: '#fff' }}
            onClick={() => navigate('/user/interview')}
          >
            🤖 Try AI Interview
          </button>
        </div>
      </div>
    </div>
  );
}
