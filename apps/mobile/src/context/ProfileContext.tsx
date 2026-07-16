import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase/client';
import { useAuth } from './AuthContext';
import { storage } from '../storage/mmkv';

type ProfileContextType = {
  profile: any;
  loading: boolean;
  setProfile: (updates: any) => Promise<void>;
  clearProfile: () => void;
};

const ProfileContext = createContext<ProfileContextType>({} as ProfileContextType);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfileState] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfileState(null);
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
        const fastingMode = storage.getString(`fastingMode_${user.id}`) || 'None';
        const culturalHeritage = storage.getString(`culturalHeritage_${user.id}`) || 'Global';
        const langPref = storage.getString(`langPref_${user.id}`) || 'English';
        setProfileState({ ...data, medicalNotes: data.medical_notes, fastingMode, culturalHeritage, langPref });
      } else if (error && error.code === 'PGRST116') {
        const { data: newProfile } = await supabase
          .from('profiles')
          .upsert({ id: user.id, name: user.user_metadata?.full_name || '', updated_at: new Date() })
          .select()
          .single();
        if (newProfile) {
          const fastingMode = storage.getString(`fastingMode_${user.id}`) || 'None';
          const culturalHeritage = storage.getString(`culturalHeritage_${user.id}`) || 'Global';
          const langPref = storage.getString(`langPref_${user.id}`) || 'English';
          setProfileState({ ...newProfile, medicalNotes: newProfile.medical_notes, fastingMode, culturalHeritage, langPref });
        } else {
          setProfileState({ id: user.id, name: user.user_metadata?.full_name || '', _fallback: true });
        }
      } else {
        console.error("Error fetching profile", error);
        setProfileState({ id: user.id, name: user.user_metadata?.full_name || '', _fallback: true });
      }
      setLoading(false);
    }

    fetchProfile();
  }, [user]);

  const setProfile = async (updates: any) => {
    if (!user) return;
    
    const dbPayload = { ...updates };
    if ('medicalNotes' in dbPayload) {
      dbPayload.medical_notes = dbPayload.medicalNotes;
      delete dbPayload.medicalNotes;
    }
    
    if ('fastingMode' in dbPayload) {
      storage.set(`fastingMode_${user.id}`, dbPayload.fastingMode);
      delete dbPayload.fastingMode;
    }

    if ('culturalHeritage' in dbPayload) {
      storage.set(`culturalHeritage_${user.id}`, dbPayload.culturalHeritage);
      delete dbPayload.culturalHeritage;
    }

    if ('langPref' in dbPayload) {
      storage.set(`langPref_${user.id}`, dbPayload.langPref);
      delete dbPayload.langPref;
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, ...dbPayload, updated_at: new Date() })
      .select()
      .single();
      
    if (!error && data) {
      const fastingMode = storage.getString(`fastingMode_${user.id}`) || 'None';
      const culturalHeritage = storage.getString(`culturalHeritage_${user.id}`) || 'Global';
      const langPref = storage.getString(`langPref_${user.id}`) || 'English';
      setProfileState({ ...data, medicalNotes: data.medical_notes, fastingMode, culturalHeritage, langPref });
    } else {
      console.error('Error updating profile', error);
    }
  };

  const clearProfile = () => {
    setProfileState(null);
    setLoading(false);
  };

  return (
    <ProfileContext.Provider value={{ profile, setProfile, clearProfile, loading }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}
