<div align="center">

# 🌿 NuraCare

### *Your calm, intelligent AI health companion*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-nuracare.vercel.app-22c55e?style=for-the-badge&logo=vercel&logoColor=white)](https://nuracare.vercel.app)
[![Built with Vercel AI SDK](https://img.shields.io/badge/Vercel%20AI%20SDK-ChatSDK%20Track-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://sdk.vercel.ai)
[![Powered by Groq](https://img.shields.io/badge/Groq-Llama%203.3%2070B-F55036?style=for-the-badge&logo=meta&logoColor=white)](https://groq.com)
[![React](https://img.shields.io/badge/React%2018-Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)

> **Vercel AI Hackathon 2026 — ChatSDK Agents Track**  
> *Build agents using Vercel AI SDK + AI Gateway + ChatSDK*

---

**Most people don't go to the doctor at the right time.**  
They either panic and rush in too early, or they wait too long and things get worse.  
And after a visit, they're left alone with a prescription and no real support.

**NuraCare fixes this.** Nura is an AI health agent that stays with you — before, during, and after any health concern. It knows your profile, remembers your history, triages your urgency, and guides you toward the right care — naturally.

</div>

---

## 🎯 The Problem We're Solving

```
❌ Generic AI chatbots give one-size-fits-all health advice
❌ No memory — every conversation starts from scratch  
❌ No urgency triage — they can't tell you if you need an ER right now
❌ No natural remedy intelligence — just "see a doctor"
❌ No continuity after a doctor's visit

✅ NuraCare solves every single one of these
```

---

## ✨ Key Features

### 🧠 Intelligent Symptom Triage
Nura asks focused, one-at-a-time questions about your symptom, duration, and severity. Then it classifies urgency into **LOW / MID / HIGH** with a clear action plan.

### 🌱 Natural Remedies First
For low-urgency cases, Nura suggests personalized herbal remedies, dietary changes, and lifestyle adjustments — before defaulting to medication.

### 👤 Deeply Personal
Nura knows your name, age, known conditions, and medications. Every single response is tailored to *you* — not a generic internet user.

### 💾 Persistent Memory
- **Session memory** — chat history survives page reloads and tab switches
- **Health history** — last 5 health sessions injected into every AI prompt
- **Profile memory** — your complete health profile is always context

### 📋 Auto Health Records
Every assessed symptom is automatically saved to your personal Records timeline — a health journal you build by just talking.

### 🔍 Discovery Knowledge Base
A curated, always-fresh database of herbs, fruits, and wellness tips — not AI-generated, deliberately chosen.

### 🚨 High Urgency Alerts
When Nura detects a red-flag symptom (chest pain, breathing difficulty, stroke signs), it immediately flags HIGH urgency and routes a server-side Discord alert — so no emergency goes unnoticed.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      USER BROWSER                           │
│                                                             │
│   ┌──────────────┐    ┌──────────────┐    ┌─────────────┐  │
│   │  React 18    │    │  Chat Agent  │    │  Discovery  │  │
│   │  + Vite      │    │  (Nura AI)   │    │  Knowledge  │  │
│   └──────┬───────┘    └──────┬───────┘    └─────────────┘  │
│          │                   │                              │
│          │     Direct API    │ ← localStorage persistence   │
│          │     (Groq REST)   │                              │
└──────────┼───────────────────┼──────────────────────────────┘
           │                   │
           ▼                   ▼
┌─────────────────────────────────────────────────────────────┐
│                    VERCEL PLATFORM                          │
│                                                             │
│   ┌──────────────────────────────────────────────────────┐  │
│   │              api/chat.js (Edge Function)             │  │
│   │         Vercel AI SDK — streamText()                 │  │
│   │         @ai-sdk/openai → Groq backend                │  │
│   │         onFinish → Discord webhook (HIGH urgency)    │  │
│   └──────────────────────┬───────────────────────────────┘  │
│                          │                                  │
│   ┌──────────────────────▼───────────────────────────────┐  │
│   │                 AI Gateway                           │  │
│   │    (Vercel routes all AI traffic through gateway)    │  │
│   └──────────────────────┬───────────────────────────────┘  │
└──────────────────────────┼──────────────────────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │   Groq API             │
              │   Llama 3.3 70B        │
              │   (Free Tier)          │
              └────────────────────────┘
```

---

## 🧩 User Journey

```
Landing Page
    │
    ▼
Onboarding (Name · Age · Conditions · Medications)
    │
    ▼
Home Dashboard ──────────────────────────────┐
    │                                        │
    ├── 💬 How You're Feeling (Nura Chat)   │
    │        │                               │
    │        ▼                               │
    │   Nura asks focused questions          │
    │        │                               │
    │        ▼                               │
    │   Urgency Assessment                   │
    │     ├── LOW → Natural remedies         │
    │     ├── MID → Monitor + tips           │
    │     └── HIGH → See doctor + alert 🚨  │
    │        │                               │
    │        ▼                               │
    │   Record auto-saved                    │
    │                                        │
    ├── 🩺 Checkups (past assessments)      │
    ├── 🔍 Discovery (herbs · fruits · tips)│
    └── 📋 Records (full health timeline) ──┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18 + Vite | SPA with fast HMR |
| **AI Agent** | Vercel AI SDK (`streamText`) | ChatSDK track compliance |
| **AI Gateway** | Vercel AI Gateway | Routed AI traffic on Vercel |
| **Language Model** | Groq · Llama 3.3 70B Versatile | Free, ultra-fast inference |
| **Styling** | Vanilla CSS — Glassmorphism + Green theme | Premium health aesthetic |
| **Persistence** | `localStorage` | Chat + profile + records |
| **Platform Alerts** | Discord Webhook (server-side) | HIGH urgency notifications |
| **Deployment** | Vercel | Global edge deployment |

---

## 🏆 ChatSDK Track Compliance

> **Track:** *"Build agents using Vercel AI SDK + AI Gateway + ChatSDK that interface across Slack, Discord, Teams, GitHub, and more."*

| Requirement | Implementation |
|---|---|
| ✅ **Vercel AI SDK** | `streamText()` in `api/chat.js` with `@ai-sdk/openai` |
| ✅ **AI Gateway** | All AI requests route through Vercel's AI Gateway on deployment |
| ✅ **ChatSDK** | Agent-style health triage using streaming responses |
| ✅ **Platform Interface** | Discord webhook fires server-side on `HIGH` urgency detection |

---

## 🚀 Running Locally

### 1. Clone & Install

```bash
git clone https://github.com/ZelalemAzmera/nuracare.git
cd nuracare
npm install
```

### 2. Get a Free Groq API Key

Go to **[console.groq.com](https://console.groq.com)** → Sign up free → API Keys → Create API Key

### 3. Set Up Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
VITE_GROQ_API_KEY=gsk_your_key_here
```

### 4. Run

```bash
npm run dev
```

Open **http://localhost:5173** — the full app works immediately.

---

## 🌐 Deploying to Vercel

1. Push to GitHub (already done)
2. Import repo at [vercel.com/new](https://vercel.com/new)
3. Add environment variables in Vercel dashboard:

| Variable | Value |
|---|---|
| `VITE_GROQ_API_KEY` | Your Groq key (for frontend direct calls) |
| `GROQ_API_KEY` | Same key (for `api/chat.js` server-side) |
| `DISCORD_WEBHOOK_URL` | *(Optional)* Discord webhook for HIGH urgency alerts |

4. Deploy — Vercel auto-detects Vite config

---

## 🌱 What Makes NuraCare Different

| Feature | Generic AI (ChatGPT) | NuraCare |
|---|---|---|
| Knows your profile | ❌ | ✅ Age, conditions, meds |
| Urgency triage | ❌ | ✅ LOW / MID / HIGH |
| Natural remedies | ❌ | ✅ Personalized herbs & diet |
| Health history | ❌ | ✅ Auto-logged every session |
| Chat memory | ❌ | ✅ Persists across reloads |
| Emergency alerts | ❌ | ✅ Discord webhook |
| Discovery library | ❌ | ✅ Herbs, fruits, wellness tips |

---

## 👥 Who It's For

- 🏠 Anyone who wants a 24/7 intelligent health companion
- 💊 People managing chronic conditions (diabetes, hypertension, asthma)
- 🌍 Communities with limited access to immediate medical care
- 🌿 People who prefer natural approaches before medication

---

## 💡 The Name

**NuraCare** — *Nura* (Arabic/Amharic: **نور** — light, glow) + *Care*.  
Your light in the dark moments of health uncertainty.

---

<div align="center">

**Built with 💚 for the Vercel AI Hackathon 2026**

*NuraCare is not a replacement for professional medical advice. Always consult a qualified healthcare provider for serious concerns.*

</div>
