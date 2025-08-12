import { useQuery } from "@tanstack/react-query";
import { RotateCcw, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import MobileOptimizedLayout from "@/components/mobile-optimized-layout";

import { COMPANY_NAME } from "@/lib/constants";
import type { Page } from "@shared/schema";

export default function RefundPolicyDynamic() {

  const { data: page, isLoading } = useQuery({
    queryKey: ["/api/pages/refund-policy"],
  });

  return (
    <MobileOptimizedLayout>
      <div className="min-h-screen bg-gray-50">
      
      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-to-br from-green-500 via-green-600 to-emerald-700">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <Badge className="mb-6 bg-white/20 text-white border-white/30">
              রিফান্ড নীতি
            </Badge>
            <div className="flex items-center justify-center mb-6">
              <RotateCcw className="w-12 h-12 mr-4" />
              <h1 className="text-4xl md:text-5xl font-bold">
                {isLoading ? "লোড হচ্ছে..." : page?.title || "রিফান্ড পলিসি"}
              </h1>
            </div>
            <p className="text-xl md:text-2xl opacity-90">
              {COMPANY_NAME} এর রিফান্ড ও রিটার্ন নীতিমালা
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
                      রিফান্ড পলিসি তথ্য লোড করতে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Summary */}
            <Card className="mt-8 shadow-lg bg-green-50 border-green-200">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
                  <h3 className="text-2xl font-bold text-gray-800">দ্রুত তথ্য</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                      <div>
                        <p className="font-semibold text-gray-800">৭ দিনের রিটার্ন গ্যারান্টি</p>
                        <p className="text-sm text-gray-600">পণ্য ডেলিভারির ৭ দিনের মধ্যে রিটার্ন করুন</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                      <div>
                        <p className="font-semibold text-gray-800">দ্রুত রিফান্ড</p>
                        <p className="text-sm text-gray-600">অনুমোদনের ৩-৫ কার্যদিবসে রিফান্ড</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                      <div>
                        <p className="font-semibold text-gray-800">সহজ প্রক্রিয়া</p>
                        <p className="text-sm text-gray-600">হোয়াটসঅ্যাপে যোগাযোগ করে রিটার্ন শুরু করুন</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                      <div>
                        <p className="font-semibold text-gray-800">বিনামূল্যে রিটার্ন</p>
                        <p className="text-sm text-gray-600">আমাদের ভুলে হলে রিটার্ন খরচ আমরা বহন করব</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="mt-8 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <FileText className="w-8 h-8 text-primary mr-3" />
                  <h3 className="text-2xl font-bold text-gray-800">রিটার্নের জন্য যোগাযোগ</h3>
                </div>
                <div className="text-gray-600 leading-relaxed">
                  <p className="mb-4">
                    যেকোনো রিটার্ন বা রিফান্ডের জন্য আমাদের সাথে যোগাযোগ করুন:
                  </p>
                  <ul className="space-y-2">
                    <li><strong>হোয়াটসঅ্যাপ:</strong> +880 1747 292 277</li>
                    <li><strong>কল সেন্টার:</strong> +880 1747 292 277</li>
                    <li><strong>ই-মেইল:</strong> returns@trynexlifestyle.com</li>
                    <li><strong>সময়:</strong> সকাল ৯টা - রাত ১০টা (৭ দিন)</li>
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
              গ্রাহক সন্তুষ্টিই আমাদের অগ্রাধিকার
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