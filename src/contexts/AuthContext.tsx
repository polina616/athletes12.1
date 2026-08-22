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

  const fetchCoachProfile = async (userId: string, userEmail?: string, userName?: string) => {
    // Сначала пытаемся найти существующий профиль
    const { data, error } = await supabase
      .from('coaches')
      .select('id, name, email')
      .eq('auth_user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Ошибка загрузки профиля тренера:', error);
    }

    // Если профиль найден — возвращаем
    if (data) {
      return data;
    }

    // Если профиля нет — создаём (fallback для старых регистраций)
    console.log('Профиль тренера не найден, создаём...');
    const { data: newProfile, error: insertError } = await supabase
      .from('coaches')
      .insert({ 
        auth_user_id: userId, 
        name: userName || 'Тренер', 
        email: userEmail || '' 
      })
      .select('id, name, email')
      .single();

    if (insertError) {
      console.error('Не удалось создать профиль тренера:', insertError);
      return null;
    }

    return newProfile;
  };

    useEffect(() => {
    let isMounted = true;

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!isMounted) return;

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const profile = await fetchCoachProfile(
          session.user.id,
          session.user.email ?? undefined,
          session.user.user_metadata?.name as string | undefined
        );
        if (!isMounted) return;
        setCoachProfile(profile);
      } else {
        setCoachProfile(null);
      }

      if (isMounted) setLoading(false);
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const profile = await fetchCoachProfile(
          session.user.id,
          session.user.email ?? undefined,
          session.user.user_metadata?.name as string | undefined
        );
        if (!isMounted) return;
        setCoachProfile(profile);
      } else {
        setCoachProfile(null);
      }
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
      listener?.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, name: string) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    });
    if (authError) throw authError;

    if (authData.user) {
      // Пытаемся создать профиль тренера
      const { error: coachError } = await supabase
        .from('coaches')
        .insert({ auth_user_id: authData.user.id, name, email });
      
      if (coachError) {
        // Если ошибка не "duplicate key", показываем
        if (!coachError.message.includes('duplicate')) {
          console.error('Ошибка создания профиля тренера:', coachError);
        }
      }
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, coachProfile, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};