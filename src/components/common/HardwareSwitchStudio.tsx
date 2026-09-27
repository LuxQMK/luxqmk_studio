import React, { useState, useEffect, useCallback, useRef } from 'react';
import { hidProtocol, DipSwitchConfig, DipSwitchPosConfig } from '../../core/hid-protocol';
import { useDeviceStore } from '../../store/useDeviceStore';
import { useUIStore } from '../../store/useUIStore';
import { useI18n } from '../../i18n';

interface HardwareSwitchStudioProps {
  switchIndex?: number;
}

const DEFAULT_CONFIG_SW0: DipSwitchConfig = {
  posA: {
    targetLayer: 2, // Mac Base (Layer 2)
    swapGuiAlt: 1,  // Mac modifier swap (Alt ↔ Win)
    perkeyProfile: 0xFF,
    winLockState: 0xFF,
  },
  posB: {
    targetLayer: 0, // Win Base (Layer 0)
    swapGuiAlt: 0,  // Standard Windows modifier
    perkeyProfile: 0xFF,
    winLockState: 0xFF,
  },
  posC: {
    targetLayer: 0xFF,
    swapGuiAlt: 0xFF,
    perkeyProfile: 0xFF,
    winLockState: 0xFF,
  },
};

const DEFAULT_CONFIG_SW1: DipSwitchConfig = {
  posA: {
    targetLayer: 0xFF,
    swapGuiAlt: 0xFF,
    perkeyProfile: 0, // Profile 1
    winLockState: 0xFF,
  },
  posB: {
    targetLayer: 0xFF,
    swapGuiAlt: 0xFF,
    perkeyProfile: 1, // Profile 2
    winLockState: 0xFF,
  },
  posC: {
    targetLayer: 0xFF,
    swapGuiAlt: 0xFF,
    perkeyProfile: 2, // Profile 3
    winLockState: 0xFF,
  },
};

