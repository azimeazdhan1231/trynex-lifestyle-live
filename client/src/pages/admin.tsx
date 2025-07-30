import { useState } from "react";
import AdminLogin from "@/components/admin-login";
import EnhancedAdminTabs from "@/components/enhanced-admin-tabs";

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (!isLoggedIn) {
    return <AdminLogin onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">এডমিন ড্যাশবোর্ড</h1>
            <p className="text-gray-600">Trynex Lifestyle স্টোর ম্যানেজমেন্ট সিস্টেম</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">লগইন: admin@trynex.com</p>
            <p className="text-xs text-gray-400">সর্বশেষ লগইন: আজ 9:30 PM</p>
          </div>
        </div>
      </div>

      <EnhancedAdminTabs />
    </div>
  );
}