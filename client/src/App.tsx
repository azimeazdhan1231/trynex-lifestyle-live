import { useEffect } from "react";
import { Switch, Route } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Home from "@/pages/home";
import Products from "@/pages/products";
import Contact from "@/pages/contact";
import Tracking from "@/pages/tracking";
import Admin from "@/pages/admin";
import Profile from "@/pages/profile";
import Orders from "@/pages/orders";
import Offers from "@/pages/offers";
import NotFound from "@/pages/not-found";
import TermsConditions from "@/pages/terms-conditions";
import ReturnPolicy from "@/pages/return-policy"; 
import RefundPolicy from "@/pages/refund-policy";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  useEffect(() => {
    // Initialize categories on app startup
    fetch('/api/init-categories')
      .then(response => response.json())
      .then(data => console.log('Categories initialized:', data))
      .catch(error => console.error('Error initializing categories:', error));
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/products" component={Products} />
          <Route path="/contact" component={Contact} />
          <Route path="/tracking" component={Tracking} />
          <Route path="/admin" component={Admin} />
          <Route path="/profile" component={Profile} />
          <Route path="/orders" component={Orders} />
          <Route path="/offers" component={Offers} />
          <Route path="/terms-conditions" component={TermsConditions} />
          <Route path="/return-policy" component={ReturnPolicy} />
          <Route path="/refund-policy" component={RefundPolicy} />
          <Route component={NotFound} />
        </Switch>
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

export default App;