import React, { useEffect } from 'react';
import { useUIStore } from './store/useUIStore';
import { useDeviceStore } from './store/useDeviceStore';

// Layout Components
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';

// Modals & Overlays
import { AppSettingsModal } from './components/modals/AppSettingsModal';
import { AboutModal } from './components/modals/AboutModal';
import { AppToast } from './components/modals/AppToast';

// 8 Primary Views (1:1 with legacy_index.html)
import { KeymapView } from './views/KeymapView';
import { MacroView } from './views/MacroView';
import { EncoderView } from './views/EncoderView';
import { TesterView } from './views/TesterView';
import { LightingView } from './views/LightingView';
import { StudioLightingView } from './views/StudioLightingView';
import { BackupView } from './views/BackupView';
import { SettingsView } from './views/SettingsView';

export const App: React.FC = () => {
  const { activeView } = useUIStore();
  const { autoConnect } = useDeviceStore();

  // Try auto-connecting to previously paired WebHID devices on boot
  useEffect(() => {
    autoConnect();
  }, [autoConnect]);

  const isDesktop = typeof window !== 'undefined' && !!window.electronAPI && !!window.electronAPI.isDesktop;

  return (
    <div className="app-wrapper">
      {/* 1. Left Sidebar Navigation (8 Views + Footer Modals) */}
      <Sidebar />

      {/* 2. Main App Content */}
      <main className="main-content">
        {/* Top Action Bar */}
        <TopBar />

        {/* 8 Primary Views */}
        {activeView === 'keymap' && <KeymapView />}
        {activeView === 'macro' && <MacroView />}
        {activeView === 'encoder' && <EncoderView />}
        {activeView === 'tester' && <TesterView />}
        {activeView === 'lighting' && <LightingView />}
        {activeView === 'studio_lighting' && (isDesktop ? <StudioLightingView /> : <LightingView />)}
        {activeView === 'backup' && <BackupView />}
        {activeView === 'settings' && <SettingsView />}
      </main>

      {/* 3. Global Modals & Notifications */}
      <AppSettingsModal />
      <AboutModal />
      <AppToast />
    </div>
  );
};

export default App;
