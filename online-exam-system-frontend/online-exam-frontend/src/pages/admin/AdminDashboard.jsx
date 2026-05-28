import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import LogoutButton from '../../components/LogoutButton';
import apiClient from '../../utils/api';
import {
  getDashboardStats,
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  setStudentActive,
  resetStudentPassword,
  getExams,
  createExam,
  updateExam,
  deleteExam,
  publishExam,
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getResults
} from '../../services/adminService';

const tabButtonStyle = (active) => ({
  padding: '10px 18px',
  border: 'none',
  borderBottom: active ? '3px solid #007bff' : '3px solid transparent',
  backgroundColor: 'transparent',
  cursor: 'pointer',
  fontWeight: active ? '700' : '500'
});

export default function AdminDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('Dashboard');
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [studentForm, setStudentForm] = useState({ name: '', email: '', password: '', roll: '', department: '', active: true });
  const [examForm, setExamForm] = useState({ title: '', subject: '', durationMinutes: 30, totalMarks: 100, startTime: '', endTime: '', published: false });
  const [questionForm, setQuestionForm] = useState({ questionTitle: '', option1: '', option2: '', option3: '', option4: '', correctAnswer: '', examId: '' });
  const [editingStudent, setEditingStudent] = useState(null);
  const [editingExam, setEditingExam] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [profileForm, setProfileForm] = useState({ name: '', email: '', password: '', newPassword: '' });
  const [statusMessage, setStatusMessage] = useState('');
  const [resultSearch, setResultSearch] = useState('');
  const [resultExamId, setResultExamId] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsData, studentData, examData, questionData, resultData] = await Promise.all([
          getDashboardStats(),
          getStudents(),
          getExams(),
          getQuestions(),
          getResults('', null)
        ]);
        setStats(statsData);
        setStudents(studentData);
        setExams(examData);
        setQuestions(questionData);
        setResults(resultData);
      } catch (err) {
        setError('Unable to load admin dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setProfileForm((prev) => ({ ...prev, name: user.name || '', email: user.email || '' }));
  }, [user]);

  const reloadData = async () => {
    try {
      setLoading(true);
      const [statsData, studentData, examData, questionData] = await Promise.all([
        getDashboardStats(),
        getStudents(),
        getExams(),
        getQuestions()
      ]);
      setStats(statsData);
      setStudents(studentData);
      setExams(examData);
      setQuestions(questionData);
      await reloadResults();
    } catch (err) {
      setError('Unable to refresh data');
    } finally {
      setLoading(false);
    }
  };

  const reloadResults = async () => {
    try {
      const resultData = await getResults(resultSearch, resultExamId || null);
      setResults(resultData);
    } catch {
      setError('Unable to load results');
    }
  };

  const handleStudentChange = (e) => {
    const { name, value, type, checked } = e.target;
    setStudentForm({ ...studentForm, [name]: type === 'checkbox' ? checked : value });
  };

  const handleExamChange = (e) => {
    const { name, value, type, checked } = e.target;
    setExamForm({ ...examForm, [name]: type === 'checkbox' ? checked : value });
  };

  const handleQuestionChange = (e) => {
    const { name, value } = e.target;
    setQuestionForm({ ...questionForm, [name]: value });
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm({ ...profileForm, [name]: value });
  };

  const submitStudent = async (e) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await updateStudent(editingStudent.id, studentForm);
        setStatusMessage('Student updated.');
      } else {
        await createStudent(studentForm);
        setStatusMessage('Student created.');
      }
      setStudentForm({ name: '', email: '', password: '', roll: '', department: '', active: true });
      setEditingStudent(null);
      await reloadData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Student save failed');
    }
  };

  const submitExam = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...examForm,
        durationMinutes: Number(examForm.durationMinutes),
        totalMarks: Number(examForm.totalMarks)
      };
      if (editingExam) {
        await updateExam(editingExam.id, payload);
        setStatusMessage('Exam updated.');
      } else {
        await createExam(payload);
        setStatusMessage('Exam created.');
      }
      setExamForm({ title: '', subject: '', durationMinutes: 30, totalMarks: 100, startTime: '', endTime: '', published: false });
      setEditingExam(null);
      await reloadData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Exam save failed');
    }
  };

  const submitQuestion = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...questionForm,
        examId: questionForm.examId ? Number(questionForm.examId) : null
      };
      if (editingQuestion) {
        await updateQuestion(editingQuestion.id, payload);
        setStatusMessage('Question updated.');
      } else {
        await createQuestion(payload);
        setStatusMessage('Question created.');
      }
      setQuestionForm({ questionTitle: '', option1: '', option2: '', option3: '', option4: '', correctAnswer: '', examId: '' });
      setEditingQuestion(null);
      await reloadData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Question save failed');
    }
  };

  const submitProfile = async (e) => {
    e.preventDefault();
    try {
      await apiClient.put(`/user/profile?userId=${user.userId}`, profileForm);
      setStatusMessage('Profile updated successfully.');
      setProfileForm({ ...profileForm, password: '', newPassword: '' });
    } catch {
      setError('Profile update failed.');
    }
  };

  const exportResultsCsv = () => {
    if (!results.length) return;
    const header = ['Student Name', 'Email', 'Exam', 'Score', 'Total Questions', 'Percentage'];
    const rows = results.map(row => [
      row.studentName,
      row.studentEmail,
      row.examTitle,
      row.score,
      row.totalQuestions,
      row.percentage.toFixed(2)
    ]);
    const csvContent = [header, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'results.csv';
    link.click();
  };

  const startEditingStudent = (student) => {
    setEditingStudent(student);
    setStudentForm({
      name: student.name || '',
      email: student.email || '',
      password: '',
      roll: student.roll || '',
      department: student.department || '',
      active: student.active
    });
  };

  const startEditingExam = (exam) => {
    setEditingExam(exam);
    setExamForm({
      title: exam.title || '',
      subject: exam.subject || '',
      durationMinutes: exam.durationMinutes || 30,
      totalMarks: exam.totalMarks || 100,
      startTime: exam.startTime ? exam.startTime.replace('Z', '') : '',
      endTime: exam.endTime ? exam.endTime.replace('Z', '') : '',
      published: exam.published || false
    });
  };

  const startEditingQuestion = (question) => {
    setEditingQuestion(question);
    setQuestionForm({
      questionTitle: question.questionTitle || '',
      option1: question.option1 || '',
      option2: question.option2 || '',
      option3: question.option3 || '',
      option4: question.option4 || '',
      correctAnswer: question.correctAnswer || '',
      examId: question.exam?.id || ''
    });
  };

  const handleDeleteStudent = async (studentId) => {
    try {
      await deleteStudent(studentId);
      setStatusMessage('Student deleted.');
      await reloadData();
    } catch {
      setError('Failed to delete student.');
    }
  };

  const handleToggleStudentActive = async (studentId, active) => {
    try {
      await setStudentActive(studentId, active);
      setStatusMessage(active ? 'Student activated.' : 'Student deactivated.');
      await reloadData();
    } catch {
      setError('Unable to update student active status.');
    }
  };

  const handleResetStudentPassword = async (studentId, password) => {
    try {
      await resetStudentPassword(studentId, password);
      setStatusMessage('Student password reset successfully.');
    } catch {
      setError('Unable to reset password.');
    }
  };

  const handleDeleteExam = async (examId) => {
    try {
      await deleteExam(examId);
      setStatusMessage('Exam deleted.');
      await reloadData();
    } catch {
      setError('Failed to delete exam.');
    }
  };

  const handleTogglePublishExam = async (examId, published) => {
    try {
      await publishExam(examId, published);
      setStatusMessage(published ? 'Exam published.' : 'Exam unpublished.');
      await reloadData();
    } catch {
      setError('Unable to update exam publish state.');
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    try {
      await deleteQuestion(questionId);
      setStatusMessage('Question deleted.');
      await reloadData();
    } catch {
      setError('Failed to delete question.');
    }
  };

  if (!user) {
    return <div>Please log in as admin.</div>;
  }

  if (user.role !== 'admin') {
    return <div style={{ padding: '20px' }}>Access denied. Admin role required.</div>;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f7fb' }}>
      <aside style={{ width: '250px', backgroundColor: '#fff', padding: '20px', boxShadow: '2px 0 10px rgba(0,0,0,0.05)' }}>
        <h2>Admin Menu</h2>
        {['Dashboard', 'Students', 'Exams', 'Questions', 'Results', 'Profile'].map(item => (
          <button key={item} style={{ ...tabButtonStyle(item === tab), width: '100%', textAlign: 'left', marginBottom: '6px' }} onClick={() => setTab(item)}>
            {item}
          </button>
        ))}
        <div style={{ marginTop: '24px' }}>
          <LogoutButton />
        </div>
      </aside>

      <main style={{ flex: 1, padding: '30px 40px' }}>
        <header style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Admin Dashboard</h1>
            <p style={{ color: '#555' }}>Manage students, exams, questions, and results from one place.</p>
          </div>
          <div style={{ color: '#666' }}>
            Signed in as <strong>{user.email}</strong>
          </div>
        </header>

        {statusMessage && <div style={{ marginBottom: '16px', padding: '12px', borderRadius: '6px', backgroundColor: '#e6ffed', color: '#1a7f37' }}>{statusMessage}</div>}
        {error && <div style={{ marginBottom: '16px', padding: '12px', borderRadius: '6px', backgroundColor: '#ffe6e6', color: '#a10202' }}>{error}</div>}

        {loading && <p>Loading admin dashboard...</p>}

        {!loading && tab === 'Dashboard' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '16px', marginBottom: '30px' }}>
              {[
                { label: 'Total Students', value: stats?.totalStudents },
                { label: 'Total Exams', value: stats?.totalExams },
                { label: 'Total Questions', value: stats?.totalQuestions },
                { label: 'Active Exams', value: stats?.activeExams },
                { label: 'Completed Exams', value: stats?.completedExams }
              ].map(card => (
                <div key={card.label} style={{ padding: '22px', borderRadius: '14px', backgroundColor: '#fff', boxShadow: '0 4px 18px rgba(15,23,42,0.06)' }}>
                  <p style={{ margin: 0, color: '#888' }}>{card.label}</p>
                  <h2 style={{ margin: '12px 0 0', fontSize: '28px' }}>{card.value ?? 0}</h2>
                </div>
              ))}
            </div>
            <section style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '14px', boxShadow: '0 4px 18px rgba(15,23,42,0.06)' }}>
              <h2>Recent activity</h2>
              <p>Use the tabs on the left to manage students, exams, questions, results and profile settings.</p>
            </section>
          </div>
        )}

        {!loading && tab === 'Students' && (
          <div>
            <h2>Student Management</h2>
            <div style={{ display: 'flex', gap: '24px', marginTop: '20px' }}>
              <div style={{ flex: 1, backgroundColor: '#fff', padding: '20px', borderRadius: '14px', boxShadow: '0 4px 18px rgba(15,23,42,0.05)' }}>
                <h3>{editingStudent ? 'Edit Student' : 'Add Student'}</h3>
                <form onSubmit={submitStudent}>
                  {['name', 'email', 'roll', 'department'].map(field => (
                    <div key={field} style={{ marginBottom: '14px' }}>
                      <label style={{ display: 'block', marginBottom: '6px' }}>{field.charAt(0).toUpperCase() + field.slice(1)}:</label>
                      <input name={field} value={studentForm[field]} onChange={handleStudentChange} required={field !== 'roll' && field !== 'department'} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                    </div>
                  ))}
                  {!editingStudent && (
                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ display: 'block', marginBottom: '6px' }}>Password:</label>
                      <input name="password" type="password" value={studentForm.password} onChange={handleStudentChange} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                    </div>
                  )}
                  <div style={{ marginBottom: '14px' }}>
                    <label>
                      <input type="checkbox" name="active" checked={studentForm.active} onChange={handleStudentChange} style={{ marginRight: '10px' }} />
                      Active account
                    </label>
                  </div>
                  <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '8px' }}>
                    {editingStudent ? 'Save Changes' : 'Create Student'}
                  </button>
                </form>
              </div>

              <div style={{ flex: 2, backgroundColor: '#fff', padding: '20px', borderRadius: '14px', boxShadow: '0 4px 18px rgba(15,23,42,0.05)' }}>
                <h3>Student List</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f5f7fb' }}>
                      {['Name', 'Email', 'Roll', 'Department', 'Status', 'Actions'].map(header => (
                        <th key={header} style={{ padding: '12px 10px', textAlign: 'left', color: '#444' }}>{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(student => (
                      <tr key={student.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '12px 10px' }}>{student.name}</td>
                        <td style={{ padding: '12px 10px' }}>{student.email}</td>
                        <td style={{ padding: '12px 10px' }}>{student.roll || '-'}</td>
                        <td style={{ padding: '12px 10px' }}>{student.department || '-'}</td>
                        <td style={{ padding: '12px 10px' }}>{student.active ? 'Active' : 'Inactive'}</td>
                        <td style={{ padding: '12px 10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button type="button" onClick={() => startEditingStudent(student)} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #007bff', background: 'white', color: '#007bff' }}>
                            Edit
                          </button>
                          <button type="button" onClick={() => handleDeleteStudent(student.id)} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #e74c3c', background: 'white', color: '#e74c3c' }}>
                            Delete
                          </button>
                          <button type="button" onClick={() => handleToggleStudentActive(student.id, !student.active)} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #28a745', background: 'white', color: '#28a745' }}>
                            {student.active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button type="button" onClick={() => {
                            const newPassword = prompt('Enter new password for this student:', 'Student123');
                            if (newPassword) handleResetStudentPassword(student.id, newPassword);
                          }} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #444', background: 'white', color: '#444' }}>
                            Reset Password
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {!loading && tab === 'Exams' && (
          <div>
            <h2>Exam Management</h2>
            <div style={{ display: 'flex', gap: '24px', marginTop: '20px' }}>
              <div style={{ flex: 1, backgroundColor: '#fff', padding: '20px', borderRadius: '14px', boxShadow: '0 4px 18px rgba(15,23,42,0.05)' }}>
                <h3>{editingExam ? 'Edit Exam' : 'Create Exam'}</h3>
                <form onSubmit={submitExam}>
                  {['title', 'subject', 'durationMinutes', 'totalMarks', 'startTime', 'endTime'].map(field => (
                    <div key={field} style={{ marginBottom: '14px' }}>
                      <label style={{ display: 'block', marginBottom: '6px' }}>{field === 'durationMinutes' ? 'Duration (minutes)' : field === 'totalMarks' ? 'Total Marks' : field === 'startTime' ? 'Start Time' : field === 'endTime' ? 'End Time' : field.charAt(0).toUpperCase() + field.slice(1)}:</label>
                      <input
                        name={field}
                        value={examForm[field]}
                        onChange={handleExamChange}
                        type={field.includes('Time') ? 'datetime-local' : 'text'}
                        required={field !== 'subject'}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                      />
                    </div>
                  ))}
                  <div style={{ marginBottom: '14px' }}>
                    <label>
                      <input type="checkbox" name="published" checked={examForm.published} onChange={handleExamChange} style={{ marginRight: '10px' }} />
                      Publish exam
                    </label>
                  </div>
                  <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '8px' }}>
                    {editingExam ? 'Update Exam' : 'Create Exam'}
                  </button>
                </form>
              </div>

              <div style={{ flex: 2, backgroundColor: '#fff', padding: '20px', borderRadius: '14px', boxShadow: '0 4px 18px rgba(15,23,42,0.05)' }}>
                <h3>Exam List</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f5f7fb' }}>
                      {['Title', 'Subject', 'Duration', 'Marks', 'Status', 'Actions'].map(header => (
                        <th key={header} style={{ padding: '12px 10px', textAlign: 'left', color: '#444' }}>{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {exams.map(exam => (
                      <tr key={exam.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '12px 10px' }}>{exam.title}</td>
                        <td style={{ padding: '12px 10px' }}>{exam.subject}</td>
                        <td style={{ padding: '12px 10px' }}>{exam.durationMinutes} min</td>
                        <td style={{ padding: '12px 10px' }}>{exam.totalMarks}</td>
                        <td style={{ padding: '12px 10px' }}>{exam.published ? 'Published' : 'Draft'}</td>
                        <td style={{ padding: '12px 10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button type="button" onClick={() => startEditingExam(exam)} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #007bff', background: 'white', color: '#007bff' }}>
                            Edit
                          </button>
                          <button type="button" onClick={() => handleDeleteExam(exam.id)} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #e74c3c', background: 'white', color: '#e74c3c' }}>
                            Delete
                          </button>
                          <button type="button" onClick={() => handleTogglePublishExam(exam.id, !exam.published)} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #28a745', background: 'white', color: '#28a745' }}>
                            {exam.published ? 'Unpublish' : 'Publish'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {!loading && tab === 'Questions' && (
          <div>
            <h2>Question Management</h2>
            <div style={{ display: 'flex', gap: '24px', marginTop: '20px' }}>
              <div style={{ flex: 1, backgroundColor: '#fff', padding: '20px', borderRadius: '14px', boxShadow: '0 4px 18px rgba(15,23,42,0.05)' }}>
                <h3>{editingQuestion ? 'Edit Question' : 'Add Question'}</h3>
                <form onSubmit={submitQuestion}>
                  {['questionTitle', 'option1', 'option2', 'option3', 'option4', 'correctAnswer'].map(field => (
                    <div key={field} style={{ marginBottom: '14px' }}>
                      <label style={{ display: 'block', marginBottom: '6px' }}>{field === 'questionTitle' ? 'Question' : field.charAt(0).toUpperCase() + field.slice(1)}:</label>
                      <input name={field} value={questionForm[field]} onChange={handleQuestionChange} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                    </div>
                  ))}
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', marginBottom: '6px' }}>Assign to Exam:</label>
                    <select name="examId" value={questionForm.examId} onChange={handleQuestionChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}>
                      <option value="">None</option>
                      {exams.map(exam => (
                        <option key={exam.id} value={exam.id}>{exam.title}</option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '8px' }}>
                    {editingQuestion ? 'Update Question' : 'Add Question'}
                  </button>
                </form>
              </div>

              <div style={{ flex: 2, backgroundColor: '#fff', padding: '20px', borderRadius: '14px', boxShadow: '0 4px 18px rgba(15,23,42,0.05)' }}>
                <h3>Question List</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f5f7fb' }}>
                      {['Question', 'Correct', 'Exam', 'Actions'].map(header => (
                        <th key={header} style={{ padding: '12px 10px', textAlign: 'left', color: '#444' }}>{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {questions.map(question => (
                      <tr key={question.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '12px 10px' }}>{question.questionTitle}</td>
                        <td style={{ padding: '12px 10px' }}>{question.correctAnswer}</td>
                        <td style={{ padding: '12px 10px' }}>{question.exam?.title || '-'}</td>
                        <td style={{ padding: '12px 10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button type="button" onClick={() => startEditingQuestion(question)} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #007bff', background: 'white', color: '#007bff' }}>
                            Edit
                          </button>
                          <button type="button" onClick={() => handleDeleteQuestion(question.id)} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #e74c3c', background: 'white', color: '#e74c3c' }}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {!loading && tab === 'Results' && (
          <div>
            <h2>Result Management</h2>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '18px', alignItems: 'center', flexWrap: 'wrap' }}>
              <input placeholder="Search student or exam" value={resultSearch} onChange={e => setResultSearch(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
              <select value={resultExamId} onChange={e => setResultExamId(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}>
                <option value="">All exams</option>
                {exams.map(exam => (
                  <option key={exam.id} value={exam.id}>{exam.title}</option>
                ))}
              </select>
              <button onClick={reloadResults} style={{ padding: '11px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#007bff', color: '#fff' }}>
                Refresh
              </button>
              <button onClick={exportResultsCsv} style={{ padding: '11px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#28a745', color: '#fff' }}>
                Export CSV
              </button>
            </div>

            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '14px', boxShadow: '0 4px 18px rgba(15,23,42,0.05)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f7fb' }}>
                    {['Student', 'Email', 'Exam', 'Score', 'Total', 'Percentage', 'Completed'].map(header => (
                      <th key={header} style={{ padding: '12px 10px', textAlign: 'left', color: '#444' }}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map(result => (
                    <tr key={`${result.userId}-${result.examId}`} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px 10px' }}>{result.studentName}</td>
                      <td style={{ padding: '12px 10px' }}>{result.studentEmail}</td>
                      <td style={{ padding: '12px 10px' }}>{result.examTitle}</td>
                      <td style={{ padding: '12px 10px' }}>{result.score}</td>
                      <td style={{ padding: '12px 10px' }}>{result.totalQuestions}</td>
                      <td style={{ padding: '12px 10px' }}>{result.percentage.toFixed(2)}%</td>
                      <td style={{ padding: '12px 10px' }}>{result.completedAt ? new Date(result.completedAt).toLocaleString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && tab === 'Profile' && (
          <div style={{ maxWidth: '520px', backgroundColor: '#fff', padding: '24px', borderRadius: '14px', boxShadow: '0 4px 18px rgba(15,23,42,0.05)' }}>
            <h2>Update Profile</h2>
            <form onSubmit={submitProfile}>
              {['name', 'email', 'password', 'newPassword'].map(field => (
                <div key={field} style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px' }}>{field === 'newPassword' ? 'New Password' : field.charAt(0).toUpperCase() + field.slice(1)}:</label>
                  <input name={field} type={field.toLowerCase().includes('password') ? 'password' : 'text'} value={profileForm[field]} onChange={handleProfileChange} placeholder={field === 'password' ? 'Current password' : field === 'newPassword' ? 'New password' : field.charAt(0).toUpperCase() + field.slice(1)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                </div>
              ))}
              <button type="submit" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#007bff', color: '#fff' }}>Update Profile</button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
