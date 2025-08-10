import { useState } from "react";
import AdminLogin from "@/components/admin-login";
import AdminPanelBulletproof from "@/components/admin-panel-bulletproof";

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
    <div className="min-h-screen bg-gray-50">
      <AdminPanelBulletproof />
    </div>
  );
}