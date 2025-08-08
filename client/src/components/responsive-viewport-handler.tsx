import { useEffect, useState } from 'react';

/**
 * Responsive Viewport Handler
 * Handles viewport meta tag optimization and device-specific viewport fixes
 */
export default function ResponsiveViewportHandler() {
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Determine device type
      let newDeviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
      if (width < 768) newDeviceType = 'mobile';
      else if (width < 1024) newDeviceType = 'tablet';
      
      setDeviceType(newDeviceType);
      setOrientation(width > height ? 'landscape' : 'portrait');

      // Update viewport meta tag based on device type
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        let content = '';
        
        if (newDeviceType === 'mobile') {
          // Mobile-optimized viewport
          content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, minimum-scale=1.0, user-scalable=yes, viewport-fit=cover';
        } else if (newDeviceType === 'tablet') {
          // Tablet-optimized viewport
          content = 'width=device-width, initial-scale=1.0, maximum-scale=3.0, minimum-scale=1.0, user-scalable=yes';
        } else {
          // Desktop viewport
          content = 'width=device-width, initial-scale=1.0, user-scalable=yes';
        }
        
        viewport.setAttribute('content', content);
      }

      // Set CSS custom properties for responsive design
      document.documentElement.style.setProperty('--viewport-width', `${width}px`);
      document.documentElement.style.setProperty('--viewport-height', `${height}px`);
      document.documentElement.style.setProperty('--device-type', newDeviceType);
      document.documentElement.style.setProperty('--orientation', orientation);

      // iOS Safari specific fixes
      if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
        // Fix for iOS Safari viewport height issue
        const vh = height * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
        
        // Prevent zoom on input focus for iOS
        if (newDeviceType === 'mobile') {
          const inputs = document.querySelectorAll('input, textarea, select');
          inputs.forEach(input => {
            const element = input as HTMLElement;
            element.style.fontSize = '16px';
          });
        }
      }

      // Android specific fixes
      if (/Android/.test(navigator.userAgent)) {
        // Prevent layout shifts on keyboard open
        document.body.style.height = '100vh';
        document.body.style.height = `${height}px`;
      }
    };

    // Initial setup
    updateViewport();

    // Listen for resize and orientation changes
    window.addEventListener('resize', updateViewport);
    window.addEventListener('orientationchange', () => {
      setTimeout(updateViewport, 100);
    });

    // Apply device-specific CSS classes
    document.body.classList.add(`device-${deviceType}`);
    document.body.classList.add(`orientation-${orientation}`);

    return () => {
      window.removeEventListener('resize', updateViewport);
      window.removeEventListener('orientationchange', updateViewport);
      document.body.classList.remove(`device-${deviceType}`, `orientation-${orientation}`);
    };
  }, [deviceType, orientation]);

  useEffect(() => {
    // Apply comprehensive CSS for responsive behavior
    const style = document.createElement('style');
    style.id = 'responsive-viewport-styles';
    style.textContent = `
      /* Device-specific optimizations */
      .device-mobile {
        -webkit-text-size-adjust: 100%;
        text-size-adjust: 100%;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      .device-mobile * {
        -webkit-tap-highlight-color: transparent;
        -webkit-touch-callout: none;
        touch-action: manipulation;
      }

      /* Perfect mobile scrolling */
      .device-mobile,
      .device-mobile body {
        -webkit-overflow-scrolling: touch;
        overflow-scrolling: touch;
        scroll-behavior: smooth;
      }

      /* Orientation-specific styles */
      .orientation-landscape.device-mobile {
        /* Landscape mobile optimizations */
      }

      .orientation-portrait.device-mobile {
        /* Portrait mobile optimizations */
      }

      /* Zoom and pinch optimizations */
      @media (max-width: 768px) {
        /* Enable zoom but prevent layout issues */
        .zoom-container {
          overflow: hidden;
          position: relative;
        }

        .zoom-content {
          transform-origin: center center;
          transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          will-change: transform;
        }

        /* Perfect touch targets */
        .touch-friendly,
        button,
        a,
        input,
        textarea,
        select {
          min-height: 44px;
          min-width: 44px;
          position: relative;
        }

        /* Improve touch feedback */
        .touch-feedback:active {
          transform: scale(0.98);
          transition: transform 0.1s ease-out;
        }

        /* Prevent accidental zooms */
        .no-zoom {
          touch-action: manipulation;
          user-select: none;
        }
      }

      /* Perfect responsive images */
      img {
        max-width: 100%;
        height: auto;
        -webkit-user-drag: none;
        -khtml-user-drag: none;
        -moz-user-drag: none;
        -o-user-drag: none;
        user-drag: none;
      }

      /* Responsive video */
      video {
        max-width: 100%;
        height: auto;
        -webkit-playsinline: true;
        playsinline: true;
      }

      /* Perfect form elements */
      @media (max-width: 768px) {
        input, textarea, select {
          font-size: 16px !important; /* Prevents zoom on iOS */
          padding: 12px 16px !important;
          border-radius: 8px !important;
          border: 2px solid #e5e7eb !important;
          background-color: #ffffff !important;
          -webkit-appearance: none !important;
          appearance: none !important;
        }

        input:focus, textarea:focus, select:focus {
          border-color: #3b82f6 !important;
          outline: none !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
        }
      }

      /* Safe area handling for notched devices */
      @supports (padding: env(safe-area-inset-top)) {
        .safe-top { padding-top: env(safe-area-inset-top); }
        .safe-bottom { padding-bottom: env(safe-area-inset-bottom); }
        .safe-left { padding-left: env(safe-area-inset-left); }
        .safe-right { padding-right: env(safe-area-inset-right); }
        .safe-inset {
          padding-top: env(safe-area-inset-top);
          padding-bottom: env(safe-area-inset-bottom);
          padding-left: env(safe-area-inset-left);
          padding-right: env(safe-area-inset-right);
        }
      }

      /* High DPI screen optimizations */
      @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 2dppx) {
        img, svg {
          image-rendering: -webkit-optimize-contrast;
          image-rendering: crisp-edges;
        }
      }

      /* Accessibility improvements */
      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }
      }

      /* High contrast mode */
      @media (prefers-contrast: high) {
        * {
          border-color: currentColor !important;
        }
      }

      /* Dark mode viewport optimizations */
      @media (prefers-color-scheme: dark) {
        .device-mobile {
          color-scheme: dark;
        }
      }

      /* Print optimizations */
      @media print {
        .device-mobile, .device-tablet, .device-desktop {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
      }
    `;

    // Remove existing styles and add new ones
    const existingStyles = document.getElementById('responsive-viewport-styles');
    if (existingStyles) {
      existingStyles.remove();
    }
    document.head.appendChild(style);

    return () => {
      const styles = document.getElementById('responsive-viewport-styles');
      if (styles) {
        styles.remove();
      }
    };
  }, []);

  return null;
}