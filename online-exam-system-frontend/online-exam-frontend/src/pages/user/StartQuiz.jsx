
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Timer from '../../components/Timer';
import apiClient from '../../utils/api';

export default function StartQuiz() {
  const { quizId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await apiClient.get(`/questions/exam/${quizId}`);
        setQuestions(response.data.map(q => ({ ...q, selectedAnswer: null })));
      } catch (err) {
        setError('Failed to fetch questions');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [quizId]);

  const handleOptionChange = (qid, option) => {
    setQuestions(questions.map(q => q.id === qid ? { ...q, selectedAnswer: option } : q));
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    setMessage('');
    setError('');
    try {
      const answers = questions.map(q => ({
        userId: user?.userId,
        examId: Number(quizId),
        questionId: q.id,
        selectedAnswer: q.selectedAnswer
      }));

      for (const answer of answers) {
        if (answer.selectedAnswer) {
          await apiClient.post('/exam/submit', answer);
        }
      }

      const score = await apiClient.get(`/exam/score/${user?.userId}`);
      navigate('/user/result', { state: { score: score.data, totalQuestions: questions.length } });
    } catch (err) {
      setError('Submission failed!');
      setSubmitted(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '20px' }}>Loading questions...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Quiz {quizId}</h2>
        <Timer duration={3600} onTimeUp={handleSubmit} />
      </div>

      {questions.length === 0 ? (
        <p>No questions available</p>
      ) : (
        <div>
          {questions.map((q, idx) => (
            <div key={q.id} style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '15px', borderRadius: '5px' }}>
              <h4>Question {idx + 1}: {q.questionTitle}</h4>
              <div style={{ marginLeft: '20px' }}>
                {[q.option1, q.option2, q.option3, q.option4].map((option, optIdx) => (
                  <label key={optIdx} style={{ display: 'block', marginBottom: '10px' }}>
                    <input
                      type="radio"
                      name={`q${q.id}`}
                      value={option}
                      checked={q.selectedAnswer === option}
                      onChange={() => handleOptionChange(q.id, option)}
                      disabled={submitted}
                      style={{ marginRight: '10px' }}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>
          ))}
          <button
            onClick={handleSubmit}
            disabled={submitted}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: submitted ? '#cccccc' : '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: submitted ? 'not-allowed' : 'pointer',
              fontSize: '16px'
            }}
          >
            {submitted ? 'Submitted' : 'Submit Quiz'}
          </button>
          {message && <div style={{ color: 'green', marginTop: '10px' }}>{message}</div>}
          {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
        </div>
      )}
    </div>
  );
}
