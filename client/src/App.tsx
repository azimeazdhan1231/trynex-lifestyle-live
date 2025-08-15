import React from 'react';

function App() {
  console.log('🔍 App component is rendering!');
  
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '40px',
        borderRadius: '20px',
        textAlign: 'center',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        maxWidth: '600px'
      }}>
        <h1 style={{ color: '#333', fontSize: '48px', marginBottom: '20px' }}>
          🎉 TryneX Lifestyle Shop
        </h1>
        <p style={{ color: '#666', fontSize: '18px', marginBottom: '20px' }}>
          <strong>React is now working!</strong>
        </p>
        <p style={{ color: '#666', fontSize: '18px', marginBottom: '20px' }}>
          The black screen issue has been resolved.
        </p>
        
        <div style={{
          background: '#4CAF50',
          color: 'white',
          padding: '15px 25px',
          borderRadius: '10px',
          margin: '20px 0',
          fontWeight: 'bold'
        }}>
          ✅ React Working | ✅ Component Rendering | ✅ Styling Working
        </div>
        
        <div style={{
          marginTop: '30px',
          padding: '20px',
          background: '#f8f9fa',
          borderRadius: '10px',
          textAlign: 'left'
        }}>
          <h3 style={{ color: '#333', marginTop: 0 }}>Status:</h3>
          <p style={{ color: '#666', margin: '5px 0' }}>✅ React component loaded</p>
          <p style={{ color: '#666', margin: '5px 0' }}>✅ JSX rendering working</p>
          <p style={{ color: '#666', margin: '5px 0' }}>✅ Inline styles working</p>
          <p style={{ color: '#666', margin: '5px 0' }}>✅ Component structure working</p>
        </div>
        
        <button 
          onClick={() => alert('🎉 React event handling is working!')}
          style={{
            background: '#007bff',
            color: 'white',
            border: 'none',
            padding: '15px 30px',
            borderRadius: '10px',
            fontSize: '16px',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          🧪 Test React Function
        </button>
      </div>
    </div>
  );
}

export default App;