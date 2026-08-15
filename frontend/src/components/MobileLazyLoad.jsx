import React, { useState, useEffect, useRef } from 'react';

export default function MobileLazyLoad({ children }) {
  const [isMobile, setIsMobile] = useState(false);
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
    <div ref={ref} style={{ minHeight: isVisible ? 'auto' : '200px' }}>
      {isVisible ? children : null}
    </div>
  );
}
