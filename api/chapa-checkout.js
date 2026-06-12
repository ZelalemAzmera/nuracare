// api/chapa-checkout.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, name, amount } = req.body;
  const CHAPA_SECRET = process.env.CHAPA_SECRET_KEY;
  
  if (!CHAPA_SECRET) {
    // For local dev simulation if no key is provided
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
