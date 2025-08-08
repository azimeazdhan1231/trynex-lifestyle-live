import { useEffect } from 'react';

/**
 * Mobile Responsive Fixes Component
 * Addresses critical mobile UI issues and ensures perfect mobile experience
 */
export default function MobileResponsiveFixes() {
  useEffect(() => {
    // Fix viewport issues for mobile browsers
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (viewportMeta) {
      viewportMeta.setAttribute(
        'content',
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
      );
    }

    // Fix iOS Safari issues
    const fixIOSSafari = () => {
      // Fix 100vh issue on mobile Safari
      const setVH = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
      };
      
      setVH();
      window.addEventListener('resize', setVH);
      window.addEventListener('orientationchange', setVH);
      
      return () => {
        window.removeEventListener('resize', setVH);
        window.removeEventListener('orientationchange', setVH);
      };
    };

    // Fix Android Chrome address bar issues
    const fixAndroidChrome = () => {
      if (/Android/.test(navigator.userAgent)) {
        document.body.style.minHeight = '100vh';
        document.documentElement.style.minHeight = '100vh';
      }
    };

    // Prevent horizontal scrolling on mobile
    const preventHorizontalScroll = () => {
      document.body.style.overflowX = 'hidden';
    };

    // Apply fixes
    const cleanupVH = fixIOSSafari();
    fixAndroidChrome();
    preventHorizontalScroll();

    // Add custom CSS for mobile-specific improvements
    const style = document.createElement('style');
    style.textContent = `
      /* Mobile-specific CSS improvements */
      
      /* Fix modal positioning on mobile */
      .mobile-optimized [data-radix-dialog-content] {
        margin: 8px !important;
        max-height: calc(100vh - 16px) !important;
        max-width: calc(100vw - 16px) !important;
      }
      
      /* Improve touch targets */
      .mobile-optimized button {
        min-height: 44px !important;
        min-width: 44px !important;
      }
      
      /* Fix font scaling on mobile */
      .mobile-optimized {
        -webkit-text-size-adjust: 100% !important;
        text-size-adjust: 100% !important;
      }
      
      /* Smooth scrolling on mobile */
      .mobile-optimized {
        -webkit-overflow-scrolling: touch !important;
        scroll-behavior: smooth !important;
      }
      
      /* Fix input zooming on iOS */
      .mobile-optimized input,
      .mobile-optimized textarea,
      .mobile-optimized select {
        font-size: 16px !important;
      }
      
      /* Prevent zoom on double tap */
      .mobile-optimized * {
        touch-action: manipulation !important;
      }
      
      /* Better mobile card layouts */
      @media (max-width: 640px) {
        .mobile-optimized .product-grid {
          grid-template-columns: repeat(2, 1fr) !important;
          gap: 12px !important;
        }
        
        .mobile-optimized .card-hover {
          transform: none !important;
        }
        
        .mobile-optimized .card-hover:active {
          transform: scale(0.98) !important;
        }
      }
      
      /* Fix pricing display on mobile */
      @media (max-width: 480px) {
        .mobile-optimized .price-display {
          font-size: 1.1rem !important;
          line-height: 1.3 !important;
        }
        
        .mobile-optimized .cart-total {
          font-size: 1.25rem !important;
          font-weight: 700 !important;
        }
      }
      
      /* Better mobile modal experience */
      @media (max-width: 640px) {
        .mobile-optimized [role="dialog"] {
          border-radius: 16px 16px 0 0 !important;
          bottom: 0 !important;
          top: auto !important;
          transform: translateX(-50%) !important;
          max-height: 90vh !important;
        }
      }
      
      /* Fix safe area for notched devices */
      .mobile-optimized {
        padding-bottom: env(safe-area-inset-bottom) !important;
      }
      
      /* Better mobile header */
      @media (max-width: 768px) {
        .mobile-optimized header {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          z-index: 9999 !important;
          backdrop-filter: blur(8px) !important;
        }
      }
    `;
    
    document.head.appendChild(style);

    // Cleanup
    return () => {
      cleanupVH();
      document.head.removeChild(style);
    };
  }, []);

  return null; // This component only applies CSS and JavaScript fixes
}