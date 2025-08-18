import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Play,
  Star,
  Users,
  TrendingUp,
  Zap,
  Heart,
  ShoppingBag,
  Palette,
  Gift,
  Sparkles,
  ArrowRight,
  Check
} from "lucide-react";

const PremiumHeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const heroSlides = [
    {
      id: 1,
      title: "প্রিমিয়াম গিফট কালেকশন",
      subtitle: "আপনার প্রিয়জনের জন্য বিশেষ উপহার",
      description: "প্রতিটি মুহূর্তকে স্মরণীয় করে তুলুন আমাদের প্রিমিয়াম কাস্টমাইজড গিফট দিয়ে",
      image: "/hero-bg-1.jpg",
      primaryBtn: "এখনই কিনুন",
      secondaryBtn: "গ্যালারি দেখুন",
      features: ["ফ্রি কাস্টমাইজেশন", "দ্রুত ডেলিভারি", "১০০% গ্যারান্টি"]
    },
    {
      id: 2,
      title: "কাস্টম ডিজাইন সার্ভিস",
      subtitle: "আপনার কল্পনাকে বাস্তবে রূপ দিন",
      description: "পেশাদার ডিজাইনার টিমের সাহায্যে তৈরি করুন অনন্য ডিজাইন",
      image: "/hero-bg-2.jpg",
      primaryBtn: "ডিজাইন করুন",
      secondaryBtn: "উদাহরণ দেখুন",
      features: ["বিনামূল্যে ডিজাইন পরামর্শ", "২৪ ঘন্টা সেবা", "প্রিমিয়াম ম্যাটেরিয়াল"]
    },
    {
      id: 3,
      title: "এক্সক্লুসিভ অফার",
      subtitle: "সীমিত সময়ের জন্য বিশেষ ছাড়",
      description: "আজই অর্ডার করুন এবং পান ৩০% পর্যন্ত ছাড় সহ ফ্রি ডেলিভারি",
      image: "/hero-bg-3.jpg",
      primaryBtn: "অফার গ্রহণ করুন",
      secondaryBtn: "শর্তাবলী দেখুন",
      features: ["৩০% পর্যন্ত ছাড়", "ফ্রি ডেলিভারি", "নো হিডেন চার্জ"]
    }
  ];

  const stats = [
    { icon: Users, value: "50,000+", label: "সন্তুষ্ট গ্রাহক" },
    { icon: Star, value: "4.9", label: "গড় রেটিং" },
    { icon: TrendingUp, value: "95%", label: "রিপিট অর্ডার" },
    { icon: Zap, value: "24h", label: "দ্রুত ডেলিভারি" }
  ];

  const features = [
    {
      icon: Palette,
      title: "কাস্টম ডিজাইন",
      description: "আপনার পছন্দ অনুযায়ী ডিজাইন করুন"
    },
    {
      icon: Gift,
      title: "প্রিমিয়াম প্যাকেজিং",
      description: "বিশেষ গিফট র‍্যাপিং সহ"
    },
    {
      icon: Heart,
      title: "১০০% গ্যারান্টি",
      description: "সন্তুষ্ট না হলে সম্পূর্ণ টাকা ফেরত"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const currentHero = heroSlides[currentSlide];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-400/20 via-transparent to-transparent"></div>
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-screen py-20">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 px-4 py-2 text-sm font-medium">
                <Sparkles className="w-4 h-4 mr-2" />
                প্রিমিয়াম কালেকশন
              </Badge>
            </motion.div>

            {/* Main Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight">
                <span className="bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  {currentHero.title}
                </span>
              </h1>
              <h2 className="text-2xl lg:text-3xl text-purple-200 font-medium">
                {currentHero.subtitle}
              </h2>
              <p className="text-lg text-gray-300 max-w-xl leading-relaxed">
                {currentHero.description}
              </p>
            </motion.div>

            {/* Features List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-3"
            >
              {currentHero.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-gray-300 font-medium">{feature}</span>
                </div>
              ))}
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link href="/products">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-8 py-4 rounded-full shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105"
                >
                  {currentHero.primaryBtn}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              
              <Button 
                variant="outline"
                size="lg"
                className="border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-8 py-4 rounded-full font-semibold transition-all duration-300"
                onClick={() => setIsVideoPlaying(true)}
              >
                <Play className="w-5 h-5 mr-2" />
                {currentHero.secondaryBtn}
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                    <stat.icon className="w-6 h-6 text-purple-300" />
                  </div>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-gray-300">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Content - Image/Video Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative">
              {/* Main Hero Image */}
              <div className="relative w-full h-[600px] rounded-3xl overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10"></div>
                <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Gift className="w-32 h-32 mx-auto mb-4 opacity-30" />
                    <h3 className="text-3xl font-bold mb-2">প্রিমিয়াম কালেকশন</h3>
                    <p className="text-lg opacity-80">বিশেষ গিফট আইটেম</p>
                  </div>
                </div>
              </div>

              {/* Floating Feature Cards */}
              <div className="absolute -left-4 top-20 lg:-left-8">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-xl border-0">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                          <Check className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="font-bold text-green-600">ফ্রি ডেলিভারি</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">১৬০০ টাকার উপরে</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              <div className="absolute -right-4 bottom-20 lg:-right-8">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 }}
                >
                  <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-xl border-0">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <Star className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="font-bold text-purple-600">৪.৯ রেটিং</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">৫০,০০০+ রিভিউ</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              <div className="absolute top-1/2 -right-4 lg:-right-8 transform -translate-y-1/2">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 }}
                >
                  <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-xl border-0">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Palette className="w-6 h-6 text-white" />
                        </div>
                        <div className="font-bold text-blue-600">কাস্টম ডিজাইন</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">যে কোনো আকার</div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-20"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
            >
              <Card className="bg-white/10 dark:bg-white/5 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300 h-full">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Slide Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex justify-center space-x-3 pb-10"
        >
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-white w-8' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default PremiumHeroSection;