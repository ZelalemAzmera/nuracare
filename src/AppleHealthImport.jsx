import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { saveWearableReading } from './wellnessEngine';

export default function AppleHealthImport({ onImportComplete }) {
  const [dragActive, setDragActive] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleDrag = function(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = function(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = function(e) {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file) => {
    setParsing(true);
    setProgress(10);
    
    // In a real app, parsing a huge XML file in the browser can freeze it.
    // For this mock, we simulate parsing delay and then generate mock Apple Health data.
    setTimeout(() => setProgress(40), 500);
    setTimeout(() => setProgress(80), 1200);
    
    setTimeout(() => {
      // Mock parsing complete
      saveWearableReading({
        source: 'apple_health',
        steps: 8420,
        heart_rate: 68,
        sleep_min: 440,
        calories: 2150
      });
      setParsing(false);
      setProgress(100);
      if (onImportComplete) {
        onImportComplete({
          steps: 8420,
          heartRate: 68,
          sleepMinutes: 440
        });
      }
    }, 2000);
  };

  return (
    <div style={{ padding: '24px', background: 'var(--card-bg)', borderRadius: '24px', border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icons.Apple size={24} color="var(--green-dark)" />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: 18, color: 'var(--text)' }}>Apple Health Sync</h3>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--text-muted)' }}>Upload your export.xml or export.zip file</p>
        </div>
      </div>
      
      <div 
        onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragActive ? 'var(--green)' : 'var(--border)'}`,
          borderRadius: 16, padding: '40px 20px', textAlign: 'center',
          background: dragActive ? 'var(--green-light)' : 'transparent',
          transition: 'all 0.2s ease', cursor: 'pointer', position: 'relative'
        }}
      >
        <input 
          type="file" 
          accept=".xml,.zip" 
          onChange={handleChange} 
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
        />
        
        {parsing ? (
          <div>
            <Icons.Loader size={32} className="spin" color="var(--green)" style={{ margin: '0 auto 16px' }} />
            <p style={{ margin: 0, fontWeight: 600, color: 'var(--text)' }}>Parsing Health Data...</p>
            <div style={{ width: '100%', height: 6, background: 'var(--border)', borderRadius: 4, marginTop: 16, overflow: 'hidden' }}>
              <div style={{ width: `${progress}%`, height: '100%', background: 'var(--green)', transition: 'width 0.3s ease' }}></div>
            </div>
          </div>
        ) : (
          <div>
            <Icons.UploadCloud size={40} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
            <p style={{ margin: '0 0 8px', fontWeight: 600, color: 'var(--text)' }}>Drag and drop your file here</p>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>Or click to browse files</p>
          </div>
        )}
      </div>

      <div style={{ marginTop: 20, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
        <strong>How to get your data:</strong> Open the Apple Health app on your iPhone, tap your profile picture, scroll to the bottom, and select "Export All Health Data".
      </div>
    </div>
  );
}
