
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../utils/api';

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({ name: '', email: '', password: '', newPassword: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.userId) return;
      try {
        const response = await apiClient.get(`/user/profile?userId=${user.userId}`);
        setProfile((prev) => ({
          ...prev,
          name: response.data.name || '',
          email: response.data.email || '',
        }));
      } catch (err) {
        setError('Unable to load profile information.');
      }
    };
    loadProfile();
  }, [user]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await apiClient.put(`/user/profile?userId=${user?.userId}`, profile);
      setMessage('Profile updated successfully!');
    } catch (err) {
      setError('Update failed!');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
      <h2>Update Profile</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Name:</label>
          <input name="name" placeholder="Name" value={profile.name} onChange={handleChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Email:</label>
          <input name="email" placeholder="Email" value={profile.email} onChange={handleChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Current Password:</label>
          <input name="password" type="password" placeholder="Current Password" value={profile.password} onChange={handleChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>New Password:</label>
          <input name="newPassword" type="password" placeholder="New Password" value={profile.newPassword} onChange={handleChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Update</button>
        {message && <div style={{color: 'green', marginTop: '10px'}}>{message}</div>}
        {error && <div style={{color: 'red', marginTop: '10px'}}>{error}</div>}
      </form>
    </div>
  );
}
