import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { useUIStore } from './store/useUIStore';
import { useDeviceStore } from './store/useDeviceStore';
import { useKeymapStore } from './store/useKeymapStore';
import { useLightingStore } from './store/useLightingStore';
import { useVisualizerStore } from './store/useVisualizerStore';
import { useSettingsStore } from './store/useSettingsStore';
import { useMacroStore } from './store/useMacroStore';
import { useKeyboardThemeStore } from './store/useKeyboardThemeStore';
import { useI18n } from './i18n';
import { ALL_DEVICE_DESCRIPTORS } from './data/devices';

(window as any).__stores = {
  useUIStore,
  useDeviceStore,
  useKeymapStore,
  useLightingStore,
  useVisualizerStore,
  useSettingsStore,
  useMacroStore,
  useKeyboardThemeStore,
  useI18n,
  ALL_DEVICE_DESCRIPTORS,
};

const rootEl = document.getElementById('root');
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

