export default function handler(req, res) {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  const clientId = process.env.FITBIT_CLIENT_ID;
  // Use the vercel domain or localhost based on environment
  const host = req.headers.host;
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const redirectUri = encodeURIComponent(`${protocol}://${host}/api/fitbit-callback`);
  
  // Scopes needed to read daily vitals
  const scope = encodeURIComponent('activity heartrate sleep profile weight');

  // We pass the userId in the state parameter so we know who logged in during the callback
  const authUrl = `https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${userId}&expires_in=31536000`;

  res.redirect(authUrl);
}
