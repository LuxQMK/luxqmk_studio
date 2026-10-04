import React, { useState, useEffect, useRef } from 'react';
import { getLayoutForPreset, getSideLedSegments, isSidelightSupported } from '../data/layouts';
import { ALL_DEVICE_DESCRIPTORS } from '../data/devices';
import { useKeymapStore } from '../store/useKeymapStore';
import { useDeviceStore } from '../store/useDeviceStore';
import { hidProtocol } from '../core/hid-protocol';
import { useI18n } from '../i18n';
import { useKeyboardFit } from '../hooks/useKeyboardFit';
import { LogoLedBadge } from '../components/common/LogoLedBadge';
import { KeyboardAppearanceButton } from '../components/common/KeyboardAppearanceButton';
import { useKeyboardThemeStore } from '../store/useKeyboardThemeStore';

interface KeyHistoryItem {
  code: string;
  key: string;
  time: string;
  holdMs?: number;
  intervalMs?: number;
}

export const CODE_TO_KEY_ID: Record<string, string> = {
  Escape: 'ESC',
  F1: 'F1',
  F2: 'F2',
  F3: 'F3',
  F4: 'F4',
  F5: 'F5',
  F6: 'F6',
  F7: 'F7',
  F8: 'F8',
  F9: 'F9',
  F10: 'F10',
  F11: 'F11',
  F12: 'F12',
  PrintScreen: 'PSCR',
  ScrollLock: 'SCRL',
  Pause: 'PAUS',
  Backquote: 'GRV',
  Digit1: '1',
  Digit2: '2',
  Digit3: '3',
  Digit4: '4',
  Digit5: '5',
  Digit6: '6',
  Digit7: '7',
  Digit8: '8',
  Digit9: '9',
  Digit0: '0',
  Minus: 'MINS',
  Equal: 'EQL',
  Backspace: 'BSPC',
  Insert: 'INS',
  Home: 'HOME',
  PageUp: 'PGUP',
  NumLock: 'NUM',
  NumpadDivide: 'PSLS',
  NumpadMultiply: 'PAST',
  NumpadSubtract: 'PMNS',
  Tab: 'TAB',
  KeyQ: 'Q',
  KeyW: 'W',
  KeyE: 'E',
  KeyR: 'R',
  KeyT: 'T',
  KeyY: 'Y',
  KeyU: 'U',
  KeyI: 'I',
  KeyO: 'O',
  KeyP: 'P',
  BracketLeft: 'LBRC',
  BracketRight: 'RBRC',
  Backslash: 'BSLS',
  Delete: 'DEL',
  End: 'END',
  PageDown: 'PGDN',
  Numpad7: 'P7',
  Numpad8: 'P8',
  Numpad9: 'P9',
  NumpadAdd: 'PPLS',
  CapsLock: 'CAPS',
  KeyA: 'A',
  KeyS: 'S',
  KeyD: 'D',
  KeyF: 'F',
  KeyG: 'G',
  KeyH: 'H',
  KeyJ: 'J',
  KeyK: 'K',
  KeyL: 'L',
  Semicolon: 'SCLN',
  Quote: 'QUOT',
  Enter: 'ENT',
  Numpad4: 'P4',
  Numpad5: 'P5',
  Numpad6: 'P6',
  ShiftLeft: 'LSFT',
  KeyZ: 'Z',
  KeyX: 'X',
  KeyC: 'C',
  KeyV: 'V',
  KeyB: 'B',
  KeyN: 'N',
  KeyM: 'M',
  Comma: 'COMM',
  Period: 'DOT',
  Slash: 'SLSH',
  ShiftRight: 'RSFT',
  ArrowUp: 'UP',
  Numpad1: 'P1',
  Numpad2: 'P2',
  Numpad3: 'P3',
  NumpadEnter: 'PENT',
  ControlLeft: 'LCTL',
  MetaLeft: 'LWIN',
  MetaRight: 'LWIN',
  OSLeft: 'LWIN',
  OSRight: 'LWIN',
  AltLeft: 'LALT',
  Space: 'SPC',
  AltRight: 'RALT',
  AltGraph: 'RALT',
  ContextMenu: 'APP',
  ControlRight: 'RCTL',
  ArrowLeft: 'LEFT',
  ArrowDown: 'DOWN',
  ArrowRight: 'RGHT',
  Numpad0: 'P0',
  NumpadDecimal: 'PDOT',
  // International & ISO
  IntlBackslash: 'NUBS',
  NonUSBackslash: 'NUBS',
  IntlRo: 'RO',
  IntlYen: 'JYEN',
  NumpadEqual: 'PEQL',
  NumpadComma: 'PCMM',
  // Audio & Media
  AudioVolumeUp: 'VOLU',
  AudioVolumeDown: 'VOLD',
  AudioVolumeMute: 'MUTE',
  VolumeUp: 'VOLU',
  VolumeDown: 'VOLD',
  VolumeMute: 'MUTE',
  MediaTrackNext: 'MNXT',
  MediaTrackPrevious: 'MPRV',
  MediaPlayPause: 'MPLY',
  MediaStop: 'MSTP',
  MediaSelect: 'MSEL',
  // Browser & App Launch
  BrowserBack: 'WBAK',
  BrowserForward: 'WFWD',
  BrowserRefresh: 'WREF',
  BrowserHome: 'WHOM',
  BrowserSearch: 'WSCH',
  BrowserFavorites: 'WFAV',
  LaunchMail: 'MAIL',
  LaunchApp2: 'CALC',
  LaunchApp1: 'MYCM',
};

