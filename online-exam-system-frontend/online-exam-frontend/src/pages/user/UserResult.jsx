import { useLocation, useNavigate } from 'react-router-dom';

export default function UserResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const { score = 0, totalQuestions = 0 } = location.state || {};
  const percentage = totalQuestions > 0 ? ((score / totalQuestions) * 100).toFixed(2) : 0;

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px', border: '2px solid #4CAF50', borderRadius: '5px', textAlign: 'center' }}>
      <h1>Exam Results</h1>
      <div style={{ backgroundColor: '#f0f0f0', padding: '30px', borderRadius: '5px', marginBottom: '20px' }}>
        <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#4CAF50', marginBottom: '10px' }}>
          {score}/{totalQuestions}
        </div>
        <div style={{ fontSize: '24px', marginBottom: '10px' }}>
          Percentage: <strong>{percentage}%</strong>
        </div>
        <div style={{ fontSize: '18px', color: '#666' }}>
          {percentage >= 60 ? (
            <span style={{ color: 'green' }}>✓ Passed</span>
          ) : (
            <span style={{ color: 'red' }}>✗ Failed</span>
          )}
        </div>
      </div>

      <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '5px', marginBottom: '20px', textAlign: 'left' }}>
        <h3>Summary:</h3>
        <p><strong>Total Questions:</strong> {totalQuestions}</p>
        <p><strong>Correct Answers:</strong> {score}</p>
        <p><strong>Incorrect Answers:</strong> {totalQuestions - score}</p>
        <p><strong>Passing Score:</strong> 60%</p>
      </div>

      <button
        onClick={() => navigate('/user/dashboard')}
        style={{ width: '100%', padding: '12px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}
      >
        Back to Dashboard
      </button>
    </div>
  );
}
