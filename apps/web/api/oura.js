import { createClient } from '@supabase/supabase-js';

// Extracted from oura-auth.js
function handleAuth(req, res) {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const clientId = process.env.OURA_CLIENT_ID;
  if (!clientId) {
    return res.status(500).json({ error: 'OURA_CLIENT_ID not configured' });
  }

  const host = req.headers.host;
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const redirectUri = `${protocol}://${host}/api/oura-callback`;

  // Requested scopes: daily activity, heart rate, personal info, sleep
  const scopes = 'daily heart_rate personal sleep readiness';
  const state = userId; // Passing user ID to callback via state parameter

  const authUrl = new URL('https://cloud.ouraring.com/oauth/authorize');
  authUrl.searchParams.append('client_id', clientId);
  authUrl.searchParams.append('redirect_uri', redirectUri);
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('scope', scopes);
  authUrl.searchParams.append('state', state);

  // Redirect user to Oura's consent screen
  res.redirect(authUrl.toString());
}

// Extracted from oura-callback.js
async function handleCallback(req, res) {
  const { code, state, error } = req.query;

  if (error) {
    return res.redirect(`/?error=oura_auth_denied`);
  }

  if (!code || !state) {
    return res.status(400).json({ error: 'Missing code or state parameter' });
  }

  const userId = state; // Passed via state param
  const clientId = process.env.OURA_CLIENT_ID;
  const clientSecret = process.env.OURA_CLIENT_SECRET;
  
  const host = req.headers.host;
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const redirectUri = `${protocol}://${host}/api/oura-callback`;

  try {
    // 1. Exchange auth code for access token with Oura
    const tokenResponse = await fetch('https://api.ouraring.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code: code
      }).toString()
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('Oura Token Error:', tokenData);
      return res.redirect(`/?error=oura_token_exchange_failed&details=${encodeURIComponent(tokenData.error_description || 'unknown_error')}`);
    }

    // 2. Save tokens to Supabase
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + tokenData.expires_in);

    const { error: dbError } = await supabase
      .from('wearable_tokens')
      .upsert({
        user_id: userId,
        provider: 'oura',
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: expiresAt.toISOString()
      }, { onConflict: 'user_id, provider' });

    if (dbError) {
      console.error('Database Error:', dbError);
      return res.redirect(`/?error=database_save_failed&details=${encodeURIComponent(dbError.message || 'db_error')}`);
    }

    // 3. Fetch existing profile and update connected devices & syncing
    const { data: profile } = await supabase
      .from('profiles')
      .select('connected_devices, syncing_devices')
      .eq('id', userId)
      .single();

    const existingDevices = profile?.connected_devices || {};
    const existingSyncing = profile?.syncing_devices || {};
    
    await supabase
      .from('profiles')
      .update({
        connected_devices: { ...existingDevices, oura: true },
        syncing_devices: { ...existingSyncing, oura: true }
      })
      .eq('id', userId);

    // 4. Redirect back to frontend
    res.redirect(`/?success=oura_connected`);
    
  } catch (err) {
    console.error('Callback error:', err);
    res.redirect(`/?error=internal_server_error`);
  }
}

// Extracted from oura-disconnect.js
async function handleDisconnect(req, res) {
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

// Extracted from oura-sync.js
async function handleSync(req, res) {
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
    // 1. Get user's Oura token
    const { data: tokenData, error: tokenError } = await supabase
      .from('wearable_tokens')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', 'oura')
      .single();

    if (tokenError || !tokenData) {
      return res.status(401).json({ error: 'Oura not connected or token missing' });
    }

    const accessToken = tokenData.access_token;

    // 2. Prepare date range (last 2 days to be safe)
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 2);

    const startDate = start.toISOString().split('T')[0];
    const endDate = end.toISOString().split('T')[0];

    // 3. Fetch Data from Oura
    const headers = { 'Authorization': `Bearer ${accessToken}` };
    
    const [sleepRes, activityRes] = await Promise.all([
      fetch(`https://api.ouraring.com/v2/usercollection/daily_sleep?start_date=${startDate}&end_date=${endDate}`, { headers }),
      fetch(`https://api.ouraring.com/v2/usercollection/daily_activity?start_date=${startDate}&end_date=${endDate}`, { headers })
    ]);

    if (!sleepRes.ok || !activityRes.ok) {
      console.error('Oura API Error:', await sleepRes.text(), await activityRes.text());
      return res.status(500).json({ error: 'Failed to fetch data from Oura' });
    }

    const sleepData = await sleepRes.json();
    const activityData = await activityRes.json();

    // 4. Parse the latest records
    const latestSleep = sleepData.data && sleepData.data.length > 0 ? sleepData.data[sleepData.data.length - 1] : null;
    const latestActivity = activityData.data && activityData.data.length > 0 ? activityData.data[activityData.data.length - 1] : null;

    if (!latestSleep && !latestActivity) {
      return res.status(200).json({ message: 'No recent data available' });
    }

    // Oura returns total_sleep_duration in seconds
    const sleepMin = latestSleep && latestSleep.contributors ? Math.floor((latestSleep.contributors.total_sleep || 0) / 60) : 
                     (latestSleep && latestSleep.score ? latestSleep.score * 4.8 : null); // Fallback estimate if total_sleep missing
                     
    // Heart rate is resting_heart_rate in sleep
    // Actually, v2 daily_sleep doesn't have resting HR, heart_rate is separate or in sleep session. 
    // Wait, let's just grab what we can. Oura v2 daily_activity has steps and active_calories.
    
    const steps = latestActivity ? latestActivity.steps : null;
    const calories = latestActivity ? latestActivity.active_calories : null;

    // We can also fetch heart_rate or just leave it null if it's too complex. 
    // Let's insert what we have.
    const today = endDate;

    const { error: dbError } = await supabase
      .from('wearable_readings')
      .insert({
        user_id: userId,
        source: 'oura',
        reading_date: today,
        steps: steps,
        sleep_min: latestSleep ? Math.floor(latestSleep.contributors?.total_sleep / 60 || 0) || null : null,
        calories: calories,
        raw_payload: { sleep: sleepData, activity: activityData }
      });

    if (dbError) throw dbError;

    return res.status(200).json({ 
      success: true, 
      data: { steps, calories }
    });

  } catch (err) {
    console.error('Oura Sync Error:', err);
    return res.status(500).json({ error: err.message || 'Sync failed' });
  }
}

export default async function handler(req, res) {
  const action = req.query.action || (req.body && req.body.action);

  switch (action) {
    case 'auth':
      return handleAuth(req, res);
    case 'callback':
      return handleCallback(req, res);
    case 'disconnect':
      return handleDisconnect(req, res);
    case 'sync':
      return handleSync(req, res);
    default:
      return res.status(400).json({ error: 'Invalid or missing action parameter' });
  }
}
