import React, { useState, useEffect, useRef, Component } from 'react';
import * as Icons from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { showToast, formatDate, stripThinkTags, stripJsonBlock, parseUrgencyFromContent } from '@/lib/utils';
import { useCheckups } from '@/hooks/useCheckups';

function FileUploadStep({ onComplete, existingNotes = '', isProfile = false, t = (k)=>k }) {
  const { addCheckup } = useCheckups();
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState(existingNotes);
  const [classificationResult, setClassificationResult] = useState(null);
  const [showAppointmentSuggestion, setShowAppointmentSuggestion] = useState(false);

  const handleFileChange = async (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    setFile(selected);
    setIsProcessing(true);
    
    try {
      let text = '';
      if (selected.type === 'application/pdf') {
        if (typeof window !== 'undefined' && window.pdfjsLib) {
          const arrayBuffer = await selected.arrayBuffer();
          const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          const numPages = Math.min(pdf.numPages, 3);
          
          for (let i = 1; i <= numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map(s => s.str).join(' ') + '\n';
          }
        } else {
          text = `[PDF Document Uploaded: ${selected.name}]`;
        }
      } else if (selected.type.startsWith('image/')) {
        const base64Image = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const MAX_WIDTH = 1000;
              const scaleSize = MAX_WIDTH / img.width;
              canvas.width = Math.min(MAX_WIDTH, img.width);
              canvas.height = img.height * Math.min(1, scaleSize);
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              resolve(canvas.toDataURL('image/jpeg', 0.7)); 
            };
            img.src = event.target.result;
          };
          reader.readAsDataURL(selected);
        });

        const ocrRes = await fetch('/api/document?action=ocr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64Image })
        });
        
        if (!ocrRes.ok) throw new Error('OCR failed');
        const ocrData = await ocrRes.json();
        text = ocrData.text || `[Image Uploaded: ${selected.name}]`;
      } else {
        text = await selected.text();
      }
      
      const limitedText = text.slice(0, 2000);
      
      const res = await fetch('/api/document?action=classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: limitedText })
      });
      
      if (!res.ok) throw new Error('Classification failed');
      const data = await res.json();
      
      if (data.medical) {
        setExtractedText(limitedText);
        setClassificationResult(data.extracted);
        if (data.extracted.next_visit_date) {
          setShowAppointmentSuggestion(true);
        }
        showToast('Medical document identified successfully!', 'success');
      } else {
        setExtractedText('');
        setFile(null);
        setShowAppointmentSuggestion(false);
        showToast('Not a medical document: ' + (data.reason || 'Please upload lab results or prescriptions.'), 'error');
      }
    } catch (err) {
      console.error('File extraction failed:', err);
      showToast('Could not analyze file. Please try another.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      {!extractedText ? (
        <div className="file-drop-area" style={{ border: '2px dashed var(--green-mid)', borderRadius: 16, padding: 32, textAlign: 'center', background: 'var(--green-light)', position: 'relative', cursor: 'pointer' }}>
          <input type="file" accept=".pdf,image/*,.txt" onChange={handleFileChange} style={{ opacity: 0, position: 'absolute', inset: 0, cursor: 'pointer' }} />
          <Icons.UploadCloud size={32} color="var(--green)" style={{ marginBottom: 12, margin: '0 auto' }} />
          <div style={{ fontWeight: 600, color: 'var(--green-dark)' }}>{t("tap_to_upload")}</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>{t("file_limits")}</div>
        </div>
      ) : (
        <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 16, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 14, color: 'var(--green-dark)' }}>
              <Icons.FileCheck size={16} color="var(--green)" /> {file ? file.name : 'Saved Medical Notes'}
            </div>
            <button onClick={() => { setFile(null); setExtractedText(''); setClassificationResult(null); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><Icons.X size={16}/></button>
          </div>
          
          {classificationResult && (
            <div style={{ marginBottom: 12, padding: 12, background: 'var(--green-light)', borderRadius: 8, fontSize: 13 }}>
              <strong>Detected Entities:</strong>
              {classificationResult.conditions?.length > 0 && <div>• Conditions: {classificationResult.conditions.join(', ')}</div>}
              {classificationResult.medications?.length > 0 && <div>• Medications: {classificationResult.medications.join(', ')}</div>}
              {classificationResult.metrics?.length > 0 && <div>• Metrics: {classificationResult.metrics.join(', ')}</div>}
            </div>
          )}
          
          {showAppointmentSuggestion && classificationResult?.next_visit_date && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: 16, borderRadius: 12, marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', color: 'var(--green-dark)' }}>
                <Icons.Calendar size={24} />
                <div>
                  <strong>Nura detected an upcoming {classificationResult.appointment_type || 'Follow-up'}</strong>
                  <div style={{ fontSize: 13 }}>Scheduled for: {classificationResult.next_visit_date}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button className="btn-primary" style={{ padding: '6px 12px', fontSize: 13 }} onClick={async () => {
                  await addCheckup({
                    name: classificationResult.appointment_type || 'Follow-up',
                    doctor: classificationResult.doctor_name || null,
                    next_visit: classificationResult.next_visit_date,
                    source: 'medical_file'
                  });
                  showToast('Appointment saved to Checkups!', 'success');
                  setShowAppointmentSuggestion(false);
                }}>Yes, Save</button>
                <button className="btn-ghost" style={{ padding: '6px 12px', fontSize: 13 }} onClick={() => setShowAppointmentSuggestion(false)}>Dismiss</button>
              </div>
            </div>
          )}
          
          <div style={{ fontSize: 13, color: 'var(--text-muted)', maxHeight: 100, overflow: 'auto', background: '#fff', padding: 12, borderRadius: 8, border: '1px solid var(--border)' }}>
            {extractedText}
          </div>
        </div>
      )}
      
      {isProcessing && <div style={{ fontSize: 13, color: 'var(--green-dark)', marginTop: 12, textAlign: 'center' }}>Processing file...</div>}
      
      {!isProfile && extractedText && (
        <button className="btn-primary" disabled={isProcessing} onClick={() => onComplete(extractedText)} style={{ marginTop: 24 }}>
          {t("complete_profile")} <Icons.CheckCircle size={18} style={{marginLeft: 8}}/>
        </button>
      )}
      {isProfile && extractedText !== existingNotes && (
        <button className="btn-primary" disabled={isProcessing} onClick={() => onComplete(extractedText)} style={{ marginTop: 12 }}>
          {t("save_medical_notes")}
        </button>
      )}
    </div>
  );
}

export default FileUploadStep;