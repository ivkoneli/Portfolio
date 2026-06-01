import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Scene from './components/Scene'
import ProjectPanel from './components/ProjectPanel'
import InteractHint from './components/InteractHint'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <>
      <Scene />
      <ProjectPanel />
      <InteractHint />
    </>
  </StrictMode>
)
