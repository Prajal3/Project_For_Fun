import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthContexProvider } from './context/authContex'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthContexProvider>
      <App />
    </AuthContexProvider>
  </StrictMode>,
)