import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { showToast } from './App';

export default function SubscriptionPage({ profile, onBack, onNavigateEnterprise }) {
  const [loading, setLoading] = useState(false);
  const [paymentModal, setPaymentModal] = useState({ isOpen: false, plan: null, amount: 0 });

  const handleCheckout = async (gateway, amount) => {
    setLoading(true);
    try {
      let action = gateway === 'Chapa' ? 'chapa-checkout' : 'stripe-checkout';
      const res = await fetch(`/api/payment?action=${action}`, {
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
        throw new Error(data.error || 'No checkout URL returned');
      }
    } catch (e) {
      console.error(e);
      showToast(`Payment initiation failed for ${gateway}: ${e.message}`, 'error');
    } finally {
      setLoading(false);
      setPaymentModal({ isOpen: false, plan: null, amount: 0 });
    }
  };

  return (
    <div className="page active" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
        <button onClick={onBack} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 8, color: 'var(--text-muted)' }}><Icons.ArrowLeft size={24}/></button>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>NuraCare Plans</h1>
          <p className="page-subtitle" style={{ margin: 0 }}>Choose the plan that fits your health journey</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'nowrap', overflowX: 'auto', paddingBottom: 40, marginTop: 40, flex: 1, alignItems: 'flex-start' }}>
        {/* Free Plan */}
        <div className="dash-card" style={{ flexShrink: 0, width: '280px', padding: 32, display: 'flex', flexDirection: 'column', border: '1px solid var(--border)', height: '100%' }}>
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
        <div className="dash-card" style={{ flexShrink: 0, width: '280px', padding: 32, display: 'flex', flexDirection: 'column', border: '1px solid var(--border)', height: '100%' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: 20 }}>Pro</h3>
          <div style={{ marginBottom: 24 }}>
            <span style={{ fontSize: 36, fontWeight: 800 }}>Birr 150 <span style={{ fontSize: 16, color: 'var(--text-muted)', fontWeight: 'normal' }}>or $3</span></span>
            <span style={{ color: 'var(--text-muted)', display: 'block' }}>/month</span>
          </div>
          <div style={{ flex: 1, marginBottom: 32 }}>
            {['Unlimited Chat', 'Full Health History', 'Priority Support'].map((f, j) => (
              <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, fontSize: 14 }}>
                <Icons.CheckCircle2 size={18} color="var(--green)" /> {f}
              </div>
            ))}
          </div>
          <button onClick={() => setPaymentModal({ isOpen: true, plan: 'Pro', amount: 150 })} style={{ width: '100%', padding: 16, borderRadius: 12, border: '1px solid var(--green)', fontWeight: 600, cursor: 'pointer', background: 'transparent', color: 'var(--green)' }}>
            Upgrade to Pro
          </button>
        </div>

        {/* Premium Plan */}
        <div className="dash-card" style={{ flexShrink: 0, width: '280px', padding: 32, paddingTop: 16, display: 'flex', flexDirection: 'column', border: '2px solid var(--green)', height: '100%' }}>
          <div style={{ alignSelf: 'center', background: 'var(--green)', color: 'white', padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 'bold', marginBottom: 16, whiteSpace: 'nowrap' }}>RECOMMENDED</div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: 20 }}>Premium</h3>
          <div style={{ marginBottom: 24 }}>
            <span style={{ fontSize: 36, fontWeight: 800 }}>Birr 300 <span style={{ fontSize: 16, color: 'var(--text-muted)', fontWeight: 'normal' }}>or $5</span></span>
            <span style={{ color: 'var(--text-muted)', display: 'block' }}>/month</span>
          </div>
          <div style={{ flex: 1, marginBottom: 32 }}>
            {['Unlimited Chat', 'Priority Support', 'Full Health History', 'Dietary Coaching', 'Wearable Sync'].map((f, j) => (
              <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, fontSize: 14 }}>
                <Icons.CheckCircle2 size={18} color="var(--green)" /> {f}
              </div>
            ))}
          </div>
          <button onClick={() => setPaymentModal({ isOpen: true, plan: 'Premium', amount: 300 })} style={{ width: '100%', padding: 16, borderRadius: 12, border: 'none', fontWeight: 600, cursor: 'pointer', background: 'var(--green)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            Upgrade to Premium
          </button>
        </div>

        {/* Enterprise Plan */}
        <div className="dash-card" style={{ flexShrink: 0, width: '280px', padding: 32, display: 'flex', flexDirection: 'column', border: '1px solid var(--border)', height: '100%' }}>
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

      {paymentModal.isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }}>
          <div className="dash-card" style={{ background: 'var(--bg)', padding: 32, borderRadius: 24, width: '100%', maxWidth: 400 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ margin: 0, fontSize: 20 }}>Select Payment Method</h3>
              <button onClick={() => !loading && setPaymentModal({ isOpen: false, plan: null, amount: 0 })} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><Icons.X size={24} color="var(--text-muted)" /></button>
            </div>
            
            <p style={{ color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.5 }}>
              You are upgrading to the <strong>{paymentModal.plan}</strong> plan. Please choose your preferred payment gateway:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button 
                onClick={() => handleCheckout('Chapa', paymentModal.amount)} 
                disabled={loading} 
                style={{ width: '100%', padding: 16, borderRadius: 12, border: 'none', fontWeight: 600, cursor: 'pointer', background: 'var(--green)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                {loading ? 'Processing...' : `Pay with Chapa (ETB)`}
              </button>
              
              <button 
                onClick={() => handleCheckout('Stripe', paymentModal.amount)} 
                disabled={loading} 
                style={{ width: '100%', padding: 16, borderRadius: 12, border: '1px solid var(--text)', fontWeight: 600, cursor: 'pointer', background: 'transparent', color: 'var(--text)' }}
              >
                Pay with Stripe (USD)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
