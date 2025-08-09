import { useEffect } from 'react';

export default function ConsolidatedMobileFix() {
  useEffect(() => {
    // Remove all existing mobile optimization styles to prevent conflicts
    const existingStyles = document.querySelectorAll('style[data-mobile-fix], style[data-critical], style[data-mobile-optimization]');
    existingStyles.forEach(style => style.remove());

    // Create single consolidated mobile optimization style
    const style = document.createElement('style');
    style.setAttribute('data-mobile-optimization', 'consolidated');
    style.textContent = `
      /* ========== CONSOLIDATED MOBILE OPTIMIZATION ========== */
      
      /* Reset and Base Fixes */
      * {
        box-sizing: border-box !important;
      }
      
      html {
        -webkit-text-size-adjust: 100% !important;
        text-size-adjust: 100% !important;
        overflow-x: hidden !important;
        scroll-behavior: smooth !important;
      }
      
      body {
        overflow-x: hidden !important;
        -webkit-overflow-scrolling: touch !important;
        scroll-behavior: smooth !important;
        position: relative !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      
      #root {
        width: 100% !important;
        overflow-x: hidden !important;
        min-height: 100vh !important;
      }
      
      /* Touch and Interaction Improvements */
      button, a, input[type="button"], input[type="submit"], .touch-target {
        min-height: 44px !important;
        min-width: 44px !important;
        touch-action: manipulation !important;
      }
      
      * {
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1) !important;
        -webkit-touch-callout: none !important;
      }
      
      input, textarea, select {
        -webkit-user-select: text !important;
        user-select: text !important;
        font-size: 16px !important; /* Prevents iOS zoom */
      }
      
      /* Button Active States */
      button:active, .button:active, .btn:active {
        transform: scale(0.98) !important;
        transition: transform 0.1s ease !important;
      }
      
      /* Mobile Grid and Layout Fixes */
      @media (max-width: 768px) {
        .container {
          padding-left: 1rem !important;
          padding-right: 1rem !important;
        }
        
        .product-grid {
          grid-template-columns: repeat(2, 1fr) !important;
          gap: 0.75rem !important;
        }
        
        .card:hover {
          transform: none !important;
        }
        
        .card:active {
          transform: scale(0.98) !important;
        }
      }
      
      @media (max-width: 480px) {
        .container {
          padding-left: 0.75rem !important;
          padding-right: 0.75rem !important;
        }
        
        .product-grid {
          grid-template-columns: repeat(2, 1fr) !important;
          gap: 0.5rem !important;
        }
      }
      
      /* Modal and Sheet Fixes */
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
          z-index: 10001 !important;
        }
        
        [data-radix-sheet-content] {
          max-width: 100vw !important;
          width: 100% !important;
          height: 100vh !important;
          border-radius: 0 !important;
        }
        
        [data-radix-dialog-overlay] {
          position: fixed !important;
          inset: 0 !important;
          z-index: 10000 !important;
          background: rgba(0, 0, 0, 0.6) !important;
          backdrop-filter: blur(4px) !important;
        }
      }
      
      /* Header Fixes */
      .sticky-header {
        position: sticky !important;
        top: 0 !important;
        z-index: 50 !important;
        background: rgba(255, 255, 255, 0.95) !important;
        backdrop-filter: blur(8px) !important;
      }
      
      /* Scrolling Optimization */
      .scrollable, .overflow-y-auto, .overflow-auto {
        -webkit-overflow-scrolling: touch !important;
        scroll-behavior: smooth !important;
      }
      
      /* Typography Scaling */
      @media (max-width: 768px) {
        h1 { font-size: 1.75rem !important; }
        h2 { font-size: 1.5rem !important; }
        h3 { font-size: 1.25rem !important; }
        .text-4xl { font-size: 1.875rem !important; }
        .text-3xl { font-size: 1.5rem !important; }
        .text-2xl { font-size: 1.25rem !important; }
      }
      
      /* Safe Area Handling for iOS */
      .safe-area-bottom {
        padding-bottom: calc(16px + env(safe-area-inset-bottom)) !important;
      }
      
      .safe-area-top {
        padding-top: calc(16px + env(safe-area-inset-top)) !important;
      }
      
      /* Performance Optimizations */
      * {
        will-change: auto !important;
      }
      
      .animate {
        will-change: transform, opacity !important;
      }
      
      /* Reduce motion for accessibility */
      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
      
      /* Input Focus States */
      input:focus, textarea:focus, select:focus {
        border-color: #3b82f6 !important;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
        outline: none !important;
      }
      
      /* Mobile Navigation Fixes */
      @media (max-width: 1024px) {
        .mobile-nav-button {
          display: flex !important;
        }
        
        .desktop-nav {
          display: none !important;
        }
      }
      
      /* Prevent zoom on double tap */
      @media (max-width: 768px) {
        * {
          touch-action: manipulation !important;
        }
      }
      
      /* Fix overflow issues */
      .prevent-overflow {
        max-width: 100vw !important;
        overflow-x: hidden !important;
      }
      
      /* Enhanced error states */
      .error-state {
        border-color: #ef4444 !important;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
      }
    `;
    
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
      const updateVH = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
      };
      
      updateVH();
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