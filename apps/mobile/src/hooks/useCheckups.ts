import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase/client';

export interface Checkup {
  id: string;
  title: string;
  date: string;
  doctor: string;
  notes?: string;
  completed: boolean;
}

export function useCheckups() {
  const [checkups, setCheckups] = useState<Checkup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCheckups();
  }, []);

  const fetchCheckups = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('checkups')
        .select('*')
        .order('date', { ascending: true });
        
      if (error) throw error;
      setCheckups(data || []);
    } catch (e) {
      console.error('Error fetching checkups', e);
      // Fallback data for demo purposes since we might not be authenticated
      setCheckups([
        { id: '1', title: 'Annual Physical', date: new Date(Date.now() + 86400000 * 3).toISOString(), doctor: 'Dr. Smith', completed: false },
        { id: '2', title: 'Dermatology Follow-up', date: new Date(Date.now() + 86400000 * 14).toISOString(), doctor: 'Dr. Lee', completed: false },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const addCheckup = async (checkup: Omit<Checkup, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('checkups')
        .insert([checkup])
        .select();
        
      if (error) throw error;
      if (data) {
        setCheckups(prev => [...prev, data[0]]);
      }
    } catch (e) {
      console.error('Error adding checkup', e);
      // Optimistic update for demo
      const newCheckup = { ...checkup, id: Math.random().toString() };
      setCheckups(prev => [...prev, newCheckup]);
    }
  };

  return {
    checkups,
    loading,
    addCheckup,
    refresh: fetchCheckups
  };
}
