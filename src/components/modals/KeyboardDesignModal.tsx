import React from 'react';
import { useKeyboardThemeStore } from '../../store/useKeyboardThemeStore';
import { CASE_THEMES, KEYCAP_THEMES } from '../../data/keyboardThemes';
import { useI18n } from '../../i18n';

export const KeyboardDesignModal: React.FC = () => {
  const {
    isDesignModalOpen,
    setDesignModalOpen,
    caseThemeId,
    keycapThemeId,
    setCaseThemeId,
    setKeycapThemeId,
    resetToDefaults,
  } = useKeyboardThemeStore();
  const { t } = useI18n();

  if (!isDesignModalOpen) return null;

  return (
    <div
      className="modal-overlay active"
      id="keyboardDesignModal"
      onClick={(e) => {
        if (e.target === e.currentTarget) setDesignModalOpen(false);
      }}
    >
      <div className="modal-card" style={{ maxWidth: '780px', width: '94vw' }}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div
              className="modal-header-icon-badge"
              style={{ background: 'rgba(0, 240, 255, 0.1)', color: 'var(--accent-cyan)' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 2a14.5 14.5 0 0 0 0 20 10 10 0 0 0 9.54-13.42A10 10 0 0 0 12 2z"></path>
                <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"></circle>
                <circle cx="15.5" cy="8.5" r="1.5" fill="currentColor"></circle>
                <circle cx="8.5" cy="15.5" r="1.5" fill="currentColor"></circle>
              </svg>
            </div>
            <div>
              <h3 className="modal-title">{t('modalDesignTitle', 'Virtual Keyboard Appearance')}</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                {t('modalDesignSubtitle', 'Customize keyboard case and keycaps visual styling (GUI only)')}
              </span>
            </div>
          </div>
          <button
            className="modal-close-btn"
            id="btnCloseDesignModal"
            type="button"
            onClick={() => setDesignModalOpen(false)}
          >
            &times;
          </button>
        </div>

        {/* Modal Body */}
        <div
          className="modal-body"
          style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem', maxHeight: '72vh', overflowY: 'auto' }}
        >
          {/* SECTION 1: KEYBOARD CASE / CHASSIS THEME */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.6rem',
              }}
            >
              <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '0.01em' }}>
                {t('lblCaseThemeTitle', 'Keyboard Case (Chassis Color)')}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                {CASE_THEMES.length} {t('lblPresetsAvailable', 'Presets')}
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(165px, 1fr))',
                gap: '0.65rem',
              }}
            >
              {CASE_THEMES.map((theme) => {
                const isSelected = caseThemeId === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    className={`theme-preset-card ${isSelected ? 'active' : ''}`}
                    onClick={() => setCaseThemeId(theme.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      padding: '0.6rem 0.8rem',
                      borderRadius: '8px',
                      background: isSelected ? 'rgba(0, 240, 255, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                      border: isSelected ? '1.5px solid var(--accent-cyan)' : '1px solid rgba(255, 255, 255, 0.08)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 0 12px rgba(0, 240, 255, 0.25)' : 'none',
                    }}
                  >
                    <span
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        background: theme.previewColor,
                        border: '1.5px solid rgba(255, 255, 255, 0.25)',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontSize: '0.80rem',
                        fontWeight: isSelected ? 700 : 500,
                        color: isSelected ? 'var(--accent-cyan)' : 'var(--text-main)',
                        lineHeight: 1.25,
                      }}
                    >
                      {t(theme.nameKey, theme.defaultName)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: KEYCAPS THEME */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.6rem',
              }}
            >
              <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '0.01em' }}>
                {t('lblKeycapThemeTitle', 'Keycaps Colorway (Keycaps Theme)')}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                {KEYCAP_THEMES.length} {t('lblColorwaysAvailable', 'Colorways')}
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(225px, 1fr))',
                gap: '0.7rem',
              }}
            >
              {KEYCAP_THEMES.map((theme) => {
                const isSelected = keycapThemeId === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    className={`theme-preset-card ${isSelected ? 'active' : ''}`}
                    onClick={() => setKeycapThemeId(theme.id)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.55rem',
                      padding: '0.75rem 0.85rem',
                      borderRadius: '8px',
                      background: isSelected ? 'rgba(0, 240, 255, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                      border: isSelected ? '1.5px solid var(--accent-cyan)' : '1px solid rgba(255, 255, 255, 0.08)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 0 12px rgba(0, 240, 255, 0.25)' : 'none',
                    }}
                  >
                    {/* Visual Keycap Dual Swatch */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <div
                        style={{
                          width: '28px',
                          height: '24px',
                          borderRadius: '4px',
                          background: theme.alphaBg,
                          border: `1px solid ${theme.alphaBorder}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.64rem',
                          fontWeight: 700,
                          color: theme.alphaText,
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.4)',
                        }}
                      >
                        A
                      </div>
                      <div
                        style={{
                          width: '34px',
                          height: '24px',
                          borderRadius: '4px',
                          background: theme.modBg,
                          border: `1px solid ${theme.modBorder}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.56rem',
                          fontWeight: 700,
                          color: theme.modText,
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.4)',
                        }}
                      >
                        Ctrl
                      </div>
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: theme.knobBg,
                          border: `1px solid ${theme.knobBorder}`,
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.4)',
                          marginLeft: 'auto',
                        }}
                        title="Knob"
                      />
                    </div>

                    <span
                      style={{
                        fontSize: '0.80rem',
                        fontWeight: isSelected ? 700 : 600,
                        color: isSelected ? 'var(--accent-cyan)' : 'var(--text-main)',
                        lineHeight: 1.25,
                      }}
                    >
                      {t(theme.nameKey, theme.defaultName)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={resetToDefaults}
            style={{ fontSize: '0.8rem', padding: '0.45rem 0.8rem', gap: '0.4rem' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
              <polyline points="3 3 3 8 8 8"></polyline>
            </svg>
            <span>{t('btnResetDefaultDesign', 'Reset to Default')}</span>
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setDesignModalOpen(false)}
            style={{ minWidth: '90px' }}
          >
            {t('btnOk')}
          </button>
        </div>
      </div>
    </div>
  );
};
