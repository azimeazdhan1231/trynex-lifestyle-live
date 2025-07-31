import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogIn, UserPlus, ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Auth() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/user', {
          credentials: 'include'
        });
        if (response.ok) {
          // User is authenticated, redirect to profile
          setLocation('/profile');
          return;
        }
      } catch (error) {
        console.log('User not authenticated');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Handle Replit Auth callback
    const handleReplitAuth = () => {
      // Listen for authentication success
      window.addEventListener('message', async (event) => {
        if (event.data && event.data.type === 'replit-auth-success') {
          try {
            setIsLoading(true);
            // Check if user exists in our database, if not create them
            const userResponse = await fetch('/api/auth/user', {
              credentials: 'include'
            });

            if (userResponse.ok) {
              const userData = await userResponse.json();
              toast({
                title: "সফলভাবে লগইন হয়েছে!",
                description: `স্বাগতম, ${userData.firstName || userData.email}!`
              });
              setLocation('/profile');
            }
          } catch (error) {
            console.error('Auth callback error:', error);
            toast({
              title: "লগইনে সমস্যা",
              description: "আবার চেষ্টা করুন",
              variant: "destructive"
            });
          } finally {
            setIsLoading(false);
          }
        }
      });
    };

    handleReplitAuth();
  }, [setLocation, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="shadow-xl border-0">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
              <p className="text-gray-600">লোড হচ্ছে...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              স্বাগতম Trynex এ
            </CardTitle>
            <p className="text-gray-600 mt-2">
              আপনার অ্যাকাউন্ট তৈরি করুন বা লগইন করুন
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Replit Auth Integration */}
            <div className="text-center">
              <div id="replit-auth-container">
                <script
                  dangerouslySetInnerHTML={{
                    __html: `
                      (function() {
                        if (typeof window !== 'undefined' && !document.getElementById('replit-auth-script')) {
                          const script = document.createElement('script');
                          script.id = 'replit-auth-script';
                          script.src = 'https://auth.util.repl.co/script.js';
                          script.setAttribute('authed', 'window.parent.postMessage({type: "replit-auth-success"}, "*"); setTimeout(() => window.location.reload(), 100);');
                          document.getElementById('replit-auth-container').appendChild(script);
                        }
                      })();
                    `
                  }}
                />
              </div>
            </div>

            <div className="text-center text-sm text-gray-500">
              <p>Replit দিয়ে দ্রুত এবং নিরাপদ লগইন</p>
              <p className="mt-1">একবার লগইন করলে আপনার অর্ডার ট্র্যাক করতে পারবেন</p>
            </div>

            <div className="pt-4 border-t">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setLocation('/')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                হোমে ফিরে যান
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}