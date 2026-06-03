import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './audio/sound'   // installs the global UI-click sound listener
import Scene from './components/scene/Scene'
import ProjectPanel from './components/project/ProjectPanel'
import ProfilePanel from './components/project/ProfilePanel'
import InteractHint from './components/interaction/InteractHint'
import IntroOverlay from './components/ui/IntroOverlay'
import LoadingScreen from './components/ui/LoadingScreen'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <>
      <Scene />
      <ProjectPanel />
      <ProfilePanel />
      <InteractHint />
      <IntroOverlay />
      <LoadingScreen />
    </>
  </StrictMode>
)
