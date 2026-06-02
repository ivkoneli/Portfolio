import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Scene from './components/scene/Scene'
import ProjectPanel from './components/project/ProjectPanel'
import ProfilePanel from './components/project/ProfilePanel'
import InteractHint from './components/interaction/InteractHint'
import IntroOverlay from './components/ui/IntroOverlay'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <>
      <Scene />
      <ProjectPanel />
      <ProfilePanel />
      <InteractHint />
      <IntroOverlay />
    </>
  </StrictMode>
)
