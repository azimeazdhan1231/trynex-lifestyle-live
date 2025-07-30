import { useState } from "react";
import AdminLogin from "@/components/admin-login";
import AdminTabs from "@/components/admin-tabs";

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (!isLoggedIn) {
    return <AdminLogin onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">এডমিন ড্যাশবোর্ড</h1>
        <p className="text-gray-600">Trynex Lifestyle স্টোর ম্যানেজমেন্ট</p>
      </div>

      <AdminTabs />
    </div>
  );
}