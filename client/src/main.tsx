import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

console.log('🚀 Main.tsx is executing!');

// NUCLEAR OPTION: Bypass React entirely
const rootElement = document.getElementById("root");

if (rootElement) {
  console.log('✅ Root element found, showing test content directly');
  
  // Inject test content directly without React
  rootElement.innerHTML = `
    <div style="
      min-height: 100vh;
      background: linear-gradient(45deg, #ff0000, #00ff00, #0000ff);
      background-size: 400% 400%;
      animation: gradient 3s ease infinite;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: Arial, sans-serif;
    ">
      <div style="
        background: rgba(255, 255, 255, 0.95);
        padding: 40px;
        border-radius: 20px;
        text-align: center;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        max-width: 600px;
      ">
        <h1 style="color: #333; font-size: 48px; margin-bottom: 20px;">🚨 NUCLEAR TEST 🚨</h1>
        <p style="color: #666; font-size: 18px; margin-bottom: 10px;">
          <strong>React has been BYPASSED!</strong>
        </p>
        <p style="color: #666; font-size: 18px; margin-bottom: 10px;">
          If you can see this colorful animated background, the issue is with React.
        </p>
        <p style="color: #666; font-size: 18px; margin-bottom: 10px;">
          If you still see black, the issue is deeper.
        </p>
        
        <div style="
          background: #4CAF50;
          color: white;
          padding: 15px 25px;
          border-radius: 10px;
          margin: 20px 0;
          font-weight: bold;
          font-size: 16px;
        ">
          ✅ HTML Working | ✅ CSS Working | ✅ JavaScript Working
        </div>
        
        <div style="
          margin-top: 30px;
          padding: 20px;
          background: #f0f0f0;
          border-radius: 10px;
          text-align: left;
        ">
          <h3 style="color: #333; margin-top: 0;">Debug Status:</h3>
          <p style="color: #666; margin: 5px 0;">✅ DOM manipulation working</p>
          <p style="color: #666; margin: 5px 0;">✅ CSS animations working</p>
          <p style="color: #666; margin: 5px 0;">✅ JavaScript execution working</p>
          <p style="color: #666; margin: 5px 0;">❌ React rendering (bypassed)</p>
        </div>
        
        <button onclick="testFunction()" style="
          background: #007bff;
          color: white;
          border: none;
          padding: 15px 30px;
          border-radius: 10px;
          font-size: 16px;
          cursor: pointer;
          margin-top: 20px;
        ">
          🧪 Test JavaScript Function
        </button>
      </div>
    </div>
    
    <style>
      @keyframes gradient {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
    </style>
  `;
  
  console.log('✅ Test content injected successfully!');
} else {
  console.error('❌ Root element not found!');
  document.body.innerHTML = '<div style="color: red; padding: 20px; font-size: 24px;">CRITICAL ERROR: Root element not found!</div>';
}

// Test function to verify JavaScript is working
function testFunction() {
  alert('🎉 JavaScript is working! The issue is likely with React or the build process.');
  console.log('🧪 Test function executed successfully!');
}
