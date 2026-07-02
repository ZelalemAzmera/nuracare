import React, { useState, useEffect, useRef, Component } from 'react';
import * as Icons from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { showToast, formatDate, stripThinkTags, stripJsonBlock, parseUrgencyFromContent } from '@/lib/utils';

const DeleteModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Delete Session</h3>
          <button className="modal-close-btn" onClick={onClose}><Icons.X size={20} /></button>
        </div>
        <div className="modal-body">
          Are you sure you want to delete this session? This action cannot be undone.
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-danger" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
};

const ShareModal = ({ isOpen, onClose, session }) => {
  if (!isOpen || !session) return null;
  const [loading, setLoading] = useState(false);
  const [shareToken, setShareToken] = useState(session.share_token || null);

  const getShareUrl = () => `${window.location.origin}/share/${shareToken}`;

  const createShareLink = async () => {
    setLoading(true);
    try {
      const { data: { session: authSession } } = await supabase.auth.getSession();
      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authSession.access_token}` },
        body: JSON.stringify({ sessionId: session.id })
      });
      const data = await res.json();
      if (res.ok && data.shareToken) {
        setShareToken(data.shareToken);
        await navigator.clipboard.writeText(`${window.location.origin}/share/${data.shareToken}`);
        showToast("Share link created and copied to clipboard!");
      } else {
        showToast(data.error || "Failed to create share link", "error");
      }
    } catch(e) {
      console.error(e);
      showToast("Error creating share link", "error");
    }
    setLoading(false);
  };

  const revokeShareLink = async () => {
    setLoading(true);
    try {
      const { data: { session: authSession } } = await supabase.auth.getSession();
      const res = await fetch('/api/share', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authSession.access_token}` },
        body: JSON.stringify({ sessionId: session.id })
      });
      if (res.ok) {
        setShareToken(null);
        showToast("Share link revoked.");
      } else {
        showToast("Failed to revoke share link", "error");
      }
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  const copyToClipboard = async () => {
    if (!shareToken) {
      await createShareLink();
      return;
    }
    try {
      await navigator.clipboard.writeText(getShareUrl());
      showToast("Link copied to clipboard!");
    } catch(e) { console.error('Failed to copy', e); }
  };

  const shareAction = (fn) => () => {
    if(!shareToken) return showToast("Create a link first!", "error");
    fn();
    onClose();
  };

  const shareWhatsApp = shareAction(() => window.open(`https://wa.me/?text=${encodeURIComponent(getShareUrl())}`, '_blank'));
  const shareTelegram = shareAction(() => window.open(`https://t.me/share/url?url=${encodeURIComponent(getShareUrl())}`, '_blank'));
  const shareTwitter = shareAction(() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(getShareUrl())}`, '_blank'));
  const shareEmail = shareAction(() => window.open(`mailto:?subject=My Chat with Nura&body=${encodeURIComponent(getShareUrl())}`, '_blank'));
  const shareNative = shareAction(async () => {
    try {
      if (navigator.share) await navigator.share({ title: 'My Chat with Nura', url: getShareUrl() });
      else showToast("Your device doesn't support native sharing.", "error");
    } catch(e) { if (e.name !== 'AbortError') console.error('Share failed', e); }
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()} style={{maxWidth: 400}}>
        <div className="modal-header">
          <h3 className="modal-title">Share Chat</h3>
          <button className="modal-close-btn" onClick={onClose}><Icons.X size={20} /></button>
        </div>
        <div className="modal-body" style={{paddingTop: 10}}>
          <p style={{marginBottom: 16, color: 'var(--text-muted)'}}>Anyone with this link will be able to view this conversation. They will not see your private medical profile.</p>
          
          <div style={{display: 'flex', gap: 10, marginBottom: 24}}>
            <button className="btn-primary" style={{flex: 1, display: 'flex', gap: 8, justifyContent: 'center', opacity: loading ? 0.7 : 1}} onClick={copyToClipboard} disabled={loading}>
              {loading ? <Icons.Loader className="spin" size={18} /> : <Icons.Link size={18} />}
              {shareToken ? 'Copy Link' : 'Create Link'}
            </button>
            {shareToken && (
              <button onClick={revokeShareLink} disabled={loading} style={{background: 'none', border: '1px solid #fca5a5', color: '#dc2626', borderRadius: 12, padding: '0 16px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center'}}>
                Stop
              </button>
            )}
          </div>

          {shareToken && (
            <div style={{background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: 'var(--text-muted)', marginBottom: 24, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
              {getShareUrl()}
            </div>
          )}

          <div style={{height: 1, background: 'var(--border)', margin: '0 -24px 20px', position: 'relative'}}>
            <span style={{position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: 'var(--surface)', padding: '0 10px', fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase'}}>Also share via</span>
          </div>

          <div className="share-options-grid" style={{opacity: shareToken ? 1 : 0.5, pointerEvents: shareToken ? 'auto' : 'none'}}>
            <button className="share-option" onClick={shareWhatsApp}>
              <div className="share-icon-wrap share-icon-whatsapp"><Icons.MessageCircle size={24} /></div>
              <span className="share-option-label">WhatsApp</span>
            </button>
            <button className="share-option" onClick={shareTelegram}>
              <div className="share-icon-wrap" style={{background: '#e0f2fe', color: '#0ea5e9'}}><Icons.Send size={24} /></div>
              <span className="share-option-label">Telegram</span>
            </button>
            <button className="share-option" onClick={shareTwitter}>
              <div className="share-icon-wrap" style={{background: '#f1f5f9', color: '#0f1419'}}><Icons.Twitter size={24} /></div>
              <span className="share-option-label">X</span>
            </button>
            <button className="share-option" onClick={shareEmail}>
              <div className="share-icon-wrap share-icon-email"><Icons.Mail size={24} /></div>
              <span className="share-option-label">Email</span>
            </button>
            <button className="share-option" onClick={shareNative}>
              <div className="share-icon-wrap" style={{background: '#f3f4f6', color: '#4b5563'}}><Icons.MoreHorizontal size={24} /></div>
              <span className="share-option-label">More</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { DeleteModal, ShareModal };