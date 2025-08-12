import { useEffect } from 'react';

export function MobileResponsiveEnhancement() {
  useEffect(() => {
    // Add mobile-optimized CSS
    const style = document.createElement('style');
    style.innerHTML = `
      /* Global Mobile Optimizations */
      * {
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1) !important;
        -webkit-touch-callout: none !important;
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
        margin: 0 !important;
        padding: 0 !important;
      }

      #root {
        width: 100% !important;
        overflow-x: hidden !important;
        min-height: 100vh !important;
      }

      /* Touch Targets - iOS/Android Guidelines */
      button, 
      a, 
      input[type="button"], 
      input[type="submit"], 
      .touch-target,
      [role="button"] {
        min-height: 44px !important;
        min-width: 44px !important;
        touch-action: manipulation !important;
      }

      /* Form Elements - Prevent iOS Zoom */
      input, 
      textarea, 
      select {
        -webkit-user-select: text !important;
        user-select: text !important;
        font-size: 16px !important;
      }

      /* Button Feedback */
      button:active, 
      .button:active, 
      .btn:active,
      [role="button"]:active {
        transform: scale(0.98) !important;
        transition: transform 0.1s ease !important;
      }

      /* Text Selection and Readability */
      p, span, div {
        line-height: 1.6 !important;
      }

      /* Scrollbar Styling */
      .scrollbar-hide {
        -ms-overflow-style: none !important;
        scrollbar-width: none !important;
      }

      .scrollbar-hide::-webkit-scrollbar {
        display: none !important;
      }

      /* Line Clamp Utility */
      .line-clamp-1 {
        display: -webkit-box !important;
        -webkit-line-clamp: 1 !important;
        -webkit-box-orient: vertical !important;
        overflow: hidden !important;
      }

      .line-clamp-2 {
        display: -webkit-box !important;
        -webkit-line-clamp: 2 !important;
        -webkit-box-orient: vertical !important;
        overflow: hidden !important;
      }

      .line-clamp-3 {
        display: -webkit-box !important;
        -webkit-line-clamp: 3 !important;
        -webkit-box-orient: vertical !important;
        overflow: hidden !important;
      }

      /* Mobile Specific Styles */
      @media (max-width: 768px) {
        .container {
          padding-left: 1rem !important;
          padding-right: 1rem !important;
        }

        /* Disable hover effects on touch devices */
        .card:hover,
        .button:hover {
          transform: none !important;
        }

        /* Active states for touch */
        .card:active {
          transform: scale(0.98) !important;
          transition: transform 0.1s ease !important;
        }

        /* Modal improvements */
        [role="dialog"] {
          margin: 0.5rem !important;
          max-height: calc(100vh - 1rem) !important;
          overflow-y: auto !important;
        }

        /* Sheet/Drawer improvements */
        [data-vaul-drawer] {
          touch-action: none !important;
        }

        /* Image optimization */
        img {
          max-width: 100% !important;
          height: auto !important;
        }

        /* Typography scaling */
        h1 {
          font-size: 1.875rem !important;
          line-height: 2.25rem !important;
        }

        h2 {
          font-size: 1.5rem !important;
          line-height: 2rem !important;
        }

        h3 {
          font-size: 1.25rem !important;
          line-height: 1.75rem !important;
        }

        /* Grid responsiveness */
        .product-grid {
          grid-template-columns: repeat(2, 1fr) !important;
          gap: 0.75rem !important;
        }

        /* Button sizing */
        .btn-sm {
          height: 2rem !important;
          padding: 0.25rem 0.75rem !important;
          font-size: 0.75rem !important;
        }

        /* Navigation improvements */
        nav a {
          padding: 0.75rem 1rem !important;
          font-size: 1rem !important;
        }

        /* Form improvements */
        .form-input {
          height: 2.75rem !important;
          font-size: 1rem !important;
        }
      }

      /* Extra small screens */
      @media (max-width: 480px) {
        .container {
          padding-left: 0.75rem !important;
          padding-right: 0.75rem !important;
        }

        .product-grid {
          grid-template-columns: repeat(2, 1fr) !important;
          gap: 0.5rem !important;
        }

        /* Compact spacing */
        .space-y-4 > * + * {
          margin-top: 0.75rem !important;
        }

        .space-y-6 > * + * {
          margin-top: 1rem !important;
        }

        /* Smaller text sizes */
        .text-sm {
          font-size: 0.8125rem !important;
        }

        .text-xs {
          font-size: 0.75rem !important;
        }
      }

      /* Performance optimizations */
      @media (prefers-reduced-motion: reduce) {
        *, 
        *::before, 
        *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }

      /* Dark mode support */
      @media (prefers-color-scheme: dark) {
        .auto-dark {
          background-color: #1f2937 !important;
          color: #f9fafb !important;
        }
      }

      /* High contrast mode */
      @media (prefers-contrast: high) {
        button {
          border: 2px solid currentColor !important;
        }

        .card {
          border: 1px solid currentColor !important;
        }
      }

      /* Print styles */
      @media print {
        .no-print {
          display: none !important;
        }

        * {
          background: transparent !important;
          color: black !important;
          text-shadow: none !important;
          filter: none !important;
          -ms-filter: none !important;
        }
      }
    `;

    document.head.appendChild(style);

    // Viewport meta tag optimization
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 
        'width=device-width, initial-scale=1.0, maximum-scale=5.0, minimum-scale=1.0, user-scalable=yes, viewport-fit=cover'
      );
    } else {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, minimum-scale=1.0, user-scalable=yes, viewport-fit=cover';
      document.head.appendChild(meta);
    }

    // Add mobile-optimized class to body
    document.body.classList.add('mobile-optimized');

    // Cleanup
    return () => {
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
      document.body.classList.remove('mobile-optimized');
    };
  }, []);

  return null;
}

export default MobileResponsiveEnhancement;