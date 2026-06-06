// User State
let userProfile = {
  name: "",
  age: "",
  conditions: [],
  medications: "",
  records: []
};

// Date Formatter
const formatDate = (date) => {
  const options = { weekday: 'long', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('today-date').textContent = formatDate(new Date());
  
  // Check if onboarding is needed
  const savedProfile = localStorage.getItem('nuracare_profile');
  if (savedProfile) {
    userProfile = JSON.parse(savedProfile);
    hideOnboarding();
    initApp();
  } else {
    document.getElementById('onboarding-overlay').style.display = 'flex';
    document.getElementById('main-app').classList.add('hidden');
  }
});

/* ===== ONBOARDING FLOW ===== */
function nextStep(stepNumber) {
  // Validate Step 1
  if (stepNumber === 2) {
    const name = document.getElementById('user-name').value.trim();
    if (!name) return alert("Please enter your name.");
    userProfile.name = name;
    userProfile.age = document.getElementById('user-age').value;
  }
  
  document.querySelectorAll('.onboarding-step').forEach(el => el.classList.remove('active'));
  document.getElementById(`step-${stepNumber}`).classList.add('active');
  lucide.createIcons();
}

function finishOnboarding() {
  // Get conditions
  const checkboxes = document.querySelectorAll('#step-2 input[type="checkbox"]:checked');
  userProfile.conditions = Array.from(checkboxes).map(cb => cb.value).filter(v => v !== 'none');
  
  // Get meds
  userProfile.medications = document.getElementById('user-medications').value.trim();
  
  saveProfile();
  hideOnboarding();
  initApp();
}

function hideOnboarding() {
  document.getElementById('onboarding-overlay').style.display = 'none';
  document.getElementById('main-app').classList.remove('hidden');
}

function saveProfile() {
  localStorage.setItem('nuracare_profile', JSON.stringify(userProfile));
}

/* ===== APP INITIALIZATION & ROUTING ===== */
function initApp() {
  updateProfileUI();
  updateDashboardUI();
  renderRecords();
  renderCheckups();
  renderDiscovery('herbs');
  
  // Set daily tip
  const tip = getDailyTip();
  document.getElementById('daily-tip').innerHTML = `
    <div class="tip-label">TIP OF THE DAY</div>
    <div class="tip-text" style="display:flex; gap:8px; align-items:center;">
      <i data-lucide="${tip.icon}"></i> 
      <span>${tip.benefit}</span>
    </div>
  `;
  lucide.createIcons();
}

function showPage(pageId, navElement) {
  // Update nav active state
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  if (navElement) navElement.classList.add('active');
  
  // Update page visibility
  document.querySelectorAll('.page').forEach(el => el.classList.remove('active'));
  document.getElementById(`page-${pageId}`).classList.add('active');
  
  // Special actions per page
  if (pageId === 'chat') resetChat();
  if (pageId === 'home') updateDashboardUI();
  
  // Close mobile sidebar
  if (window.innerWidth <= 768) {
    toggleSidebar();
  }
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  sidebar.classList.toggle('open');
  overlay.classList.toggle('open');
}

/* ===== UI UPDATES ===== */
function updateProfileUI() {
  const firstLetter = userProfile.name ? userProfile.name.charAt(0).toUpperCase() : '🌿';
  document.getElementById('mobile-avatar').textContent = firstLetter;
  document.getElementById('profile-avatar-display').textContent = firstLetter;
  document.getElementById('profile-name-display').textContent = userProfile.name || 'User';
  document.getElementById('profile-age-display').textContent = userProfile.age ? `${userProfile.age} years old` : '';
  document.getElementById('home-greeting').textContent = `Good morning, ${userProfile.name} 🌿`;
  
  // Conditions
  const condContainer = document.getElementById('profile-conditions-display');
  if (userProfile.conditions.length > 0) {
    condContainer.innerHTML = userProfile.conditions.map(c => `<span class="profile-tag">${c.charAt(0).toUpperCase() + c.slice(1)}</span>`).join('');
  } else {
    condContainer.innerHTML = '<span class="profile-tag">None reported</span>';
  }
  
  // Meds
  document.getElementById('profile-meds-display').textContent = userProfile.medications || 'None reported';
  document.getElementById('profile-med-input').value = userProfile.medications || '';
}

