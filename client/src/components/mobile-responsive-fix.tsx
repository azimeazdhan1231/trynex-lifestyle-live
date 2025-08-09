import { useEffect } from 'react';

// Enhanced mobile-specific CSS fixes for all components
export default function MobileResponsiveFix() {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      /* Mobile-First Responsive Fixes */
      @media (max-width: 768px) {
        /* Admin Panel Mobile Fixes */
        .admin-panel [data-testid*="modal"],
        .admin-panel [role="dialog"] {
          width: 95vw !important;
          max-width: 95vw !important;
          margin: 1rem !important;
          max-height: 90vh !important;
        }
        
        /* Product Grid Mobile Fixes */
        .admin-panel .product-grid {
          grid-template-columns: 1fr !important;
          gap: 1rem !important;
        }
        
        /* Table Responsive */
        .admin-panel table {
          font-size: 0.875rem !important;
        }
        
        .admin-panel th,
        .admin-panel td {
          padding: 0.5rem !important;
        }
        
        /* Form Elements Mobile */
        .admin-panel .form-grid {
          grid-template-columns: 1fr !important;
          gap: 1rem !important;
        }
        
        /* Button Groups Mobile */
        .admin-panel .button-group {
          flex-direction: column !important;
          gap: 0.5rem !important;
        }
        
        /* Cart Modal Mobile Fixes */
        [data-testid="cart-modal"] {
          width: 98vw !important;
          max-width: 98vw !important;
          margin: 0.5rem !important;
          max-height: 95vh !important;
        }
        
        /* Order Modal Mobile */
        [data-testid="order-details-modal"] {
          width: 98vw !important;
          max-width: 98vw !important;
          margin: 0.5rem !important;
        }
        
        /* Product Form Modal Mobile */
        [data-testid="product-form-modal"] {
          width: 95vw !important;
          max-width: 95vw !important;
          margin: 1rem !important;
        }
      }
      
      /* Touch-friendly targets */
      @media (pointer: coarse) {
        button, 
        [role="button"],
        .touch-target {
          min-height: 44px !important;
          min-width: 44px !important;
          padding: 0.75rem 1rem !important;
        }
        
        /* Table row touch targets */
        tr {
          min-height: 44px !important;
        }
        
        td, th {
          min-height: 44px !important;
          padding: 0.75rem 0.5rem !important;
        }
      }
      
      /* Small Mobile (< 480px) */
      @media (max-width: 480px) {
        /* Ultra compact admin panels */
        .admin-panel .container {
          padding: 0.5rem !important;
        }
        
        .admin-panel h1, 
        .admin-panel h2 {
          font-size: 1.25rem !important;
        }
        
        .admin-panel h3 {
          font-size: 1.125rem !important;
        }
        
        /* Tabs mobile */
        .admin-panel [role="tablist"] {
          flex-wrap: wrap !important;
          justify-content: center !important;
        }
        
        .admin-panel [role="tab"] {
          flex: 1 1 auto !important;
          min-width: fit-content !important;
          padding: 0.5rem !important;
          font-size: 0.75rem !important;
        }
        
        /* Stats cards mobile */
        .stats-grid {
          grid-template-columns: 1fr 1fr !important;
          gap: 0.75rem !important;
        }
        
        .stat-card {
          padding: 0.75rem !important;
        }
        
        .stat-number {
          font-size: 1.25rem !important;
        }
      }
      
      /* Landscape Mobile */
      @media (max-height: 500px) and (orientation: landscape) {
        [role="dialog"] {
          max-height: 95vh !important;
          overflow-y: auto !important;
        }
        
        .modal-header {
          padding: 0.5rem !important;
        }
        
        .modal-content {
          padding: 0.75rem !important;
        }
      }
      
      /* High DPI Mobile Fixes */
      @media (-webkit-min-device-pixel-ratio: 2) {
        .admin-panel img {
          image-rendering: -webkit-optimize-contrast !important;
        }
        
        .admin-panel svg {
          shape-rendering: geometricPrecision !important;
        }
      }
      
      /* iOS Specific Fixes */
      @supports (-webkit-appearance: none) {
        input[type="text"],
        input[type="email"],
        input[type="number"],
        textarea,
        select {
          font-size: 16px !important; /* Prevents zoom on focus */
          -webkit-appearance: none !important;
          border-radius: 0.375rem !important;
        }
        
        /* iOS safe area */
        .admin-panel {
          padding-bottom: env(safe-area-inset-bottom) !important;
        }
      }
      
      /* Android Specific */
      @media screen and (-webkit-min-device-pixel-ratio: 0) {
        select {
          background-image: linear-gradient(45deg, transparent 50%, currentColor 50%), 
                           linear-gradient(-45deg, transparent 50%, currentColor 50%) !important;
          background-position: calc(100% - 20px) calc(50% - 3px), calc(100% - 15px) calc(50% - 3px) !important;
          background-size: 5px 5px, 5px 5px !important;
          background-repeat: no-repeat !important;
        }
      }
      
      /* Performance optimizations for mobile */
      .admin-panel {
        -webkit-overflow-scrolling: touch !important;
        transform: translateZ(0) !important;
      }
      
      .admin-panel * {
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1) !important;
        -webkit-font-smoothing: antialiased !important;
        -moz-osx-font-smoothing: grayscale !important;
      }
      
      /* Accessibility enhancements for mobile */
      @media (prefers-reduced-motion: reduce) {
        .admin-panel * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
      
      /* Dark mode mobile fixes */
      @media (prefers-color-scheme: dark) {
        .admin-panel {
          color-scheme: dark !important;
        }
      }
    `;
    
    document.head.appendChild(style);
    
    return () => {
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, []);

  return null;
}