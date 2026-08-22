import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHoveringManage, setIsHoveringManage] = useState(false);
  const [isHoveringReject, setIsHoveringReject] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      // Delay showing the banner slightly for better UX
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('cookieConsent', 'all');
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    localStorage.setItem('cookieConsent', 'rejected');
    setIsVisible(false);
  };

  const handleManage = () => {
    // For now, this just accepts necessary cookies and dismisses the banner
    localStorage.setItem('cookieConsent', 'necessary');
    setIsVisible(false);
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
    transition: 'all 0.2s',
  };

  return (
    <>
      <style>{`
        .cookie-consent-banner {
          position: fixed;
          bottom: 16px;
          left: 50%;
          transform: translateX(-50%);
          width: calc(100% - 32px);
          max-width: 800px;
          z-index: 9999;
          background: rgba(28, 21, 18, 0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(217, 119, 6, 0.25);
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.3);
          padding: 0.8rem 1.2rem;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap; /* Allows wrapping on any intermediate laptop/tablet screen */
        }
        
        .cookie-content {
          display: flex;
          align-items: flex-start;
          gap: 0.8rem;
          flex: 1 1 300px;
          min-width: 250px;
        }

        .cookie-buttons {
          display: flex;
          gap: 0.6rem;
          flex-wrap: wrap;
          align-items: center;
          justify-content: flex-end;
          flex: 1 0 auto;
        }

        @media (max-width: 768px) {
          .cookie-consent-banner {
            bottom: 0;
            left: 0;
            transform: none;
            width: 100%;
            max-width: 100%;
            padding: 0.8rem 1rem 1rem 1rem;
            flex-direction: column;
            gap: 0.8rem;
            border-radius: 0;
            border: none;
            border-top: 1px solid rgba(217, 119, 6, 0.3);
            background: rgba(28, 21, 18, 0.98);
          }
          .cookie-content {
            flex-direction: row;
            align-items: center;
            text-align: left;
            gap: 0.5rem;
          }
          .cookie-title {
            font-size: 0.85rem !important;
            margin: 0 !important;
          }
          .cookie-desc {
            display: none !important;
          }
          .cookie-icon-wrapper {
            padding: 0 !important;
            background: transparent !important;
            border: none !important;
          }
          .cookie-buttons {
            display: flex;
            flex-direction: row;
            gap: 0.4rem;
            width: 100%;
          }
          .cookie-buttons button {
            flex: 1;
            padding: 0.5rem 0.2rem;
            font-size: 0.75rem;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
          }
          .cookie-buttons button:nth-child(3) {
            flex: 1;
            padding: 0.5rem 0.2rem;
            font-size: 0.75rem;
          }
        }
      `}</style>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            className="cookie-consent-banner"
            initial={{ y: 150, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 150, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="cookie-content">
              <div className="cookie-icon-wrapper" style={{ 
                background: 'rgba(217, 119, 6, 0.15)', 
                padding: '0.5rem', 
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(217, 119, 6, 0.2)',
                flexShrink: 0
              }}>
                <ShieldCheck size={20} color="var(--accent, #d97706)" />
              </div>
              <div>
                <h3 className="cookie-title" style={{ margin: '0 0 0.2rem 0', fontSize: '0.9rem', color: 'var(--text, #fff)', fontWeight: 700 }}>
                  We value your privacy
                </h3>
                <p className="cookie-desc" style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted, #a3a3a3)', lineHeight: 1.5 }}>
                  We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
                </p>
              </div>
            </div>
            
            <div className="cookie-buttons">
              <button
                onClick={handleManage}
                style={{
                  ...secondaryBtnStyle,
                  background: isHoveringManage ? 'rgba(255, 255, 255, 0.08)' : 'transparent'
                }}
                onMouseEnter={() => setIsHoveringManage(true)}
                onMouseLeave={() => setIsHoveringManage(false)}
              >
                Manage Cookies
              </button>
              <button
                onClick={handleRejectAll}
                style={{
                  ...secondaryBtnStyle,
                  background: isHoveringReject ? 'rgba(255, 255, 255, 0.08)' : 'transparent'
                }}
                onMouseEnter={() => setIsHoveringReject(true)}
                onMouseLeave={() => setIsHoveringReject(false)}
              >
                Reject All
              </button>
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
                  whiteSpace: 'nowrap'
                }}
              >
                Accept All
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
