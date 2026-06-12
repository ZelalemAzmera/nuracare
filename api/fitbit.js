import { createClient } from '@supabase/supabase-js';

// Extracted from fitbit-auth.js
function handleAuth(req, res) {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  const clientId = process.env.FITBIT_CLIENT_ID; // This is now a Google Client ID
  // Use the vercel domain or localhost based on environment
  const host = req.headers.host;
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const redirectUri = encodeURIComponent(`${protocol}://${host}/api/fitbit-callback`);
  
  // Google Health/Fit Scopes
  const scope = encodeURIComponent([
    'https://www.googleapis.com/auth/fitness.activity.read',
    'https://www.googleapis.com/auth/fitness.body.read',
    'https://www.googleapis.com/auth/fitness.sleep.read',
    'https://www.googleapis.com/auth/fitness.heart_rate.read',
    'https://www.googleapis.com/auth/userinfo.profile'
  ].join(' '));

  // We pass the userId in the state parameter so we know who logged in during the callback
  // Use Google's OAuth endpoint instead of Fitbit's
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${userId}&access_type=offline&prompt=consent`;

  res.redirect(authUrl);
}

// Extracted from fitbit-callback.js
async function handleCallback(req, res) {
  const { code, state, error } = req.query;

  if (error) {
    return res.redirect(`/?error=fitbit_auth_denied`);
  }

  if (!code || !state) {
    return res.status(400).json({ error: 'Missing code or state parameter' });
  }

  const userId = state; // We passed userId in the state param
  const clientId = process.env.FITBIT_CLIENT_ID;
  const clientSecret = process.env.FITBIT_CLIENT_SECRET;
  
  const host = req.headers.host;
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const redirectUri = `${protocol}://${host}/api/fitbit-callback`;

  try {
    // 1. Exchange auth code for access token with Google
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
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
      console.error('Google Token Error:', tokenData);
      return res.redirect(`/?error=fitbit_token_exchange_failed&details=${encodeURIComponent(tokenData.error_description || tokenData.error || 'unknown_error')}`);
    }

    // 2. Save tokens to Supabase
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Calculate expiration timestamp
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + tokenData.expires_in);

    const { error: dbError } = await supabase
      .from('wearable_tokens')
      .upsert({
        user_id: userId,
        provider: 'fitbit',
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
        connected_devices: { ...existingDevices, fitbit: true },
        syncing_devices: { ...existingSyncing, fitbit: true }
      })
      .eq('id', userId);

    // 4. Redirect back to frontend
    res.redirect(`/?success=fitbit_connected`);
    
  } catch (err) {
    console.error('Callback error:', err);
    res.redirect(`/?error=internal_server_error`);
  }
}

// Extracted from fitbit-disconnect.js
async function handleDisconnect(req, res) {
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

    // 2. Fetch existing profile and update connected devices
    const { data: profile } = await supabase
      .from('profiles')
      .select('connected_devices')
      .eq('id', userId)
      .single();

    const existingDevices = profile?.connected_devices || {};

    await supabase
      .from('profiles')
      .update({
        connected_devices: { ...existingDevices, fitbit: false }
      })
      .eq('id', userId);

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Disconnect Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Extracted from fitbit-sync.js
async function handleSync(req, res) {
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
    // 1. Get the user's Fitbit token
    const { data: tokenData, error: tokenError } = await supabase
      .from('wearable_tokens')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', 'fitbit')
      .single();

    if (tokenError || !tokenData) {
      return res.status(400).json({ error: 'Fitbit not connected or token not found' });
    }

    let accessToken = tokenData.access_token;
    
    // Check if token is expired (basic check)
    if (new Date(tokenData.expires_at) < new Date()) {
       console.log('Token might be expired. Trying anyway...');
    }

    // 2. Fetch data from Google Fitness API
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startTimeMillis = startOfDay.getTime();
    const endTimeMillis = now.getTime();

    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };

    // We use the dataset:aggregate endpoint for steps and heart rate
    const aggregateBody = {
      aggregateBy: [
        { dataTypeName: 'com.google.step_count.delta' },
        { dataTypeName: 'com.google.heart_rate.bpm' }
      ],
      bucketByTime: { durationMillis: endTimeMillis - startTimeMillis },
      startTimeMillis,
      endTimeMillis
    };

    const aggregateRes = await fetch('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', {
      method: 'POST',
      headers,
      body: JSON.stringify(aggregateBody)
    });

    const aggregateData = aggregateRes.ok ? await aggregateRes.json() : {};

    // Sleep requires querying sessions
    const sleepRes = await fetch(`https://www.googleapis.com/fitness/v1/users/me/sessions?startTime=${new Date(startTimeMillis - 86400000).toISOString()}&endTime=${now.toISOString()}&activityType=72`, {
      headers
    });
    const sleepData = sleepRes.ok ? await sleepRes.json() : {};

    // 3. Parse Data
    let steps = 0;
    let restingHr = null;
    let sleepMin = 0;

    if (aggregateData.bucket && aggregateData.bucket.length > 0) {
        const bucket = aggregateData.bucket[0];
        
        // Steps
        const stepDataset = bucket.dataset.find(d => d.dataSourceId.includes('step_count.delta'));
        if (stepDataset && stepDataset.point.length > 0) {
            steps = stepDataset.point.reduce((acc, p) => acc + (p.value[0].intVal || 0), 0);
        }

        // Heart Rate
        const hrDataset = bucket.dataset.find(d => d.dataSourceId.includes('heart_rate.bpm'));
        if (hrDataset && hrDataset.point.length > 0) {
            // Get an average or the first value
            restingHr = Math.round(hrDataset.point[0].value[0].fpVal || 0);
        }
    }

    // Parse sleep sessions (activityType 72)
    if (sleepData.session && sleepData.session.length > 0) {
        const totalSleepMillis = sleepData.session.reduce((acc, s) => acc + (parseInt(s.endTimeMillis) - parseInt(s.startTimeMillis)), 0);
        sleepMin = Math.round(totalSleepMillis / 60000);
    }

    const today = now.toISOString().split('T')[0];

    // 4. Save to wearable_readings table
    const reading = {
      user_id: userId,
      source: 'fitbit',
      reading_date: today,
      steps: steps > 0 ? steps : null,
      calories: null,
      sleep_min: sleepMin > 0 ? sleepMin : null,
      heart_rate: restingHr > 0 ? restingHr : null,
      raw_payload: { aggregateData, sleepData }
    };

    const { error: dbError } = await supabase
      .from('wearable_readings')
      .insert([reading]);

    if (dbError) {
      throw dbError;
    }

    res.status(200).json({ success: true, reading });

  } catch (err) {
    console.error('Fitbit Sync Error:', err);
    res.status(500).json({ error: 'Internal server error during sync' });
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
