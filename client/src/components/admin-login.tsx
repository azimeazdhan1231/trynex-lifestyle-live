import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Shield, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from '@tanstack/react-query'; // Assuming you are using react-query

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [credentials, setCredentials] = useState({
    email: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(false); // State to track login status
  const queryClient = useQueryClient(); // Initialize queryClient

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: credentials.email, password: credentials.password }),
      });

      const data = await response.json();

      if (data.success) {
        // Store admin token in localStorage
        localStorage.setItem('admin_token', data.token);
        localStorage.setItem('admin_data', JSON.stringify(data.user || data.admin));
        setIsLoggedIn(true);
        onLoginSuccess?.();

        // Invalidate queries to refresh data with new token
        queryClient.invalidateQueries();

        toast({
          title: "সফল",
          description: "এডমিন লগইন সফল হয়েছে।",
        });
      } else {
        setError(data.message || "লগইন ব্যর্থ");
      }
    } catch (error) {
      console.error("Admin login error:", error);
      setError("সার্ভার এরর। আবার চেষ্টা করুন।");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const checkAdminAuth = async () => {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        setIsLoggedIn(false);
        return;
      }

      try {
        const response = await fetch('/api/admin/verify', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setIsLoggedIn(true);
            console.log('Admin authentication verified');
            return;
          }
        }
      } catch (error) {
        console.error('Admin auth check failed:', error);
      }

      // If we get here, auth failed
      console.log('Admin authentication failed, clearing tokens');
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_data');
      setIsLoggedIn(false);
    };

    checkAdminAuth();
  }, []);


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">এডমিন লগইন</h1>
          <p className="text-gray-600 mt-2">Trynex Lifestyle Admin Panel</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center">
              <Lock className="w-5 h-5 inline mr-2" />
              নিরাপদ প্রবেশ
            </CardTitle>
            <CardDescription className="text-center">
              এডমিন প্যানেলে প্রবেশের জন্য আপনার তথ্য দিন
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">ইমেইল</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@trynex.com"
                  value={credentials.email}
                  onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">পাসওয়ার্ড</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="আপনার পাসওয়ার্ড"
                    value={credentials.password}
                    onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                    required
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full h-11 bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? "লগইন হচ্ছে..." : "লগইন করুন"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              <p>ডিফল্ট ক্রেডেনশিয়াল:</p>
              <p className="font-mono bg-gray-100 p-2 rounded mt-2">
                admin@trynex.com / admin123
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}