import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // 1. Delete token
    await supabase
      .from('wearable_tokens')
      .delete()
      .eq('user_id', userId)
      .eq('provider', 'fitbit');

    // 2. Update profile
    await supabase
      .from('profiles')
      .update({
        connected_devices: { fitbit: false }
      })
      .eq('id', userId);

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Disconnect Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
