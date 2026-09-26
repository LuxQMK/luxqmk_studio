import React, { useState, useRef } from 'react';
import { useDeviceStore } from '../store/useDeviceStore';
import { useUIStore } from '../store/useUIStore';
import { useI18n } from '../i18n';
import { createFullBackup, restoreFullBackup } from '../services/backup-service';

interface LogLine {
  time: string;
  msg: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

export const BackupView: React.FC = () => {
  const { isConnected } = useDeviceStore();
  const { showToast } = useUIStore();
  const { t } = useI18n();

  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);

  const [selectedBackupFile, setSelectedBackupFile] = useState<File | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreProgress, setRestoreProgress] = useState(0);

  const [logs, setLogs] = useState<LogLine[]>([
    { time: `[${new Date().toTimeString().slice(0, 8)}]`, msg: 'Ready. Connect keyboard via WebHID to start transmission.', type: 'info' }
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const addLog = (msg: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const time = new Date().toTimeString().slice(0, 8);
    setLogs((prev) => [...prev, { time: `[${time}]`, msg, type }]);
  };

  const handleCreateBackup = async () => {
    if (!isConnected) {
      showToast(t('warnConnectKeyboard', 'Connect keyboard first!'), 'warning');
      return;
    }
    setIsBackingUp(true);
    setBackupProgress(0);

    try {
      const backupData = await createFullBackup((p) => setBackupProgress(p), addLog);
      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const filename = `${backupData.keyboard_name.replace(/[^a-zA-Z0-9_-]/g, '_')}_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      showToast(t('toastBackupExportSuccess'), 'success');
    } catch (err: any) {
      addLog(`Backup error: ${err.message}`, 'error');
      showToast(`${t('toastErrorPrefix')}: ${err.message}`, 'error');
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestoreFile = (file: File) => {
    setSelectedBackupFile(file);
    addLog(`Loaded backup file: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`, 'info');
    showToast(`${t('toastBackupLoaded')}: ${file.name}`, 'info');
  };

  const handleFlashBackup = async () => {
    if (!selectedBackupFile) return;
    if (!isConnected) {
      showToast(t('warnConnectKeyboard', 'Connect keyboard first!'), 'warning');
      return;
    }
    setIsRestoring(true);
    setRestoreProgress(0);

    try {
      const text = await selectedBackupFile.text();
      const backupData = JSON.parse(text);
      await restoreFullBackup(backupData, (p) => setRestoreProgress(p), addLog);
      showToast(t('toastBackupRestoreSuccess'), 'success');
    } catch (err: any) {
      addLog(`Restore error: ${err.message}`, 'error');
      showToast(`${t('toastErrorPrefix')}: ${err.message}`, 'error');
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <section className="view-container active" id="view-backup">
      <div className="grid-2">
        {/* Backup Card */}
        <div className="palette-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <span className="settings-card-icon" style={{ background: 'rgba(0, 240, 255, 0.1)', color: 'var(--accent-cyan)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
            </span>
            <div>
              <h3>{t('backupTitle')}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{t('backupDesc')}</p>
            </div>
          </div>

          <ul
            className="feature-checklist"
            style={{
              margin: '0.75rem 0 1.25rem 0',
              fontSize: '0.82rem',
              color: 'var(--text-muted)',
              listStyle: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem',
            }}
          >
            <li>{t('backupFeatureLayers')}</li>
            <li>{t('backupFeatureEncoder')}</li>
            <li>{t('backupFeatureMacros')}</li>
            <li>{t('backupFeatureRgb')}</li>
            <li>{t('backupFeatureCustom')}</li>
          </ul>

          {isBackingUp && (
            <div className="progress-container" style={{ display: 'block', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.35rem', color: 'var(--text-muted)' }}>
                <span>{t('backupProgressReading')}</span>
                <span>{backupProgress}%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${backupProgress}%` }}></div>
              </div>
            </div>
          )}

          <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
            <button
              type="button"
              className="btn btn-primary"
              id="btnCreateBackup"
              style={{ width: '100%' }}
              disabled={!isConnected || isBackingUp}
              onClick={handleCreateBackup}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span>{t('btnDownloadBackup')}</span>
            </button>
          </div>
        </div>

        {/* Restore Card */}
        <div className="palette-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <span className="settings-card-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--secondary)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
            </span>
            <div>
              <h3>{t('restoreTitle')}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{t('restoreDesc')}</p>
            </div>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            accept=".json"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleRestoreFile(file);
            }}
          />

          <div
            className="dropzone"
            id="dropzone"
            style={{ marginBottom: '1rem', cursor: 'pointer' }}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const file = e.dataTransfer.files?.[0];
              if (file && file.name.endsWith('.json')) {
                handleRestoreFile(file);
              } else {
                showToast(t('toastInvalidBackupFile'), 'warning');
              }
            }}
          >
            <div className="dropzone-icon">
              <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
            </div>
            <strong>{selectedBackupFile ? selectedBackupFile.name : t('dropzoneTextTitle')}</strong>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {t('dropzoneText')}
            </p>
          </div>

          {selectedBackupFile && (
            <div className="file-preview-card" style={{ display: 'block', marginBottom: '1rem' }}>
              <div className="preview-header">
                <strong style={{ color: 'var(--accent-cyan)', fontSize: '0.85rem' }}>{selectedBackupFile.name}</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  {(selectedBackupFile.size / 1024).toFixed(1)} KB
                </span>
              </div>
            </div>
          )}

          {isRestoring && (
            <div className="progress-container" style={{ display: 'block', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.35rem', color: 'var(--text-muted)' }}>
                <span>{t('restoreProgressWriting')}</span>
                <span>{restoreProgress}%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${restoreProgress}%` }}></div>
              </div>
            </div>
          )}

          <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
            <button
              type="button"
              className="btn btn-primary"
              id="btnRestoreBackup"
              style={{ width: '100%' }}
              disabled={!isConnected || !selectedBackupFile || isRestoring}
              onClick={handleFlashBackup}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
              <span>{t('btnFlashBackup')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* USB HID Communication Console Card */}
      <div className="palette-card console-card" style={{ marginTop: '1.5rem' }}>
        <div className="console-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span className="console-header-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4 17 10 11 4 5"></polyline>
                <line x1="12" y1="19" x2="20" y2="19"></line>
              </svg>
            </span>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 600 }}>{t('consoleTitle')}</h4>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            id="btnClearLog"
            style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}
            onClick={() => setLogs([])}
          >
            <span>{t('btnClearLog')}</span>
          </button>
        </div>
        <div className="console-log" id="consoleLog">
          {logs.map((l, idx) => (
            <div key={idx} className="log-line">
              <span className="log-time">{l.time}</span> <span className="log-info">{l.msg}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
