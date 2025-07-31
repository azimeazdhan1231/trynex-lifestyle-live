
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RotateCcw, Truck, Clock, CheckCircle } from "lucide-react";

export default function ReturnPolicy() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">রিটার্ন নীতি</h1>
        <p className="text-gray-600">ট্রাইনেক্স লাইফস্টাইলের রিটার্ন নীতি সম্পর্কে জানুন</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5" />
              রিটার্ন শর্তাবলী
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-green-600">রিটার্ন করতে পারবেন</h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">ত্রুটিপূর্ণ পণ্য</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">ভুল সাইজ</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">ভুল পণ্য</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">ক্ষতিগ্রস্ত অবস্থায় পৌঁছানো</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-red-600">রিটার্ন করতে পারবেন না</h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                    <span className="text-sm">কাস্টমাইজড পণ্য</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                    <span className="text-sm">ব্যবহৃত পণ্য</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                    <span className="text-sm">৭ দিন পরে</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                    <span className="text-sm">শুধু মন পরিবর্তন</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              রিটার্ন সময়সীমা
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-blue-900 mb-3">৭ দিনের গ্যারান্টি</h3>
              <p className="text-blue-800 mb-4">পণ্য ডেলিভারির ৭ দিনের মধ্যে রিটার্ন করতে পারবেন।</p>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white p-3 rounded">
                  <h4 className="font-semibold">দিন ১-৩</h4>
                  <p className="text-gray-600">সহজ রিটার্ন</p>
                </div>
                <div className="bg-white p-3 rounded">
                  <h4 className="font-semibold">দিন ৪-৬</h4>
                  <p className="text-gray-600">যাচাই সাপেক্ষে</p>
                </div>
                <div className="bg-white p-3 rounded">
                  <h4 className="font-semibold">দিন ৭</h4>
                  <p className="text-gray-600">শেষ দিন</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              রিটার্ন প্রক্রিয়া
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">১</div>
                <div>
                  <h4 className="font-semibold">যোগাযোগ করুন</h4>
                  <p className="text-gray-600">হোয়াটসঅ্যাপে ০১৭৪৭২৯২২৭৭ নম্বরে যোগাযোগ করুন এবং রিটার্নের কারণ জানান।</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-semibold">২</div>
                <div>
                  <h4 className="font-semibold">অনুমোদন</h4>
                  <p className="text-gray-600">আমাদের টিম আপনার রিটার্নের কারণ যাচাই করে অনুমোদন দেবে।</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold">৩</div>
                <div>
                  <h4 className="font-semibold">পণ্য পাঠান</h4>
                  <p className="text-gray-600">আমরা কুরিয়ার পাঠিয়ে পণ্য সংগ্রহ করব (বিনামূল্যে)।</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-semibold">৪</div>
                <div>
                  <h4 className="font-semibold">রিফান্ড/এক্সচেঞ্জ</h4>
                  <p className="text-gray-600">পণ্য পাওয়ার পর ২-৩ দিনের মধ্যে রিফান্ড বা এক্সচেঞ্জ করা হবে।</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>রিটার্নের জন্য প্রয়োজনীয় তথ্য</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold">আবশ্যিক তথ্য</h4>
                <ul className="space-y-2 text-sm">
                  <li>• অর্ডার ট্র্যাকিং আইডি</li>
                  <li>• পূর্ণ নাম ও ফোন নম্বর</li>
                  <li>• রিটার্নের কারণ</li>
                  <li>• পণ্যের বর্তমান অবস্থার ছবি</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold">পণ্যের শর্ত</h4>
                <ul className="space-y-2 text-sm">
                  <li>• অরিজিনাল প্যাকেজিং</li>
                  <li>• সব ট্যাগ অক্ষত</li>
                  <li>• ব্যবহার না করা</li>
                  <li>• পরিষ্কার অবস্থায়</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="font-semibold text-green-900 mb-3">আমাদের প্রতিশ্রুতি</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-green-800">১০০% নিরাপত্তা</h4>
              <p className="text-green-700 text-sm">আপনার সন্তুষ্টিই আমাদের লক্ষ্য</p>
            </div>
            <div>
              <h4 className="font-medium text-green-800">দ্রুত সেবা</h4>
              <p className="text-green-700 text-sm">দ্রুততম সময়ে রিটার্ন সম্পন্ন</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
