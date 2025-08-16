import { Link } from "wouter";
import { motion } from "framer-motion";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Instagram, 
  Twitter,
  Youtube,
  Send,
  Heart,
  Shield,
  Truck,
  CreditCard,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    setEmail("");
  };

  const footerLinks = {
    company: [
      { name: "আমাদের সম্পর্কে", href: "/about" },
      { name: "যোগাযোগ", href: "/contact" },
      { name: "ক্যারিয়ার", href: "/careers" },
      { name: "প্রেস", href: "/press" },
    ],
    support: [
      { name: "সাহায্য কেন্দ্র", href: "/help" },
      { name: "অর্ডার ট্র্যাকিং", href: "/tracking" },
      { name: "রিটার্ন পলিসি", href: "/return" },
      { name: "রিফান্ড পলিসি", href: "/refund" },
    ],
    legal: [
      { name: "টার্মস অফ সার্ভিস", href: "/terms" },
      { name: "প্রাইভেসি পলিসি", href: "/privacy" },
      { name: "পেমেন্ট পলিসি", href: "/payment-policy" },
      { name: "কুকি পলিসি", href: "/cookies" },
    ],
    categories: [
      { name: "গিফট আইটেম", href: "/products?category=gifts" },
      { name: "ইলেকট্রনিক্স", href: "/products?category=electronics" },
      { name: "ফ্যাশন", href: "/products?category=fashion" },
      { name: "হোম ডেকোর", href: "/products?category=home-decor" },
    ]
  };

  const socialLinks = [
    { icon: Facebook, href: "https://facebook.com/trynexlifestyle", label: "Facebook" },
    { icon: Instagram, href: "https://instagram.com/trynexlifestyle", label: "Instagram" },
    { icon: Twitter, href: "https://twitter.com/trynexlifestyle", label: "Twitter" },
    { icon: Youtube, href: "https://youtube.com/trynexlifestyle", label: "YouTube" },
  ];

  const features = [
    { icon: Truck, text: "ফ্রি ডেলিভারি", subtext: "৫০০ টাকার উপরে" },
    { icon: Shield, text: "নিরাপদ পেমেন্ট", subtext: "১০০% সিকিউর" },
    { icon: Clock, text: "২৪/৭ সাপোর্ট", subtext: "যেকোনো সময়" },
    { icon: CreditCard, text: "ক্যাশ অন ডেলিভারি", subtext: "সুবিধাজনক" },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Features Section */}
      <div className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="flex items-center space-x-3"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{feature.text}</p>
                  <p className="text-xs text-gray-400">{feature.subtext}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">TryneX Lifestyle</h3>
                <p className="text-sm text-gray-400">বাংলাদেশের প্রিমিয়াম গিফট স্টোর</p>
              </div>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              আমরা বাংলাদেশের সবচেয়ে বিশ্বস্ত অনলাইন গিফট শপ। আমাদের রয়েছে 
              হাজারো পণ্যের বিশাল সংগ্রহ এবং দ্রুততম ডেলিভারি সার্ভিস।
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-primary" />
                <span className="text-sm">+880 1234-567890</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-primary" />
                <span className="text-sm">info@trynexlifestyle.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-sm">ঢাকা, বাংলাদেশ</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">কোম্পানি</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>
                    <span className="text-gray-400 hover:text-white transition-colors text-sm">
                      {link.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">সাপোর্ট</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>
                    <span className="text-gray-400 hover:text-white transition-colors text-sm">
                      {link.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">ক্যাটেগরি</h4>
            <ul className="space-y-2">
              {footerLinks.categories.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>
                    <span className="text-gray-400 hover:text-white transition-colors text-sm">
                      {link.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="text-center mb-8">
            <h4 className="text-2xl font-bold mb-2">আমাদের নিউজলেটার সাবস্ক্রাইব করুন</h4>
            <p className="text-gray-400 mb-6">
              বিশেষ অফার এবং নতুন পণ্যের আপডেট পেতে সাবস্ক্রাইব করুন
            </p>
            <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto flex gap-2">
              <Input
                type="email"
                placeholder="আপনার ইমেইল এড্রেস"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
                required
              />
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>

          {/* Social Links */}
          <div className="flex justify-center space-x-4 mb-8">
            {socialLinks.map((social) => (
              <motion.a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label={social.label}
              >
                <social.icon className="w-5 h-5" />
              </motion.a>
            ))}
          </div>

          {/* Bottom Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-800">
            <div className="flex items-center space-x-2 text-sm text-gray-400 mb-4 md:mb-0">
              <span>© 2025 TryneX Lifestyle. সকল অধিকার সংরক্ষিত।</span>
              <Heart className="w-4 h-4 text-red-500" />
            </div>
            <div className="flex space-x-6 text-sm">
              {footerLinks.legal.map((link) => (
                <Link key={link.href} href={link.href}>
                  <span className="text-gray-400 hover:text-white transition-colors">
                    {link.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;