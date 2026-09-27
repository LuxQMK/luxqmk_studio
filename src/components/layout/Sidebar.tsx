import React from 'react';
import { useUIStore, ViewTab } from '../../store/useUIStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useDeviceStore } from '../../store/useDeviceStore';
import { useI18n } from '../../i18n';
import logoSvg from '../../../assets/logo.svg';

interface NavItem {
  id: ViewTab;
  labelKey: string;
  icon: React.ReactNode;
  disabled?: boolean;
  tooltip?: string;
  badge?: string;
}

export const Sidebar: React.FC = () => {
  const { activeView, setActiveView, setAppSettingsOpen, setAboutOpen, showToast } = useUIStore();
  const { isConnected, isViaSupported, activeDescriptor } = useDeviceStore();
  const { checkCloudUpdates } = useSettingsStore();
  const { t } = useI18n();

  const isDesktop = typeof window !== 'undefined' && !!window.electronAPI && !!window.electronAPI.isDesktop;

  const handleCheckUpdates = async () => {
    showToast(t('btnCheckingUpdates'), 'info');
    await checkCloudUpdates();
    const store = useSettingsStore.getState();
    if (store.studioUpdate.available) {
      showToast(t('lblStudioUpdateAvailable'), 'warning');
      setActiveView('settings');
    } else {
      showToast(t('lblStudioUpToDate'), 'success');
    }
  };

  const isKeymapDisabled = isConnected && !isViaSupported;
  const isMacroDisabled = isConnected && !isViaSupported;
  const isEncoderDisabled = isConnected && activeDescriptor?.capabilities?.hasRotaryEncoder === false;
  const isLightingDisabled = isConnected && activeDescriptor?.capabilities?.hasLighting === false;

  const navItems: NavItem[] = [
    {
      id: 'keymap',
      labelKey: 'navKeymap',
      disabled: isKeymapDisabled,
      tooltip: isKeymapDisabled ? t('lblViaDisabledTooltip') : undefined,
      badge: isKeymapDisabled ? 'NO VIA' : undefined,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2"></rect>
          <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M7 16h10"></path>
        </svg>
      ),
    },
    {
      id: 'macro',
      labelKey: 'navMacro',
      disabled: isMacroDisabled,
      tooltip: isMacroDisabled ? t('lblMacroDisabledTooltip') : undefined,
      badge: isMacroDisabled ? 'NO VIA' : undefined,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
      ),
    },
    {
      id: 'encoder',
      labelKey: 'navEncoder',
      disabled: isEncoderDisabled,
      tooltip: isEncoderDisabled ? t('lblEncoderDisabledTooltip') : undefined,
      badge: isEncoderDisabled ? 'NO KNOB' : undefined,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9"></circle>
          <circle cx="12" cy="12" r="3"></circle>
          <line x1="12" y1="3" x2="12" y2="7"></line>
        </svg>
      ),
    },
    {
      id: 'tester',
      labelKey: 'navTester',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      ),
    },
    {
      id: 'lighting',
      labelKey: 'navLighting',
      disabled: isLightingDisabled,
      tooltip: isLightingDisabled ? t('lblLightingDisabledTooltip') : undefined,
      badge: isLightingDisabled ? 'NO RGB' : undefined,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18h6"></path>
          <path d="M10 22h4"></path>
          <path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z"></path>
        </svg>
      ),
    },
    ...(isDesktop ? [{
      id: 'studio_lighting' as ViewTab,
      labelKey: 'navStudioLighting',
      disabled: isLightingDisabled,
      tooltip: isLightingDisabled ? t('lblLightingDisabledTooltip') : undefined,
      badge: isLightingDisabled ? 'NO RGB' : undefined,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
          <path d="M5 3v4"></path>
          <path d="M19 17v4"></path>
        </svg>
      ),
    }] : []),
    {
      id: 'backup',
      labelKey: 'navBackup',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
          <polyline points="17 21 17 13 7 13 7 21"></polyline>
          <polyline points="7 3 7 8 15 8"></polyline>
        </svg>
      ),
    },
    {
      id: 'settings',
      labelKey: 'navSettings',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      ),
    },
  ];

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="sidebar-logo-badge">
          <img src={logoSvg} alt="LuxQMK" className="sidebar-logo-img" />
        </div>
        <div className="sidebar-brand-text">
          <h2>{t('appName')}</h2>
          <span>{t('appSubtitle')}</span>
        </div>
      </div>

      {/* 8 Main Navigation Items */}
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            id={`nav-btn-${item.id}`}
            className={`nav-item-btn ${activeView === item.id ? 'active' : ''} ${item.disabled ? 'disabled' : ''}`}
            disabled={item.disabled}
            title={item.tooltip}
            onClick={() => {
              if (!item.disabled) {
                setActiveView(item.id);
              }
            }}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{t(item.labelKey)}</span>
            {item.badge && (
              <span
                className="nav-disabled-badge"
                style={{
                  marginLeft: 'auto',
                  fontSize: '0.65rem',
                  padding: '2px 5px',
                  borderRadius: '4px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: '#ef4444',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                }}
              >
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Sidebar Footer with 3 Modal Buttons */}
      <div className="sidebar-footer">
        <div className="sidebar-footer-grid">
          <button
            type="button"
            className="sidebar-icon-btn"
            id="btnAppSettings"
            title={t('btnAppSettingsTitle')}
            onClick={() => setAppSettingsOpen(true)}
          >
            <span className="footer-btn-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </span>
          </button>

          {isDesktop && (
            <button
              type="button"
              className="sidebar-icon-btn"
              id="btnCheckUpdates"
              title={t('btnCheckUpdatesTitle')}
              onClick={handleCheckUpdates}
            >
              <span className="footer-btn-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 4 23 10 17 10"></polyline>
                  <polyline points="1 20 1 14 7 14"></polyline>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                </svg>
              </span>
            </button>
          )}

          <button
            type="button"
            className="sidebar-icon-btn"
            id="btnAboutApp"
            title={t('btnAboutAppTitle')}
            onClick={() => setAboutOpen(true)}
          >
            <span className="footer-btn-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
};
