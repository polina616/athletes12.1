import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  coachProfile: { id: string; name: string; email: string } | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [coachProfile, setCoachProfile] = useState<AuthContextType['coachProfile']>(null);
  const [loading, setLoading] = useState(true);

  const fetchCoachProfile = async (
    userId: string,
    fallbackName?: string,
    fallbackEmail?: string
  ) => {
    const { data, error } = await supabase
      .from('coaches')
      .select('id, name, email')
      .eq('auth_user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Ошибка загрузки профиля тренера:', error);
      return null;
    }

    if (data) return data;

    // Профиля ещё нет (например, пользователь был создан не через signUp) —
    // создаём запись, чтобы не застревать на экране входа.
    const { data: created, error: insertError } = await supabase
      .from('coaches')
      .insert({
        auth_user_id: userId,
        name: fallbackName ?? 'Тренер',
        email: fallbackEmail ?? '',
      })
      .select('id, name, email')
      .single();

    if (insertError) {
      console.error('Не удалось создать профиль тренера:', insertError);
      return null;
    }

    return created;
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchCoachProfile(
          session.user.id,
          session.user.user_metadata?.name,
          session.user.email
        ).then(profile => setCoachProfile(profile));
      }
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchCoachProfile(
          session.user.id,
          session.user.user_metadata?.name,
          session.user.email
        ).then(profile => setCoachProfile(profile));
      } else {
        setCoachProfile(null);
      }
      setLoading(false);
    });

    return () => listener?.subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, name: string) => {
    // Создаём пользователя в auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    });
    if (authError) throw authError;
    // Создаём запись в coaches
    if (authData.user) {
      const { error: coachError } = await supabase
        .from('coaches')
        .insert({ auth_user_id: authData.user.id, name, email });
      if (coachError) throw coachError;
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    session,
    user,
    coachProfile,
    loading,
    signIn,
    signUp,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};