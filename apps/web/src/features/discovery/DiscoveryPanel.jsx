import React, { useState, useEffect, useRef, Component } from 'react';
import * as Icons from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { showToast, formatDate, stripThinkTags, stripJsonBlock, parseUrgencyFromContent } from '@/lib/utils';

import { getDiscoveryFeed, getAvailableTags } from '@/lib/discoveryEngine';
function Discovery({ t }) {
  const [filters, setFilters] = useState(() => JSON.parse(localStorage.getItem('nuracare_interests') || '[]'));
  const [feed, setFeed] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'local'

  useEffect(() => {
    setAvailableTags(getAvailableTags());
  }, []);

  useEffect(() => {
    let baseFeed = getDiscoveryFeed(filters);
    if (activeTab === 'local') {
      baseFeed = baseFeed.filter(i => i.tags && i.tags.includes('ethiopian'));
    }
    setFeed(baseFeed);
  }, [filters, activeTab]);

  const toggleFilter = (tag) => {
    const updated = filters.includes(tag) ? filters.filter(f => f !== tag) : [...filters, tag];
    setFilters(updated);
    localStorage.setItem('nuracare_interests', JSON.stringify(updated));
  };

  return (
    <div className="page active">
      <div className="page-header">
        <div><h1 className="page-title">Discovery Feed</h1><p className="page-subtitle">Your personalized, dynamic health knowledge</p></div>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 24, borderBottom: '1px solid var(--border)' }}>
        <button 
          onClick={() => setActiveTab('all')} 
          style={{ background: 'transparent', border: 'none', padding: '0 0 12px 0', fontSize: 16, fontWeight: 600, color: activeTab === 'all' ? 'var(--green-dark)' : 'var(--text-muted)', borderBottom: activeTab === 'all' ? '3px solid var(--green)' : '3px solid transparent', cursor: 'pointer' }}
        >
          Explore All
        </button>
        <button 
          onClick={() => setActiveTab('local')} 
          style={{ background: 'transparent', border: 'none', padding: '0 0 12px 0', fontSize: 16, fontWeight: 600, color: activeTab === 'local' ? 'var(--green-dark)' : 'var(--text-muted)', borderBottom: activeTab === 'local' ? '3px solid var(--green)' : '3px solid transparent', cursor: 'pointer' }}
        >
          Local Superfoods
        </button>
      </div>
      
      <div style={{ marginBottom: 24 }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: 14, color: 'var(--text-muted)' }}>Follow your interests:</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {availableTags.map(tag => (
            <button 
              key={tag} 
              onClick={() => toggleFilter(tag)}
              style={{ 
                padding: '6px 12px', 
                borderRadius: 20, 
                border: `1.5px solid ${filters.includes(tag) ? 'var(--green-dark)' : 'var(--border)'}`,
                background: filters.includes(tag) ? 'var(--green-light)' : 'transparent',
                color: filters.includes(tag) ? 'var(--green-dark)' : 'var(--text-muted)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}>
              {filters.includes(tag) ? <Icons.Check size={14}/> : <Icons.Plus size={14}/>} {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="section-title">{activeTab === 'local' ? 'Nutritional Breakdown' : 'Articles & Guides'}</div>
      <div className="discovery-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
        {feed.filter(i => !i.vid).map((item, i) => {
          return (
            <div key={i} className="dash-card" style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 0, overflow: 'hidden' }}>
              <img src={item.image} alt={item.name} style={{ width: '100%', height: 160, objectFit: 'cover', backgroundColor: '#e8f5e9' }} onError={(e)=>{e.target.src='https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Pfefferminze_natur_peppermint.jpg/400px-Pfefferminze_natur_peppermint.jpg'}} />
              <div style={{ padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <h3 style={{ margin: 0, fontSize: 16 }}>{item.name}</h3>
                <span style={{ fontSize: 11, background: 'var(--bg)', padding: '4px 8px', borderRadius: 10, fontWeight: 600 }}>{item.category.toUpperCase()}</span>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{item.benefit}</p>
              
              {activeTab === 'local' && item.tags.includes('ethiopian') && (
                <div style={{ marginTop: 12, padding: 12, background: 'var(--green-light)', borderRadius: 8, fontSize: 12, color: 'var(--green-dark)' }}>
                  <strong>Nutritional Highlight:</strong> Often rich in essential minerals, fiber, or natural anti-microbial properties unique to the highland geography. 
                </div>
              )}
            </div>
          </div>
          );
        })}
      </div>

      {feed.filter(i => !!i.vid).length > 0 && <div className="section-title" style={{ marginTop: 40 }}>Watch & Learn</div>}
      <div className="discovery-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
        {feed.filter(i => !!i.vid).map((item, i) => (
          <div key={i} className="dash-card" style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 0, overflow: 'hidden', background: '#fafafa' }}>
            <a href={item.vid} target="_blank" rel="noreferrer" style={{ position: 'relative', display: 'block', backgroundColor: '#000' }}>
              <img src={item.image} alt={item.name} style={{ width: '100%', height: 180, objectFit: 'cover', opacity: 0.9 }} onError={(e)=>{e.target.src='https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=400&q=80'}} />
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#ff0000', borderRadius: '12px', width: 68, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                <Icons.Play size={28} color="#fff" fill="#fff" />
              </div>
            </a>
            <div style={{ padding: 16 }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: 16 }}>{item.name}</h3>
              <p style={{ margin: '0 0 16px 0', fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.4 }}>{item.benefit}</p>
              <a href={item.vid} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#ef4444', textDecoration: 'none', fontWeight: 600, border: '1px solid #ef4444', padding: '6px 12px', borderRadius: 20 }}>
                <Icons.Youtube size={16} /> Watch on YouTube
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}



export default Discovery;