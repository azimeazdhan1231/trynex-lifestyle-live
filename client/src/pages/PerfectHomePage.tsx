import React from 'react';

export default function PerfectHomePage() {
  console.log('🔍 PerfectHomePage component is rendering!');
  
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#ff0000',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>🚨 TEST PAGE 🚨</h1>
        <p>If you can see this RED page, routing is working!</p>
        <p>If you still see black, there's a deeper issue.</p>
        <div style={{ 
          backgroundColor: 'white', 
          color: 'black', 
          padding: '20px', 
          marginTop: '20px',
          borderRadius: '10px'
        }}>
          <h2>Debug Info:</h2>
          <p>✅ Component loaded</p>
          <p>✅ React rendering</p>
          <p>✅ CSS working</p>
          <p>✅ No complex dependencies</p>
        </div>
      </div>
    </div>
  );
} 