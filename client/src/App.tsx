import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Pages
import NotFound from "@/pages/not-found";
import AdminLogin from "@/pages/admin-login";
import AdminDashboard from "@/pages/admin-dashboard";
import ClientPortal from "@/pages/client-portal";
import ClientHistory from "@/pages/client-history";

function Router() {
  return (
    <Switch>
      {/* Root redirects to admin login - regular users will use direct custom links */}
      <Route path="/">
        <Redirect to="/admin-login" />
      </Route>
      
      {/* Admin Routes */}
      <Route path="/admin-login" component={AdminLogin} />
      <Route path="/admin" component={AdminDashboard} />

      {/* Client Routes */}
      <Route path="/u/:id" component={ClientPortal} />
      <Route path="/u/:id/history" component={ClientHistory} />

      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
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
