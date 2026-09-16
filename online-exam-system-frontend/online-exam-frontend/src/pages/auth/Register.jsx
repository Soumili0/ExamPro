import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../utils/api';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', role: 'student'
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); setError('');
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await apiClient.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });
      setMessage('Account created! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const strength = formData.password.length === 0 ? 0
    : formData.password.length < 6 ? 1
    : formData.password.length < 10 ? 2 : 3;
  const strengthLabel = ['', 'Weak', 'Good', 'Strong'];
  const strengthColor = ['', '#ef4444', '#f59e0b', '#10b981'];

  return (
    <div className="auth-wrapper">
      <div className="auth-card fade-in" style={{ maxWidth: '480px' }}>
        <div className="auth-logo">
          <h1>🎓 ExamPro</h1>
          <p>Create your account to get started</p>
        </div>

        <h2 style={{ fontSize: '22px', fontWeight: '700', margin: '0 0 20px', color: '#1e1b4b' }}>
          Create Account
        </h2>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" type="text" name="name" placeholder="John Doe" value={formData.name} onChange={handleChange} required autoFocus />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" name="password" placeholder="Min. 6 characters" value={formData.password} onChange={handleChange} required />
            {formData.password.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${(strength / 3) * 100}%`, height: '100%', background: strengthColor[strength], borderRadius: '2px', transition: 'width 0.3s' }} />
                </div>
                <span style={{ fontSize: '12px', color: strengthColor[strength], fontWeight: '600' }}>{strengthLabel[strength]}</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input className="form-input" type="password" name="confirmPassword" placeholder="Repeat your password" value={formData.confirmPassword} onChange={handleChange} required />
            {formData.confirmPassword && (
              <span style={{ fontSize: '12px', fontWeight: '600', color: formData.password === formData.confirmPassword ? '#10b981' : '#ef4444' }}>
                {formData.password === formData.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
              </span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Role</label>
            <select className="form-select" name="role" value={formData.role} onChange={handleChange}>
              <option value="student">🎓 Student</option>
              <option value="teacher">👩‍🏫 Teacher</option>
              <option value="admin">⚙️ Admin</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '13px', fontSize: '16px', marginTop: '6px' }}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-divider">─── or ───</div>

        <p style={{ textAlign: 'center', fontSize: '14px', color: '#64748b', margin: 0 }}>
          Already have an account?{' '}
          <span className="auth-link" onClick={() => navigate('/login')}>
            Sign in here
          </span>
        </p>
      </div>
    </div>
  );
}
