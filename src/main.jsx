import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from '@/app/App'
import { startSmoothScroll } from '@/lib/scroll/startSmoothScroll'

import 'lenis/dist/lenis.css'
import './index.css'

startSmoothScroll()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
