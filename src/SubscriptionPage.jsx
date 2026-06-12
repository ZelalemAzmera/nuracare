import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { showToast } from './App';

export default function SubscriptionPage({ profile, onBack }) {
  const [currency, setCurrency] = useState('ETB'); // 'ETB' or 'USD'
  const [loading, setLoading] = useState(false);

  const plans = {
    ETB: [
      { name: 'Basic', price: 'Free', period: '', features: ['AI Chat Access', 'Daily Check-ins', 'Local Content'], btn: 'Current Plan' },
      { name: 'Premium', price: '300', period: '/month', features: ['Unlimited Chat', 'Priority Support', 'Full Health History', 'Dietary Coaching'], btn: 'Upgrade with Chapa' },
      { name: 'Premium', price: '300', period: '/month', features: ['Unlimited Chat', 'Priority Support', 'Full Health History', 'Dietary Coaching'], btn: 'Upgrade with SantimPay' }
    ],
    USD: [
      { name: 'Basic', price: 'Free', period: '', features: ['AI Chat Access', 'Daily Check-ins', 'Local Content'], btn: 'Current Plan' },
      { name: 'Premium', price: '$5', period: '/month', features: ['Unlimited Chat', 'Priority Support', 'Full Health History', 'Dietary Coaching'], btn: 'Upgrade with Stripe' }
    ]
  };

  const handleCheckout = async (plan, gateway) => {
    if (plan.price === 'Free') return;
    
    setLoading(true);
    try {
      if (gateway === 'Chapa') {
        const res = await fetch('/api/chapa-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: profile.email || 'user@example.com', 
            name: profile.name || 'User',
            amount: 300
          })
        });
        const data = await res.json();
        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
        } else {
          throw new Error('No checkout URL returned');
        }
      } else if (gateway === 'SantimPay') {
        showToast('SantimPay integration coming soon! Please use Chapa for now.', 'error');
      } else if (gateway === 'Stripe') {
        const res = await fetch('/api/stripe-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: profile.email })
        });
        const data = await res.json();
        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
        } else {
          throw new Error('No checkout URL returned');
        }
      }
    } catch (e) {
      console.error(e);
      showToast(`Payment initiation failed for ${gateway}.`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page active">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={onBack} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 8 }}><Icons.ArrowLeft size={24}/></button>
        <div>
          <h1 className="page-title">NuraCare Premium</h1>
          <p className="page-subtitle">Unlock advanced health tracking and unlimited AI coaching</p>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
        <div style={{ background: 'var(--border)', padding: 4, borderRadius: 24, display: 'flex' }}>
          <button 
            onClick={() => setCurrency('ETB')} 
            style={{ padding: '8px 24px', borderRadius: 20, border: 'none', background: currency === 'ETB' ? 'var(--white)' : 'transparent', color: currency === 'ETB' ? 'var(--text)' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', boxShadow: currency === 'ETB' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}
          >
            Local (ETB)
          </button>
          <button 
            onClick={() => setCurrency('USD')} 
            style={{ padding: '8px 24px', borderRadius: 20, border: 'none', background: currency === 'USD' ? 'var(--white)' : 'transparent', color: currency === 'USD' ? 'var(--text)' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', boxShadow: currency === 'USD' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}
          >
            International (USD)
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
        {plans[currency].map((plan, i) => (
          <div key={i} className="dash-card" style={{ width: '100%', maxWidth: 320, padding: 32, display: 'flex', flexDirection: 'column', border: plan.price !== 'Free' ? '2px solid var(--green)' : '1px solid var(--border)' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: 20 }}>{plan.name}</h3>
            <div style={{ marginBottom: 24 }}>
              <span style={{ fontSize: 36, fontWeight: 800 }}>{currency === 'ETB' && plan.price !== 'Free' ? 'Birr ' : ''}{plan.price}</span>
              <span style={{ color: 'var(--text-muted)' }}>{plan.period}</span>
            </div>
            
            <div style={{ flex: 1, marginBottom: 32 }}>
              {plan.features.map((f, j) => (
                <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, fontSize: 14 }}>
                  <Icons.CheckCircle2 size={18} color="var(--green)" /> {f}
                </div>
              ))}
            </div>

            <button 
              onClick={() => handleCheckout(plan, plan.btn.split(' ').pop())}
              disabled={plan.price === 'Free' || loading}
              style={{ 
                width: '100%', padding: 16, borderRadius: 12, border: 'none', fontWeight: 600, cursor: plan.price === 'Free' ? 'default' : 'pointer',
                background: plan.price === 'Free' ? 'var(--bg)' : 'var(--green)',
                color: plan.price === 'Free' ? 'var(--text-muted)' : 'white'
              }}
            >
              {loading && plan.price !== 'Free' ? 'Processing...' : plan.btn}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
