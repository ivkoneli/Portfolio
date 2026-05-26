import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Scene from './components/Scene'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Scene />
  </StrictMode>
)
