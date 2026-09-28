import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLightingStore, HARDWARE_GRADIENTS } from '../../store/useLightingStore';
import { useDeviceStore } from '../../store/useDeviceStore';
import { useUIStore } from '../../store/useUIStore';
import { useVisualizerStore } from '../../store/useVisualizerStore';
import { useI18n } from '../../i18n';
import { GradientStopItem } from '../../types/lighting';

const GRADIENT_TEMPLATES: Array<{ name: string; stops: GradientStopItem[] }> = [
  {
    name: 'Cyberpunk Neon',
    stops: [
      { pos: 0.0, color: '#00f0ff' },
      { pos: 0.333, color: '#ff0080' },
      { pos: 0.667, color: '#ffd000' }
    ]
  },
  {
    name: 'Synthwave 80s',
    stops: [
      { pos: 0.0, color: '#4b0082' },
      { pos: 0.25, color: '#ff1493' },
      { pos: 0.5, color: '#ff6400' },
      { pos: 0.75, color: '#ffd700' }
    ]
  },
  {
    name: 'Sunset Horizon',
    stops: [
      { pos: 0.0, color: '#2d0a55' },
      { pos: 0.333, color: '#eb2d37' },
      { pos: 0.667, color: '#ffbe28' }
    ]
  },
  {
    name: 'Toxic Lime',
    stops: [
      { pos: 0.0, color: '#a6ff00' },
      { pos: 0.333, color: '#f3ff00' },
      { pos: 0.667, color: '#00e53a' }
    ]
  },
  {
    name: 'Ocean Abyss',
    stops: [
      { pos: 0.0, color: '#001450' },
      { pos: 0.25, color: '#008cff' },
      { pos: 0.5, color: '#00ffc8' },
      { pos: 0.75, color: '#87cefa' }
    ]
  },
  {
    name: 'Fire & Ice',
    stops: [
      { pos: 0.0, color: '#00c8ff' },
      { pos: 0.25, color: '#ffffff' },
      { pos: 0.5, color: '#ff5000' },
      { pos: 0.75, color: '#b40000' }
    ]
  },
  {
    name: 'Pastel Dream',
    stops: [
      { pos: 0.0, color: '#dab6fc' },
      { pos: 0.25, color: '#a8f0db' },
      { pos: 0.5, color: '#ffd1b2' },
      { pos: 0.75, color: '#ffb6c1' }
    ]
  },
  {
    name: 'Emerald Forest',
    stops: [
      { pos: 0.0, color: '#00f260' },
      { pos: 0.333, color: '#0575e6' },
      { pos: 0.667, color: '#00f2fe' }
    ]
  },
  {
    name: 'Cosmic Plasma',
    stops: [
      { pos: 0.0, color: '#f12711' },
      { pos: 0.333, color: '#f5af19' },
      { pos: 0.667, color: '#8a2387' }
    ]
  }
];

function getContrastColor(hex: string): string {
  try {
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
    const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
    const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 135 ? '#000000' : '#ffffff';
  } catch (e) {
    return '#ffffff';
  }
}

function hexToRgb(hex: string): [number, number, number] {
  try {
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
    const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
    const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
    return [r, g, b];
  } catch (e) {
    return [0, 240, 255];
  }
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return '#' + [clamp(r), clamp(g), clamp(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
}

function interpolateColor(stops: GradientStopItem[], pos: number): string {
  if (!stops || stops.length === 0) return '#00f0ff';
  if (stops.length === 1) return stops[0].color;
  const sorted = [...stops].sort((a, b) => a.pos - b.pos);
  const s0 = sorted[0];
  const sLast = sorted[sorted.length - 1];

  if (pos <= s0.pos) return s0.color;
  if (pos >= sLast.pos) return sLast.color;

  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i];
    const b = sorted[i + 1];
    if (pos >= a.pos && pos <= b.pos) {
      const span = b.pos - a.pos;
      const t = span === 0 ? 0 : (pos - a.pos) / span;
      const rgbA = hexToRgb(a.color);
      const rgbB = hexToRgb(b.color);
      const r = rgbA[0] + (rgbB[0] - rgbA[0]) * t;
      const g = rgbA[1] + (rgbB[1] - rgbA[1]) * t;
      const bl = rgbA[2] + (rgbB[2] - rgbA[2]) * t;
      return rgbToHex(r, g, bl);
    }
  }
  return sLast.color;
}

