import { Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Suspense, lazy, useEffect } from "react";
import ErrorBoundary from "@/components/error-boundary";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useAnalytics } from "./hooks/use-analytics";
import { initGA, loadFacebookPixelFromSettings } from "./lib/analytics";
import PremiumLiveTracking from "./pages/premium-live-tracking";

// Lazy load all pages for better performance
const HomePage = lazy(() => import("./pages/HomePage"));
const ProductsPage = lazy(() => import("./pages/ProductsPage"));
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const UserProfilePage = lazy(() => import("./pages/UserProfilePage"));
const OrderTrackingPage = lazy(() => import("./pages/OrderTrackingPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const OffersPage = lazy(() => import("./pages/OffersPage"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const WishlistPage = lazy(() => import("./pages/WishlistPage"));
const CustomOrderPage = lazy(() => import("./pages/CustomOrderPage"));
const NewCustomizePage = lazy(() => import("./pages/NewCustomizePage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const AdminPage = lazy(() => import("./pages/admin"));
const PolicyPage = lazy(() => import("./pages/PolicyPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

const Router = () => {
  // Track page views when routes change
  useAnalytics();

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/products" component={ProductsPage} />
        <Route path="/products/:category" component={ProductsPage} />
        <Route path="/product/:id" component={ProductDetailPage} />
        <Route path="/cart" component={CartPage} />
        <Route path="/checkout" component={CheckoutPage} />
        <Route path="/profile" component={UserProfilePage} />
        <Route path="/orders" element={<OrderTrackingPage />} />
        <Route path="/tracking" element={<PremiumLiveTracking />} />
        <Route path="/tracking/:trackingId" element={<PremiumLiveTracking />} />
        <Route path="/contact" component={ContactPage} />
        <Route path="/about" component={AboutPage} />
        <Route path="/offers" component={OffersPage} />
        <Route path="/blog" component={BlogPage} />
        <Route path="/blog/:slug" component={BlogPage} />
        <Route path="/search" component={SearchPage} />
        <Route path="/wishlist" component={WishlistPage} />
        <Route path="/customize/:id" component={NewCustomizePage} />
        <Route path="/customize" component={NewCustomizePage} />
        <Route path="/custom-order" component={NewCustomizePage} />
        <Route path="/custom" component={NewCustomizePage} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/login" component={AuthPage} />
        <Route path="/register" component={AuthPage} />
        <Route path="/admin" component={AdminPage} />
        <Route path="/privacy" component={PolicyPage} />
        <Route path="/terms" component={PolicyPage} />
        <Route path="/terms-conditions" component={PolicyPage} />
        <Route path="/refund" component={PolicyPage} />
        <Route path="/refund-policy" component={PolicyPage} />
        <Route path="/refund-replacement" component={PolicyPage} />
        <Route path="/return" component={PolicyPage} />
        <Route path="/return-policy" component={PolicyPage} />
        <Route path="/payment-policy" component={PolicyPage} />
        <Route path="/payment" component={PolicyPage} />
        <Route component={NotFoundPage} />
      </Switch>
    </Suspense>
  );
};

const App = () => {
  // Initialize analytics when app loads
  useEffect(() => {
    // Initialize Google Analytics
    if (import.meta.env.VITE_GA_MEASUREMENT_ID) {
      initGA();
    }

    // Initialize Facebook Pixel from site settings
    loadFacebookPixelFromSettings();
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="font-bengali min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <Router />
            <Toaster />
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;