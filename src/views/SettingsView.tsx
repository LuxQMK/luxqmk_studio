import React, { useRef, useState, useEffect } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';
import { useDeviceStore } from '../store/useDeviceStore';
import { useI18n } from '../i18n';
import { APP_VERSION } from '../version';

export const SettingsView: React.FC = () => {
  const {
    performance,
    hardwareInfo,
    flasher,
    setDebounceType,
    setDebounceTime,
    setNkroEnabled,
    setPollingRate,
    savePerformanceToEeprom,
    jumpToBootloader,
    factoryResetEeprom,
    quickBackup,
    setFlasherFile,
    startSmartFlash,
    cancelFlash,
    checkCloudUpdates,
    applyCloudFirmware,
  } = useSettingsStore();

  const { isConnected, activeDescriptor, firmwareInfo, dirtyModules } = useDeviceStore();
  const { t } = useI18n();

  const firmwareInputRef = useRef<HTMLInputElement>(null);
  const consoleLogRef = useRef<HTMLDivElement>(null);

  const isDesktop = typeof window !== 'undefined' && !!window.electronAPI && !!window.electronAPI.isDesktop;

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

  const [toolBadge, setToolBadge] = useState<{ text: string; className: string }>({
    text: t('flasherToolReady'),
    className: 'badge-pill badge-success',
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && window.electronAPI && typeof window.electronAPI.getFlasherToolsStatus === 'function') {
      window.electronAPI.getFlasherToolsStatus().then((status) => {
        if (status.wb32Available || status.dfuUtilAvailable) {
          setToolBadge({
            text: t('flasherToolReady'),
            className: 'badge-pill badge-success',
          });
        } else {
          setToolBadge({
            text: t('flasherToolNotFound'),
            className: 'badge-pill badge-warning',
          });
        }
      }).catch(() => {});
    } else if (typeof window !== 'undefined' && (!window.electronAPI || !window.electronAPI.isDesktop)) {
      setToolBadge({
        text: t('flasherToolWebMode'),
        className: 'badge-pill badge-warning',
      });
    }
  }, [t]);

  useEffect(() => {
    if (consoleLogRef.current) {
      consoleLogRef.current.scrollTop = consoleLogRef.current.scrollHeight;
    }
  }, [flasher.consoleLogs]);

  useEffect(() => {
    if (isConnected) {
      checkCloudUpdates();
    }
  }, [isConnected, activeDescriptor, checkCloudUpdates]);

  const handleSelectFirmware = async () => {
    if (typeof window !== 'undefined' && window.electronAPI && typeof window.electronAPI.selectFirmwareFile === 'function') {
      try {
        const fileInfo = await window.electronAPI.selectFirmwareFile();
        if (fileInfo) {
          setFlasherFile({
            name: fileInfo.fileName,
            size: fileInfo.fileSize,
            path: fileInfo.filePath,
          } as any);
          return;
        }
      } catch (e) {}
    }
    firmwareInputRef.current?.click();
  };

  const getCompatibility = () => {
    if (!isConnected) {
      return {
        text: t('statusFwNotConnected'),
        color: 'var(--text-muted, #888888)',
      };
    }
    const REQUIRED_FW = { major: 0, minor: 3, patch: 5 };
    const STUDIO_VERSION = APP_VERSION;

    if (!firmwareInfo) {
      return {
        text: t('statusFwCompatible', { version: STUDIO_VERSION }),
        color: 'var(--accent-green, #00ff88)',
      };
    }

    if (firmwareInfo.major === 0 && firmwareInfo.minor === 0 && firmwareInfo.patch === 0) {
      return {
        text: t('statusFwLegacy', 'Legacy Keyboard Firmware / Unknown Version'),
        color: 'var(--accent-amber, #ffaa00)',
      };
    }

    const isOlder =
      firmwareInfo.major < REQUIRED_FW.major ||
      (firmwareInfo.major === REQUIRED_FW.major &&
        (firmwareInfo.minor < REQUIRED_FW.minor ||
          (firmwareInfo.minor === REQUIRED_FW.minor && firmwareInfo.patch < REQUIRED_FW.patch)));

    if (isOlder) {
      const detectedStr = `(v${firmwareInfo.major}.${firmwareInfo.minor}.${firmwareInfo.patch})`;
      const reqStr = `v${REQUIRED_FW.major}.${REQUIRED_FW.minor}.${REQUIRED_FW.patch}+`;
      return {
        text: `${t('statusFwUpdateRequired', { reqVersion: reqStr })} ${detectedStr}`,
        color: 'var(--accent-amber, #ffaa00)',
      };
    }

    if (
      firmwareInfo.major > REQUIRED_FW.major ||
      (firmwareInfo.major === REQUIRED_FW.major && firmwareInfo.minor > REQUIRED_FW.minor)
    ) {
      return {
        text: t('statusFwNewer', 'Newer Keyboard Firmware Detected (Please update LuxQMK Studio)'),
        color: 'var(--accent-cyan, #00e5ff)',
      };
    }

    return {
      text: t('statusFwCompatible', { version: STUDIO_VERSION }),
      color: 'var(--accent-green, #00ff88)',
    };
  };

  const compat = getCompatibility();

  const debounceTypes = [
    { id: 0, labelKey: 'debounceTypeDefer' },
    { id: 1, labelKey: 'debounceTypeAsymEager' },
    { id: 2, labelKey: 'debounceTypeSymEager' },
  ];

  const debounceTimes = [
    { val: 0, labelKey: 'debounce0' },
    { val: 2, labelKey: 'debounce2' },
    { val: 5, labelKey: 'debounce5' },
    { val: 8, labelKey: 'debounce8' },
    { val: 16, labelKey: 'debounce16' },
  ];

  return (
    <section className="view-container active" id="view-settings">
      <div className="settings-grid">
        {/* CARD 1: PERFORMANCE & LATENCY */}
        <div className="palette-card settings-card">
          <div className="settings-card-header">
            <span className="settings-card-icon" style={{ background: 'rgba(0, 240, 255, 0.1)', color: 'var(--accent-cyan)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
            </span>
            <div>
              <h3>{t('cardPerformanceTitle')}</h3>
              <p className="settings-card-subtitle">{t('cardPerformanceSubtitle')}</p>
            </div>
          </div>

          {/* Debounce Type Selector */}
          <div className="settings-group">
            <div className="settings-label-row">
              <span className="settings-item-title">{t('lblDebounceType')}</span>
              <span className="settings-badge" id="currentDebounceTypeBadge">
                {performance.debounceType === 1 ? 'Asymmetric Eager' : performance.debounceType === 2 ? 'Symmetric Eager' : 'Symmetric Defer'}
              </span>
            </div>
            <p className="settings-item-desc">{t('descDebounceType')}</p>
            <div className="debounce-pills">
              {debounceTypes.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`debounce-pill ${performance.debounceType === item.id ? 'active' : ''}`}
                  onClick={() => setDebounceType(item.id)}
                >
                  <span>{t(item.labelKey)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Debounce Time Selector */}
          <div className="settings-group">
            <div className="settings-label-row">
              <span className="settings-item-title">{t('lblDebounceTime')}</span>
              <span className="settings-badge" id="currentDebounceBadge">{performance.debounceTimeMs} ms</span>
            </div>
            <p className="settings-item-desc">{t('descDebounce')}</p>
            <div className="debounce-pills">
              {debounceTimes.map((item) => (
                <button
                  key={item.val}
                  type="button"
                  className={`debounce-pill ${performance.debounceTimeMs === item.val ? 'active' : ''}`}
                  onClick={() => setDebounceTime(item.val)}
                >
                  <span>{t(item.labelKey)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* NKRO Toggle */}
          <div className="settings-group">
            <div className="settings-label-row">
              <span className="settings-item-title">{t('lblNkroMode')}</span>
              <label className="switch-control">
                <input
                  type="checkbox"
                  checked={performance.nkroEnabled}
                  onChange={(e) => setNkroEnabled(e.target.checked)}
                />
                <span className="switch-slider"></span>
              </label>
            </div>
            <p className="settings-item-desc">{t('descNkro')}</p>
            <div className={`nkro-status-badge ${performance.nkroEnabled ? 'active' : ''}`} id="nkroStatusBadge">
              {performance.nkroEnabled ? t('nkroActiveBadge', 'Active: Full NKRO Mode (Unlimited Keys)') : t('nkroDisabledBadge', 'Active: 6KRO Mode (6-Key Limit)')}
            </div>
          </div>

          {/* USB Polling Rate */}
          <div className="settings-group">
            <div className="settings-label-row">
              <span className="settings-item-title">{t('lblPollingRate')}</span>
              <span className="settings-badge" style={{ color: 'var(--accent-cyan)' }}>1000 Hz (1.0 ms)</span>
            </div>
            <p className="settings-item-desc">{t('descPollingRate')}</p>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                marginTop: '0.5rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '6px',
                background: 'rgba(0, 240, 255, 0.08)',
                border: '1px solid rgba(0, 240, 255, 0.25)',
                color: 'var(--text-main)',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
              <span>1000 Hz (1.0 ms) — {t('lblMaxQmkPerformance')}</span>
            </div>
          </div>

          {/* Save Action */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className={`btn btn-primary ${dirtyModules.has('performance') || dirtyModules.has('settings') ? 'btn-save-eeprom-pulse' : ''}`}
              id="btnSavePerformanceEEPROM"
              disabled={!isConnected}
              onClick={savePerformanceToEeprom}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
              </svg>
              <span>{t('btnSaveToEeprom')}</span>
            </button>
          </div>
        </div>

        {/* CARD 2: HARDWARE INFO */}
        <div className="palette-card settings-card">
          <div className="settings-card-header">
            <span className="settings-card-icon" style={{ background: 'rgba(189, 0, 255, 0.1)', color: 'var(--accent-magenta)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="4" width="16" height="16" rx="2"></rect>
                <rect x="9" y="9" width="6" height="6"></rect>
                <line x1="9" y1="1" x2="9" y2="4"></line>
                <line x1="15" y1="1" x2="15" y2="4"></line>
                <line x1="9" y1="20" x2="9" y2="23"></line>
                <line x1="15" y1="20" x2="15" y2="23"></line>
                <line x1="20" y1="9" x2="23" y2="9"></line>
                <line x1="20" y1="14" x2="23" y2="14"></line>
                <line x1="1" y1="9" x2="4" y2="9"></line>
                <line x1="1" y1="14" x2="4" y2="14"></line>
              </svg>
            </span>
            <div>
              <h3>{t('cardHardwareTitle')}</h3>
              <p className="settings-card-subtitle">{t('cardHardwareSubtitle')}</p>
            </div>
          </div>

          <div className="hardware-info-grid">
            <div className="hardware-info-item">
              <span className="hardware-info-label">{t('lblKeyboardModel')}</span>
              <span className="hardware-info-value highlight">
                {activeDescriptor ? activeDescriptor.name : hardwareInfo.keyboardModel}
              </span>
            </div>
            <div className="hardware-info-item">
              <span className="hardware-info-label">{t('lblMcuChip')}</span>
              <span className="hardware-info-value">
                {activeDescriptor ? activeDescriptor.mcu : hardwareInfo.mcuChip}
              </span>
            </div>
            <div className="hardware-info-item">
              <span className="hardware-info-label">{t('lblUsbVidPid')}</span>
              <span className="hardware-info-value">
                {activeDescriptor && activeDescriptor.vendorId !== null && activeDescriptor.productId !== null
                  ? `VID: 0x${activeDescriptor.vendorId.toString(16).toUpperCase()} | PID: 0x${activeDescriptor.productId.toString(16).toUpperCase()}`
                  : hardwareInfo.usbVidPid}
              </span>
            </div>
            <div className="hardware-info-item">
              <span className="hardware-info-label">{t('lblProtocolVersion')}</span>
              <span className="hardware-info-value">
                {firmwareInfo ? `LuxQMK ${firmwareInfo.versionString} (VIA v12 / Raw HID)` : hardwareInfo.protocolVersion}
              </span>
            </div>
            <div className="hardware-info-item">
              <span className="hardware-info-label">{t('lblMatrixLayout')}</span>
              <span className="hardware-info-value">
                {activeDescriptor ? activeDescriptor.matrix : hardwareInfo.matrixLayout}
              </span>
            </div>
            <div className="hardware-info-item">
              <span className="hardware-info-label">{t('lblEepromSize')}</span>
              <span className="hardware-info-value">{hardwareInfo.eepromSize}</span>
            </div>
            <div className="hardware-info-item">
              <span className="hardware-info-label">{t('lblCompatibilityStatus')}</span>
              <span className="hardware-info-value" style={{ color: compat.color, fontWeight: 600 }}>
                {compat.text}
              </span>
            </div>
          </div>
        </div>

        {/* CARD 3: MAINTENANCE & EEPROM TOOLS */}
        <div className="palette-card settings-card">
          <div className="settings-card-header">
            <span className="settings-card-icon" style={{ background: 'rgba(255, 170, 0, 0.1)', color: 'var(--accent-amber)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
              </svg>
            </span>
            <div>
              <h3>{t('cardMaintenanceTitle')}</h3>
              <p className="settings-card-subtitle">{t('cardMaintenanceSubtitle')}</p>
            </div>
          </div>

          <div className="maintenance-action-list">
            <div className="maintenance-action-item">
              <div className="maintenance-action-text">
                <strong>{t('lblBootloaderTitle')}</strong>
                <p>{t('btnBootloaderDesc')}</p>
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                id="btnJumpBootloader"
                disabled={!isConnected}
                onClick={jumpToBootloader}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path>
                  <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path>
                  <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path>
                  <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path>
                </svg>
                <span>{t('btnBootloader')}</span>
              </button>
            </div>

            <div className="maintenance-action-item">
              <div className="maintenance-action-text">
                <strong>{t('lblResetEepromTitle')}</strong>
                <p>{t('btnResetEepromDesc')}</p>
              </div>
              <button
                type="button"
                className="btn btn-danger"
                id="btnResetEEPROM"
                disabled={!isConnected}
                onClick={factoryResetEeprom}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                <span>{t('btnResetEeprom')}</span>
              </button>
            </div>

            <div className="maintenance-action-item">
              <div className="maintenance-action-text">
                <strong>{t('lblQuickBackupTitle')}</strong>
                <p>{t('btnQuickBackupDesc')}</p>
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                id="btnQuickBackup"
                disabled={!isConnected}
                onClick={quickBackup}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
                <span>{t('btnQuickBackup')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* CARD 4: SMART FIRMWARE FLASHER & UPGRADE */}
        <div className="palette-card settings-card flasher-card">
          <div className="settings-card-header">
            <span className="settings-card-icon" style={{ background: 'rgba(0, 240, 255, 0.1)', color: 'var(--accent-cyan)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
            </span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                <h3>{t('cardFlasherTitle')}</h3>
                <span className={toolBadge.className} id="flasherToolBadge">{toolBadge.text}</span>
              </div>
              <p className="settings-card-subtitle">{t('cardFlasherSubtitle')}</p>
            </div>
          </div>

          <input
            type="file"
            ref={firmwareInputRef}
            accept=".bin,.hex,.uf2"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setFlasherFile(file);
            }}
          />

          {/* Cloud Catalog Detection Banner */}
          {flasher.cloudEntry && (
            <div
              className="cloud-firmware-banner"
              style={{
                background: flasher.cloudUpdateAvailable ? 'rgba(0, 245, 255, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                border: `1px solid ${flasher.cloudUpdateAvailable ? 'rgba(0, 245, 255, 0.4)' : 'var(--border-color)'}`,
                borderRadius: '12px',
                padding: '1rem 1.25rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.8rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path>
                  </svg>
                </span>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{flasher.cloudEntry.name}</strong>
                    <span className={`badge-pill ${flasher.cloudUpdateAvailable ? 'badge-warning' : 'badge-success'}`}>
                      {flasher.cloudUpdateAvailable ? `${t('lblCloudFirmwareUpdateAvailable', { current: firmwareInfo ? `v${firmwareInfo.major}.${firmwareInfo.minor}.${firmwareInfo.patch}` : 'v1.4.1', latest: `v${flasher.cloudEntry.version}` })}` : `Cloud: v${flasher.cloudEntry.version} (${t('lblCloudFirmwareUpToDate')})`}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    {t('lblCloudCatalogDesc', 'Official verified LuxQMK build from files.luxqmk.click')}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                <a
                  href="https://luxqmk.click/#firmware"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-secondary"
                  onClick={(e) => openExternalUrl('https://luxqmk.click/#firmware', e)}
                  style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <span>luxqmk.click</span>
                </a>
                <button
                  type="button"
                  className={`btn btn-sm ${flasher.cloudUpdateAvailable ? 'btn-primary' : 'btn-secondary'}`}
                  disabled={flasher.isDownloadingCloud || flasher.isFlashing}
                  onClick={() => applyCloudFirmware()}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  <span>{flasher.isDownloadingCloud ? 'Pobieranie...' : t('btnOneClickFwUpdate', '1-Click Cloud Update')}</span>
                </button>
              </div>
            </div>
          )}

          {/* Flasher Dropzone */}
          <div
            className={`flasher-dropzone ${flasher.file ? 'has-file' : ''}`}
            id="flasherDropzone"
            style={{ cursor: 'pointer' }}
            onClick={handleSelectFirmware}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const dropped = e.dataTransfer.files?.[0];
              if (dropped) setFlasherFile(dropped);
            }}
          >
            {!flasher.file ? (
              <div className="flasher-dropzone-content" id="flasherDropzoneContent">
                <div className="flasher-dropzone-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="12" y1="18" x2="12" y2="12"></line>
                    <polyline points="9 15 12 12 15 15"></polyline>
                  </svg>
                </div>
                <div className="flasher-dropzone-title">{t('flasherDropzoneTitle')}</div>
                <div className="flasher-dropzone-desc">{t('flasherDropzoneDesc')}</div>
              </div>
            ) : (
              <div className="flasher-file-card" id="flasherFileCard" style={{ display: 'flex' }}>
                <div className="flasher-file-details">
                  <div className="flasher-file-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                      <polyline points="13 2 13 9 20 9"></polyline>
                    </svg>
                  </div>
                  <div className="flasher-file-meta">
                    <h4>{flasher.fileName}</h4>
                    <span>{flasher.fileSizeText}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  id="btnClearSelectedFirmware"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFlasherFile(null);
                  }}
                >
                  <span>{t('btnClear', 'Clear')}</span>
                </button>
              </div>
            )}
          </div>

          {/* 4-Step Progress Tracker Grid */}
          <div className="flasher-steps-grid">
            <div className={`flasher-step-item ${flasher.currentStep === 1 ? 'active' : flasher.currentStep > 1 ? 'complete' : 'pending'}`}>
              <span className="flasher-step-badge">1</span>
              <span className="flasher-step-title">{t('flasherStep1')}</span>
            </div>
            <div className={`flasher-step-item ${flasher.currentStep === 2 ? 'active' : flasher.currentStep > 2 ? 'complete' : 'pending'}`}>
              <span className="flasher-step-badge">2</span>
              <span className="flasher-step-title">{t('flasherStep2')}</span>
            </div>
            <div className={`flasher-step-item ${flasher.currentStep === 3 ? 'active' : flasher.currentStep > 3 ? 'complete' : 'pending'}`}>
              <span className="flasher-step-badge">3</span>
              <span className="flasher-step-title">{t('flasherStep3')}</span>
            </div>
            <div className={`flasher-step-item ${flasher.currentStep === 4 ? 'active' : flasher.currentStep > 4 ? 'complete' : 'pending'}`}>
              <span className="flasher-step-badge">4</span>
              <span className="flasher-step-title">{t('flasherStep4')}</span>
            </div>
          </div>

          {/* Progress Bar */}
          {flasher.isFlashing && (
            <div className="flasher-progress-wrap" id="flasherProgressContainer" style={{ display: 'block' }}>
              <div className="flasher-progress-header">
                <span>{flasher.statusLabel}</span>
                <span>{flasher.progressPercent}%</span>
              </div>
              <div className="flasher-progress-track">
                <div className="flasher-progress-fill" style={{ width: `${flasher.progressPercent}%` }}></div>
              </div>
            </div>
          )}

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary"
              id="btnSelectFirmware"
              onClick={handleSelectFirmware}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
              </svg>
              <span>{t('btnSelectFirmware')}</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {flasher.isFlashing && (
                <button type="button" className="btn btn-secondary" onClick={cancelFlash}>
                  <span>{t('btnCancelFlash', 'Cancel')}</span>
                </button>
              )}
              <button
                type="button"
                className="btn btn-primary btn-smart-flash"
                id="btnStartSmartFlash"
                disabled={!flasher.file || flasher.isFlashing}
                onClick={startSmartFlash}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
                <span>{t('btnStartSmartFlash')}</span>
              </button>
            </div>
          </div>

          {/* Console Log */}
          <div className="flasher-console-wrapper" id="flasherConsoleWrapper" style={{ display: 'block', marginTop: '1rem' }}>
            <div className="flasher-console-header">
              <span>{t('flasherConsoleTitle')}</span>
            </div>
            <div className="flasher-console" id="flasherConsoleLog" ref={consoleLogRef}>
              {flasher.consoleLogs.map((log, idx) => (
                <div key={idx} className={`log-line ${log.isError ? 'log-error' : ''}`}>
                  <span className="log-time">{log.time}</span> <span className="log-info">{log.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
