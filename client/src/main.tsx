import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Comprehensive ResizeObserver error suppression
const suppressResizeObserverErrors = () => {
  // Global error handler for uncaught errors
  window.addEventListener('error', (e) => {
    if (e.message && (e.message === 'ResizeObserver loop limit exceeded' || 
        e.message.includes('ResizeObserver loop completed with undelivered notifications') ||
        e.message.includes('ResizeObserver loop'))) {
      e.stopImmediatePropagation();
      e.preventDefault();
      return false;
    }
  }, true);

  // Promise rejection handler
  window.addEventListener('unhandledrejection', (e) => {
    if (e.reason && e.reason.message && 
        (e.reason.message.includes('ResizeObserver') || 
         e.reason.message.includes('loop completed with undelivered notifications'))) {
      e.preventDefault();
      return false;
    }
  });

  // Override console.error to filter ResizeObserver warnings
  const originalError = console.error;
  console.error = (...args) => {
    if (args[0] && typeof args[0] === 'string' && 
        args[0].includes && args[0].includes('ResizeObserver loop completed with undelivered notifications')) {
      return; // Suppress this specific error
    }
    originalError.apply(console, args);
  };

  // Direct ResizeObserver override to prevent the error
  if (typeof window !== 'undefined' && window.ResizeObserver) {
    const OriginalResizeObserver = window.ResizeObserver;
    window.ResizeObserver = class extends OriginalResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        const wrappedCallback: ResizeObserverCallback = (entries, observer) => {
          window.requestAnimationFrame(() => {
            try {
              callback(entries, observer);
            } catch (e: any) {
              if (!e.message?.includes('ResizeObserver loop')) {
                throw e;
              }
            }
          });
        };
        super(wrappedCallback);
      }
    };
  }
};

suppressResizeObserverErrors();

createRoot(document.getElementById("root")!).render(<App />);
