import { useSyncStore } from '../../store/syncStore';
import { useWellnessStore, useChatStore, useAuthStore } from '../../store';
import { supabase } from './client';

/**
 * Background Sync Engine
 * Pushes local MMKV queued items to Supabase tables based on the schema.
 */
export const syncLocalDataToCloud = async () => {
  const syncStore = useSyncStore.getState();
  const { user } = useAuthStore.getState();
  
  if (!user) return; // Cannot sync if not authenticated
  if (syncStore.isSyncing) return;
  if (syncStore.pendingCheckIns.length === 0 && syncStore.pendingMessages.length === 0) return;

  syncStore.setSyncing(true);

  try {
    // 1. Process Check-Ins -> `profiles.records`
    const pendingCheckIns = [...syncStore.pendingCheckIns];
    if (pendingCheckIns.length > 0) {
      const wellnessState = useWellnessStore.getState();
      
      // Fetch remote profile records first to merge and prevent overwriting other devices' data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('records')
        .eq('id', user.id)
        .single();
        
      if (!profileError) {
        let remoteRecords = [];
        if (profile?.records) {
          // ensure it's an array
          remoteRecords = Array.isArray(profile.records) ? profile.records : [];
        }

        const localRecordsToPush = pendingCheckIns
          .map(id => wellnessState.checkIns.find(c => c.id === id))
          .filter(Boolean);

        // Merge keeping unique IDs
        const combined = [...localRecordsToPush, ...remoteRecords];
        const uniqueRecordsMap = new Map(combined.map(r => [r.id, r]));
        const mergedRecords = Array.from(uniqueRecordsMap.values());

        const { error: updateError } = await supabase
          .from('profiles')
          .update({ records: mergedRecords, updated_at: new Date().toISOString() })
          .eq('id', user.id);

        if (!updateError) {
          console.log(`[SyncEngine] Successfully synced ${pendingCheckIns.length} check-ins.`);
          pendingCheckIns.forEach(id => syncStore.removeFromQueue('checkIn', id));
        } else {
          console.error('[SyncEngine] Failed to update profiles.records:', updateError);
        }
      } else {
        console.error('[SyncEngine] Failed to fetch profile:', profileError);
      }
    }

    // 2. Process Messages -> `sessions.messages`
    // Note: The schema expects a session ID. For simplicity, we assume one global session for the mobile app,
    // or we create a "mobile_session" if it doesn't exist.
    const pendingMessages = [...syncStore.pendingMessages];
    if (pendingMessages.length > 0) {
      const chatState = useChatStore.getState();
      const mobileSessionId = `mobile_${user.id}`;
      
      // Fetch remote session
      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .select('messages')
        .eq('id', mobileSessionId)
        .single();

      let remoteMessages = [];
      if (!sessionError && session?.messages) {
        remoteMessages = Array.isArray(session.messages) ? session.messages : [];
      }
      
      const localMessagesToPush = pendingMessages
        .map(id => chatState.messages.find(m => m.id === id))
        .filter(Boolean);

      const combinedMessages = [...remoteMessages, ...localMessagesToPush];
      const uniqueMessagesMap = new Map(combinedMessages.map(m => [m.id, m]));
      const mergedMessages = Array.from(uniqueMessagesMap.values());

      const { error: upsertError } = await supabase
        .from('sessions')
        .upsert({ 
          id: mobileSessionId,
          user_id: user.id,
          name: 'Mobile App Session',
          messages: mergedMessages,
          updated_at: new Date().toISOString()
        });

      if (!upsertError) {
        console.log(`[SyncEngine] Successfully synced ${pendingMessages.length} messages.`);
        pendingMessages.forEach(id => syncStore.removeFromQueue('message', id));
      } else {
        console.error('[SyncEngine] Failed to upsert session:', upsertError);
      }
    }

    syncStore.setLastSynced(new Date().toISOString());
  } catch (error) {
    console.error('[SyncEngine] Sync failed:', error);
  } finally {
    syncStore.setSyncing(false);
  }
};

export const startBackgroundSyncLoop = () => {
  setInterval(() => {
    syncLocalDataToCloud();
  }, 60000);
};
