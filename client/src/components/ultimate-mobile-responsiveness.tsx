import { useEffect, useState, useCallback } from 'react';

/**
 * Ultimate Mobile Responsiveness Component
 * Provides comprehensive mobile optimization including:
 * - Touch-friendly gestures and interactions
 * - Perfect scroll behavior with swipe support
 * - Zoom-unzoom friendly interface
 * - 100% responsive design across all devices
 */
export default function UltimateMobileResponsiveness() {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    isIOS: false,
    isAndroid: false,
    isTouchDevice: false,
    screenWidth: 0,
    screenHeight: 0,
    orientation: 'portrait' as 'portrait' | 'landscape',
    pixelRatio: 1,
  });

  const [gestureState, setGestureState] = useState({
    isScrolling: false,
    isSwiping: false,
    swipeDirection: null as 'left' | 'right' | 'up' | 'down' | null,
    lastTouchTime: 0,
  });

  // Detect device capabilities and characteristics
  const detectDevice = useCallback(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const userAgent = navigator.userAgent;
    const pixelRatio = window.devicePixelRatio || 1;

    setDeviceInfo({
      isMobile: width < 768,
      isTablet: width >= 768 && width < 1024,
      isIOS: /iPhone|iPad|iPod/.test(userAgent),
      isAndroid: /Android/.test(userAgent),
      isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      screenWidth: width,
      screenHeight: height,
      orientation: width > height ? 'landscape' : 'portrait',
      pixelRatio,
    });
  }, []);

  // Initialize device detection
  useEffect(() => {
    detectDevice();

    const handleResize = () => {
      setTimeout(detectDevice, 100);
    };

    const handleOrientationChange = () => {
      setTimeout(detectDevice, 300);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [detectDevice]);

  // Apply comprehensive mobile optimizations
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'ultimate-mobile-responsiveness';
    style.textContent = `
      /* Reset and base optimizations */
      * {
        -webkit-tap-highlight-color: transparent;
        -webkit-touch-callout: none;
        -webkit-text-size-adjust: 100%;
        text-size-adjust: 100%;
        box-sizing: border-box;
      }

      /* Root level optimizations */
      html {
        scroll-behavior: smooth;
        -webkit-overflow-scrolling: touch;
        overflow-scrolling: touch;
        height: 100%;
        height: -webkit-fill-available;
      }

      body {
        min-height: 100vh;
        min-height: -webkit-fill-available;
        overflow-x: hidden;
        -webkit-overflow-scrolling: touch;
        scroll-behavior: smooth;
        font-smooth: always;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      /* Perfect viewport handling */
      @media screen and (max-width: 768px) {
        html, body {
          width: 100%;
          max-width: 100vw;
          position: relative;
        }

        /* Fix iOS Safari viewport issues */
        .mobile-full-height {
          min-height: 100vh;
          min-height: -webkit-fill-available;
          min-height: calc(var(--vh, 1vh) * 100);
        }

        /* Prevent horizontal scroll */
        * {
          max-width: 100%;
        }

        img, video, iframe, object, embed {
          max-width: 100%;
          height: auto;
        }
      }

      /* Touch-friendly interactions */
      .touch-friendly {
        touch-action: manipulation;
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
      }

      /* Perfect touch targets */
      @media (max-width: 768px) {
        button, 
        [role="button"],
        input[type="button"],
        input[type="submit"],
        input[type="reset"],
        .btn,
        .touch-target {
          min-height: 48px !important;
          min-width: 48px !important;
          padding: 12px 16px !important;
          touch-action: manipulation !important;
          position: relative;
          cursor: pointer;
        }

        /* Larger touch targets for small elements */
        .touch-target-small::before {
          content: '';
          position: absolute;
          top: -8px;
          left: -8px;
          right: -8px;
          bottom: -8px;
          z-index: -1;
        }

        /* Form elements optimization */
        input, 
        textarea, 
        select {
          min-height: 48px !important;
          font-size: 16px !important; /* Prevents zoom on iOS */
          padding: 12px 16px !important;
          border-radius: 8px !important;
          border: 2px solid #e5e7eb !important;
          transition: all 0.2s ease !important;
        }

        input:focus, 
        textarea:focus, 
        select:focus {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
          outline: none !important;
        }
      }

      /* Gesture and swipe support */
      .swipe-container {
        touch-action: pan-x pan-y;
        -webkit-overflow-scrolling: touch;
        overflow-scrolling: touch;
        scroll-snap-type: x mandatory;
        scrollbar-width: none;
        -ms-overflow-style: none;
      }

      .swipe-container::-webkit-scrollbar {
        display: none;
      }

      .swipe-item {
        scroll-snap-align: start;
        scroll-snap-stop: always;
        touch-action: pan-x pan-y;
      }

      /* Perfect smooth scrolling */
      .smooth-scroll {
        scroll-behavior: smooth;
        -webkit-overflow-scrolling: touch;
        overflow-scrolling: touch;
      }

      /* Zoom and pinch optimizations */
      @media (max-width: 768px) {
        /* Allow zoom but prevent layout issues */
        .zoom-friendly {
          transform-origin: center center;
          transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        /* Prevent unwanted zoom on double tap */
        .no-zoom {
          touch-action: manipulation;
        }

        /* Image zoom support */
        .zoomable-image {
          touch-action: pinch-zoom;
          cursor: zoom-in;
          transition: transform 0.3s ease;
        }

        .zoomable-image:hover,
        .zoomable-image:focus {
          transform: scale(1.05);
        }
      }

      /* Perfect modal and overlay handling */
      @media (max-width: 768px) {
        .mobile-modal {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          height: -webkit-fill-available !important;
          margin: 0 !important;
          padding: 16px !important;
          border-radius: 0 !important;
          transform: none !important;
          max-width: none !important;
          max-height: none !important;
          overflow-y: auto !important;
          -webkit-overflow-scrolling: touch !important;
        }

        .mobile-modal-content {
          padding: 20px !important;
          margin-top: 40px !important; /* Space for status bar */
          margin-bottom: 20px !important;
        }

        /* Sheet-style modals for mobile */
        .mobile-sheet {
          position: fixed !important;
          bottom: 0 !important;
          left: 0 !important;
          right: 0 !important;
          top: auto !important;
          transform: none !important;
          border-radius: 16px 16px 0 0 !important;
          max-height: 90vh !important;
          margin: 0 !important;
          width: 100% !important;
          max-width: none !important;
        }
      }

      /* Advanced responsive grid system */
      .responsive-grid {
        display: grid;
        gap: 1rem;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      }

      @media (max-width: 640px) {
        .responsive-grid {
          grid-template-columns: 1fr;
          gap: 0.75rem;
        }

        .responsive-grid-2 {
          grid-template-columns: repeat(2, 1fr);
          gap: 0.5rem;
        }
      }

      @media (max-width: 480px) {
        .responsive-grid {
          grid-template-columns: 1fr;
          gap: 0.5rem;
        }

        .responsive-grid-2 {
          grid-template-columns: 1fr;
          gap: 0.5rem;
        }
      }

      /* Perfect typography scaling */
      @media (max-width: 640px) {
        .responsive-text-sm {
          font-size: clamp(0.75rem, 2.5vw, 0.875rem);
        }

        .responsive-text-base {
          font-size: clamp(0.875rem, 3vw, 1rem);
        }

        .responsive-text-lg {
          font-size: clamp(1rem, 3.5vw, 1.125rem);
        }

        .responsive-text-xl {
          font-size: clamp(1.125rem, 4vw, 1.25rem);
        }

        .responsive-text-2xl {
          font-size: clamp(1.25rem, 5vw, 1.5rem);
        }

        .responsive-text-3xl {
          font-size: clamp(1.5rem, 6vw, 1.875rem);
        }

        .responsive-text-4xl {
          font-size: clamp(1.875rem, 7vw, 2.25rem);
        }
      }

      /* Perfect spacing system */
      @media (max-width: 640px) {
        .responsive-p-4 { padding: clamp(0.75rem, 4vw, 1rem); }
        .responsive-p-6 { padding: clamp(1rem, 5vw, 1.5rem); }
        .responsive-p-8 { padding: clamp(1.25rem, 6vw, 2rem); }
        .responsive-m-4 { margin: clamp(0.75rem, 4vw, 1rem); }
        .responsive-m-6 { margin: clamp(1rem, 5vw, 1.5rem); }
        .responsive-m-8 { margin: clamp(1.25rem, 6vw, 2rem); }
      }

      /* Safe area handling for notched devices */
      @supports (padding: env(safe-area-inset-top)) {
        .safe-area-top {
          padding-top: env(safe-area-inset-top);
        }

        .safe-area-bottom {
          padding-bottom: env(safe-area-inset-bottom);
        }

        .safe-area-left {
          padding-left: env(safe-area-inset-left);
        }

        .safe-area-right {
          padding-right: env(safe-area-inset-right);
        }

        .safe-area-inset {
          padding-top: env(safe-area-inset-top);
          padding-bottom: env(safe-area-inset-bottom);
          padding-left: env(safe-area-inset-left);
          padding-right: env(safe-area-inset-right);
        }
      }

      /* Performance optimizations */
      .mobile-optimized {
        -webkit-backface-visibility: hidden;
        backface-visibility: hidden;
        -webkit-perspective: 1000px;
        perspective: 1000px;
        transform: translateZ(0);
      }

      .mobile-optimized * {
        will-change: auto;
      }

      .mobile-optimized .animate,
      .mobile-optimized .transition {
        will-change: transform, opacity;
      }

      /* Disable problematic hover effects on touch devices */
      @media (hover: none) and (pointer: coarse) {
        .hover\\:scale-105:hover,
        .hover\\:scale-110:hover,
        .group-hover\\:scale-105,
        .group-hover\\:scale-110 {
          transform: none !important;
        }

        .hover\\:shadow-lg:hover,
        .hover\\:shadow-xl:hover {
          box-shadow: inherit !important;
        }

        .card-hover:hover {
          transform: none !important;
        }
      }

      /* Perfect button interactions for mobile */
      @media (max-width: 768px) {
        .mobile-button {
          touch-action: manipulation;
          user-select: none;
          position: relative;
          overflow: hidden;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .mobile-button:active {
          transform: scale(0.98);
          transition-duration: 0.1s;
        }

        .mobile-button::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.3);
          transform: translate(-50%, -50%);
          transition: width 0.3s ease, height 0.3s ease;
        }

        .mobile-button:active::before {
          width: 200px;
          height: 200px;
        }
      }

      /* Perfect carousel and slider handling */
      .mobile-carousel {
        touch-action: pan-x;
        scroll-snap-type: x mandatory;
        scrollbar-width: none;
        -ms-overflow-style: none;
        -webkit-overflow-scrolling: touch;
        overflow-scrolling: touch;
      }

      .mobile-carousel::-webkit-scrollbar {
        display: none;
      }

      .mobile-carousel-item {
        scroll-snap-align: center;
        scroll-snap-stop: always;
        flex-shrink: 0;
      }

      /* Perfect loading states */
      @media (max-width: 768px) {
        .mobile-skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      }

      /* Dark mode optimizations */
      @media (prefers-color-scheme: dark) {
        .mobile-skeleton {
          background: linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%);
          background-size: 200% 100%;
        }
      }

      /* High contrast mode support */
      @media (prefers-contrast: high) {
        button, .btn {
          border: 2px solid currentColor !important;
        }

        .card, .modal {
          border: 2px solid currentColor !important;
        }
      }

      /* Reduced motion preferences */
      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }
      }

      /* Print optimizations */
      @media print {
        .mobile-only, .desktop-only {
          display: none !important;
        }
      }
    `;

    // Remove existing styles and add new ones
    const existingStyles = document.getElementById('ultimate-mobile-responsiveness');
    if (existingStyles) {
      existingStyles.remove();
    }
    document.head.appendChild(style);

    return () => {
      const styles = document.getElementById('ultimate-mobile-responsiveness');
      if (styles) {
        styles.remove();
      }
    };
  }, []);

  // Handle device-specific optimizations
  useEffect(() => {
    // Apply device classes
    document.body.classList.toggle('mobile-device', deviceInfo.isMobile);
    document.body.classList.toggle('tablet-device', deviceInfo.isTablet);
    document.body.classList.toggle('touch-device', deviceInfo.isTouchDevice);
    document.body.classList.toggle('ios-device', deviceInfo.isIOS);
    document.body.classList.toggle('android-device', deviceInfo.isAndroid);
    document.body.classList.toggle('mobile-optimized', deviceInfo.isMobile || deviceInfo.isTablet);

    // Set CSS custom properties
    document.documentElement.style.setProperty('--screen-width', `${deviceInfo.screenWidth}px`);
    document.documentElement.style.setProperty('--screen-height', `${deviceInfo.screenHeight}px`);
    document.documentElement.style.setProperty('--pixel-ratio', deviceInfo.pixelRatio.toString());

    // iOS-specific optimizations
    if (deviceInfo.isIOS) {
      // Fix viewport height issues
      const setVH = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
      };
      
      setVH();
      window.addEventListener('resize', setVH);
      window.addEventListener('orientationchange', setVH);

      // Prevent elastic scrolling
      document.body.style.overscrollBehavior = 'none';
      
      return () => {
        window.removeEventListener('resize', setVH);
        window.removeEventListener('orientationchange', setVH);
      };
    }

    // Android-specific optimizations
    if (deviceInfo.isAndroid) {
      // Handle keyboard appearance
      const handleKeyboard = () => {
        if (document.activeElement?.tagName === 'INPUT' || 
            document.activeElement?.tagName === 'TEXTAREA') {
          setTimeout(() => {
            document.activeElement?.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center' 
            });
          }, 300);
        }
      };

      window.addEventListener('resize', handleKeyboard);
      
      return () => {
        window.removeEventListener('resize', handleKeyboard);
      };
    }
  }, [deviceInfo]);

  // Handle gesture detection
  useEffect(() => {
    if (!deviceInfo.isTouchDevice) return;

    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
      setGestureState(prev => ({ ...prev, isScrolling: false, isSwiping: false }));
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartTime) return;

      const touchX = e.touches[0].clientX;
      const touchY = e.touches[0].clientY;
      const deltaX = touchX - touchStartX;
      const deltaY = touchY - touchStartY;
      const deltaTime = Date.now() - touchStartTime;

      // Detect swipe gestures
      if (deltaTime > 50 && (Math.abs(deltaX) > 30 || Math.abs(deltaY) > 30)) {
        const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);
        
        if (isHorizontalSwipe) {
          setGestureState(prev => ({
            ...prev,
            isSwiping: true,
            swipeDirection: deltaX > 0 ? 'right' : 'left'
          }));
        } else {
          setGestureState(prev => ({
            ...prev,
            isScrolling: true,
            swipeDirection: deltaY > 0 ? 'down' : 'up'
          }));
        }
      }
    };

    const handleTouchEnd = () => {
      setTimeout(() => {
        setGestureState(prev => ({
          ...prev,
          isScrolling: false,
          isSwiping: false,
          swipeDirection: null,
          lastTouchTime: Date.now()
        }));
      }, 100);
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [deviceInfo.isTouchDevice]);

  // Handle scroll optimizations
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          // Optimize scroll performance
          const scrollTop = window.pageYOffset;
          document.documentElement.style.setProperty('--scroll-y', scrollTop.toString());
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return null;
}