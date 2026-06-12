export default function handler(req, res) {
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
