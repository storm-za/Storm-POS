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
import PosSignupSuccess from "@/pages/pos-signup-success";
import PosInactive from "@/pages/pos-inactive";
import PosPaymentOption from "@/pages/pos-payment-option";
import PosOnboarding from "@/pages/pos-onboarding";
import { HelpCenter } from "@/pages/HelpCenter";
import { HelpCenterAfrikaans } from "@/pages/HelpCenterAfrikaans";
import Blog from "@/pages/blog";
import BlogPost from "@/pages/blog-post";
import Contact from "@/pages/contact";
import Pricing from "@/pages/pricing";
import PrivacyPolicy from "@/pages/privacy-policy";
import Navigation from "@/components/navigation";
import { useEffect, lazy, Suspense } from "react";

const PosSystem = lazy(() => import("@/pages/pos-system"));
const PosSystemAfrikaans = lazy(() => import("@/pages/pos-system-afrikaans"));

function Router() {
  const [location, navigate] = useLocation();

  // When running as a bundled Tauri app, start directly at the POS login
  // instead of the marketing home page.
  useEffect(() => {
    const h = window.location.hostname;
    const isTauri =
      (window as any).__TAURI_INTERNALS__ ||
      (window as any).__TAURI__ ||
      window.location.protocol === "tauri:" ||
      window.location.protocol === "asset:" ||
      (h.endsWith(".localhost") && h !== "localhost");
    if (isTauri && location === "/") {
      navigate("/pos/login");
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/web-development" component={WebDevelopment} />
        <Route path="/contact" component={Contact} />
        <Route path="/pricing" component={Pricing} />
        <Route path="/blog" component={Blog} />
        <Route path="/blog/:slug" component={BlogPost} />
        <Route path="/pos" component={POS} />
        <Route path="/pos/login" component={PosLogin} />
        <Route path="/pos/signup" component={PosSignup} />
        <Route path="/pos/signup/success" component={PosSignupSuccess} />
        <Route path="/pos/payment-option" component={PosPaymentOption} />
        <Route path="/pos/onboarding" component={PosOnboarding} />
        <Route path="/pos/system">
          {() => (
            <Suspense fallback={<div className="flex items-center justify-center h-screen bg-gray-950 text-white">Loading...</div>}>
              <PosSystem />
            </Suspense>
          )}
        </Route>
        <Route path="/pos/system/afrikaans">
          {() => (
            <Suspense fallback={<div className="flex items-center justify-center h-screen bg-gray-950 text-white">Loading...</div>}>
              <PosSystemAfrikaans />
            </Suspense>
          )}
        </Route>
        <Route path="/pos/inactive" component={PosInactive} />
        <Route path="/pos/help" component={HelpCenter} />
        <Route path="/pos/help/afrikaans" component={HelpCenterAfrikaans} />
        <Route path="/privacy" component={PrivacyPolicy} />
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
