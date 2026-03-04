import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { Navigation } from "@/components/Navigation";
import { Loader2 } from "lucide-react";
import { apiUrl } from "@/lib/api";

import Dashboard from "@/pages/Dashboard";
import Landing from "@/pages/Landing";
import ExtensionGuide from "@/pages/ExtensionGuide";
import Pricing from "@/pages/pricing";
import AccountSettings from "@/pages/AccountSettings";
import NotFound from "@/pages/not-found";

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}

function AuthRedirect({ to }: { to: string }) {
  window.location.href = apiUrl(to);
  return <LoadingSpinner />;
}

function AppContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      {user && <Navigation />}
      <Switch>
        {/* Auth redirects - send to backend */}
        <Route path="/login">
          <AuthRedirect to="/api/login" />
        </Route>
        <Route path="/api/callback">
          <AuthRedirect to="/api/callback" />
        </Route>

        <Route path="/extension">
          {user ? <ExtensionGuide /> : <Landing />}
        </Route>
        
        <Route path="/pricing">
          <Pricing />
        </Route>
        
        <Route path="/settings">
          {user ? <AccountSettings /> : <Landing />}
        </Route>
        
        <Route path="/dashboard">
          {user ? <Dashboard /> : <Landing />}
        </Route>
        
        <Route path="/">
          {user ? <Dashboard /> : <Landing />}
        </Route>

        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <I18nProvider>
          <AppContent />
          <Toaster />
        </I18nProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
