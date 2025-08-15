import React, { useState, useEffect } from 'react';

export default function PerfectHomePage() {
  console.log('PerfectHomePage component rendering...'); // Debug log
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('PerfectHomePage useEffect running...'); // Debug log
    // Simulate API call
    const timer = setTimeout(() => {
      setIsLoading(false);
      console.log('Loading finished, setting isLoading to false'); // Debug log
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  console.log('Current state:', { isLoading }); // Debug log

  if (isLoading) {
    console.log('Rendering loading state...'); // Debug log
    return (
      <div className="min-h-screen bg-blue-500 flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-4xl font-bold mb-4">Loading...</h1>
          <p>Please wait while we load your content</p>
        </div>
      </div>
    );
  }

  console.log('Rendering main content...'); // Debug log

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center text-white">
          <h1 className="text-6xl font-bold mb-6">
            TryneX Lifestyle Shop
          </h1>
          <p className="text-xl mb-8">
            Welcome to your premium customization destination!
          </p>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4">🎉 Success!</h2>
            <p className="mb-4">
              Your website is now working! The black screen issue has been resolved.
            </p>
            <p className="text-sm opacity-80">
              This is a test page to verify the routing and component rendering is working correctly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 