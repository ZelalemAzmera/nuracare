// api/chapa-verify.js
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const tx_ref = req.query.tx_ref || (req.body && req.body.tx_ref);
  const CHAPA_SECRET = process.env.CHAPA_SECRET_KEY;

  if (!tx_ref) {
    return res.status(400).json({ error: 'Missing tx_ref' });
  }

  if (!CHAPA_SECRET) {
    console.log(`[Chapa Verify Simulation] Verified tx_ref: ${tx_ref}`);
    return res.status(200).json({ status: 'success', message: 'Simulated verification' });
  }

  try {
    const verifyRes = await fetch(`https://api.chapa.co/v1/transaction/verify/${tx_ref}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CHAPA_SECRET}`
      }
    });

    const data = await verifyRes.json();
    if (data.status === 'success') {
      const email = data.data.email;
      
      // Update user to premium in Supabase
      const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
      
      if (email) {
        await supabase
          .from('users')
          .update({ is_premium: true })
          .eq('email', email);
      }

      return res.status(200).json({ status: 'success', message: 'Payment verified' });
    } else {
      return res.status(400).json({ status: 'failed', message: 'Verification failed' });
    }
  } catch (err) {
    console.error('Chapa Verify Error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
