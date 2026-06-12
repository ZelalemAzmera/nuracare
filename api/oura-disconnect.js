import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // 1. Delete Oura tokens
    const { error: dbError } = await supabase
      .from('wearable_tokens')
      .delete()
      .eq('user_id', userId)
      .eq('provider', 'oura');

    if (dbError) throw dbError;

    // 2. Update profile
    // Note: To be safe with JSONB, we just read the current, remove oura, and update.
    const { data: profile } = await supabase
      .from('profiles')
      .select('connected_devices')
      .eq('id', userId)
      .single();
      
    if (profile && profile.connected_devices) {
      const devices = { ...profile.connected_devices };
      delete devices.oura;
      
      await supabase
        .from('profiles')
        .update({ connected_devices: devices })
        .eq('id', userId);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Oura Disconnect Error:', err);
    return res.status(500).json({ error: err.message || 'Failed to disconnect' });
  }
}
