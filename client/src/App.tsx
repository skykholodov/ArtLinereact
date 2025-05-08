import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import { ProtectedRoute } from "./lib/protected-route";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminServices from "@/pages/admin/services";
import AdminPortfolio from "@/pages/admin/portfolio";
import AdminAbout from "@/pages/admin/about";
import AdminTestimonials from "@/pages/admin/testimonials";
import AdminContacts from "@/pages/admin/contacts";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/admin" component={AdminDashboard} />
      <ProtectedRoute path="/admin/services" component={AdminServices} />
      <ProtectedRoute path="/admin/portfolio" component={AdminPortfolio} />
      <ProtectedRoute path="/admin/about" component={AdminAbout} />
      <ProtectedRoute path="/admin/testimonials" component={AdminTestimonials} />
      <ProtectedRoute path="/admin/contacts" component={AdminContacts} />
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
