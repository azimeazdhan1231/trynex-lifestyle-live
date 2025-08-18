
import { useState, useEffect } from "react";
import AdminLogin from "@/components/admin-login";
import EnhancedAdminPanel from "@/components/EnhancedAdminPanel";

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if admin is already logged in
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('admin_token');
      
      if (!token) {
        setIsLoggedIn(false);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/admin/verify', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setIsLoggedIn(true);
          } else {
            // Invalid token, remove it
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_data');
            setIsLoggedIn(false);
          }
        } else {
          // Token verification failed
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_data');
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Auth verification error:', error);
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_data');
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
      <EnhancedAdminPanel />
    </div>
  );
}
