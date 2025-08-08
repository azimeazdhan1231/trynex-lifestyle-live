import { useEffect } from 'react';

// Emergency fix to handle critical rendering issues
export default function EmergencyFix() {
  useEffect(() => {
    // Simple mobile fixes without complex logic
    const applyBasicFixes = () => {
      // Basic viewport fix
      const meta = document.querySelector('meta[name="viewport"]');
      if (meta) {
        meta.setAttribute('content', 'width=device-width, initial-scale=1.0, user-scalable=yes');
      }

      // Basic touch optimization
      const style = document.createElement('style');
      style.textContent = `
        * {
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }
        
        button, a, [role="button"] {
          min-height: 44px;
          min-width: 44px;
          cursor: pointer;
        }
        
        input, textarea, select {
          font-size: 16px !important;
        }
        
        html, body {
          -webkit-overflow-scrolling: touch;
        }
      `;
      document.head.appendChild(style);
    };

    try {
      applyBasicFixes();
    } catch (error) {
      console.warn('Emergency fix failed:', error);
    }
  }, []);

  return null;
}