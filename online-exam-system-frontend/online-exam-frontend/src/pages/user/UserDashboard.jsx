import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../utils/api';
import { getInterviewHistory } from '../../services/interviewService';

const NAV = [
  { id: 'overview',    label: 'Overview',          icon: '🏠' },
  { id: 'aptitude',    label: 'Aptitude Tests',    icon: '🧮' },
  { id: 'technical',   label: 'Technical Exams',   icon: '⚡' },
  { id: 'interview',   label: 'AI Interview Coach',icon: '🤖', isAI: true },
  { id: 'history',     label: 'My History',        icon: '📊' },
];

// Classify exam by subject keyword
function classifyExam(exam) {
  const s = (exam.subject || exam.title || '').toLowerCase();
  if (s.includes('aptitude') || s.includes('verbal') || s.includes('quant') || s.includes('reasoning') || s.includes('logical')) return 'aptitude';
  if (s.includes('technical') || s.includes('coding') || s.includes('cs') || s.includes('programming') || s.includes('java') || s.includes('python') || s.includes('data') || s.includes('algo')) return 'technical';
  return 'aptitude'; // default bucket
}

function ProgressBar({ value, color = '#7c3aed', height = 8 }) {
  return (
    <div style={{ height, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden' }}>
      <div style={{ width: `${Math.min(value, 100)}%`, height: '100%', background: color, borderRadius: 999, transition: 'width 0.8s ease' }} />
    </div>
  );
}

function ExamCard({ exam, onStart, badge }) {
  return (
    <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '12px' }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: '700', color: '#1e1b4b', fontSize: '16px' }}>{exam.title}</span>
          {badge && <span className={`badge ${badge.cls}`}>{badge.label}</span>}
        </div>
        <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          <span>📚 {exam.subject || 'General'}</span>
          <span>⏱️ {exam.durationMinutes ?? '?'} min</span>
          <span>🏆 {exam.totalMarks ?? '?'} marks</span>
          {exam.startTime && <span>🗓️ {new Date(exam.startTime).toLocaleDateString()}</span>}
        </div>
      </div>
      <button className="btn btn-primary" style={{ padding: '10px 22px' }} onClick={() => onStart(exam.id)}>
        Start →
      </button>
    </div>
  );
}

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [publishedExams, setPublishedExams] = useState([]);
  const [examHistory, setExamHistory] = useState([]);
  const [interviewHistory, setInterviewHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!user?.userId) { setLoading(false); return; }
    const fetchAll = async () => {
      try {
        const [profileRes, examsRes, historyRes, interviewRes] = await Promise.all([
          apiClient.get(`/user/profile?userId=${user.userId}`),
          apiClient.get('/user/exams'),
          apiClient.get(`/user/results/${user.userId}`),
          getInterviewHistory(user.userId).catch(() => []),
        ]);
        setProfile(profileRes.data);
        setPublishedExams(examsRes.data || []);
        setExamHistory(historyRes.data || []);
        setInterviewHistory(interviewRes || []);
      } catch {
        setError('Failed to load dashboard. Please refresh.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [user]);

  const handleLogout = async () => { await logout(); navigate('/login'); };

  if (!user) return <div className="auth-wrapper"><div className="auth-card">Please log in.</div></div>;

  /* ── computed values ── */
  const now = new Date();
  const aptitudeExams  = publishedExams.filter(e => classifyExam(e) === 'aptitude');
  const technicalExams = publishedExams.filter(e => classifyExam(e) === 'technical');

  const aptitudeHistory  = examHistory.filter(r => classifyExam({ subject: r.examTitle || '', title: r.examTitle || '' }) === 'aptitude');
  const technicalHistory = examHistory.filter(r => classifyExam({ subject: r.examTitle || '', title: r.examTitle || '' }) === 'technical');

  const avgOf = (arr) => arr.length ? (arr.reduce((s, r) => s + (r.percentage || 0), 0) / arr.length).toFixed(1) : null;
  const overallAvg    = avgOf(examHistory);
  const aptitudeAvg   = avgOf(aptitudeHistory);
  const technicalAvg  = avgOf(technicalHistory);
  const interviewAvg  = interviewHistory.length
    ? (interviewHistory.reduce((s, r) => s + (r.overallScore || 0), 0) / interviewHistory.length * 10).toFixed(1)
    : null;

  const getBadge = (exam) => {
    if (!exam.startTime) return { label: 'Open', cls: 'badge-green' };
    const start = new Date(exam.startTime);
    const end = exam.endTime ? new Date(exam.endTime) : null;
    if (start > now) return { label: 'Upcoming', cls: 'badge-blue' };
    if (end && end < now) return { label: 'Ended', cls: 'badge-gray' };
    return { label: 'Active', cls: 'badge-green' };
  };

  const TABS_CONTENT = {

    /* ══ OVERVIEW ══ */
    overview: (
      <div className="fade-in">
        <div className="page-header">
          <h1>Welcome back, {profile?.name || 'Student'}! 👋</h1>
          <p>Here's your preparation progress at a glance.</p>
        </div>

        {/* Overall stats */}
        <div className="stats-grid" style={{ marginBottom: '24px' }}>
          {[
            { icon: '✅', label: 'Exams Completed', value: examHistory.length },
            { icon: '📈', label: 'Overall Avg',     value: overallAvg ? `${overallAvg}%` : '—' },
            { icon: '🤖', label: 'AI Interviews',   value: interviewHistory.length },
            { icon: '🗓️', label: 'Available Exams', value: publishedExams.length },
          ].map(c => (
            <div key={c.label} className="stat-card">
              <div className="stat-icon">{c.icon}</div>
              <div className="stat-label">{c.label}</div>
              <div className="stat-value">{c.value}</div>
            </div>
          ))}
        </div>

        {/* Progress breakdown */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <h2 style={{ margin: '0 0 20px', fontSize: '18px', color: '#1e1b4b', fontWeight: '700' }}>📊 Your Progress</h2>
          <div style={{ display: 'grid', gap: '18px' }}>
            {[
              { label: '🧮 Aptitude',          value: aptitudeAvg,  color: '#0284c7', attempts: aptitudeHistory.length,  tab: 'aptitude' },
              { label: '⚡ Technical',          value: technicalAvg, color: '#7c3aed', attempts: technicalHistory.length, tab: 'technical' },
              { label: '🤖 AI Interview Score', value: interviewAvg, color: '#db2777', attempts: interviewHistory.length, tab: 'interview', isInterview: true },
            ].map(row => (
              <div key={row.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div>
                    <span style={{ fontWeight: '600', color: '#1e1b4b', fontSize: '15px' }}>{row.label}</span>
                    <span style={{ fontSize: '12px', color: '#94a3b8', marginLeft: '10px' }}>
                      {row.attempts} attempt{row.attempts !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontWeight: '800', fontSize: '18px', color: row.color }}>
                      {row.value ? `${row.value}${row.isInterview ? '/10' : '%'}` : '—'}
                    </span>
                    <button
                      className="btn btn-ghost"
                      style={{ padding: '5px 14px', fontSize: '12px' }}
                      onClick={() => row.tab === 'interview' ? navigate('/user/interview') : setActiveTab(row.tab)}
                    >
                      Practice →
                    </button>
                  </div>
                </div>
                <ProgressBar
                  value={row.value ? (row.isInterview ? parseFloat(row.value) * 10 : parseFloat(row.value)) : 0}
                  color={row.color}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Quick action cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '16px' }}>
          {[
            { icon: '🧮', title: 'Aptitude Tests',    desc: `${aptitudeExams.length} available`,    color: '#0284c7', bg: '#eff6ff', tab: 'aptitude',  btn: 'Practice Aptitude' },
            { icon: '⚡', title: 'Technical Exams',   desc: `${technicalExams.length} available`,   color: '#7c3aed', bg: '#ede9fe', tab: 'technical', btn: 'Practice Technical' },
            { icon: '🤖', title: 'AI Interview Coach',desc: 'Pick any job role',                    color: '#db2777', bg: '#fce7f3', tab: null,        btn: 'Start Interview', isInterview: true },
          ].map(c => (
            <div key={c.title} className="card" style={{ borderTop: `3px solid ${c.color}`, cursor: 'pointer' }}
              onClick={() => c.isInterview ? navigate('/user/interview') : setActiveTab(c.tab)}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>{c.icon}</div>
              <div style={{ fontWeight: '700', color: '#1e1b4b', marginBottom: '4px' }}>{c.title}</div>
              <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '14px' }}>{c.desc}</div>
              <button className="btn" style={{ background: c.bg, color: c.color, padding: '7px 16px', fontSize: '13px', fontWeight: '700', width: '100%' }}>
                {c.btn} →
              </button>
            </div>
          ))}
        </div>
      </div>
    ),

    /* ══ APTITUDE ══ */
    aptitude: (
      <div className="fade-in">
        <div className="page-header">
          <h1>🧮 Aptitude Tests</h1>
          <p>Verbal reasoning, quantitative aptitude, and logical thinking practice.</p>
        </div>

        {/* Score card */}
        {aptitudeHistory.length > 0 && (
          <div style={{ background: 'linear-gradient(135deg,#0284c7,#0ea5e9)', borderRadius: '16px', padding: '24px 28px', marginBottom: '24px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Your Aptitude Average</div>
              <div style={{ fontSize: '42px', fontWeight: '900' }}>{aptitudeAvg}%</div>
              <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '4px' }}>{aptitudeHistory.length} exams completed</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '13px', opacity: 0.8, marginBottom: '6px' }}>Best Score</div>
              <div style={{ fontSize: '28px', fontWeight: '800' }}>
                {Math.max(...aptitudeHistory.map(r => r.percentage || 0)).toFixed(1)}%
              </div>
            </div>
          </div>
        )}

        <h3 style={{ fontWeight: '700', color: '#1e1b4b', margin: '0 0 16px' }}>Available Aptitude Tests</h3>
        {aptitudeExams.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
            <p style={{ color: '#94a3b8' }}>No aptitude tests available right now.</p>
          </div>
        ) : aptitudeExams.map(exam => (
          <ExamCard key={exam.id} exam={exam} badge={getBadge(exam)} onStart={id => navigate(`/quiz/${id}/instructions`)} />
        ))}

        {/* History */}
        {aptitudeHistory.length > 0 && (
          <>
            <h3 style={{ fontWeight: '700', color: '#1e1b4b', margin: '24px 0 16px' }}>Past Results</h3>
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>Exam</th><th>Score</th><th>Percentage</th><th>Status</th></tr></thead>
                <tbody>
                  {aptitudeHistory.map((r, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: '600' }}>{r.examTitle || '—'}</td>
                      <td>{r.score}/{r.totalQuestions}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '80px', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${r.percentage || 0}%`, height: '100%', background: r.percentage >= 60 ? '#0284c7' : '#ef4444', borderRadius: '3px' }} />
                          </div>
                          <span style={{ fontWeight: '700', fontSize: '13px' }}>{(r.percentage || 0).toFixed(1)}%</span>
                        </div>
                      </td>
                      <td><span className={`badge ${r.percentage >= 60 ? 'badge-green' : 'badge-red'}`}>{r.percentage >= 60 ? '✓ Passed' : '✗ Failed'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    ),

    /* ══ TECHNICAL ══ */
    technical: (
      <div className="fade-in">
        <div className="page-header">
          <h1>⚡ Technical Exams</h1>
          <p>Coding, CS fundamentals, algorithms, and programming language tests.</p>
        </div>

        {technicalHistory.length > 0 && (
          <div style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', borderRadius: '16px', padding: '24px 28px', marginBottom: '24px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Your Technical Average</div>
              <div style={{ fontSize: '42px', fontWeight: '900' }}>{technicalAvg}%</div>
              <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '4px' }}>{technicalHistory.length} exams completed</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '13px', opacity: 0.8, marginBottom: '6px' }}>Best Score</div>
              <div style={{ fontSize: '28px', fontWeight: '800' }}>
                {Math.max(...technicalHistory.map(r => r.percentage || 0)).toFixed(1)}%
              </div>
            </div>
          </div>
        )}

        <h3 style={{ fontWeight: '700', color: '#1e1b4b', margin: '0 0 16px' }}>Available Technical Exams</h3>
        {technicalExams.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
            <p style={{ color: '#94a3b8' }}>No technical exams available right now.</p>
          </div>
        ) : technicalExams.map(exam => (
          <ExamCard key={exam.id} exam={exam} badge={getBadge(exam)} onStart={id => navigate(`/quiz/${id}/instructions`)} />
        ))}

        {technicalHistory.length > 0 && (
          <>
            <h3 style={{ fontWeight: '700', color: '#1e1b4b', margin: '24px 0 16px' }}>Past Results</h3>
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>Exam</th><th>Score</th><th>Percentage</th><th>Status</th></tr></thead>
                <tbody>
                  {technicalHistory.map((r, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: '600' }}>{r.examTitle || '—'}</td>
                      <td>{r.score}/{r.totalQuestions}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '80px', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${r.percentage || 0}%`, height: '100%', background: r.percentage >= 60 ? '#7c3aed' : '#ef4444', borderRadius: '3px' }} />
                          </div>
                          <span style={{ fontWeight: '700', fontSize: '13px' }}>{(r.percentage || 0).toFixed(1)}%</span>
                        </div>
                      </td>
                      <td><span className={`badge ${r.percentage >= 60 ? 'badge-green' : 'badge-red'}`}>{r.percentage >= 60 ? '✓ Passed' : '✗ Failed'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    ),

    /* ══ AI INTERVIEW ══ */
    interview: (
      <div className="fade-in">
        <div style={{ background: 'linear-gradient(135deg,#1e1b4b,#4c1d95)', borderRadius: '20px', padding: '36px 32px', marginBottom: '28px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '200px', height: '200px', background: 'rgba(255,255,255,0.04)', borderRadius: '50%' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🤖</div>
            <h1 style={{ margin: '0 0 8px', fontSize: '26px', fontWeight: '800' }}>AI Mock Interview Coach</h1>
            <p style={{ margin: '0 0 24px', color: '#c4b5fd', fontSize: '15px', lineHeight: '1.7' }}>
              Pick any job role — Software Engineer, Data Analyst, HR Manager — and Gemini AI generates personalized interview questions, evaluates your answers, and gives you a score with detailed feedback.
            </p>
            <button
              className="btn"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)', color: '#fff', padding: '13px 28px', fontSize: '15px', fontWeight: '700' }}
              onClick={() => navigate('/user/interview')}
            >
              🚀 Start New Interview →
            </button>
          </div>
        </div>

        {/* Past sessions */}
        <h3 style={{ fontWeight: '700', color: '#1e1b4b', margin: '0 0 16px' }}>Past Interview Sessions</h3>
        {interviewHistory.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
            <p style={{ color: '#94a3b8', marginBottom: '16px' }}>You haven't done any mock interviews yet.</p>
            <button className="btn btn-ai" onClick={() => navigate('/user/interview')}>Start Your First Interview →</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {interviewHistory.map(session => {
              const score = session.overallScore || 0;
              const color = score >= 8 ? '#059669' : score >= 6 ? '#d97706' : '#dc2626';
              return (
                <div key={session.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontWeight: '700', color: '#1e1b4b', marginBottom: '4px' }}>💼 {session.jobRole}</div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>
                      {session.totalQuestions} questions · {session.createdAt ? new Date(session.createdAt).toLocaleDateString() : ''}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', fontWeight: '900', color }}>{score.toFixed(1)}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>out of 10</div>
                    </div>
                    <span className={`badge ${session.completed ? 'badge-green' : 'badge-blue'}`}>
                      {session.completed ? '✓ Done' : 'In Progress'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    ),

    /* ══ HISTORY ══ */
    history: (
      <div className="fade-in">
        <div className="page-header">
          <h1>📊 My History</h1>
          <p>All your past exam attempts in one place.</p>
        </div>
        {examHistory.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
            <p style={{ color: '#94a3b8', marginBottom: '16px' }}>No exam history yet.</p>
            <button className="btn btn-primary" onClick={() => setActiveTab('aptitude')}>Browse Exams</button>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Exam</th><th>Score</th><th>Percentage</th><th>Status</th><th>Date</th></tr>
              </thead>
              <tbody>
                {examHistory.map((r, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: '600' }}>{r.examTitle || '—'}</td>
                    <td>{r.score}/{r.totalQuestions}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '80px', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${r.percentage || 0}%`, height: '100%', background: r.percentage >= 60 ? '#10b981' : '#ef4444', borderRadius: '3px' }} />
                        </div>
                        <span style={{ fontWeight: '700', fontSize: '13px' }}>{(r.percentage || 0).toFixed(1)}%</span>
                      </div>
                    </td>
                    <td><span className={`badge ${r.percentage >= 60 ? 'badge-green' : 'badge-red'}`}>{r.percentage >= 60 ? '✓ Passed' : '✗ Failed'}</span></td>
                    <td style={{ color: '#94a3b8', fontSize: '13px' }}>{r.completedAt ? new Date(r.completedAt).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    ),
  };

  return (
    <div className="layout-sidebar">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">🎓 Exam<span>Pro</span></div>
        <nav className="sidebar-nav">
          {NAV.map(item => (
            <button
              key={item.id}
              className={`sidebar-btn${activeTab === item.id ? ' active' : ''}${item.isAI ? ' ai-btn' : ''}`}
              onClick={() => {
                if (item.id === 'interview') { navigate('/user/interview'); }
                else setActiveTab(item.id);
              }}
            >
              <span>{item.icon}</span> {item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-user">
          <div style={{ fontWeight: '600', color: '#e2e8f0', marginBottom: '2px' }}>{profile?.name || user.email}</div>
          <div style={{ fontSize: '12px', marginBottom: '12px' }}>{user.email}</div>
          <button onClick={handleLogout} className="btn btn-danger" style={{ width: '100%', padding: '9px' }}>
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        {error && <div className="alert alert-error">{error}</div>}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 0' }}>
            <div className="spinner" />
            <p style={{ marginTop: '16px', color: '#64748b' }}>Loading your dashboard...</p>
          </div>
        ) : (
          TABS_CONTENT[activeTab] || TABS_CONTENT['overview']
        )}
      </main>
    </div>
  );
}
