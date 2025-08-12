import { Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, Suspense, lazy } from "react";
import { initGA, loadFacebookPixelFromSettings } from "./lib/analytics";
import { useAnalytics } from "./hooks/use-analytics";
import DebugInfo from "@/components/debug-info";
import ErrorBoundary from "@/components/error-boundary";
// import { PerformanceOptimizer } from './components/PerformanceOptimizer';
import { UltraPerformanceLoader } from './components/ultra-performance-loader';

// Dynamic imports for better code splitting
const Home = lazy(() => import("./pages/home-professional-ecommerce"));
const Product = lazy(() => import("./pages/product-enhanced"));
const Products = lazy(() => import("./pages/products"));
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
const Categories = lazy(() => import("./pages/categories"));
const CustomizeProduct = lazy(() => import("./pages/customize-product-enhanced"));

// Performance and Mobile Optimization Components
// const PerformanceOptimizer = lazy(() => import("./components/PerformanceOptimizer"));

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600">লোড হচ্ছে...</p>
    </div>
  </div>
);

function Router() {
  // Track page views when routes change
  useAnalytics();

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/product/:id" component={Product} />
        <Route path="/product" component={Product} />
        <Route path="/products" component={Products} />
        <Route path="/offers" component={Offers} />
        <Route path="/contact" component={Contact} />
        <Route path="/about" component={About} />
        <Route path="/blog" component={BlogPage} />
        <Route path="/admin" component={Admin} />
        <Route path="/tracking" component={OrderTracking} />

        <Route path="/custom-order" component={CustomOrderForm} />
        <Route path="/return-policy-old" component={ReturnPolicy} />
        <Route path="/terms-conditions-old" component={TermsConditionsDynamic} />
        <Route path="/terms-conditions" component={Terms} />
        <Route path="/terms" component={Terms} />
        <Route path="/refund-policy" component={RefundPolicy} />
        <Route path="/refund-replacement" component={RefundPolicy} />
        <Route path="/payment-policy" component={PaymentPolicy} />
        <Route path="/payment" component={PaymentPolicy} />
        <Route path="/search" component={SearchPage} />
        <Route path="/categories" component={Categories} />
        <Route path="/customize/:id" component={CustomizeProduct} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
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
          <div className="font-bengali">
            <Suspense fallback={null}>
              {/* <PerformanceOptimizer /> */}
            </Suspense>
            {/* <UltraPerformanceLoader /> */}
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