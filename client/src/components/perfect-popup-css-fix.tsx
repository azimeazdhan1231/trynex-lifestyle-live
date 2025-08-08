import { useEffect } from 'react';

export default function PerfectPopupCSSFix() {
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'popup-perfect-css-fix';
    style.textContent = `
      /* Perfect popup close button positioning */
      [data-testid="popup-content"] {
        position: relative !important;
        isolation: isolate;
      }
      
      [data-testid="popup-close-button"] {
        position: absolute !important;
        top: -8px !important;
        right: -8px !important;
        z-index: 9999 !important;
        width: 24px !important;
        height: 24px !important;
        background-color: #ef4444 !important;
        border: 2px solid white !important;
        border-radius: 50% !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        cursor: pointer !important;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
        transition: all 0.2s ease !important;
      }
      
      [data-testid="popup-close-button"]:hover {
        background-color: #dc2626 !important;
        transform: scale(1.1) !important;
      }
      
      [data-testid="popup-close-button"]:active {
        transform: scale(0.95) !important;
      }
      
      [data-testid="popup-close-button"] svg {
        width: 12px !important;
        height: 12px !important;
        color: white !important;
        stroke-width: 2 !important;
      }
      
      /* Perfect popup overlay */
      [data-testid="popup-overlay"] {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        z-index: 9998 !important;
        background-color: rgba(0, 0, 0, 0.6) !important;
        backdrop-filter: blur(4px) !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        padding: 12px !important;
      }
      
      /* Perfect popup content container */
      [data-testid="popup-content"] {
        background: white !important;
        border-radius: 16px !important;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
        width: 100% !important;
        max-width: 384px !important;
        max-height: 95vh !important;
        overflow: hidden !important;
        position: relative !important;
        margin: auto !important;
      }
      
      /* Perfect scrollable content */
      .popup-scrollable-content {
        overflow-y: auto !important;
        max-height: 95vh !important;
        -webkit-overflow-scrolling: touch !important;
      }
      
      /* Hide scrollbar in popup */
      .popup-scrollable-content::-webkit-scrollbar {
        display: none !important;
      }
      
      .popup-scrollable-content {
        scrollbar-width: none !important;
        -ms-overflow-style: none !important;
      }
      
      /* Perfect mobile responsiveness */
      @media (max-width: 480px) {
        [data-testid="popup-overlay"] {
          padding: 8px !important;
        }
        
        [data-testid="popup-content"] {
          max-width: calc(100vw - 16px) !important;
          max-height: calc(100vh - 16px) !important;
        }
        
        [data-testid="popup-close-button"] {
          top: -6px !important;
          right: -6px !important;
          width: 28px !important;
          height: 28px !important;
        }
        
        [data-testid="popup-close-button"] svg {
          width: 14px !important;
          height: 14px !important;
        }
      }
    `;
    
    document.head.appendChild(style);
    
    return () => {
      const existingStyle = document.getElementById('popup-perfect-css-fix');
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  return null;
}