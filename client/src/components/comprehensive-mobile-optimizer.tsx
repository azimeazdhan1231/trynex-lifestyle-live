import { useEffect, useState } from 'react';

/**
 * Comprehensive Mobile Optimizer
 * Addresses all mobile UI issues including choppy animations, pricing displays, and touch interactions
 */
export default function ComprehensiveMobileOptimizer() {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    isIOS: false,
    isAndroid: false,
    screenWidth: 0,
    screenHeight: 0,
  });

  useEffect(() => {
    const detectDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const userAgent = navigator.userAgent;

      setDeviceInfo({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isIOS: /iPhone|iPad|iPod/.test(userAgent),
        isAndroid: /Android/.test(userAgent),
        screenWidth: width,
        screenHeight: height,
      });
    };

    // Initial detection
    detectDevice();

    // Listen for orientation changes and resizes
    const handleResize = () => {
      setTimeout(detectDevice, 100); // Small delay for accurate measurements
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  useEffect(() => {
    // Apply comprehensive mobile optimizations
    const optimizeMobileExperience = () => {
      // Prevent choppy animations on mobile
      const style = document.createElement('style');
      style.id = 'mobile-optimizer-styles';
      style.textContent = `
        /* Fix choppy mobile animations */
        * {
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
          -webkit-perspective: 1000;
          perspective: 1000;
          -webkit-transform: translate3d(0,0,0);
          transform: translate3d(0,0,0);
        }

        /* Optimize mobile scrolling */
        body, html {
          -webkit-overflow-scrolling: touch;
          scroll-behavior: smooth;
        }

        /* Fix modal positioning on mobile */
        @media (max-width: 768px) {
          [data-radix-dialog-content] {
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

        /* Better mobile pricing display */
        .cart-total,
        .price-display {
          font-feature-settings: "tnum";
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        /* Fix mobile touch targets */
        @media (max-width: 768px) {
          button, 
          [role="button"],
          input,
          select,
          textarea {
            min-height: 44px !important;
            min-width: 44px !important;
            touch-action: manipulation !important;
          }
        }

        /* Prevent zoom on input focus (iOS) */
        @media (max-width: 768px) {
          input, 
          textarea, 
          select {
            font-size: 16px !important;
            transform: translateZ(0);
          }
        }

        /* Smooth mobile cart animations */
        .cart-item {
          will-change: transform;
          transform: translateZ(0);
        }

        /* Fix mobile hover states */
        @media (hover: none) and (pointer: coarse) {
          .hover\\:scale-105:hover {
            transform: none !important;
          }
          
          .hover\\:shadow-lg:hover {
            box-shadow: inherit !important;
          }
          
          .card-hover:hover {
            transform: none !important;
          }
        }

        /* Mobile-specific card optimizations */
        @media (max-width: 640px) {
          .product-card {
            transform: translateZ(0);
            will-change: auto;
          }
          
          .product-card:active {
            transform: scale(0.98) translateZ(0);
            transition: transform 0.1s ease;
          }
        }

        /* Fix mobile modal backdrop */
        [data-radix-dialog-overlay] {
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
        }

        /* Optimize mobile typography */
        @media (max-width: 480px) {
          .responsive-text {
            font-size: clamp(0.875rem, 2.5vw, 1rem);
            line-height: 1.4;
          }
          
          .responsive-title {
            font-size: clamp(1.125rem, 4vw, 1.5rem);
            line-height: 1.3;
          }
          
          .responsive-price {
            font-size: clamp(1rem, 3.5vw, 1.25rem);
            font-weight: 600;
            letter-spacing: -0.025em;
          }
        }

        /* Fix safe areas for notched devices */
        @supports (padding: env(safe-area-inset-bottom)) {
          .mobile-safe-area {
            padding-bottom: env(safe-area-inset-bottom);
          }
          
          .mobile-safe-area-top {
            padding-top: env(safe-area-inset-top);
          }
        }

        /* Optimize mobile grid layouts */
        @media (max-width: 640px) {
          .mobile-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem;
          }
          
          .mobile-grid-item {
            min-width: 0;
            overflow: hidden;
          }
        }

        /* Better mobile button spacing */
        @media (max-width: 480px) {
          .mobile-button-group {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }
          
          .mobile-button-group button {
            width: 100%;
            padding: 0.75rem 1rem;
          }
        }

        /* Smooth mobile transitions */
        .mobile-transition {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Fix Android Chrome address bar issues */
        @media screen and (max-width: 768px) {
          .mobile-full-height {
            min-height: 100vh;
            min-height: -webkit-fill-available;
          }
        }
      `;

      // Remove existing styles and add new ones
      const existingStyles = document.getElementById('mobile-optimizer-styles');
      if (existingStyles) {
        existingStyles.remove();
      }
      document.head.appendChild(style);

      // Apply device-specific optimizations
      if (deviceInfo.isIOS) {
        document.body.classList.add('ios-device');
        // Fix iOS Safari viewport issues
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
          viewport.setAttribute('content', 
            'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover');
        }
      }

      if (deviceInfo.isAndroid) {
        document.body.classList.add('android-device');
        // Fix Android keyboard issues
        window.addEventListener('resize', () => {
          if (document.activeElement?.tagName === 'INPUT' || 
              document.activeElement?.tagName === 'TEXTAREA') {
            setTimeout(() => {
              document.activeElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
          }
        });
      }

      if (deviceInfo.isMobile) {
        document.body.classList.add('mobile-optimized');
        
        // Disable pull-to-refresh on mobile
        document.body.style.overscrollBehavior = 'contain';
        
        // Fix mobile scroll behavior
        let touchStartY = 0;
        document.addEventListener('touchstart', (e) => {
          touchStartY = e.touches[0].clientY;
        }, { passive: true });
        
        document.addEventListener('touchmove', (e) => {
          const touchY = e.touches[0].clientY;
          const touchDiff = touchY - touchStartY;
          
          // Prevent overscroll at top
          if (window.scrollY === 0 && touchDiff > 0) {
            e.preventDefault();
          }
          
          // Prevent overscroll at bottom
          if (window.scrollY >= document.body.scrollHeight - window.innerHeight && touchDiff < 0) {
            e.preventDefault();
          }
        }, { passive: false });
      }
    };

    optimizeMobileExperience();

    return () => {
      // Cleanup
      const styles = document.getElementById('mobile-optimizer-styles');
      if (styles) {
        styles.remove();
      }
      document.body.classList.remove('mobile-optimized', 'ios-device', 'android-device');
    };
  }, [deviceInfo]);

  return null;
}