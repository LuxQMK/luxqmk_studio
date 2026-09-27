import React, { useRef, useEffect, useMemo } from 'react';
import { useKeymapStore } from '../store/useKeymapStore';
import { useDeviceStore } from '../store/useDeviceStore';
import { getLayoutForPreset, getSideLedSegments, isSidelightSupported } from '../data/layouts';
import { ALL_DEVICE_DESCRIPTORS } from '../data/devices';
import { KEYCODES_DB, getKeycodeInfo, getShortKeycodeLabel, getFontSizeClass } from '../data/keycodes';
import { useI18n } from '../i18n';
import { useKeyboardFit } from '../hooks/useKeyboardFit';
import { useUIStore } from '../store/useUIStore';
import { LogoLedBadge } from '../components/common/LogoLedBadge';
import { HardwareSwitchStudio } from '../components/common/HardwareSwitchStudio';

export const KeymapView: React.FC = () => {
  const {
    activeLayer,
    setActiveLayer,
    selectedKey,
    setSelectedKey,
    presetLayoutId,
    setPresetLayoutId,
    activeCategory,
    setActiveCategory,
    assignKeycodeToSelected,
    getKeycode,
    readAllLayersFromKeyboard,
    loadViaJson,
  } = useKeymapStore();

  const { isConnected, activeDescriptor, isViaSupported } = useDeviceStore();
  const { t } = useI18n();

  const desc = activeDescriptor || ALL_DEVICE_DESCRIPTORS.find((d) => d.id === presetLayoutId) || null;
  const hasSidelights = useMemo(() => isSidelightSupported(presetLayoutId, desc), [presetLayoutId, desc]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const layoutKeys = useMemo(() => getLayoutForPreset(presetLayoutId), [presetLayoutId]);

  useEffect(() => {
    if (useDeviceStore.getState().isConnected && useDeviceStore.getState().isViaSupported) {
      readAllLayersFromKeyboard();
    }
  }, []);

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

  const { wrapperRef, canvasRef } = useKeyboardFit(canvasWidth, canvasHeight);

  const categories = [
    { id: 'basic', labelKey: 'catBasic' },
    { id: 'media', labelKey: 'catMedia' },
    { id: 'macro', labelKey: 'catMacro' },
    { id: 'layers', labelKey: 'catLayers' },
    { id: 'special', labelKey: 'catSpecial' },
    { id: 'lighting', labelKey: 'catLighting' },
    { id: 'custom', labelKey: 'catCustom' },
  ] as const;

  const activeKeycodes = KEYCODES_DB.filter((k) => k.category === activeCategory);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        loadViaJson(content);
      };
      reader.readAsText(file);
    }
  };

  return (
    <section className="view-container active" id="view-keymap">
      {/* VIA Not Supported Banner */}
      {isConnected && !isViaSupported && (
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
              {t('lblViaNotSupported')}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              {t('lblViaNotSupportedDesc')}
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Canvas Card */}
      <div className="keyboard-canvas-card">
        <div
          className="keyboard-canvas-header"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            marginBottom: '0.75rem',
            flexWrap: 'wrap',
          }}
        >
          {/* Layer Selector & Selected Key Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div className="layer-selector">
              <button
                type="button"
                className={`layer-btn ${activeLayer === 0 ? 'active' : ''}`}
                onClick={() => setActiveLayer(0)}
              >
                {t('layer0')}
              </button>
              <button
                type="button"
                className={`layer-btn ${activeLayer === 1 ? 'active' : ''}`}
                onClick={() => setActiveLayer(1)}
              >
                {t('layer1')}
              </button>
              <button
                type="button"
                className={`layer-btn ${activeLayer === 2 ? 'active' : ''}`}
                onClick={() => setActiveLayer(2)}
              >
                {t('layer2')}
              </button>
              <button
                type="button"
                className={`layer-btn ${activeLayer === 3 ? 'active' : ''}`}
                onClick={() => setActiveLayer(3)}
              >
                {t('layer3')}
              </button>
            </div>

            <div id="selectedKeyBanner" style={{ fontSize: '0.82rem' }}>
              {selectedKey ? (
                (() => {
                  const row = selectedKey.matrix[0];
                  const col = selectedKey.matrix[1];
                  const currentKc = getKeycode(activeLayer, row, col);
                  const kcData = getKeycodeInfo(currentKc);
                  return (
                    <span style={{ color: 'var(--accent-cyan)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                      <span
                        className="badge-demo-pill"
                        style={{
                          background: 'rgba(0, 240, 255, 0.15)',
                          color: 'var(--accent-cyan)',
                          border: '1px solid rgba(0, 240, 255, 0.3)',
                          padding: '0.12rem 0.45rem',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                        }}
                      >
                        {selectedKey.label || selectedKey.id}
                      </span>
                      <span>
                        {t('selectedKeyActive')}{' '}
                        <strong style={{ color: '#fff' }}>
                          {selectedKey.label || selectedKey.id} (R{row}, C{col})
                        </strong>{' '}
                        → <strong style={{ color: 'var(--accent-cyan)' }}>{kcData.label}</strong>
                        {kcData.name && (
                          <span style={{ color: 'var(--text-muted, #94a3b8)', marginLeft: '0.35rem', fontWeight: 400 }}>
                            ({kcData.name} — 0x{currentKc.toString(16).toUpperCase().padStart(4, '0')})
                          </span>
                        )}
                      </span>
                    </span>
                  );
                })()
              ) : (
                <span className="muted-text">{t('selectedKeyDefault')}</span>
              )}
            </div>
          </div>

          {/* Right Controls: Offline Demo Switcher, Device Badge, Load VIA JSON */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {!isConnected ? (
              <div id="layoutPresetWrap" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span
                  className="badge-demo-pill"
                  style={{
                    background: 'rgba(255,170,0,0.15)',
                    color: '#ffaa00',
                    border: '1px solid rgba(255,170,0,0.3)',
                    padding: '0.15rem 0.45rem',
                    borderRadius: '4px',
                    fontWeight: 600,
                    fontSize: '0.72rem',
                    letterSpacing: '0.04em',
                  }}
                >
                  DEMO
                </span>
                <select
                  id="layoutPresetSelect"
                  className="form-control"
                  style={{ width: 'auto', padding: '0.25rem 0.5rem', fontSize: '0.8rem', height: 'auto' }}
                  value={presetLayoutId}
                  onChange={(e) => setPresetLayoutId(e.target.value)}
                >
                  <option value="gmmk3-100-ansi">Glorious GMMK 3 100% ANSI</option>
                  <option value="gmmk3-75-ansi">Glorious GMMK 3 75% ANSI</option>
                  <option value="gmmk3-65-ansi">Glorious GMMK 3 65% ANSI</option>
                  <option value="gmmk2-96-ansi">Glorious GMMK 2 96% ANSI</option>
                  <option value="gmmk2-65-ansi">Glorious GMMK 2 65% ANSI</option>
                  <option value="generic-tkl">Standard TKL 80%</option>
                  <option value="generic-60">Standard 60%</option>
                  <option value="generic-via">Generic Universal VIA</option>
                </select>
              </div>
            ) : (
              <div id="connectedDeviceBadgeWrap" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <div
                  className="connected-device-badge"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    background: 'rgba(0,255,136,0.08)',
                    border: '1px solid rgba(0,255,136,0.25)',
                    padding: '0.22rem 0.6rem',
                    borderRadius: '6px',
                  }}
                >
                  <span
                    className="live-dot"
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      background: '#00ff88',
                      boxShadow: '0 0 6px #00ff88',
                      display: 'inline-block',
                    }}
                  ></span>
                  <span id="connectedDeviceBadgeName" style={{ fontWeight: 600, color: '#fff', fontSize: '0.82rem' }}>
                    {activeDescriptor?.name || 'Glorious GMMK 3'}
                  </span>
                  <span
                    id="connectedDeviceBadgeVidPid"
                    className="badge-subpill"
                    style={{
                      fontSize: '0.72rem',
                      background: 'rgba(255,255,255,0.08)',
                      color: 'var(--text-dim)',
                      padding: '0.05rem 0.35rem',
                      borderRadius: '4px',
                      fontFamily: 'var(--font-mono, monospace)',
                    }}
                  >
                    VID: 0x{activeDescriptor?.vendorId ? activeDescriptor.vendorId.toString(16).toUpperCase() : '504B'}
                  </span>
                  <span
                    id="connectedDeviceBadgeProto"
                    className="badge-subpill"
                    style={{
                      fontSize: '0.72rem',
                      background: 'rgba(0,229,255,0.12)',
                      color: '#00e5ff',
                      border: '1px solid rgba(0,229,255,0.2)',
                      padding: '0.05rem 0.35rem',
                      borderRadius: '4px',
                      fontWeight: 600,
                    }}
                  >
                    LuxQMK
                  </span>
                </div>
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              id="viaJsonFileInput"
              accept=".json"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              id="btnLoadViaJson"
              style={{ fontSize: '0.78rem', padding: '0.25rem 0.55rem' }}
              onClick={() => fileInputRef.current?.click()}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
              </svg>
              <span>{t('btnLoadViaLayout')}</span>
            </button>
          </div>
        </div>

        {/* Interactive Keyboard Canvas */}
        <div
          className="keyboard-scroll-wrapper"
          ref={wrapperRef}
          onClick={() => setSelectedKey(null)}
        >
          <div
            className={`keyboard-canvas ${hasSidelights ? 'has-sidelights' : ''}`}
            id="keyboardCanvas"
            ref={canvasRef}
            style={{ width: `${canvasWidth}px`, height: `${canvasHeight}px`, position: 'relative' }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setSelectedKey(null);
              }
            }}
          >
            {/* Left & Right Sidelight LED Diffusers */}
            {hasSidelights && (() => {
              const sideLeds = getSideLedSegments(presetLayoutId, canvasHeight, desc);
              if (!sideLeds) return null;
              return (
                <div className="side-diffusers-container" onClick={(e) => e.stopPropagation()}>
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
              const row = key.matrix[0];
              const col = key.matrix[1];
              const isSelected = selectedKey?.matrix[0] === row && selectedKey?.matrix[1] === col;
              const kc = getKeycode(activeLayer, row, col);
              const info = getKeycodeInfo(kc);

              const w = (key.w || 1) * unitSize - 4;
              const h = (key.h || 1) * unitSize - 4;
              const left = key.x * unitSize + 18;
              const top = key.y * unitSize + 18;

              if ((key as any).isLogo) {
                return (
                  <LogoLedBadge
                    key={idx}
                    left={left}
                    top={top}
                    width={w}
                    height={h}
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      useUIStore.getState().setActiveView('lighting');
                      useUIStore.getState().setLightingSubTab('logo');
                    }}
                  />
                );
              }

              if ((key as any).isKnob) {
                const knobSize = Math.min(w, h);
                return (
                  <button
                    key={idx}
                    type="button"
                    className="keycap-btn keycap-knob"
                    style={{
                      position: 'absolute',
                      left: `${left + (w - knobSize) / 2}px`,
                      top: `${top + (h - knobSize) / 2}px`,
                      width: `${knobSize}px`,
                      height: `${knobSize}px`,
                      borderRadius: '50%',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      useUIStore.getState().setActiveView('encoder');
                    }}
                    title={t('navEncoder', 'Rotary Knob')}
                  />
                );
              }

              const isTrns = activeLayer > 0 && (kc === 0x0001 || kc === 1);
              const shortLabel = isTrns ? '▽' : getShortKeycodeLabel(info);
              const defaultKc = (key as any).defaultKeycode;

              // Determine if this key on activeLayer is custom-mapped away from default
              const isCustom = activeLayer > 0 ? !isTrns : (defaultKc !== undefined && kc !== defaultKc && kc !== 0x0000);
              const isSingleLegend = !isCustom && !isTrns;
              const fontClass = getFontSizeClass(shortLabel);

              return (
                <button
                  key={`${activeLayer}-${row}-${col}-${idx}`}
                  type="button"
                  className={`keycap-btn ${isSelected ? 'selected' : ''} ${isTrns ? 'is-trns' : ''} ${isCustom ? 'is-custom-mapped' : ''} ${!isSingleLegend ? 'has-dual-legend' : ''} key-group-${key.group || 'alpha'}`}
                  style={{
                    position: 'absolute',
                    left: `${left}px`,
                    top: `${top}px`,
                    width: `${w}px`,
                    height: `${h}px`,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isSelected) {
                      setSelectedKey(null);
                    } else {
                      setSelectedKey(key);
                    }
                  }}
                  title={`${key.label || key.id}: ${info.name || ''} ${info.label ? `— ${info.label}` : ''} (0x${kc.toString(16).padStart(4, '0').toUpperCase()})`}
                >
                  {isSingleLegend ? (
                    <span className={`key-primary single-legend ${fontClass}`}>{shortLabel}</span>
                  ) : isTrns ? (
                    <>
                      <span className="key-secondary">{key.label}</span>
                      <span className="key-primary is-trns">▽</span>
                    </>
                  ) : (
                    <>
                      <span className="key-secondary mod-origin">{key.label}</span>
                      <span className={`key-primary is-custom ${fontClass}`}>{shortLabel}</span>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Keycode Palette Card (1:1 VIA Categories) */}
      <div className="palette-card">
        <div className="palette-header">
          <div className="palette-category-tabs">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`cat-tab-btn ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {t(cat.labelKey)}
              </button>
            ))}
          </div>
        </div>

        {/* Keycode Grid */}
        <div className="palette-grid" id="keycodePickerPalette">
          {activeKeycodes.map((kc, idx) => (
            <button
              key={idx}
              type="button"
              className="palette-key-btn"
              title={`${kc.name}: ${kc.desc || kc.title || ''}`}
              onClick={() => {
                if (typeof kc.code === 'number') {
                  assignKeycodeToSelected(kc.code);
                }
              }}
            >
              <span className="pal-label">{kc.label}</span>
              {(kc.name || kc.sublabel) && (
                <span className="pal-name">{kc.name || kc.sublabel}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Hardware Switches (DIP / Rear slider) - Only rendered for keyboards with physical switches */}
      {(desc?.capabilities?.hasDipSwitches || (desc?.capabilities?.dipSwitchCount && desc.capabilities.dipSwitchCount > 0)) && (
        <HardwareSwitchStudio switchIndex={0} />
      )}
    </section>
  );
};
