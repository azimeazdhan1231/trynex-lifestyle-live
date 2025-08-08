import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, ShoppingCart, User, Menu, X, Phone, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useCart } from '@/hooks/use-cart';
import CartModal from './cart-modal';
import UserRegistration from './user-registration';
import UserLogin from './user-login';

interface UserData {
  firstName: string;
  email?: string;
  id?: string;
}

export default function EnhancedHeader() {
  const [location, navigate] = useLocation();
  const { totalItems } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRegistration, setShowRegistration] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLoginSuccess = (userData: any) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    setUser(null);
  };

  const navLinks = [
    { href: '/', label: 'হোম' },
    { href: '/products', label: 'পণ্যসমূহ' },
    { href: '/categories', label: 'ক্যাটেগরি' },
    { href: '/about', label: 'আমাদের সম্পর্কে' },
    { href: '/contact', label: 'যোগাযোগ' },
    { href: '/blog', label: 'ব্লগ' }
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b">


        {/* Main Header */}
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                T
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-800">TryneX Shop</h1>
                <p className="text-xs text-gray-500">Lifestyle Collection</p>
              </div>
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden lg:block flex-1 max-w-md mx-8">
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="text"
                  placeholder="পণ্য খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Button
                  type="submit"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 rounded-full h-8 px-3"
                >
                  খুঁজুন
                </Button>
              </form>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* User Account */}
              <div className="hidden sm:block">
                {user ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">
                      {user.firstName}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                      className="text-xs"
                    >
                      লগআউট
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowLogin(true)}
                      className="text-sm"
                    >
                      <User className="w-4 h-4 mr-1" />
                      লগইন
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowRegistration(true)}
                      className="text-sm"
                    >
                      রেজিস্টার
                    </Button>
                  </div>
                )}
              </div>

              {/* Cart */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCartOpen(true)}
                className="relative p-2"
              >
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {totalItems}
                  </Badge>
                )}
              </Button>

              {/* Mobile Menu */}
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-all duration-200">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full max-w-xs sm:max-w-sm bg-white border-l border-gray-200 shadow-xl">
                  <div className="flex flex-col gap-4 sm:gap-6 pt-4 sm:pt-6 h-full overflow-y-auto">
                    {/* Mobile Search */}
                    <form onSubmit={handleSearch} className="relative px-1">
                      <Input
                        type="text"
                        placeholder="পণ্য খুঁজুন..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 h-10 sm:h-11 rounded-xl border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm sm:text-base"
                      />
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Button
                        type="submit"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm rounded-lg"
                      >
                        খুঁজুন
                      </Button>
                    </form>

                    {/* Mobile User Actions */}
                    <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-3 sm:p-4 mx-1">
                      {user ? (
                        <div className="flex flex-col gap-2 sm:gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base">
                              {user.firstName?.charAt(0)}
                            </div>
                            <div>
                              <div className="text-base sm:text-lg font-medium text-gray-800 truncate">
                                স্বাগতম, {user.firstName}
                              </div>
                              <div className="text-xs sm:text-sm text-gray-500">
                                গ্রাহক অ্যাকাউন্ট
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            onClick={handleLogout}
                            className="w-full h-9 sm:h-11 rounded-xl border-primary text-primary hover:bg-primary hover:text-white text-sm sm:text-base transition-all duration-200"
                          >
                            লগআউট
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2 sm:gap-3">
                          <div className="text-center mb-1 sm:mb-2">
                            <h3 className="font-semibold text-gray-800 text-sm sm:text-base">আপনার অ্যাকাউন্ট</h3>
                            <p className="text-xs sm:text-sm text-gray-600">লগইন করুন বা নতুন অ্যাকাউন্ট তৈরি করুন</p>
                          </div>
                          <Button
                            onClick={() => {
                              setShowLogin(true);
                              setIsMenuOpen(false);
                            }}
                            className="w-full h-9 sm:h-11 rounded-xl bg-primary hover:bg-primary/90 text-sm sm:text-base transition-all duration-200"
                          >
                            <User className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                            লগইন
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowRegistration(true);
                              setIsMenuOpen(false);
                            }}
                            className="w-full h-9 sm:h-11 rounded-xl border-primary text-primary hover:bg-primary hover:text-white text-sm sm:text-base transition-all duration-200"
                          >
                            রেজিস্টার করুন
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Mobile Navigation */}
                    <nav className="flex flex-col gap-1 flex-1 px-1">
                      <h3 className="font-semibold text-gray-800 mb-2 sm:mb-3 px-2 text-sm sm:text-base">মেনু</h3>
                      {navLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className={`flex items-center py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl transition-all duration-200 font-medium text-sm sm:text-base ${
                            location === link.href
                              ? 'bg-primary text-white shadow-md'
                              : 'text-gray-700 hover:bg-gray-100 hover:text-primary active:bg-gray-200'
                          }`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </nav>
                    
                    {/* Mobile Menu Footer */}
                    <div className="mt-auto pt-4 border-t border-gray-200 mx-1">
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-2">TryneX Shop</p>
                        <p className="text-xs text-gray-400">Lifestyle Collection</p>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center justify-center gap-8 mt-4 pt-4 border-t">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-orange-600 ${
                  location === link.href
                    ? 'text-orange-600 border-b-2 border-orange-600 pb-1'
                    : 'text-gray-700'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Modals */}
      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      
      <UserRegistration
        isOpen={showRegistration}
        onClose={() => setShowRegistration(false)}
        onLoginClick={() => {
          setShowRegistration(false);
          setShowLogin(true);
        }}
      />
      
      <UserLogin
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onRegisterClick={() => {
          setShowLogin(false);
          setShowRegistration(true);
        }}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
}