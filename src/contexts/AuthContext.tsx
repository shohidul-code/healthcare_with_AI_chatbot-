import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthUser } from '../types/firebase';
import { AuthService } from '../services/auth';

interface AuthContextType {
  currentUser: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthUser>;
  register: (email: string, password: string, displayName: string, role?: 'admin' | 'user') => Promise<{ user: AuthUser; needsVerification: boolean }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const signIn = async (email: string, password: string): Promise<AuthUser> => {
    const user = await AuthService.signIn(email, password);
    return user;
  };

  const register = async (
    email: string, 
    password: string, 
    displayName: string, 
    role: 'admin' | 'user' = 'user'
  ): Promise<{ user: AuthUser; needsVerification: boolean }> => {
    const result = await AuthService.register(email, password, displayName, role);
    return result;
  };

  const signOut = async (): Promise<void> => {
    await AuthService.signOut();
  };

  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    loading,
    signIn,
    register,
    signOut,
    isAdmin: currentUser?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
