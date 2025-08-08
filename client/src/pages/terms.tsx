import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import MobileOptimizedLayout from '@/components/mobile-optimized-layout';
import { COMPANY_NAME, WHATSAPP_NUMBER } from '@/lib/constants';
import { FileText, Shield, AlertCircle, MessageCircle } from 'lucide-react';
import { Link } from 'wouter';

export default function TermsPage() {
  const createWhatsAppUrl = (message: string) => {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  };

  return (
    <MobileOptimizedLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Hero Section */}
        <section className="py-12 sm:py-16 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
          <div className="container mx-auto px-4">
            <div className="text-center text-white max-w-4xl mx-auto">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                <FileText className="w-10 h-10 sm:w-12 sm:h-12" />
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                শর্তাবলী
              </h1>
              <p className="text-xl sm:text-2xl text-blue-100 mb-6">
                {COMPANY_NAME} এর নিয়মাবলী ও শর্তাদি
              </p>
              <p className="text-lg text-blue-200 max-w-2xl mx-auto">
                আমাদের সেবা ব্যবহারের পূর্বে এই শর্তাবলী সম্পূর্ণ পড়ুন এবং মেনে নিন
              </p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-6">

              {/* Service Agreement */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-xl text-gray-800">
                    <Shield className="w-6 h-6 mr-3 text-blue-600" />
                    সেবা ব্যবহারের চুক্তি
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    {COMPANY_NAME} এর ওয়েবসাইট ব্যবহার করার মাধ্যমে আপনি আমাদের নিম্নলিখিত শর্তাবলী মেনে নিতে সম্মত হচ্ছেন:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>আপনি ১৮ বছর বা তার বেশি বয়সী অথবা অভিভাবকের তত্ত্বাবধানে আছেন</li>
                    <li>আপনার দেওয়া সকল তথ্য সত্য ও নির্ভুল</li>
                    <li>আমাদের ওয়েবসাইটের কোন ক্ষতি বা অপব্যবহার করবেন না</li>
                    <li>অন্যের অধিকার ও গোপনীয়তার প্রতি সম্মান প্রদর্শন করবেন</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Order Terms */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-xl text-gray-800">
                    <AlertCircle className="w-6 h-6 mr-3 text-orange-600" />
                    অর্ডার ও পেমেন্ট শর্তাবলী
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-gray-700 leading-relaxed">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">অর্ডার প্রক্রিয়া:</h4>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>সকল অর্ডার আমাদের নিশ্চিতকরণের পর চূড়ান্ত হবে</li>
                      <li>পেমেন্ট নিশ্চিত না হলে অর্ডার বাতিল হয়ে যাবে</li>
                      <li>স্টক শেষ হলে আমরা বিকল্প পণ্য বা রিফান্ডের ব্যবস্থা করবো</li>
                      <li>কাস্টম অর্ডার সর্বনিম্ন ৩০০ টাকার হতে হবে</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">পেমেন্ট নীতি:</h4>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>bKash/Nagad এর মাধ্যমে অগ্রিম পেমেন্ট বাধ্যতামূলক</li>
                      <li>ট্রানজেকশন আইডি অবশ্যই আমাদের জানাতে হবে</li>
                      <li>ভুল পেমেন্টের দায়ভার গ্রাহকের</li>
                      <li>পেমেন্ট রিসিপ্ট সংরক্ষণ করে রাখুন</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Terms */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-xl text-gray-800">
                    <MessageCircle className="w-6 h-6 mr-3 text-green-600" />
                    ডেলিভারি শর্তাবলী
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-gray-700 leading-relaxed">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">ডেলিভারি সময়:</h4>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>ঢাকার ভিতরে: ১-২ কার্যদিবস</li>
                      <li>ঢাকার বাইরে: ২-৫ কার্যদিবস</li>
                      <li>কাস্টম পণ্য: ৩-৭ কার্যদিবস</li>
                      <li>প্রাকৃতিক দুর্যোগে বিলম্ব হতে পারে</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">ডেলিভারি চার্জ:</h4>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>ঢাকার ভিতরে: ৬০ টাকা</li>
                      <li>ঢাকার বাইরে: ১২০ টাকা</li>
                      <li>৫০০+ টাকার অর্ডারে বিনামূল্যে ডেলিভারি</li>
                      <li>কুরিয়ার সার্ভিস পরিবর্তনের অধিকার সংরক্ষিত</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Liability */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-gray-800">
                    দায়বদ্ধতা ও সীমাবদ্ধতা
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-gray-700 leading-relaxed">
                  <ul className="list-disc pl-6 space-y-2">
                    <li>প্রাকৃতিক দুর্যোগ বা অপ্রত্যাশিত পরিস্থিতিতে দেরির জন্য আমরা দায়ী নই</li>
                    <li>কুরিয়ার সার্ভিসের ত্রুটির জন্য আমাদের দায় সীমিত</li>
                    <li>পণ্যের ছবি ও বাস্তব রঙে সামান্য তারতম্য হতে পারে</li>
                    <li>আমাদের সিদ্ধান্ত চূড়ান্ত ও আইনত বলবৎ</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Privacy & Data */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-gray-800">
                    গোপনীয়তা ও ডেটা সুরক্ষা
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-gray-700 leading-relaxed">
                  <ul className="list-disc pl-6 space-y-2">
                    <li>আপনার ব্যক্তিগত তথ্য সুরক্ষিত রাখা হবে</li>
                    <li>তৃতীয় পক্ষের সাথে তথ্য শেয়ার করা হয় না</li>
                    <li>অর্ডার প্রক্রিয়াকরণের জন্য প্রয়োজনীয় তথ্য ব্যবহার করা হবে</li>
                    <li>মার্কেটিং ইমেইল/SMS থেকে অপশন আউট করার সুবিধা রয়েছে</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Changes to Terms */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">
                    শর্তাবলী পরিবর্তন
                  </h3>
                  <p className="text-blue-800 mb-4">
                    আমরা যেকোনো সময় এই শর্তাবলী পরিবর্তনের অধিকার সংরক্ষণ করি। 
                    পরিবর্তনের ক্ষেত্রে ওয়েবসাইটে আপডেট করা হবে।
                  </p>
                  <p className="text-sm text-blue-700">
                    <strong>সর্বশেষ আপডেট:</strong> ০৮ আগস্ট, ২০২৫
                  </p>
                </CardContent>
              </Card>

              {/* Contact Section */}
              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                <CardContent className="p-8 text-center">
                  <h3 className="text-2xl font-bold text-green-800 mb-4">
                    প্রশ্ন আছে?
                  </h3>
                  <p className="text-green-700 mb-6">
                    শর্তাবলী সম্পর্কে কোন প্রশ্ন থাকলে আমাদের সাথে যোগাযোগ করুন
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      asChild
                      size="lg"
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <a
                        href={createWhatsAppUrl("আমি শর্তাবলী সম্পর্কে জানতে চাই")}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle className="mr-2 w-5 h-5" />
                        হোয়াটসঅ্যাপে যোগাযোগ
                      </a>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                      <Link href="/contact">
                        যোগাযোগ পেজ
                      </Link>
                    </Button>
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