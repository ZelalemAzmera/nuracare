import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase/client';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

// To support Google OAuth in Expo
WebBrowser.maybeCompleteAuthSession();

type AuthContextType = {
  user: any;
  loading: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<any>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<any>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          full_name: name,
        }
      }
    });
    if (error) {
      if (error.message.toLowerCase().includes('rate limit')) {
        throw new Error("Too many signup attempts. Please try again later or log in.");
      }
      throw error;
    }
    if (data?.user?.identities?.length === 0) {
      throw new Error("This email is already registered. Please log in.");
    }
    return data;
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signInWithGoogle = async () => {
    // Basic OAuth flow for Expo
    const redirectUrl = Linking.createURL('/(tabs)');
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: true, // We must handle redirect manually in React Native
      }
    });

    if (error) {
      console.error('Error signing in:', error);
      throw error;
    }

    if (data?.url) {
      const res = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
      if (res.type === 'success') {
        // Expo Auth Session on Success gives the url with query params or hash
        const urlObj = new URL(res.url);
        // Sometimes Supabase returns hash for implicit grant
        const hashStr = urlObj.hash;
        if (hashStr) {
          const params = new URLSearchParams(hashStr.replace('#', '?'));
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          if (accessToken && refreshToken) {
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
          }
        }
      }
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error signing out:', error);
  };

  return (
    <AuthContext.Provider value={{ user, signUpWithEmail, signInWithEmail, signInWithGoogle, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
