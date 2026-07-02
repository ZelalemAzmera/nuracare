import React, { useState, useEffect, useRef, Component } from 'react';
import * as Icons from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { showToast, formatDate, stripThinkTags, stripJsonBlock, parseUrgencyFromContent } from '@/lib/utils';

function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <a href="#" className={`nav-item ${active ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); onClick(); }}>
      <span className="nav-icon"><Icon /></span>
      <span className="nav-label">{label}</span>
    </a>
  );
}

export default NavItem;