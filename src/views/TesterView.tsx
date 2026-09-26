import React, { useState, useEffect } from 'react';
import { getLayoutForPreset, getSideLedSegments, isSidelightSupported } from '../data/layouts';
import { ALL_DEVICE_DESCRIPTORS } from '../data/devices';
import { useKeymapStore } from '../store/useKeymapStore';
import { useDeviceStore } from '../store/useDeviceStore';
import { useI18n } from '../i18n';
import { useKeyboardFit } from '../hooks/useKeyboardFit';
import { LogoLedBadge } from '../components/common/LogoLedBadge';

interface KeyHistoryItem {
  code: string;
  key: string;
  time: string;
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
};

export const TesterView: React.FC = () => {
  const { presetLayoutId } = useKeymapStore();
  const { t } = useI18n();

  const [testedKeys, setTestedKeys] = useState<Set<string>>(new Set());
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [history, setHistory] = useState<KeyHistoryItem[]>([]);

  const { activeDescriptor } = useDeviceStore();
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

  // Keyboard event listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keyId = CODE_TO_KEY_ID[e.code];
      if (keyId) {
        setActiveKeys((prev) => new Set(prev).add(keyId));
        setTestedKeys((prev) => new Set(prev).add(keyId));
      }

      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
      setHistory((prev) => [{ code: e.code, key: e.key, time: timeStr }, ...prev.slice(0, 15)]);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const keyId = CODE_TO_KEY_ID[e.code];
      if (keyId) {
        setActiveKeys((prev) => {
          const updated = new Set(prev);
          updated.delete(keyId);
          return updated;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
    };
  }, []);

  const resetTest = () => {
    setTestedKeys(new Set());
    setActiveKeys(new Set());
    setHistory([]);
  };

  return (
    <section className="view-container active" id="view-tester">
      <div className="keyboard-canvas-card">
        {/* Header */}
        <div className="keyboard-canvas-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <h3>{t('viewTesterTitle')}</h3>
            <div className="badge-target">
              <span>{t('testedKeys')} </span>
              <strong id="testedKeysCount" style={{ color: 'var(--accent-cyan)' }}>
                {testedKeys.size} / {layoutKeys.filter((k) => !(k as any).isLogo).length}
              </strong>
            </div>
          </div>

          <button className="btn btn-secondary" id="btnResetKeyTest" onClick={resetTest}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10"></polyline>
              <polyline points="1 20 1 14 7 14"></polyline>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
            <span>{t('btnResetTest')}</span>
          </button>
        </div>

        {/* Matrix Canvas */}
        <div className="keyboard-scroll-wrapper" ref={wrapperRef}>
          <div
            className={`keyboard-canvas ${hasSidelights ? 'has-sidelights' : ''}`}
            id="testerCanvas"
            ref={canvasRef}
            style={{ width: `${canvasWidth}px`, height: `${canvasHeight}px`, position: 'relative' }}
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
                    title="Rotary Encoder Knob"
                  >
                    <span className="knob-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="9"></circle>
                        <circle cx="12" cy="12" r="3"></circle>
                        <line x1="12" y1="3" x2="12" y2="7"></line>
                      </svg>
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={idx}
                  className={`keycap-btn ${isTested ? 'tested' : ''} ${isActive ? 'active' : ''}`}
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
          <div id="testerHistoryList" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', minHeight: '38px' }}>
            {history.map((item, idx) => (
              <span
                key={idx}
                style={{
                  background: 'rgba(0, 240, 255, 0.1)',
                  border: '1px solid rgba(0, 240, 255, 0.3)',
                  color: 'var(--accent-cyan)',
                  padding: '0.2rem 0.55rem',
                  borderRadius: '4px',
                  fontSize: '0.78rem',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {item.code} <small style={{ opacity: 0.6 }}>({item.time})</small>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
