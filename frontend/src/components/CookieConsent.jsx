import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X } from 'lucide-react';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false
  });

  const [isHoveringManage, setIsHoveringManage] = useState(false);
  const [isHoveringReject, setIsHoveringReject] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');

    if (!consent) {
      // Delay showing the banner slightly for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);

      return () => clearTimeout(timer);
    } else {
      try {
        const parsed = JSON.parse(consent);

        if (parsed && typeof parsed === 'object') {
          setPreferences({
            necessary: true,
            analytics: !!parsed.analytics,
            marketing: !!parsed.marketing
          });
        }
      } catch (e) {
        // Handle legacy string values
        if (consent === 'all') {
          setPreferences({
            necessary: true,
            analytics: true,
            marketing: true
          });
        } else if (consent === 'rejected' || consent === 'necessary') {
          setPreferences({
            necessary: true,
            analytics: false,
            marketing: false
          });
        }
      }
    }
  }, []);

  const handleAcceptAll = () => {
    const allPrefs = {
      necessary: true,
      analytics: true,
      marketing: true
    };

    setPreferences(allPrefs);
    localStorage.setItem('cookieConsent', JSON.stringify(allPrefs));
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    const rejectPrefs = {
      necessary: true,
      analytics: false,
      marketing: false
    };

    setPreferences(rejectPrefs);
    localStorage.setItem('cookieConsent', JSON.stringify(rejectPrefs));
    setIsVisible(false);
  };

  const handleManage = () => {
    setShowModal(true);
  };

  const handleSavePreferences = () => {
    localStorage.setItem(
      'cookieConsent',
      JSON.stringify(preferences)
    );

    setShowModal(false);
    setIsVisible(false);
  };

  const togglePreference = (key) => {
    if (key === 'necessary') return;

    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const secondaryBtnStyle = {
    background: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    color: 'var(--text, #fff)',
    padding: '0.4rem 0.8rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: 600,
    transition: 'all 0.2s'
  };

  return (
    <>
      <style>{`
        /* =========================================
           COOKIE CONSENT BANNER
           ========================================= */

        .cookie-consent-banner {
          position: fixed;
          bottom: 16px;
          left: 16px;
          right: 16px;

          width: auto;
          max-width: 800px;
          margin: 0 auto;

          z-index: 9999;

          background: rgba(28, 21, 18, 0.85);

          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);

          border: 1px solid rgba(217, 119, 6, 0.25);
          border-radius: 12px;

          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);

          padding: 0.8rem 1.2rem;

          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;

          gap: 1rem;
          flex-wrap: wrap;

          box-sizing: border-box;
        }

        .cookie-content {
          display: flex;
          align-items: flex-start;

          gap: 0.8rem;

          flex: 1 1 300px;

          min-width: 0;

          box-sizing: border-box;
        }

        .cookie-buttons {
          display: flex;

          gap: 0.6rem;

          flex-wrap: wrap;

          align-items: center;
          justify-content: flex-end;

          flex: 0 1 auto;

          min-width: 0;

          box-sizing: border-box;
        }

        /* =========================================
           COOKIE MODAL
           ========================================= */

        .cookie-modal-overlay {
          position: fixed;

          top: 0;
          left: 0;
          right: 0;
          bottom: 0;

          background: rgba(0, 0, 0, 0.6);

          backdrop-filter: blur(4px);

          z-index: 10000;

          display: flex;

          align-items: center;
          justify-content: center;

          padding: 1rem;

          box-sizing: border-box;
        }

        .cookie-modal-content {
          background: rgba(28, 21, 18, 0.95);

          border: 1px solid rgba(217, 119, 6, 0.3);

          border-radius: 16px;

          width: 100%;
          max-width: 500px;

          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);

          display: flex;
          flex-direction: column;

          overflow: hidden;

          box-sizing: border-box;
        }

        .cookie-modal-header {
          padding: 1.25rem 1.5rem;

          border-bottom: 1px solid rgba(255, 255, 255, 0.1);

          display: flex;

          justify-content: space-between;
          align-items: center;
        }

        .cookie-modal-title {
          font-size: 1.1rem;

          font-weight: 700;

          color: white;

          margin: 0;

          display: flex;

          align-items: center;

          gap: 0.5rem;
        }

        .cookie-modal-close {
          background: transparent;

          border: none;

          color: rgba(255, 255, 255, 0.6);

          cursor: pointer;

          display: flex;

          align-items: center;
          justify-content: center;

          padding: 0.25rem;

          border-radius: 4px;

          transition: all 0.2s;
        }

        .cookie-modal-close:hover {
          color: white;

          background: rgba(255, 255, 255, 0.1);
        }

        .cookie-modal-body {
          padding: 1.5rem;

          display: flex;
          flex-direction: column;

          gap: 1.25rem;

          max-height: 60vh;

          overflow-y: auto;
        }

        .cookie-option {
          display: flex;

          justify-content: space-between;
          align-items: flex-start;

          gap: 1rem;

          padding: 1rem;

          border-radius: 8px;

          background: rgba(255, 255, 255, 0.03);

          border: 1px solid rgba(255, 255, 255, 0.05);

          transition: all 0.2s;
        }

        .cookie-option:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .cookie-option-info h4 {
          margin: 0 0 0.25rem 0;

          color: white;

          font-size: 0.95rem;
        }

        .cookie-option-info p {
          margin: 0;

          color: var(--text-muted, #a3a3a3);

          font-size: 0.8rem;

          line-height: 1.4;
        }

        /* =========================================
           TOGGLE SWITCH
           ========================================= */

        .toggle-switch {
          position: relative;

          display: inline-block;

          width: 44px;
          height: 24px;

          flex-shrink: 0;
        }

        .toggle-switch input {
          opacity: 0;

          width: 0;
          height: 0;
        }

        .toggle-slider {
          position: absolute;

          cursor: pointer;

          top: 0;
          left: 0;
          right: 0;
          bottom: 0;

          background-color: rgba(255, 255, 255, 0.2);

          transition: 0.3s;

          border-radius: 24px;
        }

        .toggle-slider:before {
          position: absolute;

          content: "";

          height: 18px;
          width: 18px;

          left: 3px;
          bottom: 3px;

          background-color: white;

          transition: 0.3s;

          border-radius: 50%;
        }

        input:checked + .toggle-slider {
          background-color: var(--accent, #d97706);
        }

        input:disabled + .toggle-slider {
          opacity: 0.5;

          cursor: not-allowed;
        }

        input:checked + .toggle-slider:before {
          transform: translateX(20px);
        }

        /* =========================================
           MODAL FOOTER
           ========================================= */

        .cookie-modal-footer {
          padding: 1.25rem 1.5rem;

          border-top: 1px solid rgba(255, 255, 255, 0.1);

          display: flex;

          justify-content: flex-end;

          gap: 0.75rem;

          background: rgba(0, 0, 0, 0.2);
        }

        /* =========================================
           MOBILE
           
           Cookie banner is COMPLETELY HIDDEN
           on screens 768px and below.
           ========================================= */

        @media (max-width: 768px) {
          .cookie-consent-banner {
            display: none !important;
          }

          .cookie-modal-overlay {
            display: none !important;
          }
        }
      `}</style>

      {/* =========================================
          COOKIE CONSENT BANNER
          ========================================= */}

      <AnimatePresence>
        {isVisible && !showModal && (
          <motion.div
            className="cookie-consent-banner"
            initial={{
              y: 150,
              opacity: 0
            }}
            animate={{
              y: 0,
              opacity: 1
            }}
            exit={{
              y: 150,
              opacity: 0
            }}
            transition={{
              duration: 0.5,
              ease: [0.22, 1, 0.36, 1]
            }}
          >
            <div className="cookie-content">

              <div
                className="cookie-icon-wrapper"
                style={{
                  background: 'rgba(217, 119, 6, 0.15)',
                  padding: '0.5rem',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(217, 119, 6, 0.2)',
                  flexShrink: 0
                }}
              >
                <ShieldCheck
                  size={20}
                  color="var(--accent, #d97706)"
                />
              </div>

              <div>
                <h3
                  className="cookie-title"
                  style={{
                    margin: '0 0 0.2rem 0',
                    fontSize: '0.9rem',
                    color: 'var(--text, #fff)',
                    fontWeight: 700
                  }}
                >
                  We value your privacy
                </h3>

                <p
                  className="cookie-desc"
                  style={{
                    margin: 0,
                    fontSize: '0.75rem',
                    color: 'var(--text-muted, #a3a3a3)',
                    lineHeight: 1.5
                  }}
                >
                  We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
                </p>
              </div>
            </div>

            <div className="cookie-buttons">

              {/* Manage Cookies */}
              <button
                onClick={handleManage}
                style={{
                  ...secondaryBtnStyle,
                  background: isHoveringManage
                    ? 'rgba(255, 255, 255, 0.08)'
                    : 'transparent'
                }}
                onMouseEnter={() => setIsHoveringManage(true)}
                onMouseLeave={() => setIsHoveringManage(false)}
              >
                Manage Cookies
              </button>

              {/* Reject All */}
              <button
                onClick={handleRejectAll}
                style={{
                  ...secondaryBtnStyle,
                  background: isHoveringReject
                    ? 'rgba(255, 255, 255, 0.08)'
                    : 'transparent'
                }}
                onMouseEnter={() => setIsHoveringReject(true)}
                onMouseLeave={() => setIsHoveringReject(false)}
              >
                Reject All
              </button>

              {/* Accept All */}
              <button
                className="glow-btn"
                onClick={handleAcceptAll}
                style={{
                  padding: '0.4rem 1rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  color: 'white',
                  whiteSpace: 'nowrap',
                  background: 'var(--accent, #d97706)'
                }}
              >
                Accept All
              </button>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================
          COOKIE PREFERENCES MODAL
          ========================================= */}

      <AnimatePresence>
        {showModal && (
          <motion.div
            className="cookie-modal-overlay"
            initial={{
              opacity: 0
            }}
            animate={{
              opacity: 1
            }}
            exit={{
              opacity: 0
            }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              className="cookie-modal-content"
              initial={{
                scale: 0.95,
                opacity: 0,
                y: 20
              }}
              animate={{
                scale: 1,
                opacity: 1,
                y: 0
              }}
              exit={{
                scale: 0.95,
                opacity: 0,
                y: 20
              }}
              transition={{
                type: 'spring',
                bounce: 0.2,
                duration: 0.4
              }}
              onClick={(e) => e.stopPropagation()}
            >

              {/* Modal Header */}
              <div className="cookie-modal-header">

                <h3 className="cookie-modal-title">
                  <ShieldCheck
                    size={20}
                    color="var(--accent, #d97706)"
                  />

                  Cookie Preferences
                </h3>

                <button
                  className="cookie-modal-close"
                  onClick={() => setShowModal(false)}
                >
                  <X size={20} />
                </button>

              </div>

              {/* Modal Body */}
              <div className="cookie-modal-body">

                {/* Necessary Cookies */}
                <div className="cookie-option">

                  <div className="cookie-option-info">

                    <h4>
                      Strictly Necessary
                    </h4>

                    <p>
                      These cookies are required for the website to function correctly and cannot be disabled.
                    </p>

                  </div>

                  <label className="toggle-switch">

                    <input
                      type="checkbox"
                      checked={preferences.necessary}
                      disabled
                    />

                    <span className="toggle-slider"></span>

                  </label>

                </div>

                {/* Analytics Cookies */}
                <div className="cookie-option">

                  <div className="cookie-option-info">

                    <h4>
                      Analytics Cookies
                    </h4>

                    <p>
                      Help us understand how visitors interact with the website by collecting reporting information anonymously.
                    </p>

                  </div>

                  <label className="toggle-switch">

                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={() =>
                        togglePreference('analytics')
                      }
                    />

                    <span className="toggle-slider"></span>

                  </label>

                </div>

                {/* Marketing Cookies */}
                <div className="cookie-option">

                  <div className="cookie-option-info">

                    <h4>
                      Marketing Cookies
                    </h4>

                    <p>
                      Used to track visitors across websites to display relevant advertisements.
                    </p>

                  </div>

                  <label className="toggle-switch">

                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={() =>
                        togglePreference('marketing')
                      }
                    />

                    <span className="toggle-slider"></span>

                  </label>

                </div>

              </div>

              {/* Modal Footer */}
              <div className="cookie-modal-footer">

                <button
                  onClick={handleRejectAll}
                  style={{
                    ...secondaryBtnStyle,
                    padding: '0.5rem 1rem'
                  }}
                >
                  Reject All
                </button>

                <button
                  className="glow-btn"
                  onClick={handleSavePreferences}
                  style={{
                    padding: '0.5rem 1.25rem',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    color: 'white',
                    background: 'var(--accent, #d97706)'
                  }}
                >
                  Save Preferences
                </button>

              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