export const HardwareSwitchStudio: React.FC<HardwareSwitchStudioProps> = ({ switchIndex = 0 }) => {
  const { isConnected, activeDescriptor } = useDeviceStore();
  const { showToast } = useUIStore();
  const { t } = useI18n();

  const totalSwitches = activeDescriptor?.capabilities?.dipSwitchCount || 2;
  const [selectedSwitch, setSelectedSwitch] = useState<number>(switchIndex);
  const [configSw0, setConfigSw0] = useState<DipSwitchConfig>(DEFAULT_CONFIG_SW0);
  const [configSw1, setConfigSw1] = useState<DipSwitchConfig>(DEFAULT_CONFIG_SW1);
  const [liveStateSw0, setLiveStateSw0] = useState<number>(0);
  const [liveStateSw1, setLiveStateSw1] = useState<number>(0);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const pollingTimerRef = useRef<any>(null);

  const fetchConfig = useCallback(async () => {
    if (!isConnected) return;
    try {
      const cfg0 = await hidProtocol.getDipSwitchConfig(0);
      if (cfg0) setConfigSw0(cfg0);
      const st0 = await hidProtocol.getDipSwitchState(0);
      setLiveStateSw0(st0);

      if (totalSwitches > 1) {
        const cfg1 = await hidProtocol.getDipSwitchConfig(1);
        if (cfg1) setConfigSw1(cfg1);
        const st1 = await hidProtocol.getDipSwitchState(1);
        setLiveStateSw1(st1);
      }
    } catch (e) {
      console.warn('Failed to read hardware switch config:', e);
    }
  }, [isConnected, totalSwitches]);

  useEffect(() => {
    if (isConnected) {
      fetchConfig();
      pollingTimerRef.current = setInterval(async () => {
        try {
          const st0 = await hidProtocol.getDipSwitchState(0);
          setLiveStateSw0(st0);
          if (totalSwitches > 1) {
            const st1 = await hidProtocol.getDipSwitchState(1);
            setLiveStateSw1(st1);
          }
        } catch (err) {}
      }, 1500);
    }
    return () => {
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
      }
    };
  }, [isConnected, totalSwitches, fetchConfig]);

  const currentConfig = selectedSwitch === 0 ? configSw0 : configSw1;
  const currentLiveState = selectedSwitch === 0 ? liveStateSw0 : liveStateSw1;
  const numPositions = selectedSwitch === 0 ? 2 : 3;

  const handleUpdatePos = async (posKey: 'posA' | 'posB' | 'posC', field: keyof DipSwitchPosConfig, value: number) => {
    const activeCfg = selectedSwitch === 0 ? configSw0 : configSw1;
    const currentPos = activeCfg[posKey] || {
      targetLayer: 0xFF,
      swapGuiAlt: 0xFF,
      perkeyProfile: 0xFF,
      winLockState: 0xFF,
    };

    const updatedPos: DipSwitchPosConfig = {
      ...currentPos,
      [field]: value,
    };
    const updatedConfig: DipSwitchConfig = {
      ...activeCfg,
      [posKey]: updatedPos,
    };

    if (selectedSwitch === 0) {
      setConfigSw0(updatedConfig);
    } else {
      setConfigSw1(updatedConfig);
    }

    if (isConnected) {
      const posIdx = posKey === 'posA' ? 0 : posKey === 'posB' ? 1 : 2;
      try {
        await hidProtocol.setDipSwitchPosConfig(selectedSwitch, posIdx, updatedPos);
      } catch (err) {
        console.error('Failed to update switch position config:', err);
      }
    }
  };

  const handleSaveToEeprom = async () => {
    if (!isConnected) return;
    setIsSaving(true);
    try {
      await hidProtocol.saveDipSwitchesToEEPROM();
      showToast(t('toastSwitchesSaved'), 'success');
    } catch (e) {
      showToast('Failed to save hardware switch settings to EEPROM', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const renderPositionCard = (
    posKey: 'posA' | 'posB' | 'posC',
    posIndex: number,
    badgeText: string,
    titleText: string,
    descText: string,
    themeColor: string,
    themeBg: string,
    themeBorder: string
  ) => {
    const posCfg = currentConfig[posKey] || {
      targetLayer: 0xFF,
      swapGuiAlt: 0xFF,
      perkeyProfile: 0xFF,
      winLockState: 0xFF,
    };
    const isActive = currentLiveState === posIndex;

    return (
      <div
        key={posKey}
        style={{
          padding: '1.15rem',
          borderRadius: '10px',
          background: isActive ? themeBg : 'rgba(255, 255, 255, 0.02)',
          border: isActive ? `1px solid ${themeBorder}` : '1px solid rgba(255, 255, 255, 0.08)',
          position: 'relative',
          transition: 'all 0.25s ease',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div>
          {/* Top row: badge, title, active pill */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
              <span
                style={{
                  background: isActive ? themeBg : 'rgba(255, 255, 255, 0.06)',
                  color: themeColor,
                  border: `1px solid ${themeBorder}`,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  letterSpacing: '0.03em',
                }}
              >
                {badgeText}
              </span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#ffffff' }}>
                  {titleText}
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  {descText}
                </div>
              </div>
            </div>
            {isActive && (
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  background: themeBg,
                  color: themeColor,
                  border: `1px solid ${themeBorder}`,
                  padding: '0.18rem 0.55rem',
                  borderRadius: '4px',
                  letterSpacing: '0.04em',
                }}
              >
                {t('lblActive', 'AKTYWNA')}
              </span>
            )}
          </div>

          {/* Form fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {/* Target Base Layer */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.3rem' }}>
                {t('lblTargetLayer')}
              </label>
              <select
                className="form-control"
                value={posCfg.targetLayer}
                onChange={(e) => handleUpdatePos(posKey, 'targetLayer', parseInt(e.target.value, 10))}
                style={{ width: '100%', padding: '0.45rem 0.65rem', fontSize: '0.85rem' }}
              >
                <option value={0xFF}>{t('optNoChange')}</option>
                <option value={0}>{t('layer0')}</option>
                <option value={1}>{t('layer1')}</option>
                <option value={2}>{t('layer2')}</option>
                <option value={3}>{t('layer3')}</option>
              </select>
            </div>

            {/* Modifier Layout */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.3rem' }}>
                {t('lblModifierSwap')}
              </label>
              <select
                className="form-control"
                value={posCfg.swapGuiAlt}
                onChange={(e) => handleUpdatePos(posKey, 'swapGuiAlt', parseInt(e.target.value, 10))}
                style={{ width: '100%', padding: '0.45rem 0.65rem', fontSize: '0.85rem' }}
              >
                <option value={0xFF}>{t('optNoChange')}</option>
                <option value={0}>{t('optModNormal')}</option>
                <option value={1}>{t('optModMac')}</option>
              </select>
            </div>

            {/* Per-Key RGB Profile */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.3rem' }}>
                {t('lblPerKeyProfile')}
              </label>
              <select
                className="form-control"
                value={posCfg.perkeyProfile}
                onChange={(e) => handleUpdatePos(posKey, 'perkeyProfile', parseInt(e.target.value, 10))}
                style={{ width: '100%', padding: '0.45rem 0.65rem', fontSize: '0.85rem' }}
              >
                <option value={0xFF}>{t('optNoChange')}</option>
                <option value={0}>{t('optProfileDefault')}</option>
                <option value={1}>{t('optProfile2')}</option>
                <option value={2}>{t('optProfile3')}</option>
              </select>
            </div>

            {/* Win Key Lock */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.3rem' }}>
                {t('lblWinLockState')}
              </label>
              <select
                className="form-control"
                value={posCfg.winLockState}
                onChange={(e) => handleUpdatePos(posKey, 'winLockState', parseInt(e.target.value, 10))}
                style={{ width: '100%', padding: '0.45rem 0.65rem', fontSize: '0.85rem' }}
              >
                <option value={0xFF}>{t('optNoChange')}</option>
                <option value={0}>{t('optWinLockUnlocked')}</option>
                <option value={1}>{t('optWinLockLocked')}</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className="hardware-switch-studio-card"
      style={{
        marginTop: '1.25rem',
        padding: '1.25rem 1.4rem',
        borderRadius: 'var(--radius-lg, 12px)',
        background: 'linear-gradient(145deg, rgba(26, 32, 48, 0.75) 0%, rgba(18, 22, 34, 0.85) 100%)',
        border: '1px solid rgba(0, 240, 255, 0.18)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.36), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              background: 'rgba(0, 240, 255, 0.12)',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-cyan, #00f0ff)',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="6" width="20" height="12" rx="6"></rect>
              <circle
                cx={selectedSwitch === 0 ? (currentLiveState === 1 ? "16" : "8") : (currentLiveState === 0 ? "6" : currentLiveState === 1 ? "12" : "18")}
                cy="12"
                r="4"
                fill="currentColor"
                style={{ transition: 'cx 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
              ></circle>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              {t('lblHardwareSwitches')}
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px',
                  background: 'rgba(0, 240, 255, 0.12)',
                  color: 'var(--accent-cyan, #00f0ff)',
                  border: '1px solid rgba(0, 240, 255, 0.25)',
                }}
              >
                Physical DIP / Slider
              </span>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted, #94a3b8)', marginTop: '0.15rem' }}>
              {t('lblHardwareSwitchesDesc')}
            </div>
          </div>
        </div>

        {/* Live Physical Switch State Pill & Save Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 0.85rem',
              borderRadius: '8px',
              background: selectedSwitch === 0
                ? (currentLiveState === 1 ? 'linear-gradient(135deg, rgba(0, 240, 255, 0.18), rgba(0, 150, 255, 0.1))' : 'linear-gradient(135deg, rgba(168, 85, 247, 0.18), rgba(147, 51, 234, 0.1))')
                : (currentLiveState === 0 ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.18), rgba(147, 51, 234, 0.1))' : currentLiveState === 1 ? 'linear-gradient(135deg, rgba(0, 240, 255, 0.18), rgba(0, 150, 255, 0.1))' : 'linear-gradient(135deg, rgba(34, 197, 94, 0.18), rgba(22, 163, 74, 0.1))'),
              border: selectedSwitch === 0
                ? (currentLiveState === 1 ? '1px solid rgba(0, 240, 255, 0.4)' : '1px solid rgba(168, 85, 247, 0.4)')
                : (currentLiveState === 0 ? '1px solid rgba(168, 85, 247, 0.4)' : currentLiveState === 1 ? '1px solid rgba(0, 240, 255, 0.4)' : '1px solid rgba(34, 197, 94, 0.4)'),
              boxShadow: '0 0 12px rgba(0, 0, 0, 0.25)',
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: selectedSwitch === 0
                  ? (currentLiveState === 1 ? '#00f0ff' : '#a855f7')
                  : (currentLiveState === 0 ? '#a855f7' : currentLiveState === 1 ? '#00f0ff' : '#22c55e'),
                boxShadow: '0 0 8px currentColor',
                animation: 'pulse 2s infinite',
              }}
            ></span>
            <span style={{ fontSize: '0.8rem', color: '#ffffff', fontWeight: 600 }}>
              {t('lblSwitchLiveState')}:{' '}
              <strong>
                {selectedSwitch === 0
                  ? (currentLiveState === 1 ? t('lblSwitchPosB') : t('lblSwitchPosA'))
                  : (currentLiveState === 0 ? t('lblSwitchPosProfile1') : currentLiveState === 1 ? t('lblSwitchPosProfile2') : t('lblSwitchPosProfile3'))}
              </strong>
            </span>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSaveToEeprom}
            disabled={!isConnected || isSaving}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.45rem 0.95rem',
              fontSize: '0.82rem',
              fontWeight: 600,
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
            {isSaving ? 'Saving...' : t('btnSaveSwitches')}
          </button>
        </div>
      </div>

      {/* Switch Selector Tabs (for keyboards with multiple physical switches like GMMK 3) */}
      {totalSwitches > 1 && (
        <div style={{ display: 'flex', gap: '0.65rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`btn ${selectedSwitch === 0 ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setSelectedSwitch(0)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.82rem',
              fontWeight: 600,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="6" width="20" height="12" rx="6"></rect>
              <circle cx="8" cy="12" r="3" fill="currentColor"></circle>
            </svg>
            {t('lblSwitchTabLeft')}
          </button>
          <button
            type="button"
            className={`btn ${selectedSwitch === 1 ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setSelectedSwitch(1)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.82rem',
              fontWeight: 600,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="6" width="20" height="12" rx="6"></rect>
              <circle cx="16" cy="12" r="3" fill="currentColor"></circle>
            </svg>
            {t('lblSwitchTabRight')}
          </button>
        </div>
      )}

      {/* Position Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: numPositions === 3
            ? 'repeat(auto-fit, minmax(280px, 1fr))'
            : 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.25rem',
          marginTop: '1.15rem',
        }}
      >
        {selectedSwitch === 0 ? (
          <>
            {renderPositionCard(
              'posA',
              0,
              'POS 1',
              t('lblSwitchPosA'),
              t('lblSwitchPosADesc'),
              '#d8b4fe',
              'rgba(168, 85, 247, 0.1)',
              'rgba(168, 85, 247, 0.35)'
            )}
            {renderPositionCard(
              'posB',
              1,
              'POS 2',
              t('lblSwitchPosB'),
              t('lblSwitchPosBDesc'),
              'var(--accent-cyan, #00f0ff)',
              'rgba(0, 240, 255, 0.08)',
              'rgba(0, 240, 255, 0.35)'
            )}
          </>
        ) : (
          <>
            {renderPositionCard(
              'posA',
              0,
              'POS 1',
              t('lblSwitchPosProfile1'),
              t('lblSwitchPosProfile1Desc'),
              '#d8b4fe',
              'rgba(168, 85, 247, 0.1)',
              'rgba(168, 85, 247, 0.35)'
            )}
            {renderPositionCard(
              'posB',
              1,
              'POS 2',
              t('lblSwitchPosProfile2'),
              t('lblSwitchPosProfile2Desc'),
              'var(--accent-cyan, #00f0ff)',
              'rgba(0, 240, 255, 0.08)',
              'rgba(0, 240, 255, 0.35)'
            )}
            {renderPositionCard(
              'posC',
              2,
              'POS 3',
              t('lblSwitchPosProfile3'),
              t('lblSwitchPosProfile3Desc'),
              '#4ade80',
              'rgba(34, 197, 94, 0.1)',
              'rgba(34, 197, 94, 0.35)'
            )}
          </>
        )}
      </div>
    </div>
  );
};
