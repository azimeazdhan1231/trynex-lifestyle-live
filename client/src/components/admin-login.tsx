
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Eye, EyeOff, Lock } from "lucide-react";

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: async (loginData: { email: string; password: string }) => {
      try {
        const response = await apiRequest("POST", "/api/admin/login", loginData);
        const result = await response.json();
        return result;
      } catch (error) {
        console.error("Login error:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      try {
        if (data && data.success) {
          toast({
            title: "লগইন সফল",
            description: "এডমিন প্যানেলে স্বাগতম",
          });
          onLoginSuccess();
        } else {
          toast({
            title: "লগইন ব্যর্থ",
            description: "ভুল ইমেইল বা পাসওয়ার্ড",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Success handler error:", error);
        toast({
          title: "লগইনে সমস্যা",
          description: "আবার চেষ্টা করুন",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      console.error("Login mutation error:", error);
      toast({
        title: "লগইনে সমস্যা",
        description: "আবার চেষ্টা করুন",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!formData.email || !formData.password) {
        toast({
          title: "তথ্য অসম্পূর্ণ",
          description: "ইমেইল এবং পাসওয়ার্ড দিন",
          variant: "destructive",
        });
        return;
      }

      // For demo purposes, allow direct login
      if (formData.email === "admin@trynex.com" && formData.password === "admin123") {
        toast({
          title: "লগইন সফল",
          description: "এডমিন প্যানেলে স্বাগতম",
        });
        onLoginSuccess();
        return;
      }

      loginMutation.mutate(formData);
    } catch (error) {
      console.error("Submit handler error:", error);
      toast({
        title: "লগইনে সমস্যা",
        description: "আবার চেষ্টা করুন",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    try {
      setFormData(prev => ({ ...prev, [field]: value }));
    } catch (error) {
      console.error("Input change error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl">এডমিন লগইন</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">ইমেইল</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="admin@trynex.com"
                required
                style={{ fontSize: '16px' }}
              />
            </div>

            <div>
              <Label htmlFor="password">পাসওয়ার্ড</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  placeholder="পাসওয়ার্ড লিখুন"
                  required
                  style={{ fontSize: '16px' }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "লগইন হচ্ছে..." : "লগইন করুন"}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">
              <strong>ডেমো লগইন তথ্য:</strong>
            </p>
            <p className="text-xs text-gray-500">
              ইমেইল: admin@trynex.com<br />
              পাসওয়ার্ড: admin123
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
