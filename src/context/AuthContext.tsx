import React, { createContext, useContext, useState, useEffect } from 'react';
import { dbService, Profile, isRealSupabase, supabase } from '../services/db';

interface AuthContextType {
  user: Profile | null;
  loading: boolean;
  login: (idOrEmail: string, password?: string) => Promise<void>;
  register: (
    name: string,
    phone: string,
    role: 'company' | 'freelancer',
    bio: string,
    skills: string[],
    city: string,
    email?: string,
    password?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
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
        if (isRealSupabase && supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const profile = await dbService.getProfile(session.user.id);
            if (profile) {
              setUser(profile);
            }
          }
        } else {
          const storedUserId = localStorage.getItem('trampolocal_session_user_id');
          if (storedUserId) {
            const profile = await dbService.getProfile(storedUserId);
            if (profile) {
              setUser(profile);
            } else {
              localStorage.removeItem('trampolocal_session_user_id');
            }
          }
        }
      } catch (err) {
        console.error('Error restoring session:', err);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    if (isRealSupabase && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const profile = await dbService.getProfile(session.user.id);
          setUser(profile);
        } else {
          setUser(null);
        }
        setLoading(false);
      });
      return () => subscription.unsubscribe();
    }
  }, []);

  const login = async (idOrEmail: string, password?: string) => {
    setLoading(true);
    try {
      if (isRealSupabase && supabase && password) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: idOrEmail,
          password
        });
        if (error) throw error;
        if (data.user) {
          const profile = await dbService.getProfile(data.user.id);
          if (profile) {
            setUser(profile);
          } else {
            throw new Error('Perfil correspondente não encontrado no banco!');
          }
        }
      } else {
        const profile = await dbService.getProfile(idOrEmail);
        if (profile) {
          setUser(profile);
          localStorage.setItem('trampolocal_session_user_id', idOrEmail);
        } else {
          throw new Error('Usuário não encontrado!');
        }
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
    city: string,
    email?: string,
    password?: string
  ) => {
    setLoading(true);
    try {
      const formattedPhone = phone.replace(/\D/g, ''); // numbers only
      
      if (isRealSupabase && supabase && email && password) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              phone: formattedPhone,
              role,
              city,
              bio
            }
          }
        });
        if (error) throw error;
        if (data.user) {
          // Wait a brief moment for the database trigger to finish inserting the profile
          await new Promise(resolve => setTimeout(resolve, 800));
          const profile = await dbService.getProfile(data.user.id);
          if (profile) {
            setUser(profile);
          } else {
            // Fallback: manually create profile if trigger is slow or not active
            const fallbackProfile: Profile = {
              id: data.user.id,
              role,
              name,
              phone: formattedPhone,
              bio,
              skills,
              rating_avg: 5.0,
              city,
              created_at: new Date().toISOString()
            };
            const saved = await dbService.saveProfile(fallbackProfile);
            setUser(saved);
          }
        }
      } else {
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
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (isRealSupabase && supabase) {
        await supabase.auth.signOut();
      }
      setUser(null);
      localStorage.removeItem('trampolocal_session_user_id');
    } finally {
      setLoading(false);
    }
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
