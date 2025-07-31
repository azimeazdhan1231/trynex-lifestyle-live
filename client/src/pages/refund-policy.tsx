
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Clock, CheckCircle, XCircle } from "lucide-react";

export default function RefundPolicy() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">রিফান্ড নীতি</h1>
        <p className="text-gray-600">ট্রাইনেক্স লাইফস্টাইলের রিফান্ড নীতি সম্পর্কে জানুন</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              রিফান্ড শর্তাবলী
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <h3 className="font-semibold">পণ্য ত্রুটিপূর্ণ হলে</h3>
                <p className="text-gray-600">যদি আপনার পণ্যে কোনো উৎপাদন ত্রুটি থাকে বা ক্ষতিগ্রস্ত অবস্থায় পৌঁছে, তাহলে ১০০% রিফান্ড পাবেন।</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <h3 className="font-semibold">সাইজ সমস্যা</h3>
                <p className="text-gray-600">যদি অর্ডার করা সাইজের চেয়ে ভিন্ন সাইজ পান, তাহলে বিনামূল্যে এক্সচেঞ্জ বা রিফান্ড করা হবে।</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <h3 className="font-semibold">ভুল পণ্য</h3>
                <p className="text-gray-600">যদি আপনার অর্ডারের চেয়ে ভিন্ন পণ্য পৌঁছে, তাহলে সঠিক পণ্য পাঠানো হবে বা রিফান্ড করা হবে।</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              রিফান্ড সময়সীমা
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">৭ দিন গ্যারান্টি</h3>
              <p className="text-blue-800">পণ্য গ্রহণের ৭ দিনের মধ্যে রিফান্ডের জন্য আবেদন করতে পারবেন।</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">দ্রুত প্রক্রিয়া</h3>
              <p className="text-green-800">রিফান্ড আবেদনের ৩-৫ কার্যদিবসের মধ্যে টাকা ফেরত দেওয়া হবে।</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              রিফান্ড পাবেন না যে ক্ষেত্রে
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <XCircle className="w-4 h-4 text-red-500" />
              <span>কাস্টমাইজড পণ্য (যদি আপনার দেওয়া ডিজাইন অনুযায়ী তৈরি হয়)</span>
            </div>
            <div className="flex items-center gap-3">
              <XCircle className="w-4 h-4 text-red-500" />
              <span>ব্যবহৃত বা ক্ষতিগ্রস্ত পণ্য</span>
            </div>
            <div className="flex items-center gap-3">
              <XCircle className="w-4 h-4 text-red-500" />
              <span>৭ দিন পরে রিফান্ড আবেদন</span>
            </div>
            <div className="flex items-center gap-3">
              <XCircle className="w-4 h-4 text-red-500" />
              <span>শুধু মন পরিবর্তনের কারণে</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>রিফান্ড প্রক্রিয়া</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">১</div>
                <h4 className="font-semibold">যোগাযোগ করুন</h4>
                <p className="text-sm text-gray-600">হোয়াটসঅ্যাপে যোগাযোগ করে রিফান্ডের কারণ জানান</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">২</div>
                <h4 className="font-semibold">যাচাই</h4>
                <p className="text-sm text-gray-600">আমরা আপনার সমস্যা যাচাই করব</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">৩</div>
                <h4 className="font-semibold">রিফান্ড</h4>
                <p className="text-sm text-gray-600">৩-৫ দিনের মধ্যে টাকা ফেরত</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="font-semibold text-yellow-900 mb-2">গুরুত্বপূর্ণ তথ্য</h3>
          <ul className="space-y-1 text-yellow-800">
            <li>• রিফান্ডের জন্য অবশ্যই অর্ডার ট্র্যাকিং আইডি প্রয়োজন</li>
            <li>• পণ্যের ছবি এবং সমস্যার বিবরণ দিতে হবে</li>
            <li>• রিফান্ড শুধুমাত্র অরিজিনাল পেমেন্ট মেথডে ফেরত দেওয়া হবে</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
