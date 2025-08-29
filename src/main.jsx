import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {Masjid1} from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Masjid1 />
  </StrictMode>,
)
