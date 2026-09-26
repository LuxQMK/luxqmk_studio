import React, { useState } from 'react';
import { useKeymapStore } from '../store/useKeymapStore';
import { KEYCODES_DB, getKeycodeInfo } from '../data/keycodes';
import { useI18n } from '../i18n';

export const EncoderView: React.FC = () => {
  const { activeLayer, setActiveLayer, activeCategory, setActiveCategory } = useKeymapStore();
  const { t } = useI18n();

  const [selectedSlot, setSelectedSlot] = useState<'ccw' | 'cw' | 'press'>('ccw');
  const [encoderMap, setEncoderMap] = useState<Record<number, { ccw: number; cw: number; press: number }>>({
    0: { ccw: 0x00A9, cw: 0x00A8, press: 0x00A8 }, // Vol Down, Vol Up, Mute
    1: { ccw: 0x00A9, cw: 0x00A8, press: 0x00A8 },
    2: { ccw: 0x00A9, cw: 0x00A8, press: 0x00A8 },
  });

  const categories = [
    { id: 'media', labelKey: 'catMedia' },
    { id: 'basic', labelKey: 'catBasic' },
    { id: 'macro', labelKey: 'catMacro' },
    { id: 'layers', labelKey: 'catLayers' },
    { id: 'special', labelKey: 'catSpecial' },
    { id: 'lighting', labelKey: 'catLighting' },
    { id: 'custom', labelKey: 'catCustom' },
  ] as const;

  const activeKeycodes = KEYCODES_DB.filter((k) => k.category === activeCategory);
  const currentLayerConfig = encoderMap[activeLayer] || encoderMap[0];

  const handleAssignKeycode = (kc: number) => {
    setEncoderMap((prev) => ({
      ...prev,
      [activeLayer]: {
        ...prev[activeLayer],
        [selectedSlot]: kc,
      },
    }));
  };

  return (
    <section className="view-container active" id="view-encoder">
      <div className="keyboard-canvas-card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '0.5rem' }}>{t('viewEncoderTitle')}</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          {t('viewEncoderSubtitle')}
        </p>

        {/* Layer Selector */}
        <div className="layer-selector" style={{ marginBottom: '1.5rem' }}>
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
        </div>

        {/* Encoder 3-Slot Configuration Widget */}
        <div id="encoderConfigWidget" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {/* CCW Slot */}
          <div
            className={`encoder-slot-card ${selectedSlot === 'ccw' ? 'active' : ''}`}
            style={{
              background: selectedSlot === 'ccw' ? 'rgba(0, 240, 255, 0.08)' : 'var(--bg-darker)',
              border: `1px solid ${selectedSlot === 'ccw' ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onClick={() => setSelectedSlot('ccw')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent-cyan)' }}>
                <polyline points="1 4 1 10 7 10"></polyline>
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
              </svg>
              <strong style={{ fontSize: '0.9rem' }}>Rotate Counter-Clockwise</strong>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.75rem' }}>
              Action triggered when turning knob left
            </span>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.5rem 0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', fontWeight: 600, color: '#fff', fontSize: '0.85rem' }}>
              {getKeycodeInfo(currentLayerConfig.ccw).label} ({getKeycodeInfo(currentLayerConfig.ccw).name})
            </div>
          </div>

          {/* CW Slot */}
          <div
            className={`encoder-slot-card ${selectedSlot === 'cw' ? 'active' : ''}`}
            style={{
              background: selectedSlot === 'cw' ? 'rgba(0, 240, 255, 0.08)' : 'var(--bg-darker)',
              border: `1px solid ${selectedSlot === 'cw' ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onClick={() => setSelectedSlot('cw')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent-cyan)' }}>
                <polyline points="23 4 23 10 17 10"></polyline>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
              </svg>
              <strong style={{ fontSize: '0.9rem' }}>Rotate Clockwise</strong>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.75rem' }}>
              Action triggered when turning knob right
            </span>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.5rem 0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', fontWeight: 600, color: '#fff', fontSize: '0.85rem' }}>
              {getKeycodeInfo(currentLayerConfig.cw).label} ({getKeycodeInfo(currentLayerConfig.cw).name})
            </div>
          </div>

          {/* Press Slot */}
          <div
            className={`encoder-slot-card ${selectedSlot === 'press' ? 'active' : ''}`}
            style={{
              background: selectedSlot === 'press' ? 'rgba(0, 240, 255, 0.08)' : 'var(--bg-darker)',
              border: `1px solid ${selectedSlot === 'press' ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onClick={() => setSelectedSlot('press')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent-cyan)' }}>
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              <strong style={{ fontSize: '0.9rem' }}>Knob Center Press</strong>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.75rem' }}>
              Action triggered when pushing knob down
            </span>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.5rem 0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', fontWeight: 600, color: '#fff', fontSize: '0.85rem' }}>
              {getKeycodeInfo(currentLayerConfig.press).label} ({getKeycodeInfo(currentLayerConfig.press).name})
            </div>
          </div>
        </div>
      </div>

      {/* Keycode Palette for Encoder */}
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
        <div className="palette-grid" id="encoderKeycodePickerPalette">
          {activeKeycodes.map((kc, idx) => (
            <button
              key={idx}
              type="button"
              className="palette-key-btn"
              title={`${kc.name}: ${kc.desc || kc.title || ''}`}
              onClick={() => {
                if (typeof kc.code === 'number') {
                  handleAssignKeycode(kc.code);
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
    </section>
  );
};
