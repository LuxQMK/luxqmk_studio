import React from 'react';
import { useUIStore } from '../../store/useUIStore';
import { useI18n } from '../../i18n';
import logoSvg from '../../../assets/logo.svg';

export const AboutModal: React.FC = () => {
  const { isAboutOpen, setAboutOpen } = useUIStore();
  const { t } = useI18n();

  return (
    <div
      className={`modal-overlay ${isAboutOpen ? 'active' : ''}`}
      id="aboutModal"
      onClick={(e) => {
        if (e.target === e.currentTarget) setAboutOpen(false);
      }}
    >
      <div className="modal-card">
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="sidebar-logo-badge" style={{ width: '44px', height: '44px' }}>
              <img src={logoSvg} alt="LuxQMK" className="sidebar-logo-img" />
            </div>
            <div>
              <h3 className="modal-title">{t('modalAboutTitle')}</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Version 1.4.1-dev</span>
            </div>
          </div>
          <button className="modal-close-btn" id="btnCloseAboutModal" onClick={() => setAboutOpen(false)}>
            &times;
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* 1. Author */}
          <div className="modal-section">
            <div className="modal-section-title">
              <span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </span>
              <span>{t('lblAuthorTitle')}</span>
            </div>
            <div className="modal-section-content">
              <strong style={{ fontSize: '1.05rem', color: '#ffffff' }}>{t('lblAuthorName')}</strong>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                {t('lblAuthorRole')}
              </p>
            </div>
          </div>

          {/* 2. Website */}
          <div className="modal-section">
            <div className="modal-section-title">
              <span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
              </span>
              <span>{t('lblWebsiteTitle')}</span>
            </div>
            <div className="modal-section-content">
              <a
                href="https://luxqmk.click"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--secondary)', textDecoration: 'underline', fontWeight: 600 }}
              >
                luxqmk.click
              </a>
            </div>
          </div>

          {/* 3. GitHub */}
          <div className="modal-section">
            <div className="modal-section-title">
              <span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                </svg>
              </span>
              <span>{t('lblGithubTitle')}</span>
            </div>
            <div className="modal-section-content">
              <a
                href="https://github.com/LuxQMK"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--secondary)', textDecoration: 'underline', fontWeight: 600 }}
              >
                github.com/LuxQMK
              </a>
            </div>
          </div>

          {/* 4. Legal */}
          <div className="modal-section">
            <div className="modal-section-title">
              <span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </span>
              <span>{t('lblLegalTitle')}</span>
            </div>
            <div
              className="modal-section-content"
              style={{ fontSize: '0.78rem', color: 'var(--text-dim)', lineHeight: 1.55 }}
              dangerouslySetInnerHTML={{ __html: t('lblLegalDesc') }}
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="btn btn-primary" id="btnOkAboutModal" style={{ minWidth: '90px' }} onClick={() => setAboutOpen(false)}>
            {t('btnOk')}
          </button>
        </div>
      </div>
    </div>
  );
};
