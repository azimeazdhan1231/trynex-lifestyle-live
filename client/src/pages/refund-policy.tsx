import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import MobileOptimizedLayout from '@/components/mobile-optimized-layout';
import { COMPANY_NAME, WHATSAPP_NUMBER } from '@/lib/constants';
import { RotateCcw, Shield, Clock, MessageCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import { Link } from 'wouter';

export default function RefundPolicyPage() {
  const createWhatsAppUrl = (message: string) => {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  };

  return (
    <MobileOptimizedLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Hero Section */}
        <section className="py-12 sm:py-16 bg-gradient-to-br from-orange-600 via-red-600 to-pink-700">
          <div className="container mx-auto px-4">
            <div className="text-center text-white max-w-4xl mx-auto">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                <RotateCcw className="w-10 h-10 sm:w-12 sm:h-12" />
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                রিফান্ড ও রিপ্লেসমেন্ট
              </h1>
              <p className="text-xl sm:text-2xl text-orange-100 mb-6">
                {COMPANY_NAME} এর ফেরত ও পরিবর্তন নীতিমালা
              </p>
              <p className="text-lg text-orange-200 max-w-2xl mx-auto">
                আমরা গ্রাহক সন্তুষ্টিকে সর্বোচ্চ প্রাধান্য দেই এবং ন্যায্য রিফান্ড নীতি অনুসরণ করি
              </p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-6">

              {/* Refund Policy Overview */}
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl text-blue-900">
                    <Shield className="w-6 h-6 mr-3" />
                    রিফান্ড নীতির সার-সংক্ষেপ
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-blue-800 leading-relaxed">
                  <p className="font-medium">
                    আমরা গ্রাহকদের সন্তুষ্টি নিশ্চিত করতে প্রতিশ্রুতিবদ্ধ। নিম্নলিখিত শর্তাদির অধীনে রিফান্ড ও রিপ্লেসমেন্ট প্রদান করি:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white/50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">রিফান্ড সময়সীমা</h4>
                      <p className="text-sm">পণ্য গ্রহণের ৭ দিনের মধ্যে</p>
                    </div>
                    <div className="bg-white/50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">রিপ্লেসমেন্ট সময়সীমা</h4>
                      <p className="text-sm">পণ্য গ্রহণের ১৫ দিনের মধ্যে</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Refund Conditions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-xl text-gray-800">
                    <CheckCircle className="w-6 h-6 mr-3 text-green-600" />
                    রিফান্ডের শর্তাবলী
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-gray-700 leading-relaxed">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">রিফান্ড পাবেন যখন:</h4>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>পণ্য বর্ণনার সাথে মিলছে না</li>
                      <li>পণ্যে কোন ত্রুটি বা ক্ষতি রয়েছে</li>
                      <li>ভুল পণ্য ডেলিভার হয়েছে</li>
                      <li>পণ্যের মান আশানুরূপ নয়</li>
                      <li>সাইজ বা কালারে সমস্যা আছে</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-2">রিফান্ড প্রক্রিয়া:</h4>
                    <ol className="list-decimal pl-6 space-y-1 text-green-700">
                      <li>হোয়াটসঅ্যাপে অভিযোগ জানান</li>
                      <li>পণ্যের ছবি পাঠান</li>
                      <li>রিটার্ন কনফার্ম করুন</li>
                      <li>২-৩ দিনে টাকা ফেরত পাবেন</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>

              {/* Replacement Conditions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-xl text-gray-800">
                    <RotateCcw className="w-6 h-6 mr-3 text-orange-600" />
                    রিপ্লেসমেন্টের শর্তাবলী
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-gray-700 leading-relaxed">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">রিপ্লেসমেন্ট পাবেন যখন:</h4>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>পণ্যে উৎপাদনগত ত্রুটি রয়েছে</li>
                      <li>সাইজ পরিবর্তন করতে চান</li>
                      <li>কালার/ডিজাইন পরিবর্তন প্রয়োজন</li>
                      <li>পণ্য অক্ষত ও ব্যবহার করা হয়নি</li>
                      <li>অরিজিনাল প্যাকেজিং আছে</li>
                    </ul>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <h4 className="font-semibold text-orange-800 mb-2">রিপ্লেসমেন্ট প্রক্রিয়া:</h4>
                    <ol className="list-decimal pl-6 space-y-1 text-orange-700">
                      <li>হোয়াটসঅ্যাপে রিপ্লেসমেন্ট রিকুয়েস্ট</li>
                      <li>পুরনো পণ্য রিটার্ন করুন</li>
                      <li>নতুন পণ্য কনফার্ম করুন</li>
                      <li>৩-৫ দিনে নতুন পণ্য পাবেন</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>

              {/* Non-Refundable Items */}
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl text-red-800">
                    <AlertTriangle className="w-6 h-6 mr-3" />
                    রিফান্ড/রিপ্লেসমেন্ট প্রযোজ্য নয়
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-red-700 leading-relaxed">
                  <p className="font-medium">নিম্নলিখিত ক্ষেত্রে রিফান্ড বা রিপ্লেসমেন্ট দেওয়া হবে না:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>কাস্টমাইজড/ব্যক্তিগত পণ্য</li>
                    <li>৭/১৫ দিনের পর রিকুয়েস্ট</li>
                    <li>পণ্য ব্যবহার করার পর</li>
                    <li>ক্ষতিগ্রস্ত বা নষ্ট অবস্থায়</li>
                    <li>ট্যাগ বা লেবেল ছেঁড়া থাকলে</li>
                    <li>পণ্যে কোন দাগ বা গন্ধ থাকলে</li>
                    <li>গ্রাহকের ভুল অর্ডারের জন্য</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Custom Orders Policy */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-gray-800">
                    কাস্টম অর্ডার নীতি
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-gray-700 leading-relaxed">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">বিশেষ শর্তাবলী:</h4>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>কাস্টম পণ্যের সাধারণত রিফান্ড হয় না</li>
                      <li>তবে আমাদের ত্রুটির ক্ষেত্রে সম্পূর্ণ রিফান্ড</li>
                      <li>অর্ডার কনফার্মের ২৪ ঘন্টার মধ্যে বাতিল সম্ভব</li>
                      <li>প্রডাকশন শুরুর পর বাতিল করা যাবে না</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Refund Timeline */}
              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl text-green-800">
                    <Clock className="w-6 h-6 mr-3" />
                    রিফান্ডের সময়সূচী
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-green-700">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-green-800 mb-3">bKash/Nagad রিফান্ড:</h4>
                      <ul className="space-y-2">
                        <li>• অনুরোধের ২-৩ কার্যদিবসে</li>
                        <li>• একই নম্বরে ফেরত</li>
                        <li>• SMS নোটিফিকেশন পাবেন</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-800 mb-3">ব্যাংক ট্রানস্ফার:</h4>
                      <ul className="space-y-2">
                        <li>• ৫-৭ কার্যদিবসে</li>
                        <li>• অ্যাকাউন্ট তথ্য প্রয়োজন</li>
                        <li>• ইমেইল কনফার্মেশন</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Section */}
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="p-8 text-center">
                  <h3 className="text-2xl font-bold text-blue-800 mb-4">
                    রিফান্ড/রিপ্লেসমেন্ট চান?
                  </h3>
                  <p className="text-blue-700 mb-6">
                    যেকোনো সমস্যার জন্য আমাদের সাথে সরাসরি যোগাযোগ করুন
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      asChild
                      size="lg"
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <a
                        href={createWhatsAppUrl("আমি রিফান্ড/রিপ্লেসমেন্ট চাই। অর্ডার নম্বর: [আপনার অর্ডার নম্বর]")}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle className="mr-2 w-5 h-5" />
                        রিফান্ড রিকুয়েস্ট
                      </a>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                      <Link href="/contact">
                        যোগাযোগ করুন
                      </Link>
                    </Button>
                  </div>
                  <p className="text-sm text-blue-600 mt-4">
                    রিকুয়েস্টের সময় অবশ্যই অর্ডার নম্বর ও পণ্যের ছবি পাঠান
                  </p>
                </CardContent>
              </Card>

            </div>
          </div>
        </section>
      </div>
    </MobileOptimizedLayout>
  );
}