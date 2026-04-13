import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tailwind.css'
import './index.css'
import App from './App.jsx'
import { initTheme } from './lib/theme'
import { useAppStore } from './store/useAppStore'

// Initialize theme subsystem before first render.
// (index.html already painted the correct theme; this reconciles store +
// wires the OS preference listener for 'system' mode.)
initTheme()
useAppStore.getState()._initThemeSubscriptions()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
