import { StrictMode } from 'react'
import * as ReactDOM from 'react-dom'
import './index.css'
import App from './App'

const root = document.getElementById('root')

if (root) {
  ;(ReactDOM as any).render(
    <StrictMode>
      <App />
    </StrictMode>,
    root,
  )
}
