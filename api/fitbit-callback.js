import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
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

    // 3. Fetch existing profile and update connected devices
    const { data: profile } = await supabase
      .from('profiles')
      .select('connected_devices')
      .eq('id', userId)
      .single();

    const existingDevices = profile?.connected_devices || {};
    
    await supabase
      .from('profiles')
      .update({
        connected_devices: { ...existingDevices, fitbit: true }
      })
      .eq('id', userId);

    // 4. Redirect back to frontend
    res.redirect(`/?success=fitbit_connected`);
    
  } catch (err) {
    console.error('Callback error:', err);
    res.redirect(`/?error=internal_server_error`);
  }
}
