import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Lock, 
  Eye, 
  EyeOff, 
  UserPlus, 
  LogIn,
  Phone,
  MapPin,
  User
} from "lucide-react";

interface LoginData {
  phone: string;
  password: string;
}

interface RegisterData {
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
  address: string;
}

export default function PhoneAuth() {
  const [activeTab, setActiveTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const [loginData, setLoginData] = useState<LoginData>({
    phone: "",
    password: ""
  });

  const [registerData, setRegisterData] = useState<RegisterData>({
    phone: "",
    password: "",
    firstName: "",
    lastName: "",
    address: ""
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      return response.json();
    },
    onSuccess: (response) => {
      toast({
        title: "সফলভাবে লগইন হয়েছে",
        description: "স্বাগতম!",
      });
      // Store auth token
      if (response.token) {
        localStorage.setItem("auth_token", response.token);
        localStorage.setItem("user_data", JSON.stringify(response.user));
      }
      queryClient.invalidateQueries();
      navigate("/");
      window.location.reload(); // Force refresh to update auth state
    },
    onError: (error: any) => {
      toast({
        title: "লগইন ব্যর্থ",
        description: error.message || "ফোন নম্বর বা পাসওয়ার্ড ভুল",
        variant: "destructive",
      });
    }
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      return response.json();
    },
    onSuccess: (response) => {
      toast({
        title: "অ্যাকাউন্ট তৈরি হয়েছে",
        description: "এখন আপনি লগইন করা আছেন",
      });
      // Store auth token and log them in immediately
      if (response.token) {
        localStorage.setItem("auth_token", response.token);
        localStorage.setItem("user_data", JSON.stringify(response.user));
      }
      queryClient.invalidateQueries();
      navigate("/");
      window.location.reload(); // Force refresh to update auth state
    },
    onError: (error: any) => {
      toast({
        title: "রেজিস্ট্রেশন ব্যর্থ",
        description: error.message || "এই ফোন নম্বর দিয়ে আগেই অ্যাকাউন্ট আছে",
        variant: "destructive",
      });
    }
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginData.phone || !loginData.password) {
      toast({
        title: "তথ্য অসম্পূর্ণ",
        description: "ফোন নম্বর এবং পাসওয়ার্ড দিন",
        variant: "destructive",
      });
      return;
    }
    
    // Validate phone number format
    if (!/^01[3-9]\d{8}$/.test(loginData.phone)) {
      toast({
        title: "ভুল ফোন নম্বর",
        description: "সঠিক বাংলাদেশি ফোন নম্বর দিন (01XXXXXXXXX)",
        variant: "destructive",
      });
      return;
    }

    loginMutation.mutate(loginData);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerData.phone || !registerData.password || !registerData.firstName || !registerData.address) {
      toast({
        title: "তথ্য অসম্পূর্ণ",
        description: "সব জানা তথ্য দিন",
        variant: "destructive",
      });
      return;
    }

    // Validate phone number format
    if (!/^01[3-9]\d{8}$/.test(registerData.phone)) {
      toast({
        title: "ভুল ফোন নম্বর",
        description: "সঠিক বাংলাদেশি ফোন নম্বর দিন (01XXXXXXXXX)",
        variant: "destructive",
      });
      return;
    }

    // Validate password length
    if (registerData.password.length < 6) {
      toast({
        title: "দুর্বল পাসওয়ার্ড",
        description: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে",
        variant: "destructive",
      });
      return;
    }

    registerMutation.mutate(registerData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Trynex Lifestyle</h1>
          <p className="text-gray-600">আপনার অ্যাকাউন্টে প্রবেশ করুন</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="pb-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-t-lg">
            <CardTitle className="text-center text-xl">
              {activeTab === "login" ? "লগইন করুন" : "নতুন অ্যাকাউন্ট"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  লগইন
                </TabsTrigger>
                <TabsTrigger value="register" className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  রেজিস্টার
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-phone">ফোন নম্বর</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="login-phone"
                        type="tel"
                        placeholder="01XXXXXXXXX"
                        value={loginData.phone}
                        onChange={(e) => setLoginData({...loginData, phone: e.target.value})}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">পাসওয়ার্ড</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="আপনার পাসওয়ার্ড"
                        value={loginData.password}
                        onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                        className="pl-10 pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "লগইন হচ্ছে..." : "লগইন করুন"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="space-y-4">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">নাম</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="firstName"
                          placeholder="আপনার নাম"
                          value={registerData.firstName}
                          onChange={(e) => setRegisterData({...registerData, firstName: e.target.value})}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">পদবী (ঐচ্ছিক)</Label>
                      <Input
                        id="lastName"
                        placeholder="পদবী"
                        value={registerData.lastName}
                        onChange={(e) => setRegisterData({...registerData, lastName: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-phone">ফোন নম্বর</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="register-phone"
                        type="tel"
                        placeholder="01XXXXXXXXX"
                        value={registerData.phone}
                        onChange={(e) => setRegisterData({...registerData, phone: e.target.value})}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">ঠিকানা</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                      <Input
                        id="address"
                        placeholder="আপনার সম্পূর্ণ ঠিকানা"
                        value={registerData.address}
                        onChange={(e) => setRegisterData({...registerData, address: e.target.value})}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">পাসওয়ার্ড</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="register-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="আপনার পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                        className="pl-10 pr-10"
                        required
                        minLength={6}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? "অ্যাকাউন্ট তৈরি হচ্ছে..." : "অ্যাকাউন্ট তৈরি করুন"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="text-center text-sm text-gray-600 mt-4">
              <p>লগইন করে আপনি আমাদের শর্তাবলী মেনে নিচ্ছেন</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}