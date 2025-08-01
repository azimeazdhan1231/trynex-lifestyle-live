import { Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, Suspense, lazy } from "react";
import { initGA, loadFacebookPixelFromSettings } from "./lib/analytics";
import { useAnalytics } from "./hooks/use-analytics";
import DebugInfo from "@/components/debug-info";

// Dynamic imports for better code splitting
const Home = lazy(() => import("./pages/home"));
const Products = lazy(() => import("./pages/products"));
const Contact = lazy(() => import("./pages/contact"));
const Tracking = lazy(() => import("./pages/tracking"));
const Admin = lazy(() => import("./pages/admin"));
const Offers = lazy(() => import("./pages/offers"));
const Profile = lazy(() => import("./pages/profile"));
const Orders = lazy(() => import("./pages/orders"));
const Auth = lazy(() => import("./pages/auth"));
const PhoneAuth = lazy(() => import("./components/PhoneAuth"));
const CustomOrderForm = lazy(() => import("./components/CustomOrderForm"));
const About = lazy(() => import("./pages/about"));
const BlogPage = lazy(() => import("./pages/blog"));
const NotFound = lazy(() => import("./pages/not-found"));
const RefundPolicyDynamic = lazy(() => import("./pages/refund-policy-dynamic"));
const ReturnPolicy = lazy(() => import("./pages/return-policy"));
const TermsConditionsDynamic = lazy(() => import("./pages/terms-conditions-dynamic"));

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
        <Route path="/products" component={Products} />
        <Route path="/offers" component={Offers} />
        <Route path="/contact" component={Contact} />
        <Route path="/about" component={About} />
        <Route path="/blog" component={BlogPage} />
        <Route path="/admin" component={Admin} />
        <Route path="/tracking" component={Tracking} />
        <Route path="/profile" component={Profile} />
        <Route path="/orders" component={Orders} />
        <Route path="/auth" component={PhoneAuth} />
        <Route path="/login" component={PhoneAuth} />
        <Route path="/signup" component={PhoneAuth} />
        <Route path="/custom-order" component={CustomOrderForm} />
        <Route path="/auth-old" component={Auth} />
        <Route path="/refund-policy" component={RefundPolicyDynamic} />
        <Route path="/return-policy" component={ReturnPolicy} />
        <Route path="/terms-conditions" component={TermsConditionsDynamic} />
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
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="font-bengali">
          <Toaster />
          <Router />
          <DebugInfo />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;