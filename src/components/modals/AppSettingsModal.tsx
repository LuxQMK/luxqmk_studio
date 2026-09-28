import React, { useState, useEffect } from 'react';
import { useUIStore } from '../../store/useUIStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useI18n } from '../../i18n';
import { APP_VERSION } from '../../version';

export const AppSettingsModal: React.FC = () => {
  const { isAppSettingsOpen, setAppSettingsOpen, showToast } = useUIStore();
  const { studioUpdate, checkCloudUpdates, startStudioDownload, applyStudioUpdate, setIncludeBeta } = useSettingsStore();
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

  const handleToggleIncludeBeta = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVal = e.target.checked;
    await setIncludeBeta(nextVal);
    showToast(
      nextVal
        ? (language === 'pl' ? 'Włączono kanał testowy Beta. Sprawdzanie wydań...' : 'Beta channel enabled. Checking preview builds...')
        : (language === 'pl' ? 'Przełączono na kanał stabilny.' : 'Switched to stable channel.'),
      'info'
    );
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

  const openExternalUrl = (url: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (isDesktop && window.electronAPI && typeof window.electronAPI.openExternal === 'function') {
      window.electronAPI.openExternal(url);
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCheckUpdates = async () => {
    showToast(t('btnCheckingUpdates'), 'info');
    await checkCloudUpdates();
    const store = useSettingsStore.getState();
    if (store.studioUpdate.available) {
      showToast(t('lblStudioUpdateAvailable'), 'warning');
    } else {
      showToast(t('lblStudioUpToDate'), 'success');
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
      <div className="modal-card" style={{ maxWidth: '620px' }}>
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
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{t('modalAppSettingsSubtitle')}</span>
            </div>
          </div>
          <button className="modal-close-btn" id="btnCloseAppSettingsModal" onClick={() => setAppSettingsOpen(false)}>
            &times;
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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
          {isDesktop && (
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
          )}

          {/* 3. Beta / Prerelease Channel Toggle (Desktop Only) */}
          {isDesktop && (
            <div className="modal-section" id="appBetaUpdatesModalSection">
              <div className="modal-section-title">
                <span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 2v7.31"></path>
                    <path d="M14 9.3V1.99"></path>
                    <path d="M8.5 2h7"></path>
                    <path d="M14 9.3a6.5 6.5 0 1 1-4 0"></path>
                    <path d="M5.52 16h12.96"></path>
                  </svg>
                </span>
                <span>{t('lblIncludeBetaUpdates')}</span>
              </div>
              <div className="modal-section-content">
                <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.6rem' }}>
                  {t('lblIncludeBetaUpdatesDesc')}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <label className="switch" style={{ margin: 0 }}>
                    <input
                      type="checkbox"
                      id="chkAppIncludeBetaModal"
                      checked={studioUpdate.includeBeta}
                      onChange={handleToggleIncludeBeta}
                    />
                    <span className="slider"></span>
                  </label>
                  <span id="lblAppBetaChannelStatus" style={{ fontSize: '0.85rem', fontWeight: 500, color: studioUpdate.includeBeta ? 'var(--accent-purple, #bd00ff)' : 'var(--text-muted)' }}>
                    {studioUpdate.includeBeta ? t('lblChannelBeta') : t('lblChannelStable')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 4. Studio App Updates & Environment Section */}
          <div className="modal-section">
            <div className="modal-section-title">
              <span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                  <line x1="8" y1="21" x2="16" y2="21"></line>
                  <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
              </span>
              <span>{isDesktop ? t('cardStudioUpdatesTitle') : t('lblStudioDesktopAppTitle')}</span>
            </div>
            <div className="modal-section-content">
              <div style={{
                background: isDesktop && (studioUpdate.available || studioUpdate.isDownloaded) ? 'rgba(189, 0, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                border: `1px solid ${isDesktop && (studioUpdate.available || studioUpdate.isDownloaded) ? 'rgba(189, 0, 255, 0.35)' : 'var(--border-color)'}`,
                borderRadius: '10px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                        LuxQMK Studio {isDesktop ? `v${studioUpdate.currentVersion || APP_VERSION}` : `Web (v${APP_VERSION})`}
                      </strong>
                      <span className={`badge-pill ${studioUpdate.isDownloaded ? 'badge-success' : isDesktop && studioUpdate.available ? (studioUpdate.isPrerelease ? 'badge-warning' : 'badge-warning') : 'badge-success'}`}>
                        {isDesktop
                          ? (studioUpdate.isDownloaded
                              ? t('lblDownloadedBadge', 'Ready to Install')
                              : studioUpdate.available
                                ? `${studioUpdate.isPrerelease ? 'Beta: ' : 'New: '}v${studioUpdate.latestVersion}`
                                : t('lblStudioUpToDate'))
                          : t('lblAppWebModeBadge')}
                      </span>
                      {isDesktop && studioUpdate.includeBeta && (
                        <span className="badge-pill badge-neutral" style={{ fontSize: '0.7rem', borderColor: 'rgba(189, 0, 255, 0.4)', color: '#d066ff' }}>
                          {t('lblChannelBeta')}
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      {isDesktop
                        ? (studioUpdate.isDownloaded
                            ? t('lblUpdateReadyToInstall', 'Update downloaded! Restart to apply changes.')
                            : studioUpdate.available
                              ? (studioUpdate.isPrerelease
                                  ? (language === 'pl' ? `Dostępne nowe wydanie testowe (${studioUpdate.releaseTag || `v${studioUpdate.latestVersion}`})` : `New preview release available (${studioUpdate.releaseTag || `v${studioUpdate.latestVersion}`})`)
                                  : t('lblStudioUpdateAvailable'))
                              : `${language === 'pl' ? 'Oficjalny rejestr wydań' : 'Official release manifest'} (${studioUpdate.releaseTag || `v${APP_VERSION}`})`)
                        : t('lblAppWebModeDesc')}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {isDesktop && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        disabled={studioUpdate.isChecking || studioUpdate.isDownloading}
                        onClick={handleCheckUpdates}
                        style={{ padding: '0.45rem 0.8rem', fontSize: '0.8rem' }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={studioUpdate.isChecking ? 'spin' : ''}>
                          <polyline points="23 4 23 10 17 10"></polyline>
                          <polyline points="1 20 1 14 7 14"></polyline>
                          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                        </svg>
                        <span>{studioUpdate.isChecking ? t('btnCheckingUpdates') : t('btnCheckUpdates')}</span>
                      </button>
                    )}

                    {isDesktop && studioUpdate.isDownloaded && (
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={applyStudioUpdate}
                        style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="23 4 23 10 17 10"></polyline>
                          <polyline points="1 20 1 14 7 14"></polyline>
                          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                        </svg>
                        <span>{t('btnRestartAndInstall', 'Restart & Install')}</span>
                      </button>
                    )}

                    {isDesktop && studioUpdate.available && !studioUpdate.isDownloaded && !studioUpdate.isDownloading && (
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={startStudioDownload}
                        style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="7 10 12 15 17 10"></polyline>
                          <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        <span>{t('btnDownloadUpdate', 'Download & Update')}</span>
                      </button>
                    )}

                    {!isDesktop && (
                      <a
                        href={studioUpdate.downloadUrl || `https://files.luxqmk.click/studio/v${APP_VERSION}/LuxQMK-Studio-Setup-${APP_VERSION}.exe`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary"
                        onClick={(e) => openExternalUrl(studioUpdate.downloadUrl || `https://files.luxqmk.click/studio/v${APP_VERSION}/LuxQMK-Studio-Setup-${APP_VERSION}.exe`, e)}
                        style={{ textDecoration: 'none', padding: '0.45rem 0.85rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="7 10 12 15 17 10"></polyline>
                          <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        <span>{t('btnDownloadStudioInstaller')}</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Download Progress Bar if in progress */}
                {isDesktop && studioUpdate.isDownloading && (
                  <div style={{ marginTop: '0.2rem', paddingTop: '0.6rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.35rem' }}>
                      <span>{t('lblDownloadingUpdate', 'Downloading update...')}</span>
                      <span>{studioUpdate.downloadPercent}% {studioUpdate.downloadSpeedText ? `(${studioUpdate.downloadSpeedText})` : ''}</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${studioUpdate.downloadPercent}%`,
                          background: 'linear-gradient(90deg, var(--accent-cyan, #00f0ff), var(--accent-purple, #bd00ff))',
                          borderRadius: '3px',
                          transition: 'width 0.2s ease',
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
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
