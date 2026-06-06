// Chat logic state
let chatState = {
  step: 0,
  symptom: "",
  severity: "",
  duration: "",
  otherDetails: ""
};

const chatContainer = document.getElementById('chat-messages');
const chatOptions = document.getElementById('chat-options');
const chatInput = document.getElementById('chat-text-input');

// Flow definition
const chatFlow = [
  {
    question: "Hi there 🌿 What's bothering you today?",
    options: ["Headache", "Stomach Pain", "Fatigue", "Cold / Flu symptoms"],
    field: "symptom"
  },
  {
    question: "How severe would you say it is?",
    options: ["Mild", "Moderate", "Severe"],
    field: "severity"
  },
  {
    question: "How long have you been feeling this way?",
    options: ["Just started today", "A few days", "A week or more"],
    field: "duration"
  }
];

function resetChat() {
  chatState = { step: 0, symptom: "", severity: "", duration: "", otherDetails: "" };
  chatContainer.innerHTML = '';
  chatInput.value = '';
  nextChatStep();
}

function nextChatStep() {
  if (chatState.step < chatFlow.length) {
    const current = chatFlow[chatState.step];
    addMessage(current.question, 'ai');
    renderOptions(current.options);
  } else {
    finishChat();
  }
}

function renderOptions(options) {
  chatOptions.innerHTML = '';
  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'chat-opt-btn';
    btn.textContent = opt;
    btn.onclick = () => handleOptionClick(opt);
    chatOptions.appendChild(btn);
  });
}

function handleOptionClick(val) {
  chatOptions.innerHTML = ''; // Clear options
  chatInput.value = ''; // Clear input
  addMessage(val, 'user');
  
  const current = chatFlow[chatState.step];
  chatState[current.field] = val;
  chatState.step++;
  
  setTimeout(nextChatStep, 600);
}

function sendChatMessage() {
  const val = chatInput.value.trim();
  if (!val) return;
  
  chatOptions.innerHTML = '';
  chatInput.value = '';
  addMessage(val, 'user');

  if (chatState.step < chatFlow.length) {
    const current = chatFlow[chatState.step];
    chatState[current.field] = val;
    chatState.step++;
    setTimeout(nextChatStep, 600);
  }
}

function addMessage(text, sender) {
  const div = document.createElement('div');
  div.className = `chat-bubble bubble-${sender}`;
  if (sender === 'ai') {
    div.innerHTML = `<div class="bubble-label">Nura</div>${text}`;
  } else {
    div.textContent = text;
  }
  chatContainer.appendChild(div);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function finishChat() {
  chatOptions.innerHTML = '';
  
  // Determine urgency
  let urgency = 'low';
  let urgencyLabel = 'Low Urgency';
  if (chatState.severity.toLowerCase().includes('severe')) {
    urgency = 'high';
    urgencyLabel = 'High Urgency — Seek Medical Attention';
  } else if (chatState.severity.toLowerCase().includes('moderate') || chatState.duration.toLowerCase().includes('week')) {
    urgency = 'mid';
    urgencyLabel = 'Moderate — Monitor Closely';
  }

  // Generate response card
  const summary = `${chatState.severity} ${chatState.symptom} for ${chatState.duration}`;
  
  const responseDiv = document.createElement('div');
  responseDiv.className = 'response-card';
  
  let tipsHTML = '';
  if (chatState.symptom.toLowerCase().includes('headache')) {
    tipsHTML = `<li>Drink a large glass of water</li><li>Rest in a quiet, dark room</li><li>Try a cool compress on your forehead</li>`;
  } else if (chatState.symptom.toLowerCase().includes('stomach')) {
    tipsHTML = `<li>Sip clear fluids like water or chamomile tea</li><li>Avoid heavy or spicy foods</li><li>Try ginger or peppermint to soothe</li>`;
  } else if (chatState.symptom.toLowerCase().includes('fatigue')) {
     tipsHTML = `<li>Ensure you are getting 7-8 hours of sleep</li><li>Check your hydration levels</li><li>Take a 20-minute power nap if possible</li>`;
  } else {
    tipsHTML = `<li>Rest and stay hydrated</li><li>Monitor your temperature</li><li>Eat light, nutritious meals</li>`;
  }

  responseDiv.innerHTML = `
    <div class="urgency-badge urgency-${urgency}">${urgencyLabel}</div>
    <div class="response-section">
      <h4>SUMMARY</h4>
      <p>${summary}</p>
    </div>
    <div class="response-section">
      <h4>WHAT TO DO NEXT</h4>
      <p>${urgency === 'high' ? 'Please consult a healthcare professional as soon as possible given the severity.' : 'Rest and monitor your symptoms. If they worsen or persist, consult a doctor.'}</p>
    </div>
    <div class="response-section">
      <h4>NATURAL SUPPORT</h4>
      <ul class="nature-tips">
        ${tipsHTML}
      </ul>
    </div>
  `;
  
  chatContainer.appendChild(responseDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // Save to records
  saveCheckupRecord(summary, urgency);
}

// Allow Enter key to send
chatInput.addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    sendChatMessage();
  }
});
