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
          amount: amount,
          planName: paymentModal.plan
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

  const cardStyle = {
    flex: 1,
    minWidth: 220,
    maxWidth: 280,
    padding: 24,
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid var(--border)',
    borderRadius: 24,
    background: 'var(--bg)',
    height: '100%'
  };

  const activeCardStyle = {
    ...cardStyle,
    border: '2px solid var(--green)',
    background: 'var(--bg)',
    position: 'relative'
  };

  return (
    <div className="page active" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'auto', padding: 24 }}>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0, marginBottom: 24 }}>
        <button onClick={onBack} style={{ background: 'var(--bg)', border: '1px solid var(--border)', cursor: 'pointer', padding: 8, borderRadius: '50%', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icons.ArrowLeft size={20}/>
        </button>
        <div>
          <h1 className="page-title" style={{ margin: 0, fontSize: 24 }}>NuraCare Plans</h1>
          <p className="page-subtitle" style={{ margin: 0, fontSize: 14 }}>Choose the plan that fits your health journey</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'stretch' }}>
        {/* Free Plan */}
        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: 20 }}>Basic</h3>
          <div style={{ marginBottom: 24 }}>
            <span style={{ fontSize: 36, fontWeight: 800 }}>Free</span>
          </div>
          <div style={{ flex: 1, marginBottom: 32 }}>
            {['AI Chat Access', 'Daily Check-ins', 'Local Content'].map((f, j) => (
              <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12, fontSize: 14 }}>
                <Icons.CheckCircle2 size={18} color="var(--green)" style={{ flexShrink: 0, marginTop: 2 }} /> {f}
              </div>
            ))}
          </div>
          <button style={{ width: '100%', padding: 14, borderRadius: 12, border: 'none', fontWeight: 600, background: 'var(--border)', color: 'var(--text-muted)' }} disabled>
            Current Plan
          </button>
        </div>

        {/* Pro Plan */}
        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: 20 }}>Pro</h3>
          <div style={{ marginBottom: 24 }}>
            <span style={{ fontSize: 36, fontWeight: 800 }}>Birr 150 <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 'normal' }}>or $3</span></span>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 14 }}>/month</span>
          </div>
          <div style={{ flex: 1, marginBottom: 32 }}>
            {['Unlimited Chat', 'Full Health History', 'Priority Support'].map((f, j) => (
              <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12, fontSize: 14 }}>
                <Icons.CheckCircle2 size={18} color="var(--green)" style={{ flexShrink: 0, marginTop: 2 }} /> {f}
              </div>
            ))}
          </div>
          <button onClick={() => setPaymentModal({ isOpen: true, plan: 'Pro', amount: 150 })} style={{ width: '100%', padding: 14, borderRadius: 12, border: '1px solid var(--green)', fontWeight: 600, cursor: 'pointer', background: 'transparent', color: 'var(--green)', transition: 'all 0.2s' }}>
            Upgrade to Pro
          </button>
        </div>

        {/* Premium Plan */}
        <div style={activeCardStyle}>
          <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'var(--green)', color: 'white', padding: '4px 16px', borderRadius: 20, fontSize: 12, fontWeight: 'bold', whiteSpace: 'nowrap', zIndex: 10 }}>RECOMMENDED</div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: 20 }}>Premium</h3>
          <div style={{ marginBottom: 24 }}>
            <span style={{ fontSize: 36, fontWeight: 800 }}>Birr 300 <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 'normal' }}>or $5</span></span>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 14 }}>/month</span>
          </div>
          <div style={{ flex: 1, marginBottom: 32 }}>
            {['Unlimited Chat', 'Priority Support', 'Full Health History', 'Dietary Coaching', 'Wearable Sync'].map((f, j) => (
              <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12, fontSize: 14 }}>
                <Icons.CheckCircle2 size={18} color="var(--green)" style={{ flexShrink: 0, marginTop: 2 }} /> {f}
              </div>
            ))}
          </div>
          <button onClick={() => setPaymentModal({ isOpen: true, plan: 'Premium', amount: 300 })} style={{ width: '100%', padding: 14, borderRadius: 12, border: 'none', fontWeight: 600, cursor: 'pointer', background: 'var(--green)', color: 'white', transition: 'all 0.2s' }}>
            Upgrade to Premium
          </button>
        </div>

        {/* Enterprise Plan */}
        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: 20 }}>Enterprise</h3>
          <div style={{ marginBottom: 24 }}>
            <span style={{ fontSize: 36, fontWeight: 800 }}>Custom</span>
          </div>
          <div style={{ flex: 1, marginBottom: 32 }}>
            {['B2B Portal Access', 'Employee Health Tracking', 'Custom Analytics', 'Dedicated Manager'].map((f, j) => (
              <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12, fontSize: 14 }}>
                <Icons.CheckCircle2 size={18} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: 2 }} /> {f}
              </div>
            ))}
          </div>
          <button onClick={() => showToast('Enterprise plans require a custom setup. Please contact sales at enterprise@nuracare.com', 'success')} style={{ width: '100%', padding: 14, borderRadius: 12, border: '1px solid var(--text)', fontWeight: 600, cursor: 'pointer', background: 'transparent', color: 'var(--text)' }}>
            Contact Sales
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      {paymentModal.isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 24, animation: 'fadeIn 0.2s ease-out' }}>
          <div style={{ background: 'var(--white)', padding: 32, borderRadius: 24, width: '100%', maxWidth: 420, boxShadow: '0 20px 40px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 22, color: 'var(--text)', fontWeight: 700 }}>Select Payment</h2>
              <button onClick={() => !loading && setPaymentModal({ isOpen: false, plan: null, amount: 0 })} style={{ background: 'var(--bg)', border: 'none', cursor: 'pointer', borderRadius: '50%', padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icons.X size={20} color="var(--text-muted)" />
              </button>
            </div>
            
            <p style={{ color: 'var(--text-muted)', marginBottom: 28, lineHeight: 1.6, fontSize: 15 }}>
              You are upgrading to the <strong style={{ color: 'var(--green)' }}>{paymentModal.plan}</strong> plan. Please choose your preferred payment gateway:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <button 
                onClick={() => handleCheckout('Chapa', paymentModal.amount)} 
                disabled={loading} 
                style={{ width: '100%', padding: '16px 20px', borderRadius: 16, border: 'none', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', background: 'var(--green)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, fontSize: 16, transition: 'all 0.2s' }}
              >
                {loading ? <Icons.Loader className="spin" size={20} /> : <Icons.CreditCard size={20} />}
                Pay with Chapa (ETB)
              </button>
              
              <button 
                onClick={() => handleCheckout('Stripe', paymentModal.amount)} 
                disabled={loading} 
                style={{ width: '100%', padding: '16px 20px', borderRadius: 16, border: '2px solid var(--border)', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', background: 'var(--bg)', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, fontSize: 16, transition: 'all 0.2s' }}
              >
                {loading ? <Icons.Loader className="spin" size={20} /> : <Icons.Globe size={20} />}
                Pay with Stripe (USD)
              </button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
