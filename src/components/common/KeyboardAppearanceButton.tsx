import React from 'react';
import { useKeyboardThemeStore } from '../../store/useKeyboardThemeStore';
import { useI18n } from '../../i18n';

interface KeyboardAppearanceButtonProps {
  className?: string;
  style?: React.CSSProperties;
  compact?: boolean;
}

export const KeyboardAppearanceButton: React.FC<KeyboardAppearanceButtonProps> = ({
  className = '',
  style = {},
  compact = false,
}) => {
  const { setDesignModalOpen, activeCaseTheme, activeKeycapTheme } = useKeyboardThemeStore();
  const { t } = useI18n();

  const caseTheme = activeCaseTheme;
  const keycapTheme = activeKeycapTheme;

  return (
    <button
      type="button"
      className={`btn btn-secondary btn-sm ${className}`}
      id="btnOpenKeyboardDesign"
      title={`${t('btnKeyboardDesignTitle', 'Customize virtual keyboard case & keycap appearance')}: ${t(caseTheme.nameKey, caseTheme.defaultName)} + ${t(keycapTheme.nameKey, keycapTheme.defaultName)}`}
      style={{
        fontSize: '0.78rem',
        padding: '0.28rem 0.6rem',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.45rem',
        ...style,
      }}
      onClick={() => setDesignModalOpen(true)}
    >
      {/* Palette Icon */}
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M12 2a14.5 14.5 0 0 0 0 20 10 10 0 0 0 9.54-13.42A10 10 0 0 0 12 2z"></path>
        <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"></circle>
        <circle cx="15.5" cy="8.5" r="1.5" fill="currentColor"></circle>
        <circle cx="8.5" cy="15.5" r="1.5" fill="currentColor"></circle>
      </svg>

      {/* Mini Color Indicator Dots */}
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: caseTheme.previewColor,
            border: '1px solid rgba(255, 255, 255, 0.4)',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
          }}
          title={t(caseTheme.nameKey, caseTheme.defaultName)}
        />
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: keycapTheme.previewColors[0],
            border: '1px solid rgba(255, 255, 255, 0.4)',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
          }}
          title={t(keycapTheme.nameKey, keycapTheme.defaultName)}
        />
      </span>

      {!compact && <span>{t('btnKeyboardDesign', 'Appearance')}</span>}
    </button>
  );
};
