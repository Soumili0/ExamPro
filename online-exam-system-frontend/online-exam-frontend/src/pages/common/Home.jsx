import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div style={{ textAlign: 'center', padding: '50px 20px', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <h1 style={{ fontSize: '48px', color: '#333', marginBottom: '20px' }}>Online Examination System</h1>
      <p style={{ fontSize: '20px', color: '#666', marginBottom: '40px' }}>
        Take exams online with automated scoring and instant results
      </p>

      {user ? (
        <div>
          <p style={{ fontSize: '18px', marginBottom: '20px' }}>Welcome back, <strong>{user.email}</strong>!</p>
          <button
            onClick={() => navigate('/user/dashboard')}
            style={{
              padding: '12px 30px',
              fontSize: '16px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => navigate('/user/profile')}
            style={{
              padding: '12px 30px',
              fontSize: '16px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            View Profile
          </button>
        </div>
      ) : (
        <div>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '12px 30px',
              fontSize: '16px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            Login
          </button>
          <button
            onClick={() => navigate('/register')}
            style={{
              padding: '12px 30px',
              fontSize: '16px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Register
          </button>
        </div>
      )}

      <div style={{ marginTop: '60px', textAlign: 'left', maxWidth: '600px', margin: '60px auto' }}>
        <h2>Features:</h2>
        <ul style={{ fontSize: '16px', lineHeight: '1.8', textAlign: 'left' }}>
          <li>✓ User Registration & Login</li>
          <li>✓ Update Profile & Password</li>
          <li>✓ Multiple Choice Questions (MCQs)</li>
          <li>✓ Timer with Auto-Submit</li>
          <li>✓ Instant Scoring & Results</li>
          <li>✓ Session Management & Logout</li>
        </ul>
      </div>
    </div>
  );
}
