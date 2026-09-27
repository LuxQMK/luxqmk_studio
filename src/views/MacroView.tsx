import React from 'react';
import { useMacroStore } from '../store/useMacroStore';
import { useDeviceStore } from '../store/useDeviceStore';
import { useI18n } from '../i18n';

export const MacroView: React.FC = () => {
  const { dirtyModules, isConnected, isViaSupported } = useDeviceStore();
  const {
    activeSlotId,
    setActiveSlotId,
    isRecording,
    setRecording,
    slots,
    updateActiveMacro,
    insertSyntaxAtCursor,
    clearActiveMacro,
    resetAllMacros,
    getBufferUsage,
    saveMacrosToKeyboard,
  } = useMacroStore();

  const { t } = useI18n();

  const activeSlot = slots.find((s) => s.id === activeSlotId) || slots[0];
  const usage = getBufferUsage();

  return (
    <section className="view-container active" id="view-macro">
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

      <div className="macro-editor-layout">
        {/* Left Column: Macro Slot List (M0 - M15) */}
        <div className="macro-sidebar-card">
          <div className="macro-sidebar-header">
            <div className="macro-sidebar-title-wrap">
              <span style={{ display: 'flex', alignItems: 'center', color: 'var(--accent-cyan)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
              </span>
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{t('lblMacroSlotsTitle')}</h3>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{t('lblMacroSlotsSubtitle')}</span>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-icon-sm"
              id="btnReloadMacros"
              title={t('tooltipReloadMacros', 'Reload from Keyboard')}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10"></polyline>
                <polyline points="1 20 1 14 7 14"></polyline>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
              </svg>
            </button>
          </div>

          <div className="macro-slots-list" id="macroSlotsList">
            {slots.map((slot) => {
              const hasContent = !!(slot.content && slot.content.trim().length > 0);
              const preview = hasContent ? slot.content : (t('lblEmptyMacro', 'Empty') || 'Empty');
              const isSelected = slot.id === activeSlotId;
              return (
                <button
                  key={slot.id}
                  type="button"
                  className={`macro-slot-card ${isSelected ? 'active' : ''}`}
                  onClick={() => setActiveSlotId(slot.id)}
                >
                  <div className="macro-slot-header">
                    <div className="macro-slot-id">
                      <span className={`macro-slot-dot ${hasContent ? 'filled' : ''}`}></span>
                      <span>M{slot.id}</span>
                    </div>
                    <span className="macro-slot-name">{slot.name || `Macro ${slot.id}`}</span>
                  </div>
                  <div className="macro-slot-snippet">{preview}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Macro Workspace */}
        <div className="macro-workspace-card">
          {/* Workspace Top Bar */}
          <div className="macro-workspace-header">
            <div className="macro-active-info">
              <span className="badge-macro-id" id="macroActiveTitleBadge">
                M{activeSlot.id}
              </span>
              <input
                type="text"
                id="macroNameInput"
                className="macro-name-input"
                placeholder={t('placeholderMacroName')}
                maxLength={32}
                value={activeSlot.name}
                onChange={(e) => updateActiveMacro({ name: e.target.value })}
              />
              {isRecording && (
                <span className="macro-record-badge" id="macroRecordStatus" style={{ display: 'inline-flex' }}>
                  <span className="pulse-recording-dot"></span>
                  <span>{t('statusRecording')}</span>
                </span>
              )}
            </div>

            <div className="macro-workspace-actions">
              <button
                type="button"
                className={`btn btn-record ${isRecording ? 'recording' : ''}`}
                id="btnRecordMacro"
                onClick={() => setRecording(!isRecording)}
              >
                <span className="record-dot"></span>
                <span>{isRecording ? t('btnStopRecord', 'Stop Recording') : t('btnStartRecord')}</span>
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                id="btnClearCurrentMacro"
                onClick={clearActiveMacro}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                <span>{t('btnClearMacro')}</span>
              </button>
              <button
                type="button"
                className={`btn btn-primary ${dirtyModules.has('macro') ? 'btn-save-eeprom-pulse' : ''}`}
                id="btnSaveMacros"
                onClick={saveMacrosToKeyboard}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
                <span>{t('btnSaveMacros')}</span>
              </button>
            </div>
          </div>

          {/* Memory Gauge Bar */}
          <div className="macro-memory-bar-wrap">
            <div className="macro-memory-labels">
              <span>{t('lblMacroMemory')}</span>
              <strong id="macroMemoryGaugeText">
                {usage.usedBytes} / {usage.maxBytes} B ({usage.percentage}%)
              </strong>
            </div>
            <div className="macro-memory-track">
              <div
                className="macro-memory-fill"
                id="macroMemoryGaugeFill"
                style={{ width: `${usage.percentage}%` }}
              ></div>
            </div>
          </div>

          {/* Quick Syntax Toolbar */}
          <div className="macro-toolbar-section">
            <div className="macro-toolbar-group">
              <span className="macro-toolbar-label">{t('macroGroupModifiers')}:</span>
              <div className="macro-toolbar-buttons">
                {['{+KC_LCTRL}', '{-KC_LCTRL}', '{+KC_LSHIFT}', '{-KC_LSHIFT}', '{+KC_LALT}', '{-KC_LALT}', '{+KC_LGUI}', '{-KC_LGUI}'].map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="macro-syntax-btn"
                    onClick={() => insertSyntaxAtCursor(item)}
                  >
                    {item.replace('{+', '+').replace('{-', '-').replace('KC_L', '').replace('}', '')}
                  </button>
                ))}
              </div>
            </div>

            <div className="macro-toolbar-group">
              <span className="macro-toolbar-label">{t('macroGroupKeys')}:</span>
              <div className="macro-toolbar-buttons">
                {[
                  { tag: '{KC_ENTER}', label: 'Enter' },
                  { tag: '{KC_TAB}', label: 'Tab' },
                  { tag: '{KC_ESC}', label: 'Esc' },
                  { tag: '{KC_SPACE}', label: 'Space' },
                  { tag: '{KC_BSPC}', label: 'Backspace' },
                  { tag: '{KC_DEL}', label: 'Delete' },
                  { tag: '{KC_UP}', label: '↑' },
                  { tag: '{KC_DOWN}', label: '↓' },
                  { tag: '{KC_LEFT}', label: '←' },
                  { tag: '{KC_RIGHT}', label: '→' },
                ].map((item) => (
                  <button
                    key={item.tag}
                    type="button"
                    className="macro-syntax-btn"
                    onClick={() => insertSyntaxAtCursor(item.tag)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="macro-toolbar-group">
              <span className="macro-toolbar-label">{t('macroGroupCombos')}:</span>
              <div className="macro-toolbar-buttons">
                {[
                  { tag: '{+KC_LCTRL}c{-KC_LCTRL}', label: 'Ctrl+C' },
                  { tag: '{+KC_LCTRL}v{-KC_LCTRL}', label: 'Ctrl+V' },
                  { tag: '{+KC_LCTRL}a{-KC_LCTRL}', label: 'Ctrl+A' },
                  { tag: '{+KC_LCTRL}z{-KC_LCTRL}', label: 'Ctrl+Z' },
                  { tag: '{+KC_LALT}{KC_TAB}{-KC_LALT}', label: 'Alt+Tab' },
                  { tag: '{+KC_LGUI}d{-KC_LGUI}', label: 'Win+D' },
                ].map((item) => (
                  <button
                    key={item.tag}
                    type="button"
                    className="macro-syntax-btn highlight"
                    onClick={() => insertSyntaxAtCursor(item.tag)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="macro-toolbar-group">
              <span className="macro-toolbar-label">{t('macroGroupDelays')}:</span>
              <div className="macro-toolbar-buttons">
                {['{25ms}', '{50ms}', '{100ms}', '{250ms}', '{500ms}', '{1000ms}'].map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="macro-syntax-btn delay"
                    onClick={() => insertSyntaxAtCursor(item)}
                  >
                    {item.replace('{', '').replace('}', '')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Macro Textarea Editor */}
          <div className="macro-editor-input-wrap">
            <textarea
              id="macroContentEditor"
              className="macro-textarea"
              placeholder="Type plain text or insert keystroke actions... (e.g. Hello World!{KC_ENTER})"
              spellCheck={false}
              value={activeSlot.content}
              onChange={(e) => updateActiveMacro({ content: e.target.value })}
            ></textarea>
          </div>

          {/* Bottom helper tip & reset */}
          <div className="macro-workspace-footer">
            <div className="macro-syntax-hint">
              <span style={{ color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              </span>
              <span>{t('macroSyntaxHint')}</span>
            </div>
            <button
              type="button"
              className="btn btn-danger-subtle btn-sm"
              id="btnResetAllMacros"
              onClick={resetAllMacros}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px', verticalAlign: 'middle' }}>
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <span>{t('btnResetAllMacros')}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
