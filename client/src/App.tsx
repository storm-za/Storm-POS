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
import PosSystemAfrikaans from "@/pages/pos-system-afrikaans";
import PosInactive from "@/pages/pos-inactive";
import { HelpCenter } from "@/pages/HelpCenter";
import { HelpCenterAfrikaans } from "@/pages/HelpCenterAfrikaans";
import Blog from "@/pages/blog";
import BlogPost from "@/pages/blog-post";
import Contact from "@/pages/contact";
import Navigation from "@/components/navigation";
import { useEffect } from "react";

function Router() {
  const [location] = useLocation();
  
  useEffect(() => {
    // Scroll to top when location changes
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/web-development" component={WebDevelopment} />
        <Route path="/contact" component={Contact} />
        <Route path="/blog" component={Blog} />
        <Route path="/blog/:slug" component={BlogPost} />
        <Route path="/pos" component={POS} />
        <Route path="/pos/login" component={PosLogin} />
        <Route path="/pos/signup" component={PosSignup} />
        <Route path="/pos/system" component={PosSystem} />
        <Route path="/pos/system/afrikaans" component={PosSystemAfrikaans} />
        <Route path="/pos/inactive" component={PosInactive} />
        <Route path="/pos/help" component={HelpCenter} />
        <Route path="/pos/help/afrikaans" component={HelpCenterAfrikaans} />
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
