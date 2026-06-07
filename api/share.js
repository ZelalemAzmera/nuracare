import { createClient } from '@supabase/supabase-js';

// Edge runtime is not required here, but we can use Node.js
export default async function handler(req, res) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Authenticate user from auth header
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'POST') {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ error: 'Missing sessionId' });

    // Verify ownership
    const { data: session } = await supabase.from('sessions').select('id, share_token').eq('id', sessionId).eq('user_id', user.id).single();
    if (!session) return res.status(404).json({ error: 'Session not found' });

    // Generate token if it doesn't exist
    let shareToken = session.share_token;
    if (!shareToken) {
      shareToken = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
      const { error: updateError } = await supabase.from('sessions')
        .update({ share_token: shareToken, shared_at: new Date().toISOString() })
        .eq('id', sessionId)
        .eq('user_id', user.id);
      if (updateError) return res.status(500).json({ error: 'Failed to update share token' });
    }

    return res.status(200).json({ shareToken });
  }

  if (req.method === 'DELETE') {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ error: 'Missing sessionId' });

    const { error: updateError } = await supabase.from('sessions')
      .update({ share_token: null, shared_at: null })
      .eq('id', sessionId)
      .eq('user_id', user.id);

    if (updateError) return res.status(500).json({ error: 'Failed to revoke share token' });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
