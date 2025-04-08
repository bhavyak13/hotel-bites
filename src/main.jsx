import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { FirebaseProvider } from './context/firebase.jsx'
import { BASE_URL } from './context/utils.js'



createRoot(document.getElementById('root')).render(
  // <StrictMode>
  <BrowserRouter >
    <FirebaseProvider>
      <App />
    </FirebaseProvider>
  </BrowserRouter>
  // </StrictMode>,
)
