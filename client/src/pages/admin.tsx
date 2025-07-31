import { useState } from "react";
import AdminLogin from "@/components/admin-login";
import AdminPanelNew from "@/components/admin-panel-new";

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (!isLoggedIn) {
    return <AdminLogin onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 admin-panel-container">
      {/* Mobile-responsive container */}
      <div className="w-full max-w-full overflow-x-hidden px-2 py-2 sm:px-4 sm:py-4 lg:px-6 lg:py-6">
        {/* Header */}
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
            </div>
          </div>
        </div>

        {/* Main Content - New Admin Panel */}
        <div className="w-full">
          <AdminPanelNew />
        </div>
      </div>
    </div>
  );
}