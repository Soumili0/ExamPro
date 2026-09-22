import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../utils/api';
import {
  getDashboardStats, getStudents, createStudent, updateStudent,
  deleteStudent, setStudentActive, resetStudentPassword,
  getTeachers, createTeacher, updateTeacher, deleteTeacher, setTeacherActive,
  getExams, getQuestions, getResults
} from '../../services/adminService';

const NAV = [
  { id: 'Dashboard', icon: '🏠' },
  { id: 'Teachers',  icon: '👩‍🏫' },
  { id: 'Students',  icon: '👨‍🎓' },
  { id: 'Exams',     icon: '📝' },
  { id: 'Questions', icon: '❓' },
  { id: 'Results',   icon: '📊' },
  { id: 'AI Interview', icon: '🤖', isAI: true },
  { id: 'Profile',   icon: '👤' },
];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('Dashboard');

  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [exams, setExams] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [results, setResults] = useState([]);
  const [interviewSessions, setInterviewSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [resultSearch, setResultSearch] = useState('');
  const [resultExamId, setResultExamId] = useState('');

  // Teacher form
  const [teacherForm, setTeacherForm] = useState({ name: '', email: '', password: '', department: '', active: true });
  const [editingTeacher, setEditingTeacher] = useState(null);

  // Student form
  const [studentForm, setStudentForm] = useState({ name: '', email: '', password: '', roll: '', department: '', active: true });
  const [editingStudent, setEditingStudent] = useState(null);

  // Profile form
  const [profileForm, setProfileForm] = useState({ name: '', email: '', password: '', newPassword: '' });

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsData, studentData, teacherData, examData, questionData, resultData] = await Promise.all([
          getDashboardStats(), getStudents(), getTeachers(), getExams(), getQuestions(), getResults('', null)
        ]);
        setStats(statsData);
        setStudents(studentData);
        setTeachers(teacherData);
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

  useEffect(() => {
    if (tab !== 'AI Interview') return;
    apiClient.get('/interview/admin/all').then(res => setInterviewSessions(res.data || [])).catch(() => {});
  }, [tab]);

  const reloadAll = async () => {
    try {
      setLoading(true);
      const [s, st, te, ex, q, r] = await Promise.all([
        getDashboardStats(), getStudents(), getTeachers(), getExams(), getQuestions(), getResults(resultSearch, resultExamId || null)
      ]);
      setStats(s); setStudents(st); setTeachers(te); setExams(ex); setQuestions(q); setResults(r);
    } catch { setError('Unable to refresh'); } finally { setLoading(false); }
  };

  const notify = msg => { setStatusMessage(msg); setTimeout(() => setStatusMessage(''), 4000); };

  // ── Teacher handlers ──
  const handleTeacherChange = e => {
    const { name, value, type, checked } = e.target;
    setTeacherForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };
  const submitTeacher = async e => {
    e.preventDefault();
    try {
      if (editingTeacher) { await updateTeacher(editingTeacher.id, teacherForm); notify('Teacher updated.'); }
      else { await createTeacher(teacherForm); notify('Teacher created.'); }
      setTeacherForm({ name: '', email: '', password: '', department: '', active: true });
      setEditingTeacher(null);
      await reloadAll();
    } catch (err) { setError(err.response?.data?.message || 'Teacher save failed'); }
  };
  const startEditingTeacher = t => {
    setEditingTeacher(t);
    setTeacherForm({ name: t.name || '', email: t.email || '', password: '', department: t.department || '', active: t.active });
  };

  // ── Student handlers ──
  const handleStudentChange = e => {
    const { name, value, type, checked } = e.target;
    setStudentForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };
  const submitStudent = async e => {
    e.preventDefault();
    try {
      if (editingStudent) { await updateStudent(editingStudent.id, studentForm); notify('Student updated.'); }
      else { await createStudent(studentForm); notify('Student created.'); }
      setStudentForm({ name: '', email: '', password: '', roll: '', department: '', active: true });
      setEditingStudent(null);
      await reloadAll();
    } catch (err) { setError(err.response?.data?.message || 'Student save failed'); }
  };
  const startEditingStudent = s => {
    setEditingStudent(s);
    setStudentForm({ name: s.name || '', email: s.email || '', password: '', roll: s.roll || '', department: s.department || '', active: s.active });
  };

  const submitProfile = async e => {
    e.preventDefault();
    try {
      await apiClient.put(`/user/profile?userId=${user.userId}`, profileForm);
      notify('Profile updated.');
      setProfileForm(f => ({ ...f, password: '', newPassword: '' }));
    } catch { setError('Profile update failed.'); }
  };

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
          <button className="btn btn-danger" style={{ width: '100%', padding: '9px' }}
            onClick={async () => { await logout(); navigate('/login'); }}>
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
              <p>Platform overview — monitor teachers, students, exams and results.</p>
            </div>
            <div className="stats-grid">
              {[
                { icon: '👩‍🏫', label: 'Total Teachers',  value: stats?.totalTeachers ?? 0 },
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
                {[['Teachers','👩‍🏫'],['Students','👨‍🎓'],['Exams','📝'],['Questions','❓'],['Results','📊'],['AI Interview','🤖']].map(([t,icon]) => (
                  <button key={t} className={`btn ${t === 'AI Interview' ? 'btn-ai' : 'btn-outline'}`} onClick={() => setTab(t)}>
                    {icon} {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TEACHERS ── */}
        {!loading && tab === 'Teachers' && (
          <div className="fade-in">
            <div className="page-header"><h1>Teacher Management 👩‍🏫</h1><p>Add and manage teacher accounts.</p></div>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
              <div style={{ ...formCard, width: '320px', flexShrink: 0 }}>
                <h3 style={{ margin: '0 0 18px' }}>{editingTeacher ? 'Edit Teacher' : 'Add Teacher'}</h3>
                <form onSubmit={submitTeacher}>
                  {['name','email','department'].map(f => (
                    <div className="form-group" key={f}>
                      <label className="form-label">{f.charAt(0).toUpperCase() + f.slice(1)}</label>
                      <input className="form-input" name={f} value={teacherForm[f]} onChange={handleTeacherChange} required={f !== 'department'} />
                    </div>
                  ))}
                  {!editingTeacher && (
                    <div className="form-group">
                      <label className="form-label">Password</label>
                      <input className="form-input" name="password" type="password" value={teacherForm.password} onChange={handleTeacherChange} required />
                    </div>
                  )}
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', fontSize: '14px' }}>
                    <input type="checkbox" name="active" checked={teacherForm.active} onChange={handleTeacherChange} style={{ accentColor: '#4f46e5' }} />
                    Active account
                  </label>
                  <button className="btn btn-primary" type="submit" style={{ width: '100%' }}>
                    {editingTeacher ? 'Save Changes' : 'Create Teacher'}
                  </button>
                  {editingTeacher && (
                    <button className="btn btn-ghost" type="button" style={{ width: '100%', marginTop: '8px' }}
                      onClick={() => { setEditingTeacher(null); setTeacherForm({ name:'',email:'',password:'',department:'',active:true }); }}>
                      Cancel
                    </button>
                  )}
                </form>
              </div>
              <div style={{ flex: 1, ...formCard }}>
                <h3 style={{ margin: '0 0 18px' }}>All Teachers ({teachers.length})</h3>
                <div className="table-wrap" style={{ boxShadow: 'none' }}>
                  <table className="data-table">
                    <thead><tr><th>Name</th><th>Email</th><th>Department</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                      {teachers.map(t => (
                        <tr key={t.id}>
                          <td style={{ fontWeight: '600' }}>{t.name}</td>
                          <td>{t.email}</td>
                          <td>{t.department || '-'}</td>
                          <td><span className={`badge ${t.active ? 'badge-green' : 'badge-red'}`}>{t.active ? 'Active' : 'Inactive'}</span></td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                              <button className="btn btn-outline" style={{ padding: '5px 10px', fontSize: '12px' }} onClick={() => startEditingTeacher(t)}>Edit</button>
                              <button className="btn btn-danger"  style={{ padding: '5px 10px', fontSize: '12px' }} onClick={async () => { await deleteTeacher(t.id); notify('Teacher deleted.'); await reloadAll(); }}>Delete</button>
                              <button className="btn btn-ghost"   style={{ padding: '5px 10px', fontSize: '12px' }} onClick={async () => { await setTeacherActive(t.id, !t.active); notify(t.active ? 'Deactivated.' : 'Activated.'); await reloadAll(); }}>{t.active ? 'Deactivate' : 'Activate'}</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {teachers.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>No teachers yet.</td></tr>}
                    </tbody>
                  </table>
                </div>
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
                  {editingStudent && (
                    <button className="btn btn-ghost" type="button" style={{ width: '100%', marginTop: '8px' }}
                      onClick={() => { setEditingStudent(null); setStudentForm({ name:'',email:'',password:'',roll:'',department:'',active:true }); }}>
                      Cancel
                    </button>
                  )}
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
                              <button className="btn btn-danger"  style={{ padding: '5px 10px', fontSize: '12px' }} onClick={async () => { await deleteStudent(s.id); notify('Student deleted.'); await reloadAll(); }}>Delete</button>
                              <button className="btn btn-ghost"   style={{ padding: '5px 10px', fontSize: '12px' }} onClick={async () => { await setStudentActive(s.id, !s.active); notify(s.active ? 'Deactivated.' : 'Activated.'); await reloadAll(); }}>{s.active ? 'Deactivate' : 'Activate'}</button>
                              <button className="btn btn-ghost"   style={{ padding: '5px 10px', fontSize: '12px' }} onClick={() => { const pw = prompt('New password:'); if (pw) resetStudentPassword(s.id, pw).then(() => notify('Password reset.')).catch(() => setError('Reset failed.')); }}>Reset Pwd</button>
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

        {/* ── EXAMS (monitor only) ── */}
        {!loading && tab === 'Exams' && (
          <div className="fade-in">
            <div className="page-header">
              <h1>Exams Overview 📝</h1>
              <p>Monitor all exams created by teachers. Editing is done by teachers.</p>
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>Title</th><th>Subject</th><th>Duration</th><th>Marks</th><th>Created By</th><th>Status</th></tr></thead>
                <tbody>
                  {exams.map(ex => {
                    const teacher = teachers.find(t => t.id === ex.createdBy);
                    return (
                      <tr key={ex.id}>
                        <td style={{ fontWeight: '600' }}>{ex.title}</td>
                        <td>{ex.subject}</td>
                        <td>{ex.durationMinutes} min</td>
                        <td>{ex.totalMarks}</td>
                        <td>
                          {teacher
                            ? <span className="badge badge-purple">👩‍🏫 {teacher.name}</span>
                            : <span style={{ color: '#94a3b8' }}>—</span>}
                        </td>
                        <td><span className={`badge ${ex.published ? 'badge-green' : 'badge-gray'}`}>{ex.published ? 'Published' : 'Draft'}</span></td>
                      </tr>
                    );
                  })}
                  {exams.length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>No exams yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── QUESTIONS (monitor only) ── */}
        {!loading && tab === 'Questions' && (
          <div className="fade-in">
            <div className="page-header">
              <h1>Questions Overview ❓</h1>
              <p>Monitor all questions added by teachers. Editing is done by teachers.</p>
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>Question</th><th>Correct Answer</th><th>Exam</th><th>Created By</th></tr></thead>
                <tbody>
                  {questions.map(q => {
                    const teacher = teachers.find(t => t.id === q.createdBy);
                    return (
                      <tr key={q.id}>
                        <td style={{ maxWidth: '340px' }}>{q.questionTitle}</td>
                        <td><span className="badge badge-green">{q.correctAnswer}</span></td>
                        <td>{q.exam?.title || '-'}</td>
                        <td>
                          {teacher
                            ? <span className="badge badge-purple">👩‍🏫 {teacher.name}</span>
                            : <span style={{ color: '#94a3b8' }}>—</span>}
                        </td>
                      </tr>
                    );
                  })}
                  {questions.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>No questions yet.</td></tr>}
                </tbody>
              </table>
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
              <button className="btn btn-primary" onClick={async () => { setResults(await getResults(resultSearch, resultExamId || null)); }}>🔍 Search</button>
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
                  {results.length === 0 && <tr><td colSpan="7" style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>No results found.</td></tr>}
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
              <p style={{ margin: 0, opacity: 0.85 }}>Overview of all student mock interview sessions.</p>
            </div>
            <div className="stats-grid" style={{ marginBottom: '24px' }}>
              {[
                { icon: '🎯', label: 'Total Sessions',     value: interviewSessions.length },
                { icon: '💼', label: 'Unique Job Roles',   value: new Set(interviewSessions.map(s => s.jobRole)).size },
                { icon: '⭐', label: 'Avg Score',          value: interviewSessions.length ? (interviewSessions.reduce((acc, s) => acc + (s.overallScore || 0), 0) / interviewSessions.length).toFixed(1) + '/10' : '-' },
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
                <p style={{ color: '#94a3b8' }}>No interview sessions yet.</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead><tr><th>Student</th><th>Job Role</th><th>Questions</th><th>Overall Score</th><th>Date</th><th>Status</th></tr></thead>
                  <tbody>
                    {interviewSessions.map(s => (
                      <tr key={s.id}>
                        <td style={{ fontWeight: '600' }}>{s.studentName || `User #${s.userId}`}</td>
                        <td><span className="badge badge-purple">💼 {s.jobRole}</span></td>
                        <td>{s.totalQuestions}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '50px', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ width: `${((s.overallScore||0)/10)*100}%`, height: '100%', background: (s.overallScore||0)>=7?'#10b981':(s.overallScore||0)>=5?'#f59e0b':'#ef4444', borderRadius: '3px' }} />
                            </div>
                            <span style={{ fontWeight: '700' }}>{(s.overallScore||0)}/10</span>
                          </div>
                        </td>
                        <td style={{ fontSize: '13px', color: '#94a3b8' }}>{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '-'}</td>
                        <td><span className={`badge ${s.completed ? 'badge-green' : 'badge-blue'}`}>{s.completed ? 'Done' : 'In Progress'}</span></td>
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
            <div className="page-header"><h1>My Profile 👤</h1><p>Update your admin account details.</p></div>
            <div style={{ ...formCard, maxWidth: '480px' }}>
              <form onSubmit={submitProfile}>
                {[['name','Name'],['email','Email']].map(([f,l]) => (
                  <div className="form-group" key={f}>
                    <label className="form-label">{l}</label>
                    <input className="form-input" name={f} value={profileForm[f]} onChange={e => setProfileForm(p => ({ ...p, [e.target.name]: e.target.value }))} />
                  </div>
                ))}
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <input className="form-input" name="password" type="password" value={profileForm.password} onChange={e => setProfileForm(p => ({ ...p, password: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input className="form-input" name="newPassword" type="password" value={profileForm.newPassword} onChange={e => setProfileForm(p => ({ ...p, newPassword: e.target.value }))} />
                </div>
                <button className="btn btn-primary" type="submit" style={{ width: '100%' }}>Update Profile</button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
