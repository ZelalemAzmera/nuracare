# NuraCare — AI Life Care Companion

> **Hackathon Project** — Vercel AI Hackathon 2026  
> **Track**: Build with AI SDK + Build with v0 + Workflow Agents

---

## 💡 The Idea

Most people don't go to the doctor at the right time — they either wait too long or go too early. And after they visit, they're left alone with a prescription and no real support.

**NuraCare** is an AI-powered life care companion that stays with you — before, during, and after any health concern.

---

## 🌿 What Makes NuraCare Different from ChatGPT

ChatGPT gives you generic answers. NuraCare:

1. **Knows you personally** — your age, conditions, medications. Every response is personalized.
2. **Judges urgency intelligently** — it tells you whether to go to the ER now, schedule a visit, or just rest.
3. **Suggests natural remedies first** — if a condition is low-urgency and manageable, Nura recommends herbs, diet, and lifestyle changes before pushing medication.
4. **Follows up after treatment** — once you see a doctor, Nura becomes your nurse: asks what the doctor said, logs your medication, and checks in on your recovery.
5. **Has a Discovery layer** — an always-fresh knowledge base of herbs, fruits, and wellness tips.
6. **Remembers your history** — every session is logged so you and your doctor can see your health journey.

---

## 🧩 The User Journey

```
Landing Page → Onboarding (Profile) → Dashboard → Chat with Nura
                                                       ↓
                                              Urgency Assessment
                                                  ↙        ↘
                                           LOW/MID          HIGH
                                        Natural Remedies   See Doctor
                                              ↓               ↓
                                         Follow-up       Follow-up
                                      (Doctor visit?)   (What did doc say?)
                                              ↓
                                       Recovery Tracking
```

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| AI Chat | Vercel AI SDK (`useChat`, `streamText`) |
| Language Model | Google Gemini (via AI SDK) |
| UI Components | Built with v0 |
| Styling | Vanilla CSS — Glassmorphism + Green Natural theme |
| Data Persistence | localStorage (profile, records, chat history) |
| Deployment | Vercel |

---

## 🌱 Key Features

- **Intelligent Symptom Triage** — AI-driven urgency classification (Low / Mid / High)
- **Personalized Natural Remedies** — AI suggests specific herbs and lifestyle changes based on YOUR symptom + profile
- **Post-Visit Nurse Mode** — follow-up conversations after doctor visits
- **Health Records** — auto-logged session history
- **Discovery Page** — curated database of herbs, fruits, and health tips
- **Medication Reminders** — daily reminders on the Home dashboard
- **Onboarding Profile** — collects health baseline before first conversation

---

## 🏆 Research Backing

Studies and documented cases show that AI-assisted early intervention and continuous monitoring significantly improves health outcomes — particularly for chronic conditions. NuraCare is designed with this in mind: it's not a replacement for doctors, it's the intelligent layer that bridges the gap between visits.

---

## 👤 Who It's For

- Anyone who wants a smart, calm health companion available 24/7
- People managing chronic conditions (diabetes, hypertension, asthma)
- People in areas with limited access to immediate medical care
- Anyone who prefers natural approaches before jumping to medication

---

## 🚀 Name

**NuraCare** — *Nura* (Arabic/Amharic: light, glow) + *Care*. Your light in the dark moments of health uncertainty.
