import React, { useState } from 'react';
import * as Icons from 'lucide-react';

export default function DataDeletionRequest() {
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    // Simulating deletion dispatch
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1200);
  };

  return (
    <div style={{
      maxWidth: '720px',
      margin: '40px auto',
      padding: '32px 24px',
      fontFamily: 'Inter, system-ui, sans-serif',
      color: '#0f172a'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '28px',
          backgroundColor: '#fef2f2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px auto'
        }}>
          <Icons.UserX size={28} color="#dc2626" />
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>
          NuraCare Account & Health Data Deletion
        </h1>
        <p style={{ fontSize: '15px', color: '#64748b', lineHeight: 1.6 }}>
          Google Play & Ethiopian Data Protection Proclamation No. 1321/2024 Compliance Portal.
        </p>
      </div>

      {submitted ? (
        <div style={{
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '16px',
          padding: '24px',
          textAlign: 'center'
        }}>
          <Icons.CheckCircle2 size={40} color="#16a34a" style={{ margin: '0 auto 12px auto' }} />
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#166534', marginBottom: '8px' }}>
            Deletion Request Received
          </h2>
          <p style={{ fontSize: '14px', color: '#15803d', lineHeight: 1.6 }}>
            A confirmation link has been sent to <strong>{email}</strong>. Once verified, all associated health metrics, recovery logs, and account records will be permanently erased from our encrypted databases within 48 hours.
          </p>
        </div>
      ) : (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          padding: '28px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)'
        }}>
          <div style={{
            backgroundColor: '#fffbeb',
            border: '1px solid #fef3c7',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
            fontSize: '13px',
            color: '#92400e',
            lineHeight: 1.6
          }}>
            <strong>Important Notice:</strong> Deletion is irreversible. All recorded symptoms, sleep data, medication reminders, and AI conversation context will be permanently purged in accordance with our data retention schedule.
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>
                Account Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '15px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>
                Reason for Deletion (Optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Let us know how we can improve..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '15px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              style={{
                width: '100%',
                backgroundColor: '#dc2626',
                color: '#ffffff',
                padding: '14px',
                borderRadius: '12px',
                border: 'none',
                fontWeight: 700,
                fontSize: '15px',
                cursor: loading || !email ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {loading ? 'Submitting Request...' : 'Submit Permanent Deletion Request'}
            </button>
          </form>
        </div>
      )}

      {/* Footer Info */}
      <div style={{ textAlign: 'center', marginTop: '32px', fontSize: '12px', color: '#94a3b8' }}>
        NuraCare Data Protection Office • Addis Ababa, Ethiopia • privacy@nuracare.pro.et
      </div>
    </div>
  );
}
