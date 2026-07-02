// api/stripe-webhook.js
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export const config = {
  api: {
    bodyParser: false,
  },
};

async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;
  const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

  if (!STRIPE_SECRET || !STRIPE_WEBHOOK_SECRET) {
    return res.status(200).send('Simulated webhook processed');
  }

  const stripe = new Stripe(STRIPE_SECRET);
  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const email = session.customer_details?.email;

    if (email) {
      const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
      
      await supabase
        .from('users')
        .update({ is_premium: true })
        .eq('email', email);
    }
  }

  res.status(200).json({ received: true });
}
