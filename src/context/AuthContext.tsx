import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    // 1. Obtener sesión activa al cargar
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    // 2. Escuchar cambios de autenticación en tiempo real
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const openAuthModal = useCallback((mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  }, []);
  const closeAuthModal = useCallback(() => setIsAuthModalOpen(false), []);

  const signInWithEmail = async (email: string, password: string): Promise<{ error: string | null }> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          return { error: 'Correo o contraseña incorrectos' };
        }
        return { error: error.message };
      }

      setIsAuthModalOpen(false);
      return { error: null };
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'Error inesperado al iniciar sesión' };
    }
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
    fullName: string
  ): Promise<{ error: string | null }> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            name: fullName.trim(),
          },
        },
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          return { error: 'Este correo electrónico ya está registrado' };
        }
        if (error.message.includes('Password should be at least')) {
          return { error: 'La contraseña debe tener al menos 6 caracteres' };
        }
        return { error: error.message };
      }

      // Si el email no requiere confirmación, data.session existirá de inmediato
      if (data.session) {
        setIsAuthModalOpen(false);
      }
      return { error: null };
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'Error inesperado al registrarse' };
    }
  };

  const signOut = async () => {
    try {
      localStorage.removeItem('energyloop_guest');
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        signInWithEmail,
        signUpWithEmail,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
