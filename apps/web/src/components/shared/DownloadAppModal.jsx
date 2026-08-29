import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { showToast } from '@/lib/utils';

export default function DownloadAppModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const apkUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/nuracare.apk`
    : '/nuracare.apk';

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(apkUrl)}&color=166534&bgcolor=f0fdf4`;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(apkUrl);
      setCopied(true);
      showToast('Download link copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fdf9 100%)',
          borderRadius: '24px',
          maxWidth: '520px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(22, 101, 52, 0.25), 0 0 0 1px rgba(34, 197, 94, 0.15)',
          overflow: 'hidden',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '24px 28px 16px',
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 101, 52, 0.03) 100%)',
          borderBottom: '1px solid rgba(34, 197, 94, 0.15)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #22c55e, #15803d)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 4px 12px rgba(34, 197, 94, 0.35)'
            }}>
              <Icons.Smartphone size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '19px', fontWeight: 700, color: 'var(--text-main, #14532d)' }}>
                Get NuraCare Mobile
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted, #4b5563)' }}>
                Android APK Direct Download
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'rgba(0,0,0,0.05)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#6b7280'
            }}
          >
            <Icons.X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px 28px' }}>
          {/* Main Action Banner */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            background: '#f0fdf4',
            borderRadius: '16px',
            padding: '20px',
            border: '1px dashed #86efac',
            marginBottom: '20px'
          }}>
            <div style={{
              display: 'flex',
              gap: '20px',
              alignItems: 'center',
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              {/* QR Code */}
              <div style={{
                background: 'white',
                padding: '8px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                <img 
                  src={qrCodeUrl} 
                  alt="Scan to Download NuraCare APK" 
                  style={{ width: '120px', height: '120px', borderRadius: '8px', display: 'block' }}
                />
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#15803d', marginTop: '4px' }}>
                  Scan on Phone
                </span>
              </div>

              {/* Download Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: '1', minWidth: '180px' }}>
                <a 
                  href="/nuracare.apk" 
                  download="nuracare.apk"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    backgroundColor: '#16a34a',
                    color: 'white',
                    padding: '12px 18px',
                    borderRadius: '12px',
                    fontWeight: 600,
                    fontSize: '14px',
                    textDecoration: 'none',
                    boxShadow: '0 4px 14px rgba(22, 163, 74, 0.4)',
                    transition: 'transform 0.15s ease, background-color 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#15803d'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
                >
                  <Icons.Download size={18} />
                  <span>Download .APK (Android)</span>
                </a>

                <button 
                  onClick={handleCopyLink}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    backgroundColor: 'white',
                    color: '#374151',
                    padding: '10px 16px',
                    borderRadius: '12px',
                    border: '1px solid #d1d5db',
                    fontWeight: 500,
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  {copied ? <Icons.Check size={16} color="#16a34a" /> : <Icons.Copy size={16} />}
                  <span>{copied ? 'Link Copied!' : 'Copy Direct Link'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Store status pills */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <div style={{
              flex: 1,
              padding: '10px 12px',
              borderRadius: '10px',
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <Icons.Play size={18} color="#10b981" />
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#111827' }}>Google Play</div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>Review in progress</div>
              </div>
            </div>

            <div style={{
              flex: 1,
              padding: '10px 12px',
              borderRadius: '10px',
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <Icons.Apple size={18} color="#9ca3af" />
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#111827' }}>Apple App Store</div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>Coming Soon</div>
              </div>
            </div>
          </div>

          {/* How to Install Guide */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '14px',
            padding: '14px 16px'
          }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: 700, color: '#374151', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Icons.HelpCircle size={15} color="#16a34a" />
              Quick Android Install Guide:
            </h4>
            <ol style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#4b5563', lineHeight: '1.7' }}>
              <li>Tap <strong>Download .APK</strong> above or scan the QR code.</li>
              <li>When the download finishes, tap the notification or open <code>nuracare.apk</code> from your Downloads folder.</li>
              <li>If your browser asks for permission to install apps, tap <strong>Settings</strong> and turn on <em>"Allow from this source"</em>.</li>
              <li>Tap <strong>Install</strong>, then open NuraCare to start your wellness journey!</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 28px',
          background: '#f9fafb',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '12px',
          color: '#6b7280'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Icons.ShieldCheck size={14} color="#16a34a" /> Verified & Safe Package
          </span>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#4b5563',
              fontWeight: 600,
              cursor: 'pointer',
              padding: '4px 8px'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
