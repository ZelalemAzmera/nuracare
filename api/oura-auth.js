export default function handler(req, res) {
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