export const TesterView: React.FC = () => {
  const { presetLayoutId } = useKeymapStore();
  const { isConnected, activeDescriptor } = useDeviceStore();
  const { t } = useI18n();
  const canvasThemeStyles = useKeyboardThemeStore((s) => s.canvasThemeStyles);

  const [testedKeys, setTestedKeys] = useState<Set<string>>(new Set());
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [history, setHistory] = useState<KeyHistoryItem[]>([]);
  const [blockOsKeystrokes, setBlockOsKeystrokes] = useState<boolean>(true);

  // Latency & Timing diagnostics state
  const [lastHoldDuration, setLastHoldDuration] = useState<number | null>(null);
  const [minHoldDuration, setMinHoldDuration] = useState<number | null>(null);
  const [lastInterval, setLastInterval] = useState<number | null>(null);
  const [minInterval, setMinInterval] = useState<number | null>(null);
  const [chatterAlert, setChatterAlert] = useState<{ keyId: string; deltaMs: number } | null>(null);
  const [usbPingStats, setUsbPingStats] = useState<{ min: number; avg: number; max: number; jitter: number } | null>(null);
  const [isTestingPing, setIsTestingPing] = useState<boolean>(false);

  const pressStartTimesRef = useRef<Map<string, number>>(new Map());
  const lastReleaseTimesRef = useRef<Map<string, number>>(new Map());
  const lastKeyDownTimeRef = useRef<number | null>(null);

  const desc = activeDescriptor || ALL_DEVICE_DESCRIPTORS.find((d) => d.id === presetLayoutId) || null;
  const hasSidelights = isSidelightSupported(presetLayoutId, desc);

  const layoutKeys = getLayoutForPreset(presetLayoutId);

  // Compute bounding box
  let maxX = 0;
  let maxY = 0;
  layoutKeys.forEach((k) => {
    const rX = k.x + (k.w || 1);
    const rY = k.y + (k.h || 1);
    if (rX > maxX) maxX = rX;
    if (rY > maxY) maxY = rY;
  });

  const unitSize = 46;
  const canvasWidth = Math.ceil(maxX * unitSize) + 36;
  const canvasHeight = Math.ceil(maxY * unitSize) + 36;

  const { wrapperRef, canvasRef } = useKeyboardFit(canvasWidth, canvasHeight);

  // Keyboard event listener & window focus management
  useEffect(() => {
    // Keyboard Lock API (Chromium / Electron) to capture system-level keys
    if (blockOsKeystrokes && typeof navigator !== 'undefined' && 'keyboard' in navigator && (navigator as any).keyboard?.lock) {
      (navigator as any).keyboard.lock().catch(() => {
        // Ignored if user hasn't interacted or unsupported in current context
      });
    }

    const autoReleaseTimers = new Map<string, NodeJS.Timeout>();

    const clearAutoRelease = (keyId: string) => {
      const t = autoReleaseTimers.get(keyId);
      if (t) {
        clearTimeout(t);
        autoReleaseTimers.delete(keyId);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const nowPerf = performance.now();
      if (blockOsKeystrokes) {
        const isDevTools = e.code === 'F12' || ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.code === 'KeyI' || e.code === 'KeyJ' || e.code === 'KeyC'));
        if (!isDevTools) {
          e.preventDefault();
          e.stopPropagation();
        }
      }

      const keyId = CODE_TO_KEY_ID[e.code];
      if (keyId) {
        clearAutoRelease(keyId);
        setActiveKeys((prev) => new Set(prev).add(keyId));
        setTestedKeys((prev) => new Set(prev).add(keyId));

        // Inter-key interval calculation
        if (lastKeyDownTimeRef.current !== null) {
          const delta = Math.max(0.1, nowPerf - lastKeyDownTimeRef.current);
          setLastInterval(delta);
          setMinInterval((prev) => (prev === null ? delta : Math.min(prev, delta)));
        }
        lastKeyDownTimeRef.current = nowPerf;

        // Switch chatter / debounce check: repeated press on the same switch < 12ms after release
        const lastRel = lastReleaseTimesRef.current.get(keyId);
        if (lastRel !== undefined) {
          const bounceTime = nowPerf - lastRel;
          if (bounceTime > 0 && bounceTime < 12) {
            setChatterAlert({ keyId, deltaMs: bounceTime });
          }
        }

        pressStartTimesRef.current.set(keyId, nowPerf);

        // OS-focus stealing keys (e.g. Meta / PrintScreen / App menu) auto-release active state after 180ms
        const isOsStealingKey = e.code.startsWith('Meta') || e.code.startsWith('OS') || e.code === 'PrintScreen' || e.code === 'ContextMenu';
        if (isOsStealingKey) {
          const timer = setTimeout(() => {
            setActiveKeys((prev) => {
              if (prev.has(keyId)) {
                const updated = new Set(prev);
                updated.delete(keyId);
                return updated;
              }
              return prev;
            });
            autoReleaseTimers.delete(keyId);
          }, 180);
          autoReleaseTimers.set(keyId, timer);
        }
      }

      // Check modifier states to prevent stuck modifier keys
      if (typeof e.getModifierState === 'function') {
        const isMetaDown = e.getModifierState('Meta');
        if (!isMetaDown && e.code !== 'MetaLeft' && e.code !== 'MetaRight') {
          setActiveKeys((prev) => {
            if (prev.has('LWIN') || prev.has('RWIN')) {
              const updated = new Set(prev);
              updated.delete('LWIN');
              updated.delete('RWIN');
              return updated;
            }
            return prev;
          });
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const nowPerf = performance.now();
      if (blockOsKeystrokes) {
        const isDevTools = e.code === 'F12' || ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.code === 'KeyI' || e.code === 'KeyJ' || e.code === 'KeyC'));
        if (!isDevTools) {
          e.preventDefault();
          e.stopPropagation();
        }
      }

      const keyId = CODE_TO_KEY_ID[e.code];
      if (keyId) {
        clearAutoRelease(keyId);
        setActiveKeys((prev) => {
          const updated = new Set(prev);
          updated.delete(keyId);
          return updated;
        });

        // Compute key hold duration
        const startTime = pressStartTimesRef.current.get(keyId);
        let holdMs: number | undefined;
        if (startTime !== undefined) {
          holdMs = Math.max(0.1, nowPerf - startTime);
          setLastHoldDuration(holdMs);
          setMinHoldDuration((prev) => (prev === null ? holdMs! : Math.min(prev, holdMs!)));
          pressStartTimesRef.current.delete(keyId);
        }
        lastReleaseTimesRef.current.set(keyId, nowPerf);

        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        setHistory((prev) => [
          {
            code: e.code,
            key: e.key,
            time: timeStr,
            holdMs,
            intervalMs: lastInterval ?? undefined,
          },
          ...prev.slice(0, 19)
        ]);
      }
    };

    const handleWindowBlur = () => {
      // Clear active held keys when window loses focus (e.g. Start Menu opens, Alt+Tab, etc.)
      autoReleaseTimers.forEach((timer) => clearTimeout(timer));
      autoReleaseTimers.clear();
      setActiveKeys(new Set());
    };

    const handleWindowFocus = () => {
      // Ensure clean active keys state on focus recovery
      setActiveKeys(new Set());
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        autoReleaseTimers.forEach((timer) => clearTimeout(timer));
        autoReleaseTimers.clear();
        setActiveKeys(new Set());
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    window.addEventListener('keyup', handleKeyUp, { capture: true });
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
      window.removeEventListener('keyup', handleKeyUp, { capture: true });
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      autoReleaseTimers.forEach((timer) => clearTimeout(timer));
      autoReleaseTimers.clear();
      if (typeof navigator !== 'undefined' && 'keyboard' in navigator && (navigator as any).keyboard?.unlock) {
        (navigator as any).keyboard.unlock();
      }
    };
  }, [blockOsKeystrokes, lastInterval]);

  const resetTest = () => {
    setTestedKeys(new Set());
    setActiveKeys(new Set());
    setHistory([]);
    setLastHoldDuration(null);
    setMinHoldDuration(null);
    setLastInterval(null);
    setMinInterval(null);
    setChatterAlert(null);
    setUsbPingStats(null);
    pressStartTimesRef.current.clear();
    lastReleaseTimesRef.current.clear();
    lastKeyDownTimeRef.current = null;
  };

  const runUsbPingTest = async () => {
    if (!isConnected || isTestingPing) return;
    setIsTestingPing(true);
    try {
      const stats = await hidProtocol.measurePingLatency(10);
      if (stats) {
        setUsbPingStats(stats);
      }
    } catch (err) {
      console.warn('USB Ping latency test error:', err);
    } finally {
      setIsTestingPing(false);
    }
  };

  return (
    <section className="view-container active" id="view-tester">
      <div className="keyboard-canvas-card">
        {/* Header */}
        <div className="keyboard-canvas-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <h3>{t('viewTesterTitle')}</h3>
            <div className="badge-target">
              <span>{t('testedKeys')} </span>
              <strong id="testedKeysCount" style={{ color: 'var(--accent-cyan)' }}>
                {testedKeys.size} / {layoutKeys.filter((k) => !(k as any).isLogo).length}
              </strong>
            </div>

            {/* Block OS Keystrokes Toggle */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '0.35rem 0.75rem',
                borderRadius: '8px',
                border: `1px solid ${blockOsKeystrokes ? 'rgba(0, 240, 255, 0.3)' : 'var(--border-color)'}`,
              }}
              title={t('tooltipBlockKeystrokes')}
            >
              <label className="switch" style={{ margin: 0 }}>
                <input
                  type="checkbox"
                  id="chkBlockOsKeystrokes"
                  checked={blockOsKeystrokes}
                  onChange={(e) => setBlockOsKeystrokes(e.target.checked)}
                />
                <span className="slider"></span>
              </label>
              <span style={{ fontSize: '0.82rem', color: blockOsKeystrokes ? 'var(--accent-cyan)' : 'var(--text-dim)', fontWeight: 500 }}>
                {t('lblBlockKeystrokes')}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <KeyboardAppearanceButton />
            <button className="btn btn-secondary" id="btnResetKeyTest" onClick={resetTest}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10"></polyline>
                <polyline points="1 20 1 14 7 14"></polyline>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
              </svg>
              <span>{t('btnResetTest')}</span>
            </button>
          </div>
        </div>

        {/* Latency & Diagnostics Metrics Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '0.75rem',
            marginBottom: '1rem',
          }}
        >
          {/* Card 1: Hold Duration */}
          <div
            className="tester-metric-card"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              padding: '0.65rem 0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
            title={t('tooltipHoldTime')}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(0, 240, 255, 0.1)',
                color: 'var(--accent-cyan)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {t('testerHoldTime')}
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: lastHoldDuration !== null ? '#fff' : 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                {lastHoldDuration !== null ? `${lastHoldDuration.toFixed(1)} ms` : '--'}
                {minHoldDuration !== null && (
                  <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', marginLeft: '0.45rem', fontWeight: 600 }}>
                    ({t('testerMinHoldTime')}: {minHoldDuration.toFixed(1)} ms)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Card 2: Key Interval & Min Scan Rate */}
          <div
            className="tester-metric-card"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              padding: '0.65rem 0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
            title={t('tooltipKeyInterval')}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(168, 85, 247, 0.12)',
                color: '#a855f7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {t('testerKeyInterval')}
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: lastInterval !== null ? '#fff' : 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                {lastInterval !== null ? `${lastInterval.toFixed(1)} ms` : '--'}
                {minInterval !== null && (
                  <span style={{ fontSize: '0.72rem', color: '#a855f7', marginLeft: '0.45rem', fontWeight: 600 }}>
                    ({t('testerMinInterval')}: {minInterval.toFixed(1)} ms)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Card 3: Hardware USB Ping & Polling */}
          <div
            className="tester-metric-card"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              padding: '0.65rem 0.9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
            }}
            title={t('tooltipUsbPing')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(16, 185, 129, 0.12)',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
                  <path d="M12 12v9" />
                  <path d="m8 17 4 4 4-4" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {t('testerUsbPing')}
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: usbPingStats ? '#10b981' : 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                  {usbPingStats
                    ? `~${usbPingStats.avg.toFixed(2)} ms`
                    : (isConnected ? '1000 Hz' : t('testerUsbNotConnected'))}
                </div>
              </div>
            </div>

            {isConnected && (
              <button
                type="button"
                className="btn btn-secondary"
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: '6px',
                  whiteSpace: 'nowrap',
                  background: 'rgba(16, 185, 129, 0.15)',
                  borderColor: 'rgba(16, 185, 129, 0.35)',
                  color: '#34d399',
                  cursor: 'pointer',
                }}
                onClick={runUsbPingTest}
                disabled={isTestingPing}
              >
                {isTestingPing ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <svg className="spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
                    </svg>
                    {t('testerTestingPing')}
                  </span>
                ) : (
                  t('testerTestUsbPing')
                )}
              </button>
            )}
          </div>
        </div>

        {/* USB Ping Stats Detailed Breakdown */}
        {usbPingStats && (
          <div
            style={{
              marginBottom: '1rem',
              padding: '0.55rem 0.9rem',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.8rem',
              color: '#34d399',
              fontFamily: 'var(--font-mono)',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <span><strong>Min:</strong> {usbPingStats.min.toFixed(2)} ms</span>
            <span><strong>Avg:</strong> {usbPingStats.avg.toFixed(2)} ms</span>
            <span><strong>Max:</strong> {usbPingStats.max.toFixed(2)} ms</span>
            <span><strong>Jitter:</strong> ±{usbPingStats.jitter.toFixed(2)} ms</span>
            <span><strong>{t('testerRttRate', 'Pętle RTT')}:</strong> ~{Math.round(1000 / Math.max(0.5, usbPingStats.avg))}/s</span>
          </div>
        )}

        {/* Switch Chatter Warning Alert */}
        {chatterAlert && (
          <div
            style={{
              marginBottom: '1rem',
              padding: '0.65rem 1rem',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: '#f87171',
              fontSize: '0.84rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span>
                <strong>{t('testerChatterWarning')}:</strong> {chatterAlert.keyId} (Δ {chatterAlert.deltaMs.toFixed(1)} ms) — {t('testerChatterDesc')}
              </span>
            </div>
            <button
              type="button"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#f87171',
                cursor: 'pointer',
                padding: '0.2rem 0.4rem',
                fontSize: '1rem',
              }}
              onClick={() => setChatterAlert(null)}
              title="Dismiss"
            >
              &times;
            </button>
          </div>
        )}

        {/* Matrix Canvas */}
        <div className="keyboard-scroll-wrapper" ref={wrapperRef}>
          <div
            className={`keyboard-canvas ${hasSidelights ? 'has-sidelights' : ''}`}
            id="testerCanvas"
            ref={canvasRef}
            style={{ width: `${canvasWidth}px`, height: `${canvasHeight}px`, position: 'relative', ...canvasThemeStyles }}
          >
            {/* Left & Right Sidelight LED Diffusers */}
            {hasSidelights && (() => {
              const sideLeds = getSideLedSegments(presetLayoutId, canvasHeight, desc);
              if (!sideLeds) return null;
              return (
                <div className="side-diffusers-container">
                  {sideLeds.left.map((sled) => (
                    <div
                      key={sled.id}
                      data-key-id={sled.id}
                      className="side-diffuser-segment side-diffuser-left"
                      style={{
                        top: `${sled.top}px`,
                        height: `${sled.height}px`,
                        left: '6px',
                      }}
                      title={`Side LED Left (${sled.id})`}
                    />
                  ))}
                  {sideLeds.right.map((sled) => (
                    <div
                      key={sled.id}
                      data-key-id={sled.id}
                      className="side-diffuser-segment side-diffuser-right"
                      style={{
                        top: `${sled.top}px`,
                        height: `${sled.height}px`,
                        right: '6px',
                      }}
                      title={`Side LED Right (${sled.id})`}
                    />
                  ))}
                </div>
              );
            })()}

            {layoutKeys.map((key, idx) => {
              const w = (key.w || 1) * unitSize - 4;
              const h = (key.h || 1) * unitSize - 4;
              const left = key.x * unitSize + 18;
              const top = key.y * unitSize + 18;

              const keyId = key.id || key.label || '';
              const isTested = testedKeys.has(keyId);
              const isActive = activeKeys.has(keyId);

              if ((key as any).isLogo) {
                return (
                  <LogoLedBadge
                    key={idx}
                    left={left}
                    top={top}
                    width={w}
                    height={h}
                  />
                );
              }

              if ((key as any).isKnob) {
                const knobSize = Math.min(w, h);
                return (
                  <div
                    key={idx}
                    className={`keycap-btn keycap-knob ${isTested ? 'tested' : ''} ${isActive ? 'active' : ''}`}
                    style={{
                      position: 'absolute',
                      left: `${left + (w - knobSize) / 2}px`,
                      top: `${top + (h - knobSize) / 2}px`,
                      width: `${knobSize}px`,
                      height: `${knobSize}px`,
                      borderRadius: '50%',
                      background: isActive
                        ? 'var(--accent-cyan)'
                        : isTested
                        ? 'rgba(0, 255, 136, 0.25)'
                        : undefined,
                      borderColor: isActive
                        ? 'var(--accent-cyan)'
                        : isTested
                        ? 'rgba(0, 255, 136, 0.6)'
                        : undefined,
                      boxShadow: isActive
                        ? '0 0 12px var(--accent-cyan)'
                        : isTested
                        ? '0 0 8px rgba(0, 255, 136, 0.4)'
                        : undefined,
                    }}
                    title={t('tooltipEncoderKnob')}
                  />
                );
              }

              return (
                <div
                  key={idx}
                  className={`keycap-btn key-group-${key.group || 'alpha'} ${isTested ? 'tested' : ''} ${isActive ? 'active' : ''}`}
                  style={{
                    position: 'absolute',
                    left: `${left}px`,
                    top: `${top}px`,
                    width: `${w}px`,
                    height: `${h}px`,
                    background: isActive
                      ? 'var(--accent-cyan)'
                      : isTested
                      ? 'rgba(0, 255, 136, 0.25)'
                      : undefined,
                    borderColor: isActive
                      ? 'var(--accent-cyan)'
                      : isTested
                      ? 'rgba(0, 255, 136, 0.6)'
                      : undefined,
                    color: isActive ? '#000' : isTested ? '#00ff88' : undefined,
                    boxShadow: isActive
                      ? '0 0 12px var(--accent-cyan)'
                      : isTested
                      ? '0 0 8px rgba(0, 255, 136, 0.4)'
                      : undefined,
                  }}
                >
                  <span className="key-primary">{key.label || key.id}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Keys History */}
        <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>
            {t('testerRecentKeys')}
          </label>
          <div id="testerHistoryList" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', minHeight: '38px' }}>
            {history.map((item, idx) => (
              <span
                key={idx}
                style={{
                  background: 'rgba(0, 240, 255, 0.08)',
                  border: '1px solid rgba(0, 240, 255, 0.25)',
                  color: 'var(--accent-cyan)',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontFamily: 'var(--font-mono)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                }}
              >
                <strong>{item.code}</strong>
                {item.holdMs !== undefined && (
                  <span style={{ color: '#fff', background: 'rgba(255, 255, 255, 0.08)', padding: '0.1rem 0.35rem', borderRadius: '4px', fontSize: '0.72rem' }}>
                    {item.holdMs.toFixed(1)} ms
                  </span>
                )}
                {item.intervalMs !== undefined && (
                  <span style={{ color: '#c084fc', fontSize: '0.72rem' }}>
                    Δ {item.intervalMs.toFixed(1)} ms
                  </span>
                )}
                <small style={{ opacity: 0.5, fontSize: '0.7rem' }}>({item.time})</small>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
