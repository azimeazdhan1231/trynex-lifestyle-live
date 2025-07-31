import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Calendar, ShoppingBag } from "lucide-react";

export default function ProfilePage() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "অননুমোদিত",
        description: "আপনি লগআউট হয়ে গেছেন। আবার লগইন করছি...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">প্রোফাইল</h1>
            <p className="text-gray-600 mt-2">আপনার ব্যক্তিগত তথ্য এবং অ্যাকাউন্ট সেটিংস</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Profile Card */}
            <Card className="md:col-span-1">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={user.profileImageUrl || ''} alt={user.firstName || 'User'} />
                    <AvatarFallback className="text-lg">
                      {user.firstName?.[0] || user.email?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="text-xl">
                  {user.firstName && user.lastName 
                    ? `${user.firstName} ${user.lastName}`
                    : 'ব্যবহারকারী'}
                </CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    <span>{user.email}</span>
                  </div>
                  {user.createdAt && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>সদস্য থেকে {new Date(user.createdAt).toLocaleDateString('bn-BD')}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  অ্যাকাউন্ট তথ্য
                </CardTitle>
                <CardDescription>
                  আপনার অ্যাকাউন্টের বিস্তারিত তথ্য
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">প্রথম নাম</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {user.firstName || 'উল্লেখ করা হয়নি'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">শেষ নাম</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {user.lastName || 'উল্লেখ করা হয়নি'}
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <label className="text-sm font-medium text-gray-700">ইমেইল ঠিকানা</label>
                  <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                </div>

                <Separator />

                <div>
                  <label className="text-sm font-medium text-gray-700">অ্যাকাউন্ট স্ট্যাটাস</label>
                  <div className="mt-1">
                    <Badge variant="secondary">সক্রিয়</Badge>
                  </div>
                </div>

                {user.createdAt && (
                  <>
                    <Separator />
                    <div>
                      <label className="text-sm font-medium text-gray-700">অ্যাকাউন্ট তৈরির তারিখ</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(user.createdAt).toLocaleDateString('bn-BD', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  দ্রুত কাজ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <a
                    href="/orders"
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="font-medium text-gray-900">আমার অর্ডার</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      আপনার সকল অর্ডারের তালিকা দেখুন
                    </p>
                  </a>
                  
                  <a
                    href="/products"
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="font-medium text-gray-900">পণ্য ব্রাউজ করুন</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      নতুন পণ্য আবিষ্কার করুন
                    </p>
                  </a>
                  
                  <a
                    href="/api/logout"
                    className="p-4 border rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <h3 className="font-medium text-red-900">লগআউট</h3>
                    <p className="text-sm text-red-600 mt-1">
                      আপনার অ্যাকাউন্ট থেকে বের হন
                    </p>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}