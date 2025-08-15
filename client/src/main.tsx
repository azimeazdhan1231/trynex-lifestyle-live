import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

console.log('🚀 Main.tsx is executing!');

const rootElement = document.getElementById("root");

if (rootElement) {
  console.log('✅ Root element found, creating React root...');
  const root = createRoot(rootElement);
  console.log('✅ React root created, rendering App...');
  root.render(<App />);
  console.log('✅ App rendered!');
} else {
  console.error('❌ Root element not found!');
  document.body.innerHTML = '<div style="color: red; padding: 20px; font-size: 24px;">CRITICAL ERROR: Root element not found!</div>';
}
