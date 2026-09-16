import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../utils/api';
import {
  getDashboardStats, getStudents, createStudent, updateStudent,
  deleteStudent, setStudentActive, resetStudentPassword,
  getExams, createExam, updateExam, deleteExam, publishExam,
  getQuestions, createQuestion, updateQuestion, deleteQuestion,
  getResults
} from '../../services/adminService';

const NAV = [
  { id: 'Dashboard',  icon: '🏠' },
  { id: 'Students',   icon: '👨‍🎓' },
  { id: 'Exams',      icon: '📝' },
  { id: 'Questions',  icon: '❓' },
  { id: 'Results',    icon: '📊' },
  { id: 'AI Interview', icon: '🤖', isAI: true },
  { id: 'Profile',    icon: '👤' },
];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('Dashboard');
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [results, setResults] = useState([]);
  const [interviewSessions, setInterviewSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [resultSearch, setResultSearch] = useState('');
  const [resultExamId, setResultExamId] = useState('');

  // Forms
  const [studentForm, setStudentForm] = useState({ name: '', email: '', password: '', roll: '', department: '', active: true });
  const [examForm, setExamForm] = useState({ title: '', subject: '', durationMinutes: 30, totalMarks: 100, startTime: '', endTime: '', published: false });
  const [questionForm, setQuestionForm] = useState({ questionTitle: '', option1: '', option2: '', option3: '', option4: '', correctAnswer: '', examId: '' });
  const [profileForm, setProfileForm] = useState({ name: '', email: '', password: '', newPassword: '' });
  const [editingStudent, setEditingStudent] = useState(null);
  const [editingExam, setEditingExam] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsData, studentData, examData, questionData, resultData] = await Promise.all([
          getDashboardStats(), getStudents(), getExams(), getQuestions(), getResults('', null)
        ]);
        setStats(statsData);
        setStudents(studentData);
        setExams(examData);
        setQuestions(questionData);
        setResults(resultData);
      } catch { setError('Unable to load admin dashboard'); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setProfileForm(p => ({ ...p, name: user.name || '', email: user.email || '' }));
  }, [user]);

  // Load interview sessions when tab opens
  useEffect(() => {
    if (tab !== 'AI Interview') return;
    apiClient.get('/interview/admin/all').then(res => setInterviewSessions(res.data || [])).catch(() => {});
  }, [tab]);

  const reloadData = async () => {
    try {
      setLoading(true);
      const [s, st, ex, q] = await Promise.all([getDashboardStats(), getStudents(), getExams(), getQuestions()]);
      setStats(s); setStudents(st); setExams(ex); setQuestions(q);
      await reloadResults();
    } catch { setError('Unable to refresh'); } finally { setLoading(false); }
  };
  const reloadResults = async () => {
    try { setResults(await getResults(resultSearch, resultExamId || null)); }
    catch { setError('Unable to load results'); }
  };

  // Handlers
  const handleStudentChange = e => { const { name, value, type, checked } = e.target; setStudentForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value })); };
  const handleExamChange = e => { const { name, value, type, checked } = e.target; setExamForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value })); };
  const handleQuestionChange = e => { const { name, value } = e.target; setQuestionForm(f => ({ ...f, [name]: value })); };
  const handleProfileChange = e => { const { name, value } = e.target; setProfileForm(f => ({ ...f, [name]: value })); };

  const notify = (msg) => { setStatusMessage(msg); setTimeout(() => setStatusMessage(''), 4000); };

  const submitStudent = async e => {
    e.preventDefault();
    try {
      if (editingStudent) { await updateStudent(editingStudent.id, studentForm); notify('Student updated.'); }
      else { await createStudent(studentForm); notify('Student created.'); }
      setStudentForm({ name: '', email: '', password: '', roll: '', department: '', active: true });
      setEditingStudent(null); await reloadData();
    } catch (err) { setError(err.response?.data?.message || 'Student save failed'); }
  };
  const submitExam = async e => {
    e.preventDefault();
    try {
      const payload = { ...examForm, durationMinutes: Number(examForm.durationMinutes), totalMarks: Number(examForm.totalMarks) };
      if (editingExam) { await updateExam(editingExam.id, payload); notify('Exam updated.'); }
      else { await createExam(payload); notify('Exam created.'); }
      setExamForm({ title: '', subject: '', durationMinutes: 30, totalMarks: 100, startTime: '', endTime: '', published: false });
      setEditingExam(null); await reloadData();
    } catch (err) { setError(err.response?.data?.message || 'Exam save failed'); }
  };
  const submitQuestion = async e => {
    e.preventDefault();
    try {
      const payload = { ...questionForm, examId: questionForm.examId ? Number(questionForm.examId) : null };
      if (editingQuestion) { await updateQuestion(editingQuestion.id, payload); notify('Question updated.'); }
      else { await createQuestion(payload); notify('Question created.'); }
      setQuestionForm({ questionTitle: '', option1: '', option2: '', option3: '', option4: '', correctAnswer: '', examId: '' });
      setEditingQuestion(null); await reloadData();
    } catch (err) { setError(err.response?.data?.message || 'Question save failed'); }
  };
  const submitProfile = async e => {
    e.preventDefault();
    try { await apiClient.put(`/user/profile?userId=${user.userId}`, profileForm); notify('Profile updated.'); setProfileForm(f => ({ ...f, password: '', newPassword: '' })); }
    catch { setError('Profile update failed.'); }
  };

  const startEditingStudent = s => { setEditingStudent(s); setStudentForm({ name: s.name || '', email: s.email || '', password: '', roll: s.roll || '', department: s.department || '', active: s.active }); };
  const startEditingExam = ex => { setEditingExam(ex); setExamForm({ title: ex.title || '', subject: ex.subject || '', durationMinutes: ex.durationMinutes || 30, totalMarks: ex.totalMarks || 100, startTime: ex.startTime ? ex.startTime.replace('Z', '') : '', endTime: ex.endTime ? ex.endTime.replace('Z', '') : '', published: ex.published || false }); };
  const startEditingQuestion = q => { setEditingQuestion(q); setQuestionForm({ questionTitle: q.questionTitle || '', option1: q.option1 || '', option2: q.option2 || '', option3: q.option3 || '', option4: q.option4 || '', correctAnswer: q.correctAnswer || '', examId: q.exam?.id || '' }); };

  const handleDeleteStudent = async id => { try { await deleteStudent(id); notify('Student deleted.'); await reloadData(); } catch { setError('Delete failed.'); } };
  const handleToggleActive = async (id, active) => { try { await setStudentActive(id, active); notify(active ? 'Activated.' : 'Deactivated.'); await reloadData(); } catch { setError('Update failed.'); } };
  const handleResetPwd = async (id) => { const pw = prompt('New password:'); if (pw) { try { await resetStudentPassword(id, pw); notify('Password reset.'); } catch { setError('Reset failed.'); } } };
  const handleDeleteExam = async id => { try { await deleteExam(id); notify('Exam deleted.'); await reloadData(); } catch { setError('Delete failed.'); } };
  const handleTogglePublish = async (id, p) => { try { await publishExam(id, p); notify(p ? 'Published.' : 'Unpublished.'); await reloadData(); } catch { setError('Update failed.'); } };
  const handleDeleteQuestion = async id => { try { await deleteQuestion(id); notify('Question deleted.'); await reloadData(); } catch { setError('Delete failed.'); } };

  const exportCsv = () => {
    if (!results.length) return;
    const h = ['Student Name', 'Email', 'Exam', 'Score', 'Total', 'Percentage'];
    const rows = results.map(r => [r.studentName, r.studentEmail, r.examTitle, r.score, r.totalQuestions, r.percentage.toFixed(2)]);
    const csv = [h, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'results.csv'; a.click();
  };

  if (!user) return <div style={{ padding: '40px' }}>Please log in.</div>;
  if (user.role !== 'admin') return <div style={{ padding: '40px' }}>Access denied.</div>;

  // ── shared input style ──
  const inp = { width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', background: '#f8fafc', outline: 'none' };
  const formCard = { background: '#fff', borderRadius: '14px', padding: '24px', boxShadow: '0 2px 12px rgba(15,23,42,0.06)' };

  return (
    <div className="layout-sidebar">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">🎓 Exam<span>Pro</span></div>
        <nav className="sidebar-nav">
          {NAV.map(item => (
            <button
              key={item.id}
              className={`sidebar-btn${tab === item.id ? ' active' : ''}${item.isAI ? ' ai-btn' : ''}`}
              onClick={() => setTab(item.id)}
            >
              <span>{item.icon}</span> {item.id}
            </button>
          ))}
        </nav>
        <div className="sidebar-user">
          <div style={{ fontWeight: '600', color: '#e2e8f0', marginBottom: '2px' }}>{user.email}</div>
          <div style={{ fontSize: '12px', marginBottom: '12px' }}>Administrator</div>
          <button className="btn btn-danger" style={{ width: '100%', padding: '9px' }} onClick={async () => { await logout(); navigate('/login'); }}>
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        {statusMessage && <div className="alert alert-success">{statusMessage}</div>}
        {error && <div className="alert alert-error" onClick={() => setError('')}>{error} <span style={{ float: 'right', cursor: 'pointer' }}>✕</span></div>}
        {loading && <div style={{ textAlign: 'center', padding: '60px' }}><div className="spinner" /></div>}

        {/* ── DASHBOARD ── */}
        {!loading && tab === 'Dashboard' && (
          <div className="fade-in">
            <div className="page-header">
              <h1>Admin Dashboard 🏠</h1>
              <p>Overview of your platform stats and activity.</p>
            </div>
            <div className="stats-grid">
              {[
                { icon: '👨‍🎓', label: 'Total Students',  value: stats?.totalStudents ?? 0 },
                { icon: '📝', label: 'Total Exams',      value: stats?.totalExams ?? 0 },
                { icon: '❓', label: 'Total Questions',   value: stats?.totalQuestions ?? 0 },
                { icon: '✅', label: 'Active Exams',      value: stats?.activeExams ?? 0 },
                { icon: '🏁', label: 'Completed Exams',  value: stats?.completedExams ?? 0 },
              ].map(c => (
                <div key={c.label} className="stat-card">
                  <div className="stat-icon">{c.icon}</div>
                  <div className="stat-label">{c.label}</div>
                  <div className="stat-value">{c.value}</div>
                </div>
              ))}
            </div>
            <div className="card">
              <h3 style={{ margin: '0 0 12px' }}>Quick Actions</h3>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {[['Students','👨‍🎓'],['Exams','📝'],['Questions','❓'],['Results','📊'],['AI Interview','🤖']].map(([t,icon]) => (
                  <button key={t} className={`btn ${t === 'AI Interview' ? 'btn-ai' : 'btn-outline'}`} onClick={() => setTab(t)}>
                    {icon} {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── STUDENTS ── */}
        {!loading && tab === 'Students' && (
          <div className="fade-in">
            <div className="page-header"><h1>Student Management 👨‍🎓</h1><p>Add, edit, and manage student accounts.</p></div>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
              <div style={{ ...formCard, width: '320px', flexShrink: 0 }}>
                <h3 style={{ margin: '0 0 18px' }}>{editingStudent ? 'Edit Student' : 'Add Student'}</h3>
                <form onSubmit={submitStudent}>
                  {['name','email','roll','department'].map(f => (
                    <div className="form-group" key={f}>
                      <label className="form-label">{f === 'roll' ? 'Roll No.' : f.charAt(0).toUpperCase() + f.slice(1)}</label>
                      <input className="form-input" name={f} value={studentForm[f]} onChange={handleStudentChange} required={f === 'name' || f === 'email'} />
                    </div>
                  ))}
                  {!editingStudent && (
                    <div className="form-group">
                      <label className="form-label">Password</label>
                      <input className="form-input" name="password" type="password" value={studentForm.password} onChange={handleStudentChange} required />
                    </div>
                  )}
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', fontSize: '14px' }}>
                    <input type="checkbox" name="active" checked={studentForm.active} onChange={handleStudentChange} style={{ accentColor: '#4f46e5' }} />
                    Active account
                  </label>
                  <button className="btn btn-primary" type="submit" style={{ width: '100%' }}>
                    {editingStudent ? 'Save Changes' : 'Create Student'}
                  </button>
                  {editingStudent && <button className="btn btn-ghost" type="button" style={{ width: '100%', marginTop: '8px' }} onClick={() => { setEditingStudent(null); setStudentForm({ name:'',email:'',password:'',roll:'',department:'',active:true }); }}>Cancel</button>}
                </form>
              </div>
              <div style={{ flex: 1, ...formCard }}>
                <h3 style={{ margin: '0 0 18px' }}>All Students ({students.length})</h3>
                <div className="table-wrap" style={{ boxShadow: 'none' }}>
                  <table className="data-table">
                    <thead><tr><th>Name</th><th>Email</th><th>Roll</th><th>Dept</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                      {students.map(s => (
                        <tr key={s.id}>
                          <td style={{ fontWeight: '600' }}>{s.name}</td>
                          <td>{s.email}</td>
                          <td>{s.roll || '-'}</td>
                          <td>{s.department || '-'}</td>
                          <td><span className={`badge ${s.active ? 'badge-green' : 'badge-red'}`}>{s.active ? 'Active' : 'Inactive'}</span></td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                              <button className="btn btn-outline" style={{ padding: '5px 10px', fontSize: '12px' }} onClick={() => startEditingStudent(s)}>Edit</button>
                              <button className="btn btn-danger" style={{ padding: '5px 10px', fontSize: '12px' }} onClick={() => handleDeleteStudent(s.id)}>Delete</button>
                              <button className="btn btn-ghost" style={{ padding: '5px 10px', fontSize: '12px' }} onClick={() => handleToggleActive(s.id, !s.active)}>{s.active ? 'Deactivate' : 'Activate'}</button>
                              <button className="btn btn-ghost" style={{ padding: '5px 10px', fontSize: '12px' }} onClick={() => handleResetPwd(s.id)}>Reset Pwd</button>
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

        {/* ── EXAMS ── */}
        {!loading && tab === 'Exams' && (
          <div className="fade-in">
            <div className="page-header"><h1>Exam Management 📝</h1><p>Create and publish exams for students.</p></div>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
              <div style={{ ...formCard, width: '320px', flexShrink: 0 }}>
                <h3 style={{ margin: '0 0 18px' }}>{editingExam ? 'Edit Exam' : 'Create Exam'}</h3>
                <form onSubmit={submitExam}>
                  {[['title','Title'],['subject','Subject'],['durationMinutes','Duration (min)'],['totalMarks','Total Marks']].map(([f,l]) => (
                    <div className="form-group" key={f}>
                      <label className="form-label">{l}</label>
                      <input className="form-input" name={f} value={examForm[f]} onChange={handleExamChange} required={f === 'title'} />
                    </div>
                  ))}
                  {[['startTime','Start Time'],['endTime','End Time']].map(([f,l]) => (
                    <div className="form-group" key={f}>
                      <label className="form-label">{l}</label>
                      <input className="form-input" name={f} type="datetime-local" value={examForm[f]} onChange={handleExamChange} />
                    </div>
                  ))}
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', fontSize: '14px' }}>
                    <input type="checkbox" name="published" checked={examForm.published} onChange={handleExamChange} style={{ accentColor: '#4f46e5' }} />
                    Publish immediately
                  </label>
                  <button className="btn btn-primary" type="submit" style={{ width: '100%' }}>{editingExam ? 'Update Exam' : 'Create Exam'}</button>
                  {editingExam && <button className="btn btn-ghost" type="button" style={{ width: '100%', marginTop: '8px' }} onClick={() => { setEditingExam(null); setExamForm({ title:'',subject:'',durationMinutes:30,totalMarks:100,startTime:'',endTime:'',published:false }); }}>Cancel</button>}
                </form>
              </div>
              <div style={{ flex: 1, ...formCard }}>
                <h3 style={{ margin: '0 0 18px' }}>All Exams ({exams.length})</h3>
                <div className="table-wrap" style={{ boxShadow: 'none' }}>
                  <table className="data-table">
                    <thead><tr><th>Title</th><th>Subject</th><th>Duration</th><th>Marks</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                      {exams.map(ex => (
                        <tr key={ex.id}>
                          <td style={{ fontWeight: '600' }}>{ex.title}</td>
                          <td>{ex.subject}</td>
                          <td>{ex.durationMinutes} min</td>
                          <td>{ex.totalMarks}</td>
                          <td><span className={`badge ${ex.published ? 'badge-green' : 'badge-gray'}`}>{ex.published ? 'Published' : 'Draft'}</span></td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                              <button className="btn btn-outline" style={{ padding: '5px 10px', fontSize: '12px' }} onClick={() => startEditingExam(ex)}>Edit</button>
                              <button className="btn btn-danger" style={{ padding: '5px 10px', fontSize: '12px' }} onClick={() => handleDeleteExam(ex.id)}>Delete</button>
                              <button className="btn btn-ghost" style={{ padding: '5px 10px', fontSize: '12px' }} onClick={() => handleTogglePublish(ex.id, !ex.published)}>{ex.published ? 'Unpublish' : 'Publish'}</button>
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
            <div className="page-header"><h1>Question Management ❓</h1><p>Add and manage MCQ questions for exams.</p></div>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
              <div style={{ ...formCard, width: '340px', flexShrink: 0 }}>
                <h3 style={{ margin: '0 0 18px' }}>{editingQuestion ? 'Edit Question' : 'Add Question'}</h3>
                <form onSubmit={submitQuestion}>
                  {[['questionTitle','Question'],['option1','Option A'],['option2','Option B'],['option3','Option C'],['option4','Option D'],['correctAnswer','Correct Answer']].map(([f,l]) => (
                    <div className="form-group" key={f}>
                      <label className="form-label">{l}</label>
                      <input className="form-input" name={f} value={questionForm[f]} onChange={handleQuestionChange} required />
                    </div>
                  ))}
                  <div className="form-group">
                    <label className="form-label">Assign to Exam</label>
                    <select className="form-select" name="examId" value={questionForm.examId} onChange={handleQuestionChange}>
                      <option value="">None</option>
                      {exams.map(ex => <option key={ex.id} value={ex.id}>{ex.title}</option>)}
                    </select>
                  </div>
                  <button className="btn btn-primary" type="submit" style={{ width: '100%' }}>{editingQuestion ? 'Update' : 'Add Question'}</button>
                  {editingQuestion && <button className="btn btn-ghost" type="button" style={{ width: '100%', marginTop: '8px' }} onClick={() => { setEditingQuestion(null); setQuestionForm({ questionTitle:'',option1:'',option2:'',option3:'',option4:'',correctAnswer:'',examId:'' }); }}>Cancel</button>}
                </form>
              </div>
              <div style={{ flex: 1, ...formCard }}>
                <h3 style={{ margin: '0 0 18px' }}>All Questions ({questions.length})</h3>
                <div className="table-wrap" style={{ boxShadow: 'none' }}>
                  <table className="data-table">
                    <thead><tr><th>Question</th><th>Answer</th><th>Exam</th><th>Actions</th></tr></thead>
                    <tbody>
                      {questions.map(q => (
                        <tr key={q.id}>
                          <td style={{ maxWidth: '300px' }}>{q.questionTitle}</td>
                          <td><span className="badge badge-green">{q.correctAnswer}</span></td>
                          <td>{q.exam?.title || '-'}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button className="btn btn-outline" style={{ padding: '5px 10px', fontSize: '12px' }} onClick={() => startEditingQuestion(q)}>Edit</button>
                              <button className="btn btn-danger" style={{ padding: '5px 10px', fontSize: '12px' }} onClick={() => handleDeleteQuestion(q.id)}>Delete</button>
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
            <div className="page-header"><h1>Results 📊</h1><p>View and export student exam results.</p></div>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
              <input className="form-input" style={{ flex: 1, maxWidth: '300px' }} placeholder="Search student or exam..." value={resultSearch} onChange={e => setResultSearch(e.target.value)} />
              <select className="form-select" style={{ width: '200px' }} value={resultExamId} onChange={e => setResultExamId(e.target.value)}>
                <option value="">All Exams</option>
                {exams.map(ex => <option key={ex.id} value={ex.id}>{ex.title}</option>)}
              </select>
              <button className="btn btn-primary" onClick={reloadResults}>🔍 Search</button>
              <button className="btn btn-success" onClick={exportCsv}>⬇ Export CSV</button>
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>Student</th><th>Email</th><th>Exam</th><th>Score</th><th>Total</th><th>Percentage</th><th>Date</th></tr></thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: '600' }}>{r.studentName}</td>
                      <td>{r.studentEmail}</td>
                      <td>{r.examTitle}</td>
                      <td>{r.score}</td>
                      <td>{r.totalQuestions}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '60px', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${r.percentage}%`, height: '100%', background: r.percentage >= 60 ? '#10b981' : '#ef4444', borderRadius: '3px' }} />
                          </div>
                          <span style={{ fontWeight: '600', fontSize: '13px' }}>{r.percentage.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td style={{ fontSize: '13px', color: '#94a3b8' }}>{r.completedAt ? new Date(r.completedAt).toLocaleDateString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── AI INTERVIEW ── */}
        {!loading && tab === 'AI Interview' && (
          <div className="fade-in">
            <div className="ai-header">
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🤖</div>
              <h1 style={{ margin: '0 0 8px', fontSize: '26px', fontWeight: '800' }}>AI Mock Interview Coach</h1>
              <p style={{ margin: 0, opacity: 0.85 }}>Overview of all student mock interview sessions powered by Gemini AI.</p>
            </div>

            {/* Summary cards */}
            <div className="stats-grid" style={{ marginBottom: '24px' }}>
              {[
                { icon: '🎯', label: 'Total Sessions',  value: interviewSessions.length },
                { icon: '💼', label: 'Unique Job Roles', value: new Set(interviewSessions.map(s => s.jobRole)).size },
                { icon: '⭐', label: 'Avg Score',        value: interviewSessions.length ? (interviewSessions.reduce((acc, s) => acc + (s.overallScore || 0), 0) / interviewSessions.length).toFixed(1) + '/10' : '-' },
                { icon: '👨‍💻', label: 'Students Practiced', value: new Set(interviewSessions.map(s => s.userId)).size },
              ].map(c => (
                <div key={c.label} className="stat-card">
                  <div className="stat-icon">{c.icon}</div>
                  <div className="stat-label">{c.label}</div>
                  <div className="stat-value">{c.value}</div>
                </div>
              ))}
            </div>

            {interviewSessions.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
                <p style={{ color: '#94a3b8' }}>No interview sessions yet. Students can start practicing from their dashboard.</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr><th>Student</th><th>Job Role</th><th>Questions</th><th>Overall Score</th><th>Date</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {interviewSessions.map(s => (
                      <tr key={s.id}>
                        <td style={{ fontWeight: '600' }}>{s.studentName || s.userId}</td>
                        <td><span className="badge badge-purple">💼 {s.jobRole}</span></td>
                        <td>{s.totalQuestions}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '60px', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ width: `${(s.overallScore / 10) * 100}%`, height: '100%', background: s.overallScore >= 7 ? '#10b981' : s.overallScore >= 5 ? '#f59e0b' : '#ef4444', borderRadius: '3px' }} />
                            </div>
                            <span style={{ fontWeight: '700', fontSize: '14px' }}>{s.overallScore}/10</span>
                          </div>
                        </td>
                        <td style={{ fontSize: '13px', color: '#94a3b8' }}>{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '-'}</td>
                        <td><span className={`badge ${s.completed ? 'badge-green' : 'badge-blue'}`}>{s.completed ? 'Completed' : 'In Progress'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── PROFILE ── */}
        {!loading && tab === 'Profile' && (
          <div className="fade-in">
            <div className="page-header"><h1>Profile Settings 👤</h1><p>Update your admin account details.</p></div>
            <div style={{ maxWidth: '480px', ...formCard }}>
              <form onSubmit={submitProfile}>
                {[['name','Name','text'],['email','Email','email'],['password','Current Password','password'],['newPassword','New Password','password']].map(([f,l,t]) => (
                  <div className="form-group" key={f}>
                    <label className="form-label">{l}</label>
                    <input className="form-input" name={f} type={t} value={profileForm[f]} onChange={handleProfileChange} placeholder={f === 'password' ? 'Current password to confirm changes' : f === 'newPassword' ? 'Leave blank to keep current' : ''} />
                  </div>
                ))}
                <button className="btn btn-primary" type="submit" style={{ width: '100%' }}>Save Changes</button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
