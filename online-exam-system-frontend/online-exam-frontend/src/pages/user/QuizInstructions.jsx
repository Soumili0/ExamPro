import { useNavigate, useParams } from 'react-router-dom';

export default function QuizInstructions() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const handleStart = () => {
    navigate(`/quiz/${quizId}/start`);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
      <h1>Quiz Instructions</h1>
      <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
        <h3>Please read carefully:</h3>
        <ul style={{ lineHeight: '1.8' }}>
          <li>You have <strong>60 minutes</strong> to complete the exam</li>
          <li>There are <strong>multiple choice questions</strong> (MCQs)</li>
          <li>Each question has <strong>4 options</strong> - select the correct one</li>
          <li>You can review and change your answers before submission</li>
          <li>The exam will <strong>auto-submit</strong> when time runs out</li>
          <li>Closing the browser will <strong>NOT save</strong> your progress</li>
          <li>Do NOT refresh the page during the exam</li>
          <li>1 mark for each correct answer, 0 for incorrect</li>
        </ul>
      </div>
      <div style={{ backgroundColor: '#fff3cd', padding: '10px', borderRadius: '5px', marginBottom: '20px', color: '#856404' }}>
        <strong>⚠️ Warning:</strong> Once you start the exam, make sure your internet connection is stable.
      </div>
      <button
        onClick={handleStart}
        style={{ width: '100%', padding: '12px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}
      >
        Start Exam
      </button>
      <button
        onClick={() => navigate('/user/dashboard')}
        style={{ width: '100%', padding: '12px', marginTop: '10px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}
      >
        Go Back
      </button>
    </div>
  );
}
