import React, { createContext, useContext, useState, useEffect } from 'react';
import { dbService, Profile } from '../services/db';

interface AuthContextType {
  user: Profile | null;
  loading: boolean;
  login: (id: string) => Promise<void>;
  register: (name: string, phone: string, role: 'company' | 'freelancer', bio: string, skills: string[], city: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<Omit<Profile, 'id' | 'role' | 'rating_avg' | 'created_at'>>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check for stored session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const storedUserId = localStorage.getItem('trampolocal_session_user_id');
        if (storedUserId) {
          const profile = await dbService.getProfile(storedUserId);
          if (profile) {
            setUser(profile);
          } else {
            localStorage.removeItem('trampolocal_session_user_id');
          }
        }
      } catch (err) {
        console.error('Error restoring session:', err);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (id: string) => {
    setLoading(true);
    try {
      const profile = await dbService.getProfile(id);
      if (profile) {
        setUser(profile);
        localStorage.setItem('trampolocal_session_user_id', id);
      } else {
        throw new Error('Usuário não encontrado!');
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    name: string,
    phone: string,
    role: 'company' | 'freelancer',
    bio: string,
    skills: string[],
    city: string
  ) => {
    setLoading(true);
    try {
      const formattedPhone = phone.replace(/\D/g, ''); // numbers only
      const id = role.substring(0, 1) + '-' + Math.random().toString(36).substr(2, 9);
      const newProfile: Profile = {
        id,
        role,
        name,
        phone: formattedPhone,
        bio,
        skills,
        rating_avg: 5.0,
        city,
        created_at: new Date().toISOString()
      };
      
      const saved = await dbService.saveProfile(newProfile);
      setUser(saved);
      localStorage.setItem('trampolocal_session_user_id', saved.id);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('trampolocal_session_user_id');
  };

  const updateProfile = async (updates: Partial<Omit<Profile, 'id' | 'role' | 'rating_avg' | 'created_at'>>) => {
    if (!user) return;
    setLoading(true);
    try {
      const updatedProfile = {
        ...user,
        ...updates
      };
      const saved = await dbService.saveProfile(updatedProfile);
      setUser(saved);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
