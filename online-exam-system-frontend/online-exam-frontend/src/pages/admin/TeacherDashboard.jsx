import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  getDashboardStats, getStudents, getExams, createExam, updateExam,
  deleteExam, publishExam, getQuestions, createQuestion, updateQuestion,
  deleteQuestion, getResults,
} from '../../services/adminService';
import apiClient from '../../utils/api';

const NAV = [
  { id: 'Dashboard',  icon: '🏠' },
  { id: 'Students',   icon: '👨‍🎓' },
  { id: 'Exams',      icon: '📝' },
  { id: 'Questions',  icon: '❓' },
  { id: 'Results',    icon: '📊' },
  { id: 'Interviews', icon: '🤖', isAI: true },
];

function ProgressBar({ value, color = '#7c3aed' }) {
  return (
    <div style={{ height: '6px', background: '#f1f5f9', borderRadius: 999, overflow: 'hidden' }}>
      <div style={{ width: `${Math.min(value, 100)}%`, height: '100%', background: color, borderRadius: 999 }} />
    </div>
  );
}

export default function TeacherDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab]         = useState('Dashboard');
  const [stats, setStats]     = useState(null);
  const [students, setStudents] = useState([]);
  const [exams, setExams]     = useState([]);
  const [questions, setQuestions] = useState([]);
  const [results, setResults] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [status, setStatus]   = useState('');

  // forms
  const [examForm, setExamForm]         = useState({ title: '', subject: '', durationMinutes: 30, totalMarks: 100, startTime: '', endTime: '', published: false });
  const [questionForm, setQuestionForm] = useState({ questionTitle: '', option1: '', option2: '', option3: '', option4: '', correctAnswer: '', examId: '' });
  const [editExam, setEditExam]         = useState(null);
  const [editQuestion, setEditQuestion] = useState(null);
  const [resultSearch, setResultSearch] = useState('');
  const [resultExamId, setResultExamId] = useState('');

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const [s, st, ex, q, r] = await Promise.all([getDashboardStats(), getStudents(), getExams(), getQuestions(), getResults('', null)]);
        setStats(s); setStudents(st); setExams(ex); setQuestions(q); setResults(r);
      } catch { setError('Failed to load data.'); }
      finally { setLoading(false); }
    })();
  }, [user]);

  useEffect(() => {
    if (tab !== 'Interviews') return;
    apiClient.get('/interview/admin/all').then(r => setInterviews(r.data || [])).catch(() => {});
  }, [tab]);

  const notify = msg => { setStatus(msg); setTimeout(() => setStatus(''), 4000); };

  const reload = async () => {
    const [ex, q, r] = await Promise.all([getExams(), getQuestions(), getResults(resultSearch, resultExamId || null)]);
    setExams(ex); setQuestions(q); setResults(r);
    const s = await getDashboardStats(); setStats(s);
  };

  /* ── Exam handlers ── */
  const submitExam = async e => {
    e.preventDefault();
    try {
      const p = { ...examForm, durationMinutes: +examForm.durationMinutes, totalMarks: +examForm.totalMarks, createdBy: user?.userId };
      editExam ? await updateExam(editExam.id, p) : await createExam(p);
      notify(editExam ? 'Exam updated.' : 'Exam created.');
      setExamForm({ title: '', subject: '', durationMinutes: 30, totalMarks: 100, startTime: '', endTime: '', published: false });
      setEditExam(null); await reload();
    } catch { setError('Exam save failed.'); }
  };
  const startEditExam = ex => { setEditExam(ex); setExamForm({ title: ex.title || '', subject: ex.subject || '', durationMinutes: ex.durationMinutes || 30, totalMarks: ex.totalMarks || 100, startTime: ex.startTime?.replace('Z','') || '', endTime: ex.endTime?.replace('Z','') || '', published: ex.published || false }); };

  /* ── Question handlers ── */
  const submitQuestion = async e => {
    e.preventDefault();
    try {
      const p = { ...questionForm, examId: questionForm.examId ? +questionForm.examId : null, createdBy: user?.userId };
      editQuestion ? await updateQuestion(editQuestion.id, p) : await createQuestion(p);
      notify(editQuestion ? 'Question updated.' : 'Question created.');
      setQuestionForm({ questionTitle: '', option1: '', option2: '', option3: '', option4: '', correctAnswer: '', examId: '' });
      setEditQuestion(null); await reload();
    } catch { setError('Question save failed.'); }
  };
  const startEditQuestion = q => { setEditQuestion(q); setQuestionForm({ questionTitle: q.questionTitle || '', option1: q.option1 || '', option2: q.option2 || '', option3: q.option3 || '', option4: q.option4 || '', correctAnswer: q.correctAnswer || '', examId: q.exam?.id || '' }); };

  const exportCsv = () => {
    if (!results.length) return;
    const h = ['Student','Email','Exam','Score','Total','%'];
    const rows = results.map(r => [r.studentName, r.studentEmail, r.examTitle, r.score, r.totalQuestions, r.percentage.toFixed(2)]);
    const csv = [h, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'results.csv'; a.click();
  };

  if (!user) return null;

  const fc = { background: '#fff', borderRadius: '14px', padding: '24px', boxShadow: '0 2px 12px rgba(15,23,42,0.06)' };

  return (
    <div className="layout-sidebar">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">🎓 Exam<span>Pro</span></div>
        <div style={{ fontSize: '11px', color: '#7c6fcd', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', padding: '0 16px', marginBottom: '16px' }}>
          Teacher Panel
        </div>
        <nav className="sidebar-nav">
          {NAV.map(item => (
            <button key={item.id} className={`sidebar-btn${tab === item.id ? ' active' : ''}${item.isAI ? ' ai-btn' : ''}`} onClick={() => setTab(item.id)}>
              <span>{item.icon}</span> {item.id}
            </button>
          ))}
        </nav>
        <div className="sidebar-user">
          <div style={{ fontWeight: '600', color: '#e2e8f0', marginBottom: '2px' }}>{user.email}</div>
          <div style={{ fontSize: '12px', marginBottom: '12px', color: '#a78bfa' }}>👩‍🏫 Teacher</div>
          <button className="btn btn-danger" style={{ width: '100%', padding: '9px' }} onClick={async () => { await logout(); navigate('/login'); }}>
            🚪 Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        {status && <div className="alert alert-success">{status}</div>}
        {error && <div className="alert alert-error" onClick={() => setError('')}>{error} <span style={{ float: 'right', cursor: 'pointer' }}>✕</span></div>}
        {loading && <div style={{ textAlign: 'center', padding: '60px' }}><div className="spinner" /></div>}

        {/* ── DASHBOARD ── */}
        {!loading && tab === 'Dashboard' && (
          <div className="fade-in">
            <div className="page-header">
              <h1>Teacher Dashboard 👩‍🏫</h1>
              <p>Manage your exams, questions, and track student performance.</p>
            </div>
            <div className="stats-grid">
              {[
                { icon: '👨‍🎓', label: 'Students',   value: stats?.totalStudents ?? 0 },
                { icon: '📝', label: 'Exams',        value: stats?.totalExams ?? 0 },
                { icon: '❓', label: 'Questions',    value: stats?.totalQuestions ?? 0 },
                { icon: '✅', label: 'Active Exams', value: stats?.activeExams ?? 0 },
                { icon: '🏁', label: 'Completed',    value: stats?.completedExams ?? 0 },
              ].map(c => (
                <div key={c.label} className="stat-card">
                  <div className="stat-icon">{c.icon}</div>
                  <div className="stat-label">{c.label}</div>
                  <div className="stat-value">{c.value}</div>
                </div>
              ))}
            </div>

            {/* Student performance summary */}
            <div className="card">
              <h3 style={{ margin: '0 0 20px', fontWeight: '700' }}>📊 Student Performance Overview</h3>
              {results.length === 0 ? (
                <p style={{ color: '#94a3b8', textAlign: 'center', padding: '24px 0' }}>No results yet.</p>
              ) : (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {results.slice(0, 5).map((r, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '13px', fontWeight: '700', flexShrink: 0 }}>
                        {(r.studentName || '?')[0].toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                          <span style={{ fontWeight: '600' }}>{r.studentName}</span>
                          <span style={{ fontWeight: '700', color: r.percentage >= 60 ? '#10b981' : '#ef4444' }}>{r.percentage.toFixed(1)}%</span>
                        </div>
                        <ProgressBar value={r.percentage} color={r.percentage >= 60 ? '#10b981' : '#ef4444'} />
                      </div>
                    </div>
                  ))}
                  {results.length > 5 && (
                    <button className="btn btn-ghost" style={{ width: '100%', marginTop: '8px' }} onClick={() => setTab('Results')}>
                      View All {results.length} Results →
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── STUDENTS (read-only view for teacher) ── */}
        {!loading && tab === 'Students' && (
          <div className="fade-in">
            <div className="page-header"><h1>Students 👨‍🎓</h1><p>Overview of all enrolled students.</p></div>
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>Name</th><th>Email</th><th>Roll</th><th>Department</th><th>Status</th></tr></thead>
                <tbody>
                  {students.map(s => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: '600' }}>{s.name}</td>
                      <td>{s.email}</td>
                      <td>{s.roll || '—'}</td>
                      <td>{s.department || '—'}</td>
                      <td><span className={`badge ${s.active ? 'badge-green' : 'badge-red'}`}>{s.active ? 'Active' : 'Inactive'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── EXAMS ── */}
        {!loading && tab === 'Exams' && (
          <div className="fade-in">
            <div className="page-header"><h1>Manage Exams 📝</h1><p>Create and publish exams for students.</p></div>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
              <div style={{ ...fc, width: '320px', flexShrink: 0 }}>
                <h3 style={{ margin: '0 0 18px' }}>{editExam ? 'Edit Exam' : 'Create Exam'}</h3>
                <form onSubmit={submitExam}>
                  {[['title','Title'],['subject','Subject'],['durationMinutes','Duration (min)'],['totalMarks','Total Marks']].map(([f,l]) => (
                    <div className="form-group" key={f}>
                      <label className="form-label">{l}</label>
                      <input className="form-input" name={f} value={examForm[f]} onChange={e => setExamForm(p => ({ ...p, [e.target.name]: e.target.value }))} required={f === 'title'} />
                    </div>
                  ))}
                  {[['startTime','Start Time'],['endTime','End Time']].map(([f,l]) => (
                    <div className="form-group" key={f}>
                      <label className="form-label">{l}</label>
                      <input className="form-input" name={f} type="datetime-local" value={examForm[f]} onChange={e => setExamForm(p => ({ ...p, [e.target.name]: e.target.value }))} />
                    </div>
                  ))}
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', fontSize: '14px' }}>
                    <input type="checkbox" checked={examForm.published} onChange={e => setExamForm(p => ({ ...p, published: e.target.checked }))} style={{ accentColor: '#4f46e5' }} />
                    Publish immediately
                  </label>
                  <button className="btn btn-primary" type="submit" style={{ width: '100%' }}>{editExam ? 'Update Exam' : 'Create Exam'}</button>
                  {editExam && <button className="btn btn-ghost" type="button" style={{ width: '100%', marginTop: '8px' }} onClick={() => { setEditExam(null); setExamForm({ title:'',subject:'',durationMinutes:30,totalMarks:100,startTime:'',endTime:'',published:false }); }}>Cancel</button>}
                </form>
              </div>
              <div style={{ flex: 1, ...fc }}>
                <h3 style={{ margin: '0 0 18px' }}>All Exams ({exams.length})</h3>
                <div className="table-wrap" style={{ boxShadow: 'none' }}>
                  <table className="data-table">
                    <thead><tr><th>Title</th><th>Subject</th><th>Duration</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                      {exams.map(ex => (
                        <tr key={ex.id}>
                          <td style={{ fontWeight: '600' }}>{ex.title}</td>
                          <td>{ex.subject}</td>
                          <td>{ex.durationMinutes} min</td>
                          <td><span className={`badge ${ex.published ? 'badge-green' : 'badge-gray'}`}>{ex.published ? 'Published' : 'Draft'}</span></td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                              <button className="btn btn-outline" style={{ padding: '5px 10px', fontSize: '12px' }} onClick={() => startEditExam(ex)}>Edit</button>
                              <button className="btn btn-danger"  style={{ padding: '5px 10px', fontSize: '12px' }} onClick={async () => { await deleteExam(ex.id); notify('Deleted.'); await reload(); }}>Delete</button>
                              <button className="btn btn-ghost"   style={{ padding: '5px 10px', fontSize: '12px' }} onClick={async () => { await publishExam(ex.id, !ex.published); notify(ex.published ? 'Unpublished.' : 'Published.'); await reload(); }}>
                                {ex.published ? 'Unpublish' : 'Publish'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── QUESTIONS ── */}
        {!loading && tab === 'Questions' && (
          <div className="fade-in">
            <div className="page-header"><h1>Manage Questions ❓</h1><p>Add MCQ questions to your exams.</p></div>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
              <div style={{ ...fc, width: '340px', flexShrink: 0 }}>
                <h3 style={{ margin: '0 0 18px' }}>{editQuestion ? 'Edit Question' : 'Add Question'}</h3>
                <form onSubmit={submitQuestion}>
                  {[['questionTitle','Question'],['option1','Option A'],['option2','Option B'],['option3','Option C'],['option4','Option D'],['correctAnswer','Correct Answer']].map(([f,l]) => (
                    <div className="form-group" key={f}>
                      <label className="form-label">{l}</label>
                      <input className="form-input" name={f} value={questionForm[f]} onChange={e => setQuestionForm(p => ({ ...p, [e.target.name]: e.target.value }))} required />
                    </div>
                  ))}
                  <div className="form-group">
                    <label className="form-label">Assign to Exam</label>
                    <select className="form-select" value={questionForm.examId} onChange={e => setQuestionForm(p => ({ ...p, examId: e.target.value }))}>
                      <option value="">None</option>
                      {exams.map(ex => <option key={ex.id} value={ex.id}>{ex.title}</option>)}
                    </select>
                  </div>
                  <button className="btn btn-primary" type="submit" style={{ width: '100%' }}>{editQuestion ? 'Update' : 'Add Question'}</button>
                  {editQuestion && <button className="btn btn-ghost" type="button" style={{ width: '100%', marginTop: '8px' }} onClick={() => { setEditQuestion(null); setQuestionForm({ questionTitle:'',option1:'',option2:'',option3:'',option4:'',correctAnswer:'',examId:'' }); }}>Cancel</button>}
                </form>
              </div>
              <div style={{ flex: 1, ...fc }}>
                <h3 style={{ margin: '0 0 18px' }}>All Questions ({questions.length})</h3>
                <div className="table-wrap" style={{ boxShadow: 'none' }}>
                  <table className="data-table">
                    <thead><tr><th>Question</th><th>Answer</th><th>Exam</th><th>Actions</th></tr></thead>
                    <tbody>
                      {questions.map(q => (
                        <tr key={q.id}>
                          <td style={{ maxWidth: '300px' }}>{q.questionTitle}</td>
                          <td><span className="badge badge-green">{q.correctAnswer}</span></td>
                          <td>{q.exam?.title || '—'}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button className="btn btn-outline" style={{ padding: '5px 10px', fontSize: '12px' }} onClick={() => startEditQuestion(q)}>Edit</button>
                              <button className="btn btn-danger"  style={{ padding: '5px 10px', fontSize: '12px' }} onClick={async () => { await deleteQuestion(q.id); notify('Deleted.'); await reload(); }}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── RESULTS ── */}
        {!loading && tab === 'Results' && (
          <div className="fade-in">
            <div className="page-header"><h1>Student Results 📊</h1><p>View and export exam performance data.</p></div>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <input className="form-input" style={{ flex: 1, maxWidth: '280px' }} placeholder="Search student or exam..." value={resultSearch} onChange={e => setResultSearch(e.target.value)} />
              <select className="form-select" style={{ width: '200px' }} value={resultExamId} onChange={e => setResultExamId(e.target.value)}>
                <option value="">All Exams</option>
                {exams.map(ex => <option key={ex.id} value={ex.id}>{ex.title}</option>)}
              </select>
              <button className="btn btn-primary" onClick={async () => { setResults(await getResults(resultSearch, resultExamId || null)); }}>🔍 Search</button>
              <button className="btn btn-success" onClick={exportCsv}>⬇ Export CSV</button>
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>Student</th><th>Exam</th><th>Score</th><th>Percentage</th><th>Date</th></tr></thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={i}>
                      <td>
                        <div style={{ fontWeight: '600' }}>{r.studentName}</div>
                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>{r.studentEmail}</div>
                      </td>
                      <td>{r.examTitle}</td>
                      <td>{r.score}/{r.totalQuestions}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '60px', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${r.percentage}%`, height: '100%', background: r.percentage >= 60 ? '#10b981' : '#ef4444', borderRadius: '3px' }} />
                          </div>
                          <span style={{ fontWeight: '700', fontSize: '13px' }}>{r.percentage.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td style={{ fontSize: '13px', color: '#94a3b8' }}>{r.completedAt ? new Date(r.completedAt).toLocaleDateString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── INTERVIEWS ── */}
        {!loading && tab === 'Interviews' && (
          <div className="fade-in">
            <div className="ai-header">
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🤖</div>
              <h1 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: '800' }}>AI Interview Sessions</h1>
              <p style={{ margin: 0, opacity: 0.85 }}>Track all student mock interview activity.</p>
            </div>
            <div className="stats-grid" style={{ marginBottom: '24px' }}>
              {[
                { icon: '🎯', label: 'Total Sessions',   value: interviews.length },
                { icon: '💼', label: 'Unique Roles',     value: new Set(interviews.map(s => s.jobRole)).size },
                { icon: '⭐', label: 'Avg Score',        value: interviews.length ? (interviews.reduce((a,s)=>a+(s.overallScore||0),0)/interviews.length).toFixed(1)+'/10' : '—' },
                { icon: '👨‍💻', label: 'Students Practiced', value: new Set(interviews.map(s => s.userId)).size },
              ].map(c => (
                <div key={c.label} className="stat-card">
                  <div className="stat-icon">{c.icon}</div>
                  <div className="stat-label">{c.label}</div>
                  <div className="stat-value">{c.value}</div>
                </div>
              ))}
            </div>
            {interviews.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
                <p style={{ color: '#94a3b8' }}>No interview sessions yet.</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead><tr><th>Student</th><th>Job Role</th><th>Questions</th><th>Score</th><th>Date</th><th>Status</th></tr></thead>
                  <tbody>
                    {interviews.map(s => (
                      <tr key={s.id}>
                        <td style={{ fontWeight: '600' }}>{s.studentName || `User #${s.userId}`}</td>
                        <td><span className="badge badge-purple">💼 {s.jobRole}</span></td>
                        <td>{s.totalQuestions}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '50px', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ width: `${((s.overallScore||0)/10)*100}%`, height: '100%', background: (s.overallScore||0)>=7?'#10b981':(s.overallScore||0)>=5?'#f59e0b':'#ef4444', borderRadius: '3px' }} />
                            </div>
                            <span style={{ fontWeight: '700', fontSize: '14px' }}>{(s.overallScore||0)}/10</span>
                          </div>
                        </td>
                        <td style={{ fontSize: '13px', color: '#94a3b8' }}>{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '—'}</td>
                        <td><span className={`badge ${s.completed?'badge-green':'badge-blue'}`}>{s.completed?'Done':'In Progress'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
