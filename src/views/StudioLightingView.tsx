import React, { useState, useEffect, useRef } from 'react';
import { useVisualizerStore } from '../store/useVisualizerStore';
import { useKeymapStore } from '../store/useKeymapStore';
import { useDeviceStore } from '../store/useDeviceStore';
import { useLightingStore } from '../store/useLightingStore';
import { useUIStore } from '../store/useUIStore';
import { getLayoutForPreset, getSideLedSegments, isSidelightSupported } from '../data/layouts';
import { ALL_DEVICE_DESCRIPTORS } from '../data/devices';
import { useI18n } from '../i18n';
import { useKeyboardFit } from '../hooks/useKeyboardFit';
import { LogoLedBadge } from '../components/common/LogoLedBadge';
import { CustomGradientStudio } from '../components/common/CustomGradientStudio';
import { KeyboardAppearanceButton } from '../components/common/KeyboardAppearanceButton';
import { useKeyboardThemeStore } from '../store/useKeyboardThemeStore';
import { visualizerService } from '../core/visualizer-service';
import { gifPlayerService } from '../core/visualizer/gif/gif-player-service';

const EFFECT_DIRECTION_OPTIONS: Record<string, Array<{ value: string; labelKey: string }>> = {
  spatial6: [
    { value: 'left_to_right', labelKey: 'optDirLeftToRight' },
    { value: 'right_to_left', labelKey: 'optDirRightToLeft' },
    { value: 'bottom_to_top', labelKey: 'optDirBottomToTop' },
    { value: 'top_to_bottom', labelKey: 'optDirTopToBottom' },
    { value: 'center_out', labelKey: 'optDirCenterOut' },
    { value: 'perimeter_in', labelKey: 'optDirPerimeterIn' },
  ],
  horizontal: [
    { value: 'left_to_right', labelKey: 'optDirLeftToRight' },
    { value: 'right_to_left', labelKey: 'optDirRightToLeft' },
  ],
  vertical: [
    { value: 'top_to_bottom', labelKey: 'optDirTopToBottom' },
    { value: 'bottom_to_top', labelKey: 'optDirBottomToTop' },
  ],
  radial: [
    { value: 'perimeter_in', labelKey: 'optDirPerimeterIn' },
    { value: 'center_out', labelKey: 'optDirCenterOut' },
  ],
  rotational: [
    { value: 'cw', labelKey: 'optDirClockwise' },
    { value: 'ccw', labelKey: 'optDirCounterClockwise' },
  ],
  none: [
    { value: 'none', labelKey: 'optDirNotApplicable' },
  ],
};

const EFFECT_TO_DIR_CATEGORY: Record<string, string> = {
  // Signature PC Effects
  neonWave: 'spatial6',
  matrixRain: 'spatial6',
  particleStorm: 'spatial6',
  aurora: 'spatial6',
  pulseBloom: 'spatial6',
  fireEmber: 'spatial6',
  hyperspaceWarp: 'spatial6',

  // QMK Cycling & Radial
  qmk_cycle_all: 'none',
  qmk_cycle_left_right: 'horizontal',
  qmk_cycle_up_down: 'vertical',
  qmk_rainbow_chevron: 'horizontal',
  qmk_cycle_out_in: 'radial',
  qmk_cycle_out_in_dual: 'radial',
  qmk_cycle_pinwheel: 'rotational',
  qmk_cycle_spiral: 'rotational',
  qmk_dual_beacon: 'rotational',
  qmk_rainbow_beacon: 'rotational',
  qmk_rainbow_pinwheels: 'rotational',

  // QMK Waves & Atmosphere
  qmk_hue_wave: 'horizontal',
  qmk_hue_pendulum: 'horizontal',
  qmk_breathing: 'none',
  qmk_hue_breathing: 'none',
  qmk_flower_blooming: 'radial',
  qmk_riverflow: 'horizontal',

  // QMK Drops & Particles
  qmk_raindrops: 'none',
  qmk_jellybean_raindrops: 'none',
  qmk_pixel_rain: 'vertical',
  qmk_pixel_flow: 'horizontal',
  qmk_pixel_fractal: 'none',
  qmk_starlight: 'none',
  qmk_starlight_smooth: 'none',
  qmk_starlight_dual_hue: 'none',

  // QMK Bands & Gradients
  qmk_gradient_up_down: 'vertical',
  qmk_gradient_left_right: 'horizontal',
  qmk_colorband_sat: 'horizontal',
  qmk_colorband_val: 'horizontal',
  qmk_colorband_pinwheel_sat: 'rotational',
  qmk_colorband_pinwheel_val: 'rotational',
  qmk_colorband_spiral_sat: 'rotational',
  qmk_colorband_spiral_val: 'rotational',
  qmk_solid_color: 'none',
  qmk_alphas_mods: 'none',
};

