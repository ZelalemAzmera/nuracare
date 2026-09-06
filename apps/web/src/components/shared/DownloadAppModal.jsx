import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { showToast } from '@/lib/utils';

export default function DownloadAppModal({ isOpen = true, onClose }) {
  const [copied, setCopied] = useState(false);
  const [useCdnSource, setUseCdnSource] = useState(true);

  if (!isOpen) return null;

  // Direct standalone APK binary links (No Expo Go or Expo app needed)
  const directCdnApkUrl = 'https://expo.dev/artifacts/eas/C-UgZsC__wqw56esa8iN1OXISQYLfOgSFNiqU0O70lY.apk';
  
  const localApkUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/nuracare.apk`
    : '/nuracare.apk';

  const activeDownloadUrl = useCdnSource ? directCdnApkUrl : localApkUrl;

  // QR code encodes the direct .apk link so scanning it immediately triggers Android's native APK download
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(activeDownloadUrl)}&color=166534&bgcolor=f0fdf4`;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(activeDownloadUrl);
      setCopied(true);
      showToast('Direct APK link copied to clipboard!', 'success');
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
          {/* No Expo Go Required Guarantee Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)',
            border: '1.5px solid #86efac',
            borderRadius: '14px',
            padding: '12px 16px',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <Icons.CheckCircle2 size={24} color="#16a34a" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#14532d' }}>
                No Expo Go App Required!
              </div>
              <div style={{ fontSize: '12px', color: '#166534', marginTop: '2px', lineHeight: '1.4' }}>
                This is a standalone native Android app (.APK). It installs directly on any Android device without installing any extra software.
              </div>
            </div>
          </div>

          {/* Main Action Banner */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            background: '#f8fafc',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #e2e8f0',
            marginBottom: '20px'
          }}>
            <div style={{
              display: 'flex',
              gap: '20px',
              alignItems: 'center',
              flexWrap: 'wrap',
              justifyContent: 'center',
              width: '100%'
            }}>
              {/* QR Code */}
              <div style={{
                background: 'white',
                padding: '10px',
                borderRadius: '14px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                <img 
                  src={qrCodeUrl} 
                  alt="Scan to Download NuraCare APK" 
                  style={{ width: '130px', height: '130px', borderRadius: '8px', display: 'block' }}
                />
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#15803d', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Icons.QrCode size={12} /> Scan with Camera
                </span>
                <span style={{ fontSize: '10px', color: '#64748b' }}>Instant Phone Download</span>
              </div>

              {/* Download Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: '1', minWidth: '200px' }}>
                <a 
                  href={directCdnApkUrl} 
                  download="nuracare.apk"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    backgroundColor: '#16a34a',
                    color: 'white',
                    padding: '12px 18px',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '14px',
                    textDecoration: 'none',
                    boxShadow: '0 4px 14px rgba(22, 163, 74, 0.4)',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#15803d'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
                >
                  <Icons.Download size={18} />
                  <span>Download .APK (Fast CDN)</span>
                </a>

                <a 
                  href={localApkUrl} 
                  download="nuracare.apk"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    backgroundColor: '#ffffff',
                    color: '#15803d',
                    padding: '10px 16px',
                    borderRadius: '12px',
                    border: '1.5px solid #86efac',
                    fontWeight: 600,
                    fontSize: '13px',
                    textDecoration: 'none',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0fdf4'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                >
                  <Icons.HardDriveDownload size={16} />
                  <span>Download from Server (.APK)</span>
                </a>

                <button 
                  onClick={handleCopyLink}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    backgroundColor: '#f1f5f9',
                    color: '#334155',
                    padding: '9px 16px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    fontWeight: 600,
                    fontSize: '12.5px',
                    cursor: 'pointer'
                  }}
                >
                  {copied ? <Icons.Check size={15} color="#16a34a" /> : <Icons.Copy size={15} />}
                  <span>{copied ? 'Direct Link Copied!' : 'Copy Direct APK Link'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Store status pills */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '18px' }}>
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
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '14px 16px'
          }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Icons.HelpCircle size={16} color="#16a34a" />
              Instant Android Installation (3 Simple Steps):
            </h4>
            <ol style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#475569', lineHeight: '1.7' }}>
              <li><strong>Scan QR or Tap Download</strong>: Use your phone camera on the QR code, or tap <em>Download .APK</em>.</li>
              <li><strong>Download File</strong>: If Chrome asks <em>"File might be harmful"</em>, tap <strong>Download anyway</strong> (standard for direct APKs).</li>
              <li><strong>Install & Open</strong>: Tap <strong>Open</strong> in your notification bar, then tap <strong>Install</strong>. Done!</li>
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
