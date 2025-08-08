import { useEffect } from 'react';

/**
 * Comprehensive Mobile Fixes
 * Addresses all touch, scroll, swipe, and zoom issues across the entire website
 */
export default function ComprehensiveMobileFixes() {
  useEffect(() => {
    // Apply comprehensive mobile fixes
    const applyMobileFixes = () => {
      // 1. Fix viewport and prevent unwanted zoom
      const metaViewport = document.querySelector('meta[name="viewport"]');
      if (metaViewport) {
        metaViewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover');
      }

      // 2. Perfect scroll behavior
      document.documentElement.style.scrollBehavior = 'smooth';
      document.documentElement.style.WebkitOverflowScrolling = 'touch';
      document.documentElement.style.overflowScrolling = 'touch';

      // 3. Fix iOS Safari issues
      if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
        // Fix viewport height
        const setVH = () => {
          const vh = window.innerHeight * 0.01;
          document.documentElement.style.setProperty('--vh', `${vh}px`);
        };
        setVH();
        window.addEventListener('resize', setVH);
        window.addEventListener('orientationchange', () => setTimeout(setVH, 100));

        // Prevent zoom on input focus
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
          const element = input as HTMLElement;
          if (element.style.fontSize !== '16px') {
            element.style.fontSize = '16px';
          }
        });
      }

      // 4. Fix Android Chrome issues
      if (/Android/.test(navigator.userAgent)) {
        // Prevent address bar issues
        const setHeight = () => {
          document.body.style.minHeight = `${window.innerHeight}px`;
        };
        setHeight();
        window.addEventListener('resize', setHeight);
      }

      // 5. Global touch improvements
      const style = document.createElement('style');
      style.id = 'comprehensive-mobile-fixes';
      style.textContent = `
        /* Perfect mobile scrolling */
        * {
          -webkit-overflow-scrolling: touch;
          overflow-scrolling: touch;
        }

        /* Fix touch delays */
        * {
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
          -webkit-touch-callout: none;
        }

        /* Specific touch actions for different elements */
        .swipe-enabled, .carousel-container, .scroll-container {
          touch-action: pan-x pan-y;
        }

        .zoom-enabled {
          touch-action: pinch-zoom;
        }

        /* Perfect button touches */
        button, .btn, [role="button"], a {
          touch-action: manipulation;
          user-select: none;
          -webkit-user-select: none;
          -webkit-tap-highlight-color: transparent;
          cursor: pointer;
          min-height: 44px;
          min-width: 44px;
          position: relative;
          transition: transform 0.1s ease-out;
        }

        button:active, .btn:active, [role="button"]:active, a:active {
          transform: scale(0.98);
        }

        /* Perfect input touch */
        input, textarea, select {
          touch-action: manipulation;
          -webkit-appearance: none;
          appearance: none;
          font-size: 16px !important;
          padding: 12px 16px;
          border-radius: 8px;
          border: 2px solid #e5e7eb;
          background-color: #ffffff;
          min-height: 44px;
        }

        input:focus, textarea:focus, select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        /* Perfect modal and popup touches */
        .modal-overlay, .popup-overlay {
          touch-action: none;
          -webkit-overflow-scrolling: touch;
          overflow-scrolling: touch;
        }

        .modal-content, .popup-content {
          touch-action: pan-y;
          -webkit-overflow-scrolling: touch;
          overflow-scrolling: touch;
        }

        /* Perfect carousel and swipe */
        .carousel, .swiper, .scroll-snap-x {
          -webkit-overflow-scrolling: touch;
          overflow-scrolling: touch;
          scroll-snap-type: x mandatory;
          touch-action: pan-x;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .carousel::-webkit-scrollbar, .swiper::-webkit-scrollbar {
          display: none;
        }

        .carousel-item, .swiper-slide {
          scroll-snap-align: start;
          scroll-snap-stop: always;
        }

        /* Perfect image zoom */
        .zoom-container {
          overflow: hidden;
          position: relative;
        }

        .zoom-content {
          transform-origin: center center;
          transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          will-change: transform;
        }

        /* Fix scrolling issues */
        .prevent-scroll {
          overflow: hidden;
          touch-action: none;
          position: fixed;
          width: 100%;
        }

        /* Perfect product card touches */
        .product-card {
          touch-action: manipulation;
          cursor: pointer;
          transition: transform 0.2s ease-out;
        }

        .product-card:active {
          transform: scale(0.98);
        }

        /* Perfect header navigation */
        .header-nav a, .mobile-nav a {
          touch-action: manipulation;
          padding: 12px 16px;
          min-height: 44px;
          display: flex;
          align-items: center;
        }

        /* Perfect form elements */
        .form-group {
          margin-bottom: 16px;
        }

        .form-label {
          display: block;
          margin-bottom: 4px;
          font-weight: 500;
        }

        /* Perfect tab navigation */
        .tab-button {
          touch-action: manipulation;
          min-height: 44px;
          padding: 12px 20px;
          border: none;
          background: transparent;
          cursor: pointer;
        }

        .tab-button:active {
          transform: scale(0.98);
        }

        /* Perfect dropdown touches */
        .dropdown-trigger {
          touch-action: manipulation;
          min-height: 44px;
          padding: 12px 16px;
        }

        /* Perfect card interactions */
        .card-interactive {
          touch-action: manipulation;
          transition: all 0.2s ease-out;
          cursor: pointer;
        }

        .card-interactive:active {
          transform: translateY(2px);
        }

        /* Perfect list item touches */
        .list-item-interactive {
          touch-action: manipulation;
          padding: 12px 16px;
          min-height: 44px;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .list-item-interactive:active {
          background-color: rgba(0, 0, 0, 0.05);
        }

        /* Perfect pagination touches */
        .pagination-button {
          touch-action: manipulation;
          min-height: 44px;
          min-width: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Perfect search bar */
        .search-container {
          position: relative;
        }

        .search-input {
          width: 100%;
          font-size: 16px !important;
          padding: 12px 16px 12px 44px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          background-color: #ffffff;
          touch-action: manipulation;
        }

        .search-input:focus {
          border-color: #3b82f6;
          outline: none;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        /* Perfect filter and sort */
        .filter-button, .sort-button {
          touch-action: manipulation;
          min-height: 44px;
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          background-color: #ffffff;
          cursor: pointer;
        }

        .filter-button:active, .sort-button:active {
          transform: scale(0.98);
        }

        /* Perfect footer navigation */
        .footer-nav a {
          touch-action: manipulation;
          padding: 12px 8px;
          min-height: 44px;
          display: flex;
          align-items: center;
        }

        /* Safe area handling */
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
        }

        /* High DPI optimizations */
        @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 2dppx) {
          img, svg {
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }

        /* Dark mode optimizations */
        @media (prefers-color-scheme: dark) {
          html {
            color-scheme: dark;
          }
        }

        /* Perfect responsive breakpoints */
        @media (max-width: 640px) {
          .container {
            padding-left: 16px;
            padding-right: 16px;
          }
          
          .text-responsive {
            font-size: clamp(14px, 4vw, 18px);
          }
          
          .heading-responsive {
            font-size: clamp(20px, 6vw, 32px);
          }
          
          .button-responsive {
            padding: 12px 20px;
            font-size: 16px;
            min-height: 44px;
          }
        }

        @media (max-width: 768px) {
          .grid-responsive {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          
          .flex-responsive {
            flex-direction: column;
            gap: 16px;
          }
        }

        /* Perfect loading states */
        .loading-skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200px 100%;
          animation: loading-shimmer 1.5s infinite;
        }

        @keyframes loading-shimmer {
          0% { background-position: -200px 0; }
          100% { background-position: calc(200px + 100%) 0; }
        }
      `;

      // Remove existing styles and add new ones
      const existingStyles = document.getElementById('comprehensive-mobile-fixes');
      if (existingStyles) {
        existingStyles.remove();
      }
      document.head.appendChild(style);

      // 6. Apply touch-friendly classes to existing elements
      const applyTouchClasses = () => {
        // Buttons
        document.querySelectorAll('button, .btn, [role="button"]').forEach(el => {
          el.classList.add('touch-friendly');
        });

        // Links
        document.querySelectorAll('a').forEach(el => {
          el.classList.add('touch-friendly');
        });

        // Cards
        document.querySelectorAll('.card, .product-card').forEach(el => {
          el.classList.add('card-interactive');
        });

        // Inputs
        document.querySelectorAll('input, textarea, select').forEach(el => {
          el.classList.add('form-input');
        });
      };

      // Apply classes immediately and on DOM changes
      applyTouchClasses();
      
      // Watch for dynamic content
      const observer = new MutationObserver(() => {
        applyTouchClasses();
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      // 7. Fix common scrolling issues
      const fixScrollIssues = () => {
        // Prevent overscroll bounce on iOS
        document.addEventListener('touchmove', (e) => {
          if (e.target === document.body) {
            e.preventDefault();
          }
        }, { passive: false });

        // Handle modal/popup scroll locking
        let scrollPosition = 0;
        
        (window as any).lockScroll = () => {
          scrollPosition = window.pageYOffset;
          document.body.style.overflow = 'hidden';
          document.body.style.position = 'fixed';
          document.body.style.top = `-${scrollPosition}px`;
          document.body.style.width = '100%';
        };

        (window as any).unlockScroll = () => {
          document.body.style.removeProperty('overflow');
          document.body.style.removeProperty('position');
          document.body.style.removeProperty('top');
          document.body.style.removeProperty('width');
          window.scrollTo(0, scrollPosition);
        };
      };

      fixScrollIssues();

      // 8. Fix gesture conflicts
      document.addEventListener('touchstart', (e) => {
        // Allow pinch zoom on images and zoom-enabled elements
        if (e.touches.length > 1) {
          const target = e.target as HTMLElement;
          if (target.closest('.zoom-enabled, img')) {
            return; // Allow native zoom
          }
        }
      }, { passive: true });

      // 9. Optimize performance for touch events
      const optimizeTouch = () => {
        // Use passive listeners where possible
        const passiveEvents = ['touchstart', 'touchmove', 'wheel'];
        passiveEvents.forEach(event => {
          document.addEventListener(event, () => {}, { passive: true });
        });

        // Throttle resize events
        let resizeTimeout: NodeJS.Timeout;
        window.addEventListener('resize', () => {
          clearTimeout(resizeTimeout);
          resizeTimeout = setTimeout(() => {
            window.dispatchEvent(new Event('throttledResize'));
          }, 100);
        });
      };

      optimizeTouch();
    };

    // Apply fixes immediately
    applyMobileFixes();

    // Cleanup function
    return () => {
      const styles = document.getElementById('comprehensive-mobile-fixes');
      if (styles) {
        styles.remove();
      }
    };
  }, []);

  return null;
}