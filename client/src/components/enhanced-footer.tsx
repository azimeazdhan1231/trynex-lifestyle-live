import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Facebook, 
  Instagram, 
  MessageCircle,
  Heart,
  Shield,
  Truck,
  CreditCard,
  Users,
  Star,
  ArrowUp
} from 'lucide-react';
import { COMPANY_NAME, WHATSAPP_NUMBER, createWhatsAppUrl } from '@/lib/constants';
import { useState, useEffect } from 'react';

export default function EnhancedFooter() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const quickLinks = [
    { name: 'হোম', href: '/' },
    { name: 'পণ্যসমূহ', href: '/products' },
    { name: 'ক্যাটাগরি', href: '/categories' },
    { name: 'অফার', href: '/offers' },
    { name: 'আমাদের সম্পর্কে', href: '/about' },
    { name: 'যোগাযোগ', href: '/contact' }
  ];

  const customerService = [
    { name: 'সাহায্য কেন্দ্র', href: '/help' },
    { name: 'নিয়ম ও শর্তাবলী', href: '/terms-conditions' },
    { name: 'রিফান্ড ও রিপ্লেসমেন্ট', href: '/refund-policy' },
    { name: 'পেমেন্ট নীতিমালা', href: '/payment-policy' },
    { name: 'গোপনীয়তা নীতি', href: '/privacy' },
    { name: 'FAQ', href: '/faq' }
  ];

  const categories = [
    { name: 'কাস্টমাইজড গিফট', href: '/category/custom-gifts' },
    { name: 'টি-শার্ট', href: '/category/t-shirts' },
    { name: 'মগ', href: '/category/mugs' },
    { name: 'ফোটো ফ্রেম', href: '/category/photo-frames' },
    { name: 'কিচেইন', href: '/category/keychains' },
    { name: 'স্টিকার', href: '/category/stickers' }
  ];

  return (
    <>
      {/* Newsletter Section */}
      <section className="bg-gradient-to-r from-primary via-primary/90 to-primary text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              আমাদের নিউজলেটার সাবস্ক্রাইব করুন
            </h2>
            <p className="text-xl mb-8 text-white/90">
              নতুন পণ্য, বিশেষ ছাড় এবং এক্সক্লুসিভ অফারের খবর সবার আগে পান
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="আপনার ইমেইল ঠিকানা"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-white focus:outline-none"
              />
              <Button className="bg-white text-primary hover:bg-gray-100 font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:scale-105">
                সাবস্ক্রাইব করুন
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Footer */}
      <footer className="bg-gray-900 text-white">
        {/* Top Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                  {COMPANY_NAME.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{COMPANY_NAME}</h3>
                  <p className="text-gray-400 text-sm">আপনার পছন্দের গিফট শপ</p>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed">
                আমরা বাংলাদেশের সেরা কাস্টমাইজড গিফট ও ফ্যাশন পণ্যের অনলাইন শপ। 
                আপনার পছন্দের ডিজাইনে পণ্য তৈরি করি প্রিমিয়াম মানের নিশ্চয়তায়।
              </p>
              
              {/* Trust Badges */}
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-green-600 hover:bg-green-700">
                  <Shield className="w-3 h-3 mr-1" />
                  ১০০% নিরাপদ
                </Badge>
                <Badge className="bg-blue-600 hover:bg-blue-700">
                  <Truck className="w-3 h-3 mr-1" />
                  দ্রুত ডেলিভারি
                </Badge>
                <Badge className="bg-purple-600 hover:bg-purple-700">
                  <Star className="w-3 h-3 mr-1" />
                  ৪.৮ রেটিং
                </Badge>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">দ্রুত লিংক</h4>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href}
                      className="text-gray-300 hover:text-white transition-colors duration-300 hover:translate-x-1 transform inline-block"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">কাস্টমার সার্ভিস</h4>
              <ul className="space-y-3">
                {customerService.map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href}
                      className="text-gray-300 hover:text-white transition-colors duration-300 hover:translate-x-1 transform inline-block"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">যোগাযোগ</h4>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium">01747292277</p>
                    <p className="text-gray-400 text-sm">২৪/৭ সাপোর্ট</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-white">trynexlifestyle@gmail.com</p>
                    <p className="text-gray-400 text-sm">সাপোর্ট ইমেইল</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-white">ঢাকা, বাংলাদেশ</p>
                    <p className="text-gray-400 text-sm">প্রধান অফিস</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-white">সকাল ৯টা - রাত ১০টা</p>
                    <p className="text-gray-400 text-sm">অফিস সময়</p>
                  </div>
                </div>
              </div>

              {/* WhatsApp Button */}
              <Button 
                className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-medium py-3 transition-all duration-300 hover:scale-105"
                onClick={() => window.open(createWhatsAppUrl('আমি আপনাদের সার্ভিস সম্পর্কে জানতে চাই'), '_blank')}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                হোয়াটসঅ্যাপে যোগাযোগ
              </Button>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="border-t border-gray-800">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-center space-x-3 text-center md:text-left">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <Truck className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h5 className="font-semibold text-white">দ্রুত ডেলিভারি</h5>
                  <p className="text-gray-400 text-sm">২৪-৪৮ ঘন্টায়</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 text-center md:text-left">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h5 className="font-semibold text-white">নিরাপদ পেমেন্ট</h5>
                  <p className="text-gray-400 text-sm">১০০% সুরক্ষিত</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 text-center md:text-left">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h5 className="font-semibold text-white">২৪/৭ সাপোর্ট</h5>
                  <p className="text-gray-400 text-sm">সবসময় পাশে</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 text-center md:text-left">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h5 className="font-semibold text-white">কোয়ালিটি গ্যারান্টি</h5>
                  <p className="text-gray-400 text-sm">প্রিমিয়াম মান</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media & Payment */}
        <div className="border-t border-gray-800">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
              {/* Social Media */}
              <div className="flex items-center space-x-4">
                <span className="text-gray-400">আমাদের ফলো করুন:</span>
                <div className="flex space-x-3">
                  <Button size="sm" variant="ghost" className="w-10 h-10 p-0 text-gray-400 hover:text-white hover:bg-blue-600">
                    <Facebook className="w-5 h-5" />
                  </Button>
                  <Button size="sm" variant="ghost" className="w-10 h-10 p-0 text-gray-400 hover:text-white hover:bg-pink-600">
                    <Instagram className="w-5 h-5" />
                  </Button>
                  <Button size="sm" variant="ghost" className="w-10 h-10 p-0 text-gray-400 hover:text-white hover:bg-green-600">
                    <MessageCircle className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="flex items-center space-x-4">
                <span className="text-gray-400">পেমেন্ট অপশন:</span>
                <div className="flex space-x-2">
                  <Badge variant="outline" className="text-gray-300 border-gray-600">
                    bKash
                  </Badge>
                  <Badge variant="outline" className="text-gray-300 border-gray-600">
                    Nagad
                  </Badge>
                  <Badge variant="outline" className="text-gray-300 border-gray-600">
                    Cash
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 bg-gray-950">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-400">
              <p>© ২০২৫ {COMPANY_NAME}। সকল অধিকার সংরক্ষিত।</p>
              <p>তৈরি করেছে <span className="text-primary">❤️</span> দিয়ে বাংলাদেশে</p>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 w-12 h-12 p-0 rounded-full bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50"
        >
          <ArrowUp className="w-5 h-5" />
        </Button>
      )}
    </>
  );
}