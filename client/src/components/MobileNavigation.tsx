import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  ShoppingBag,
  ShoppingCart,
  User,
  Search,
  Percent
} from "lucide-react";

const MobileNavigation = () => {
  const [location] = useLocation();
  const { items: cartItems } = useCart();
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const navigationItems = [
    {
      name: "হোম",
      href: "/",
      icon: Home,
      testId: "mobile-nav-home"
    },
    {
      name: "পণ্য",
      href: "/products",
      icon: ShoppingBag,
      testId: "mobile-nav-products"
    },
    {
      name: "খুঁজুন",
      href: "/search",
      icon: Search,
      testId: "mobile-nav-search"
    },
    {
      name: "কার্ট",
      href: "/cart",
      icon: ShoppingCart,
      badge: cartItemCount > 0 ? cartItemCount : null,
      testId: "mobile-nav-cart"
    },
    {
      name: "অফার",
      href: "/offers",
      icon: Percent,
      testId: "mobile-nav-offers"
    }
  ];

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-2xl"
    >
      <div className="container mx-auto">
        <div className="flex items-center justify-around py-2">
          {navigationItems.map((item) => {
            const isActive = location === item.href || 
              (item.href === '/products' && location.startsWith('/product'));
            
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  className="flex flex-col items-center justify-center p-2 min-w-[64px] relative"
                  whileTap={{ scale: 0.95 }}
                  data-testid={item.testId}
                >
                  <div className={`relative flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-primary text-white' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    <item.icon className="w-5 h-5" />
                    {item.badge && (
                      <Badge className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center text-xs bg-red-500 text-white border-2 border-white dark:border-gray-900">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                  <span className={`text-xs mt-1 font-medium transition-colors ${
                    isActive 
                      ? 'text-primary' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {item.name}
                  </span>
                  
                  {/* Active Indicator */}
                  {isActive && (
                    <motion.div
                      className="absolute -bottom-1 w-4 h-1 bg-primary rounded-full"
                      layoutId="mobileActiveTab"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default MobileNavigation;