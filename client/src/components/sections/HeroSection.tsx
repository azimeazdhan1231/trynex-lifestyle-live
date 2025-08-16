import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Star, Gift, Truck, Shield } from "lucide-react";

const HeroSection = () => {
  const features = [
    { icon: Gift, text: "প্রিমিয়াম গিফট কালেকশন" },
    { icon: Truck, text: "দ্রুত ডেলিভারি" },
    { icon: Shield, text: "১০০% নিরাপদ" },
  ];

  return (
    <section className="relative min-h-[80vh] bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 overflow-hidden">
      {/* Background Patterns */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-500 rounded-full blur-xl animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center space-x-2 text-primary"
              >
                <Star className="w-5 h-5 fill-current" />
                <span className="text-sm font-medium">বাংলাদেশের নং ১ গিফট স্টোর</span>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight"
              >
                TryneX{" "}
                <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  Lifestyle
                </span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-gray-600 dark:text-gray-300 max-w-lg"
              >
                প্রিমিয়াম গিফট এবং লাইফস্টাইল পণ্যের বিশাল সংগ্রহ। 
                আপনার প্রিয়জনদের জন্য সেরা উপহার খুঁজে নিন।
              </motion.p>
            </div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-4"
            >
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-full px-4 py-2 shadow-md">
                  <feature.icon className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {feature.text}
                  </span>
                </div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link href="/products">
                <Button size="lg" className="group">
                  এখনই কেনাকাটা করুন
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/offers">
                <Button variant="outline" size="lg">
                  বিশেষ অফার দেখুন
                </Button>
              </Link>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400"
            >
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>৪.৮ রেটিং</span>
              </div>
              <div>১০,০০০+ খুশি গ্রাহক</div>
              <div>২৪/৭ সাপোর্ট</div>
            </motion.div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative w-full h-96 lg:h-[500px] bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-purple-600 opacity-10" />
              <div className="absolute inset-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex items-center justify-center">
                <div className="text-center">
                  <Gift className="w-20 h-20 mx-auto mb-4 text-primary" />
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                    হাজারো পণ্য
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    সবচেয়ে বেশি পছন্দের গিফট আইটেম
                  </p>
                </div>
              </div>
            </div>
            
            {/* Floating Elements */}
            <motion.div
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -right-4 w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg"
            >
              <Gift className="w-8 h-8 text-white" />
            </motion.div>
            
            <motion.div
              animate={{ y: [10, -10, 10] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-4 -left-4 w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center shadow-lg"
            >
              <Star className="w-6 h-6 text-white fill-current" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;