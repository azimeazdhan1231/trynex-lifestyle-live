import { useState } from "react";
import AdminLogin from "@/components/admin-login";
import EnhancedAdminTabs from "@/components/enhanced-admin-tabs";

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Add viewport meta tag for mobile compatibility
  React.useEffect(() => {
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
      input.style.fontSize = '16px';
    });
  }, []);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <AdminLogin onLoginSuccess={() => setIsLoggedIn(true)} />
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
          </div>
        </div>
      </div>

      <div className="w-full">
        <EnhancedAdminTabs />
      </div>
    </div>
  );
}