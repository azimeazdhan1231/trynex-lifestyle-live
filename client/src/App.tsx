import { Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Home from "./pages/home";
import Products from "./pages/products";
import Contact from "./pages/contact";
import Tracking from "./pages/tracking";
import Admin from "./pages/admin";
import Offers from "./pages/offers";
import Profile from "./pages/profile";
import Orders from "./pages/orders";
import Auth from "./pages/auth";
import PhoneAuth from "./components/PhoneAuth";
import CustomOrderForm from "./components/CustomOrderForm";
import About from "./pages/about";
import BlogPage from "./pages/blog";
import NotFound from "./pages/not-found";
import RefundPolicy from "./pages/refund-policy";
import RefundPolicyDynamic from "./pages/refund-policy-dynamic";
import ReturnPolicy from "./pages/return-policy";
import TermsConditions from "./pages/terms-conditions";
import TermsConditionsDynamic from "./pages/terms-conditions-dynamic";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { initGA, loadFacebookPixelFromSettings } from "./lib/analytics";
import { useAnalytics } from "./hooks/use-analytics";
import DebugInfo from "@/components/debug-info";
import PerformanceMonitor from "@/components/PerformanceMonitor";

function Router() {
  // Track page views when routes change
  useAnalytics();

  return (
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
          <PerformanceMonitor />
          <DebugInfo />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;