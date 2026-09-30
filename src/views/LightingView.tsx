import React, { useState, useEffect, useMemo } from 'react';
import { useLightingStore, ALL_RGB_EFFECTS, HARDWARE_GRADIENTS, COLOR_SWATCHES } from '../store/useLightingStore';
import { useKeymapStore } from '../store/useKeymapStore';
import { useDeviceStore } from '../store/useDeviceStore';
import { useUIStore, LightingSubTab } from '../store/useUIStore';
import { getLayoutForPreset, getSideLedSegments, isSidelightSupported } from '../data/layouts';
import { ALL_DEVICE_DESCRIPTORS } from '../data/devices';
import { getKeycodeInfo } from '../data/keycodes';
import { useI18n } from '../i18n';
import { useKeyboardFit } from '../hooks/useKeyboardFit';
import { useLightingVisualizer } from '../hooks/useLightingVisualizer';
import { HardwareGradientStudio } from '../components/common/HardwareGradientStudio';
import { KeyboardAppearanceButton } from '../components/common/KeyboardAppearanceButton';
import { useKeyboardThemeStore } from '../store/useKeyboardThemeStore';

export const LightingView: React.FC = () => {
  const {
    backlight,
    sidelight,
    reactive,
    winLock,
    capsLock,
    numLock,
    scrollLock,
    layerLighting,
    logoLocks,
    activeProfileIndex,
    activePaintColor,
    selectedLeds,
    isSimulatingFn,
    setBacklight,
    setSidelight,
    setReactive,
    setWinLock,
    setCapsLock,
    setNumLock,
    setScrollLock,
    setLayerLighting,
    setLogoLocks,
    setActiveProfileIndex,
    setActivePaintColor,
    paintLed,
    fillSelectedLeds,
    clearProfileLeds,
    selectKeyGroup,
    applyTemplate,
    setSimulatingFn,
    saveLightingToHardware,
  } = useLightingStore();

  const canvasThemeStyles = useKeyboardThemeStore((s) => s.canvasThemeStyles);

  const { presetLayoutId, getKeycode, layerKeymaps } = useKeymapStore();
  const { discardAllChanges, activeLayer: hwActiveLayer, dirtyModules } = useDeviceStore();
  const { lightingSubTab, setLightingSubTab } = useUIStore();
  const { t } = useI18n();

  const effectiveFnActive = isSimulatingFn || (hwActiveLayer !== undefined && hwActiveLayer > 0);

  const isPerKeyActive = backlight.effect >= 39 && backlight.effect <= 41;
  const isHardwareGradientActive = !isPerKeyActive && (
    backlight.gradientPreset >= 8 ||
    (sidelight.customEnable && sidelight.gradientPreset >= 8)
  );

  const [isTemplatesOpen, setTemplatesOpen] = useState(false);
  const [isHelpOpen, setHelpOpen] = useState(false);
  const isConnected = useDeviceStore((s) => s.isConnected);
  const activeDescriptor = useDeviceStore((s) => s.activeDescriptor);
  const desc = activeDescriptor || ALL_DEVICE_DESCRIPTORS.find((d) => d.id === presetLayoutId) || null;
  const hasLighting = desc ? (desc.capabilities?.hasLighting !== false) : true;
  const hasLogoBadge = isConnected ? (desc?.capabilities?.hasLogoBadgeLed === true) : true;

  // Synchronize lighting parameters directly from keyboard hardware on mount
  useEffect(() => {
    if (useDeviceStore.getState().isConnected) {
      useLightingStore.getState().loadFromHardware();
    }
  }, []);

  useEffect(() => {
    if (lightingSubTab === 'logo' && isConnected && desc && !desc.capabilities?.hasLogoBadgeLed) {
      setLightingSubTab('backlight');
    }
  }, [lightingSubTab, isConnected, desc, setLightingSubTab]);

  const layoutKeys = useMemo(() => getLayoutForPreset(presetLayoutId), [presetLayoutId]);
  const hasSidelights = useMemo(() => isSidelightSupported(presetLayoutId, desc), [presetLayoutId, desc]);

  const supportedLocks = useMemo(() => {
    const hasCapsLock = layoutKeys.some(
      (k) =>
        k.id === 'CAPS' ||
        k.id === 'KC_CAPS' ||
        k.defaultKeycode === 57 ||
        k.label?.toLowerCase().includes('caps')
    );

    const hasWinKey = layoutKeys.some(
      (k) =>
        k.id === 'LWIN' ||
        k.id === 'RWIN' ||
        k.id === 'WIN' ||
        k.id === 'KC_LGUI' ||
        k.id === 'KC_RGUI' ||
        k.defaultKeycode === 227 ||
        k.defaultKeycode === 231 ||
        k.label?.toLowerCase().includes('win') ||
        k.label?.toLowerCase().includes('cmd')
    );
    const hasWinLock = (desc?.capabilities?.hasWinLock !== false) && hasWinKey;

    const hasNumLock = layoutKeys.some(
      (k) =>
        k.id === 'NUM' ||
        k.id === 'NLCK' ||
        k.id === 'KC_NUM' ||
        k.id === 'KC_NUM_LOCK' ||
        k.id === 'KC_NLCK' ||
        k.defaultKeycode === 83 ||
        k.label?.toLowerCase() === 'num' ||
        k.label?.toLowerCase() === 'nlck' ||
        k.label?.toLowerCase().includes('num lock')
    );

    const hasScrollLock = layoutKeys.some(
      (k) =>
        k.id === 'SCRL' ||
        k.id === 'SLCK' ||
        k.id === 'KC_SCRL' ||
        k.id === 'KC_SCROLL_LOCK' ||
        k.id === 'KC_SLCK' ||
        k.defaultKeycode === 71 ||
        k.label?.toLowerCase().includes('scrl') ||
        k.label?.toLowerCase().includes('scroll') ||
        k.label?.toLowerCase() === 'slck'
    );

    return {
      hasCapsLock: hasCapsLock || (layoutKeys.length === 0),
      hasWinLock,
      hasNumLock,
      hasScrollLock,
    };
  }, [layoutKeys, desc]);

  const hasAnyLockSupported = supportedLocks.hasCapsLock || supportedLocks.hasWinLock || supportedLocks.hasNumLock || supportedLocks.hasScrollLock;

  useEffect(() => {
    if (lightingSubTab === 'winlock' && !hasAnyLockSupported) {
      setLightingSubTab('backlight');
    }
  }, [lightingSubTab, hasAnyLockSupported, setLightingSubTab]);


  const unitSize = 46;
  const { canvasWidth, canvasHeight } = useMemo(() => {
    let maxX = 0;
    let maxY = 0;
    layoutKeys.forEach((k) => {
      const rX = k.x + (k.w || 1);
      const rY = k.y + (k.h || 1);
      if (rX > maxX) maxX = rX;
      if (rY > maxY) maxY = rY;
    });
    return {
      canvasWidth: Math.ceil(maxX * unitSize) + 36,
      canvasHeight: Math.ceil(maxY * unitSize) + 36,
    };
  }, [layoutKeys]);

  const sideLeds = useMemo(() => {
    if (!hasSidelights) return null;
    return getSideLedSegments(presetLayoutId, canvasHeight, desc);
  }, [hasSidelights, presetLayoutId, canvasHeight, desc]);

  const { wrapperRef, canvasRef } = useKeyboardFit(canvasWidth, canvasHeight);
  const { registerKeyHit } = useLightingVisualizer(canvasRef, layoutKeys);

  const [marqueeBox, setMarqueeBox] = useState<{ left: number; top: number; width: number; height: number } | null>(null);
  const dragRef = React.useRef<{
    startX: number;
    startY: number;
    shiftKey: boolean;
    didDrag: boolean;
    initialSelection: Set<number>;
  } | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isPerKeyActive) return;
    if (e.button !== 0) return;

    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      shiftKey: Boolean(e.shiftKey || e.ctrlKey || e.metaKey),
      didDrag: false,
      initialSelection: new Set(selectedLeds),
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPerKeyActive || !dragRef.current) return;

    const drag = dragRef.current;
    const dist = Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY);

    if (!drag.didDrag && dist > 4) {
      drag.didDrag = true;
    }

    if (drag.didDrag && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const scale = rect.width / (canvasWidth || 1);

      const startCanvasX = (drag.startX - rect.left) / scale;
      const startCanvasY = (drag.startY - rect.top) / scale;
      const curCanvasX = (e.clientX - rect.left) / scale;
      const curCanvasY = (e.clientY - rect.top) / scale;

      const minX = Math.min(startCanvasX, curCanvasX);
      const minY = Math.min(startCanvasY, curCanvasY);
      const w = Math.abs(curCanvasX - startCanvasX);
      const h = Math.abs(curCanvasY - startCanvasY);

      setMarqueeBox({ left: minX, top: minY, width: w, height: h });

      const mLeft = minX;
      const mTop = minY;
      const mRight = minX + w;
      const mBottom = minY + h;

      const nextSelection = drag.shiftKey ? new Set(drag.initialSelection) : new Set<number>();

      // Intersect layout keys
      layoutKeys.forEach((key, idx) => {
        if ((key as any).isKnob) return;
        const kW = (key.w || 1) * unitSize - 4;
        const kH = (key.h || 1) * unitSize - 4;
        const kL = key.x * unitSize + 18;
        const kT = key.y * unitSize + 18;
        const kR = kL + kW;
        const kB = kT + kH;

        if (kL < mRight && kR > mLeft && kT < mBottom && kB > mTop) {
          nextSelection.add(idx);
        }
      });

      // Intersect left & right sidelights
      if (hasSidelights && sideLeds) {
        sideLeds.left.forEach((sled, sIdx) => {
          const sL = 6;
          const sT = sled.top;
          const sR = 30;
          const sB = sT + sled.height;
          if (sL < mRight && sR > mLeft && sT < mBottom && sB > mTop) {
            nextSelection.add(layoutKeys.length + sIdx);
          }
        });
        sideLeds.right.forEach((sled, sIdx) => {
          const sL = canvasWidth - 30;
          const sT = sled.top;
          const sR = canvasWidth - 6;
          const sB = sT + sled.height;
          if (sL < mRight && sR > mLeft && sT < mBottom && sB > mTop) {
            nextSelection.add(layoutKeys.length + sideLeds.left.length + sIdx);
          }
        });
      }

      useLightingStore.getState().setSelectedLeds(nextSelection);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isPerKeyActive || !dragRef.current) return;
    const drag = dragRef.current;
    dragRef.current = null;
    setMarqueeBox(null);

    if (drag.didDrag) return;

    // If clicked on canvas background (not keycap or sidelight)
    const target = e.target as HTMLElement;
    const isInteractive = target.closest('.lighting-keycap') || target.closest('.side-diffuser-segment');
    if (!isInteractive && !drag.shiftKey) {
      useLightingStore.getState().setSelectedLeds(new Set());
    }
  };

  const handleKeycapClick = (idx: number, e: React.MouseEvent) => {
    if (!isPerKeyActive) {
      const key = layoutKeys[idx];
      if (key) {
        registerKeyHit(key.id || key.label || '', (key as any).qmkPoint?.[0] || 0, (key as any).qmkPoint?.[1] || 0);
      }
      return;
    }

    const isMulti = e.shiftKey || e.ctrlKey || e.metaKey;
    if (isMulti) {
      const next = new Set(selectedLeds);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      useLightingStore.getState().setSelectedLeds(next);
      return;
    }

    if (selectedLeds.size > 0 && selectedLeds.has(idx)) {
      fillSelectedLeds();
      return;
    }

    useLightingStore.getState().setSelectedLeds(new Set());
    paintLed(idx);
  };

  const subTabs: Array<{ id: LightingSubTab; labelKey: string; icon: React.ReactNode }> = [
    {
      id: 'backlight',
      labelKey: 'tabBacklight',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18h6"></path>
          <path d="M10 22h4"></path>
          <path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z"></path>
        </svg>
      ),
    },
    {
      id: 'reactive',
      labelKey: 'tabReactive',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
      ),
    },
    ...(hasAnyLockSupported ? [{
      id: 'winlock' as LightingSubTab,
      labelKey: 'tabIndicators',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      ),
    }] : []),
    {
      id: 'layers',
      labelKey: 'tabLayers',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m12 2 10 6.5v7L12 22 2 15.5v-7L12 2z"></path>
          <path d="M12 22v-6.5"></path>
          <path d="m22 8.5-10 7-10-7"></path>
          <path d="m2 15.5 10-7 10 7"></path>
        </svg>
      ),
    },
    ...(hasLogoBadge ? [{
      id: 'logo' as LightingSubTab,
      labelKey: 'tabLogo',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 3h12l4 6-10 13L2 9z"></path>
          <path d="M11 3 8 9l4 13 4-13-3-6"></path>
          <path d="M2 9h20"></path>
        </svg>
      ),
    }] : []),
  ];

  const currentEff = ALL_RGB_EFFECTS.find((e) => e.id === backlight.effect) || ALL_RGB_EFFECTS[13];

  return (
    <section className="view-container active" id="view-lighting">
      {/* Lighting Not Supported Banner */}
      {isConnected && !hasLighting && (
        <div
          style={{
            marginBottom: '1rem',
            padding: '0.85rem 1.15rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            color: '#fca5a5',
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, color: '#ef4444' }}>
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.92rem', color: '#ffffff' }}>
              {t('lblLightingNotSupported')}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              {t('lblLightingNotSupportedDesc')}
            </div>
          </div>
        </div>
      )}

      {/* Live RGB Visualizer Virtual Keyboard */}
      <div className="keyboard-canvas-card" style={{ marginBottom: '1.5rem' }}>
        <div className="keyboard-canvas-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="live-dot-pulse"></span>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>{t('lightingLivePreviewTitle')}</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <KeyboardAppearanceButton />
            <button
              type="button"
              className={`btn ${effectiveFnActive ? 'btn-primary' : 'btn-secondary'}`}
              id="btnHoldFnSim"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
              onClick={() => setSimulatingFn(!isSimulatingFn)}
              title={isSimulatingFn ? t('btnSimulatingFnActive') : t('btnSimulateFn')}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              <span>{isSimulatingFn ? t('btnPreviewLayerActive') : t('btnPreviewLayer')}</span>
            </button>
            <div className="lighting-preview-status">
              <span className="badge-pill" id="lightingStatusBadge">
                {currentEff.name} • {Math.round((backlight.brightness / 255) * 100)}% Brightness
              </span>
            </div>
          </div>
        </div>

        {/* Matrix Canvas */}
        <div
          className="keyboard-scroll-wrapper"
          id="lightingKeyboardScrollWrapper"
          ref={wrapperRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <div
            className={`keyboard-canvas ${hasSidelights ? 'has-sidelights' : ''}`}
            id="lightingKeyboardCanvas"
            ref={canvasRef}
            style={{ width: `${canvasWidth}px`, height: `${canvasHeight}px`, position: 'relative', ...canvasThemeStyles }}
          >
            {/* Left & Right Sidelight LED Diffusers */}
            {hasSidelights && sideLeds && (
              <div className="side-diffusers-container">
                {sideLeds.left.map((sled, sIdx) => {
                  const sledIdx = layoutKeys.length + sIdx;
                  return (
                    <div
                      key={sled.id}
                      data-key-id={sled.id}
                      className={`side-diffuser-segment side-diffuser-left ${selectedLeds.has(sledIdx) ? 'perkey-selected' : ''}`}
                      style={{
                        top: `${sled.top}px`,
                        height: `${sled.height}px`,
                        left: '6px',
                        cursor: isPerKeyActive ? 'pointer' : 'default',
                      }}
                      title={`Side LED Left (${sled.id})`}
                      onClick={(e) => handleKeycapClick(sledIdx, e)}
                    />
                  );
                })}
                {sideLeds.right.map((sled, sIdx) => {
                  const sledIdx = layoutKeys.length + sideLeds.left.length + sIdx;
                  return (
                    <div
                      key={sled.id}
                      data-key-id={sled.id}
                      className={`side-diffuser-segment side-diffuser-right ${selectedLeds.has(sledIdx) ? 'perkey-selected' : ''}`}
                      style={{
                        top: `${sled.top}px`,
                        height: `${sled.height}px`,
                        right: '6px',
                        cursor: isPerKeyActive ? 'pointer' : 'default',
                      }}
                      title={`Side LED Right (${sled.id})`}
                      onClick={(e) => handleKeycapClick(sledIdx, e)}
                    />
                  );
                })}
              </div>
            )}

            {layoutKeys.map((key, idx) => {
              const w = (key.w || 1) * unitSize - 4;
              const h = (key.h || 1) * unitSize - 4;
              const left = key.x * unitSize + 18;
              const top = key.y * unitSize + 18;
              const keyId = key.id || ((key as any).isLogo ? 'LOGO_LED' : (key.label || `k-${key.matrix?.[0]}-${key.matrix?.[1]}`));

              if ((key as any).isLogo) {
                return (
                  <div
                    key={idx}
                    data-key-id={keyId}
                    className={`lighting-keycap logo-keycap ${selectedLeds.has(idx) ? 'perkey-selected' : ''}`}
                    style={{
                      position: 'absolute',
                      left: `${left}px`,
                      top: `${top}px`,
                      width: `${w}px`,
                      height: `${h}px`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                    onClick={(e) => handleKeycapClick(idx, e)}
                  />
                );
              }

              if ((key as any).isKnob) {
                const knobSize = Math.min(w, h);
                return (
                  <div
                    key={idx}
                    data-key-id={keyId}
                    className="lighting-keycap keycap-knob"
                    style={{
                      position: 'absolute',
                      left: `${left + (w - knobSize) / 2}px`,
                      top: `${top + (h - knobSize) / 2}px`,
                      width: `${knobSize}px`,
                      height: `${knobSize}px`,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      useUIStore.getState().setActiveView('encoder');
                    }}
                    title={t('navEncoder', 'Rotary Knob')}
                  />
                );
              }

              const row = key.matrix ? key.matrix[0] : -1;
              const col = key.matrix ? key.matrix[1] : -1;

              const activeLyr = effectiveFnActive ? ((hwActiveLayer !== undefined && hwActiveLayer > 0) ? hwActiveLayer : 1) : 0;
              let dynamicLabel = key.label || key.id || '';
              if (row >= 0 && col >= 0) {
                if (activeLyr > 0) {
                  const kc = getKeycode(activeLyr, row, col);
                  if (kc !== 0x0000 && kc !== 0x0001) {
                    const info = getKeycodeInfo(kc);
                    dynamicLabel = info.label || info.name || key.label || key.id || '';
                  } else {
                    const kc0 = getKeycode(0, row, col);
                    if (kc0 !== 0x0000) {
                      const info0 = getKeycodeInfo(kc0);
                      if (info0.label === 'MO(1)') dynamicLabel = 'Fn';
                      else dynamicLabel = info0.label || key.label || key.id || '';
                    }
                  }
                } else {
                  const kc0 = getKeycode(0, row, col);
                  if (kc0 !== 0x0000) {
                    const info0 = getKeycodeInfo(kc0);
                    if (info0.label === 'MO(1)') dynamicLabel = 'Fn';
                    else dynamicLabel = info0.label || key.label || key.id || '';
                  }
                }
              }

              return (
                <button
                  key={`${row}-${col}-${idx}`}
                  type="button"
                  data-key-id={key.id || key.label || ''}
                  className={`lighting-keycap key-group-${key.group || 'alpha'} ${selectedLeds.has(idx) ? 'perkey-selected' : ''}`}
                  style={{
                    position: 'absolute',
                    left: `${left}px`,
                    top: `${top}px`,
                    width: `${w}px`,
                    height: `${h}px`,
                  }}
                  onClick={(e) => handleKeycapClick(idx, e)}
                  title={dynamicLabel ? `${key.label || key.id}: ${dynamicLabel}` : undefined}
                >
                  <span className="l-legend">
                    {dynamicLabel}
                  </span>
                </button>
              );
            })}

            {/* Marquee Drag Box Selection Rectangle */}
            {marqueeBox && (
              <div
                className="perkey-marquee-box"
                style={{
                  position: 'absolute',
                  left: `${marqueeBox.left}px`,
                  top: `${marqueeBox.top}px`,
                  width: `${marqueeBox.width}px`,
                  height: `${marqueeBox.height}px`,
                  pointerEvents: 'none',
                  zIndex: 999,
                }}
              />
            )}
          </div>
        </div>

        {/* Per-Key Live Visualizer Hint Bar */}
        {isPerKeyActive && (
          <div className="perkey-live-hint-bar">
            <span className="perkey-hint-chip">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
              {t('hintPerKeyClick')}
            </span>
            <span className="perkey-hint-chip">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
              {t('hintPerKeyMarquee')}
            </span>
            <span className="perkey-hint-chip">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              {t('hintPerKeyShift')}
            </span>
            <span className="perkey-hint-chip">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              {t('hintPerKeyGroups')}
            </span>
          </div>
        )}
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="lighting-tabs-header">
        {subTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`lighting-tab-btn ${lightingSubTab === tab.id ? 'active' : ''}`}
            onClick={() => setLightingSubTab(tab.id)}
          >
            {tab.icon}
            <span>{t(tab.labelKey)}</span>
          </button>
        ))}
      </div>

      {/* 1. Sub-Tab: Main Backlight & Per-Key Dock */}
      {lightingSubTab === 'backlight' && (
        <div className="lighting-subview active" id="lighting-tab-backlight">
          <div className={`backlight-layout-grid ${isPerKeyActive || isHardwareGradientActive ? 'perkey-active' : ''}`} id="backlightLayoutGrid">
            {/* Left Column: Master Backlight Parameters */}
            <div className="palette-card backlight-settings-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem' }}>{t('tabBacklight')}</h3>
                {isPerKeyActive && (
                  <span className="badge-pill" style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)' }}>
                    Per-Key Studio Active
                  </span>
                )}
              </div>

              {/* Master Brightness */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label>{t('lblBrightness')}</label>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{backlight.brightness}</span>
                </div>
                <div className="range-slider-wrap">
                  <input
                    type="range"
                    className="range-slider"
                    min={0}
                    max={255}
                    value={backlight.brightness}
                    onChange={(e) => setBacklight({ brightness: Number(e.target.value) })}
                  />
                </div>
              </div>

              {/* Effect Selector */}
              <div className="form-group">
                <label>{t('lblEffect')}</label>
                <select
                  className="form-control"
                  value={backlight.effect}
                  onChange={(e) => {
                    const eff = Number(e.target.value);
                    setBacklight({ effect: eff });
                    if (eff >= 39 && eff <= 41) {
                      setActiveProfileIndex(eff - 39);
                    }
                  }}
                >
                  {ALL_RGB_EFFECTS.map((eff) => (
                    <option key={eff.id} value={eff.id}>
                      {eff.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Speed */}
              {!isPerKeyActive && (
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <label>{t('lblSpeed')}</label>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{backlight.speed}</span>
                  </div>
                  <div className="range-slider-wrap">
                    <input
                      type="range"
                      className="range-slider"
                      min={10}
                      max={255}
                      value={backlight.speed}
                      onChange={(e) => setBacklight({ speed: Number(e.target.value) })}
                    />
                  </div>
                </div>
              )}

              {/* Density */}
              {!isPerKeyActive && (
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <label>{t('lblRgbDensity')}</label>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                        {t('hintRgbDensity')}
                      </span>
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{backlight.density}</span>
                  </div>
                  <div className="range-slider-wrap">
                    <input
                      type="range"
                      className="range-slider"
                      min={32}
                      max={255}
                      value={backlight.density}
                      onChange={(e) => setBacklight({ density: Number(e.target.value) })}
                    />
                  </div>
                </div>
              )}

              {/* Effect Color */}
              {!isPerKeyActive && (
                <div className="form-group">
                  <label>{t('lblRgbColor')}</label>
                  <div className="color-input-wrap">
                    <input
                      type="color"
                      className="color-picker-input"
                      value={backlight.color}
                      onChange={(e) => setBacklight({ color: e.target.value })}
                    />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('hintSingleColor')}</span>
                  </div>
                </div>
              )}

              {/* Hardware Gradient Preset */}
              {!isPerKeyActive && (
                <div className="form-group" style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label>{t('lblHardwareGradientPreset')}</label>
                    <span className="badge-pill" style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)' }}>
                      EEPROM Standalone
                    </span>
                  </div>
                  <select
                    className="form-control"
                    value={backlight.gradientPreset}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setBacklight({ gradientPreset: val });
                      if (val >= 8) {
                        useLightingStore.getState().setActiveHardwareGradientProfile(val - 8);
                      }
                    }}
                  >
                    {HARDWARE_GRADIENTS.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Reverse Animation Direction */}
              {!isPerKeyActive && (
                <div className="switch-wrap" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '1rem' }}>
                  <div>
                    <span style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem' }}>{t('lblReverse')}</span>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={backlight.reverse}
                      onChange={(e) => setBacklight({ reverse: e.target.checked })}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              )}

              {/* Sidelight Custom Enable */}
              <div className="switch-wrap" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '1rem' }}>
                <div>
                  <span style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem' }}>{t('lblSidelightCustomEnable')}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('hintSidelightCustomEnable')}</span>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={Boolean(sidelight.customEnable)}
                    onChange={(e) => setSidelight({
                      customEnable: e.target.checked,
                      effect: sidelight.effect ? sidelight.effect : 1
                    })}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              {/* Sidelight Settings Collapsible Container */}
              {sidelight.customEnable && (
                <div style={{ background: 'rgba(0, 0, 0, 0.2)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem', marginTop: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{t('lblSidelightSectionTitle')}</span>
                    <span className="badge-pill" style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)' }}>
                      Side Lightbars
                    </span>
                  </div>

                  {/* Sidelight Effect Mode */}
                  <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                    <label>{t('lblSidelightEffect')}</label>
                    <select
                      className="form-control"
                      value={sidelight.effect}
                      onChange={(e) => setSidelight({ effect: Number(e.target.value) })}
                    >
                      <option value={1}>{t('optSidelightSolid')}</option>
                      <option value={2}>{t('optSidelightBreathing')}</option>
                      <option value={3}>{t('optSidelightCycleRainbow')}</option>
                      <option value={4}>{t('optSidelightRainbowWave')}</option>
                      <option value={5}>{t('optSidelightRainbowCenterWave')}</option>
                      <option value={6}>{t('optSidelightGradientWave')}</option>
                      <option value={7}>{t('optSidelightGradientCenterWave')}</option>
                      <option value={8}>{t('optSidelightGradientCycle')}</option>
                      <option value={9}>{t('optSidelightGradientBreathe')}</option>
                      <option value={10}>{t('optSidelightSingleWave')}</option>
                      <option value={11}>{t('optSidelightDiagnostic')}</option>
                      <option value={12}>{t('optSidelightOff')}</option>
                    </select>
                  </div>

                  {/* Sidelight Gradient Palette (for Gradient Wave, Gradient Center Wave, Gradient Cycle, Gradient Breathe) */}
                  {sidelight.effect >= 6 && sidelight.effect <= 9 && (
                    <div className="form-group" style={{ marginTop: '0.75rem' }}>
                      <label>{t('lblSidelightGradient')}</label>
                      <select
                        className="form-control"
                        value={sidelight.gradientPreset}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setSidelight({ gradientPreset: val });
                          if (val >= 8) {
                            useLightingStore.getState().setActiveHardwareGradientProfile(val - 8);
                          }
                        }}
                      >
                        {HARDWARE_GRADIENTS.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Sidelight Single Color Picker */}
                  {(sidelight.effect === 1 || sidelight.effect === 2 || sidelight.effect === 10) && (
                    <div className="form-group" style={{ marginTop: '0.75rem' }}>
                      <label>{t('lblSidelightColor')}</label>
                      <div className="color-input-wrap">
                        <input
                          type="color"
                          className="color-picker-input"
                          value={sidelight.color}
                          onChange={(e) => setSidelight({ color: e.target.value })}
                        />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('hintSidelightColor')}</span>
                      </div>
                    </div>
                  )}

                  {/* Sidelight Animation Speed */}
                  {sidelight.effect >= 2 && sidelight.effect <= 10 && (
                    <div className="form-group" style={{ marginTop: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <label>{t('lblSidelightSpeed')}</label>
                        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{sidelight.speed}</span>
                      </div>
                      <div className="range-slider-wrap">
                        <input
                          type="range"
                          className="range-slider"
                          min={10}
                          max={255}
                          value={sidelight.speed}
                          onChange={(e) => setSidelight({ speed: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                  )}

                  {/* Sidelight Density */}
                  {(sidelight.effect === 4 || sidelight.effect === 5 || sidelight.effect === 6 || sidelight.effect === 7 || sidelight.effect === 10) && (
                    <div className="form-group" style={{ marginTop: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <label>{t('lblSidelightDensity')}</label>
                        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{sidelight.density}</span>
                      </div>
                      <div className="range-slider-wrap">
                        <input
                          type="range"
                          className="range-slider"
                          min={1}
                          max={255}
                          value={sidelight.density}
                          onChange={(e) => setSidelight({ density: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                  )}

                  {/* Sidelight Reverse Direction Switch */}
                  {(sidelight.effect === 4 || sidelight.effect === 6 || sidelight.effect === 10) && (
                    <div className="switch-wrap" style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                      <div>
                        <span style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem' }}>{t('lblSidelightReverse')}</span>
                      </div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={sidelight.reverse}
                          onChange={(e) => setSidelight({ reverse: e.target.checked })}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>
                  )}
                </div>
              )}

              {/* Save & Discard Buttons */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" className="btn btn-secondary btn-sm" id="btnDiscardBacklightEEPROM" onClick={discardAllChanges}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                    <polyline points="3 3 3 8 8 8"></polyline>
                  </svg>
                  <span>{t('btnDiscardLightingEEPROM', 'Cofnij do zapisanych')}</span>
                </button>
                <button
                  type="button"
                  className={`btn btn-primary btn-sm ${dirtyModules.has('lighting') || dirtyModules.has('sidelight') ? 'btn-save-eeprom-pulse' : ''}`}
                  id="btnSaveBacklightEEPROM"
                  onClick={saveLightingToHardware}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  </svg>
                  <span>{t('btnSaveLightingEEPROM')}</span>
                </button>
              </div>
            </div>

            {/* Right Column: Per-Key Color Studio Dock */}
            {isPerKeyActive && (
              <div className="palette-card perkey-studio-card" style={{ display: 'block' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="live-dot-pulse" style={{ width: '8px', height: '8px', background: 'var(--accent-cyan)' }}></span>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>{t('lblPerKeyStudioTitle')}</h3>
                  </div>
                  <span className="badge-pill" style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)' }}>
                    EEPROM Standalone
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  {t('perKeyStudioDesc')}
                </p>

                {/* Profile Switcher Tabs */}
                <div className="perkey-profile-tabs">
                  {[0, 1, 2].map((idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`perkey-prof-tab-btn ${activeProfileIndex === idx ? 'active' : ''}`}
                      onClick={() => {
                        setActiveProfileIndex(idx);
                        setBacklight({ effect: 39 + idx });
                      }}
                    >
                      <span>Profile {idx + 1}</span>
                    </button>
                  ))}
                </div>

                {/* Color Palette & Swatches */}
                <div className="perkey-palette-bar">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div className="color-picker-wrapper" style={{ position: 'relative' }}>
                      <input
                        type="color"
                        className="color-picker-input"
                        value={activePaintColor}
                        onChange={(e) => setActivePaintColor(e.target.value)}
                        style={{ width: '36px', height: '36px', borderRadius: '6px', cursor: 'pointer' }}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                        {t('lblActivePaintColor')}
                      </span>
                      <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--accent-cyan)' }}>
                        {activePaintColor.toUpperCase()}
                      </strong>
                    </div>
                  </div>

                  {/* Swatches */}
                  <div className="perkey-swatches-grid">
                    {COLOR_SWATCHES.map((swatch, sIdx) => (
                      <button
                        key={sIdx}
                        type="button"
                        className="swatch-btn"
                        style={{ backgroundColor: swatch }}
                        onClick={() => setActivePaintColor(swatch)}
                      />
                    ))}
                  </div>
                </div>

                {/* Quick Key Selection Buttons */}
                <div className="perkey-groups-bar">
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                    {t('lblQuickSelectGroup')}
                  </label>
                  <div className="perkey-group-buttons">
                    {['all', 'wasd', 'alpha', 'mod', 'num', 'numpad', 'nav', 'func', 'sidelights', 'logo'].map((grp) => (
                      <button
                        key={grp}
                        type="button"
                        className="btn btn-secondary btn-sm perkey-grp-btn"
                        onClick={() => selectKeyGroup(grp)}
                      >
                        <span>{grp.toUpperCase()}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="perkey-actions-bar">
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => fillSelectedLeds()}>
                      <span>{t('btnFillSelected')}</span>
                    </button>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={clearProfileLeds}>
                      <span>{t('btnClearProfile')}</span>
                    </button>
                    <div className="dropdown-wrapper" style={{ position: 'relative' }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => setTemplatesOpen(!isTemplatesOpen)}
                      >
                        <span>{t('btnPresetsTemplates')}</span>
                      </button>
                      {isTemplatesOpen && (
                        <div className="perkey-templates-menu" style={{ display: 'block', position: 'absolute', bottom: '100%', left: 0 }}>
                          {['fps', 'moba', 'mmo', 'racing', 'cyberpunk', 'matrix', 'office', 'rainbow'].map((tpl) => (
                            <button
                              key={tpl}
                              type="button"
                              className="template-item-btn"
                              onClick={() => {
                                applyTemplate(tpl);
                                setTemplatesOpen(false);
                              }}
                            >
                              {tpl.toUpperCase()}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '0.75rem' }}>
                    <button type="button" className="btn btn-secondary btn-sm" style={{ flex: 1 }} id="btnDiscardPerKeyEEPROM" onClick={discardAllChanges}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                        <polyline points="3 3 3 8 8 8"></polyline>
                      </svg>
                      <span>{t('btnDiscardProfileEEPROM', 'Cofnij')}</span>
                    </button>
                    <button
                      type="button"
                      className={`btn btn-primary btn-sm ${dirtyModules.has('perkey') ? 'btn-save-eeprom-pulse' : ''}`}
                      style={{ flex: 2 }}
                      id="btnSavePerKeyProfile"
                      onClick={saveLightingToHardware}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                        <polyline points="17 21 17 13 7 13 7 21"></polyline>
                      </svg>
                      <span>{t('btnSaveProfileEEPROM')}</span>
                    </button>
                  </div>
                </div>

                {/* Instructions Accordion Guide */}
                <div className={`perkey-instructions-card ${isHelpOpen ? '' : 'collapsed'}`}>
                  <button
                    type="button"
                    className="perkey-instructions-toggle"
                    onClick={() => setHelpOpen(!isHelpOpen)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                      </svg>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{t('perKeyHelpTitle')}</span>
                    </div>
                    <svg className="chevron-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                  {isHelpOpen && (
                    <div className="perkey-instructions-content">
                      <div className="perkey-guide-grid">
                        <div className="perkey-guide-item">
                          <div className="guide-header">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
                            <strong>{t('guidePaintTitle')}</strong>
                          </div>
                          <p>{t('guidePaintDesc')}</p>
                        </div>

                        <div className="perkey-guide-item">
                          <div className="guide-header">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
                            <strong>{t('guideMarqueeTitle')}</strong>
                          </div>
                          <p>{t('guideMarqueeDesc')}</p>
                        </div>

                        <div className="perkey-guide-item">
                          <div className="guide-header">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                            <strong>{t('guideShiftTitle')}</strong>
                          </div>
                          <p>{t('guideShiftDesc')}</p>
                        </div>

                        <div className="perkey-guide-item">
                          <div className="guide-header">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                            <strong>{t('guideGroupsTitle')}</strong>
                          </div>
                          <p>{t('guideGroupsDesc')}</p>
                        </div>

                        <div className="perkey-guide-item">
                          <div className="guide-header">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8l5.2 5.2c.8.8 2 .8 2.8 0L19 11Z"/><path d="m5 2 5 5"/><path d="M2 13h15"/></svg>
                            <strong>{t('guideFillTitle')}</strong>
                          </div>
                          <p>{t('guideFillDesc')}</p>
                        </div>

                        <div className="perkey-guide-item">
                          <div className="guide-header">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/></svg>
                            <strong>{t('guideSaveTitle')}</strong>
                          </div>
                          <p>{t('guideSaveDesc')}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Right Column: Hardware Multi-Stop Gradient Studio Dock (when Profile 1 or Profile 2 gradient is selected) */}
            {isHardwareGradientActive && (
              <HardwareGradientStudio />
            )}
          </div>
        </div>
      )}

      {/* 2. Sub-Tab: Reactive Layer */}
      {lightingSubTab === 'reactive' && (
        <div className="lighting-subview active" id="lighting-tab-reactive">
          <div className="palette-card" style={{ maxWidth: '680px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.05rem' }}>{t('reactiveSectionTitle')}</h3>
              <span className="badge-pill" style={{ fontSize: '0.75rem' }}>
                {reactive.enable ? t('badgeEnabled') : t('badgeDisabled')}
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              {t('reactiveDesc')}
            </p>

            <div className="switch-wrap" style={{ marginBottom: '1.25rem' }}>
              <div>
                <span style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem' }}>{t('lblReactiveEnable')}</span>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={reactive.enable}
                  onChange={(e) => setReactive({ enable: e.target.checked })}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="form-group">
              <label>{t('lblReactiveEffect')}</label>
              <select
                className="form-control"
                value={reactive.mode}
                onChange={(e) => setReactive({ mode: Number(e.target.value) })}
              >
                <option value={0}>{t('optReactiveOff')}</option>
                <option value={1}>{t('optReactiveFade')}</option>
                <option value={2}>{t('optReactiveSplash')}</option>
                <option value={3}>{t('optReactiveSplashRainbow')}</option>
                <option value={4}>{t('optReactiveCross')}</option>
                <option value={5}>{t('optReactiveNexus')}</option>
                <option value={6}>{t('optReactiveWide')}</option>
                <option value={7}>{t('optReactiveHeatmap')}</option>
              </select>
            </div>

            <div className="form-group">
              <label>{t('lblReactiveColor')}</label>
              <div className="color-input-wrap">
                <input
                  type="color"
                  className="color-picker-input"
                  value={reactive.color}
                  onChange={(e) => setReactive({ color: e.target.value })}
                />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('lblReactiveColorHint')}</span>
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label>{t('lblReactiveSpeed')}</label>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{reactive.speed}</span>
              </div>
              <div className="range-slider-wrap">
                <input
                  type="range"
                  className="range-slider"
                  min={10}
                  max={255}
                  value={reactive.speed}
                  onChange={(e) => setReactive({ speed: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>{t('lblReactiveBlend')}</label>
              <select
                className="form-control"
                value={reactive.blend}
                onChange={(e) => setReactive({ blend: Number(e.target.value) })}
              >
                <option value={0}>{t('optBlendAdditive')}</option>
                <option value={1}>{t('optBlendOverride')}</option>
              </select>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button type="button" className="btn btn-secondary btn-sm" id="btnDiscardReactiveEEPROM" onClick={discardAllChanges}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                  <polyline points="3 3 3 8 8 8"></polyline>
                </svg>
                <span>{t('btnDiscardLightingEEPROM', 'Cofnij do zapisanych')}</span>
              </button>
              <button
                type="button"
                className={`btn btn-primary btn-sm ${dirtyModules.has('reactive') ? 'btn-save-eeprom-pulse' : ''}`}
                id="btnSaveReactiveEEPROM"
                onClick={saveLightingToHardware}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                </svg>
                <span>{t('btnSaveLightingEEPROM')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Sub-Tab: Lock & Status Indicators */}
      {lightingSubTab === 'winlock' && (
        <div className="lighting-subview active" id="lighting-tab-winlock">
          <div style={{ maxWidth: '980px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="palette-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent-cyan)' }}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{t('lockIndicatorsSectionTitle')}</h3>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                {t('lockIndicatorsDesc')}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
              {/* Card 1: Caps Lock Indicator */}
              {supportedLocks.hasCapsLock && (
                <div className="palette-card">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent-cyan)' }}>
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                      <h4 style={{ fontSize: '0.98rem', fontWeight: 600 }}>{t('capsLockSectionTitle')}</h4>
                    </div>
                    <span className="badge-pill" style={{ fontSize: '0.72rem' }}>
                      Caps Lock
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '1.1rem', minHeight: '38px' }}>
                    {t('capsLockDesc')}
                  </p>

                  <div className="form-group">
                    <label>{t('lblCapsLockMode')}</label>
                    <select
                      className="form-control"
                      value={capsLock.mode}
                      onChange={(e) => setCapsLock({ mode: Number(e.target.value) })}
                    >
                      <option value={0}>{t('optLockAnim')}</option>
                      <option value={1}>{t('optLockOff')}</option>
                      <option value={2}>{t('optLockColor')}</option>
                    </select>
                  </div>

                  {capsLock.mode === 2 && (
                    <div className="form-group">
                      <label>{t('lblLockColor')}</label>
                      <div className="color-input-wrap">
                        <input
                          type="color"
                          className="color-picker-input"
                          value={capsLock.color}
                          onChange={(e) => setCapsLock({ color: e.target.value })}
                        />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('lblLockColorHint')}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Card 2: Windows Key Lock (Win Lock) */}
              {supportedLocks.hasWinLock && (
                <div className="palette-card">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#ec4899' }}>
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                      <h4 style={{ fontSize: '0.98rem', fontWeight: 600 }}>{t('winLockSectionTitle')}</h4>
                    </div>
                    <span className="badge-pill" style={{ fontSize: '0.72rem' }}>
                      Win Lock
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '1.1rem', minHeight: '38px' }}>
                    {t('winLockDesc')}
                  </p>

                  <div className="form-group">
                    <label>{t('lblWinLockMode')}</label>
                    <select
                      className="form-control"
                      value={winLock.mode}
                      onChange={(e) => setWinLock({ mode: Number(e.target.value) })}
                    >
                      <option value={0}>{t('optLockAnim')}</option>
                      <option value={1}>{t('optLockOff')}</option>
                      <option value={2}>{t('optLockColor')}</option>
                    </select>
                  </div>

                  {winLock.mode === 2 && (
                    <div className="form-group">
                      <label>{t('lblLockColor')}</label>
                      <div className="color-input-wrap">
                        <input
                          type="color"
                          className="color-picker-input"
                          value={winLock.color}
                          onChange={(e) => setWinLock({ color: e.target.value })}
                        />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('lblLockColorHint')}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Card 3: Num Lock Indicator */}
              {supportedLocks.hasNumLock && (
                <div className="palette-card">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent-blue)' }}>
                        <rect x="4" y="4" width="16" height="16" rx="2"></rect>
                        <line x1="9" y1="9" x2="9" y2="9.01"></line>
                        <line x1="15" y1="9" x2="15" y2="9.01"></line>
                        <line x1="9" y1="15" x2="9" y2="15.01"></line>
                        <line x1="15" y1="15" x2="15" y2="15.01"></line>
                      </svg>
                      <h4 style={{ fontSize: '0.98rem', fontWeight: 600 }}>{t('numLockSectionTitle')}</h4>
                    </div>
                    <span className="badge-pill" style={{ fontSize: '0.72rem' }}>
                      Num Lock
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '1.1rem', minHeight: '38px' }}>
                    {t('numLockDesc')}
                  </p>

                  <div className="form-group">
                    <label>{t('lblNumLockMode')}</label>
                    <select
                      className="form-control"
                      value={numLock.mode}
                      onChange={(e) => setNumLock({ mode: Number(e.target.value) })}
                    >
                      <option value={0}>{t('optLockAnim')}</option>
                      <option value={1}>{t('optLockOff')}</option>
                      <option value={2}>{t('optLockColor')}</option>
                    </select>
                  </div>

                  {numLock.mode === 2 && (
                    <div className="form-group">
                      <label>{t('lblLockColor')}</label>
                      <div className="color-input-wrap">
                        <input
                          type="color"
                          className="color-picker-input"
                          value={numLock.color}
                          onChange={(e) => setNumLock({ color: e.target.value })}
                        />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('lblLockColorHint')}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Card 4: Scroll Lock Indicator */}
              {supportedLocks.hasScrollLock && (
                <div className="palette-card">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent-purple)' }}>
                        <polyline points="7 13 12 18 17 13"></polyline>
                        <polyline points="7 6 12 11 17 6"></polyline>
                      </svg>
                      <h4 style={{ fontSize: '0.98rem', fontWeight: 600 }}>{t('scrollLockSectionTitle')}</h4>
                    </div>
                    <span className="badge-pill" style={{ fontSize: '0.72rem' }}>
                      Scroll Lock
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '1.1rem', minHeight: '38px' }}>
                    {t('scrollLockDesc')}
                  </p>

                  <div className="form-group">
                    <label>{t('lblScrollLockMode')}</label>
                    <select
                      className="form-control"
                      value={scrollLock.mode}
                      onChange={(e) => setScrollLock({ mode: Number(e.target.value) })}
                    >
                      <option value={0}>{t('optLockAnim')}</option>
                      <option value={1}>{t('optLockOff')}</option>
                      <option value={2}>{t('optLockColor')}</option>
                    </select>
                  </div>

                  {scrollLock.mode === 2 && (
                    <div className="form-group">
                      <label>{t('lblLockColor')}</label>
                      <div className="color-input-wrap">
                        <input
                          type="color"
                          className="color-picker-input"
                          value={scrollLock.color}
                          onChange={(e) => setScrollLock({ color: e.target.value })}
                        />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('lblLockColorHint')}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="palette-card" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', padding: '1rem 1.25rem' }}>
              <button type="button" className="btn btn-secondary btn-sm" id="btnDiscardWinLockEEPROM" onClick={discardAllChanges}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                  <polyline points="3 3 3 8 8 8"></polyline>
                </svg>
                <span>{t('btnDiscardLightingEEPROM', 'Cofnij do zapisanych')}</span>
              </button>
              <button
                type="button"
                className={`btn btn-primary btn-sm ${(
                  (supportedLocks.hasWinLock && dirtyModules.has('winlock')) ||
                  (supportedLocks.hasCapsLock && dirtyModules.has('capslock')) ||
                  (supportedLocks.hasNumLock && dirtyModules.has('numlock')) ||
                  (supportedLocks.hasScrollLock && dirtyModules.has('scrolllock'))
                ) ? 'btn-save-eeprom-pulse' : ''}`}
                id="btnSaveWinLockEEPROM"
                onClick={saveLightingToHardware}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                </svg>
                <span>{t('btnSaveLightingEEPROM')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Sub-Tab: Layer Lighting */}
      {lightingSubTab === 'layers' && (
        <div className="lighting-subview active" id="lighting-tab-layers">
          <div className="grid-2">
            <div className="palette-card">
              <h3 style={{ marginBottom: '1.25rem', fontSize: '1.05rem' }}>{t('tabLayers')}</h3>
              <div className="switch-wrap" style={{ marginBottom: '1.25rem' }}>
                <div>
                  <span style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem' }}>{t('lblLayerLightingEnable')}</span>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={layerLighting.enable}
                    onChange={(e) => setLayerLighting({ enable: e.target.checked })}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label>{t('lblLayerDimLevel')}</label>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{layerLighting.dimLevel}</span>
                </div>
                <div className="range-slider-wrap">
                  <input
                    type="range"
                    className="range-slider"
                    min={0}
                    max={255}
                    value={layerLighting.dimLevel}
                    onChange={(e) => setLayerLighting({ dimLevel: Number(e.target.value) })}
                  />
                </div>
              </div>

              {/* Live Hardware Layer Status & Simulate Fn Button */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    {t('lblLiveLayerIndicator')}
                  </span>
                  <span
                    className="badge-pill"
                    style={{
                      fontSize: '0.75rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      background: (hwActiveLayer > 0 || isSimulatingFn) ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                      border: (hwActiveLayer > 0 || isSimulatingFn) ? '1px solid rgba(0, 240, 255, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
                      color: (hwActiveLayer > 0 || isSimulatingFn) ? 'var(--accent-cyan)' : 'var(--text-muted)',
                    }}
                  >
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: (hwActiveLayer > 0 || isSimulatingFn) ? 'var(--accent-cyan)' : '#666',
                        boxShadow: (hwActiveLayer > 0 || isSimulatingFn) ? '0 0 6px var(--accent-cyan)' : 'none',
                      }}
                    ></span>
                    <strong>
                      {isSimulatingFn
                        ? 'Layer 1 (Simulated Fn)'
                        : `Layer ${hwActiveLayer} ${hwActiveLayer === 1 ? '(Win Fn)' : hwActiveLayer === 2 ? '(Mac)' : hwActiveLayer === 3 ? '(Mac Fn)' : '(Base)'}`}
                    </strong>
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className={`btn ${isSimulatingFn ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                    style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                    onClick={() => setSimulatingFn(!isSimulatingFn)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                    <span>{isSimulatingFn ? t('btnSimulatingFnActive') : t('btnSimulateFn')}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="palette-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <h3 style={{ marginBottom: '0.5rem', fontSize: '1.05rem' }}>{t('layerColorsTitle')}</h3>
              
              {/* Layer 1 */}
              <div className="color-item-card">
                <div className="color-item-info">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <strong>{t('lblLayer1Color')}</strong>
                    {layerLighting.layer1Enable === false && (
                      <span className="badge-pill" style={{ fontSize: '0.65rem', padding: '0.1rem 0.45rem', opacity: 0.7 }}>
                        {t('lblDisabled')}
                      </span>
                    )}
                  </div>
                  <span>{t('layer1ColorDesc')}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <label className="toggle-switch" title={t('lblToggleLayerHighlight')}>
                    <input
                      type="checkbox"
                      className="toggle-switch-input"
                      checked={layerLighting.layer1Enable !== false}
                      onChange={(e) => setLayerLighting({ layer1Enable: e.target.checked })}
                    />
                    <span className="toggle-switch-slider"></span>
                  </label>
                  <input
                    type="color"
                    className="color-picker-input"
                    disabled={layerLighting.layer1Enable === false}
                    style={{ opacity: layerLighting.layer1Enable === false ? 0.35 : 1, cursor: layerLighting.layer1Enable === false ? 'not-allowed' : 'pointer' }}
                    value={layerLighting.layer1Color}
                    onChange={(e) => setLayerLighting({ layer1Color: e.target.value })}
                  />
                </div>
              </div>

              {/* Layer 2 */}
              <div className="color-item-card">
                <div className="color-item-info">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <strong>{t('lblLayer2Color')}</strong>
                    {layerLighting.layer2Enable === false && (
                      <span className="badge-pill" style={{ fontSize: '0.65rem', padding: '0.1rem 0.45rem', opacity: 0.7 }}>
                        {t('lblDisabled')}
                      </span>
                    )}
                  </div>
                  <span>{t('layer2ColorDesc')}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <label className="toggle-switch" title={t('lblToggleLayerHighlight')}>
                    <input
                      type="checkbox"
                      className="toggle-switch-input"
                      checked={layerLighting.layer2Enable !== false}
                      onChange={(e) => setLayerLighting({ layer2Enable: e.target.checked })}
                    />
                    <span className="toggle-switch-slider"></span>
                  </label>
                  <input
                    type="color"
                    className="color-picker-input"
                    disabled={layerLighting.layer2Enable === false}
                    style={{ opacity: layerLighting.layer2Enable === false ? 0.35 : 1, cursor: layerLighting.layer2Enable === false ? 'not-allowed' : 'pointer' }}
                    value={layerLighting.layer2Color}
                    onChange={(e) => setLayerLighting({ layer2Color: e.target.value })}
                  />
                </div>
              </div>

              {/* Layer 3 */}
              <div className="color-item-card">
                <div className="color-item-info">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <strong>{t('lblLayer3Color')}</strong>
                    {layerLighting.layer3Enable === false && (
                      <span className="badge-pill" style={{ fontSize: '0.65rem', padding: '0.1rem 0.45rem', opacity: 0.7 }}>
                        {t('lblDisabled')}
                      </span>
                    )}
                  </div>
                  <span>{t('layer3ColorDesc')}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <label className="toggle-switch" title={t('lblToggleLayerHighlight')}>
                    <input
                      type="checkbox"
                      className="toggle-switch-input"
                      checked={layerLighting.layer3Enable !== false}
                      onChange={(e) => setLayerLighting({ layer3Enable: e.target.checked })}
                    />
                    <span className="toggle-switch-slider"></span>
                  </label>
                  <input
                    type="color"
                    className="color-picker-input"
                    disabled={layerLighting.layer3Enable === false}
                    style={{ opacity: layerLighting.layer3Enable === false ? 0.35 : 1, cursor: layerLighting.layer3Enable === false ? 'not-allowed' : 'pointer' }}
                    value={layerLighting.layer3Color}
                    onChange={(e) => setLayerLighting({ layer3Color: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button type="button" className="btn btn-secondary btn-sm" id="btnDiscardLayersEEPROM" onClick={discardAllChanges}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                <polyline points="3 3 3 8 8 8"></polyline>
              </svg>
              <span>{t('btnDiscardLightingEEPROM', 'Cofnij do zapisanych')}</span>
            </button>
            <button
              type="button"
              className={`btn btn-primary btn-sm ${dirtyModules.has('layer_lighting') ? 'btn-save-eeprom-pulse' : ''}`}
              id="btnSaveLayersEEPROM"
              onClick={saveLightingToHardware}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
              </svg>
              <span>{t('btnSaveLightingEEPROM')}</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. Sub-Tab: Logo & Locks */}
      {lightingSubTab === 'logo' && (
        <div className="lighting-subview active" id="lighting-tab-logo">
          <div className="palette-card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', marginBottom: '0.25rem' }}>{t('tabLogo')}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('logoSubtitle')}</p>
              </div>
              <div style={{ minWidth: '280px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem', display: 'block' }}>
                  {t('lblLogoMode')}
                </label>
                <select
                  className="form-control"
                  value={logoLocks.mode}
                  onChange={(e) => setLogoLocks({ mode: Number(e.target.value) })}
                >
                  <option value={0}>{t('optLogoRgb')}</option>
                  <option value={1}>{t('optLogoLockRgb')}</option>
                  <option value={2}>{t('optLogoLockOff')}</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid-2">
            {[
              { label: 'Caps Lock', val: logoLocks.colorCaps, key: 'colorCaps', desc: t('logoCapsDesc') },
              { label: 'Num Lock', val: logoLocks.colorNum, key: 'colorNum', desc: t('logoNumDesc') },
              { label: 'Scroll Lock', val: logoLocks.colorScroll, key: 'colorScroll', desc: t('logoScrollDesc') },
              { label: 'Caps + Num Lock', val: logoLocks.colorCapsNum, key: 'colorCapsNum', desc: t('logoCapsNumDesc') },
              { label: 'Caps + Scroll Lock', val: logoLocks.colorCapsScroll, key: 'colorCapsScroll', desc: t('logoCapsScrollDesc') },
              { label: 'Num + Scroll Lock', val: logoLocks.colorNumScroll, key: 'colorNumScroll', desc: t('logoNumScrollDesc') },
              { label: 'Caps + Num + Scroll Lock', val: logoLocks.colorAll, key: 'colorAll', desc: t('logoAllDesc') },
            ].map((item, idx) => (
              <div key={idx} className="color-item-card">
                <div className="color-item-info">
                  <strong>{item.label}</strong>
                  <span>{item.desc}</span>
                </div>
                <input
                  type="color"
                  className="color-picker-input"
                  value={item.val}
                  onChange={(e) => setLogoLocks({ [item.key]: e.target.value } as any)}
                />
              </div>
            ))}
          </div>

          <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button type="button" className="btn btn-secondary btn-sm" id="btnDiscardLogoEEPROM" onClick={discardAllChanges}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                <polyline points="3 3 3 8 8 8"></polyline>
              </svg>
              <span>{t('btnDiscardLightingEEPROM', 'Cofnij do zapisanych')}</span>
            </button>
            <button
              type="button"
              className={`btn btn-primary btn-sm ${dirtyModules.has('logo') ? 'btn-save-eeprom-pulse' : ''}`}
              id="btnSaveLogoEEPROM"
              onClick={saveLightingToHardware}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
              </svg>
              <span>{t('btnSaveLightingEEPROM')}</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
