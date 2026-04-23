import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { PorscheDesignSystemProvider } from '@porsche-design-system/components-react';
import App from './App';
import './index.css';

// Apply stored theme before render to avoid flash
const storedTheme = (localStorage.getItem('pds-theme') as 'light' | 'dark') ?? 'light';
document.documentElement.className = storedTheme;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PorscheDesignSystemProvider theme={storedTheme}>
      <App />
    </PorscheDesignSystemProvider>
  </StrictMode>
);
