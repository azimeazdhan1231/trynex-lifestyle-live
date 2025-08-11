import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Star, Gift, Sparkles, Heart, Shield, Truck, Users } from "lucide-react";
import { useLocation } from "wouter";

const PerfectHeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [, setLocation] = useLocation();

  const heroContent = [
    {
      title: "আপনার স্বপ্নের গিফট এখানেই",
      subtitle: "বিশেষ ছাড় সহ কাস্টমাইজেশনের সুবিধা",
      description: "টি-শার্ট, মগ, ক্যাপ থেকে শুরু করে সব ধরনের গিফট আইটেম পাবেন আমাদের কাছে",
      bgGradient: "from-orange-500 via-red-500 to-pink-600",
      icon: Gift,
      features: ["✓ ১০০% কাস্টমাইজেশন", "✓ ২৪ ঘন্টা সাপোর্ট", "✓ দ্রুত ডেলিভারি"]
    },
    {
      title: "কাস্টম ডিজাইনে বানান আপনার পণ্য",
      subtitle: "যেকোনো ছবি বা টেক্সট দিয়ে অর্ডার করুন", 
      description: "আপনার পছন্দের ডিজাইন, ছবি বা লেখা দিয়ে বানিয়ে নিন আপনার পণ্য",
      bgGradient: "from-blue-600 via-purple-600 to-indigo-700",
      icon: Sparkles,
      features: ["✓ ফ্রি ডিজাইন সাপোর্ট", "✓ উন্নত মানের প্রিন্ট", "✓ দীর্ঘস্থায়ী পণ্য"]
    },
    {
      title: "সারা বাংলাদেশে দ্রুত ডেলিভারি",
      subtitle: "ঢাকায় ১ দিন, বাইরে ২-৩ দিনের মধ্যে",
      description: "আমাদের রয়েছে নির্ভরযোগ্য ডেলিভারি নেটওয়ার্ক সারা দেশ জুড়ে",
      bgGradient: "from-green-500 via-emerald-600 to-teal-700",
      icon: Truck,
      features: ["✓ ক্যাশ অন ডেলিভারি", "✓ ফ্রি হোম ডেলিভারি", "✓ সিকিউর প্যাকেজিং"]
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroContent.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const current = heroContent[currentSlide];
  const IconComponent = current.icon;

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-white">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 text-center lg:text-left">
            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-3">
              <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                <Star className="w-3 h-3 mr-1 fill-current" />
                ৪.৮ রেটিং
              </Badge>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                <Users className="w-3 h-3 mr-1" />
                ১০,০০০+ খুশি কাস্টমার
              </Badge>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">
                <Shield className="w-3 h-3 mr-1" />
                ১০০% নিরাপদ
              </Badge>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                {current.title}
              </h1>
              <h2 className="text-xl lg:text-2xl text-gray-600 font-medium">
                {current.subtitle}
              </h2>
              <p className="text-lg text-gray-500 leading-relaxed max-w-xl mx-auto lg:mx-0">
                {current.description}
              </p>
            </div>

            {/* Features */}
            <div className="space-y-3">
              {current.features.map((feature, idx) => (
                <div key={idx} className="flex items-center justify-center lg:justify-start text-gray-700">
                  <span className="text-sm font-medium">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                onClick={() => setLocation('/products')}
                data-testid="button-shop-now"
              >
                <Gift className="w-5 h-5 mr-2" />
                এখনই কেনাকাটা শুরু করুন
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-gray-300 hover:border-orange-500 hover:text-orange-500 px-8 py-6 text-lg rounded-full transition-all duration-300"
                onClick={() => setLocation('/products')}
                data-testid="button-custom-order"
              >
                কাস্টম অর্ডার করুন
              </Button>
            </div>

            {/* Social Proof */}
            <div className="text-center lg:text-left text-sm text-gray-500">
              <p>আজই অর্ডার করুন এবং পেয়ে যান <span className="text-green-600 font-semibold">২০% ছাড়</span></p>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative">
            <div className={`relative bg-gradient-to-br ${current.bgGradient} rounded-3xl p-12 transform rotate-3 hover:rotate-0 transition-transform duration-500 shadow-2xl`}>
              <div className="absolute inset-0 bg-white/10 rounded-3xl backdrop-blur-sm"></div>
              <div className="relative z-10 text-center text-white space-y-6">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 rounded-full backdrop-blur-sm">
                  <IconComponent className="w-12 h-12" />
                </div>
                <h3 className="text-2xl font-bold">বিশেষ অফার</h3>
                <p className="text-lg opacity-90">
                  প্রথম অর্ডারে ২০% ছাড়
                </p>
                <div className="space-y-2">
                  <div className="text-3xl font-bold">৳২০০০+</div>
                  <div className="text-sm opacity-80">অর্ডারে ফ্রি ডেলিভারি</div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -left-4 w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center text-2xl animate-bounce">
              🎁
            </div>
            <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-pink-400 rounded-full flex items-center justify-center text-xl animate-pulse">
              <Heart className="w-6 h-6 text-white fill-current" />
            </div>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
        {heroContent.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              currentSlide === index 
                ? 'bg-orange-500 w-8' 
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
            data-testid={`hero-slide-${index}`}
          />
        ))}
      </div>
    </section>
  );
};

export default PerfectHeroSection;