import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../utils/api';

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function StartQuiz() {
  const { quizId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(60 * 60); // 60 min default

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await apiClient.get(`/questions/exam/${quizId}`);
        setQuestions(res.data.map(q => ({ ...q, selectedAnswer: null })));
      } catch {
        setError('Failed to load questions. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [quizId]);

  const handleSubmit = useCallback(async () => {
    if (submitted || submitting) return;
    setSubmitting(true);
    try {
      const answers = questions.map(q => ({
        userId: user?.userId,
        examId: Number(quizId),
        questionId: q.id,
        selectedAnswer: q.selectedAnswer,
      }));
      for (const answer of answers) {
        if (answer.selectedAnswer) {
          await apiClient.post('/exam/submit', answer);
        }
      }
      const scoreRes = await apiClient.get(`/exam/score/${user?.userId}`);
      setSubmitted(true);
      navigate('/user/result', {
        state: {
          score: scoreRes.data,
          totalQuestions: questions.length,
          examId: quizId,
          questions: questions,
        }
      });
    } catch {
      setError('Submission failed. Please try again.');
      setSubmitting(false);
    }
  }, [questions, quizId, user, submitted, submitting, navigate]);

  // Timer
  useEffect(() => {
    if (loading || submitted) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(interval); handleSubmit(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [loading, submitted, handleSubmit]);

  const handleOptionChange = (qId, option) => {
    setQuestions(qs => qs.map(q => q.id === qId ? { ...q, selectedAnswer: option } : q));
  };

  const answeredCount = questions.filter(q => q.selectedAnswer).length;
  const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;
  const timerColor = timeLeft < 120 ? '#ef4444' : timeLeft < 300 ? '#f59e0b' : '#10b981';
  const q = questions[current];

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="spinner" />
      <p style={{ marginTop: '16px', color: '#64748b' }}>Loading questions...</p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      {/* Sticky header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: '#fff', boxShadow: '0 2px 12px rgba(15,23,42,0.08)', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontWeight: '700', fontSize: '16px', color: '#1e1b4b' }}>Quiz #{quizId}</div>
          <div style={{ fontSize: '13px', color: '#64748b' }}>{answeredCount}/{questions.length} answered</div>
        </div>

        {/* Progress bar */}
        <div style={{ flex: 1, maxWidth: '360px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>
            <span>Progress</span><span>{Math.round(progress)}%</span>
          </div>
          <div className="progress-bar-wrap">
            <div className="progress-bar" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Timer */}
        <div style={{ background: timeLeft < 300 ? '#fef2f2' : '#f0fdf4', borderRadius: '12px', padding: '10px 18px', textAlign: 'center', border: `2px solid ${timerColor}` }}>
          <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: timerColor, letterSpacing: '0.5px' }}>Time Left</div>
          <div style={{ fontSize: '22px', fontWeight: '800', color: timerColor, fontVariantNumeric: 'tabular-nums' }}>
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '28px 24px', display: 'grid', gridTemplateColumns: '1fr 220px', gap: '24px', alignItems: 'start' }}>

        {/* Question panel */}
        <div>
          {error && <div className="alert alert-error">{error}</div>}

          {q && (
            <div className="question-card fade-in" key={current}>
              <div className="question-number">Question {current + 1} of {questions.length}</div>
              <h3 style={{ margin: '0 0 24px', fontSize: '18px', color: '#1e1b4b', lineHeight: '1.6' }}>
                {q.questionTitle}
              </h3>
              {[q.option1, q.option2, q.option3, q.option4].filter(Boolean).map((opt, i) => (
                <label
                  key={i}
                  className={`option-label${q.selectedAnswer === opt ? ' selected' : ''}`}
                  style={{ cursor: submitted ? 'default' : 'pointer' }}
                >
                  <input
                    type="radio"
                    name={`q${q.id}`}
                    value={opt}
                    checked={q.selectedAnswer === opt}
                    onChange={() => !submitted && handleOptionChange(q.id, opt)}
                    disabled={submitted}
                  />
                  <span style={{ fontWeight: q.selectedAnswer === opt ? '600' : '400' }}>{opt}</span>
                </label>
              ))}
            </div>
          )}

          {/* Prev / Next / Submit */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button
              className="btn btn-ghost"
              style={{ flex: 1 }}
              onClick={() => setCurrent(c => Math.max(0, c - 1))}
              disabled={current === 0}
            >
              ← Previous
            </button>
            {current < questions.length - 1 ? (
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={() => setCurrent(c => Math.min(questions.length - 1, c + 1))}
              >
                Next →
              </button>
            ) : (
              <button
                className="btn btn-success"
                style={{ flex: 1 }}
                onClick={handleSubmit}
                disabled={submitting || submitted}
              >
                {submitting ? 'Submitting...' : '✅ Submit Quiz'}
              </button>
            )}
          </div>
        </div>

        {/* Question navigator */}
        <div className="card" style={{ position: 'sticky', top: '120px' }}>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px' }}>
            Question Navigator
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '16px' }}>
            {questions.map((q2, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                style={{
                  width: '36px', height: '36px', borderRadius: '8px', border: 'none',
                  fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                  background: i === current ? '#4f46e5' : q2.selectedAnswer ? '#10b981' : '#f1f5f9',
                  color: i === current || q2.selectedAnswer ? '#fff' : '#64748b',
                  transition: 'all 0.15s',
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '14px', height: '14px', borderRadius: '4px', background: '#4f46e5' }} /><span>Current</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '14px', height: '14px', borderRadius: '4px', background: '#10b981' }} /><span>Answered</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '14px', height: '14px', borderRadius: '4px', background: '#f1f5f9' }} /><span>Unanswered</span>
            </div>
          </div>

          <button
            className="btn btn-success"
            style={{ width: '100%', marginTop: '16px' }}
            onClick={handleSubmit}
            disabled={submitting || submitted}
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
}
