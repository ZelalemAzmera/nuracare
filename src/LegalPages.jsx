import React from 'react';
import * as Icons from 'lucide-react';

export function PrivacyPolicy({ onBack }) {
  return (
    <div className="page active" style={{ maxWidth: 800, margin: '0 auto', paddingTop: 20 }}>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button className="btn-back" onClick={onBack}><Icons.ArrowLeft size={20} /></button>
        <div>
          <h1 className="page-title">Privacy Policy</h1>
          <p className="page-subtitle">How we protect and use your data</p>
        </div>
      </div>
      <div className="dash-card" style={{ padding: 32, fontSize: 15, lineHeight: 1.6, color: 'var(--text)' }}>
        <h3 style={{ marginTop: 0 }}>1. Introduction</h3>
        <p>Welcome to NuraCare. Your privacy and trust are our top priorities. This policy explains what information we collect, how it is used, and your rights regarding your personal data.</p>
        
        <h3 style={{ marginTop: 24 }}>2. Information We Collect</h3>
        <p>We may collect the following types of information when you use our app:</p>
        <ul>
          <li><strong>Personal Information:</strong> Name, age, and basic health metrics provided during onboarding.</li>
          <li><strong>Health Data:</strong> Information about medical conditions, medications, and symptom check-ins.</li>
          <li><strong>Wearable Data:</strong> Step counts, sleep patterns, and other fitness metrics if you choose to sync your wearable devices (e.g., Fitbit, Google Fit).</li>
          <li><strong>Chat Logs:</strong> Conversations with the NuraCare AI assistant are logged to provide context for future sessions.</li>
        </ul>

        <h3 style={{ marginTop: 24 }}>3. How We Use Your Information</h3>
        <p>Your data is strictly used to provide and improve the NuraCare service. We use it to:</p>
        <ul>
          <li>Personalize your AI wellness assistant responses.</li>
          <li>Track your health progress and provide timely insights.</li>
          <li>Analyze trends to improve the app's features and safety.</li>
        </ul>
        <p><strong>AI Processing:</strong> Your chat messages and health context are processed by third-party AI providers (e.g., Groq API) to generate responses. We ensure these providers comply with strict data privacy agreements.</p>

        <h3 style={{ marginTop: 24 }}>4. Data Storage and Security</h3>
        <p>Your data is securely stored using Supabase, which employs enterprise-grade encryption. We take reasonable measures to protect your information against unauthorized access or disclosure.</p>

        <h3 style={{ marginTop: 24 }}>5. Your Rights</h3>
        <p>You have the right to access, update, or delete your personal information at any time. You can clear your chat history or delete your account directly from the app settings.</p>

        <p style={{ marginTop: 32, color: 'var(--text-muted)', fontSize: 13 }}>Last updated: {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
}

export function TermsOfService({ onBack }) {
  return (
    <div className="page active" style={{ maxWidth: 800, margin: '0 auto', paddingTop: 20 }}>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button className="btn-back" onClick={onBack}><Icons.ArrowLeft size={20} /></button>
        <div>
          <h1 className="page-title">Terms of Service</h1>
          <p className="page-subtitle">Rules and guidelines for using NuraCare</p>
        </div>
      </div>
      <div className="dash-card" style={{ padding: 32, fontSize: 15, lineHeight: 1.6, color: 'var(--text)' }}>
        <h3 style={{ marginTop: 0 }}>1. Acceptance of Terms</h3>
        <p>By accessing or using NuraCare, you agree to be bound by these Terms of Service. If you do not agree, please do not use the application.</p>

        <h3 style={{ marginTop: 24 }}>2. Description of Service</h3>
        <p>NuraCare provides an AI-powered wellness assistant designed to offer general health insights, track daily symptoms, and suggest lifestyle improvements. It integrates with wearable health devices for enhanced tracking.</p>

        <h3 style={{ marginTop: 24 }}>3. User Responsibilities</h3>
        <p>You agree to:</p>
        <ul>
          <li>Provide accurate and complete information about your health.</li>
          <li>Keep your account credentials secure.</li>
          <li>Not use the service for emergencies or life-threatening situations.</li>
        </ul>

        <h3 style={{ marginTop: 24 }}>4. Limitation of Liability</h3>
        <p>NuraCare is provided "as is" without warranties of any kind. We are not liable for any damages, injuries, or losses resulting from your reliance on the app's information. You use the service entirely at your own risk.</p>

        <h3 style={{ marginTop: 24 }}>5. Modifications</h3>
        <p>We reserve the right to modify these terms at any time. Continued use of the app constitutes acceptance of the new terms.</p>

        <p style={{ marginTop: 32, color: 'var(--text-muted)', fontSize: 13 }}>Last updated: {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
}

export function MedicalDisclaimer({ onBack }) {
  return (
    <div className="page active" style={{ maxWidth: 800, margin: '0 auto', paddingTop: 20 }}>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button className="btn-back" onClick={onBack}><Icons.ArrowLeft size={20} /></button>
        <div>
          <h1 className="page-title">Medical Disclaimer</h1>
          <p className="page-subtitle" style={{ color: '#dc2626' }}>Please read this important notice carefully</p>
        </div>
      </div>
      <div className="dash-card" style={{ padding: 32, fontSize: 15, lineHeight: 1.6, color: 'var(--text)', border: '2px solid #fca5a5' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, color: '#dc2626' }}>
          <Icons.AlertTriangle size={32} />
          <h2 style={{ margin: 0 }}>Not Medical Advice</h2>
        </div>
        
        <p style={{ fontWeight: 'bold' }}>NuraCare is an informational tool and is NOT a substitute for professional medical advice, diagnosis, or treatment.</p>

        <p>The AI-generated insights, wellness suggestions, and symptom analyses provided by this application are intended for general informational and educational purposes only.</p>

        <h3 style={{ marginTop: 24 }}>Key Limitations:</h3>
        <ul>
          <li><strong>No Doctor-Patient Relationship:</strong> Using NuraCare does not create a doctor-patient relationship between you and the developers or the AI.</li>
          <li><strong>Always Consult a Professional:</strong> Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.</li>
          <li><strong>Never Ignore Professional Advice:</strong> Never disregard professional medical advice or delay in seeking it because of something you have read on this application.</li>
          <li><strong>Emergencies:</strong> If you think you may have a medical emergency, call your doctor, go to the nearest emergency department, or call emergency services (like 911) immediately. NuraCare should NEVER be used for emergencies.</li>
        </ul>

        <p style={{ marginTop: 24, padding: 16, background: '#fee2e2', borderRadius: 8, color: '#991b1b', fontWeight: '500' }}>
          By using NuraCare, you acknowledge that you understand and agree to this disclaimer. You assume full responsibility for how you choose to use this information.
        </p>

        <p style={{ marginTop: 32, color: 'var(--text-muted)', fontSize: 13 }}>Last updated: {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
}
