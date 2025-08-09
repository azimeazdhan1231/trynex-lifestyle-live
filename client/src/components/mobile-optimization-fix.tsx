import { useEffect } from 'react';

export default function MobileOptimizationFix() {
  useEffect(() => {
    // Create and inject optimized mobile CSS
    const style = document.createElement('style');
    style.id = 'mobile-optimization-fix';
    style.textContent = `
      /* CRITICAL MOBILE FIXES */
      
      /* Fix viewport and scrolling issues */
      html {
        -webkit-text-size-adjust: 100% !important;
        text-size-adjust: 100% !important;
        overflow-x: hidden !important;
      }
      
      body {
        overflow-x: hidden !important;
        -webkit-overflow-scrolling: touch !important;
        scroll-behavior: smooth !important;
        position: relative !important;
        min-height: 100vh !important;
      }
      
      #root {
        width: 100% !important;
        overflow-x: hidden !important;
        min-height: 100vh !important;
      }
      
      /* Fix touch targets - Minimum 44px for better mobile interaction */
      button, 
      a, 
      input[type="button"], 
      input[type="submit"], 
      .touch-target {
        min-height: 44px !important;
        min-width: 44px !important;
        touch-action: manipulation !important;
      }
      
      /* Enhanced mobile input handling */
      input, 
      textarea, 
      select {
        font-size: 16px !important; /* Prevents zoom on iOS */
        -webkit-user-select: text !important;
        user-select: text !important;
      }
      
      /* Fix mobile modal positioning */
      @media (max-width: 768px) {
        [data-radix-dialog-content] {
          width: calc(100vw - 32px) !important;
          max-width: calc(100vw - 32px) !important;
          max-height: calc(100vh - 64px) !important;
          margin: 16px !important;
          border-radius: 16px !important;
          position: fixed !important;
          top: 50% !important;
          left: 50% !important;
          transform: translate(-50%, -50%) !important;
        }
        
        [data-radix-sheet-content] {
          max-width: 100vw !important;
          width: 100% !important;
        }
      }
      
      /* Enhanced scrolling for mobile */
      .scrollable,
      .overflow-y-auto,
      .overflow-auto {
        -webkit-overflow-scrolling: touch !important;
        scroll-behavior: smooth !important;
      }
      
      /* Fix grid responsiveness */
      @media (max-width: 640px) {
        .product-grid,
        .grid {
          grid-template-columns: repeat(2, 1fr) !important;
          gap: 12px !important;
        }
      }
      
      @media (max-width: 480px) {
        .product-grid,
        .grid {
          grid-template-columns: repeat(2, 1fr) !important;
          gap: 8px !important;
        }
      }
      
      /* Mobile-optimized container spacing */
      @media (max-width: 768px) {
        .container {
          padding-left: 16px !important;
          padding-right: 16px !important;
        }
      }
      
      /* Fix mobile card interactions */
      @media (max-width: 768px) {
        .card:hover {
          transform: none !important;
        }
        
        .card:active {
          transform: scale(0.98) !important;
          transition: transform 0.1s ease !important;
        }
      }
      
      /* Prevent unwanted tap highlights */
      * {
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1) !important;
        -webkit-touch-callout: none !important;
      }
      
      /* Allow text selection for inputs */
      input, textarea, select {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        user-select: text !important;
      }
      
      /* Enhanced button feedback */
      button:active,
      .button:active,
      .btn:active {
        transform: scale(0.98) !important;
        transition: transform 0.1s ease !important;
      }
      
      /* Fix sticky elements */
      .sticky,
      .sticky-top {
        position: sticky !important;
        top: 0 !important;
        z-index: 40 !important;
        background: rgba(255, 255, 255, 0.95) !important;
        backdrop-filter: blur(8px) !important;
      }
      
      /* Mobile-specific sheet/drawer improvements */
      @media (max-width: 768px) {
        .sheet-content,
        [data-radix-sheet-content] {
          height: 100vh !important;
          max-height: 100vh !important;
          border-radius: 0 !important;
        }
      }
      
      /* Safe area handling for iOS */
      .safe-area-bottom {
        padding-bottom: calc(16px + env(safe-area-inset-bottom)) !important;
      }
      
      .safe-area-top {
        padding-top: calc(16px + env(safe-area-inset-top)) !important;
      }
      
      /* Performance optimizations */
      * {
        will-change: auto !important;
      }
      
      .animate {
        will-change: transform, opacity !important;
      }
      
      /* Disable animations on low-end devices */
      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
    `;
    
    // Remove any existing mobile optimization styles to prevent conflicts
    const existingStyles = document.querySelectorAll('#mobile-optimization-fix, #comprehensive-mobile-styles');
    existingStyles.forEach(el => el.remove());
    
    document.head.appendChild(style);
    
    // Update viewport meta tag for optimal mobile experience
    let viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=5.0, minimum-scale=1.0, user-scalable=yes, viewport-fit=cover');
    } else {
      viewport = document.createElement('meta');
      viewport.setAttribute('name', 'viewport');
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=5.0, minimum-scale=1.0, user-scalable=yes, viewport-fit=cover');
      document.head.appendChild(viewport);
    }
    
    // iOS Safari specific fixes
    if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      
      // Update on resize
      const updateVH = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
      };
      
      window.addEventListener('resize', updateVH);
      window.addEventListener('orientationchange', updateVH);
      
      return () => {
        window.removeEventListener('resize', updateVH);
        window.removeEventListener('orientationchange', updateVH);
        if (style.parentNode) {
          style.parentNode.removeChild(style);
        }
      };
    }
    
    return () => {
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, []);

  return null;
}