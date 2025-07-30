import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Admin from "@/pages/admin";
import TrackingPage from "@/pages/tracking";
import NotFound from "@/pages/not-found";
import DebugInfo from "@/components/debug-info"; // Added DebugInfo component

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/admin" component={Admin} />
      <Route path="/tracking" component={TrackingPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="font-bengali">
          <Toaster />
          <Router />
          <DebugInfo /> {/* Added DebugInfo component to App */}
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;