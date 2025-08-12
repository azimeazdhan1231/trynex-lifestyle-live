import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Suppress ResizeObserver loop errors
window.addEventListener('error', (e) => {
  if (e.message === 'ResizeObserver loop limit exceeded' || 
      e.message.includes('ResizeObserver loop completed with undelivered notifications')) {
    e.stopPropagation();
    e.preventDefault();
  }
});

createRoot(document.getElementById("root")!).render(<App />);
