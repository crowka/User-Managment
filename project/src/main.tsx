import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

async function start() {
  // Initialize MSW in development mode
  if (import.meta.env.DEV) {
    const { worker } = await import('./mocks/browser');
    worker.start({ onUnhandledRequest: 'bypass' });
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

start();
