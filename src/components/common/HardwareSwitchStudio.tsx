import React, { useState, useEffect, useCallback, useRef } from 'react';
import { hidProtocol, DipSwitchConfig, DipSwitchPosConfig } from '../../core/hid-protocol';
import { useDeviceStore } from '../../store/useDeviceStore';
import { useUIStore } from '../../store/useUIStore';
import { useI18n } from '../../i18n';

interface HardwareSwitchStudioProps {
  switchIndex?: number;
}

const DEFAULT_CONFIG: DipSwitchConfig = {
  posA: {
    targetLayer: 0,
    swapGuiAlt: 0,
    perkeyProfile: 0xFF,
    winLockState: 0xFF,
  },
  posB: {
    targetLayer: 0xFF,
    swapGuiAlt: 1,
    perkeyProfile: 0xFF,
    winLockState: 0xFF,
  },
};

export const HardwareSwitchStudio: React.FC<HardwareSwitchStudioProps> = ({ switchIndex = 0 }) => {
  const { isConnected } = useDeviceStore();
  const { showToast } = useUIStore();
  const { t } = useI18n();

  const [config, setConfig] = useState<DipSwitchConfig>(DEFAULT_CONFIG);
  const [liveState, setLiveState] = useState<boolean>(false); // false = Pos A (Win), true = Pos B (Mac)
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const pollingTimerRef = useRef<any>(null);

  const fetchConfig = useCallback(async () => {
    if (!isConnected) return;
    try {
      const remoteConfig = await hidProtocol.getDipSwitchConfig(switchIndex);
      if (remoteConfig) {
        setConfig(remoteConfig);
      }
      const state = await hidProtocol.getDipSwitchState(switchIndex);
      setLiveState(state);
    } catch (e) {
      console.warn('Failed to read hardware switch config:', e);
    }
  }, [isConnected, switchIndex]);

  useEffect(() => {
    if (isConnected) {
      fetchConfig();
      // Poll switch state periodically to reflect physical flips
      pollingTimerRef.current = setInterval(async () => {
        try {
          const state = await hidProtocol.getDipSwitchState(switchIndex);
          setLiveState(state);
        } catch (err) {}
      }, 1500);
    }
    return () => {
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
      }
    };
  }, [isConnected, switchIndex, fetchConfig]);

  const handleUpdatePos = async (posKey: 'posA' | 'posB', field: keyof DipSwitchPosConfig, value: number) => {
    const updatedPos: DipSwitchPosConfig = {
      ...config[posKey],
      [field]: value,
    };
    const updatedConfig: DipSwitchConfig = {
      ...config,
      [posKey]: updatedPos,
    };
    setConfig(updatedConfig);

    if (isConnected) {
      const posIdx = posKey === 'posA' ? 0 : 1;
      try {
        await hidProtocol.setDipSwitchPosConfig(switchIndex, posIdx, updatedPos);
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
              <circle cx={liveState ? "16" : "8"} cy="12" r="4" fill="currentColor" style={{ transition: 'cx 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}></circle>
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

        {/* Live Physical Switch State Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 0.85rem',
              borderRadius: '8px',
              background: liveState
                ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.18), rgba(147, 51, 234, 0.1))'
                : 'linear-gradient(135deg, rgba(0, 240, 255, 0.18), rgba(0, 150, 255, 0.1))',
              border: liveState
                ? '1px solid rgba(168, 85, 247, 0.4)'
                : '1px solid rgba(0, 240, 255, 0.4)',
              boxShadow: liveState
                ? '0 0 12px rgba(168, 85, 247, 0.2)'
                : '0 0 12px rgba(0, 240, 255, 0.2)',
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: liveState ? '#a855f7' : '#00f0ff',
                boxShadow: liveState ? '0 0 8px #a855f7' : '0 0 8px #00f0ff',
                animation: 'pulse 2s infinite',
              }}
            ></span>
            <span style={{ fontSize: '0.8rem', color: '#ffffff', fontWeight: 600 }}>
              {t('lblSwitchLiveState')}:{' '}
              <strong style={{ color: liveState ? '#d8b4fe' : '#67e8f9' }}>
                {liveState ? t('lblSwitchPosB') : t('lblSwitchPosA')}
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

      {/* Two Columns: Position A (Win / Off) vs Position B (Mac / On) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.25rem',
          marginTop: '1.25rem',
        }}
      >
        {/* Position A Card */}
        <div
          style={{
            padding: '1.15rem',
            borderRadius: '10px',
            background: !liveState
              ? 'rgba(0, 240, 255, 0.05)'
              : 'rgba(255, 255, 255, 0.02)',
            border: !liveState
              ? '1px solid rgba(0, 240, 255, 0.35)'
              : '1px solid rgba(255, 255, 255, 0.08)',
            position: 'relative',
            transition: 'all 0.25s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  background: 'rgba(0, 240, 255, 0.2)',
                  color: 'var(--accent-cyan, #00f0ff)',
                  padding: '0.2rem 0.55rem',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                }}
              >
                POS 1
              </span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#ffffff' }}>
                  {t('lblSwitchPosA')}
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  {t('lblSwitchPosADesc')}
                </div>
              </div>
            </div>
            {!liveState && (
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  background: 'rgba(0, 240, 255, 0.15)',
                  color: 'var(--accent-cyan)',
                  border: '1px solid rgba(0, 240, 255, 0.3)',
                  padding: '0.15rem 0.45rem',
                  borderRadius: '4px',
                  letterSpacing: '0.04em',
                }}
              >
                ACTIVE
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {/* Target Base Layer */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.3rem' }}>
                {t('lblTargetLayer')}
              </label>
              <select
                className="form-control"
                value={config.posA.targetLayer}
                onChange={(e) => handleUpdatePos('posA', 'targetLayer', parseInt(e.target.value, 10))}
                style={{ width: '100%', padding: '0.45rem 0.65rem', fontSize: '0.85rem' }}
              >
                <option value={0}>{t('layer0')}</option>
                <option value={1}>{t('layer1')}</option>
                <option value={2}>{t('layer2')}</option>
                <option value={3}>Layer 3</option>
                <option value={0xFF}>{t('optNoChange')}</option>
              </select>
            </div>

            {/* Modifier Layout */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.3rem' }}>
                {t('lblModifierSwap')}
              </label>
              <select
                className="form-control"
                value={config.posA.swapGuiAlt}
                onChange={(e) => handleUpdatePos('posA', 'swapGuiAlt', parseInt(e.target.value, 10))}
                style={{ width: '100%', padding: '0.45rem 0.65rem', fontSize: '0.85rem' }}
              >
                <option value={0}>{t('optModNormal')}</option>
                <option value={1}>{t('optModMac')}</option>
                <option value={0xFF}>{t('optNoChange')}</option>
              </select>
            </div>

            {/* Per-Key RGB Profile */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.3rem' }}>
                {t('lblPerKeyProfile')}
              </label>
              <select
                className="form-control"
                value={config.posA.perkeyProfile}
                onChange={(e) => handleUpdatePos('posA', 'perkeyProfile', parseInt(e.target.value, 10))}
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
                value={config.posA.winLockState}
                onChange={(e) => handleUpdatePos('posA', 'winLockState', parseInt(e.target.value, 10))}
                style={{ width: '100%', padding: '0.45rem 0.65rem', fontSize: '0.85rem' }}
              >
                <option value={0xFF}>{t('optNoChange')}</option>
                <option value={0}>{t('optWinLockUnlocked')}</option>
                <option value={1}>{t('optWinLockLocked')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Position B Card */}
        <div
          style={{
            padding: '1.15rem',
            borderRadius: '10px',
            background: liveState
              ? 'rgba(168, 85, 247, 0.06)'
              : 'rgba(255, 255, 255, 0.02)',
            border: liveState
              ? '1px solid rgba(168, 85, 247, 0.35)'
              : '1px solid rgba(255, 255, 255, 0.08)',
            position: 'relative',
            transition: 'all 0.25s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  background: 'rgba(168, 85, 247, 0.2)',
                  color: '#d8b4fe',
                  padding: '0.2rem 0.55rem',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                }}
              >
                POS 2
              </span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#ffffff' }}>
                  {t('lblSwitchPosB')}
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  {t('lblSwitchPosBDesc')}
                </div>
              </div>
            </div>
            {liveState && (
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  background: 'rgba(168, 85, 247, 0.15)',
                  color: '#d8b4fe',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  padding: '0.15rem 0.45rem',
                  borderRadius: '4px',
                  letterSpacing: '0.04em',
                }}
              >
                ACTIVE
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {/* Target Base Layer */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.3rem' }}>
                {t('lblTargetLayer')}
              </label>
              <select
                className="form-control"
                value={config.posB.targetLayer}
                onChange={(e) => handleUpdatePos('posB', 'targetLayer', parseInt(e.target.value, 10))}
                style={{ width: '100%', padding: '0.45rem 0.65rem', fontSize: '0.85rem' }}
              >
                <option value={0xFF}>{t('optNoChange')}</option>
                <option value={0}>{t('layer0')}</option>
                <option value={1}>{t('layer1')}</option>
                <option value={2}>{t('layer2')}</option>
                <option value={3}>Layer 3</option>
              </select>
            </div>

            {/* Modifier Layout */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.3rem' }}>
                {t('lblModifierSwap')}
              </label>
              <select
                className="form-control"
                value={config.posB.swapGuiAlt}
                onChange={(e) => handleUpdatePos('posB', 'swapGuiAlt', parseInt(e.target.value, 10))}
                style={{ width: '100%', padding: '0.45rem 0.65rem', fontSize: '0.85rem' }}
              >
                <option value={1}>{t('optModMac')}</option>
                <option value={0}>{t('optModNormal')}</option>
                <option value={0xFF}>{t('optNoChange')}</option>
              </select>
            </div>

            {/* Per-Key RGB Profile */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.3rem' }}>
                {t('lblPerKeyProfile')}
              </label>
              <select
                className="form-control"
                value={config.posB.perkeyProfile}
                onChange={(e) => handleUpdatePos('posB', 'perkeyProfile', parseInt(e.target.value, 10))}
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
                value={config.posB.winLockState}
                onChange={(e) => handleUpdatePos('posB', 'winLockState', parseInt(e.target.value, 10))}
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
    </div>
  );
};
