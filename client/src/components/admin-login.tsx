
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Shield, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from '@tanstack/react-query';
import AdminPanelNew from "./AdminPanelNew";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if admin is already logged in
  useEffect(() => {
    const checkAdminAuth = () => {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('admin_token');
      if (token) {
        setIsLoggedIn(true);
      }
    };
    checkAdminAuth();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'লগইন ব্যর্থ হয়েছে');
      }

      // Store the token with both keys for compatibility
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_data', JSON.stringify(data.admin));

      // Clear any cached queries and refetch
      queryClient.clear();
      
      setIsLoggedIn(true);
      
      toast({
        title: "সফল!",
        description: "অ্যাডমিন প্যানেলে স্বাগতম",
      });

    } catch (error: any) {
      setError(error.message);
      toast({
        title: "লগইন ব্যর্থ",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_data');
    queryClient.clear();
    setIsLoggedIn(false);
    toast({
      title: "লগআউট সফল",
      description: "আপনি সফলভাবে লগআউট হয়েছেন।",
    });
  };

  // If logged in, show the admin panel
  if (isLoggedIn) {
    return <AdminPanelNew onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">অ্যাডমিন প্যানেল</h1>
          <p className="text-gray-600">TryneX Lifestyle</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">লগইন করুন</CardTitle>
            <CardDescription className="text-center">
              অ্যাডমিন প্যানেলে প্রবেশ করতে আপনার তথ্য দিন
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">ইমেইল</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@trynex.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">পাসওয়ার্ড</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="আপনার পাসওয়ার্ড"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    লগইন হচ্ছে...
                  </div>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    লগইন করুন
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                ডেভেলপমেন্ট টেস্টিং এর জন্য:
              </p>
              <p className="text-xs text-gray-500 mt-1">
                ইমেইল: admin@trynex.com | পাসওয়ার্ড: admin123
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
