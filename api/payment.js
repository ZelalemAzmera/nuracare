import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

async function handleChapaCheckout(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, name, amount } = req.body;
  const CHAPA_SECRET = process.env.CHAPA_SECRET_KEY;
  
  if (!CHAPA_SECRET) {
    return res.status(200).json({ checkoutUrl: 'https://checkout.chapa.co/checkout/test-url-simulation' });
  }

  const tx_ref = `NURA-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  try {
    const chapaRes = await fetch('https://api.chapa.co/v1/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CHAPA_SECRET}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: amount || 300,
        currency: 'ETB',
        email: email || 'user@nuracare.com',
        first_name: name || 'User',
        tx_ref: tx_ref,
        callback_url: `https://${req.headers.host}/api/chapa-verify?tx_ref=${tx_ref}`,
        return_url: `https://${req.headers.host}/?payment=success`,
        customization: {
          title: 'NuraCare Premium',
          description: 'Unlock advanced health tracking and unlimited AI coaching.'
        }
      })
    });

    const data = await chapaRes.json();
    if (data.status === 'success') {
      return res.status(200).json({ checkoutUrl: data.data.checkout_url });
    } else {
      throw new Error(data.message || 'Chapa initialization failed');
    }
  } catch (err) {
    console.error('Chapa Checkout Error:', err);
    return res.status(500).json({ error: 'Payment initialization failed.' });
  }
}

async function handleChapaVerify(req, res) {
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

async function handleStripeCheckout(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;
  const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;

  if (!STRIPE_SECRET) {
    return res.status(200).json({ checkoutUrl: 'https://checkout.stripe.com/test-url-simulation' });
  }

  const stripe = new Stripe(STRIPE_SECRET);

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'NuraCare Premium',
              description: 'Unlock advanced health tracking and unlimited AI coaching.'
            },
            unit_amount: 500, // $5.00
            recurring: {
              interval: 'month'
            }
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `https://${req.headers.host}/?payment=success`,
      cancel_url: `https://${req.headers.host}/?payment=cancel`,
    });

    return res.status(200).json({ checkoutUrl: session.url });
  } catch (err) {
    console.error('Stripe Checkout Error:', err);
    return res.status(500).json({ error: 'Payment initialization failed.' });
  }
}

export default async function handler(req, res) {
  const action = req.query.action || (req.body && req.body.action);

  switch (action) {
    case 'chapa-checkout':
      return handleChapaCheckout(req, res);
    case 'chapa-verify':
      return handleChapaVerify(req, res);
    case 'stripe-checkout':
      return handleStripeCheckout(req, res);
    default:
      return res.status(400).json({ error: 'Invalid or missing action parameter' });
  }
}