export const StudioLightingView: React.FC = () => {
  const isDesktop = typeof window !== 'undefined' && !!window.electronAPI && !!window.electronAPI.isDesktop;

  const { config, setConfig, toggleStudioLighting, customGradients } = useVisualizerStore();
  const { presetLayoutId } = useKeymapStore();
  const { studioSubTab, setStudioSubTab } = useUIStore();
  const { t } = useI18n();
  const canvasThemeStyles = useKeyboardThemeStore((s) => s.canvasThemeStyles);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDecoding, setIsDecoding] = useState(false);
  const [gifMetadata, setGifMetadata] = useState(gifPlayerService.gifMetadata);

  const [audioSources, setAudioSources] = useState<Array<{ id: string; label: string }>>([
    { id: 'system_loopback', label: 'System Audio Output (WASAPI / Loopback)' }
  ]);

  const refreshAudioSources = () => {
    visualizerService.enumerateAudioSources().then((sources) => {
      setAudioSources(sources);
      if (useVisualizerStore.getState().config.isRunning && useUIStore.getState().studioSubTab === 'audio') {
        visualizerService.restartAudioStream();
      }
    });
  };

  const handleGifFileSelected = async (file: File) => {
    if (!file) return;
    if (!file.type.includes('gif') && !file.name.toLowerCase().endsWith('.gif')) {
      useUIStore.getState().showToast(t('toastGifInvalidFormat'), 'warning');
      return;
    }

    setIsDecoding(true);
    try {
      const res = await gifPlayerService.loadGif(file, file.name, file.size);
      if (res.success) {
        setGifMetadata(gifPlayerService.gifMetadata);
        setConfig({
          gifFileName: file.name,
          gifFileSize: file.size,
          gifFrameCount: res.frameCount,
          gifDimensions: { width: res.width, height: res.height },
          gifDataUrl: gifPlayerService.dataUrl || undefined
        });
        useUIStore.getState().showToast(t('toastGifLoadedSuccess'), 'success');
      } else {
        useUIStore.getState().showToast(`${t('toastGifLoadFailed')}: ${res.error}`, 'error');
      }
    } catch (err: any) {
      useUIStore.getState().showToast(`${t('toastGifLoadFailed')}: ${err.message || err}`, 'error');
    } finally {
      setIsDecoding(false);
    }
  };

  const handleClearGif = () => {
    gifPlayerService.clear();
    setGifMetadata(null);
    setConfig({
      gifFileName: undefined,
      gifFileSize: undefined,
      gifFrameCount: undefined,
      gifDimensions: undefined,
      gifDataUrl: undefined
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    if (!isDesktop) return;
    refreshAudioSources();
    if (useDeviceStore.getState().isConnected) {
      useLightingStore.getState().loadFromHardware();
    }

    // Restore cached GIF if present in user config
    if (config.gifDataUrl && !gifPlayerService.isGifLoaded) {
      fetch(config.gifDataUrl)
        .then((res) => res.arrayBuffer())
        .then((buf) => {
          gifPlayerService.loadGif(buf, config.gifFileName || 'saved.gif', config.gifFileSize || buf.byteLength).then((res) => {
            if (res.success) {
              setGifMetadata(gifPlayerService.gifMetadata);
            }
          });
        })
        .catch((e) => console.warn('Could not restore saved GIF:', e));
    }
  }, [isDesktop]);

  if (!isDesktop) {
    return (
      <div className="view-container" style={{ padding: '3rem 2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="card text-center" style={{ maxWidth: '560px', padding: '2.5rem', border: '1px solid rgba(0, 245, 255, 0.25)', borderRadius: '16px', background: 'var(--card-bg, #10111a)' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.75rem', color: '#fff' }}>
            Studio Lighting (Desktop App Only)
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
            Real-time 60 FPS software RGB matrix streaming and WASAPI audio visualizers are available exclusively in the standalone desktop app to ensure ultra-low latency and avoid browser tab throttling.
          </p>
          <a
            href="https://luxqmk.click"
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0.75rem 1.5rem', fontWeight: 700, borderRadius: '9999px', textDecoration: 'none' }}
          >
            Download Desktop Installer &rarr;
          </a>
        </div>
      </div>
    );
  }

  const layoutKeys = getLayoutForPreset(presetLayoutId);

  const activeDescriptor = useDeviceStore((s) => s.activeDescriptor);
  const desc = activeDescriptor || ALL_DEVICE_DESCRIPTORS.find((d) => d.id === presetLayoutId) || null;
  const hasSidelights = isSidelightSupported(presetLayoutId, desc);

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

  const isConnected = useDeviceStore((s) => s.isConnected);
  const hasLighting = desc ? (desc.capabilities?.hasLighting !== false) : true;

  // Direction options for current PC effect preset
  const currentDirCat = EFFECT_TO_DIR_CATEGORY[config.softwareEffect] || 'spatial6';
  const availableDirections = EFFECT_DIRECTION_OPTIONS[currentDirCat] || EFFECT_DIRECTION_OPTIONS.spatial6;

  return (
    <section className="view-container active" id="view-studio_lighting">
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

      {/* Live Virtual RGB Preview Card */}
      <div className="keyboard-canvas-card" style={{ marginBottom: '1.5rem' }}>
        <div className="keyboard-canvas-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="live-dot-pulse"></span>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>{t('studioLightingLivePreviewTitle')}</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <KeyboardAppearanceButton />
            <div className="lighting-preview-status">
              <span className={`badge-pill ${config.isRunning ? 'badge-connected' : ''}`} id="studioLightingStatusBadge">
                {config.isRunning ? t('lblSoftwareActiveBadge', 'Running (60 FPS)') : t('lblSoftwareStoppedBadge', 'Stopped')}
              </span>
            </div>
          </div>
        </div>

        <div className="keyboard-scroll-wrapper" ref={wrapperRef}>
          <div
            className={`keyboard-canvas lighting-keyboard-canvas ${hasSidelights ? 'has-sidelights' : ''}`}
            id="studioLightingKeyboardCanvas"
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
              const keyId = key.id || ((key as any).isLogo ? 'LOGO_LED' : (key.label || `k-${key.matrix?.[0]}-${key.matrix?.[1]}`));

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

              return (
                <div
                  key={idx}
                  data-key-id={keyId}
                  className="lighting-keycap"
                  style={{
                    position: 'absolute',
                    left: `${left}px`,
                    top: `${top}px`,
                    width: `${w}px`,
                    height: `${h}px`,
                    backgroundColor: 'rgba(11, 15, 25, 0.85)',
                    boxShadow: config.isRunning ? '0 0 10px rgba(0, 240, 255, 0.5)' : undefined,
                    borderColor: config.isRunning ? 'rgba(0, 240, 255, 0.6)' : undefined,
                  }}
                >
                  <span className="l-legend">{key.label || key.id}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Suite Controls Card */}
      <div className="palette-card" style={{ maxWidth: '820px', margin: '0 auto 1.5rem auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.25rem' }}>{t('viewStudioLightingTitle')}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {t('viewStudioLightingSubtitle')}
            </p>
          </div>
        </div>

        {/* Sub-Tabs Navigation */}
        <div className="studio-lighting-tabs-header">
          <button
            type="button"
            className={`studio-lighting-tab-btn ${studioSubTab === 'audio' ? 'active' : ''}`}
            onClick={() => setStudioSubTab('audio')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18V5l12-2v13"></path>
              <circle cx="6" cy="18" r="3"></circle>
              <circle cx="18" cy="16" r="3"></circle>
            </svg>
            <span>{t('tabAudioVisualizer')}</span>
          </button>
          <button
            type="button"
            className={`studio-lighting-tab-btn ${studioSubTab === 'effects' ? 'active' : ''}`}
            onClick={() => setStudioSubTab('effects')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
            <span>{t('tabSoftwareEffects')}</span>
          </button>
          <button
            type="button"
            className={`studio-lighting-tab-btn ${studioSubTab === 'gif' ? 'active' : ''}`}
            onClick={() => setStudioSubTab('gif')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
              <line x1="7" y1="2" x2="7" y2="22"></line>
              <line x1="17" y1="2" x2="17" y2="22"></line>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <line x1="2" y1="7" x2="7" y2="7"></line>
              <line x1="2" y1="17" x2="7" y2="17"></line>
              <line x1="17" y1="17" x2="22" y2="17"></line>
              <line x1="17" y1="7" x2="22" y2="7"></line>
            </svg>
            <span>{t('tabGifPlayer')}</span>
          </button>
        </div>

        {/* Master Action Toggle */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`btn ${config.isRunning ? 'btn-danger' : 'btn-primary'}`}
            id="btnStudioLightingToggle"
            style={{ padding: '0.75rem 1.5rem', fontWeight: 600 }}
            onClick={toggleStudioLighting}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            <span>{config.isRunning ? t('btnStopSoftwareFx', 'Stop Studio Lighting') : t('btnStartSoftwareFx', 'Start Studio Lighting')}</span>
          </button>
        </div>

        {/* PANE 1: Audio Visualizer */}
        {studioSubTab === 'audio' && (
          <div id="pane-studio-audio" className="studio-lighting-subview active">
            {/* Audio Source with Refresh Button */}
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label style={{ margin: 0 }}>{t('lblAudioSource')}</label>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  onClick={refreshAudioSources}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <polyline points="1 20 1 14 7 14"></polyline>
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                  </svg>
                  <span>{t('btnRefreshAudioSources', 'Refresh')}</span>
                </button>
              </div>
              <select
                className="form-control"
                value={config.audioSource}
                onChange={(e) => {
                  const newSource = e.target.value;
                  setConfig({ audioSource: newSource });
                  if (config.isRunning && studioSubTab === 'audio') {
                    visualizerService.restartAudioStream();
                  }
                }}
              >
                {audioSources.map((src) => (
                  <option key={src.id} value={src.id}>
                    {src.id === 'system_loopback' ? t('optSystemLoopback', src.label) : src.label}
                  </option>
                ))}
              </select>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.3rem' }}>
                {t('descAudioSource')}
              </span>
            </div>

            {/* Mode, Style, Palette, Direction Grid */}
            <div className="grid-2" style={{ gap: '1.25rem', marginBottom: '1.25rem' }}>
              <div className="form-group">
                <label>{t('audioMode')}</label>
                <select
                  className="form-control"
                  value={config.audioMode}
                  onChange={(e) => setConfig({ audioMode: e.target.value })}
                >
                  <option value="equalizer">{t('optEqualizer')}</option>
                  <option value="bassShockwave">{t('optBassShockwave')}</option>
                </select>
              </div>

              <div className="form-group">
                <label>{t('audioColorMode')}</label>
                <select
                  className="form-control"
                  value={config.audioColorMode}
                  onChange={(e) => setConfig({ audioColorMode: e.target.value })}
                >
                  <optgroup label={t('optGroupCuratedPalettes', '🎨 Curated Palettes')}>
                    <option value="rainbow">{t('optPaletteRainbow')}</option>
                    <option value="cyberpunk">{t('optPaletteCyberpunk')}</option>
                    <option value="vaporwave">{t('optPaletteVaporwave')}</option>
                    <option value="synthwave">{t('optPaletteSynthwave')}</option>
                    <option value="fire_ember">{t('optPaletteFireEmber')}</option>
                    <option value="ocean_abyss">{t('optPaletteOceanAbyss')}</option>
                    <option value="matrix_code">{t('optPaletteMatrixCode')}</option>
                    <option value="ice_glacier">{t('optPaletteIceGlacier')}</option>
                    <option value="toxic_radiation">{t('optPaletteToxic')}</option>
                    <option value="singleColor">{t('optPaletteSingle')}</option>
                  </optgroup>
                  {customGradients && customGradients.length > 0 && (
                    <optgroup label={t('optGroupCustomGradients', '✨ Custom Gradients (Multi-Stop)')}>
                      {customGradients.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

              {config.audioMode === 'equalizer' && (
                <div className="form-group">
                  <label>{t('lblAudioColorStyle')}</label>
                  <select
                    className="form-control"
                    value={config.audioColorStyle || 'spectrum'}
                    onChange={(e) => setConfig({ audioColorStyle: e.target.value as any })}
                  >
                    <option value="spectrum">{t('optAudioStyleSpectrum')}</option>
                    <option value="backgroundWave">{t('optAudioStyleWave')}</option>
                  </select>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.3rem' }}>
                    {(config.audioColorStyle === 'backgroundWave') ? t('hintAudioStyleWave') : t('hintAudioStyleSpectrum')}
                  </span>
                </div>
              )}

              <div className="form-group">
                <label>{t('lblAudioDirection')}</label>
                <select
                  className="form-control"
                  value={config.audioDirection}
                  onChange={(e) => setConfig({ audioDirection: e.target.value })}
                >
                  <option value="bottom_to_top">{t('optDirBottomToTop')}</option>
                  <option value="top_to_bottom">{t('optDirTopToBottom')}</option>
                  <option value="left_to_right">{t('optDirLeftToRight')}</option>
                  <option value="right_to_left">{t('optDirRightToLeft')}</option>
                  <option value="center_out">{t('optDirCenterOut')}</option>
                  <option value="perimeter_in">{t('optDirPerimeterIn')}</option>
                </select>
              </div>
            </div>

            {/* Custom Multi-Stop Gradient Studio (when custom gradient is chosen) */}
            {(config.audioColorMode.startsWith('custom_grad_') || config.audioColorMode === 'custom_gradient') && (
              <CustomGradientStudio
                currentPaletteId={config.audioColorMode}
                onSelectPalette={(id) => setConfig({ audioColorMode: id })}
              />
            )}

            {/* Custom Single Color Picker (when singleColor is chosen) */}
            {config.audioColorMode === 'singleColor' && (
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label>{t('lblAudioSingleColor', 'Audio Accent Color')}</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <input
                    type="color"
                    className="color-picker-input"
                    value={config.audioSingleColor || '#00ffff'}
                    onChange={(e) => setConfig({ audioSingleColor: e.target.value })}
                  />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{config.audioSingleColor || '#00ffff'}</span>
                </div>
              </div>
            )}

            {/* Sliders Grid */}
            <div className="grid-2" style={{ gap: '1.25rem' }}>
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label>{t('audioSensitivity')}</label>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{config.audioSensitivity}x</span>
                </div>
                <div className="range-slider-wrap">
                  <input
                    type="range"
                    className="range-slider"
                    min={0.5}
                    max={3.0}
                    step={0.1}
                    value={config.audioSensitivity}
                    onChange={(e) => setConfig({ audioSensitivity: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label>{t('lblAudioSpeed')}</label>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{config.audioSpeed}x</span>
                </div>
                <div className="range-slider-wrap">
                  <input
                    type="range"
                    className="range-slider"
                    min={0.2}
                    max={3.0}
                    step={0.1}
                    value={config.audioSpeed}
                    onChange={(e) => setConfig({ audioSpeed: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label>{t('lblAudioIntensity')}</label>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{Math.round(config.audioIntensity * 100)}%</span>
                </div>
                <div className="range-slider-wrap">
                  <input
                    type="range"
                    className="range-slider"
                    min={0.1}
                    max={1.5}
                    step={0.05}
                    value={config.audioIntensity}
                    onChange={(e) => setConfig({ audioIntensity: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label>{t('lblAudioSmoothing')}</label>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{config.audioSmoothing}</span>
                </div>
                <div className="range-slider-wrap">
                  <input
                    type="range"
                    className="range-slider"
                    min={0.50}
                    max={0.95}
                    step={0.02}
                    value={config.audioSmoothing}
                    onChange={(e) => setConfig({ audioSmoothing: Number(e.target.value) })}
                  />
                </div>
              </div>

              {/* Ambient Floor Glow Slider */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label>{t('lblAudioFloor', 'Ambient Floor Glow (Idle Background Brightness)')}</label>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{Math.round((config.audioFloor ?? 0.15) * 100)}%</span>
                </div>
                <div className="range-slider-wrap">
                  <input
                    type="range"
                    className="range-slider"
                    min={0.0}
                    max={1.0}
                    step={0.05}
                    value={config.audioFloor !== undefined ? config.audioFloor : 0.15}
                    onChange={(e) => setConfig({ audioFloor: Number(e.target.value) })}
                  />
                </div>
              </div>

              {/* Idle Background Animation Direction (when floor > 0) */}
              {(config.audioFloor ?? 0.15) > 0.001 && (
                <div className="form-group">
                  <label>{t('lblAudioBgDirection', 'Idle Background Animation Direction')}</label>
                  <select
                    className="form-control"
                    value={config.audioBackgroundDirection || 'static'}
                    onChange={(e) => setConfig({ audioBackgroundDirection: e.target.value })}
                  >
                    <option value="static">{t('optBgStatic', 'Static Dim (No Movement)')}</option>
                    <option value="follow">{t('optBgFollow', 'Follow Main Effect Direction')}</option>
                    <option value="left_to_right">{t('optDirLeftToRight')}</option>
                    <option value="right_to_left">{t('optDirRightToLeft')}</option>
                    <option value="bottom_to_top">{t('optDirBottomToTop')}</option>
                    <option value="top_to_bottom">{t('optDirTopToBottom')}</option>
                    <option value="center_out">{t('optDirCenterOut')}</option>
                    <option value="perimeter_in">{t('optDirPerimeterIn')}</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PANE 2: PC Animations */}
        {studioSubTab === 'effects' && (
          <div id="pane-studio-effects" className="studio-lighting-subview active">
            <div className="grid-3" style={{ gap: '1.25rem', marginBottom: '1.25rem' }}>
              <div className="form-group">
                <label>{t('lblSoftwareEffectPreset')}</label>
                <select
                  className="form-control"
                  value={config.softwareEffect}
                  onChange={(e) => setConfig({ softwareEffect: e.target.value })}
                >
                  <optgroup label={t('optGroupSignature', '🌟 Signature PC Effects')}>
                    <option value="neonWave">{t('optEffectNeonWave')}</option>
                    <option value="matrixRain">{t('optEffectMatrixRain')}</option>
                    <option value="particleStorm">{t('optEffectParticleStorm')}</option>
                    <option value="aurora">{t('optEffectAurora')}</option>
                    <option value="pulseBloom">{t('optEffectPulseBloom')}</option>
                    <option value="fireEmber">{t('optEffectFireEmber')}</option>
                    <option value="hyperspaceWarp">{t('optEffectHyperspaceWarp')}</option>
                  </optgroup>
                  <optgroup label={t('optGroupQmkCycling', '🌈 QMK Cycling & Radial')}>
                    <option value="qmk_cycle_all">{t('optEffectQmkCycleAll')}</option>
                    <option value="qmk_cycle_left_right">{t('optEffectQmkCycleLeftRight')}</option>
                    <option value="qmk_cycle_up_down">{t('optEffectQmkCycleUpDown')}</option>
                    <option value="qmk_rainbow_chevron">{t('optEffectQmkRainbowChevron')}</option>
                    <option value="qmk_cycle_out_in">{t('optEffectQmkCycleOutIn')}</option>
                    <option value="qmk_cycle_out_in_dual">{t('optEffectQmkCycleOutInDual')}</option>
                    <option value="qmk_cycle_pinwheel">{t('optEffectQmkCyclePinwheel')}</option>
                    <option value="qmk_cycle_spiral">{t('optEffectQmkCycleSpiral')}</option>
                    <option value="qmk_dual_beacon">{t('optEffectQmkDualBeacon')}</option>
                    <option value="qmk_rainbow_beacon">{t('optEffectQmkRainbowBeacon')}</option>
                    <option value="qmk_rainbow_pinwheels">{t('optEffectQmkRainbowPinwheels')}</option>
                  </optgroup>
                  <optgroup label={t('optGroupQmkWaves', '🌊 QMK Waves & Atmosphere')}>
                    <option value="qmk_hue_wave">{t('optEffectQmkHueWave')}</option>
                    <option value="qmk_hue_pendulum">{t('optEffectQmkHuePendulum')}</option>
                    <option value="qmk_breathing">{t('optEffectQmkBreathing')}</option>
                    <option value="qmk_hue_breathing">{t('optEffectQmkHueBreathing')}</option>
                    <option value="qmk_flower_blooming">{t('optEffectQmkFlowerBlooming')}</option>
                    <option value="qmk_riverflow">{t('optEffectQmkRiverflow')}</option>
                  </optgroup>
                  <optgroup label={t('optGroupQmkParticles', '✨ QMK Drops & Particles')}>
                    <option value="qmk_raindrops">{t('optEffectQmkRaindrops')}</option>
                    <option value="qmk_jellybean_raindrops">{t('optEffectQmkJellybeanRaindrops')}</option>
                    <option value="qmk_pixel_rain">{t('optEffectQmkPixelRain')}</option>
                    <option value="qmk_pixel_flow">{t('optEffectQmkPixelFlow')}</option>
                    <option value="qmk_pixel_fractal">{t('optEffectQmkPixelFractal')}</option>
                    <option value="qmk_starlight">{t('optEffectQmkStarlight')}</option>
                    <option value="qmk_starlight_smooth">{t('optEffectQmkStarlightSmooth')}</option>
                    <option value="qmk_starlight_dual_hue">{t('optEffectQmkStarlightDualHue')}</option>
                  </optgroup>
                  <optgroup label={t('optGroupQmkGradients', '🎨 QMK Bands & Gradients')}>
                    <option value="qmk_gradient_up_down">{t('optEffectQmkGradientUpDown')}</option>
                    <option value="qmk_gradient_left_right">{t('optEffectQmkGradientLeftRight')}</option>
                    <option value="qmk_colorband_sat">{t('optEffectQmkColorbandSat')}</option>
                    <option value="qmk_colorband_val">{t('optEffectQmkColorbandVal')}</option>
                    <option value="qmk_colorband_pinwheel_sat">{t('optEffectQmkColorbandPinwheelSat')}</option>
                    <option value="qmk_colorband_pinwheel_val">{t('optEffectQmkColorbandPinwheelVal')}</option>
                    <option value="qmk_colorband_spiral_sat">{t('optEffectQmkColorbandSpiralSat')}</option>
                    <option value="qmk_colorband_spiral_val">{t('optEffectQmkColorbandSpiralVal')}</option>
                    <option value="qmk_solid_color">{t('optEffectQmkSolidColor')}</option>
                    <option value="qmk_alphas_mods">{t('optEffectQmkAlphasMods')}</option>
                  </optgroup>
                </select>
              </div>

              <div className="form-group">
                <label>{t('lblSoftwarePalette')}</label>
                <select
                  className="form-control"
                  value={config.softwarePalette}
                  onChange={(e) => setConfig({ softwarePalette: e.target.value })}
                >
                  <optgroup label={t('optGroupCuratedPalettes', '🎨 Curated Palettes')}>
                    <option value="rainbow">{t('optPaletteRainbow')}</option>
                    <option value="cyberpunk">{t('optPaletteCyberpunk')}</option>
                    <option value="vaporwave">{t('optPaletteVaporwave')}</option>
                    <option value="synthwave">{t('optPaletteSynthwave')}</option>
                    <option value="fire_ember">{t('optPaletteFireEmber')}</option>
                    <option value="ocean_abyss">{t('optPaletteOceanAbyss')}</option>
                    <option value="matrix_code">{t('optPaletteMatrixCode')}</option>
                    <option value="ice_glacier">{t('optPaletteIceGlacier')}</option>
                    <option value="toxic_radiation">{t('optPaletteToxic')}</option>
                    <option value="singleColor">{t('optPaletteSingle')}</option>
                  </optgroup>
                  {customGradients && customGradients.length > 0 && (
                    <optgroup label={t('optGroupCustomGradients', '✨ Custom Gradients (Multi-Stop)')}>
                      {customGradients.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

              <div className="form-group">
                <label>{t('lblSoftwareDirection')}</label>
                <select
                  className="form-control"
                  value={config.softwareDirection}
                  onChange={(e) => setConfig({ softwareDirection: e.target.value })}
                >
                  {availableDirections.map((dir) => (
                    <option key={dir.value} value={dir.value}>
                      {t(dir.labelKey)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Custom Multi-Stop Gradient Studio (when custom gradient is chosen) */}
            {(config.softwarePalette.startsWith('custom_grad_') || config.softwarePalette === 'custom_gradient') && (
              <CustomGradientStudio
                currentPaletteId={config.softwarePalette}
                onSelectPalette={(id) => setConfig({ softwarePalette: id })}
              />
            )}

            {/* Custom Single Color Picker (when singleColor is chosen) */}
            {config.softwarePalette === 'singleColor' && (
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label>{t('lblSoftwareSingleColor', 'Custom Accent Color')}</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <input
                    type="color"
                    className="color-picker-input"
                    value={config.softwareSingleColor || '#00ffff'}
                    onChange={(e) => setConfig({ softwareSingleColor: e.target.value })}
                  />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{config.softwareSingleColor || '#00ffff'}</span>
                </div>
              </div>
            )}

            <div className="grid-3" style={{ gap: '1.25rem' }}>
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label>{t('lblSoftwareEffectSpeed')}</label>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{config.softwareSpeed}x</span>
                </div>
                <div className="range-slider-wrap">
                  <input
                    type="range"
                    className="range-slider"
                    min={0.2}
                    max={3.0}
                    step={0.1}
                    value={config.softwareSpeed}
                    onChange={(e) => setConfig({ softwareSpeed: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label>{t('lblSoftwareEffectIntensity')}</label>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{Math.round(config.softwareIntensity * 100)}%</span>
                </div>
                <div className="range-slider-wrap">
                  <input
                    type="range"
                    className="range-slider"
                    min={0.1}
                    max={1.5}
                    step={0.05}
                    value={config.softwareIntensity}
                    onChange={(e) => setConfig({ softwareIntensity: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label>{t('lblSoftwareFloor', 'Ambient Floor Glow')}</label>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{Math.round((config.softwareFloor ?? 0.10) * 100)}%</span>
                </div>
                <div className="range-slider-wrap">
                  <input
                    type="range"
                    className="range-slider"
                    min={0.0}
                    max={1.0}
                    step={0.05}
                    value={config.softwareFloor !== undefined ? config.softwareFloor : 0.10}
                    onChange={(e) => setConfig({ softwareFloor: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PANE 3: GIF Matrix Player */}
        {studioSubTab === 'gif' && (
          <div id="pane-studio-gif" className="studio-lighting-subview active">
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/gif"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleGifFileSelected(file);
              }}
            />

            {/* Dropzone & Loaded Animation Card */}
            {!gifPlayerService.isGifLoaded && !config.gifDataUrl ? (
              <div
                className={`gif-dropzone ${isDragging ? 'dragging' : ''}`}
                style={{
                  border: isDragging ? '2px dashed var(--accent-cyan)' : '2px dashed var(--border-color)',
                  background: isDragging ? 'rgba(0, 240, 255, 0.08)' : 'var(--bg-glass)',
                  borderRadius: '16px',
                  padding: '2.5rem 1.5rem',
                  textAlign: 'center',
                  marginBottom: '1.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease'
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleGifFileSelected(file);
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '50%',
                      background: 'rgba(0, 240, 255, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent-cyan)',
                      boxShadow: '0 0 20px rgba(0, 240, 255, 0.2)'
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
                      <line x1="7" y1="2" x2="7" y2="22"></line>
                      <line x1="17" y1="2" x2="17" y2="22"></line>
                      <line x1="2" y1="12" x2="22" y2="12"></line>
                    </svg>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: 'var(--text-main)' }}>
                      {isDecoding ? t('btnLoading', 'Decoding GIF Frames...') : t('gifUploadTitle')}
                    </h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                      {t('gifUploadDesc')}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    <span>{t('gifUploadBtn')}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="card"
                style={{
                  background: 'var(--bg-glass)',
                  border: '1px solid rgba(0, 240, 255, 0.25)',
                  borderRadius: '16px',
                  padding: '1.25rem 1.5rem',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1.5rem',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  {/* Thumbnail */}
                  <div
                    style={{
                      width: '76px',
                      height: '76px',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      background: '#090d16',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)'
                    }}
                  >
                    <img
                      src={gifPlayerService.dataUrl || config.gifDataUrl}
                      alt="GIF Preview"
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    />
                  </div>

                  {/* Metadata */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                      <span className="badge-pill badge-connected" style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem' }}>
                        {t('gifLoadedBadge')}
                      </span>
                      <h4 style={{ fontSize: '0.98rem', fontWeight: 700, margin: 0, color: 'var(--text-main)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {config.gifFileName || gifMetadata?.fileName || 'animation.gif'}
                      </h4>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {(gifMetadata?.width || config.gifDimensions?.width) && (
                        <span>
                          {t('gifFileInfoDimensions')}: <strong style={{ color: 'var(--text-main)' }}>{(gifMetadata?.width || config.gifDimensions?.width)}×{(gifMetadata?.height || config.gifDimensions?.height)}</strong>
                        </span>
                      )}
                      {(gifMetadata?.frameCount || config.gifFrameCount) && (
                        <span>
                          {t('gifFileInfoFrames')}: <strong style={{ color: 'var(--text-main)' }}>{gifMetadata?.frameCount || config.gifFrameCount}</strong>
                        </span>
                      )}
                      {gifMetadata?.totalDurationMs && (
                        <span>
                          {t('gifFileInfoDuration')}: <strong style={{ color: 'var(--text-main)' }}>{(gifMetadata.totalDurationMs / 1000).toFixed(1)}s</strong>
                        </span>
                      )}
                      {(config.gifFileSize || gifMetadata?.fileSizeBytes) && (
                        <span>
                          {t('gifFileInfoSize')}: <strong style={{ color: 'var(--text-main)' }}>{((config.gifFileSize || gifMetadata?.fileSizeBytes || 0) / 1024).toFixed(0)} KB</strong>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    <span>{t('gifReplaceBtn')}</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    onClick={handleClearGif}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    <span>{t('gifRemoveBtn')}</span>
                  </button>
                </div>
              </div>
            )}

            {/* GIF Settings & Aspect Fit Controls */}
            <div className="grid-2" style={{ gap: '1.25rem', marginBottom: '1.25rem' }}>
              {/* Aspect Ratio Fit Mode */}
              <div className="form-group">
                <label>{t('gifFitModeLabel')}</label>
                <select
                  className="form-control"
                  value={config.gifFitMode || 'fit'}
                  onChange={(e) => setConfig({ gifFitMode: e.target.value as any })}
                >
                  <option value="fit">{t('gifFitModeFit')} — {t('gifFitModeFitDesc')}</option>
                  <option value="fill">{t('gifFitModeFill')} — {t('gifFitModeFillDesc')}</option>
                  <option value="stretch">{t('gifFitModeStretch')} — {t('gifFitModeStretchDesc')}</option>
                </select>
              </div>

              {/* Sidelights (Underglow) Sampling Mode */}
              <div className="form-group">
                <label>{t('gifSidelightModeLabel')}</label>
                <select
                  className="form-control"
                  value={config.gifSidelightMode || 'edge'}
                  onChange={(e) => setConfig({ gifSidelightMode: e.target.value as any })}
                >
                  <option value="edge">{t('gifSidelightEdge')}</option>
                  <option value="dominant">{t('gifSidelightDominant')}</option>
                  <option value="off">{t('gifSidelightOff')}</option>
                </select>
              </div>
            </div>

            {/* Sliders Grid: Speed, Brightness, Contrast */}
            <div className="grid-3" style={{ gap: '1.25rem', marginBottom: '1.25rem' }}>
              {/* Playback Speed */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label>{t('gifSpeedLabel')}</label>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                    {(config.gifSpeed !== undefined ? config.gifSpeed : 1.0).toFixed(2)}x
                  </span>
                </div>
                <div className="range-slider-wrap">
                  <input
                    type="range"
                    className="range-slider"
                    min={0.25}
                    max={3.0}
                    step={0.05}
                    value={config.gifSpeed !== undefined ? config.gifSpeed : 1.0}
                    onChange={(e) => setConfig({ gifSpeed: Number(e.target.value) })}
                  />
                </div>
              </div>

              {/* LED Brightness & Intensity */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label>{t('gifIntensityLabel')}</label>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                    {Math.round((config.gifIntensity !== undefined ? config.gifIntensity : 1.0) * 100)}%
                  </span>
                </div>
                <div className="range-slider-wrap">
                  <input
                    type="range"
                    className="range-slider"
                    min={0.1}
                    max={1.5}
                    step={0.05}
                    value={config.gifIntensity !== undefined ? config.gifIntensity : 1.0}
                    onChange={(e) => setConfig({ gifIntensity: Number(e.target.value) })}
                  />
                </div>
              </div>

              {/* LED Contrast Boost */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label>{t('gifContrastLabel')}</label>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                    {Math.round((config.gifContrast !== undefined ? config.gifContrast : 1.0) * 100)}%
                  </span>
                </div>
                <div className="range-slider-wrap">
                  <input
                    type="range"
                    className="range-slider"
                    min={0.5}
                    max={2.0}
                    step={0.05}
                    value={config.gifContrast !== undefined ? config.gifContrast : 1.0}
                    onChange={(e) => setConfig({ gifContrast: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Studio Sidelights (Underglow Lightbars) Card */}
      <div className="palette-card" style={{ maxWidth: '820px', margin: '0 auto 1.5rem auto' }}>
        <div className="switch-wrap" style={{ padding: 0, marginBottom: config.sidelightCustomEnable ? '1.25rem' : 0 }}>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.2rem' }}>{t('lblStudioSidelightTitle')}</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>
              {t('hintStudioSidelight')}
            </p>
          </div>
          <label className="switch" style={{ margin: 0, flexShrink: 0 }}>
            <input
              type="checkbox"
              id="chkStudioSidelightCustomEnable"
              checked={!!config.sidelightCustomEnable}
              onChange={(e) => setConfig({ sidelightCustomEnable: e.target.checked })}
            />
            <span className="slider"></span>
          </label>
        </div>

        {config.sidelightCustomEnable && (
          <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <div className="grid-3" style={{ gap: '1.25rem', marginBottom: '1.25rem' }}>
              <div className="form-group">
                <label>{t('lblStudioSidelightMode')}</label>
                <select
                  className="form-control"
                  value={config.sidelightMode || 'followMain'}
                  onChange={(e) => setConfig({ sidelightMode: e.target.value })}
                >
                  <option value="followMain">{t('optStudioSideFollow')}</option>
                  <option value="vuMeterStereo">{t('optStudioSideVuStereo')}</option>
                  <option value="waveFlow">{t('optStudioSideWaveFlow')}</option>
                  <option value="waveCenter">{t('optStudioSideCenterWave')}</option>
                  <option value="rhythmicPulse">{t('optStudioSidePulse')}</option>
                  <option value="solidAccent">{t('optStudioSideSolid')}</option>
                  <option value="off">{t('optStudioSideOff')}</option>
                </select>
              </div>

              <div className="form-group">
                <label>{t('lblStudioSidelightPalette')}</label>
                <select
                  className="form-control"
                  value={config.sidelightPalette || 'rainbow'}
                  onChange={(e) => setConfig({ sidelightPalette: e.target.value })}
                >
                  <optgroup label={t('optGroupCuratedPalettes', '🎨 Curated Palettes')}>
                    <option value="rainbow">{t('optPaletteRainbow')}</option>
                    <option value="cyberpunk">{t('optPaletteCyberpunk')}</option>
                    <option value="vaporwave">{t('optPaletteVaporwave')}</option>
                    <option value="synthwave">{t('optPaletteSynthwave')}</option>
                    <option value="fire_ember">{t('optPaletteFireEmber')}</option>
                    <option value="ocean_abyss">{t('optPaletteOceanAbyss')}</option>
                    <option value="matrix_code">{t('optPaletteMatrixCode')}</option>
                    <option value="ice_glacier">{t('optPaletteIceGlacier')}</option>
                    <option value="toxic_radiation">{t('optPaletteToxic')}</option>
                    <option value="singleColor">{t('optPaletteSingle')}</option>
                  </optgroup>
                  {customGradients && customGradients.length > 0 && (
                    <optgroup label={t('optGroupCustomGradients', '✨ Custom Gradients (Multi-Stop)')}>
                      {customGradients.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

              {(config.sidelightPalette === 'singleColor' || config.sidelightMode === 'solidAccent') && (
                <div className="form-group">
                  <label>{t('lblStudioSidelightColor')}</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', height: '38px' }}>
                    <input
                      type="color"
                      className="color-picker-input"
                      value={config.sidelightColor || '#00ffff'}
                      onChange={(e) => setConfig({ sidelightColor: e.target.value })}
                    />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{config.sidelightColor || '#00ffff'}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Custom Multi-Stop Gradient Studio (when sidelight uses custom gradient) */}
            {((config.sidelightPalette || '').startsWith('custom_grad_') || config.sidelightPalette === 'custom_gradient') && (
              <CustomGradientStudio
                currentPaletteId={config.sidelightPalette}
                onSelectPalette={(id) => setConfig({ sidelightPalette: id })}
              />
            )}

            <div className="grid-2" style={{ gap: '1.25rem' }}>
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label>{t('lblStudioSidelightSpeed')}</label>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{config.sidelightSpeed || 1.0}x</span>
                </div>
                <div className="range-slider-wrap">
                  <input
                    type="range"
                    className="range-slider"
                    min={0.2}
                    max={3.0}
                    step={0.1}
                    value={config.sidelightSpeed || 1.0}
                    onChange={(e) => setConfig({ sidelightSpeed: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label>{t('lblStudioSidelightIntensity')}</label>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{Math.round((config.sidelightIntensity || 1.0) * 100)}%</span>
                </div>
                <div className="range-slider-wrap">
                  <input
                    type="range"
                    className="range-slider"
                    min={0.1}
                    max={1.5}
                    step={0.05}
                    value={config.sidelightIntensity || 1.0}
                    onChange={(e) => setConfig({ sidelightIntensity: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
