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
import { LoadingOverlay } from './components/EnhancedLoadingSkeleton';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/PerfectHomePage'));
const Products = lazy(() => import('./pages/products'));
const Product = lazy(() => import('./pages/product'));
const About = lazy(() => import('./pages/about'));
const Contact = lazy(() => import('./pages/contact'));
const Cart = lazy(() => import('./pages/cart'));
const Checkout = lazy(() => import('./pages/checkout'));
const Orders = lazy(() => import('./pages/orders'));
const Profile = lazy(() => import('./pages/profile'));
const Auth = lazy(() => import('./pages/auth'));
const Admin = lazy(() => import('./pages/admin'));
const NotFound = lazy(() => import('./pages/not-found'));

// Analytics initialization
try {
  initGA();
  loadFacebookPixelFromSettings();
} catch (error) {
  console.warn('Analytics initialization failed:', error);
}

function AppContent() {
  const { trackPageView } = useAnalytics();

  useEffect(() => {
    trackPageView(window.location.pathname);
  }, [trackPageView]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <Suspense fallback={<LoadingOverlay />}>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/products" component={Products} />
            <Route path="/product/:id" component={Product} />
            <Route path="/about" component={About} />
            <Route path="/contact" component={Contact} />
            <Route path="/cart" component={Cart} />
            <Route path="/checkout" component={Checkout} />
            <Route path="/orders" component={Orders} />
            <Route path="/profile" component={Profile} />
            <Route path="/auth" component={Auth} />
            <Route path="/admin" component={Admin} />
            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </div>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppContent />
        <Toaster />
        {process.env.NODE_ENV === 'development' && <DebugInfo />}
      </TooltipProvider>
    </QueryClientProvider>
  );
}