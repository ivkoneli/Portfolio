import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Scene from './components/Scene'
import ProjectPanel from './components/ProjectPanel'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <>
      <Scene />
      <ProjectPanel />
    </>
  </StrictMode>
)
