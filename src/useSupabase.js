import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { useAuth } from './AuthContext';

export function useSupabaseProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    async function fetchProfile() {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (!error && data) {
        setProfile(data);
      }
      setLoading(false);
    }

    fetchProfile();
  }, [user]);

  const updateProfile = async (updates) => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, ...updates, updated_at: new Date() })
      .select()
      .single();
      
    if (!error && data) {
      setProfile(data);
    } else {
      console.error('Error updating profile', error);
    }
  };

  return { profile, setProfile: updateProfile, loading };
}

export function useSupabaseSessions() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSessions([]);
      setLoading(false);
      return;
    }

    async function fetchSessions() {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
        
      if (!error && data) {
        setSessions(data);
      }
      setLoading(false);
    }

    fetchSessions();
  }, [user]);

  const saveSession = async (sessionData) => {
    if (!user) return;
    
    const isNew = !sessions.find(s => s.id === sessionData.id);
    
    const { data, error } = await supabase
      .from('sessions')
      .upsert({ 
        id: sessionData.id,
        user_id: user.id,
        name: sessionData.name || 'New Session',
        messages: sessionData.messages || [],
        updated_at: new Date()
      })
      .select()
      .single();

    if (!error && data) {
      if (isNew) {
        setSessions(prev => [data, ...prev]);
      } else {
        setSessions(prev => prev.map(s => s.id === data.id ? data : s));
      }
    } else {
      console.error('Error saving session', error);
    }
  };
  
  const deleteSession = async (sessionId) => {
    if (!user) return;
    const { error } = await supabase.from('sessions').delete().eq('id', sessionId);
    if (!error) {
      setSessions(prev => prev.filter(s => s.id !== sessionId));
    }
  };

  return { sessions, saveSession, deleteSession, loading };
}
