import React from 'react'
import ReactDOM from 'react-dom/client'
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"
import App from './App.jsx'
import '../css/style.css'
import '../css/toast.css'
import '../css/skeleton.css'
import { AuthProvider } from './AuthContext'
import SharedChatPage from './SharedChatPage'

const root = ReactDOM.createRoot(document.getElementById('root'))

if (window.location.pathname.startsWith('/share/')) {
  const token = window.location.pathname.split('/share/')[1]
  root.render(
    <React.StrictMode>
      <SharedChatPage token={token} />
      <Analytics />
      <SpeedInsights />
    </React.StrictMode>
  )
} else {
  root.render(
    <React.StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
      <Analytics />
      <SpeedInsights />
    </React.StrictMode>
  )
}
