import { useState, useEffect } from "react";
import AdminLogin from "@/components/admin-login";
import AdminPanelComplete from "@/components/admin-panel-complete";

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Temporarily bypass auth check
  const [isLoading, setIsLoading] = useState(false);  // Set to false to skip loading

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setIsLoggedIn(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">যাচাই করা হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <AdminLogin onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 admin-panel-container">
      <div className="w-full max-w-full overflow-x-hidden px-2 py-2 sm:px-4 sm:py-4 lg:px-6 lg:py-6">
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:items-start sm:space-y-0">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-1 sm:mb-2 truncate">
                এডমিন ড্যাশবোর্ড
              </h1>  
              <p className="text-xs sm:text-sm lg:text-base text-gray-600 leading-tight">
                Trynex Lifestyle স্টোর ম্যানেজমেন্ট
              </p>
            </div>
            <div className="flex-shrink-0 text-left sm:text-right">
              <p className="text-xs sm:text-sm text-gray-500 font-medium">admin@trynex.com</p>
              <p className="text-xs text-gray-400">সর্বশেষ লগইন: আজ</p>
              <button 
                onClick={handleLogout}
                className="text-xs text-red-600 hover:text-red-800 mt-1 underline"
              >
                লগআউট
              </button>
            </div>
          </div>
        </div>

        <div className="w-full">
          <AdminPanelComplete />
        </div>
      </div>
    </div>
  );
}