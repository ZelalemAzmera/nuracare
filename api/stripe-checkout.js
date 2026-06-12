// api/stripe-checkout.js
import Stripe from 'stripe';

export default async function handler(req, res) {
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
