import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/globals.css';

// Konfiguracja dla lepszej wydajności Three.js
import { extend } from '@react-three/fiber';
import * as THREE from 'three';

// Rozszerz Three.js o dodatkowe geometrie jeśli potrzebne
extend(THREE);

// Error boundary dla lepszego debugowania
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Konfigurator Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          fontFamily: 'Inter, sans-serif',
          textAlign: 'center',
          padding: '20px'
        }}>
          <h1 style={{ color: '#dc3545', marginBottom: '20px' }}>
            🚨 Ups! Coś poszło nie tak
          </h1>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Konfigurator szaf napotkał nieoczekiwany błąd
          </p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              backgroundColor: '#E17C4F',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            🔄 Odśwież stronę
          </button>
          {import.meta.env.DEV && (
            <details style={{ marginTop: '20px', textAlign: 'left' }}>
              <summary style={{ cursor: 'pointer', color: '#666' }}>
                Pokaż szczegóły błędu (dev)
              </summary>
              <pre style={{ 
                backgroundColor: '#f8f9fa', 
                padding: '15px', 
                borderRadius: '6px',
                fontSize: '12px',
                overflow: 'auto',
                marginTop: '10px'
              }}>
                {this.state.error?.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

// Sprawdź wsparcie WebGL
function checkWebGLSupport() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!gl;
  } catch (e) {
    return false;
  }
}

// Sprawdź czy przeglądarka obsługuje wszystkie potrzebne funkcje
function checkBrowserSupport() {
  const requiredFeatures = {
    webgl: checkWebGLSupport(),
    es6: typeof Symbol !== 'undefined',
    promises: typeof Promise !== 'undefined'
  };

  const unsupported = Object.entries(requiredFeatures)
    .filter(([, supported]) => !supported)
    .map(([feature]) => feature);

  return {
    supported: unsupported.length === 0,
    missing: unsupported
  };
}

// Główna funkcja uruchamiająca
function initializeApp() {
  const support = checkBrowserSupport();
  
  if (!support.supported) {
    // Pokaż komunikat o nieobsługiwanej przeglądarce
    document.body.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        font-family: Inter, sans-serif;
        text-align: center;
        padding: 20px;
        background-color: #f8f9fa;
      ">
        <h1 style="color: #dc3545; margin-bottom: 20px;">
          ⚠️ Przeglądarka nieobsługiwana
        </h1>
        <p style="color: #666; margin-bottom: 20px; max-width: 500px;">
          Konfigurator szaf wymaga nowoczesnej przeglądarki z obsługą WebGL i ES6.
          <br/>Brakuje: ${support.missing.join(', ')}
        </p>
        <p style="color: #666; font-size: 14px;">
          Zalecamy użycie: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
        </p>
      </div>
    `;
    return;
  }

  // Inicjalizuj aplikację React
  const root = createRoot(document.getElementById('root'));
  
  root.render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>
  );

  // Log informacji o uruchomieniu
  if (import.meta.env.DEV) {
    console.log('🎮 Konfigurator Szaf - wersja deweloperska');
    console.log('📊 Three.js:', THREE.REVISION);
    console.log('⚛️ React:', React.version);
    console.log('🖥️ WebGL:', checkWebGLSupport() ? 'Obsługiwane' : 'Nieobsługiwane');
  }
}

// Uruchom aplikację gdy DOM będzie gotowy
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
