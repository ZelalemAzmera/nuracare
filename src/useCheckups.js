import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { useAuth } from './AuthContext';

export function useCheckups() {
  const { user } = useAuth();
  const [checkups, setCheckups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      // Fallback to localStorage for guest users
      const stored = localStorage.getItem('nuracare_guest_checkups');
      if (stored) {
        try {
          setCheckups(JSON.parse(stored));
        } catch (e) {
          console.error('Error parsing guest checkups', e);
        }
      } else {
        setCheckups([]);
      }
      setLoading(false);
      return;
    }

    async function fetchCheckups() {
      setLoading(true);
      const { data, error } = await supabase
        .from('checkups')
        .select('*')
        .eq('user_id', user.id)
        .order('date_logged', { ascending: false });

      if (!error && data) {
        setCheckups(data);
      } else if (error) {
        console.error('Error fetching checkups', error);
      }
      setLoading(false);
    }

    fetchCheckups();
  }, [user]);

  const addCheckup = async (data) => {
    const payload = {
      name: data.name,
      doctor: data.doctor || null,
      date_logged: data.date_logged || new Date().toISOString().split('T')[0],
      next_visit: data.next_visit || null,
      notes: data.notes || null,
      source: data.source || 'manual'
    };

    if (!user) {
      const newEntry = { id: 'guest-' + Date.now(), ...payload };
      const updated = [newEntry, ...checkups];
      setCheckups(updated);
      localStorage.setItem('nuracare_guest_checkups', JSON.stringify(updated));
      return { data: newEntry, error: null };
    }

    const { data: result, error } = await supabase
      .from('checkups')
      .insert({ ...payload, user_id: user.id })
      .select()
      .single();

    if (!error && result) {
      setCheckups(prev => [result, ...prev]);
    } else {
      console.error('Error adding checkup', error);
    }
    return { data: result, error };
  };

  const deleteCheckup = async (id) => {
    if (!user) {
      const updated = checkups.filter(c => c.id !== id);
      setCheckups(updated);
      localStorage.setItem('nuracare_guest_checkups', JSON.stringify(updated));
      return { error: null };
    }

    const { error } = await supabase.from('checkups').delete().eq('id', id);
    if (!error) {
      setCheckups(prev => prev.filter(c => c.id !== id));
    } else {
      console.error('Error deleting checkup', error);
    }
    return { error };
  };

  const updateCheckup = async (id, data) => {
    if (!user) {
      const updated = checkups.map(c => c.id === id ? { ...c, ...data } : c);
      setCheckups(updated);
      localStorage.setItem('nuracare_guest_checkups', JSON.stringify(updated));
      return { error: null };
    }

    const { data: result, error } = await supabase
      .from('checkups')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (!error && result) {
      setCheckups(prev => prev.map(c => c.id === id ? result : c));
    } else {
      console.error('Error updating checkup', error);
    }
    return { error };
  };

  return { checkups, addCheckup, deleteCheckup, updateCheckup, loading };
}
