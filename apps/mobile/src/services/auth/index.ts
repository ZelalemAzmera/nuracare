import { supabase } from '../supabase/client';
import { useAuthStore } from '../../store';
import { User } from '../../shared';

export const initializeAuthListener = () => {
  supabase.auth.onAuthStateChange(async (event, session) => {
    const { setUser } = useAuthStore.getState();

    if (event === 'SIGNED_IN' && session?.user) {
      // Map Supabase User to our Contract User
      const appUser: User = {
        id: session.user.id,
        name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
      };
      setUser(appUser);
      
      // Ensure profile exists in DB
      const { data } = await supabase.from('profiles').select('id').eq('id', session.user.id).single();
      if (!data) {
        await supabase.from('profiles').insert({ id: session.user.id, name: appUser.name });
      }

    } else if (event === 'SIGNED_OUT') {
      setUser(null);
    }
  });
};

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw new Error(error.message);
  return data;
};

export const signUpWithEmail = async (email: string, password: string, name: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name }
    }
  });
  if (error) throw new Error(error.message);
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
};
