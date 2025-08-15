import { Route, Switch } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui";
import { TooltipProvider } from "@/components/ui";
import { useEffect, Suspense, lazy } from "react";
import { initGA, loadFacebookPixelFromSettings } from "./lib/analytics";
import { useAnalytics } from "./hooks/use-analytics";
import DebugInfo from "@/components/debug-info";
import ErrorBoundary from "@/components/error-boundary";
import MobileResponsiveEnhancement from './components/mobile-responsive-enhancement';
import UltraModernLayout from './components/ultra-modern-layout';
import { LoadingOverlay } from './components/EnhancedLoadingSkeleton';

// Dynamic imports for better code splitting and performance
const Home = lazy(() => import("./pages/ultra-modern-home"));
const Product = lazy(() => import("./pages/product-enhanced"));
const Products = lazy(() => import("./pages/ultra-modern-products"));
const Contact = lazy(() => import("./pages/contact"));
const OrderTracking = lazy(() => import("./pages/tracking"));
const Admin = lazy(() => import("./pages/admin"));
const Offers = lazy(() => import("./pages/offers"));
const Profile = lazy(() => import("./pages/profile"));
const Orders = lazy(() => import("./pages/orders"));
const CustomOrderForm = lazy(() => import("./components/CustomOrderForm"));
const About = lazy(() => import("./pages/about"));
const BlogPage = lazy(() => import("./pages/blog"));
const NotFound = lazy(() => import("./pages/not-found"));
const RefundPolicyDynamic = lazy(() => import("./pages/refund-policy-dynamic"));
const ReturnPolicy = lazy(() => import("./pages/return-policy"));
const TermsConditionsDynamic = lazy(() => import("./pages/terms-conditions-dynamic"));
const Terms = lazy(() => import("./pages/terms"));
const RefundPolicy = lazy(() => import("./pages/refund-policy"));
const PaymentPolicy = lazy(() => import("./pages/payment-policy"));
const SearchPage = lazy(() => import("./pages/search"));
const WishlistPage = lazy(() => import("./pages/wishlist"));
const CustomizeProduct = lazy(() => import("./pages/customize-product-enhanced"));

// Enhanced loading fallback component
const LoadingFallback = () => (
  <LoadingOverlay 
    message="ওয়েবসাইট লোড হচ্ছে..." 
    showSpinner={true}
  />
);

function Router() {
  // Track page views when routes change
  useAnalytics();

  return (
    <UltraModernLayout>
      <Suspense fallback={<LoadingFallback />}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/product/:id" component={Product} />
          <Route path="/product" component={Product} />
          <Route path="/products" component={Products} />
          <Route path="/wishlist" component={WishlistPage} />
          <Route path="/offers" component={Offers} />
          <Route path="/contact" component={Contact} />
          <Route path="/about" component={About} />
          <Route path="/blog" component={BlogPage} />
          <Route path="/admin" component={Admin} />
          <Route path="/tracking" component={OrderTracking} />
          <Route path="/track/:id" component={OrderTracking} />
          <Route path="/track" component={OrderTracking} />
          <Route path="/custom-order" component={CustomOrderForm} />
          <Route path="/customize" component={CustomizeProduct} />
          <Route path="/customize/:id" component={CustomizeProduct} />
          <Route path="/return-policy-old" component={ReturnPolicy} />
          <Route path="/terms-conditions-old" component={TermsConditionsDynamic} />
          <Route path="/terms-conditions" component={Terms} />
          <Route path="/terms" component={Terms} />
          <Route path="/refund-policy" component={RefundPolicy} />
          <Route path="/refund-replacement" component={RefundPolicy} />
          <Route path="/payment-policy" component={PaymentPolicy} />
          <Route path="/payment" component={PaymentPolicy} />
          <Route path="/search" component={SearchPage} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </UltraModernLayout>
  );
}

function App() {
  // Initialize analytics when app loads
  useEffect(() => {
    try {
      // Initialize Google Analytics
      if (import.meta.env.VITE_GA_MEASUREMENT_ID) {
        initGA();
      }

      // Initialize Facebook Pixel from site settings
      loadFacebookPixelFromSettings();
    } catch (error) {
      console.warn('Analytics initialization failed:', error);
    }
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <MobileResponsiveEnhancement />
          <div className="font-bengali">
            <Toaster />
            <Router />
            <DebugInfo />
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;