function saveMedications() {
  userProfile.medications = document.getElementById('profile-med-input').value.trim();
  saveProfile();
  updateProfileUI();
  updateDashboardUI();
  
  const btn = document.querySelector('#page-profile .btn-primary');
  const origText = btn.textContent;
  btn.textContent = 'Saved! ✅';
  setTimeout(() => btn.textContent = origText, 2000);
}

function updateDashboardUI() {
  const medsArea = document.getElementById('med-reminder-area');
  if (userProfile.medications) {
    // Simple split by comma for demo purposes
    const medsList = userProfile.medications.split(',').map(m => m.trim()).filter(m => m);
    if (medsList.length > 0) {
      medsArea.innerHTML = medsList.map(m => `
        <div class="med-item">
          <i data-lucide="pill" style="width:18px;height:18px;color:var(--green)"></i> <span>${m}</span>
        </div>
      `).join('');
    }
  } else {
    medsArea.innerHTML = `<div class="empty-state-small">No medications added yet. <a href="#" onclick="showPage('profile', document.getElementById('nav-profile'))">Add in Profile →</a></div>`;
  }
  
  // Update last checkup summary
  if (userProfile.records && userProfile.records.length > 0) {
    const lastRec = userProfile.records[userProfile.records.length - 1];
    document.getElementById('last-checkup-home').textContent = lastRec.dateStr;
    document.getElementById('last-urgency-home').innerHTML = `<span class="urgency-badge-sm urgency-${lastRec.urgency}">${lastRec.urgency.toUpperCase()}</span>`;
    document.getElementById('recovery-home').textContent = "Monitoring";
  }
}

/* ===== DISCOVERY LOGIC ===== */
function switchDiscoveryTab(type, btn) {
  document.querySelectorAll('.disc-tab').forEach(el => el.classList.remove('active'));
  btn.classList.add('active');
  renderDiscovery(type);
}

function renderDiscovery(type) {
  const container = document.getElementById('discovery-grid');
  const items = discoveryData[type];
  
  container.innerHTML = items.map(item => `
    <div class="disc-card">
      <div class="disc-card-icon"><i data-lucide="${item.icon}"></i></div>
      <div class="disc-card-name">${item.name}</div>
      <div class="disc-card-benefit">${item.benefit}</div>
      <div class="disc-card-tag">${type.toUpperCase()}</div>
    </div>
  `).join('');
  lucide.createIcons();
}

/* ===== RECORDS LOGIC ===== */
function saveCheckupRecord(summary, urgency) {
  const record = {
    id: Date.now(),
    dateStr: formatDate(new Date()),
    summary: summary,
    urgency: urgency
  };
  
  if (!userProfile.records) userProfile.records = [];
  userProfile.records.push(record);
  saveProfile();
  
  renderRecords();
  renderCheckups();
  updateDashboardUI();
}

function renderRecords() {
  const container = document.getElementById('records-list');
  if (!userProfile.records || userProfile.records.length === 0) return;
  
  // Sort newest first
  const sorted = [...userProfile.records].reverse();
  
  container.innerHTML = sorted.map(rec => `
    <div class="record-card">
      <div class="record-card-header">
        <span class="record-date">${rec.dateStr}</span>
        <span class="urgency-badge-sm urgency-${rec.urgency}">${rec.urgency.toUpperCase()}</span>
      </div>
      <div class="record-symptom">${rec.summary}</div>
      <div class="record-status">Status: Logged</div>
    </div>
  `).join('');
}

function renderCheckups() {
  const container = document.getElementById('checkups-content');
  if (!userProfile.records || userProfile.records.length === 0) return;
  
  const sorted = [...userProfile.records].reverse();
  
  container.innerHTML = sorted.map(rec => `
    <div class="checkup-card">
      <div class="checkup-header">
        <span class="checkup-title">Symptom Check</span>
        <span class="urgency-badge-sm urgency-${rec.urgency}">${rec.urgency.toUpperCase()}</span>
      </div>
      <div class="checkup-meta">Recorded on ${rec.dateStr}</div>
      <p style="font-size: 14px; margin-bottom: 12px;"><strong>Summary:</strong> ${rec.summary}</p>
      <div class="checkup-tips">
        <li>Continue monitoring symptoms</li>
        <li>Stay hydrated and rest</li>
        ${rec.urgency === 'high' ? '<li><strong>Action required:</strong> Consult a doctor</li>' : ''}
      </div>
    </div>
  `).join('');
}
