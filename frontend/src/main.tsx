import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

window.addEventListener('error', (event) => {
  console.error("GLOBAL REACT CRASH:", event.error);
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
