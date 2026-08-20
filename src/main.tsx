window.addEventListener('unhandledrejection', (event) => {
  const reasonStr = String(event.reason?.message || event.reason || '');
  if (
    reasonStr.includes('WebSocket') ||
    reasonStr.includes('websocket') ||
    reasonStr.includes('vite') ||
    reasonStr.includes('closed without opened')
  ) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
});

window.addEventListener('error', (event) => {
  const msg = String(event.message || '');
  if (
    msg.includes('WebSocket') ||
    msg.includes('websocket') ||
    msg.includes('vite') ||
    msg.includes('closed without opened')
  ) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
});

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerServiceWorker } from './registerServiceWorker.ts';

// Initialize PWA Service Worker
registerServiceWorker();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

