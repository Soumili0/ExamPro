import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const token = localStorage.getItem('token');
		const userData = localStorage.getItem('user');
		if (token && userData) {
			setUser(JSON.parse(userData));
		}
	}, []);

	const login = async (email, password) => {
		setLoading(true);
		try {
			const { login } = await import('../services/authService');
			const userData = await login(email, password);
			if (userData.token) {
				setUser(userData);
			}
			setLoading(false);
			return userData;
		} catch (err) {
			setLoading(false);
			throw err;
		}
	};

	const logout = async () => {
		const { logout } = await import('../services/authService');
		await logout();
		setUser(null);
		localStorage.removeItem('token');
		localStorage.removeItem('user');
	};

	return (
		<AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	return useContext(AuthContext);
}
