import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

// Initialize React root with strict mode
const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
      <Toaster 
        position="bottom-center"
        toastOptions={{
          style: {
            background: '#27272a',
            color: '#fff',
            borderRadius: '0.5rem',
          },
        }}
      />
    </StrictMode>
  );
}