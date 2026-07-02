import React, { useState, useEffect, useRef, Component } from 'react';
import * as Icons from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { showToast, formatDate, stripThinkTags, stripJsonBlock, parseUrgencyFromContent } from '@/lib/utils';

const AppSkeleton = () => (
  <div className="skeleton-app">
    <div className="skeleton-sidebar">
      <div className="skeleton-block" style={{ height: 40, width: '60%', marginBottom: 24 }} />
      <div className="skeleton-block" style={{ height: 24, width: '100%', marginBottom: 12 }} />
      <div className="skeleton-block" style={{ height: 24, width: '80%', marginBottom: 12 }} />
      <div className="skeleton-block" style={{ height: 24, width: '90%', marginBottom: 12 }} />
    </div>
    <div className="skeleton-main">
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <div className="skeleton-circle" style={{ width: 48, height: 48 }} />
        <div className="skeleton-block" style={{ height: 32, width: 200 }} />
      </div>
      <div style={{ display: 'flex', gap: 24, marginTop: 24 }}>
        <div className="skeleton-block" style={{ height: 120, flex: 1 }} />
        <div className="skeleton-block" style={{ height: 120, flex: 1 }} />
        <div className="skeleton-block" style={{ height: 120, flex: 1 }} />
      </div>
      <div className="skeleton-block" style={{ height: 300, width: '100%', marginTop: 24 }} />
    </div>
  </div>
);

export default AppSkeleton;