import React from 'react';
import { useUIStore } from '../../store/useUIStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useI18n } from '../../i18n';
import logoSvg from '../../../assets/logo.svg';

export const UpdateModal: React.FC = () => {
  const { isUpdateModalOpen, setUpdateModalOpen } = useUIStore();
  const { studioUpdate, startStudioDownload, applyStudioUpdate } = useSettingsStore();
  const { t } = useI18n();

  const isDesktop = typeof window !== 'undefined' && !!window.electronAPI && !!window.electronAPI.isDesktop;

  if (!isUpdateModalOpen) return null;

  return (
    <div
      className={`modal-overlay ${isUpdateModalOpen ? 'active' : ''}`}
      id="updateModal"
      onClick={(e) => {
        if (e.target === e.currentTarget && !studioUpdate.isDownloading) {
          setUpdateModalOpen(false);
        }
      }}
    >
      <div className="modal-card" style={{ maxWidth: '540px' }}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="sidebar-logo-badge" style={{ width: '44px', height: '44px' }}>
              <img src={logoSvg} alt="LuxQMK" className="sidebar-logo-img" />
            </div>
            <div>
              <h3 className="modal-title">{t('modalUpdateTitle', 'LuxQMK Studio Update Available')}</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                {studioUpdate.releaseDate ? `${studioUpdate.releaseDate} • ` : ''}files.luxqmk.click
              </span>
            </div>
          </div>
          {!studioUpdate.isDownloading && (
            <button className="modal-close-btn" id="btnCloseUpdateModal" onClick={() => setUpdateModalOpen(false)}>
              &times;
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Version Diff Banner */}
          <div
            style={{
              background: 'rgba(0, 245, 255, 0.06)',
              border: '1px solid rgba(0, 245, 255, 0.25)',
              borderRadius: '10px',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
            }}
          >
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.2rem' }}>
                {t('lblCurrentVersion', 'Current Version')}
              </div>
              <strong style={{ fontSize: '1rem', color: 'var(--text-muted, #888)' }}>
                v{studioUpdate.currentVersion}
              </strong>
            </div>

            <div style={{ color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', marginBottom: '0.2rem' }}>
                {t('lblNewVersion', 'New Version')}
              </div>
              <strong style={{ fontSize: '1.1rem', color: 'var(--accent-cyan)' }}>
                v{studioUpdate.latestVersion}
              </strong>
            </div>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #ccc)', lineHeight: '1.5', margin: '0 0 1rem 0' }}>
            {t('modalUpdatePrompt', { version: studioUpdate.latestVersion })}
          </p>

          {/* Changelog list if available */}
          {studioUpdate.changelog && studioUpdate.changelog.length > 0 && (
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '0.85rem 1rem',
                maxHeight: '160px',
                overflowY: 'auto',
                marginBottom: '1rem',
              }}
            >
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                {t('lblChangelog', 'What\'s new:')}
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.78rem', color: 'var(--text-dim)', lineHeight: '1.6' }}>
                {studioUpdate.changelog.map((entry, idx) => (
                  <li key={idx}>{entry}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Download Progress Bar */}
          {studioUpdate.isDownloading && (
            <div style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.4rem' }}>
                <span>{t('lblDownloadingUpdate', 'Downloading update...')}</span>
                <span>{studioUpdate.downloadPercent}% {studioUpdate.downloadSpeedText ? `(${studioUpdate.downloadSpeedText})` : ''}</span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${studioUpdate.downloadPercent}%`,
                    background: 'linear-gradient(90deg, var(--accent-cyan, #00f0ff), var(--accent-purple, #bd00ff))',
                    borderRadius: '4px',
                    transition: 'width 0.2s ease',
                  }}
                />
              </div>
            </div>
          )}

          {/* Ready to install notification */}
          {studioUpdate.isDownloaded && (
            <div
              style={{
                background: 'rgba(0, 255, 136, 0.08)',
                border: '1px solid rgba(0, 255, 136, 0.3)',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                color: 'var(--accent-green, #00ff88)',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <span>{t('lblUpdateReadyToInstall', 'Update is downloaded and ready to install!')}</span>
            </div>
          )}

          {/* Error Message */}
          {studioUpdate.error && (
            <div style={{ color: 'var(--accent-red, #ff4444)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
              {studioUpdate.error}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          {!studioUpdate.isDownloading && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setUpdateModalOpen(false)}
            >
              {t('btnLater', 'Later')}
            </button>
          )}

          {isDesktop ? (
            studioUpdate.isDownloaded ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={applyStudioUpdate}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 4 23 10 17 10"></polyline>
                  <polyline points="1 20 1 14 7 14"></polyline>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                </svg>
                <span>{t('btnRestartAndInstall', 'Restart & Install')}</span>
              </button>
            ) : studioUpdate.isDownloading ? (
              <button type="button" className="btn btn-primary" disabled style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="spin">
                  <line x1="12" y1="2" x2="12" y2="6"></line>
                  <line x1="12" y1="18" x2="12" y2="22"></line>
                  <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                  <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                  <line x1="2" y1="12" x2="6" y2="12"></line>
                  <line x1="18" y1="12" x2="22" y2="12"></line>
                  <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                  <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                </svg>
                <span>{t('lblDownloadingUpdate', 'Downloading...')}</span>
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={startStudioDownload}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                <span>{t('btnDownloadUpdate', 'Download & Update')}</span>
              </button>
            )
          ) : (
            <a
              href={studioUpdate.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span>{t('btnDownloadStudioInstaller', 'Download Windows Installer')}</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
