import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Require CRON_SECRET to prevent unauthorized execution and SSRF amplification
  const expectedSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.authorization;
  if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
    return res.status(401).json({ error: 'Unauthorized: Valid CRON_SECRET bearer token required' });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Fetch all profiles that have syncing_devices configured
    // Since syncing_devices is JSONB, we just pull everything and filter in memory 
    // to avoid complex JSONB querying if it's small, or we can query it directly.
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, syncing_devices')
      .not('syncing_devices', 'is', null);

    if (error) throw error;

    const host = req.headers.host;
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    let syncPromises = [];

    for (const profile of profiles) {
      const devices = profile.syncing_devices || {};
      
      if (devices.fitbit) {
        syncPromises.push(
          fetch(`${baseUrl}/api/fitbit-sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: profile.id, background: true })
          }).catch(err => console.error(`Failed fitbit cron sync for ${profile.id}`, err))
        );
      }
      
      if (devices.oura) {
        syncPromises.push(
          fetch(`${baseUrl}/api/oura-sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: profile.id, background: true })
          }).catch(err => console.error(`Failed oura cron sync for ${profile.id}`, err))
        );
      }
    }

    // Wait for all syncs to complete
    await Promise.allSettled(syncPromises);

    res.status(200).json({ success: true, processed: syncPromises.length });
  } catch (err) {
    console.error('Cron Sync Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
