
import React, { useState, useEffect } from "react";
import AdminLogin from "@/components/admin-login";
import EnhancedAdminTabs from "@/components/enhanced-admin-tabs";

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      // Set viewport for mobile compatibility
      const existingViewport = document.querySelector('meta[name="viewport"]');
      if (!existingViewport) {
        const viewport = document.createElement('meta');
        viewport.name = 'viewport';
        viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
        document.head.appendChild(viewport);
      }

      // Prevent zoom on inputs in iOS
      const inputs = document.querySelectorAll('input, select, textarea');
      inputs.forEach(input => {
        if (input instanceof HTMLElement) {
          input.style.fontSize = '16px';
        }
      });

      // Check if already logged in (from localStorage)
      const adminToken = localStorage.getItem('adminLoggedIn');
      if (adminToken === 'true') {
        setIsLoggedIn(true);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error("Admin page initialization error:", error);
      setIsLoading(false);
    }
  }, []);

  const handleLoginSuccess = () => {
    try {
      localStorage.setItem('adminLoggedIn', 'true');
      setIsLoggedIn(true);
    } catch (error) {
      console.error("Login success handler error:", error);
      setIsLoggedIn(true); // Still allow login even if localStorage fails
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('adminLoggedIn');
      setIsLoggedIn(false);
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggedIn(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <AdminLogin onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Simplified for mobile */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-2 sm:px-4 lg:px-6 py-2 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <div>
              <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-800">এডমিন ড্যাশবোর্ড</h1>
              <p className="text-xs sm:text-sm text-gray-600">Trynex Lifestyle ম্যানেজমেন্ট সিস্টেম</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-left sm:text-right">
                <p className="text-xs text-gray-500">লগইন: admin@trynex.com</p>
                <p className="text-xs text-gray-400">
                  {new Date().toLocaleDateString('bn-BD', { 
                    day: 'numeric', 
                    month: 'short', 
                    hour: 'numeric', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 transition-colors"
              >
                লগআউট
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full">
        <EnhancedAdminTabs />
      </div>
    </div>
  );
}
