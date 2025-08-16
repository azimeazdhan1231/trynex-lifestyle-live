import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Mail, Send, Gift, Bell } from "lucide-react";

const NewsletterSection = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    
    // Simulate newsletter subscription
    setTimeout(() => {
      toast({
        title: "সফলভাবে সাবস্ক্রাইব করেছেন!",
        description: "আমাদের নিউজলেটারে স্বাগতম। শীঘ্রই আপনি বিশেষ অফার পাবেন।",
      });
      setEmail("");
      setIsLoading(false);
    }, 1000);
  };

  return (
    <section className="py-16 bg-gradient-to-br from-primary to-purple-600 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-xl animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Bell className="w-6 h-6" />
              </div>
              <span className="text-lg font-medium">নিউজলেটার</span>
            </div>

            <h2 className="text-3xl lg:text-4xl font-bold leading-tight">
              বিশেষ অফার এবং আপডেট পেতে{" "}
              <span className="text-yellow-300">সাবস্ক্রাইব</span> করুন
            </h2>

            <p className="text-lg text-white/90 max-w-lg">
              প্রতি সপ্তাহে নতুন পণ্য, একচেটিয়া ছাড় এবং বিশেষ অফারের খবর 
              সবার আগে পান আমাদের নিউজলেটারের মাধ্যমে।
            </p>

            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <Gift className="w-4 h-4 text-yellow-300" />
                <span>একচেটিয়া অফার</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-yellow-300" />
                <span>সাপ্তাহিক আপডেট</span>
              </div>
            </div>
          </motion.div>

          {/* Subscription Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  ইমেইল এড্রেস
                </label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/20 border-white/30 text-white placeholder:text-white/70 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/50"
                    required
                    data-testid="newsletter-email"
                  />
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/70" />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-white text-primary hover:bg-white/90 transition-colors py-3 rounded-lg font-medium"
                data-testid="newsletter-submit"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span>সাবস্ক্রাইব হচ্ছে...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Send className="w-4 h-4" />
                    <span>সাবস্ক্রাইব করুন</span>
                  </div>
                )}
              </Button>

              <p className="text-xs text-white/70 text-center">
                সাবস্ক্রাইব করে আপনি আমাদের{" "}
                <a href="/privacy" className="underline hover:text-white">
                  প্রাইভেসি পলিসি
                </a>{" "}
                এর সাথে সম্মত হচ্ছেন।
              </p>
            </form>

            {/* Success Indicators */}
            <div className="mt-6 pt-6 border-t border-white/20">
              <div className="flex items-center justify-between text-sm text-white/80">
                <span>✓ স্প্যাম ফ্রি</span>
                <span>✓ যেকোনো সময় আনসাবস্ক্রাইব</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;