import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import WebDevelopment from "@/pages/web-development";
import POS from "@/pages/pos";
import PosLogin from "@/pages/pos-login";
import PosSignup from "@/pages/pos-signup";
import PosSystem from "@/pages/pos-system";
import PosInactive from "@/pages/pos-inactive";
import Navigation from "@/components/navigation";
import { useEffect } from "react";

function Router() {
  const [location] = useLocation();
  
  useEffect(() => {
    // Scroll to top when location changes
    window.scrollTo(0, 0);
  }, [location]);

  // Check if we're in POS routes to conditionally show navigation
  const isPosRoute = location.startsWith('/pos');

  return (
    <>
      {!isPosRoute && <Navigation />}
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/web-development" component={WebDevelopment} />
        <Route path="/pos" component={POS} />
        <Route path="/pos/login" component={PosLogin} />
        <Route path="/pos/signup" component={PosSignup} />
        <Route path="/pos/system" component={PosSystem} />
        <Route path="/pos/inactive" component={PosInactive} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
