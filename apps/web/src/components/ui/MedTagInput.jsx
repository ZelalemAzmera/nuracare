import React, { useState, useEffect, useRef, Component } from 'react';
import * as Icons from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { showToast, formatDate, stripThinkTags, stripJsonBlock, parseUrgencyFromContent } from '@/lib/utils';

function MedTagInput({ tags, setTags, placeholder }) {
  const [input, setInput] = useState('');
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = input.trim().replace(/,$/, '');
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setInput('');
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  return (
    <div className="med-tag-input-wrap">
      {tags.map((tag, i) => (
        <span key={i} className="med-tag">
          {tag}
          <button type="button" className="med-tag-remove" onClick={() => setTags(tags.filter((_, idx) => idx !== i))}><Icons.X size={14}/></button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? placeholder : ''}
        className="med-tag-input"
      />
    </div>
  );
}

export default MedTagInput;