import { useState, useEffect, useContext, createContext } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

// ─── Shared Context so all components use ONE instance ────────────────────────
const CheckupsContext = createContext(null);

export function CheckupsProvider({ children }) {
  const value = useCheckupsState();
  return (
    <CheckupsContext.Provider value={value}>
      {children}
    </CheckupsContext.Provider>
  );
}

export function useCheckups() {
  const ctx = useContext(CheckupsContext);
  if (!ctx) throw new Error('useCheckups must be used within <CheckupsProvider>');
  return ctx;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getLocalKey(userId) {
  return userId ? `nuracare_checkups_${userId}` : 'nuracare_guest_checkups';
}

function readLocal(userId) {
  try {
    const raw = localStorage.getItem(getLocalKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function writeLocal(userId, data) {
  try {
    localStorage.setItem(getLocalKey(userId), JSON.stringify(data));
  } catch {}
}

// ─── Core state hook — ONE instance via Provider ──────────────────────────────
function useCheckupsState() {
  const { user } = useAuth();
  const [checkups, setCheckups] = useState(() => readLocal(user?.id));
  const [loading, setLoading] = useState(true);

  // On mount / user change: load local immediately, then sync from Supabase
  useEffect(() => {
    const local = readLocal(user?.id);
    setCheckups(local);
    setLoading(false);

    if (!user) return; // Guest: localStorage is the only store

    // Background sync from Supabase — merge with local
    (async () => {
      const { data, error } = await supabase
        .from('checkups')
        .select('*')
        .eq('user_id', user.id)
        .order('date_logged', { ascending: false });

      if (!error && data) {
        // Merge: remote wins for entries with proper UUIDs; keep local-only entries
        const remoteIds = new Set(data.map(r => r.id));
        const localOnly = local.filter(l => !remoteIds.has(l.id) && l.id?.startsWith('local-'));
        const merged = [...data, ...localOnly].sort(
          (a, b) => new Date(b.date_logged) - new Date(a.date_logged)
        );
        setCheckups(merged);
        writeLocal(user.id, merged);
      }
    })();
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── addCheckup ──────────────────────────────────────────────────────────────
  const addCheckup = async (data) => {
    const payload = {
      name: data.name,
      doctor: data.doctor || null,
      date_logged: data.date_logged || new Date().toISOString().split('T')[0],
      next_visit: data.next_visit || null,
      notes: data.notes || null,
      source: data.source || 'manual',
    };

    // Step 1: Write to localStorage immediately so UI updates instantly
    const localId = 'local-' + Date.now();
    const localEntry = { id: localId, ...payload, user_id: user?.id || 'guest' };
    setCheckups(prev => {
      const updated = [localEntry, ...prev];
      writeLocal(user?.id, updated);
      return updated;
    });

    if (!user) return { data: localEntry, error: null };

    // Step 2: Sync to Supabase in background — replace local entry with real UUID on success
    const { data: result, error } = await supabase
      .from('checkups')
      .insert({ ...payload, user_id: user.id })
      .select()
      .single();

    if (!error && result) {
      // Replace the local placeholder with the real Supabase entry
      setCheckups(prev => {
        const updated = prev.map(c => c.id === localId ? result : c);
        writeLocal(user.id, updated);
        return updated;
      });
      return { data: result, error: null };
    } else {
      // Supabase failed — local entry stays so user still sees their data
      console.warn('Supabase insert failed (keeping local copy):', error?.message);
      return { data: localEntry, error };
    }
  };

  // ── deleteCheckup ───────────────────────────────────────────────────────────
  const deleteCheckup = async (id) => {
    setCheckups(prev => {
      const updated = prev.filter(c => c.id !== id);
      writeLocal(user?.id, updated);
      return updated;
    });

    if (!user || id.startsWith('local-')) return { error: null };

    const { error } = await supabase.from('checkups').delete().eq('id', id);
    if (error) console.warn('Supabase delete failed:', error?.message);
    return { error };
  };

  // ── updateCheckup ───────────────────────────────────────────────────────────
  const updateCheckup = async (id, data) => {
    setCheckups(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, ...data } : c);
      writeLocal(user?.id, updated);
      return updated;
    });

    if (!user || id.startsWith('local-')) return { error: null };

    const { data: result, error } = await supabase
      .from('checkups')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (!error && result) {
      setCheckups(prev => {
        const updated = prev.map(c => c.id === id ? result : c);
        writeLocal(user?.id, updated);
        return updated;
      });
    } else {
      console.warn('Supabase update failed:', error?.message);
    }
    return { error };
  };

  return { checkups, addCheckup, deleteCheckup, updateCheckup, loading };
}
