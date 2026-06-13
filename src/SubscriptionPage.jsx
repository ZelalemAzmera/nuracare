import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { showToast } from './App';

export default function SubscriptionPage({ profile, onBack, onNavigateEnterprise }) {
  const [loading, setLoading] = useState(false);
  const isEthiopia = profile?.location?.code === 'ET' || profile?.location?.country === 'Ethiopia';

  const handleCheckout = async (gateway, amount = 300) => {
    setLoading(true);
    try {
      if (gateway === 'Chapa') {
        const res = await fetch('/api/payment?action=chapa-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: profile?.email || 'user@nuracare.com', 
            name: profile?.name || 'User',
            amount: amount
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
        const res = await fetch('/api/payment?action=stripe-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: profile?.email || 'user@nuracare.com' })
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
        <button onClick={onBack} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 8, color: 'var(--text-muted)' }}><Icons.ArrowLeft size={24}/></button>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>NuraCare Plans</h1>
          <p className="page-subtitle" style={{ margin: 0 }}>Choose the plan that fits your health journey</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center', marginTop: 40, paddingBottom: 40 }}>
        {/* Free Plan */}
        <div className="dash-card" style={{ width: '100%', maxWidth: 280, padding: 32, display: 'flex', flexDirection: 'column', border: '1px solid var(--border)' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: 20 }}>Basic</h3>
          <div style={{ marginBottom: 24 }}>
            <span style={{ fontSize: 36, fontWeight: 800 }}>Free</span>
          </div>
          <div style={{ flex: 1, marginBottom: 32 }}>
            {['AI Chat Access', 'Daily Check-ins', 'Local Content'].map((f, j) => (
              <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, fontSize: 14 }}>
                <Icons.CheckCircle2 size={18} color="var(--green)" /> {f}
              </div>
            ))}
          </div>
          <button style={{ width: '100%', padding: 16, borderRadius: 12, border: 'none', fontWeight: 600, background: 'var(--bg)', color: 'var(--text-muted)' }} disabled>
            Current Plan
          </button>
        </div>

        {/* Pro Plan */}
        <div className="dash-card" style={{ width: '100%', maxWidth: 280, padding: 32, display: 'flex', flexDirection: 'column', border: '1px solid var(--border)' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: 20 }}>Pro</h3>
          <div style={{ marginBottom: 24 }}>
            <span style={{ fontSize: 36, fontWeight: 800 }}>{isEthiopia ? 'Birr 150' : '$5'}</span>
            <span style={{ color: 'var(--text-muted)', display: 'block' }}>/month</span>
          </div>
          <div style={{ flex: 1, marginBottom: 32 }}>
            {['Unlimited Chat', 'Full Health History', 'Priority Support'].map((f, j) => (
              <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, fontSize: 14 }}>
                <Icons.CheckCircle2 size={18} color="var(--green)" /> {f}
              </div>
            ))}
          </div>
          <button onClick={() => handleCheckout(isEthiopia ? 'Chapa' : 'Stripe', isEthiopia ? 150 : 5)} disabled={loading} style={{ width: '100%', padding: 16, borderRadius: 12, border: '1px solid var(--green)', fontWeight: 600, cursor: 'pointer', background: 'transparent', color: 'var(--green)' }}>
            Upgrade to Pro
          </button>
        </div>

        {/* Premium Plan */}
        <div className="dash-card" style={{ width: '100%', maxWidth: 280, padding: 32, paddingTop: 16, display: 'flex', flexDirection: 'column', border: '2px solid var(--green)' }}>
          <div style={{ alignSelf: 'center', background: 'var(--green)', color: 'white', padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 'bold', marginBottom: 16, whiteSpace: 'nowrap' }}>RECOMMENDED</div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: 20 }}>Premium</h3>
          <div style={{ marginBottom: 24 }}>
            <span style={{ fontSize: 36, fontWeight: 800 }}>{isEthiopia ? 'Birr 300' : '$10'}</span>
            <span style={{ color: 'var(--text-muted)', display: 'block' }}>/month</span>
          </div>
          <div style={{ flex: 1, marginBottom: 32 }}>
            {['Unlimited Chat', 'Priority Support', 'Full Health History', 'Dietary Coaching', 'Wearable Sync'].map((f, j) => (
              <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, fontSize: 14 }}>
                <Icons.CheckCircle2 size={18} color="var(--green)" /> {f}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {isEthiopia ? (
              <>
                <button onClick={() => handleCheckout('Chapa', 300)} disabled={loading} style={{ width: '100%', padding: 12, borderRadius: 12, border: 'none', fontWeight: 600, cursor: 'pointer', background: 'var(--green)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {loading ? 'Processing...' : 'Pay with Chapa (ETB)'}
                </button>
                <button onClick={() => handleCheckout('SantimPay', 300)} disabled={loading} style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid var(--green)', fontWeight: 600, cursor: 'pointer', background: 'transparent', color: 'var(--green)' }}>
                  Pay with Telebirr / CBE
                </button>
              </>
            ) : (
              <>
                <button onClick={() => handleCheckout('Stripe', 10)} disabled={loading} style={{ width: '100%', padding: 12, borderRadius: 12, border: 'none', fontWeight: 600, cursor: 'pointer', background: '#635BFF', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {loading ? 'Processing...' : 'Pay with Stripe (USD)'}
                </button>
                <button onClick={() => handleCheckout('Stripe', 10)} disabled={loading} style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid var(--text)', fontWeight: 600, cursor: 'pointer', background: '#003087', color: 'white' }}>
                  Pay with PayPal
                </button>
              </>
            )}
          </div>
        </div>

        {/* Enterprise Plan */}
        <div className="dash-card" style={{ width: '100%', maxWidth: 280, padding: 32, display: 'flex', flexDirection: 'column', border: '1px solid var(--border)' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: 20 }}>Enterprise</h3>
          <div style={{ marginBottom: 24 }}>
            <span style={{ fontSize: 36, fontWeight: 800 }}>Custom</span>
          </div>
          <div style={{ flex: 1, marginBottom: 32 }}>
            {['B2B Portal Access', 'Employee Health Tracking', 'Custom Analytics', 'Dedicated Manager'].map((f, j) => (
              <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, fontSize: 14 }}>
                <Icons.CheckCircle2 size={18} color="var(--text-muted)" /> {f}
              </div>
            ))}
          </div>
          <button onClick={() => showToast('Enterprise plans require a custom setup. Please contact sales at enterprise@nuracare.com', 'success')} style={{ width: '100%', padding: 16, borderRadius: 12, border: '1px solid var(--text)', fontWeight: 600, cursor: 'pointer', background: 'var(--bg)', color: 'var(--text)' }}>
            Contact Sales
          </button>
        </div>
      </div>
    </div>
  );
}
