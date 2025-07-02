import { useState, useCallback } from 'react';

interface DummyUser {
  username: string;
  isAdmin: boolean;
  loginTime: Date;
}

interface DummyAuthState {
  user: DummyUser | null;
  isAuthenticated: boolean;
  login: (credentials: { username: string; password: string; isAdmin: boolean }) => boolean;
  logout: () => void;
}

/**
 * Dummy authentication hook for testing purposes
 * This can be commented out or removed in production
 */
export const useDummyAuth = (): DummyAuthState => {
  const [user, setUser] = useState<DummyUser | null>(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('dummyUser');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        return {
          ...parsed,
          loginTime: new Date(parsed.loginTime),
        };
      } catch {
        localStorage.removeItem('dummyUser');
      }
    }
    return null;
  });

  const login = useCallback((credentials: { username: string; password: string; isAdmin: boolean }) => {
    // Dummy validation - in real app this would be proper authentication
    const validCredentials = [
      { username: 'testuser', password: 'password123', isAdmin: false },
      { username: 'admin', password: 'admin123', isAdmin: true },
      { username: 'demo', password: 'demo', isAdmin: false },
    ];

    const isValid = validCredentials.some(
      cred => 
        cred.username === credentials.username && 
        cred.password === credentials.password
    );

    if (isValid) {
      const newUser: DummyUser = {
        username: credentials.username,
        isAdmin: credentials.isAdmin,
        loginTime: new Date(),
      };

      setUser(newUser);
      localStorage.setItem('dummyUser', JSON.stringify(newUser));
      return true;
    }

    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('dummyUser');
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    login,
    logout,
  };
};