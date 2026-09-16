import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import apiClient from '../../utils/api';

export default function QuizInstructions() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    apiClient.get(`/user/exams`).then(res => {
      const found = res.data.find(e => String(e.id) === String(quizId));
      if (found) setExam(found);
    }).catch(() => {});
  }, [quizId]);

  const rules = [
    { icon: '⏱️', text: `You have ${exam?.durationMinutes ?? 60} minutes to complete the exam.` },
    { icon: '✅', text: 'Each question has 4 options — choose the best answer.' },
    { icon: '🔄', text: 'You can review and change your answers before submitting.' },
    { icon: '⚡', text: 'The exam auto-submits when the timer reaches zero.' },
    { icon: '🌐', text: 'Ensure a stable internet connection throughout the exam.' },
    { icon: '🚫', text: 'Do NOT refresh or close the browser during the exam.' },
    { icon: '🏆', text: `Marks: ${exam?.totalMarks ?? 'N/A'} total. 1 mark per correct answer, 0 for incorrect.` },
    { icon: '📊', text: 'Your score and result will be shown immediately after submission.' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '640px' }} className="fade-in">

        {/* Header card */}
        <div style={{ background: 'linear-gradient(135deg,#1e1b4b,#4c1d95)', borderRadius: '20px', padding: '32px', color: '#fff', marginBottom: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
          <h1 style={{ margin: '0 0 8px', fontSize: '26px', fontWeight: '800' }}>
            {exam?.title || `Exam #${quizId}`}
          </h1>
          <p style={{ margin: 0, color: '#c4b5fd', fontSize: '15px' }}>
            {exam?.subject && <span>{exam.subject} · </span>}
            {exam?.durationMinutes} min · {exam?.totalMarks} marks
          </p>
        </div>

        {/* Instructions */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <h2 style={{ margin: '0 0 20px', fontSize: '18px', color: '#1e1b4b', fontWeight: '700' }}>
            📌 Read Before You Begin
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {rules.map((rule, i) => (
              <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', padding: '12px 14px', background: '#f8fafc', borderRadius: '10px' }}>
                <span style={{ fontSize: '20px', flexShrink: 0 }}>{rule.icon}</span>
                <span style={{ fontSize: '14px', color: '#334155', lineHeight: '1.6' }}>{rule.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Warning */}
        <div className="alert alert-warning" style={{ marginBottom: '20px' }}>
          ⚠️ <strong>Warning:</strong> Closing the browser will <strong>NOT save</strong> your progress. All unanswered questions will be counted as incorrect.
        </div>

        {/* Consent checkbox */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(15,23,42,0.06)', userSelect: 'none' }}>
          <input
            type="checkbox"
            checked={checked}
            onChange={e => setChecked(e.target.checked)}
            style={{ width: '18px', height: '18px', accentColor: '#4f46e5', flexShrink: 0 }}
          />
          <span style={{ fontSize: '14px', color: '#334155' }}>
            I have read and understood all the instructions above and I am ready to begin.
          </span>
        </label>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            className="btn btn-ghost"
            style={{ flex: 1, padding: '13px' }}
            onClick={() => navigate('/user/dashboard')}
          >
            ← Go Back
          </button>
          <button
            className="btn btn-success"
            style={{ flex: 2, padding: '13px', fontSize: '16px', opacity: checked ? 1 : 0.5 }}
            disabled={!checked}
            onClick={() => navigate(`/quiz/${quizId}/start`)}
          >
            🚀 Start Exam
          </button>
        </div>
      </div>
    </div>
  );
}
