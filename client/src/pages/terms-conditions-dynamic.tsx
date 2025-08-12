import { useQuery } from "@tanstack/react-query";
import { Shield, FileText, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import MobileOptimizedLayout from "@/components/mobile-optimized-layout";

import { COMPANY_NAME } from "@/lib/constants";
import type { Page } from "@shared/schema";

export default function TermsConditionsDynamic() {

  const { data: page, isLoading } = useQuery({
    queryKey: ["/api/pages/terms-conditions"],
  });

  return (
    <MobileOptimizedLayout>
      <div className="min-h-screen bg-gray-50">
      
      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-to-br from-primary via-primary/90 to-primary/80">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <Badge className="mb-6 bg-white/20 text-white border-white/30">
              আইনি তথ্য
            </Badge>
            <div className="flex items-center justify-center mb-6">
              <FileText className="w-12 h-12 mr-4" />
              <h1 className="text-4xl md:text-5xl font-bold">
                {isLoading ? "লোড হচ্ছে..." : page?.title || "শর্তাবলী"}
              </h1>
            </div>
            <p className="text-xl md:text-2xl opacity-90">
              {COMPANY_NAME} এর নিয়মাবলী এবং শর্তসমূহ
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-lg">
              <CardContent className="p-8">
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-8 w-2/3 mt-8" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                  </div>
                ) : page ? (
                  <div 
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: page.content }}
                  />
                ) : (
                  <div className="text-center py-12">
                    <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-semibold text-gray-600 mb-2">
                      তথ্য পাওয়া যায়নি
                    </h3>
                    <p className="text-gray-500">
                      শর্তাবলী তথ্য লোড করতে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="mt-8 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <Shield className="w-8 h-8 text-primary mr-3" />
                  <h3 className="text-2xl font-bold text-gray-800">যোগাযোগের তথ্য</h3>
                </div>
                <div className="text-gray-600 leading-relaxed">
                  <p className="mb-4">
                    যেকোনো প্রশ্ন বা সহায়তার জন্য আমাদের সাথে যোগাযোগ করুন:
                  </p>
                  <ul className="space-y-2">
                    <li><strong>কোম্পানি:</strong> {COMPANY_NAME}</li>
                    <li><strong>হোয়াটসঅ্যাপ:</strong> +880 1747 292 277</li>
                    <li><strong>ই-মেইল:</strong> support@trynexlifestyle.com</li>
                    <li><strong>ওয়েবসাইট:</strong> https://trynex-lifestyle.pages.dev/</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">{COMPANY_NAME}</h3>
            <p className="text-gray-300 mb-6">
              স্বচ্ছতা এবং বিশ্বস্ততার সাথে সেবা প্রদান
            </p>
            <p className="text-gray-400">
              © 2025 {COMPANY_NAME}. সকল অধিকার সংরক্ষিত।
            </p>
          </div>
        </div>
      </footer>
      </div>
    </MobileOptimizedLayout>
  );
}