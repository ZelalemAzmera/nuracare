import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';

const INITIAL_MEDICATIONS = [
  {
    id: 'med-1',
    name: 'Vitamin D3 & K2',
    dosage: '2000 IU',
    frequency: 'Once daily',
    times: ['08:30'],
    withFood: true,
    category: 'Vitamin',
    instructions: 'Take with morning breakfast',
  },
  {
    id: 'med-2',
    name: 'Omega-3 Fish Oil',
    dosage: '1000 mg',
    frequency: 'Once daily',
    times: ['13:00'],
    withFood: true,
    category: 'Supplement',
    instructions: 'Take with lunch',
  },
  {
    id: 'med-3',
    name: 'Magnesium Glycinate',
    dosage: '200 mg',
    frequency: 'Once daily',
    times: ['21:00'],
    withFood: false,
    category: 'Supplement',
    instructions: 'Take 30 minutes before bed',
  },
];

export default function MedicationPage({ profile }) {
  const [medications, setMedications] = useState(() => {
    const saved = localStorage.getItem('nuracare_web_meds');
    return saved ? JSON.parse(saved) : INITIAL_MEDICATIONS;
  });

  const [dosesStatus, setDosesStatus] = useState(() => {
    const saved = localStorage.getItem('nuracare_web_doses_status');
    return saved ? JSON.parse(saved) : {};
  });

  const [activeTab, setActiveTab] = useState('today');
  const [showAddModal, setShowAddModal] = useState(false);

  // New med form state
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('Once daily');
  const [times, setTimes] = useState('08:00');
  const [category, setCategory] = useState('Supplement');
  const [withFood, setWithFood] = useState(false);
  const [instructions, setInstructions] = useState('');

  useEffect(() => {
    localStorage.setItem('nuracare_web_meds', JSON.stringify(medications));
  }, [medications]);

  useEffect(() => {
    localStorage.setItem('nuracare_web_doses_status', JSON.stringify(dosesStatus));
  }, [dosesStatus]);

  const handleMarkDose = (id, status) => {
    setDosesStatus(prev => ({
      ...prev,
      [id]: status,
    }));
  };

  const handleAddMed = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newMed = {
      id: 'med_' + Date.now(),
      name: name.trim(),
      dosage: dosage.trim() || '1 dose',
      frequency,
      times: times.split(',').map(t => t.trim()).filter(Boolean),
      withFood,
      category,
      instructions: instructions.trim(),
    };

    setMedications([newMed, ...medications]);
    setName('');
    setDosage('');
    setTimes('08:00');
    setInstructions('');
    setWithFood(false);
    setShowAddModal(false);
  };

  const handleDeleteMed = (id) => {
    if (window.confirm('Are you sure you want to remove this medication?')) {
      setMedications(prev => prev.filter(m => m.id !== id));
    }
  };

  const todayDoses = medications.flatMap(m =>
    m.times.map(t => {
      const hour = parseInt(t.split(':')[0], 10);
      let period = 'Morning';
      if (hour >= 12 && hour < 17) period = 'Afternoon';
      else if (hour >= 17 && hour < 21) period = 'Evening';
      else if (hour >= 21 || hour < 5) period = 'Night';

      const doseKey = `${m.id}_${t}`;
      return {
        doseKey,
        medication: m,
        time: t,
        period,
        status: dosesStatus[doseKey] || 'due',
      };
    })
  ).sort((a, b) => a.time.localeCompare(b.time));

  const takenCount = todayDoses.filter(d => d.status === 'taken').length;
  const adherencePercent = todayDoses.length > 0 ? Math.round((takenCount / todayDoses.length) * 100) : 100;

  return (
    <div className="page active" style={{ maxWidth: 1040, margin: '0 auto', paddingBottom: 60 }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icons.Pill size={28} color="var(--green)" /> Medication & Supplement Adherence
          </h1>
          <p className="page-subtitle">Track your daily regimen, schedule dosages, and monitor compliance.</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => setShowAddModal(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <Icons.Plus size={16} /> Add Medication
        </button>
      </div>

      {/* Adherence Score Card */}
      <div
        className="dash-card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 24,
          marginBottom: 20,
          background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
          border: '1px solid #bbf7d0',
        }}
      >
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 0.8 }}>
            TODAY'S ADHERENCE
          </div>
          <div style={{ fontSize: 36, fontWeight: 900, color: 'var(--green-dark)', margin: '4px 0' }}>
            {adherencePercent}%
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {takenCount} of {todayDoses.length} doses logged taken today • 7-day streak 🔥
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#dcfce7',
              color: '#15803d',
              padding: '6px 14px',
              borderRadius: 20,
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            <Icons.ShieldCheck size={18} /> {adherencePercent >= 80 ? 'On Track' : 'Attention Needed'}
          </div>
        </div>
      </div>

      {/* Clinical Disclaimer Alert */}
      <div
        style={{
          background: '#fffbeb',
          border: '1px solid #fef3c7',
          borderRadius: 12,
          padding: '12px 18px',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 12,
          color: '#92400e',
          lineHeight: 1.5,
        }}
      >
        <Icons.AlertTriangle size={18} color="#b45309" />
        <span>
          <strong>Clinical Safety Policy:</strong> NuraCare is an adherence assistant. It never independently prescribes, alters, or discontinues prescribed medication. Always consult your physician before modifying your treatment.
        </span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <button
          onClick={() => setActiveTab('today')}
          className={activeTab === 'today' ? 'btn-primary' : 'btn-outline-sm'}
          style={{ padding: '8px 18px', fontSize: 13 }}
        >
          Today's Schedule ({todayDoses.length})
        </button>
        <button
          onClick={() => setActiveTab('cabinet')}
          className={activeTab === 'cabinet' ? 'btn-primary' : 'btn-outline-sm'}
          style={{ padding: '8px 18px', fontSize: 13 }}
        >
          Cabinet ({medications.length})
        </button>
      </div>

      {/* Content View */}
      {activeTab === 'today' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {todayDoses.length === 0 ? (
            <div className="dash-card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
              <Icons.Pill size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
              <h3>No scheduled doses</h3>
              <p>Add your prescriptions and supplements to track them here.</p>
            </div>
          ) : (
            todayDoses.map(dose => (
              <div
                key={dose.doseKey}
                className="dash-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  opacity: dose.status === 'taken' ? 0.75 : 1,
                  background: dose.status === 'taken' ? '#f8fafc' : '#ffffff',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div
                    style={{
                      width: 56,
                      textAlign: 'center',
                      borderRight: '1px solid var(--border)',
                      paddingRight: 14,
                    }}
                  >
                    <strong style={{ fontSize: 16 }}>{dose.time}</strong>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{dose.period}</div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <h4
                        style={{
                          margin: 0,
                          fontSize: 16,
                          textDecoration: dose.status === 'taken' ? 'line-through' : 'none',
                        }}
                      >
                        {dose.medication.name}
                      </h4>
                      <span
                        style={{
                          fontSize: 11,
                          background: 'var(--surface-light, #f1f5f9)',
                          padding: '2px 8px',
                          borderRadius: 8,
                          fontWeight: 600,
                        }}
                      >
                        {dose.medication.category}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                      {dose.medication.dosage} {dose.medication.withFood ? '• Take with meal' : ''}
                    </div>
                    {dose.medication.instructions && (
                      <div style={{ fontSize: 11, color: 'var(--green-dark)', marginTop: 2 }}>
                        ℹ️ {dose.medication.instructions}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  {dose.status === 'taken' ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        color: 'var(--green-dark)',
                        fontWeight: 700,
                        fontSize: 13,
                      }}
                    >
                      <Icons.CheckCircle2 size={18} /> Taken
                    </span>
                  ) : dose.status === 'skipped' ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        color: '#ef4444',
                        fontWeight: 700,
                        fontSize: 13,
                      }}
                    >
                      <Icons.XCircle size={18} /> Skipped
                    </span>
                  ) : (
                    <>
                      <button
                        className="btn-primary"
                        onClick={() => handleMarkDose(dose.doseKey, 'taken')}
                        style={{ padding: '7px 14px', fontSize: 13 }}
                      >
                        Mark Taken
                      </button>
                      <button
                        className="btn-outline-sm"
                        onClick={() => handleMarkDose(dose.doseKey, 'skipped')}
                        style={{ padding: '7px 14px', fontSize: 13 }}
                      >
                        Skip
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {medications.map(med => (
            <div key={med.id} className="dash-card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: 16 }}>{med.name}</h4>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    {med.dosage} • {med.frequency}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--green-dark)', marginTop: 6, fontWeight: 600 }}>
                    Scheduled: {med.times.join(', ')}
                  </div>
                  {med.instructions && (
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '8px 0 0 0' }}>
                      {med.instructions}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteMed(med.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', opacity: 0.8 }}
                >
                  <Icons.Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Medication Modal */}
      {showAddModal && (
        <div className="modal-overlay open" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <h3 style={{ margin: '0 0 16px 0' }}>Add Medication / Supplement</h3>
            <form onSubmit={handleAddMed}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                  Medication Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Metformin, Vitamin D, Zinc"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--border)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                    Dosage
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 500mg, 1 tablet"
                    value={dosage}
                    onChange={e => setDosage(e.target.value)}
                    style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--border)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--border)' }}
                  >
                    <option value="Prescription">Prescription</option>
                    <option value="Supplement">Supplement</option>
                    <option value="Vitamin">Vitamin</option>
                    <option value="OTC">OTC</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                  Scheduled Time(s) (24h, comma separated)
                </label>
                <input
                  type="text"
                  placeholder="08:00, 20:00"
                  value={times}
                  onChange={e => setTimes(e.target.value)}
                  style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--border)' }}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                  <input
                    type="checkbox"
                    checked={withFood}
                    onChange={e => setWithFood(e.target.checked)}
                  />
                  Take with food / meal
                </label>
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                  Special Instructions
                </label>
                <input
                  type="text"
                  placeholder="Take with a full glass of water"
                  value={instructions}
                  onChange={e => setInstructions(e.target.value)}
                  style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--border)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" className="btn-outline-sm" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save to Cabinet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
