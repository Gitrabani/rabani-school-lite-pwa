
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Initialize dark mode based on user preference or saved setting
const initializeDarkMode = () => {
  // Check for saved theme or system preference
  const isDarkMode = localStorage.getItem('theme') === 'dark' ||
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  // Apply theme to document
  if (isDarkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

// Run initialization
initializeDarkMode();

// Get the root element
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error('Root element not found');

// Render the app
createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker with better error handling
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('ServiceWorker registration successful with scope:', registration.scope);
        
        // Check for updates on page load
        registration.update();
        
        // Handle service worker updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('New service worker installed, ready to activate');
              }
            });
          }
        });
      })
      .catch(error => {
        console.error('ServiceWorker registration failed:', error);
      });
  });
  
  // Detect controller change (service worker activation)
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('Service worker controller changed');
  });
}
