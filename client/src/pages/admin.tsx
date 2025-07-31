import { useState } from "react";
import AdminLogin from "@/components/admin-login";
import EnhancedAdminTabs from "@/components/enhanced-admin-tabs";

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (!isLoggedIn) {
    return <AdminLogin onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-6">
      {/* Mobile Chrome compatibility fix */}
      <div className="mobile-chrome-fix" style={{ minHeight: 'calc(100vh - env(safe-area-inset-bottom))' }}>
        {/* Header */}
        <div className="mb-4 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">এডমিন ড্যাশবোর্ড</h1>
              <p className="text-sm sm:text-base text-gray-600">Trynex Lifestyle স্টোর ম্যানেজমেন্ট সিস্টেম</p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs sm:text-sm text-gray-500">লগইন: admin@trynex.com</p>
              <p className="text-xs text-gray-400">সর্বশেষ লগইন: আজ 9:30 PM</p>
            </div>
          </div>
        </div>

        <div className="w-full overflow-x-hidden">
          <EnhancedAdminTabs />
        </div>
      </div>
    </div>
  );
}