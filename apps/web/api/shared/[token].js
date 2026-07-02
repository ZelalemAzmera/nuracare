import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token } = req.query;
  if (!token) return res.status(400).json({ error: 'Missing token' });

  const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
  // Use anon key for public fetching
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { data: session, error } = await supabase
    .from('sessions')
    .select('name, messages, shared_at')
    .eq('share_token', token)
    .single();

  if (error || !session) {
    return res.status(404).json({ error: 'Shared session not found or revoked' });
  }

  return res.status(200).json(session);
}
