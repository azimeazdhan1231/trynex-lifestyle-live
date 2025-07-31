
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Shield, Users, CreditCard } from "lucide-react";

export default function TermsConditions() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">শর্তাবলী</h1>
        <p className="text-gray-600">ট্রাইনেক্স লাইফস্টাইল ব্যবহারের শর্তাবলী</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              গ্রহণযোগ্য ব্যবহার
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              এই ওয়েবসাইট ব্যবহার করে আপনি এই শর্তাবলী মেনে নিতে সম্মত হচ্ছেন। যদি আপনি এই শর্তাবলীর সাথে একমত না হন, তাহলে এই সাইট ব্যবহার করবেন না।
            </p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">আপনি সম্মত হচ্ছেন যে:</h4>
              <ul className="space-y-1 text-blue-800 text-sm">
                <li>• সাইটের সব তথ্য সত্য এবং সঠিক দেবেন</li>
                <li>• কোনো ভুয়া বা জালিয়াতি অর্ডার দেবেন না</li>
                <li>• অন্যের পরিচয় ব্যবহার করবেন না</li>
                <li>• কোনো অবৈধ কাজে সাইট ব্যবহার করবেন না</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              অর্ডার এবং পেমেন্ট
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold">অর্ডার প্রক্রিয়া</h4>
                <p className="text-gray-600 text-sm">অর্ডার সম্পূর্ণ হওয়ার পর আমরা আপনার সাথে যোগাযোগ করে অর্ডার নিশ্চিত করব।</p>
              </div>
              <div>
                <h4 className="font-semibold">পেমেন্ট</h4>
                <p className="text-gray-600 text-sm">পেমেন্ট সম্পূর্ণ না হওয়া পর্যন্ত অর্ডার প্রক্রিয়া শুরু হবে না।</p>
              </div>
              <div>
                <h4 className="font-semibold">মূল্য পরিবর্তন</h4>
                <p className="text-gray-600 text-sm">আমরা যেকোনো সময় পণ্যের মূল্য পরিবর্তন করার অধিকার রাখি।</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              গোপনীয়তা এবং নিরাপত্তা
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-semibold">তথ্য সুরক্ষা</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• আপনার ব্যক্তিগত তথ্য সুরক্ষিত রাখা হয়</li>
                  <li>• তৃতীয় পক্ষের সাথে তথ্য শেয়ার করা হয় না</li>
                  <li>• পেমেন্ট তথ্য এনক্রিপ্টেড থাকে</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold">তথ্য ব্যবহার</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• অর্ডার প্রক্রিয়াকরণের জন্য</li>
                  <li>• গ্রাহক সেবা উন্নতির জন্য</li>
                  <li>• নতুন অফার জানানোর জন্য</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              ডেলিভারি এবং শিপিং
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold">ডেলিভারি সময়</h4>
                <p className="text-gray-600 text-sm">ঢাকার ভিতরে ১-২ দিন, ঢাকার বাইরে ২-৩ দিন।</p>
              </div>
              <div>
                <h4 className="font-semibold">ডেলিভারি চার্জ</h4>
                <p className="text-gray-600 text-sm">ঢাকার ভিতরে ৮০ টাকা, বাইরে ৮০-১২০ টাকা।</p>
              </div>
              <div>
                <h4 className="font-semibold">পণ্য হারিয়ে গেলে</h4>
                <p className="text-gray-600 text-sm">কুরিয়ারে পণ্য হারিয়ে গেলে আমরা দায়ী থাকব।</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>দায়বদ্ধতার সীমাবদ্ধতা</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="font-semibold text-yellow-900 mb-2">গুরুত্বপূর্ণ বিষয়</h4>
              <ul className="space-y-1 text-yellow-800 text-sm">
                <li>• প্রাকৃতিক দুর্যোগের কারণে বিলম্বের জন্য আমরা দায়ী নই</li>
                <li>• তৃতীয় পক্ষের সেবার (কুরিয়ার) সমস্যার জন্য সরাসরি দায়ী নই</li>
                <li>• কাস্টমাইজড পণ্যের ক্ষেত্রে গ্রাহকের দেওয়া ডিজাইন অনুযায়ী তৈরি হবে</li>
                <li>• রং এবং ডিজাইনে সামান্য তারতম্য হতে পারে</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>বৌদ্ধিক সম্পদ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-gray-700 text-sm">
              এই ওয়েবসাইটের সব কন্টেন্ট, ডিজাইন, লোগো এবং ছবি ট্রাইনেক্স লাইফস্টাইলের সম্পত্তি। 
              অনুমতি ছাড়া ব্যবহার করা আইনত দণ্ডনীয়।
            </p>
            <div className="bg-red-50 p-3 rounded border border-red-200">
              <p className="text-red-800 text-sm font-medium">
                কপিরাইট © ২০২৫ ট্রাইনেক্স লাইফস্টাইল। সর্বস্বত্ব সংরক্ষিত।
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>শর্তাবলী পরিবর্তন</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 text-sm">
              আমরা যেকোনো সময় এই শর্তাবলী পরিবর্তন করার অধিকার রাখি। পরিবর্তনের পর সাইট ব্যবহার করলে 
              নতুন শর্তাবলী মেনে নেওয়া হবে বলে গণ্য হবে।
            </p>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800 text-sm">
                <strong>যোগাযোগ:</strong> যেকোনো প্রশ্ন বা সহায়তার জন্য হোয়াটসঅ্যাপে ০১৭৪৭২৯২২৭৭ নম্বরে যোগাযোগ করুন।
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center p-6 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-sm">
            শেষ আপডেট: ৩১ জানুয়ারি, ২০২৫
          </p>
          <p className="text-gray-600 text-sm mt-2">
            এই শর্তাবলী বাংলাদেশের আইন অনুযায়ী পরিচালিত হবে।
          </p>
        </div>
      </div>
    </div>
  );
}
