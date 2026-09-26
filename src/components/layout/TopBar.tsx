import React, { useState, useRef, useEffect } from 'react';
import { useUIStore, ViewTab } from '../../store/useUIStore';
import { useDeviceStore } from '../../store/useDeviceStore';
import { useI18n } from '../../i18n';

export const TopBar: React.FC = () => {
  const { activeView } = useUIStore();
  const {
    isConnected,
    isConnecting,
    connectedDevice,
    activeDescriptor,
    authorizedDevices,
    hasUnsavedChanges,
    connectDevice,
    disconnectDevice,
    refreshAuthorizedDevices,
    selectAuthorizedDevice,
    saveAllToEeprom,
    discardAllChanges,
  } = useDeviceStore();
  const { t } = useI18n();

  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getViewTitles = (view: ViewTab) => {
    switch (view) {
      case 'keymap':
        return { title: t('viewKeymapTitle'), subtitle: t('viewKeymapSubtitle') };
      case 'macro':
        return { title: t('viewMacroTitle'), subtitle: t('viewMacroSubtitle') };
      case 'encoder':
        return { title: t('viewEncoderTitle'), subtitle: t('viewEncoderSubtitle') };
      case 'tester':
        return { title: t('viewTesterTitle'), subtitle: t('viewTesterSubtitle') };
      case 'lighting':
        return { title: t('viewLightingTitle'), subtitle: t('viewLightingSubtitle') };
      case 'studio_lighting':
        return { title: t('viewStudioLightingTitle'), subtitle: t('viewStudioLightingSubtitle') };
      case 'backup':
        return { title: t('viewBackupTitle'), subtitle: t('viewBackupSubtitle') };
      case 'settings':
        return { title: t('viewSettingsTitle'), subtitle: t('viewSettingsSubtitle') };
    }
  };

  const { title, subtitle } = getViewTitles(activeView);

  return (
    <header className="top-bar">
      {/* View Title & Subtitle */}
      <div className="top-bar-left">
        <div className="view-title-wrap">
          <h1 id="topBarViewTitle">{title}</h1>
          <p id="topBarViewSubtitle">{subtitle}</p>
        </div>
      </div>

      {/* Center Device Selector */}
      <div className="top-bar-center" ref={dropdownRef}>
        <div className="custom-device-selector" id="customDeviceSelector">
          <button
            className="device-selector-btn"
            id="deviceSelectorBtn"
            type="button"
            aria-haspopup="listbox"
            aria-expanded={isDropdownOpen}
            onClick={() => {
              if (!isDropdownOpen) refreshAuthorizedDevices();
              setDropdownOpen(!isDropdownOpen);
            }}
          >
            <span className={`device-status-dot ${isConnected ? 'connected' : ''}`} id="deviceSelectorDot"></span>
            <span className="device-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M7 16h10"></path>
              </svg>
            </span>
            <span className="device-name-display" id="deviceNameDisplay">
              {isConnected && activeDescriptor
                ? activeDescriptor.name
                : isConnecting
                ? t('optSearchingDevices')
                : t('optNoDevices')}
            </span>
            <span className={`device-badge ${isConnected ? 'badge-connected' : ''}`} id="deviceStatusBadge">
              {isConnected ? t('statusConnected') : t('statusDisconnected')}
            </span>
            <span className="device-chevron">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </span>
          </button>

          <button
            id="btnAddDevice"
            className="btn-pair-device"
            title={t('tooltipAddDevice')}
            type="button"
            onClick={connectDevice}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>

          {/* Custom Dropdown Menu */}
          {isDropdownOpen && (
            <div className="device-dropdown-menu" id="deviceDropdownMenu" role="listbox" style={{ display: 'block' }}>
              <div className="device-dropdown-header">{t('lblConnectedDevices')}</div>
              <div className="device-dropdown-list" id="deviceDropdownList">
                {authorizedDevices.length > 0 ? (
                  authorizedDevices.map((dev, idx) => {
                    const isSelected = connectedDevice === dev;
                    return (
                      <button
                        key={idx}
                        type="button"
                        className={`device-dropdown-item ${isSelected ? 'active' : ''}`}
                        onClick={() => {
                          selectAuthorizedDevice(dev);
                          setDropdownOpen(false);
                        }}
                      >
                        <span className={`item-dot ${isSelected ? 'connected' : ''}`}></span>
                        <span className="item-name">{dev.productName || 'QMK Keyboard'}</span>
                        {isSelected && <span className="item-active-pill">{t('lblActiveDevice')}</span>}
                      </button>
                    );
                  })
                ) : (
                  <div className="device-dropdown-empty" style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                    {t('optNoDevices')}
                  </div>
                )}
              </div>
              <div className="device-dropdown-divider"></div>
              <button
                className="device-dropdown-item add-device-item"
                id="deviceDropdownAddBtn"
                type="button"
                onClick={() => {
                  setDropdownOpen(false);
                  connectDevice();
                }}
              >
                <span className="item-icon-svg">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </span>
                <span className="item-text">{t('optAddNewDevice')}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Top Bar Actions */}
      <div className="top-bar-actions">
        {/* Unsaved Changes Banner */}
        {hasUnsavedChanges && (
          <div id="topBarUnsavedBadge" className="topbar-unsaved-badge" style={{ display: 'inline-flex' }}>
            <span className="unsaved-badge-dot"></span>
            <span className="topbar-unsaved-text">{t('unsavedBadgeText', 'Unsaved changes')}</span>
            <button
              type="button"
              className="btn-topbar-discard"
              id="btnTopBarDiscard"
              title="Discard changes (revert from EEPROM)"
              onClick={discardAllChanges}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                <polyline points="3 3 3 8 8 8"></polyline>
              </svg>
              <span>{t('unsavedBadgeDiscardBtn', 'Discard')}</span>
            </button>
            <button
              type="button"
              className="btn-topbar-save"
              id="btnTopBarSave"
              title="Save to EEPROM memory"
              onClick={saveAllToEeprom}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              <span>{t('unsavedBadgeSaveBtn', 'Save (EEPROM)')}</span>
            </button>
          </div>
        )}

        {/* Refresh Button */}
        <button
          className="btn btn-secondary"
          id="btnRefreshDevice"
          disabled={!isConnected}
          onClick={refreshAuthorizedDevices}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10"></polyline>
            <polyline points="1 20 1 14 7 14"></polyline>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
          </svg>
          <span>{t('btnRefresh')}</span>
        </button>

        {/* Connect Button */}
        <button
          className={`btn ${isConnected ? 'btn-secondary' : 'btn-primary'}`}
          id="btnConnect"
          onClick={isConnected ? disconnectDevice : connectDevice}
          disabled={isConnecting}
        >
          <span id="btnConnectLabel">
            {isConnecting ? t('optSearchingDevices') : isConnected ? t('btnDisconnect') : t('btnConnect')}
          </span>
        </button>
      </div>
    </header>
  );
};
