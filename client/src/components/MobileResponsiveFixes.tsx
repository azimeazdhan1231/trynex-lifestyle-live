import { useEffect } from "react";

// Component to apply mobile responsive fixes across the app
export default function MobileResponsiveFixes() {
  useEffect(() => {
    // Add mobile-optimized CSS fixes
    const style = document.createElement('style');
    style.textContent = `
      /* Enhanced Mobile Responsiveness */
      
      /* Custom Order Modal Mobile Fixes */
      .customize-modal-mobile {
        max-width: 95vw !important;
        max-height: 95vh !important;
        margin: 1rem !important;
      }
      
      /* Admin Panel Mobile Optimization */
      .admin-panel-container {
        overflow-x: hidden !important;
        padding: 0.5rem !important;
      }
      
      .admin-panel-container .card {
        margin-bottom: 1rem !important;
      }
      
      .admin-panel-container table {
        font-size: 0.875rem !important;
      }
      
      .admin-panel-container .table-row {
        border-bottom: 1px solid #e5e7eb !important;
      }
      
      /* Order Details Modal Mobile Fixes */
      .order-details-modal {
        max-width: 95vw !important;
        max-height: 90vh !important;
        margin: 1rem !important;
      }
      
      /* Product Grid Mobile Optimization */
      .product-grid-mobile {
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)) !important;
        gap: 1rem !important;
        padding: 0.5rem !important;
      }
      
      /* Header Mobile Fixes */
      .header-mobile {
        position: sticky !important;
        top: 0 !important;
        z-index: 50 !important;
        background: white !important;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
      }
      
      /* Chat Bot Mobile Optimization */
      .ai-chatbot-mobile {
        position: fixed !important;
        bottom: 1rem !important;
        right: 1rem !important;
        width: 90vw !important;
        max-width: 400px !important;
        z-index: 1000 !important;
      }
      
      .ai-chatbot-mobile.minimized {
        width: 60px !important;
        height: 60px !important;
      }
      
      /* Form Mobile Optimization */
      .form-mobile input,
      .form-mobile textarea,
      .form-mobile select {
        font-size: 16px !important; /* Prevent zoom on iOS */
      }
      
      /* Button Mobile Fixes */
      .btn-mobile {
        min-height: 44px !important; /* Apple's recommended touch target */
        padding: 0.75rem 1rem !important;
      }
      
      /* Modal Mobile Responsiveness */
      @media (max-width: 768px) {
        [role="dialog"] {
          max-width: 95vw !important;
          max-height: 95vh !important;
          margin: 1rem !important;
          border-radius: 0.5rem !important;
        }
        
        .customize-modal-content {
          padding: 1rem !important;
          max-height: 85vh !important;
          overflow-y: auto !important;
        }
        
        .admin-table-container {
          overflow-x: auto !important;
          -webkit-overflow-scrolling: touch !important;
        }
        
        .admin-table {
          min-width: 600px !important;
        }
        
        .product-filter-mobile {
          flex-direction: column !important;
          gap: 0.5rem !important;
        }
        
        .product-filter-mobile .filter-item {
          width: 100% !important;
        }
        
        /* Enhanced touch targets */
        .touch-target {
          min-height: 44px !important;
          min-width: 44px !important;
        }
        
        /* Improved text readability */
        .mobile-text {
          font-size: 16px !important;
          line-height: 1.5 !important;
        }
        
        /* Better spacing for mobile */
        .mobile-spacing {
          padding: 1rem !important;
          margin-bottom: 1rem !important;
        }
      }
      
      /* Small mobile devices */
      @media (max-width: 480px) {
        .customize-modal-content {
          padding: 0.75rem !important;
        }
        
        .admin-panel-container {
          padding: 0.25rem !important;
        }
        
        .product-grid-mobile {
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)) !important;
          gap: 0.75rem !important;
        }
        
        .ai-chatbot-mobile {
          width: 95vw !important;
          bottom: 0.5rem !important;
          right: 0.5rem !important;
        }
        
        /* Stack form elements vertically */
        .form-row-mobile {
          flex-direction: column !important;
        }
        
        .form-row-mobile > * {
          width: 100% !important;
          margin-bottom: 0.5rem !important;
        }
      }
      
      /* Landscape mobile fixes */
      @media (max-width: 768px) and (orientation: landscape) {
        .modal-landscape {
          max-height: 90vh !important;
        }
        
        .customize-modal-content {
          max-height: 80vh !important;
        }
      }
      
      /* iOS Safari specific fixes */
      @supports (-webkit-touch-callout: none) {
        .ios-fix {
          -webkit-appearance: none !important;
        }
        
        input[type="text"],
        input[type="email"],
        input[type="tel"],
        textarea {
          -webkit-appearance: none !important;
          border-radius: 0 !important;
        }
      }
      
      /* Android Chrome specific fixes */
      @media screen and (-webkit-min-device-pixel-ratio: 0) {
        select {
          background-image: none !important;
        }
      }
      
      /* High DPI display optimizations */
      @media (-webkit-min-device-pixel-ratio: 2),
             (min-resolution: 192dpi) {
        .high-dpi-text {
          font-weight: 400 !important;
          -webkit-font-smoothing: antialiased !important;
          -moz-osx-font-smoothing: grayscale !important;
        }
      }
      
      /* Accessibility improvements */
      @media (prefers-reduced-motion: reduce) {
        * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
      
      /* Dark mode mobile optimizations */
      @media (prefers-color-scheme: dark) {
        .mobile-dark-mode {
          background-color: #1f2937 !important;
          color: #f9fafb !important;
        }
        
        .mobile-dark-mode .card {
          background-color: #374151 !important;
          border-color: #4b5563 !important;
        }
      }
    `;
    
    document.head.appendChild(style);
    
    // Add mobile responsive classes to body
    document.body.classList.add('mobile-optimized');
    
    // Viewport meta tag optimization for mobile
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover');
    }
    
    // iOS Safari address bar height fix
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', () => {
      setTimeout(setVH, 100);
    });
    
    // Touch event optimizations
    document.addEventListener('touchstart', () => {}, { passive: true });
    document.addEventListener('touchmove', () => {}, { passive: true });
    
    return () => {
      document.head.removeChild(style);
      document.body.classList.remove('mobile-optimized');
      window.removeEventListener('resize', setVH);
      window.removeEventListener('orientationchange', setVH);
    };
  }, []);
  
  return null;
}