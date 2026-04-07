// contexts/AuthContext.tsx
import React, { createContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);


  
  // Функция загрузки (и создания при необходимости) профиля
const fetchProfile = async (userId: string) => {

  
  // Функция для получения токена из localStorage (с повторными попытками)
  const getToken = (): string | null => {
    // Ищем ключ, содержащий 'supabase.auth.token'
    const storageKey = Object.keys(localStorage).find(key => 
      key.includes('supabase.auth.token') || key.includes('-auth-token')
    );
    if (!storageKey) return null;
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed?.currentSession?.access_token || null;
    } catch (e) {
      return null;
    }
  };

  // Пытаемся получить токен до 10 раз с интервалом 200 мс
  let token = null;
  for (let i = 0; i < 10; i++) {
    token = getToken();
    if (token) break;
    await new Promise(r => setTimeout(r, 200));
  }

  if (!token) {

    setProfile(null);
    setLoading(false);
    return;
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  try {
    // Получаем профиль
    const getRes = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`, {
      headers: { 'apikey': anonKey, 'Authorization': `Bearer ${token}` }
    });
    if (!getRes.ok) throw new Error(`HTTP ${getRes.status}`);
    const data = await getRes.json();

    if (data && data.length > 0) {
      setProfile(data[0]);
    } else {
      // Создаём профиль
      const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
        headers: { 'apikey': anonKey, 'Authorization': `Bearer ${token}` }
      });
      if (!userRes.ok) throw new Error('Failed to get user data');
      const userData = await userRes.json();
      const username = userData.user_metadata?.username || userData.email?.split('@')[0] || 'user';

      const postRes = await fetch(`${supabaseUrl}/rest/v1/profiles`, {
        method: 'POST',
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          id: userId,
          username,
          avatar_url: null,
          created_at: new Date().toISOString()
        })
      });
      if (!postRes.ok) throw new Error(`Insert failed: ${postRes.status}`);
      const newProfile = await postRes.json();
      setProfile(newProfile[0]);
    }
  } catch (err) {
    console.error('🔴 Ошибка в fetchProfile:', err);
    setProfile(null);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  let isMounted = true;

  
  supabase.auth.getSession()
    .then(({ data: { session } }) => {


      if (!isMounted) return;
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);

      } else {

        setLoading(false);
      }
    })
    .catch((error) => {
      console.error('🔴 getSession error:', error);
      if (isMounted) setLoading(false);
    });

  const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {


    if (!isMounted) return;
    setUser(session?.user ?? null);
    if (session?.user) {
      try {
        await fetchProfile(session.user.id);

      } catch (err) {
        console.error('🔴 onAuthStateChange error:', err);
        if (isMounted) setLoading(false);
      }
    } else {
      setProfile(null);
      setLoading(false);
    }
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

  const signUp = async (email: string, password: string, username: string) => {
    // 1. Регистрируем пользователя
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } }
    });
    if (error) throw error;

    // 2. Если пользователь создан, добавляем запись в profiles
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          username: username,
          avatar_url: null,
          created_at: new Date().toISOString()
        });
      if (profileError) throw profileError;
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

