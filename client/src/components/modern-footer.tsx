import { Link } from 'wouter';
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin, Heart, ArrowRight, Shield, Truck, RefreshCw, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

export default function ModernFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-gray-50 to-white border-t border-gray-200 mt-16">
      
      {/* Trust Badges Section */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3 p-4 rounded-lg bg-green-50 border border-green-100">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Truck className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-green-800">ফ্রি ডেলিভারি</h4>
                <p className="text-xs text-green-600">১৫০০+ অর্ডারে</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 rounded-lg bg-blue-50 border border-blue-100">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-blue-800">নিরাপদ পেমেন্ট</h4>
                <p className="text-xs text-blue-600">১০০% সুরক্ষিত</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 rounded-lg bg-orange-50 border border-orange-100">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-orange-800">সহজ রিটার্ন</h4>
                <p className="text-xs text-orange-600">৭ দিনের গ্যারান্টি</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 rounded-lg bg-purple-50 border border-purple-100">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-purple-800">ক্যাশ অন ডেলিভারি</h4>
                <p className="text-xs text-purple-600">ঘরে বসে পেমেন্ট</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-2">আমাদের নিউজলেটার সাবস্ক্রাইব করুন</h3>
            <p className="text-orange-100 mb-6">
              সর্বশেষ অফার, নতুন পণ্য এবং বিশেষ ছাড়ের খবর পেতে সাবস্ক্রাইব করুন
            </p>
            <div className="flex flex-col sm:flex-row max-w-md mx-auto gap-3">
              <Input
                type="email"
                placeholder="আপনার ইমেইল ঠিকানা..."
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/70 focus:bg-white/20"
              />
              <Button
                size="lg"
                className="bg-white text-orange-500 hover:bg-gray-100 font-semibold px-6"
              >
                সাবস্ক্রাইব <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
                T
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  TryneX Lifestyle
                </h2>
                <p className="text-sm text-gray-500">আপনার পছন্দের গিফট</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              বাংলাদেশের সেরা গিফট এবং লাইফস্টাইল প্রোডাক্টের জন্য আমাদের সাথে থাকুন। 
              আমরা মানসম্পন্ন পণ্য এবং দুর্দান্ত সেবা প্রদানে প্রতিশ্রুতিবদ্ধ।
            </p>
            <div className="flex space-x-3">
              <a href="#" className="w-10 h-10 bg-blue-100 hover:bg-blue-500 text-blue-500 hover:text-white rounded-full flex items-center justify-center transition-all duration-300">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-pink-100 hover:bg-pink-500 text-pink-500 hover:text-white rounded-full flex items-center justify-center transition-all duration-300">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-red-100 hover:bg-red-500 text-red-500 hover:text-white rounded-full flex items-center justify-center transition-all duration-300">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">দ্রুত লিংক</h3>
            <div className="space-y-3">
              {[
                { href: '/products', label: 'সব পণ্য' },
                { href: '/custom-order', label: 'কাস্টমাইজ অর্ডার' },
                { href: '/tracking', label: 'অর্ডার ট্র্যাকিং' },
                { href: '/offers', label: 'বিশেষ অফার' },
                { href: '/about', label: 'আমাদের সম্পর্কে' },
                { href: '/contact', label: 'যোগাযোগ' }
              ].map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-gray-600 hover:text-orange-500 text-sm transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Customer Support */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">কাস্টমার সাপোর্ট</h3>
            <div className="space-y-3">
              {[
                { href: '/terms', label: 'শর্তাবলী' },
                { href: '/refund-policy', label: 'রিফান্ড নীতি' },
                { href: '/return-policy', label: 'রিটার্ন নীতি' },
                { href: '/payment-policy', label: 'পেমেন্ট নীতি' },
                { href: '/faq', label: 'সাধারণ প্রশ্ন' },
                { href: '/support', label: 'সাহায্য কেন্দ্র' }
              ].map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-gray-600 hover:text-orange-500 text-sm transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">যোগাযোগ করুন</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-600">
                  <p>১২৩, রোড নং ৫</p>
                  <p>ধানমন্ডি, ঢাকা-১২০৫</p>
                  <p>বাংলাদেশ</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-gray-900 font-medium">+880 1234-567890</p>
                  <p className="text-gray-600">সকাল ৯টা - রাত ৯টা</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-gray-900 font-medium">support@trynex.com</p>
                  <p className="text-gray-600">২৪/৭ ইমেইল সাপোর্ট</p>
                </div>
              </div>

              <div className="pt-4">
                <a
                  href="https://wa.me/8801234567890"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  <span>📱</span>
                  <span>WhatsApp এ চ্যাট করুন</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-0" />

      {/* Bottom Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-center md:text-left">
            <p className="text-gray-600 text-sm">
              © {currentYear} TryneX Lifestyle. সকল অধিকার সংরক্ষিত।
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Made with <Heart className="inline w-3 h-3 text-red-500" /> in Bangladesh
            </p>
          </div>
          
          <div className="flex items-center space-x-6 text-xs text-gray-500">
            <span className="flex items-center space-x-1">
              <Shield className="w-3 h-3" />
              <span>SSL Secured</span>
            </span>
            <span className="flex items-center space-x-1">
              <CreditCard className="w-3 h-3" />
              <span>Secure Payment</span>
            </span>
            <span className="flex items-center space-x-1">
              <Truck className="w-3 h-3" />
              <span>Fast Delivery</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}