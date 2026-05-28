import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../utils/api';

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [publishedExams, setPublishedExams] = useState([]);
  const [examHistory, setExamHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!user?.userId) {
        setLoading(false);
        return;
      }

      try {
        const [profileRes, examsRes, historyRes] = await Promise.all([
          apiClient.get(`/user/profile?userId=${user.userId}`),
          apiClient.get('/user/exams'),
          apiClient.get(`/user/results/${user.userId}`),
        ]);

        setProfile(profileRes.data);
        setPublishedExams(examsRes.data || []);
        setExamHistory(historyRes.data || []);
      } catch (err) {
        setError('Failed to load dashboard data. Please refresh.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [user]);

  const handleStartQuiz = (examId) => {
    navigate(`/quiz/${examId}/instructions`);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const now = new Date();
  const upcomingExams = publishedExams.filter((exam) => exam.startTime && new Date(exam.startTime) > now);
  const activeExams = publishedExams.filter((exam) => {
    if (!exam.startTime) return true;
    const start = new Date(exam.startTime);
    const end = exam.endTime ? new Date(exam.endTime) : null;
    return start <= now && (!end || end > now);
  });

  const totalExams = publishedExams.length;
  const completedExams = examHistory.length;
  const totalScore = examHistory.reduce((sum, item) => sum + (item.score || 0), 0);
  const averageScore = completedExams ? (totalScore / completedExams).toFixed(2) : '0.00';
  const latestResult = examHistory.slice().sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))[0];

  return (
    <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1>Welcome back, {profile?.name || user?.email || 'Student'}!</h1>
          <p style={{ color: '#555' }}>
            Use the dashboard to launch exams, review recent results, and manage your student profile.
          </p>
        </div>
        <button
          onClick={handleLogout}
          style={{ padding: '10px 18px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          Logout
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <h3>Active Exams</h3>
          <p style={{ fontSize: '32px', margin: '12px 0 4px' }}>{activeExams.length}</p>
          <p style={{ color: '#666' }}>Exams currently available to start</p>
        </div>
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <h3>Completed Attempts</h3>
          <p style={{ fontSize: '32px', margin: '12px 0 4px' }}>{completedExams}</p>
          <p style={{ color: '#666' }}>Recorded exams you have completed</p>
        </div>
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <h3>Average Score</h3>
          <p style={{ fontSize: '32px', margin: '12px 0 4px' }}>{averageScore}%</p>
          <p style={{ color: '#666' }}>Across your completed exam sessions</p>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '40px 0', textAlign: 'center' }}>Loading dashboard...</div>
      ) : (
        <> 
          {error && <div style={{ marginBottom: '20px', color: 'red' }}>{error}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
            <section style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h2 style={{ margin: 0 }}>Upcoming exams</h2>
                  <p style={{ color: '#777' }}>{upcomingExams.length} upcoming exam(s)</p>
                </div>
                <span style={{ backgroundColor: '#eaf5ff', color: '#0077cc', padding: '8px 12px', borderRadius: '999px', fontSize: '14px' }}>
                  {publishedExams.length} total
                </span>
              </div>
              {upcomingExams.length === 0 ? (
                <p style={{ color: '#555' }}>No upcoming exams at the moment.</p>
              ) : (
                upcomingExams.slice(0, 3).map((exam) => (
                  <div key={exam.id} style={{ borderTop: '1px solid #eee', padding: '16px 0' }}>
                    <h3 style={{ margin: '0 0 8px' }}>{exam.title}</h3>
                    <p style={{ margin: 0, color: '#555' }}>{exam.subject || 'General'} • {exam.totalMarks ?? 'TBD'} marks</p>
                    <p style={{ margin: '8px 0 0', color: '#888' }}>{exam.startTime ? new Date(exam.startTime).toLocaleString() : 'Start time not set'}</p>
                  </div>
                ))
              )}
            </section>

            <aside style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
              <h2 style={{ marginTop: 0 }}>Notifications</h2>
              <ul style={{ paddingLeft: '20px', color: '#555' }}>
                <li>Welcome back! Your last result was {latestResult ? `${latestResult.score}/${latestResult.totalQuestions}` : 'not available'}.</li>
                <li>{activeExams.length ? `${activeExams.length} exam(s) ready to start today.` : 'No exams are currently active.'}</li>
                <li>Update your profile any time from the profile page.</li>
              </ul>
            </aside>
          </div>

          <section style={{ marginTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2>Available exams</h2>
              <span style={{ color: '#777' }}>{totalExams} exam(s)</span>
            </div>

            {publishedExams.length === 0 ? (
              <div style={{ padding: '24px', backgroundColor: '#fafafa', borderRadius: '12px', color: '#555' }}>
                No active exams are available. Please check back later.
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {publishedExams.map((exam) => (
                  <div key={exam.id} style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                      <div>
                        <h3 style={{ margin: '0 0 8px' }}>{exam.title}</h3>
                        <p style={{ margin: 0, color: '#555' }}>{exam.subject || 'General'} • {exam.durationMinutes ?? 'N/A'} min</p>
                        <p style={{ margin: '8px 0 0', color: '#888' }}>{exam.totalMarks ? `${exam.totalMarks} marks` : 'Marks not set'}</p>
                      </div>
                      <button
                        onClick={() => handleStartQuiz(exam.id)}
                        style={{ padding: '10px 18px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                      >
                        Start
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
