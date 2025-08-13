import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  ArrowRight, 
  Star, 
  Gift, 
  Sparkles, 
  Heart, 
  Shield, 
  Truck, 
  Users,
  Search,
  Play,
  ChevronLeft,
  ChevronRight,
  Zap
} from "lucide-react";
import { useLocation } from "wouter";

interface HeroSlide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  cta: string;
  ctaLink: string;
  bgGradient: string;
  image: string;
  features: string[];
  badge?: string;
  stats?: { label: string; value: string }[];
}

const ModernHeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();

  const heroSlides: HeroSlide[] = [
    {
      id: 1,
      title: "আপনার স্বপ্নের গিফট এখানেই",
      subtitle: "বিশেষ ছাড় সহ কাস্টমাইজেশনের সুবিধা",
      description: "টি-শার্ট, মগ, ক্যাপ থেকে শুরু করে সব ধরনের গিফট আইটেম পাবেন আমাদের কাছে। প্রতিটি পণ্য সর্বোচ্চ মানের এবং দীর্ঘস্থায়ী।",
      cta: "শপিং শুরু করুন",
      ctaLink: "/products",
      bgGradient: "from-orange-500 via-red-500 to-pink-600",
      image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800",
      badge: "৫০% পর্যন্ত ছাড়",
      features: ["✓ ১০০% কাস্টমাইজেশন", "✓ ২৪ ঘন্টা সাপোর্ট", "✓ দ্রুত ডেলিভারি"],
      stats: [
        { label: "খুশি গ্রাহক", value: "১০,০০০+" },
        { label: "পণ্যের সংখ্যা", value: "৫০০+" },
        { label: "সফল অর্ডার", value: "২৫,০০০+" }
      ]
    },
    {
      id: 2,
      title: "কাস্টম ডিজাইনে বানান আপনার পণ্য",
      subtitle: "যেকোনো ছবি বা টেক্সট দিয়ে অর্ডার করুন",
      description: "আপনার পছন্দের ডিজাইন, ছবি বা লেখা দিয়ে বানিয়ে নিন আপনার পণ্য। আমাদের রয়েছে অভিজ্ঞ ডিজাইন টিম এবং উন্নত প্রিন্টিং প্রযুক্তি।",
      cta: "কাস্টমাইজ করুন",
      ctaLink: "/customize",
      bgGradient: "from-blue-600 via-purple-600 to-indigo-700",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800",
      badge: "ফ্রি ডিজাইন সাপোর্ট",
      features: ["✓ ফ্রি ডিজাইন সাপোর্ট", "✓ উন্নত মানের প্রিন্ট", "✓ দীর্ঘস্থায়ী পণ্য"],
      stats: [
        { label: "কাস্টম ডিজাইন", value: "১৫,০০০+" },
        { label: "ডিজাইনার", value: "২০+" },
        { label: "গড় রেটিং", value: "৪.৮★" }
      ]
    },
    {
      id: 3,
      title: "সারা বাংলাদেশে দ্রুত ডেলিভারি",
      subtitle: "ঢাকায় ১ দিন, বাইরে ২-৩ দিনের মধ্যে",
      description: "আমাদের রয়েছে নির্ভরযোগ্য ডেলিভারি নেটওয়ার্ক সারা দেশ জুড়ে। ক্যাশ অন ডেলিভারি সুবিধা এবং সিকিউর প্যাকেজিং।",
      cta: "অর্ডার করুন",
      ctaLink: "/products",
      bgGradient: "from-green-500 via-emerald-600 to-teal-700",
      image: "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800",
      badge: "ফ্রি ডেলিভারি",
      features: ["✓ ক্যাশ অন ডেলিভারি", "✓ ফ্রি হোম ডেলিভারি", "✓ সিকিউর প্যাকেজিং"],
      stats: [
        { label: "ডেলিভারি শহর", value: "৬৪+" },
        { label: "গড় ডেলিভারি", value: "২ দিন" },
        { label: "সফল ডেলিভারি", value: "৯৮%" }
      ]
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const currentHero = heroSlides[currentSlide];

  return (
    <div className="relative min-h-[600px] lg:min-h-[700px] overflow-hidden bg-black">
      {/* Background with image and gradient */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url("${currentHero.image}")` }}
            />
            <div className={`absolute inset-0 bg-gradient-to-br ${currentHero.bgGradient} opacity-85`} />
            <div className="absolute inset-0 bg-black/30" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-[600px] lg:min-h-[700px] flex items-center">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              key={`content-${currentSlide}`}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-white space-y-6"
            >
              {/* Badge */}
              {currentHero.badge && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm text-sm px-4 py-2">
                    <Zap className="w-4 h-4 mr-2" />
                    {currentHero.badge}
                  </Badge>
                </motion.div>
              )}

              {/* Title */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="space-y-4"
              >
                <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold leading-tight">
                  {currentHero.title}
                </h1>
                <h2 className="text-lg sm:text-xl lg:text-2xl text-white/90 font-medium">
                  {currentHero.subtitle}
                </h2>
              </motion.div>

              {/* Description */}
              <motion.p
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-base lg:text-lg text-white/90 leading-relaxed max-w-lg"
              >
                {currentHero.description}
              </motion.p>

              {/* Features */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-3"
              >
                {currentHero.features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center text-sm text-white/90 bg-white/10 rounded-lg px-3 py-2 backdrop-blur-sm"
                  >
                    {feature}
                  </div>
                ))}
              </motion.div>

              {/* CTA Button and Search */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex flex-col sm:flex-row gap-4 items-start sm:items-center"
              >
                <Button
                  size="lg"
                  onClick={() => setLocation(currentHero.ctaLink)}
                  className="bg-white text-gray-900 hover:bg-gray-100 font-bold px-8 py-4 rounded-full transform transition-all duration-300 hover:scale-105 shadow-2xl"
                >
                  {currentHero.cta}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>

                {/* Quick Search */}
                <form onSubmit={handleSearch} className="flex-1 max-w-md">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="পণ্য খুঁজুন..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 pr-4 py-3 bg-white/20 border-white/30 text-white placeholder-white/70 backdrop-blur-sm rounded-full focus:bg-white/30 focus:border-white/50 transition-all duration-300"
                    />
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/70" />
                  </div>
                </form>
              </motion.div>
            </motion.div>

            {/* Right Stats */}
            <motion.div
              key={`stats-${currentSlide}`}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="hidden lg:block"
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
                <h3 className="text-white text-xl font-bold mb-6 text-center">আমাদের সাফল্যের গল্প</h3>
                <div className="grid grid-cols-1 gap-6">
                  {currentHero.stats?.map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="text-center bg-white/10 rounded-2xl p-4 backdrop-blur-sm"
                    >
                      <div className="text-2xl lg:text-3xl font-bold text-white mb-1">
                        {stat.value}
                      </div>
                      <div className="text-sm text-white/80">
                        {stat.label}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex items-center gap-4 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3">
          <button
            onClick={prevSlide}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all duration-300"
          >
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>

          <div className="flex gap-2">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide ? 'bg-white w-6' : 'bg-white/50'
                }`}
              />
            ))}
          </div>

          <button
            onClick={nextSlide}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all duration-300"
          >
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Trust Indicators */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 right-8 z-20 hidden lg:block"
      >
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
          <div className="flex items-center gap-4 text-white">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span className="text-sm">নিরাপদ পেমেন্ট</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              <span className="text-sm">ফ্রি ডেলিভারি</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span className="text-sm">২৪/৭ সাপোর্ট</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ModernHeroSection;