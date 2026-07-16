import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/sn-pro/400.css'
import '@fontsource/sn-pro/500.css'
import '@fontsource/stix-two-text/400.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