export const HardwareGradientStudio: React.FC = () => {
  const {
    hardwareGradients,
    activeHardwareGradientProfile,
    setActiveHardwareGradientProfile,
    setHardwareGradientStop,
    addHardwareGradientStop,
    deleteHardwareGradientStop,
    distributeHardwareGradientStops,
    applyHardwareGradientTemplate,
    saveHardwareGradientToEEPROM,
    backlight,
    setBacklight
  } = useLightingStore();
  const { isConnected } = useDeviceStore();
  const { t } = useI18n();
  const { showToast } = useUIStore();

  const activeProf = activeHardwareGradientProfile ?? (backlight.gradientPreset === 9 ? 1 : 0);
  const currentStops: GradientStopItem[] = hardwareGradients[activeProf] || [
    { pos: 0.0, color: '#00f0ff' },
    { pos: 0.333, color: '#ff0080' },
    { pos: 0.667, color: '#ffd000' }
  ];

  const [selectedStopIndex, setSelectedStopIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef<boolean>(false);

  const sortedStops = [...currentStops].sort((a, b) => a.pos - b.pos);
  const s0 = sortedStops[0];
  const sLast = sortedStops[sortedStops.length - 1];
  let cssGradient = '';
  if (sLast && s0 && sLast.pos < 1.0) {
    cssGradient = `linear-gradient(to right, ${sortedStops
      .map((s) => `${s.color} ${Math.round(s.pos * 100)}%`)
      .join(', ')}, ${s0.color} 100%)`;
  } else {
    cssGradient = `linear-gradient(to right, ${sortedStops
      .map((s) => `${s.color} ${Math.round(s.pos * 100)}%`)
      .join(', ')})`;
  }

  useEffect(() => {
    if (selectedStopIndex !== null && selectedStopIndex >= currentStops.length) {
      setSelectedStopIndex(null);
    }
  }, [currentStops.length, selectedStopIndex]);

  const handleSelectProfile = (prof: number) => {
    setActiveHardwareGradientProfile(prof);
    setSelectedStopIndex(null);
    setBacklight({ gradientPreset: prof === 0 ? 8 : 9 });
  };

  const handleUpdateStop = useCallback((index: number, patch: Partial<GradientStopItem>) => {
    setHardwareGradientStop(activeProf, index, patch);
  }, [activeProf, setHardwareGradientStop]);

  const handleAddStopAtPos = (pos: number) => {
    if (currentStops.length >= 8) return;
    const clampedPos = Math.max(0, Math.min(1, Math.round(pos * 1000) / 1000));
    const newColor = interpolateColor(currentStops, clampedPos);
    addHardwareGradientStop(activeProf, clampedPos, newColor);
    setSelectedStopIndex(currentStops.length);
  };

  const handleAddStop = () => {
    if (currentStops.length >= 8) return;
    const stops = [...currentStops].sort((a, b) => a.pos - b.pos);
    let newPos = 0.5;
    if (stops.length >= 2) {
      let maxGap = 0;
      let gapStart = 0;
      for (let i = 0; i < stops.length - 1; i++) {
        const gap = stops[i + 1].pos - stops[i].pos;
        if (gap > maxGap) {
          maxGap = gap;
          gapStart = stops[i].pos;
        }
      }
      newPos = Math.round((gapStart + maxGap / 2) * 1000) / 1000;
    }
    handleAddStopAtPos(newPos);
  };

  const handleDeleteStop = (index: number) => {
    if (currentStops.length <= 2) return;
    deleteHardwareGradientStop(activeProf, index);
    if (selectedStopIndex === index) {
      setSelectedStopIndex(null);
    } else if (selectedStopIndex !== null && selectedStopIndex > index) {
      setSelectedStopIndex(selectedStopIndex - 1);
    }
  };

  const handleDistribute = (mode: 'qmk' | 'linear') => {
    distributeHardwareGradientStops(activeProf, mode);
    showToast(t('toastStopsDistributed'), 'success');
  };

  const handleApplyTemplate = (tpl: { name: string; stops: GradientStopItem[] }) => {
    applyHardwareGradientTemplate(activeProf, tpl.stops);
    setSelectedStopIndex(null);
  };

  const handleSaveToEEPROM = async () => {
    setIsSaving(true);
    try {
      await saveHardwareGradientToEEPROM(activeProf);
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartDrag = (index: number, e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedStopIndex(index);
    isDraggingRef.current = true;

    const track = trackRef.current;
    if (!track) return;

    const updatePosFromClientX = (clientX: number) => {
      const rect = track.getBoundingClientRect();
      const rawPos = (clientX - rect.left) / rect.width;
      const clamped = Math.max(0, Math.min(1, Math.round(rawPos * 1000) / 1000));
      handleUpdateStop(index, { pos: clamped });
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingRef.current) return;
      updatePosFromClientX(moveEvent.clientX);
    };

    const handleTouchMove = (touchEvent: TouchEvent) => {
      if (!isDraggingRef.current || !touchEvent.touches[0]) return;
      updatePosFromClientX(touchEvent.touches[0].clientX);
    };

    const handleEndDrag = () => {
      isDraggingRef.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEndDrag);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEndDrag);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleEndDrag);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleEndDrag);
  };

  const handleTrackClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDraggingRef.current) return;
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const clickedPos = Math.max(0, Math.min(1, Math.round(((e.clientX - rect.left) / rect.width) * 1000) / 1000));

    if (currentStops.length < 8) {
      handleAddStopAtPos(clickedPos);
    } else if (selectedStopIndex !== null) {
      handleUpdateStop(selectedStopIndex, { pos: clickedPos });
    }
  };

  const studioCustomGradients = useVisualizerStore((s) => s.customGradients);

  return (
    <div
      className="palette-card perkey-studio-card"
      onClick={() => setSelectedStopIndex(null)}
      style={{ display: 'block', cursor: 'default' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="live-dot-pulse" style={{ width: '8px', height: '8px', background: 'var(--accent-cyan)' }}></span>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
            {t('lblHardwareGradientStudioTitle')}
          </h3>
        </div>
        <span className="badge-pill" style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)' }}>
          EEPROM Standalone
        </span>
      </div>

      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.15rem' }}>
        {t('descHardwareGradientStudio')}
      </p>

      {/* Profile Switcher Tabs (Profile 1 vs Profile 2) */}
      <div className="perkey-profile-tabs" style={{ marginBottom: '1.25rem' }}>
        <button
          type="button"
          className={`perkey-prof-tab-btn ${activeProf === 0 ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            handleSelectProfile(0);
          }}
        >
          <span>Profile 1 (Hardware EEPROM)</span>
        </button>
        <button
          type="button"
          className={`perkey-prof-tab-btn ${activeProf === 1 ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            handleSelectProfile(1);
          }}
        >
          <span>Profile 2 (Hardware EEPROM)</span>
        </button>
      </div>

      {/* Interactive Gradient Track with Draggable Pins */}
      <div style={{ marginBottom: '1.75rem', userSelect: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            {t('lblGradientTrackHint')}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.2rem 0.55rem', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              onClick={(e) => {
                e.stopPropagation();
                handleDistribute('qmk');
              }}
              title="Evenly distribute stops for seamless circular loop cycling (QMK style)"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
              </svg>
              <span>{t('btnDistributeQmk')}</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.2rem 0.55rem', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              onClick={(e) => {
                e.stopPropagation();
                handleDistribute('linear');
              }}
              title="Evenly distribute stops from edge to edge (0% to 100%)"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
              <span>{t('btnDistributeLinear')}</span>
            </button>
          </div>
        </div>

        {/* Gradient Ramp Track */}
        <div
          ref={trackRef}
          onClick={handleTrackClick}
          style={{
            height: '40px',
            borderRadius: '10px',
            background: cssGradient,
            boxShadow: '0 0 20px rgba(0, 240, 255, 0.25), inset 0 0 0 1px rgba(255, 255, 255, 0.25)',
            position: 'relative',
            cursor: currentStops.length < 8 ? 'crosshair' : 'pointer',
            overflow: 'visible',
          }}
          title={currentStops.length < 8 ? 'Click anywhere on track to add a color stop' : 'Click to move active stop'}
        >
          {/* Vertical Stop Guidelines */}
          {currentStops.map((stop, idx) => {
            const isSelected = selectedStopIndex === idx;
            return (
              <div
                key={`hw-guide-${idx}`}
                style={{
                  position: 'absolute',
                  left: `${stop.pos * 100}%`,
                  top: 0,
                  bottom: 0,
                  width: '2px',
                  background: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.65)',
                  boxShadow: isSelected ? '0 0 8px #00f0ff, 0 0 2px rgba(0,0,0,0.8)' : '0 0 3px rgba(0,0,0,0.8)',
                  pointerEvents: 'none',
                  transform: 'translateX(-50%)',
                  zIndex: isSelected ? 4 : 2,
                }}
              />
            );
          })}
        </div>

        {/* Draggable Stop Pins Below the Gradient Bar */}
        <div style={{ position: 'relative', width: '100%', height: '48px', marginTop: '6px' }}>
          {currentStops.map((stop, idx) => {
            const isSelected = selectedStopIndex === idx;
            const contrast = getContrastColor(stop.color);
            return (
              <div
                key={`hw-pin-${idx}`}
                onMouseDown={(e) => handleStartDrag(idx, e)}
                onTouchStart={(e) => handleStartDrag(idx, e)}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedStopIndex(idx);
                }}
                style={{
                  position: 'absolute',
                  left: `${stop.pos * 100}%`,
                  transform: 'translateX(-50%)',
                  top: 0,
                  cursor: 'ew-resize',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  zIndex: isSelected ? 20 : 10,
                  touchAction: 'none',
                  userSelect: 'none',
                }}
                title={`Stop #${idx + 1} (${Math.round(stop.pos * 100)}%) - Click to select or drag to move`}
              >
                {/* Pointer Arrow */}
                <div
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: '6px solid transparent',
                    borderRight: '6px solid transparent',
                    borderBottom: isSelected ? '7px solid #00f0ff' : '7px solid rgba(255, 255, 255, 0.9)',
                    filter: 'drop-shadow(0 -1px 2px rgba(0,0,0,0.6))',
                  }}
                />
                {/* Pin Head Badge */}
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '6px',
                    background: stop.color,
                    border: isSelected ? '2px solid #00f0ff' : '2px solid #ffffff',
                    boxShadow: isSelected
                      ? '0 0 12px #00f0ff, 0 3px 6px rgba(0,0,0,0.6)'
                      : '0 2px 6px rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    color: contrast,
                    transition: 'transform 0.1s ease, box-shadow 0.15s ease',
                    transform: isSelected ? 'scale(1.18)' : 'scale(1)',
                  }}
                >
                  {idx + 1}
                </div>
                {/* Percentage Position Tag */}
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontFamily: 'var(--font-mono)',
                    color: isSelected ? '#00f0ff' : 'var(--text-muted)',
                    fontWeight: isSelected ? 700 : 500,
                    marginTop: '2px',
                    textShadow: '0 1px 3px rgba(0,0,0,0.9)',
                  }}
                >
                  {Math.round(stop.pos * 100)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Color Stop Cards & Individual Stop Controls */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', margin: 0 }}>
            {t('lblGradientStops', 'Color Stops (Anchor Points)')} ({currentStops.length}/8)
          </label>
          {currentStops.length < 8 && (
            <button
              type="button"
              className="btn btn-secondary"
              style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              onClick={(e) => {
                e.stopPropagation();
                handleAddStop();
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>{t('btnAddStop')}</span>
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
          {currentStops.map((stop, idx) => {
            const isSelected = selectedStopIndex === idx;
            return (
              <div
                key={`stop-card-${idx}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedStopIndex(idx);
                }}
                style={{
                  background: isSelected ? 'rgba(30, 58, 138, 0.35)' : 'rgba(30, 41, 59, 0.6)',
                  border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  padding: '0.75rem 0.85rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.55rem',
                  boxShadow: isSelected ? '0 0 12px rgba(0, 240, 255, 0.2)' : 'none',
                  transition: 'all 0.15s ease',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '0.1rem 0.45rem',
                        borderRadius: '4px',
                        background: isSelected ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.1)',
                        color: isSelected ? '#000000' : 'var(--accent-cyan)',
                      }}
                    >
                      #{idx + 1}
                    </span>
                    {isSelected && (
                      <span style={{ fontSize: '0.68rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                        Active
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="color"
                      className="color-picker-input"
                      value={stop.color}
                      onChange={(e) => handleUpdateStop(idx, { color: e.target.value })}
                      style={{ width: '28px', height: '28px', borderRadius: '5px' }}
                    />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: '#fff', fontWeight: 600 }}>
                      {stop.color.toUpperCase()}
                    </span>
                    {currentStops.length > 2 && (
                      <button
                        type="button"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          padding: '2px',
                          display: 'flex',
                          alignItems: 'center',
                          marginLeft: '0.2rem',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteStop(idx);
                        }}
                        title={t('btnDeleteStop')}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Position Slider */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    <span>{t('lblStopPos')}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                      {Math.round(stop.pos * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    className="range-slider"
                    min={0}
                    max={100}
                    step={1}
                    value={Math.round(stop.pos * 100)}
                    onChange={(e) => handleUpdateStop(idx, { pos: Number(e.target.value) / 100 })}
                    style={{ width: '100%', height: '4px' }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Curated Color Templates & Custom Studio Presets */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.45rem', fontWeight: 600 }}>
          {t('lblQuickTemplates')}:
        </label>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: studioCustomGradients && studioCustomGradients.length > 0 ? '0.6rem' : 0 }}>
          {GRADIENT_TEMPLATES.map((tpl, tIdx) => (
            <button
              key={tIdx}
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.25rem 0.6rem', fontSize: '0.74rem' }}
              onClick={(e) => {
                e.stopPropagation();
                handleApplyTemplate(tpl);
              }}
            >
              <span>{tpl.name}</span>
            </button>
          ))}
        </div>

        {studioCustomGradients && studioCustomGradients.length > 0 && (
          <div>
            <label style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
              Studio Custom Presets:
            </label>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {studioCustomGradients.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '0.25rem 0.6rem', fontSize: '0.74rem', border: '1px solid rgba(0, 240, 255, 0.4)' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApplyTemplate({ name: g.name, stops: g.stops.slice(0, 8) });
                  }}
                >
                  <span>{g.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Save to EEPROM Action Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
        <button
          type="button"
          className="btn btn-primary"
          style={{ padding: '0.55rem 1.25rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}
          disabled={!isConnected || isSaving}
          onClick={(e) => {
            e.stopPropagation();
            handleSaveToEEPROM();
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
            <polyline points="17 21 17 13 7 13 7 21"></polyline>
          </svg>
          <span>{isSaving ? t('lblWritingEeprom') : t('btnSaveHardwareGradient')}</span>
        </button>
      </div>
    </div>
  );
};
