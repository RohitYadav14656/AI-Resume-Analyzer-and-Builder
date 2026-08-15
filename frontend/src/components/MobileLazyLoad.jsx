import React, { useState, useEffect, useRef } from 'react';

export default function MobileLazyLoad({ children }) {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth <= 768 : false);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile(); // Check immediately on mount
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // If not mobile, it's always visible
    if (!isMobile) {
      setIsVisible(true);
      return;
    }

    // If already visible, don't re-observe
    if (isVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '150px' } // Load slightly before it comes into view
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [isMobile, isVisible]);

  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <div ref={ref} style={{ minHeight: isVisible ? 'auto' : '200px', width: '100%' }}>
      {isVisible ? children : (
        <div style={{ padding: "4rem 1.5rem", display: "flex", flexDirection: "column", gap: "2rem", opacity: 0.7 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
            <div className="skeleton skeleton-title" style={{ width: "50%", height: "2rem", margin: 0, borderRadius: "8px" }}></div>
            <div className="skeleton skeleton-text" style={{ width: "80%" }}></div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div className="skeleton" style={{ height: "140px", borderRadius: "16px", width: "100%" }}></div>
            <div className="skeleton" style={{ height: "140px", borderRadius: "16px", width: "100%" }}></div>
          </div>
        </div>
      )}
    </div>
  );
}
