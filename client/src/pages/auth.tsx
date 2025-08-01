import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  UserPlus, 
  LogIn,
  Phone,
  MapPin,
  Facebook,
  Chrome
} from "lucide-react";

export default function Auth() {
  const [activeTab, setActiveTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/profile");
    }
  }, [isAuthenticated, navigate]);

  const [formData, setFormData] = useState({
    phone: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    address: ""
  });

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.phone || !formData.password) {
      toast({
        title: "তথ্য অসম্পূর্ণ",
        description: "ফোন নম্বর এবং পাসওয়ার্ড প্রয়োজন",
        variant: "destructive",
      });
      return false;
    }

    // Validate phone number format
    const phoneRegex = /^(\+88)?0?1[3-9]\d{8}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast({
        title: "ভুল ফোন নম্বর",
        description: "সঠিক বাংলাদেশী ফোন নম্বর দিন (যেমন: 01712345678)",
        variant: "destructive",
      });
      return false;
    }

    if (activeTab === "signup") {
      if (!formData.firstName || !formData.address || !formData.confirmPassword) {
        toast({
          title: "তথ্য অসম্পূর্ণ",
          description: "সকল প্রয়োজনীয় তথ্য পূরণ করুন",
          variant: "destructive",
        });
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "পাসওয়ার্ড মিলছে না",
          description: "পাসওয়ার্ড এবং নিশ্চিত পাসওয়ার্ড একই হতে হবে",
          variant: "destructive",
        });
        return false;
      }

      if (formData.password.length < 6) {
        toast({
          title: "পাসওয়ার্ড খুবই ছোট",
          description: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে",
          variant: "destructive",
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      const endpoint = activeTab === "signup" ? "/api/auth/register" : "/api/auth/login";
      const payload = activeTab === "signup" ? {
        phone: formData.phone,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        address: formData.address
      } : {
        phone: formData.phone,
        password: formData.password
      };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: activeTab === "signup" ? "সাইনআপ সফল!" : "লগইন সফল!",
          description: activeTab === "signup" ? "আপনার অ্যাকাউন্ট তৈরি হয়েছে" : "স্বাগতম!",
        });
        
        // Store auth token
        localStorage.setItem('authToken', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        
        // Clear form data
        setFormData({
          phone: "",
          password: "",
          confirmPassword: "",
          firstName: "",
          lastName: "",
          address: ""
        });
        
        // Redirect to home or intended page
        navigate("/");
      } else {
        // Handle specific error messages
        if (result.error === 'PHONE_ALREADY_REGISTERED') {
          toast({
            title: "নম্বর ইতিমধ্যে রেজিস্টার্ড",
            description: "এই ফোন নম্বর দিয়ে আগেই অ্যাকাউন্ট আছে। লগইন করুন।",
            variant: "destructive",
          });
          // Auto-switch to login tab
          setActiveTab("login");
          setFormData(prev => ({ ...prev, password: "", confirmPassword: "", firstName: "", lastName: "", address: "" }));
        } else {
          toast({
            title: "সমস্যা হয়েছে",
            description: result.message || "আবার চেষ্টা করুন",
            variant: "destructive",
          });
        }
      }
      
    } catch (error) {
      console.error("Auth error:", error);
      toast({
        title: "নেটওয়ার্ক সমস্যা",
        description: "ইন্টারনেট সংযোগ চেক করুন এবং আবার চেষ্টা করুন",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    setIsLoading(true);
    
    try {
      // All social logins go through Replit Auth
      window.location.href = "/api/login";
    } catch (error) {
      console.error("Social login error:", error);
      toast({
        title: "সমস্যা হয়েছে",
        description: "আবার চেষ্টা করুন",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <User className="w-16 h-16 mx-auto text-green-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">স্বাগতম!</h2>
            <p className="text-gray-600 mb-4">আপনি সফলভাবে লগইন হয়েছেন</p>
            <Button onClick={() => navigate("/profile")} className="w-full">
              প্রোফাইল দেখুন
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo/Brand */}
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Trynex Lifestyle</h1>
          <p className="text-gray-600 mt-2">আপনার অ্যাকাউন্টে স্বাগতম</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-xl">
              আপনার অ্যাকাউন্ট
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login" className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  লগইন
                </TabsTrigger>
                <TabsTrigger value="signup" className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  সাইনআপ
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="login-phone">ফোন নম্বর</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-phone"
                        type="tel"
                        placeholder="01712345678"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="login-password">পাসওয়ার্ড</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="আপনার পাসওয়ার্ড"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        className="pl-10 pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "লগইন হচ্ছে..." : "লগইন করুন"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">নাম</Label>
                      <Input
                        id="firstName"
                        placeholder="নাম"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">পদবী</Label>
                      <Input
                        id="lastName"
                        placeholder="পদবী"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="signup-phone">ফোন নম্বর</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-phone"
                        type="tel"
                        placeholder="01712345678"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">ঠিকানা</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="address"
                        type="text"
                        placeholder="আপনার সম্পূর্ণ ঠিকানা"
                        value={formData.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="signup-password">পাসওয়ার্ড</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="কমপক্ষে ৬ অক্ষর"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        className="pl-10 pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">পাসওয়ার্ড নিশ্চিত করুন</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="পাসওয়ার্ড আবার লিখুন"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "অ্যাকাউন্ট তৈরি হচ্ছে..." : "অ্যাকাউন্ট তৈরি করুন"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">অথবা</span>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleSocialLogin("google")}
                  disabled={isLoading}
                >
                  <Chrome className="w-4 h-4 mr-2" />
                  গুগল দিয়ে লগইন করুন
                </Button>

                <Button
                  variant="outline"
                  className="w-full bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
                  onClick={() => handleSocialLogin("facebook")}
                  disabled={isLoading}
                >
                  <Facebook className="w-4 h-4 mr-2" />
                  ফেসবুক দিয়ে লগইন করুন
                </Button>
              </div>
            </div>

            <div className="text-center text-sm text-gray-600">
              <p>
                {activeTab === "login" ? "অ্যাকাউন্ট নেই? " : "ইতিমধ্যে অ্যাকাউন্ট আছে? "}
                <Button
                  variant="link"
                  className="p-0 h-auto text-blue-600 font-semibold"
                  onClick={() => setActiveTab(activeTab === "login" ? "signup" : "login")}
                >
                  {activeTab === "login" ? "সাইনআপ করুন" : "লগইন করুন"}
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900">সাহায্য প্রয়োজন?</h3>
                <p className="text-sm text-blue-700">
                  যদি লগইন/সাইনআপে সমস্যা হয়, আমাদের সাথে হোয়াটসঅ্যাপে যোগাযোগ করুন
                </p>
                <Button
                  variant="link"
                  className="p-0 h-auto text-blue-600 font-semibold mt-1"
                  onClick={() => window.open("https://wa.me/8801XXXXXXXXX", "_blank")}
                >
                  হোয়াটসঅ্যাপে যোগাযোগ →
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}