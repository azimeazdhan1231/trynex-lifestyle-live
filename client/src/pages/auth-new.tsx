import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import MobileOptimizedLayout from '@/components/mobile-optimized-layout';
import { useToast } from '@/hooks/use-toast';
import { COMPANY_NAME } from '@/lib/constants';
import { 
  Phone, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  LogIn, 
  UserPlus, 
  Shield,
  CheckCircle,
  Smartphone
} from 'lucide-react';
import { Link } from 'wouter';

export default function AuthNew() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    name: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validation
      if (!formData.phone || !formData.password) {
        toast({
          title: "ত্রুটি",
          description: "সকল ক্ষেত্র পূরণ করুন",
          variant: "destructive",
        });
        return;
      }

      // Phone number validation
      const phoneRegex = /^(\+8801|01)[0-9]{9}$/;
      if (!phoneRegex.test(formData.phone)) {
        toast({
          title: "ভুল ফোন নম্বর",
          description: "সঠিক বাংলাদেশি ফোন নম্বর দিন (যেমন: 01XXXXXXXXX)",
          variant: "destructive",
        });
        return;
      }

      if (!isLogin) {
        // Registration validation
        if (!formData.name) {
          toast({
            title: "নাম প্রয়োজন",
            description: "আপনার নাম লিখুন",
            variant: "destructive",
          });
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          toast({
            title: "পাসওয়ার্ড মিলছে না",
            description: "পাসওয়ার্ড এবং নিশ্চিত পাসওয়ার্ড একই হতে হবে",
            variant: "destructive",
          });
          return;
        }

        if (formData.password.length < 6) {
          toast({
            title: "দুর্বল পাসওয়ার্ড",
            description: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে",
            variant: "destructive",
          });
          return;
        }
      }

      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (isLogin) {
        // Login logic
        toast({
          title: "সফলভাবে লগইন হয়েছে",
          description: `স্বাগতম! আপনি ${formData.phone} দিয়ে লগইন করেছেন`,
        });
        
        // Store user session
        localStorage.setItem('user', JSON.stringify({
          phone: formData.phone,
          isAuthenticated: true
        }));
        
        // Redirect to dashboard or home
        window.location.href = '/dashboard';
      } else {
        // Registration logic
        toast({
          title: "সফলভাবে রেজিস্ট্রেশন হয়েছে",
          description: `স্বাগতম ${formData.name}! আপনি ${formData.phone} দিয়ে রেজিস্ট্রেশন করেছেন`,
        });
        
        // Store user session
        localStorage.setItem('user', JSON.stringify({
          phone: formData.phone,
          name: formData.name,
          isAuthenticated: true
        }));
        
        // Redirect to dashboard or home
        window.location.href = '/dashboard';
      }
    } catch (error) {
      toast({
        title: "ত্রুটি ঘটেছে",
        description: "আবার চেষ্টা করুন",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      phone: '',
      password: '',
      name: '',
      confirmPassword: ''
    });
  };

  return (
    <MobileOptimizedLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Smartphone className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isLogin ? 'লগইন করুন' : 'রেজিস্ট্রেশন করুন'}
            </h1>
            <p className="text-gray-600">
              {isLogin 
                ? `${COMPANY_NAME} এ আপনার অ্যাকাউন্টে প্রবেশ করুন` 
                : `${COMPANY_NAME} এ নতুন অ্যাকাউন্ট তৈরি করুন`
              }
            </p>
          </div>

          {/* Main Form Card */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <CardTitle className="flex items-center justify-center text-xl text-gray-800">
                {isLogin ? (
                  <>
                    <LogIn className="w-6 h-6 mr-2 text-primary" />
                    অ্যাকাউন্ট লগইন
                  </>
                ) : (
                  <>
                    <UserPlus className="w-6 h-6 mr-2 text-primary" />
                    নতুন অ্যাকাউন্ট
                  </>
                )}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Field (Registration only) */}
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                      আপনার নাম *
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="আপনার পূর্ণ নাম লিখুন"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="pl-10 py-3 border-gray-200 focus:border-primary"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                )}

                {/* Phone Field */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                    ফোন নম্বর *
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="01XXXXXXXXX"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="pl-10 py-3 border-gray-200 focus:border-primary"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    উদাহরণ: 01712345678
                  </p>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    পাসওয়ার্ড *
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="আপনার পাসওয়ার্ড"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pl-10 pr-10 py-3 border-gray-200 focus:border-primary"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {!isLogin && (
                    <p className="text-xs text-gray-500">
                      কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড ব্যবহার করুন
                    </p>
                  )}
                </div>

                {/* Confirm Password (Registration only) */}
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                      পাসওয়ার্ড নিশ্চিত করুন *
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="পাসওয়ার্ড আবার লিখুন"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="pl-10 py-3 border-gray-200 focus:border-primary"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-medium text-lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      প্রক্রিয়াধীন...
                    </div>
                  ) : (
                    <>
                      {isLogin ? (
                        <>
                          <LogIn className="w-5 h-5 mr-2" />
                          লগইন করুন
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-5 h-5 mr-2" />
                          রেজিস্ট্রেশন করুন
                        </>
                      )}
                    </>
                  )}
                </Button>
              </form>

              <Separator />

              {/* Toggle Mode */}
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  {isLogin ? 'নতুন অ্যাকাউন্ট দরকার?' : 'আগে থেকেই অ্যাকাউন্ট আছে?'}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={toggleMode}
                  className="w-full border-2 border-primary text-primary hover:bg-primary/5"
                >
                  {isLogin ? (
                    <>
                      <UserPlus className="w-5 h-5 mr-2" />
                      রেজিস্ট্রেশন করুন
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5 mr-2" />
                      লগইন করুন
                    </>
                  )}
                </Button>
              </div>

              {/* Security Notice */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-green-800">
                    <p className="font-medium mb-1">আপনার তথ্য সুরক্ষিত</p>
                    <ul className="space-y-1 text-green-700">
                      <li>• সকল তথ্য এনক্রিপ্টেড সংরক্ষণ</li>
                      <li>• কোন তৃতীয় পক্ষের সাথে শেয়ার করা হয় না</li>
                      <li>• ২৪/৭ মনিটরিং ও সিকিউরিটি</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Footer Links */}
              <div className="text-center space-y-2">
                <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm">
                  <Link href="/terms-conditions" className="text-blue-600 hover:text-blue-800">
                    নিয়ম ও শর্তাবলী
                  </Link>
                  <Link href="/privacy" className="text-blue-600 hover:text-blue-800">
                    গোপনীয়তা নীতি
                  </Link>
                  <Link href="/contact" className="text-blue-600 hover:text-blue-800">
                    সাহায্য
                  </Link>
                </div>
                <p className="text-xs text-gray-500">
                  © 2025 {COMPANY_NAME}. সর্বস্বত্ব সংরক্ষিত।
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MobileOptimizedLayout>
  );
}