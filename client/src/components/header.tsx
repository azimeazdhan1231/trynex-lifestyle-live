import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Search, ShoppingCart, Menu, X, Phone } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { COMPANY_NAME } from "@/lib/constants";
import PerfectCartModal from "@/components/perfect-modals/perfect-cart-modal";
// Search bar component removed for consolidation
import ProductModal from "@/components/product-modal";
import type { Product } from "@shared/schema";

interface HeaderProps {
  cartCount: number;
  onCartOpen: () => void;
}

export default function Header({ cartCount, onCartOpen }: HeaderProps) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [location] = useLocation();

  const navItems = [
    { name: "হোম", href: "/" },
    { name: "পণ্য", href: "/products" },
    { name: "কাস্টমাইজেশন", href: "/customize" },
    { name: "কাস্টম অর্ডার", href: "/custom-order" },
    { name: "ট্র্যাকিং", href: "/tracking" },
    { name: "অফার", href: "/offers" },
    { name: "যোগাযোগ", href: "/contact" },
  ];

  const isActive = (href: string) => {
    return location === href;
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  return (
    <>
      <header className="bg-white shadow-lg fixed top-0 left-0 right-0 z-50">        
        <div className="container mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0">
              <Link href="/">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-primary cursor-pointer hover:text-primary/80 transition-colors truncate">
                  {COMPANY_NAME}
                </h1>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-6 xl:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`font-medium transition-colors text-sm lg:text-base ${
                    isActive(item.href) 
                      ? "text-primary font-semibold" 
                      : "text-gray-600 hover:text-primary"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Search, Cart and Contact */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              {/* Search Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSearchOpen(true)}
                className="p-1.5 sm:p-2 text-gray-700 hover:text-primary transition-colors touch-manipulation min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center"
                data-testid="button-search"
              >
                <Search className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>

              {/* Cart Button - Enhanced */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCartOpen(true)}
                className="relative p-1.5 sm:p-2 text-gray-700 hover:text-primary transition-all duration-200 hover:bg-primary/10 rounded-lg min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center touch-manipulation"
                data-testid="button-cart"
              >
                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 flex items-center justify-center font-semibold shadow-lg text-[9px] sm:text-[10px] leading-none">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Button>

              {/* Contact Button */}
              <Button asChild variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 hidden md:flex ml-1 sm:ml-2 touch-manipulation">
                <Link href="/contact">
                  <Phone className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span>যোগাযোগ</span>
                </Link>
              </Button>

              {/* Mobile Menu */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="lg:hidden p-1.5 sm:p-2 text-gray-700 hover:text-primary transition-colors touch-manipulation min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center"
                    data-testid="button-mobile-menu"
                  >
                    <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full max-w-sm">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between pb-4 border-b">
                      <h2 className="text-lg font-semibold text-primary">{COMPANY_NAME}</h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="h-auto p-1"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                    
                    {/* Mobile Navigation Items */}
                    <nav className="flex flex-col space-y-3 mt-6">
                      {navItems.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`text-left p-3 rounded-lg transition-colors ${
                            isActive(item.href)
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </nav>
                    
                    {/* Login/Register and Contact section in mobile menu */}
                    <div className="border-t pt-4 mt-6 space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                            লগইন
                          </Link>
                        </Button>
                        <Button asChild variant="default" size="sm">
                          <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                            রেজিস্টার
                          </Link>
                        </Button>
                      </div>
                      <Button asChild variant="outline" className="w-full">
                        <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)}>
                          <Phone className="mr-2 h-4 w-4" />
                          যোগাযোগ করুন
                        </Link>
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <PerfectCartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Mobile Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setIsSearchOpen(false)}>
          <div className="fixed top-0 left-0 right-0 bg-white p-4 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="পণ্য খুঁজুন..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  autoFocus
                />
              </div>
              <Button size="sm">
                খুঁজুন
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSearchOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Product Modal from Search */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          isOpen={isProductModalOpen}
          onClose={() => {
            setIsProductModalOpen(false);
            setSelectedProduct(null);
          }}
          onAddToCart={(product) => {
            console.log('Adding to cart:', product.name);
            setIsProductModalOpen(false);
            setSelectedProduct(null);
          }}
        />
      )}
    </>
  );
}