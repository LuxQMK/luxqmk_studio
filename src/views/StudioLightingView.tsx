import React, { useState, useEffect } from 'react';
import { useVisualizerStore } from '../store/useVisualizerStore';
import { useKeymapStore } from '../store/useKeymapStore';
import { useDeviceStore } from '../store/useDeviceStore';
import { useLightingStore } from '../store/useLightingStore';
import { useUIStore } from '../store/useUIStore';
import { getLayoutForPreset, GMMK3_SIDE_LEDS } from '../data/layouts';
import { ALL_DEVICE_DESCRIPTORS } from '../data/devices';
import { useI18n } from '../i18n';
import { useKeyboardFit } from '../hooks/useKeyboardFit';
import { LogoLedBadge } from '../components/common/LogoLedBadge';
import { visualizerService } from '../core/visualizer-service';

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

  const { config, setConfig, toggleStudioLighting } = useVisualizerStore();
  const { presetLayoutId } = useKeymapStore();
  const { studioSubTab, setStudioSubTab } = useUIStore();
  const { t } = useI18n();

  const [audioSources, setAudioSources] = useState<Array<{ id: string; label: string }>>([
    { id: 'system_loopback', label: 'System Audio Output (WASAPI / Loopback)' }
  ]);

  const refreshAudioSources = () => {
    visualizerService.enumerateAudioSources().then((sources) => {
      setAudioSources(sources);
    });
  };

  useEffect(() => {
    if (!isDesktop) return;
    refreshAudioSources();
    if (useDeviceStore.getState().isConnected) {
      useLightingStore.getState().loadFromHardware();
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
  const desc = activeDescriptor || ALL_DEVICE_DESCRIPTORS.find((d) => d.id === presetLayoutId) || ALL_DEVICE_DESCRIPTORS[0];
  const hasSidelights = desc?.capabilities?.hasSidelights ?? (presetLayoutId.includes('gmmk') || presetLayoutId.includes('100') || presetLayoutId.includes('75') || presetLayoutId.includes('65') || presetLayoutId.includes('96'));

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

  // Direction options for current PC effect preset
  const currentDirCat = EFFECT_TO_DIR_CATEGORY[config.softwareEffect] || 'spatial6';
  const availableDirections = EFFECT_DIRECTION_OPTIONS[currentDirCat] || EFFECT_DIRECTION_OPTIONS.spatial6;

  return (
    <section className="view-container active" id="view-studio_lighting">
      {/* Live Virtual RGB Preview Card */}
      <div className="keyboard-canvas-card" style={{ marginBottom: '1.5rem' }}>
        <div className="keyboard-canvas-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="live-dot-pulse"></span>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>{t('studioLightingLivePreviewTitle')}</h3>
          </div>
          <div className="lighting-preview-status">
            <span className={`badge-pill ${config.isRunning ? 'badge-connected' : ''}`} id="studioLightingStatusBadge">
              {config.isRunning ? t('lblSoftwareActiveBadge', 'Running (60 FPS)') : t('lblSoftwareStoppedBadge', 'Stopped')}
            </span>
          </div>
        </div>

        <div className="keyboard-scroll-wrapper" ref={wrapperRef}>
          <div
            className={`keyboard-canvas lighting-keyboard-canvas ${hasSidelights ? 'has-sidelights' : ''}`}
            id="studioLightingKeyboardCanvas"
            ref={canvasRef}
            style={{ width: `${canvasWidth}px`, height: `${canvasHeight}px`, position: 'relative' }}
          >
            {/* Left & Right Sidelight LED Diffusers */}
            {hasSidelights && (
              <div className="side-diffusers-container">
                {GMMK3_SIDE_LEDS.left.map((sled) => (
                  <div
                    key={sled.id}
                    data-key-id={sled.id}
                    className="side-diffuser-segment side-diffuser-left"
                    style={{
                      top: `${sled.y * unitSize + 18}px`,
                      left: '6px',
                    }}
                    title={`Side LED Left (${sled.id})`}
                  />
                ))}
                {GMMK3_SIDE_LEDS.right.map((sled) => (
                  <div
                    key={sled.id}
                    data-key-id={sled.id}
                    className="side-diffuser-segment side-diffuser-right"
                    style={{
                      top: `${sled.y * unitSize + 18}px`,
                      right: '6px',
                    }}
                    title={`Side LED Right (${sled.id})`}
                  />
                ))}
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
                  setConfig({ audioSource: e.target.value });
                  if (config.isRunning) {
                    visualizerService.start();
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

            {/* Mode, Palette, Direction Grid */}
            <div className="grid-3" style={{ gap: '1.25rem', marginBottom: '1.25rem' }}>
              <div className="form-group">
                <label>{t('audioMode')}</label>
                <select
                  className="form-control"
                  value={config.audioMode}
                  onChange={(e) => setConfig({ audioMode: e.target.value })}
                >
                  <option value="equalizer">{t('optEqualizer')}</option>
                  <option value="bassPulse">{t('optBassPulse')}</option>
                  <option value="vuMeter">{t('optVuMeter')}</option>
                  <option value="audioWave">{t('optAudioWave')}</option>
                  <option value="spectrumHeatmap">{t('optSpectrumHeatmap')}</option>
                  <option value="starfieldBeats">{t('optStarfieldBeats')}</option>
                  <option value="voiceAura">{t('optVoiceAura')}</option>
                </select>
              </div>

              <div className="form-group">
                <label>{t('audioColorMode')}</label>
                <select
                  className="form-control"
                  value={config.audioColorMode}
                  onChange={(e) => setConfig({ audioColorMode: e.target.value })}
                >
                  <option value="rainbow">{t('optPaletteRainbow')}</option>
                  <option value="cyberpunk">{t('optPaletteCyberpunk')}</option>
                  <option value="vaporwave">{t('optPaletteVaporwave')}</option>
                  <option value="fire_ember">{t('optPaletteFireEmber')}</option>
                  <option value="ocean_abyss">{t('optPaletteOceanAbyss')}</option>
                  <option value="matrix_code">{t('optPaletteMatrixCode')}</option>
                  <option value="synthwave">{t('optPaletteSynthwave')}</option>
                  <option value="ice_glacier">{t('optPaletteIceGlacier')}</option>
                  <option value="toxic_radiation">{t('optPaletteToxic')}</option>
                  <option value="singleColor">{t('optPaletteSingle')}</option>
                </select>
              </div>

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
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{Math.round((config.audioFloor || 0.15) * 100)}%</span>
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
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{Math.round((config.softwareFloor || 0.10) * 100)}%</span>
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
