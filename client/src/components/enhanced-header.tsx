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

export default function EnhancedHeader() {
  const [location, navigate] = useLocation();
  const { totalItems } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRegistration, setShowRegistration] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState(null);

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
        {/* Top Bar */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 hidden sm:block">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  <span>+৮৮০ ১৭৪৭২৯২২৭৭</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>বিনামূল্যে ডেলিভারি ৫০০+ টাকায়</span>
                </div>
              </div>
              <div className="text-sm">
                ⭐ ৪.৮ রেটিং | ১০০০+ সন্তুষ্ট গ্রাহক
              </div>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                T
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-800">Trynex</h1>
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
                  <Button variant="ghost" size="sm" className="lg:hidden p-2">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <div className="flex flex-col gap-6 pt-6">
                    {/* Mobile Search */}
                    <form onSubmit={handleSearch} className="relative">
                      <Input
                        type="text"
                        placeholder="পণ্য খুঁজুন..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10"
                      />
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </form>

                    {/* Mobile User Actions */}
                    {user ? (
                      <div className="flex flex-col gap-2">
                        <div className="text-lg font-medium">
                          স্বাগতম, {user.firstName}
                        </div>
                        <Button
                          variant="outline"
                          onClick={handleLogout}
                          className="w-full"
                        >
                          লগআউট
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <Button
                          onClick={() => {
                            setShowLogin(true);
                            setIsMenuOpen(false);
                          }}
                          className="w-full"
                        >
                          <User className="w-4 h-4 mr-2" />
                          লগইন
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowRegistration(true);
                            setIsMenuOpen(false);
                          }}
                          className="w-full"
                        >
                          রেজিস্টার করুন
                        </Button>
                      </div>
                    )}

                    {/* Mobile Navigation */}
                    <nav className="flex flex-col gap-2">
                      {navLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className={`flex items-center py-2 px-3 rounded-lg transition-colors ${
                            location === link.href
                              ? 'bg-orange-100 text-orange-600'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </nav>
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