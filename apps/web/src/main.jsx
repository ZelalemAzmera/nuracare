import React from 'react'
import ReactDOM from 'react-dom/client'
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"
import App from '@/App.jsx'
import '@/styles/index.css'
import '@/styles/toast.css'
import '@/styles/skeleton.css'
import { AuthProvider } from '@/context/AuthContext'
import { CheckupsProvider } from '@/hooks/useCheckups'
import SharedChatPage from '@/features/chat/SharedChatPage'

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
        <CheckupsProvider>
          <App />
        </CheckupsProvider>
      </AuthProvider>
      <Analytics />
      <SpeedInsights />
    </React.StrictMode>
  )
}

