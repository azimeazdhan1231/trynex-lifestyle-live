import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import MobileOptimizedLayout from '@/components/mobile-optimized-layout';
import { COMPANY_NAME, WHATSAPP_NUMBER } from '@/lib/constants';
import { CreditCard, Shield, AlertCircle, MessageCircle, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'wouter';

export default function PaymentPolicyPage() {
  const createWhatsAppUrl = (message: string) => {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  };

  return (
    <MobileOptimizedLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Hero Section */}
        <section className="py-12 sm:py-16 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700">
          <div className="container mx-auto px-4">
            <div className="text-center text-white max-w-4xl mx-auto">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                <CreditCard className="w-10 h-10 sm:w-12 sm:h-12" />
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                পেমেন্ট নীতিমালা
              </h1>
              <p className="text-xl sm:text-2xl text-green-100 mb-6">
                {COMPANY_NAME} এর পেমেন্ট সংক্রান্ত নিয়মাবলী
              </p>
              <p className="text-lg text-green-200 max-w-2xl mx-auto">
                নিরাপদ ও সহজ পেমেন্ট সিস্টেমের মাধ্যমে আস্থার সাথে কেনাকাটা করুন
              </p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-6">

              {/* Payment Methods */}
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl text-blue-900">
                    <CreditCard className="w-6 h-6 mr-3" />
                    গৃহীত পেমেন্ট পদ্ধতি
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-blue-800 leading-relaxed">
                  <p className="font-medium">আমরা নিম্নলিখিত পেমেন্ট মাধ্যম গ্রহণ করি:</p>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white/70 p-6 rounded-lg border border-pink-200">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-pink-500 rounded-lg flex items-center justify-center mr-4">
                          <span className="text-white font-bold">bKash</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-pink-700">বিকাশ</h4>
                          <p className="text-sm text-pink-600">পার্সোনাল নম্বর</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="font-bold text-lg text-pink-700">01747292277</p>
                        <p className="text-sm text-pink-600">• Send Money/পে করুন</p>
                        <p className="text-sm text-pink-600">• ট্রানজেকশন ফি গ্রাহকের</p>
                      </div>
                    </div>

                    <div className="bg-white/70 p-6 rounded-lg border border-orange-200">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mr-4">
                          <span className="text-white font-bold">Nagad</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-orange-700">নগদ</h4>
                          <p className="text-sm text-orange-600">পার্সোনাল নম্বর</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="font-bold text-lg text-orange-700">01747292277</p>
                        <p className="text-sm text-orange-600">• Send Money/টাকা পাঠান</p>
                        <p className="text-sm text-orange-600">• ট্রানজেকশন ফি গ্রাহকের</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h4 className="font-semibold text-yellow-800 mb-2">📋 গুরুত্বপূর্ণ তথ্য:</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• সর্বদা উপরোক্ত নির্দিষ্ট নম্বরে পেমেন্ট করুন</li>
                      <li>• অন্য কোন নম্বরে টাকা পাঠাবেন না</li>
                      <li>• সন্দেহ থাকলে হোয়াটসঅ্যাপে যাচাই করুন</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Process */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-xl text-gray-800">
                    <CheckCircle className="w-6 h-6 mr-3 text-green-600" />
                    পেমেন্ট প্রক্রিয়া
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-gray-700 leading-relaxed">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">ধাপ ১: অর্ডার করুন</h4>
                      <ul className="list-disc pl-6 space-y-1 text-sm">
                        <li>পছন্দের পণ্য কার্টে যোগ করুন</li>
                        <li>চেকআউট করে বিস্তারিত তথ্য দিন</li>
                        <li>অর্ডার কনফার্ম করুন</li>
                        <li>ট্র্যাকিং আইডি নোট করুন</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">ধাপ ২: পেমেন্ট করুন</h4>
                      <ul className="list-disc pl-6 space-y-1 text-sm">
                        <li>bKash/Nagad এ টাকা পাঠান</li>
                        <li>ট্রানজেকশন আইডি সংরক্ষণ করুন</li>
                        <li>রিসিপ্ট স্ক্রিনশট নিন</li>
                        <li>হোয়াটসঅ্যাপে তথ্য জানান</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-3">✅ পেমেন্ট কনফার্মেশন:</h4>
                    <p className="text-green-700 mb-3">
                      পেমেন্ট করার পর অবশ্যই হোয়াটসঅ্যাপে নিম্নলিখিত তথ্য পাঠান:
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-green-700 text-sm">
                      <li>অর্ডার ট্র্যাকিং আইডি</li>
                      <li>ট্রানজেকশন আইডি (TxnID)</li>
                      <li>পেমেন্ট করা অ্যামাউন্ট</li>
                      <li>আপনার ফোন নম্বর</li>
                      <li>পেমেন্ট রিসিপ্টের ছবি</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Security */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-xl text-gray-800">
                    <Shield className="w-6 h-6 mr-3 text-blue-600" />
                    পেমেন্ট নিরাপত্তা
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-gray-700 leading-relaxed">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">আমাদের প্রতিশ্রুতি:</h4>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>আপনার পেমেন্ট তথ্য সম্পূর্ণ গোপনীয় রাখা হয়</li>
                      <li>কোন তৃতীয় পক্ষের সাথে তথ্য শেয়ার করা হয় না</li>
                      <li>SSL এনক্রিপশনের মাধ্যমে ডেটা সুরক্ষিত</li>
                      <li>নিয়মিত সিকিউরিটি অডিট পরিচালনা</li>
                    </ul>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">🔒 সাবধানতা:</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• কখনো PIN বা পাসওয়ার্ড শেয়ার করবেন না</li>
                      <li>• সন্দেহজনক ফোনকল বা SMS এ সাড়া দেবেন না</li>
                      <li>• শুধুমাত্র অফিসিয়াল নম্বরে পেমেন্ট করুন</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Advanced Payment */}
              <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl text-purple-900">
                    <Clock className="w-6 h-6 mr-3" />
                    অগ্রিম পেমেন্ট নীতি
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-purple-800 leading-relaxed">
                  <div>
                    <h4 className="font-semibold text-purple-900 mb-3">কেন অগ্রিম পেমেন্ট?</h4>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>পণ্যের মান ও গুণগত মান নিশ্চিত করতে</li>
                      <li>দ্রুত ও নির্ভরযোগ্য ডেলিভারি নিশ্চিত করতে</li>
                      <li>জাল অর্ডার এড়াতে ও সততা বজায় রাখতে</li>
                      <li>গ্রাহক সেবার মান উন্নত রাখতে</li>
                    </ul>
                  </div>
                  
                  <div className="bg-white/50 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-900 mb-2">💡 বিশেষ ব্যবস্থা:</h4>
                    <ul className="text-sm text-purple-700 space-y-1">
                      <li>• ১০০% গ্যারান্টি - না পছন্দ হলে টাকা ফেরত</li>
                      <li>• ক্ষতিগ্রস্ত পণ্য ১০০% রিপ্লেসমেন্ট</li>
                      <li>• ২৪/৭ গ্রাহক সেবা সহায়তা</li>
                      <li>• দ্রুততম ডেলিভারি নিশ্চয়তা</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Issues */}
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl text-red-800">
                    <AlertCircle className="w-6 h-6 mr-3" />
                    পেমেন্ট সমস্যা ও সমাধান
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-red-700 leading-relaxed">
                  <div>
                    <h4 className="font-semibold text-red-800 mb-3">সাধারণ সমস্যা:</h4>
                    <div className="space-y-3">
                      <div className="bg-white/50 p-3 rounded border border-red-200">
                        <h5 className="font-medium text-red-800">সমস্যা: ট্রানজেকশন ফেইল</h5>
                        <p className="text-sm text-red-600">সমাধান: ২৪ ঘন্টা অপেক্ষা করুন, তারপর আমাদের জানান</p>
                      </div>
                      <div className="bg-white/50 p-3 rounded border border-red-200">
                        <h5 className="font-medium text-red-800">সমস্যা: ভুল অ্যামাউন্ট কেটেছে</h5>
                        <p className="text-sm text-red-600">সমাধান: রিসিপ্ট সহ তৎক্ষণাৎ আমাদের জানান</p>
                      </div>
                      <div className="bg-white/50 p-3 rounded border border-red-200">
                        <h5 className="font-medium text-red-800">সমস্যা: ট্রানজেকশন আইডি পাওয়া যাচ্ছে না</h5>
                        <p className="text-sm text-red-600">সমাধান: SMS চেক করুন বা bKash/Nagad অ্যাপ দেখুন</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Refund Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-gray-800">
                    পেমেন্ট রিফান্ড নীতি
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-gray-700 leading-relaxed">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">রিফান্ড শর্ত:</h4>
                      <ul className="list-disc pl-6 space-y-1 text-sm">
                        <li>পণ্য ত্রুটিপূর্ণ হলে</li>
                        <li>ভুল পণ্য ডেলিভার হলে</li>
                        <li>অর্ডার বাতিল করতে চাইলে</li>
                        <li>পণ্য আশানুরূপ না হলে</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">রিফান্ড সময়:</h4>
                      <ul className="list-disc pl-6 space-y-1 text-sm">
                        <li>bKash: ২-৩ কার্যদিবস</li>
                        <li>Nagad: ২-৩ কার্যদিবস</li>
                        <li>ব্যাংক: ৫-৭ কার্যদিবস</li>
                        <li>নগদ: তাৎক্ষণিক (প্রযোজ্য ক্ষেত্রে)</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Section */}
              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                <CardContent className="p-8 text-center">
                  <h3 className="text-2xl font-bold text-green-800 mb-4">
                    পেমেন্ট সহায়তা প্রয়োজন?
                  </h3>
                  <p className="text-green-700 mb-6">
                    পেমেন্ট সংক্রান্ত যেকোনো সমস্যার জন্য আমাদের সাথে যোগাযোগ করুন
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      asChild
                      size="lg"
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <a
                        href={createWhatsAppUrl("আমার পেমেন্ট নিয়ে সমস্যা হয়েছে। সাহায্য করুন।")}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle className="mr-2 w-5 h-5" />
                        পেমেন্ট সাপোর্ট
                      </a>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                      <Link href="/contact">
                        যোগাযোগ করুন
                      </Link>
                    </Button>
                  </div>
                  <div className="mt-6 p-4 bg-white/60 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">💰 পেমেন্ট হটলাইন</h4>
                    <p className="text-green-700 font-bold text-lg">{WHATSAPP_NUMBER}</p>
                    <p className="text-sm text-green-600">সকাল ৯টা - রাত ১০টা</p>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </section>
      </div>
    </MobileOptimizedLayout>
  );
}