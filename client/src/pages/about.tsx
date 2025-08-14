import { Shield, Award, Users, Clock, CheckCircle, Star, Heart, Truck, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import MobileOptimizedLayout from "@/components/mobile-optimized-layout";
import { COMPANY_NAME, COMPANY_TAGLINE, WHATSAPP_NUMBER, createWhatsAppUrl } from "@/lib/constants";

export default function About() {

  const features = [
    {
      icon: Shield,
      title: "বিশ্বস্ত ও নিরাপদ",
      description: "আমরা ১০০% অরিজিনাল পণ্য সরবরাহ করি এবং নিরাপদ পেমেন্ট নিশ্চিত করি"
    },
    {
      icon: Award,
      title: "সেরা মানের পণ্য",
      description: "প্রতিটি পণ্য যত্নসহকারে নির্বাচিত এবং গুণগত মান যাচাই করা"
    },
    {
      icon: Users,
      title: "হাজারো সন্তুষ্ট গ্রাহক",
      description: "৫০০০+ খুশি গ্রাহক আমাদের সেবায় সন্তুষ্ট এবং পুনরায় কেনাকাটা করেন"
    },
    {
      icon: Clock,
      title: "দ্রুত ডেলিভারি",
      description: "ঢাকার ভিতরে ২৪ ঘন্টা এবং ঢাকার বাইরে ৪৮-৭২ ঘন্টায় ডেলিভারি"
    }
  ];

  const stats = [
    { label: "সন্তুষ্ট গ্রাহক", value: "৫০০০+", icon: Users },
    { label: "সফল ডেলিভারি", value: "৯৮%", icon: CheckCircle },
    { label: "গড় রেটিং", value: "৪.৮/৫", icon: Star },
    { label: "পণ্যের বৈচিত্র্য", value: "১০০+", icon: Heart }
  ];

  const whyChooseUs = [
    "কোয়ালিটি গ্যারান্টি - ১০০% অরিজিনাল পণ্য",
    "ক্যাশ অন ডেলিভারি সুবিধা",
    "৭ দিনের রিটার্ন পলিসি",
    "২৤/৭ কাস্টমার সাপোর্ট",
    "সারাদেশে ডেলিভারি",
    "কাস্টমাইজেশন সুবিধা",
    "সাশ্রয়ী মূল্য",
    "দ্রুত অর্ডার প্রসেসিং"
  ];

  return (
    <MobileOptimizedLayout>
      
      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-to-br from-primary via-primary/90 to-primary/80">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <Badge className="mb-6 bg-white/20 text-white border-white/30">
              আমাদের সম্পর্কে জানুন
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {COMPANY_NAME}
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              {COMPANY_TAGLINE}
            </p>
            <p className="text-lg leading-relaxed max-w-3xl mx-auto opacity-80">
              আমরা একটি বিশ্বস্ত অনলাইন শপিং প্ল্যাটফর্ম যা গুণগত মানের পণ্য এবং 
              উন্নত সেবা প্রদানে প্রতিশ্রুতিবদ্ধ। আমাদের লক্ষ্য হলো গ্রাহকদের 
              সর্বোচ্চ সন্তুষ্টি নিশ্চিত করা।
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="mb-4 flex justify-center">
                  <stat.icon className="w-12 h-12 text-primary" />
                </div>
                <div className="text-3xl font-bold text-gray-800 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              কেন আমাদের বেছে নিবেন?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              আমাদের বিশেষত্ব এবং সেবার মান আপনাকে মুগ্ধ করবে
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-8">
                  <div className="mb-6 flex justify-center">
                    <feature.icon className="w-16 h-16 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                আমাদের বিশেষত্ব
              </h2>
              <p className="text-xl text-gray-600">
                যে কারণে আমরা আলাদা এবং গ্রাহকদের প্রথম পছন্দ
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {whyChooseUs.map((reason, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 font-medium">{reason}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <Card className="p-8">
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">আমাদের লক্ষ্য</h3>
                </div>
                <p className="text-gray-600 leading-relaxed text-center">
                  আমাদের লক্ষ্য হলো বাংলাদেশের প্রতিটি মানুষের কাছে গুণগত মানের পণ্য 
                  সাশ্রয়ী মূল্যে পৌঁছে দেওয়া। আমরা চাই গ্রাহকরা ঘরে বসেই 
                  সব ধরনের প্রয়োজনীয় পণ্য কিনতে পারেন।
                </p>
              </CardContent>
            </Card>

            <Card className="p-8">
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">আমাদের দৃষ্টিভঙ্গি</h3>
                </div>
                <p className="text-gray-600 leading-relaxed text-center">
                  বাংলাদেশের সবচেয়ে বিশ্বস্ত এবং জনপ্রিয় অনলাইন শপিং প্ল্যাটফর্ম 
                  হওয়া। যেখানে গ্রাহকরা নিশ্চিন্তে কেনাকাটা করতে পারবেন এবং 
                  সর্বোচ্চ সেবা পাবেন।
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 bg-gradient-to-br from-green-500 via-green-600 to-emerald-700">
        <div className="container mx-auto px-4">
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl max-w-4xl mx-auto">
            <CardContent className="p-12 text-center">
              <div className="mb-8">
                <MessageCircle className="w-20 h-20 text-green-600 mx-auto mb-6" />
                <h3 className="text-4xl font-bold mb-4 text-gray-800">আমাদের সাথে যোগাযোগ করুন</h3>
                <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
                  যেকোনো প্রশ্ন বা সহায়তার জন্য আমাদের সাথে যোগাযোগ করুন
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white text-xl px-10 py-6 rounded-full shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  <a
                    href={createWhatsAppUrl("আসসালামু আলাইকুম। আমি Trynex Lifestyle সম্পর্কে জানতে চাই।")}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="mr-3 w-6 h-6" />
                    হোয়াটসঅ্যাপে যোগাযোগ
                  </a>
                </Button>

                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-green-600 text-green-600 hover:bg-green-50 text-xl px-10 py-6 rounded-full shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  <a href={`tel:${WHATSAPP_NUMBER}`}>
                    <Phone className="mr-3 w-6 h-6" />
                    ফোন করুন
                  </a>
                </Button>
              </div>

              <div className="mt-8 p-6 bg-green-50 rounded-2xl">
                <p className="text-green-800 font-semibold">
                  📞 {WHATSAPP_NUMBER} | 🕐 সার্ভিস টাইম: সকাল ৯টা - রাত ১০টা
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">{COMPANY_NAME}</h3>
            <p className="text-gray-300 mb-6">
              বিশ্বস্ত অনলাইন শপিং এর জন্য আমাদের সাথে থাকুন
            </p>
            <p className="text-gray-400">
              © 2025 {COMPANY_NAME}. সকল অধিকার সংরক্ষিত।
            </p>
          </div>
        </div>
      </footer>
    </MobileOptimizedLayout>
  );
}