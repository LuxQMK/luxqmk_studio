import React, { useState } from 'react';
import { ChangelogRelease } from '../../data/changelog';
import { useI18n } from '../../i18n';

interface ChangelogViewerProps {
  entries: ChangelogRelease[];
  accentColor?: string;
  emptyMessage?: string;
  maxInitialExpanded?: number;
}

export const ChangelogViewer: React.FC<ChangelogViewerProps> = ({
  entries,
  accentColor = '#c084fc',
  emptyMessage,
  maxInitialExpanded = 1,
}) => {
  const { t } = useI18n();

  const [expandedReleases, setExpandedReleases] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    entries.slice(0, maxInitialExpanded).forEach((rel) => {
      init[rel.version] = true;
    });
    return init;
  });

  const toggleRelease = (version: string) => {
    setExpandedReleases((prev) => ({
      ...prev,
      [version]: !prev[version],
    }));
  };

  const renderFormattedText = (text: string) => {
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
    let lastIdx = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIdx) {
        parts.push(text.substring(lastIdx, match.index));
      }
      const token = match[0];
      if (token.startsWith('**') && token.endsWith('**')) {
        parts.push(
          <strong key={match.index} style={{ color: 'var(--text-primary, #ffffff)' }}>
            {token.slice(2, -2)}
          </strong>
        );
      } else if (token.startsWith('`') && token.endsWith('`')) {
        parts.push(
          <code
            key={match.index}
            style={{
              padding: '0.1rem 0.35rem',
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '4px',
              fontSize: '0.82rem',
              fontFamily: 'monospace',
              color: 'var(--accent-cyan, #00f0ff)',
            }}
          >
            {token.slice(1, -1)}
          </code>
        );
      }
      lastIdx = regex.lastIndex;
    }
    if (lastIdx < text.length) {
      parts.push(text.substring(lastIdx));
    }
    return parts;
  };

  if (!entries || entries.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
        {emptyMessage || t('lblChangelogEmpty', 'No changelog entries available.')}
      </div>
    );
  }

  return (
    <div className="changelog-viewer-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
      {entries.map((rel, idx) => {
        const isExpanded = !!expandedReleases[rel.version];
        const isLatest = idx === 0;
        const isDev = rel.date.toLowerCase().includes('development') || rel.date.toLowerCase().includes('unreleased');

        return (
          <div
            key={rel.version}
            style={{
              background: 'rgba(15, 23, 42, 0.45)',
              border: isLatest ? `1px solid ${accentColor}55` : '1px solid rgba(255, 255, 255, 0.07)',
              borderRadius: '8px',
              overflow: 'hidden',
              transition: 'border-color 0.2s ease',
            }}
          >
            <button
              type="button"
              onClick={() => toggleRelease(rel.version)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: isExpanded ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                color: 'inherit',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary, #ffffff)' }}>
                  v{rel.version}
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted, #94a3b8)' }}>
                  {rel.date}
                </span>
                {isLatest && (
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 600,
                      padding: '0.12rem 0.45rem',
                      borderRadius: '9999px',
                      background: `${accentColor}25`,
                      color: accentColor,
                      border: `1px solid ${accentColor}44`,
                    }}
                  >
                    {isDev ? 'In Development' : t('lblLatestVersionTag', 'Latest Version')}
                  </span>
                )}
              </div>

              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease',
                  color: 'var(--text-muted, #94a3b8)',
                }}
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>

            {isExpanded && (
              <div style={{ padding: '0.75rem 1.1rem 1rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                {Object.entries(rel.sections).map(([sectionName, items]) => {
                  let badgeColor = 'rgba(56, 189, 248, 0.15)';
                  let textColor = '#38bdf8';
                  let borderColor = 'rgba(56, 189, 248, 0.3)';

                  const lower = sectionName.toLowerCase();
                  if (lower === 'added') {
                    badgeColor = 'rgba(34, 197, 94, 0.15)';
                    textColor = '#4ade80';
                    borderColor = 'rgba(74, 222, 128, 0.3)';
                  } else if (lower === 'fixed') {
                    badgeColor = 'rgba(234, 179, 8, 0.15)';
                    textColor = '#facc15';
                    borderColor = 'rgba(250, 204, 21, 0.3)';
                  } else if (lower === 'removed' || lower === 'deprecated') {
                    badgeColor = 'rgba(239, 68, 68, 0.15)';
                    textColor = '#f87171';
                    borderColor = 'rgba(248, 113, 113, 0.3)';
                  } else if (lower === 'security') {
                    badgeColor = 'rgba(168, 85, 247, 0.15)';
                    textColor = '#c084fc';
                    borderColor = 'rgba(168, 85, 247, 0.3)';
                  }

                  return (
                    <div key={sectionName} style={{ marginBottom: '0.75rem' }}>
                      <div style={{ marginBottom: '0.35rem' }}>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            padding: '0.12rem 0.45rem',
                            borderRadius: '4px',
                            background: badgeColor,
                            color: textColor,
                            border: `1px solid ${borderColor}`,
                            display: 'inline-block',
                          }}
                        >
                          {sectionName}
                        </span>
                      </div>

                      <ul style={{ margin: 0, paddingLeft: '1.25rem', listStyleType: 'disc' }}>
                        {items.map((item, itemIdx) => (
                          <li
                            key={itemIdx}
                            style={{
                              fontSize: '0.82rem',
                              lineHeight: '1.45',
                              color: 'var(--text-secondary, #cbd5e1)',
                              marginBottom: '0.25rem',
                            }}
                          >
                            {renderFormattedText(item)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
