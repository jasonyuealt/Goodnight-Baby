import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { ThemeProvider } from './contexts/ThemeContext'
import { FontSizeProvider } from './contexts/FontSizeContext'
import { SettingsProvider } from './contexts/SettingsContext'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <FontSizeProvider>
        <SettingsProvider>
          <App />
        </SettingsProvider>
      </FontSizeProvider>
    </ThemeProvider>
  </StrictMode>,
)
