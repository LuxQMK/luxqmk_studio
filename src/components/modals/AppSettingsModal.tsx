import React, { useState, useEffect } from 'react';
import { useUIStore } from '../../store/useUIStore';
import { useI18n } from '../../i18n';

export const AppSettingsModal: React.FC = () => {
  const { isAppSettingsOpen, setAppSettingsOpen, showToast } = useUIStore();
  const { language, setLanguage, t } = useI18n();

  const isDesktop = typeof window !== 'undefined' && !!window.electronAPI && !!window.electronAPI.isDesktop;
  const [autostart, setAutostart] = useState(false);

  useEffect(() => {
    if (isDesktop && window.electronAPI && typeof window.electronAPI.getAutostart === 'function') {
      window.electronAPI.getAutostart().then((enabled) => setAutostart(enabled)).catch(() => {});
    }
  }, [isDesktop, isAppSettingsOpen]);

  const handleToggleAutostart = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVal = e.target.checked;
    setAutostart(nextVal);
    if (isDesktop && window.electronAPI && typeof window.electronAPI.setAutostart === 'function') {
      try {
        await window.electronAPI.setAutostart(nextVal);
      } catch (err) {
        console.error('Failed to set autostart:', err);
      }
    }
  };

  const handleOpenAppData = async () => {
    if (isDesktop && window.electronAPI && typeof window.electronAPI.openAppDataFolder === 'function') {
      try {
        await window.electronAPI.openAppDataFolder();
        showToast(t('toastAppDataOpened'), 'success');
      } catch (err) {
        console.error('Failed to open app data:', err);
      }
    }
  };

  return (
    <div
      className={`modal-overlay ${isAppSettingsOpen ? 'active' : ''}`}
      id="appSettingsModal"
      onClick={(e) => {
        if (e.target === e.currentTarget) setAppSettingsOpen(false);
      }}
    >
      <div className="modal-card">
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-header-icon-badge">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </div>
            <div>
              <h3 className="modal-title">{t('modalAppSettingsTitle')}</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>LuxQMK Studio Preferences & Environment</span>
            </div>
          </div>
          <button className="modal-close-btn" id="btnCloseAppSettingsModal" onClick={() => setAppSettingsOpen(false)}>
            &times;
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* 1. Interface Language */}
          <div className="modal-section">
            <div className="modal-section-title">
              <span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
              </span>
              <span>{t('lblAppLang')}</span>
            </div>
            <div className="modal-section-content">
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.6rem' }}>
                {t('lblAppLangDesc')}
              </p>
              <div style={{ maxWidth: '220px' }}>
                <select
                  className="settings-select form-control"
                  id="appLanguageSelectModal"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as 'en' | 'pl')}
                >
                  <option value="en">English (US)</option>
                  <option value="pl">Polski (PL)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 2. Desktop-Only Sections: Windows Startup & AppData Folder */}
          {isDesktop ? (
            <>
              {/* Windows Startup Launch */}
              <div className="modal-section" id="appAutostartModalSection">
                <div className="modal-section-title">
                  <span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path>
                      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path>
                      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path>
                      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path>
                    </svg>
                  </span>
                  <span>{t('lblAppAutostart')}</span>
                </div>
                <div className="modal-section-content">
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.6rem' }}>
                    {t('lblAppAutostartDesc')}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <label className="switch" style={{ margin: 0 }}>
                      <input
                        type="checkbox"
                        id="chkAppAutostartModal"
                        checked={autostart}
                        onChange={handleToggleAutostart}
                      />
                      <span className="slider"></span>
                    </label>
                    <span id="lblAppAutostartStatus" style={{ fontSize: '0.85rem', fontWeight: 500, color: autostart ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>
                      {autostart ? t('lblAutostartStatusEnabled') : t('lblAutostartStatusDisabled')}
                    </span>
                  </div>
                </div>
              </div>

              {/* AppData Folder */}
              <div className="modal-section">
                <div className="modal-section-title">
                  <span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path>
                    </svg>
                  </span>
                  <span>{t('lblAppDataFolder')}</span>
                </div>
                <div className="modal-section-content">
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.6rem' }}>
                    {t('lblAppDataFolderDesc')}
                  </p>
                  <button
                    className="btn btn-secondary"
                    id="btnOpenAppDataModal"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.5rem 0.9rem', fontSize: '0.84rem' }}
                    onClick={handleOpenAppData}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <span>{t('btnOpenAppData')}</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Web Mode Environment Card */
            <div className="modal-section">
              <div className="modal-section-title">
                <span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="2" y1="12" x2="22" y2="12"></line>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                  </svg>
                </span>
                <span>{t('lblAppDiagnostics')}</span>
              </div>
              <div className="modal-section-content">
                <div style={{
                  background: 'rgba(0, 245, 255, 0.04)',
                  border: '1px solid rgba(0, 245, 255, 0.2)',
                  borderRadius: '10px',
                  padding: '0.9rem 1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.45rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="badge-pill badge-success">{t('lblAppWebModeBadge')}</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: 0, lineHeight: 1.5 }}>
                    {t('lblAppWebModeDesc')}
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="btn btn-primary" id="btnOkAppSettingsModal" style={{ minWidth: '90px' }} onClick={() => setAppSettingsOpen(false)}>
            {t('btnOk')}
          </button>
        </div>
      </div>
    </div>
  );
};
