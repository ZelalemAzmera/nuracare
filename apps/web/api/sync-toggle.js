import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, provider, enableSync } = req.body;
  if (!userId || !provider) {
    return res.status(400).json({ error: 'Missing userId or provider' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized: Missing authorization header' });
  }
  const token = authHeader.replace('Bearer ', '');

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Validate calling user's identity
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !authUser || authUser.id !== userId) {
    return res.status(403).json({ error: 'Forbidden: Cannot modify syncing devices for another user' });
  }

  try {
    // Fetch existing profile
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('syncing_devices')
      .eq('id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    const existingSyncing = profile?.syncing_devices || {};
    const updatedSyncing = { ...existingSyncing, [provider]: !!enableSync };

    // Update profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ syncing_devices: updatedSyncing })
      .eq('id', userId);

    if (updateError) throw updateError;

    res.status(200).json({ success: true, syncing_devices: updatedSyncing });
  } catch (err) {
    console.error('Sync Toggle Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
