
import React, { Suspense, ErrorBoundary } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "./hooks/useAuth";
import Header from "./components/header";
import Home from "./pages/home";
import Products from "./pages/products";
import Contact from "./pages/contact";
import Tracking from "./pages/tracking";
import Orders from "./pages/orders";
import Profile from "./pages/profile";
import Admin from "./pages/admin";
import Offers from "./pages/offers";
import TermsConditions from "./pages/terms-conditions";
import RefundPolicy from "./pages/refund-policy";
import ReturnPolicy from "./pages/return-policy";
import NotFound from "./pages/not-found";

// Error Boundary Component
class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error Boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              কিছু সমস্যা হয়েছে
            </h1>
            <p className="text-gray-600 mb-4">
              পেজ লোড করতে সমস্যা হচ্ছে। অনুগ্রহ করে পেজ রিফ্রেশ করুন।
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              পেজ রিফ্রেশ করুন
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading Component
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">লোড হচ্ছে...</p>
      </div>
    </div>
  );
}

function AppContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<LoadingSpinner />}>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/products" component={Products} />
            <Route path="/contact" component={Contact} />
            <Route path="/tracking" component={Tracking} />
            <Route path="/orders" component={Orders} />
            <Route path="/profile" component={Profile} />
            <Route path="/admin" component={Admin} />
            <Route path="/offers" component={Offers} />
            <Route path="/terms-conditions" component={TermsConditions} />
            <Route path="/refund-policy" component={RefundPolicy} />
            <Route path="/return-policy" component={ReturnPolicy} />
            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </main>
      <Toaster />
    </div>
  );
}

export default function App() {
  React.useEffect(() => {
    // Add viewport meta tag if not present
    if (!document.querySelector('meta[name="viewport"]')) {
      const viewport = document.createElement('meta');
      viewport.name = 'viewport';
      viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
      document.head.appendChild(viewport);
    }

    // Set up error handling for unhandled promises
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      event.preventDefault(); // Prevent the default browser error handling
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </AppErrorBoundary>
  );
}
