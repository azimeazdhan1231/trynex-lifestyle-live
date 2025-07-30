import { Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Home from "./pages/home";
import Products from "./pages/products";
import Offers from "./pages/offers";
import Contact from "./pages/contact";
import Admin from "./pages/admin";
import Tracking from "./pages/tracking";
import NotFound from "./pages/not-found";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { initGA, initFacebookPixel } from "./lib/analytics";
import { useAnalytics } from "./hooks/use-analytics";
import DebugInfo from "./components/debug-info";

function Router() {
  // Track page views when routes change
  useAnalytics();

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/products" component={Products} />
      <Route path="/offers" component={Offers} />
      <Route path="/contact" component={Contact} />
      <Route path="/admin" component={Admin} />
      <Route path="/tracking" component={Tracking} />
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

    // Initialize Facebook Pixel
    if (import.meta.env.VITE_FB_PIXEL_ID) {
      initFacebookPixel(import.meta.env.VITE_FB_PIXEL_ID);
    }
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