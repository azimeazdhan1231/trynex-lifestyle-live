import { useEffect } from 'react';

export default function ComprehensiveMobileResponsiveness() {
  useEffect(() => {
    // Inject comprehensive mobile CSS
    const style = document.createElement('style');
    style.textContent = `
      /* Perfect Mobile Responsiveness & Touch Optimization */
      
      * {
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
      
      input, textarea, select {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
      }
      
      /* Touch Targets - Minimum 44px */
      button, 
      a, 
      input[type="button"], 
      input[type="submit"], 
      input[type="checkbox"], 
      input[type="radio"],
      .touch-target {
        min-height: 44px !important;
        min-width: 44px !important;
        touch-action: manipulation;
      }
      
      /* Improved Button Touch Feedback */
      button:active,
      .button:active,
      .btn:active {
        transform: scale(0.98) !important;
        transition: transform 0.1s ease !important;
      }
      
      /* Enhanced Input Fields for Mobile */
      input, 
      textarea, 
      select {
        font-size: 16px !important; /* Prevents zoom on iOS */
        padding: 12px 16px !important;
        border-radius: 8px !important;
        border: 2px solid #e5e7eb !important;
        transition: border-color 0.2s ease, box-shadow 0.2s ease !important;
      }
      
      input:focus, 
      textarea:focus, 
      select:focus {
        border-color: #3b82f6 !important;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
        outline: none !important;
      }
      
      /* Perfect Modal Responsiveness */
      [data-radix-dialog-overlay] {
        position: fixed !important;
        inset: 0 !important;
        z-index: 10000 !important;
        background: rgba(0, 0, 0, 0.6) !important;
        backdrop-filter: blur(4px) !important;
      }
      
      [data-radix-dialog-content] {
        position: fixed !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) !important;
        z-index: 10001 !important;
        background: white !important;
        border-radius: 12px !important;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
      }
      
      /* Mobile-specific modal adjustments */
      @media (max-width: 768px) {
        [data-radix-dialog-content] {
          width: calc(100vw - 32px) !important;
          max-width: calc(100vw - 32px) !important;
          max-height: calc(100vh - 64px) !important;
          margin: 16px !important;
          border-radius: 16px !important;
        }
        
        .modal-container {
          width: calc(100vw - 32px) !important;
          max-width: calc(100vw - 32px) !important;
          max-height: calc(100vh - 64px) !important;
          margin: 16px !important;
        }
        
        .modal-content {
          max-height: calc(100vh - 150px) !important;
          overflow-y: auto !important;
          padding: 16px !important;
        }
      }
      
      /* Enhanced Scrolling */
      .scrollable {
        -webkit-overflow-scrolling: touch !important;
        scroll-behavior: smooth !important;
      }
      
      /* Perfect Grid Responsiveness */
      .responsive-grid {
        display: grid !important;
        gap: 16px !important;
        padding: 16px !important;
      }
      
      .responsive-grid.products {
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)) !important;
      }
      
      @media (max-width: 640px) {
        .responsive-grid {
          gap: 12px !important;
          padding: 12px !important;
        }
        
        .responsive-grid.products {
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)) !important;
        }
      }
      
      @media (max-width: 480px) {
        .responsive-grid.products {
          grid-template-columns: repeat(2, 1fr) !important;
        }
      }
      
      /* Enhanced Card Responsiveness */
      .card {
        border-radius: 12px !important;
        overflow: hidden !important;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
        transition: all 0.2s ease !important;
      }
      
      .card:hover {
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
        transform: translateY(-2px) !important;
      }
      
      @media (max-width: 768px) {
        .card {
          border-radius: 8px !important;
        }
        
        .card:hover {
          transform: none !important;
        }
        
        .card:active {
          transform: scale(0.98) !important;
        }
      }
      
      /* Perfect Typography Scaling */
      @media (max-width: 768px) {
        h1 { font-size: 1.75rem !important; line-height: 1.2 !important; }
        h2 { font-size: 1.5rem !important; line-height: 1.3 !important; }
        h3 { font-size: 1.25rem !important; line-height: 1.4 !important; }
        h4 { font-size: 1.125rem !important; line-height: 1.4 !important; }
        
        .text-xs { font-size: 0.75rem !important; }
        .text-sm { font-size: 0.875rem !important; }
        .text-base { font-size: 1rem !important; }
        .text-lg { font-size: 1.125rem !important; }
        .text-xl { font-size: 1.25rem !important; }
        .text-2xl { font-size: 1.5rem !important; }
        .text-3xl { font-size: 1.875rem !important; }
      }
      
      /* Enhanced Navigation */
      .nav-mobile {
        position: fixed !important;
        bottom: 0 !important;
        left: 0 !important;
        right: 0 !important;
        background: white !important;
        border-top: 1px solid #e5e7eb !important;
        padding: 8px 0 calc(8px + env(safe-area-inset-bottom)) !important;
        z-index: 100 !important;
      }
      
      /* Perfect Search Bar */
      .search-bar {
        width: 100% !important;
        max-width: 100% !important;
        border-radius: 24px !important;
        padding: 12px 20px 12px 48px !important;
        font-size: 16px !important;
        border: 2px solid #e5e7eb !important;
        background: #f9fafb !important;
      }
      
      .search-bar:focus {
        background: white !important;
        border-color: #3b82f6 !important;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
      }
      
      /* Enhanced Loading States */
      .skeleton {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%) !important;
        background-size: 200% 100% !important;
        animation: shimmer 1.5s infinite !important;
      }
      
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      
      /* Perfect Drawer/Sheet Components */
      .drawer-content {
        position: fixed !important;
        bottom: 0 !important;
        left: 0 !important;
        right: 0 !important;
        background: white !important;
        border-radius: 16px 16px 0 0 !important;
        max-height: 80vh !important;
        transform: translateY(100%) !important;
        transition: transform 0.3s ease !important;
        z-index: 10001 !important;
      }
      
      .drawer-content.open {
        transform: translateY(0) !important;
      }
      
      .drawer-handle {
        width: 40px !important;
        height: 4px !important;
        background: #d1d5db !important;
        border-radius: 2px !important;
        margin: 12px auto 20px !important;
      }
      
      /* Enhanced Image Handling */
      img {
        max-width: 100% !important;
        height: auto !important;
        border-radius: inherit !important;
        transition: transform 0.2s ease !important;
      }
      
      .image-container {
        overflow: hidden !important;
        border-radius: inherit !important;
      }
      
      .image-container img {
        width: 100% !important;
        height: 100% !important;
        object-fit: cover !important;
      }
      
      /* Perfect Form Layout */
      .form-group {
        margin-bottom: 20px !important;
      }
      
      .form-row {
        display: flex !important;
        gap: 16px !important;
      }
      
      @media (max-width: 768px) {
        .form-row {
          flex-direction: column !important;
          gap: 12px !important;
        }
      }
      
      /* Enhanced Spacing */
      .container {
        padding-left: 16px !important;
        padding-right: 16px !important;
        margin-left: auto !important;
        margin-right: auto !important;
      }
      
      @media (min-width: 640px) {
        .container { padding-left: 24px !important; padding-right: 24px !important; }
      }
      
      @media (min-width: 1024px) {
        .container { padding-left: 32px !important; padding-right: 32px !important; }
      }
      
      /* Perfect Safe Areas for iOS */
      .safe-area-bottom {
        padding-bottom: calc(16px + env(safe-area-inset-bottom)) !important;
      }
      
      .safe-area-top {
        padding-top: calc(16px + env(safe-area-inset-top)) !important;
      }
      
      /* Enhanced Animation Performance */
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
      
      /* Enhanced Focus States */
      button:focus,
      a:focus,
      input:focus,
      textarea:focus,
      select:focus {
        outline: 2px solid #3b82f6 !important;
        outline-offset: 2px !important;
      }
      
      /* Perfect Sticky Elements */
      .sticky-top {
        position: sticky !important;
        top: 0 !important;
        z-index: 40 !important;
        background: rgba(255, 255, 255, 0.95) !important;
        backdrop-filter: blur(8px) !important;
        border-bottom: 1px solid rgba(229, 231, 235, 0.6) !important;
      }
      
      /* Enhanced Dropdown/Select */
      .select-content {
        max-height: 300px !important;
        overflow-y: auto !important;
        border: 1px solid #e5e7eb !important;
        border-radius: 8px !important;
        background: white !important;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1) !important;
      }
      
      .select-item {
        padding: 12px 16px !important;
        cursor: pointer !important;
        transition: background-color 0.2s ease !important;
      }
      
      .select-item:hover {
        background: #f3f4f6 !important;
      }
      
      /* Perfect Carousel/Slider */
      .carousel {
        overflow-x: auto !important;
        scroll-snap-type: x mandatory !important;
        -webkit-overflow-scrolling: touch !important;
        scrollbar-width: none !important;
        -ms-overflow-style: none !important;
      }
      
      .carousel::-webkit-scrollbar {
        display: none !important;
      }
      
      .carousel-item {
        scroll-snap-align: start !important;
        flex-shrink: 0 !important;
      }
      
      /* Enhanced Toast/Notification */
      .toast {
        position: fixed !important;
        z-index: 10002 !important;
        max-width: calc(100vw - 32px) !important;
        border-radius: 8px !important;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1) !important;
      }
      
      @media (max-width: 768px) {
        .toast {
          bottom: calc(80px + env(safe-area-inset-bottom)) !important;
          left: 16px !important;
          right: 16px !important;
          width: calc(100vw - 32px) !important;
        }
      }
      
      /* Perfect Color Scheme Support */
      @media (prefers-color-scheme: dark) {
        .auto-dark {
          background-color: #1f2937 !important;
          color: #f9fafb !important;
        }
        
        .auto-dark .card {
          background-color: #374151 !important;
          border-color: #4b5563 !important;
        }
        
        .auto-dark input,
        .auto-dark textarea,
        .auto-dark select {
          background-color: #374151 !important;
          border-color: #4b5563 !important;
          color: #f9fafb !important;
        }
      }
      
      /* Enhanced Error States */
      .error-state {
        border-color: #ef4444 !important;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
      }
      
      .error-text {
        color: #ef4444 !important;
        font-size: 0.875rem !important;
        margin-top: 4px !important;
      }
      
      /* Perfect Loading Buttons */
      .loading-button {
        position: relative !important;
        overflow: hidden !important;
      }
      
      .loading-button::after {
        content: '' !important;
        position: absolute !important;
        top: 0 !important;
        left: -100% !important;
        width: 100% !important;
        height: 100% !important;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent) !important;
        animation: loading-shine 1.5s infinite !important;
      }
      
      @keyframes loading-shine {
        0% { left: -100%; }
        100% { left: 100%; }
      }
    `;
    
    document.head.appendChild(style);
    
    // Add viewport meta tag if not present
    if (!document.querySelector('meta[name="viewport"]')) {
      const viewport = document.createElement('meta');
      viewport.name = 'viewport';
      viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
      document.head.appendChild(viewport);
    }
    
    // Enhanced touch handling
    let touchStartY = 0;
    let touchEndY = 0;
    
    document.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    document.addEventListener('touchend', (e) => {
      touchEndY = e.changedTouches[0].clientY;
      
      // Prevent pull-to-refresh on certain elements
      const target = e.target as HTMLElement;
      if (target.closest('.no-pull-refresh')) {
        e.preventDefault();
      }
    }, { passive: false });
    
    // Prevent double-tap zoom on buttons
    document.addEventListener('touchend', (e) => {
      const target = e.target as HTMLElement;
      if (target.matches('button, .button, .btn, a[role="button"]')) {
        e.preventDefault();
      }
    }, { passive: false });
    
    return () => {
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, []);
  
  return null;
}