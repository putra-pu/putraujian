import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured, type Profile } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  isConfigured: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const isConfigured = isSupabaseConfigured();

  const refreshProfile = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        setProfile(data);
      }
    } catch (err) {
      console.error('Error refreshing profile:', err);
    }
  };

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    const initAuth = async () => {
      if (!isConfigured) {
        setLoading(false);
        return;
      }

      try {
        // Check initial session
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        
        if (currentUser) {
          await fetchProfile(currentUser.id);
        } else {
          setLoading(false);
        }

        // Listen for auth changes
        const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
          const newUser = session?.user ?? null;
          setUser(newUser);
          
          if (newUser) {
            // Force re-fetch on important events
            await fetchProfile(newUser.id);
          } else {
            setProfile(null);
            setLoading(false);
          }
        });
        subscription = data.subscription;
      } catch (err) {
        console.error('Auth initialization error:', err);
        setLoading(false);
      }
    };

    initAuth();

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [isConfigured]);

  async function fetchProfile(userId: string) {
    if (!isConfigured) return;
    try {
      // Small delay to ensure DB triggers have finished if this was called immediately after signup
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Profile fetch error:', error);
        setProfile(null);
      } else {
        console.log('Profile loaded successfully. Role:', data.role);
        setProfile(data);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  }

  const signOut = async () => {
    if (!isConfigured) return;
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, refreshProfile, isConfigured }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
