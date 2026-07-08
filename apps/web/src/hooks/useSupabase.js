import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

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
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (data) {
        const fastingMode = localStorage.getItem(`fastingMode_${user.id}`) || 'None';
        const culturalHeritage = localStorage.getItem(`culturalHeritage_${user.id}`) || 'Global';
        const langPref = localStorage.getItem(`langPref_${user.id}`) || 'English';
        setProfile({ ...data, medicalNotes: data.medical_notes, fastingMode, culturalHeritage, langPref });
      } else if (error && error.code === 'PGRST116') {
        const { data: newProfile } = await supabase
          .from('profiles')
          .upsert({ id: user.id, name: user.user_metadata?.full_name || '', updated_at: new Date() })
          .select()
          .single();
        if (newProfile) {
          const fastingMode = localStorage.getItem(`fastingMode_${user.id}`) || 'None';
          const culturalHeritage = localStorage.getItem(`culturalHeritage_${user.id}`) || 'Global';
          const langPref = localStorage.getItem(`langPref_${user.id}`) || 'English';
          setProfile({ ...newProfile, medicalNotes: newProfile.medical_notes, fastingMode, culturalHeritage, langPref });
        } else {
          setProfile({ id: user.id, name: user.user_metadata?.full_name || '', _fallback: true });
        }
      } else {
        console.error("Error fetching profile", error);
        setProfile({ id: user.id, name: user.user_metadata?.full_name || '', _fallback: true });
      }
      setLoading(false);
    }

    fetchProfile();
  }, [user]);

  const updateProfile = async (updates) => {
    if (!user) return;
    
    // Convert camelCase to snake_case for the database
    const dbPayload = { ...updates };
    if ('medicalNotes' in dbPayload) {
      dbPayload.medical_notes = dbPayload.medicalNotes;
      delete dbPayload.medicalNotes;
    }
    
    if ('fastingMode' in dbPayload) {
      localStorage.setItem(`fastingMode_${user.id}`, dbPayload.fastingMode);
      delete dbPayload.fastingMode;
    }

    if ('culturalHeritage' in dbPayload) {
      localStorage.setItem(`culturalHeritage_${user.id}`, dbPayload.culturalHeritage);
      delete dbPayload.culturalHeritage;
    }

    if ('langPref' in dbPayload) {
      localStorage.setItem(`langPref_${user.id}`, dbPayload.langPref);
      delete dbPayload.langPref;
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, ...dbPayload, updated_at: new Date() })
      .select()
      .single();
      
    if (!error && data) {
      const fastingMode = localStorage.getItem(`fastingMode_${user.id}`) || 'None';
      const culturalHeritage = localStorage.getItem(`culturalHeritage_${user.id}`) || 'Global';
      const langPref = localStorage.getItem(`langPref_${user.id}`) || 'English';
      setProfile({ ...data, medicalNotes: data.medical_notes, fastingMode, culturalHeritage, langPref });
    } else {
      console.error('Error updating profile', error);
      window.dispatchEvent(new CustomEvent('nuracare-toast', { detail: { message: 'Failed to save profile: ' + error.message, type: 'error' } }));
    }
  };

  const clearProfile = () => {
    setProfile(null);
    setLoading(false);
  };

  return { profile, setProfile: updateProfile, clearProfile, loading };
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
      setLoading(true);
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

  const clearSessions = () => setSessions([]);

  return { sessions, saveSession, deleteSession, clearSessions, loading };
}
