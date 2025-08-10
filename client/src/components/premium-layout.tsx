import { ReactNode, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Menu,
  Search,
  ShoppingCart,
  User,
  Heart,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  MessageCircle,
  X,
  Home,
  Package,
  Gift,
  Info,
  FileText,
  Truck
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { COMPANY_NAME, WHATSAPP_NUMBER } from "@/lib/constants";

interface PremiumLayoutProps {
  children: ReactNode;
}

export default function PremiumLayout({ children }: PremiumLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [location] = useLocation();
  const { cart, totalItems } = useCart();

  const cartItemCount = totalItems;

  // Close mobile menu when location changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const navigationLinks = [
    { href: "/", label: "হোম", icon: Home },
    { href: "/products", label: "পণ্য", icon: Package },
    { href: "/offers", label: "অফার", icon: Gift },
    { href: "/about", label: "আমাদের সম্পর্কে", icon: Info },
    { href: "/contact", label: "যোগাযোগ", icon: Phone },
    { href: "/tracking", label: "ট্র্যাকিং", icon: Truck }
  ];

  const footerLinks = [
    {
      title: "কোম্পানি",
      links: [
        { href: "/about", label: "আমাদের সম্পর্কে" },
        { href: "/contact", label: "যোগাযোগ" },
        { href: "/blog", label: "ব্লগ" }
      ]
    },
    {
      title: "পলিসি",
      links: [
        { href: "/terms-conditions", label: "শর্তাবলী" },
        { href: "/refund-policy", label: "রিফান্ড পলিসি" },
        { href: "/payment-policy", label: "পেমেন্ট পলিসি" }
      ]
    },
    {
      title: "সাহায্য",
      links: [
        { href: "/tracking", label: "অর্ডার ট্র্যাকিং" },
        { href: "/custom-order", label: "কাস্টম অর্ডার" },
        { href: "/offers", label: "অফার সমূহ" }
      ]
    }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const handleWhatsAppContact = () => {
    const message = "আসসালামু আলাইকুম! আমি আপনাদের সাথে কথা বলতে চাই।";
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="premium-button-primary rounded-lg p-2">
                <Gift className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl premium-heading hidden sm:block">
                {COMPANY_NAME}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6">
              {navigationLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    location === link.href ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Desktop Search */}
            <div className="hidden md:flex items-center space-x-4 flex-1 max-w-md mx-6">
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="পণ্য খুঁজুন..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2"
                  />
                </div>
              </form>
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-2">
              {/* Mobile Search Toggle */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* Cart */}
              <Link href="/cart">
                <Button variant="ghost" size="sm" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {cartItemCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                      {cartItemCount}
                    </Badge>
                  )}
                </Button>
              </Link>

              {/* Profile */}
              <Button variant="ghost" size="sm">
                <User className="h-5 w-5" />
              </Button>

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Search Overlay */}
        {isSearchOpen && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden">
            <div className="container mx-auto p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">পণ্য খুঁজুন</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSearchOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="পণ্য খুঁজুন..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2"
                    autoFocus
                  />
                </div>
              </form>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed right-0 top-0 h-full w-[300px] bg-background border-l shadow-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <span className="font-semibold">মেনু</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <nav className="p-4">
              <div className="space-y-2">
                {navigationLinks.map((link) => {
                  const IconComponent = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                        location === link.href
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <IconComponent className="h-5 w-5" />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </div>
              
              <div className="border-t mt-6 pt-6">
                <Button
                  className="w-full premium-button-primary"
                  onClick={handleWhatsAppContact}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WhatsApp এ যোগাযোগ
                </Button>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-muted/30 border-t">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="premium-button-primary rounded-lg p-2">
                  <Gift className="h-6 w-6 text-white" />
                </div>
                <span className="font-bold text-xl premium-heading">
                  {COMPANY_NAME}
                </span>
              </div>
              <p className="premium-text-muted text-sm leading-relaxed">
                বাংলাদেশের সেরা গিফট এবং কাস্টমাইজ পণ্যের অনলাইন শপ। 
                আপনার প্রিয়জনদের জন্য বিশেষ উপহার খুঁজে নিন।
              </p>
              <div className="flex space-x-3">
                <Button variant="outline" size="sm">
                  <Facebook className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Instagram className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleWhatsAppContact}>
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Footer Links */}
            {footerLinks.map((section) => (
              <div key={section.title} className="space-y-4">
                <h4 className="font-semibold premium-heading">{section.title}</h4>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm premium-text-muted hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Contact Info */}
          <div className="border-t mt-8 pt-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start space-x-2">
                <Phone className="h-4 w-4 text-primary" />
                <span className="text-sm">+৮৮০ ১৭১২ ৩৪৫৬৭৮</span>
              </div>
              <div className="flex items-center justify-center md:justify-start space-x-2">
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-sm">info@trynexlifestyle.com</span>
              </div>
              <div className="flex items-center justify-center md:justify-start space-x-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-sm">ঢাকা, বাংলাদেশ</span>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t mt-8 pt-8 text-center">
            <p className="text-sm premium-text-muted">
              © ২০২৫ {COMPANY_NAME}। সকল অধিকার সংরক্ষিত।
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}