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

  // Base64 encode client_id:client_secret for the Basic Auth header
  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    // 1. Exchange auth code for access token
    const tokenResponse = await fetch('https://api.fitbit.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code: code
      }).toString()
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('Fitbit Token Error:', tokenData);
      return res.redirect(`/?error=fitbit_token_exchange_failed`);
    }

    // 2. Save tokens to Supabase
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Need admin key to bypass RLS in the backend
    
    // Fallback to anon key if service role is not available in env
    const clientKey = supabaseKey || process.env.VITE_SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, clientKey);

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
      }, { onConflict: 'user_id' });

    if (dbError) {
      console.error('Database Error:', dbError);
      return res.redirect(`/?error=database_save_failed`);
    }

    // 3. Update profile to show connected
    await supabase
      .from('profiles')
      .update({
        connected_devices: { fitbit: true }
      })
      .eq('id', userId);

    // 4. Redirect back to frontend
    res.redirect(`/?success=fitbit_connected`);
    
  } catch (err) {
    console.error('Callback error:', err);
    res.redirect(`/?error=internal_server_error`);
  }
}
